const Course = require('../models/Course.model');
const Student = require('../models/Student.model');
const Teacher = require('../models/Teacher.model');
const { getPagination, buildPagination } = require('../utils/pagination');
const { withThumbnailUrl } = require('../utils/cdn');
const { escapeRegex } = require('../utils/regex');
const { GRADE_OPTIONS } = require('../utils/grades');

function sanitizeCourse(course) {
  return withThumbnailUrl(course.toObject());
}

function getGradeError(grade) {
  if (grade === undefined || grade === null || grade === '') return null;
  return GRADE_OPTIONS.includes(grade) ? null : `Invalid grade. Must be one of: ${GRADE_OPTIONS.join(', ')}`;
}

// Create course
exports.createCourse = async (req, res) => {
  try {
    const { name, price, description, thumbnailPath, subject, grade } = req.body;

    if (!name || price === undefined) {
      return res.status(400).json({ message: 'Name and price are required' });
    }

    const gradeError = getGradeError(grade);
    if (gradeError) {
      return res.status(400).json({ message: gradeError });
    }

    // thumbnailPath must come from this teacher's own presigned upload namespace.
    if (thumbnailPath && req.user.role !== 'admin' && !thumbnailPath.startsWith(`thumbnails/${req.user.userId}/`)) {
      return res.status(403).json({ message: 'Invalid thumbnailPath' });
    }

    const course = await Course.create({
      name,
      price,
      description: description || '',
      subject: (subject || '').trim(),
      grade: grade || 'None',
      teacher: req.user.userId,
      thumbnailPath: thumbnailPath || null,
    });

    res.status(201).json(sanitizeCourse(course));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update course
exports.updateCourse = async (req, res) => {
  try {
    const { name, price, description, thumbnailPath, subject, grade } = req.body;

    if (!name || price === undefined) {
      return res.status(400).json({ message: 'Name and price are required' });
    }

    const gradeError = getGradeError(grade);
    if (gradeError) {
      return res.status(400).json({ message: gradeError });
    }

    const course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    const isOwner = course.teacher && course.teacher.toString() === req.user.userId;
    if (!isOwner && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'You do not have permission to edit this course' });
    }

    // thumbnailPath must come from this teacher's own presigned upload namespace.
    if (thumbnailPath && req.user.role !== 'admin' && !thumbnailPath.startsWith(`thumbnails/${req.user.userId}/`)) {
      return res.status(403).json({ message: 'Invalid thumbnailPath' });
    }

    course.name = name;
    course.price = price;
    course.description = description || '';
    course.subject = (subject || '').trim();
    course.grade = grade || 'None';
    if (thumbnailPath) {
      course.thumbnailPath = thumbnailPath;
    }

    await course.save();

    res.json(sanitizeCourse(course));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all courses (paginated, with optional search/teacher/subject/grade filters)
exports.getAllCourses = async (req, res) => {
  try {
    const { page, limit, skip } = getPagination(req, { defaultLimit: 27, maxLimit: 27 });
    const search = (req.query.search || '').trim();
    const { teacher, subject, grade } = req.query;

    const filter = {};
    if (search) filter.name = { $regex: escapeRegex(search), $options: 'i' };
    if (teacher) filter.teacher = teacher;
    if (subject) filter.subject = subject;
    if (grade) filter.grade = grade;

    const [courses, total] = await Promise.all([
      Course.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('lectures', 'name price')
        .populate('teacher', 'name'),
      Course.countDocuments(filter),
    ]);

    res.json({ items: courses.map(sanitizeCourse), pagination: buildPagination({ page, limit, total }) });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Available filter options for Browse Courses: every subject currently in
// use, every teacher with at least one course, and the fixed grade list.
exports.getCourseFilters = async (req, res) => {
  try {
    const [subjects, teacherIds] = await Promise.all([
      Course.distinct('subject', { subject: { $ne: '' } }),
      Course.distinct('teacher', { teacher: { $ne: null } }),
    ]);

    const teachers = await Teacher.find({ _id: { $in: teacherIds } }).select('name').sort({ name: 1 });

    res.json({
      subjects: subjects.sort((a, b) => a.localeCompare(b)),
      teachers: teachers.map((t) => ({ _id: t._id, name: t.name })),
      grades: GRADE_OPTIONS,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get course by ID
exports.getCourseById = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id)
      .populate('lectures', 'name price')
      .populate('teacher', 'name');

    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    res.json(sanitizeCourse(course));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Whether the signed-in student is enrolled in the course, and which of the
// course's lectures they've bought individually (only relevant if not enrolled).
exports.getCourseAccess = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id).select('lectures');

    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    const student = await Student.findById(req.user.userId).select('courses lectures');

    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    const now = new Date();
    const courseEntry = student.courses.find(
      (c) => c.course.toString() === course._id.toString() && c.expiresAt > now
    );
    const isEnrolledInCourse = Boolean(courseEntry);

    const courseLectureIds = new Set(course.lectures.map((l) => l.toString()));
    const purchasedLectureIds = isEnrolledInCourse
      ? course.lectures.map((l) => l.toString())
      : student.lectures
          .filter((l) => l.expiresAt > now)
          .map((l) => l.lecture.toString())
          .filter((l) => courseLectureIds.has(l));

    res.json({
      isEnrolledInCourse,
      purchasedLectureIds,
      courseExpiresAt: courseEntry ? courseEntry.expiresAt : null,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete course
exports.deleteCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    const isOwner = course.teacher && course.teacher.toString() === req.user.userId;
    if (!isOwner && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'You do not have permission to delete this course' });
    }

    await course.deleteOne();

    res.json({ message: 'Course deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
