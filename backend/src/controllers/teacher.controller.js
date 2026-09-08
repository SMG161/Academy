const Course = require('../models/Course.model');
const Lecture = require('../models/Lecture.model');
const Student = require('../models/Student.model');
const { getPagination, buildPagination } = require('../utils/pagination');
const { escapeRegex } = require('../utils/regex');
const { withThumbnailUrl } = require('../utils/cdn');
const {
  computeInitialNotifiedMilestones,
  notifyAccessGranted,
} = require('../utils/notifications');

function parseFutureDate(value, now = new Date()) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime()) || date <= now) return null;
  return date;
}

// Paginated, searchable list of the signed-in teacher's own courses.
exports.getMyCourses = async (req, res) => {
  try {
    const { page, limit, skip } = getPagination(req, { defaultLimit: 10, maxLimit: 50 });
    const search = (req.query.search || '').trim();

    const filter = { teacher: req.user.userId };
    if (search) {
      filter.name = { $regex: escapeRegex(search), $options: 'i' };
    }

    const [courses, total] = await Promise.all([
      Course.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .select('name price description lectures createdAt'),
      Course.countDocuments(filter),
    ]);

    const items = courses.map((course) => ({
      _id: course._id,
      name: course.name,
      price: course.price,
      description: course.description,
      numLectures: course.lectures.length,
      createdAt: course.createdAt,
    }));

    res.json({ items, pagination: buildPagination({ page, limit, total }) });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Paginated list of the signed-in teacher's own lectures, across all their courses.
exports.getMyLectures = async (req, res) => {
  try {
    const { page, limit, skip } = getPagination(req, { defaultLimit: 27, maxLimit: 27 });

    const filter = { teacher: req.user.userId };

    const [lectures, total] = await Promise.all([
      Lecture.find(filter)
        .select('-videoPath')
        .populate('course', 'name')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Lecture.countDocuments(filter),
    ]);

    const items = lectures.map((lecture) => withThumbnailUrl(lecture.toObject()));

    res.json({ items, pagination: buildPagination({ page, limit, total }) });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ---- Students management ----

// Paginated list of students who hold any grant (active or expired) against a
// course/lecture owned by this teacher.
exports.getMyStudents = async (req, res) => {
  try {
    const teacherId = req.user.userId;
    const { page, limit, skip } = getPagination(req, { defaultLimit: 25, maxLimit: 100 });

    const [courseIds, lectureIds] = await Promise.all([
      Course.find({ teacher: teacherId }).distinct('_id'),
      Lecture.find({ teacher: teacherId }).distinct('_id'),
    ]);

    const filter = {
      $or: [
        { 'courses.course': { $in: courseIds } },
        { 'lectures.lecture': { $in: lectureIds } },
      ],
    };

    const [students, total] = await Promise.all([
      Student.find(filter).select('name email createdAt').sort({ createdAt: -1 }).skip(skip).limit(limit),
      Student.countDocuments(filter),
    ]);

    res.json({ items: students, pagination: buildPagination({ page, limit, total }) });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Looks up a student by their exact email — used to find someone to grant
// access to for the first time, not limited to students already tied to
// this teacher. Requires an exact (case-insensitive) match rather than a
// partial/substring search, so a teacher can't browse or enumerate the
// student roster — they have to already know the account's real email.
exports.searchStudents = async (req, res) => {
  try {
    const { page, limit, skip } = getPagination(req, { defaultLimit: 10, maxLimit: 25 });
    const email = (req.query.email || '').trim().toLowerCase();

    if (!email) {
      return res.json({ items: [], pagination: buildPagination({ page, limit, total: 0 }) });
    }

    const filter = { role: 'student', email };

    const [students, total] = await Promise.all([
      Student.find(filter).select('name email createdAt').sort({ email: 1 }).skip(skip).limit(limit),
      Student.countDocuments(filter),
    ]);

    res.json({ items: students, pagination: buildPagination({ page, limit, total }) });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// This teacher's own view of one student: only courses/lectures this teacher
// owns are ever included, each with the grant's expiry.
exports.getStudentDetail = async (req, res) => {
  try {
    const teacherId = req.user.userId;
    const student = await Student.findById(req.params.studentId)
      .populate({ path: 'courses.course', select: 'name price teacher', match: { teacher: teacherId } })
      .populate({
        path: 'lectures.lecture',
        select: 'name price teacher course',
        match: { teacher: teacherId },
        populate: { path: 'course', select: 'name' },
      });

    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    const now = new Date();

    const courses = student.courses
      .filter((entry) => entry.course && entry.expiresAt > now)
      .map((entry) => ({ grantId: entry._id, course: entry.course, expiresAt: entry.expiresAt }));

    const lectures = student.lectures
      .filter((entry) => entry.lecture && entry.expiresAt > now)
      .map((entry) => ({ grantId: entry._id, lecture: entry.lecture, expiresAt: entry.expiresAt }));

    res.json({
      student: { _id: student._id, name: student.name, email: student.email },
      courses,
      lectures,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Courses this teacher owns that the student does not currently have active access to.
exports.getAvailableCourses = async (req, res) => {
  try {
    const teacherId = req.user.userId;
    const { page, limit, skip } = getPagination(req, { defaultLimit: 10, maxLimit: 50 });
    const search = (req.query.search || '').trim();

    const student = await Student.findById(req.params.studentId).select('courses');
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    const now = new Date();
    const activeCourseIds = student.courses.filter((c) => c.expiresAt > now).map((c) => c.course);

    const filter = { teacher: teacherId, _id: { $nin: activeCourseIds } };
    if (search) filter.name = { $regex: escapeRegex(search), $options: 'i' };

    const [courses, total] = await Promise.all([
      Course.find(filter).select('name price').sort({ createdAt: -1 }).skip(skip).limit(limit),
      Course.countDocuments(filter),
    ]);

    res.json({ items: courses, pagination: buildPagination({ page, limit, total }) });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Lectures this teacher owns that the student doesn't have access to — either
// individually, or by way of already having active access to the parent course.
exports.getAvailableLectures = async (req, res) => {
  try {
    const teacherId = req.user.userId;
    const { page, limit, skip } = getPagination(req, { defaultLimit: 10, maxLimit: 50 });
    const search = (req.query.search || '').trim();

    const student = await Student.findById(req.params.studentId).select('courses lectures');
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    const now = new Date();
    const activeCourseIds = student.courses.filter((c) => c.expiresAt > now).map((c) => c.course);
    const activeLectureIds = student.lectures.filter((l) => l.expiresAt > now).map((l) => l.lecture);

    const filter = {
      teacher: teacherId,
      _id: { $nin: activeLectureIds },
      course: { $nin: activeCourseIds },
    };
    if (search) filter.name = { $regex: escapeRegex(search), $options: 'i' };

    const [lectures, total] = await Promise.all([
      Lecture.find(filter)
        .select('name price course')
        .populate('course', 'name')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Lecture.countDocuments(filter),
    ]);

    res.json({ items: lectures, pagination: buildPagination({ page, limit, total }) });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Grants (or renews, if a stale entry already exists) this student's access to
// one of this teacher's courses.
exports.grantCourseAccess = async (req, res) => {
  try {
    const now = new Date();
    const teacherId = req.user.userId;
    const { courseId, expiresAt } = req.body;

    if (!courseId || !expiresAt) {
      return res.status(400).json({ message: 'courseId and expiresAt are required' });
    }

    const expiryDate = parseFutureDate(expiresAt, now);
    if (!expiryDate) {
      return res.status(400).json({ message: 'expiresAt must be a valid future date' });
    }

    const course = await Course.findById(courseId).select('name teacher');
    if (!course) return res.status(404).json({ message: 'Course not found' });
    if (!course.teacher || course.teacher.toString() !== teacherId) {
      return res.status(403).json({ message: 'You do not own this course' });
    }

    const student = await Student.findById(req.params.studentId);
    if (!student) return res.status(404).json({ message: 'Student not found' });

    const notifiedMilestones = computeInitialNotifiedMilestones(expiryDate, now);

    const existing = student.courses.find((c) => c.course.toString() === courseId);
    if (existing) {
      existing.expiresAt = expiryDate;
      existing.grantedBy = teacherId;
      existing.notifiedMilestones = notifiedMilestones;
    } else {
      student.courses.push({
        course: courseId,
        expiresAt: expiryDate,
        grantedBy: teacherId,
        notifiedMilestones,
      });
    }

    await student.save();

    await notifyAccessGranted({
      studentId: student._id,
      courseId: course._id,
      courseName: course.name,
      expiresAt: expiryDate,
    });

    res.status(200).json({ message: 'Course access granted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Grants (or renews) this student's access to one of this teacher's lectures.
exports.grantLectureAccess = async (req, res) => {
  try {
    const teacherId = req.user.userId;
    const { lectureId, expiresAt } = req.body;

    if (!lectureId || !expiresAt) {
      return res.status(400).json({ message: 'lectureId and expiresAt are required' });
    }

    const expiryDate = parseFutureDate(expiresAt);
    if (!expiryDate) {
      return res.status(400).json({ message: 'expiresAt must be a valid future date' });
    }

    const lecture = await Lecture.findById(lectureId).select('teacher');
    if (!lecture) return res.status(404).json({ message: 'Lecture not found' });
    if (!lecture.teacher || lecture.teacher.toString() !== teacherId) {
      return res.status(403).json({ message: 'You do not own this lecture' });
    }

    const student = await Student.findById(req.params.studentId);
    if (!student) return res.status(404).json({ message: 'Student not found' });

    const existing = student.lectures.find((l) => l.lecture.toString() === lectureId);
    if (existing) {
      existing.expiresAt = expiryDate;
      existing.grantedBy = teacherId;
    } else {
      student.lectures.push({ lecture: lectureId, expiresAt: expiryDate, grantedBy: teacherId });
    }

    await student.save();
    res.status(200).json({ message: 'Lecture access granted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Locates a course-grant subdocument by id and confirms the referenced course
// actually belongs to this teacher before allowing edit/delete.
async function findOwnedCourseGrant(studentId, grantId, teacherId) {
  const student = await Student.findById(studentId);
  if (!student) return { error: 404, message: 'Student not found' };

  const entry = student.courses.id(grantId);
  if (!entry) return { error: 404, message: 'Grant not found' };

  const course = await Course.findById(entry.course).select('teacher');
  if (!course || !course.teacher || course.teacher.toString() !== teacherId) {
    return { error: 403, message: 'You do not own this course' };
  }

  return { student, entry };
}

async function findOwnedLectureGrant(studentId, grantId, teacherId) {
  const student = await Student.findById(studentId);
  if (!student) return { error: 404, message: 'Student not found' };

  const entry = student.lectures.id(grantId);
  if (!entry) return { error: 404, message: 'Grant not found' };

  const lecture = await Lecture.findById(entry.lecture).select('teacher');
  if (!lecture || !lecture.teacher || lecture.teacher.toString() !== teacherId) {
    return { error: 403, message: 'You do not own this lecture' };
  }

  return { student, entry };
}

exports.updateCourseGrant = async (req, res) => {
  try {
    const now = new Date();
    const expiryDate = parseFutureDate(req.body.expiresAt, now);
    if (!expiryDate) {
      return res.status(400).json({ message: 'expiresAt must be a valid future date' });
    }

    const result = await findOwnedCourseGrant(req.params.studentId, req.params.grantId, req.user.userId);
    if (result.error) return res.status(result.error).json({ message: result.message });

    result.entry.expiresAt = expiryDate;
    result.entry.notifiedMilestones = computeInitialNotifiedMilestones(expiryDate, now);
    await result.student.save();
    res.json({ message: 'Expiry updated' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteCourseGrant = async (req, res) => {
  try {
    const result = await findOwnedCourseGrant(req.params.studentId, req.params.grantId, req.user.userId);
    if (result.error) return res.status(result.error).json({ message: result.message });

    result.entry.deleteOne();
    await result.student.save();
    res.json({ message: 'Access revoked' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateLectureGrant = async (req, res) => {
  try {
    const expiryDate = parseFutureDate(req.body.expiresAt);
    if (!expiryDate) {
      return res.status(400).json({ message: 'expiresAt must be a valid future date' });
    }

    const result = await findOwnedLectureGrant(req.params.studentId, req.params.grantId, req.user.userId);
    if (result.error) return res.status(result.error).json({ message: result.message });

    result.entry.expiresAt = expiryDate;
    await result.student.save();
    res.json({ message: 'Expiry updated' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteLectureGrant = async (req, res) => {
  try {
    const result = await findOwnedLectureGrant(req.params.studentId, req.params.grantId, req.user.userId);
    if (result.error) return res.status(result.error).json({ message: result.message });

    result.entry.deleteOne();
    await result.student.save();
    res.json({ message: 'Access revoked' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
