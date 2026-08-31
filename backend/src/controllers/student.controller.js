const Student = require('../models/Student.model');
const Course = require('../models/Course.model');
const Lecture = require('../models/Lecture.model');
const { getPagination, buildPagination } = require('../utils/pagination');

function sanitizeUser(user) {
  if (!user) return null;

  const userObj = user.toObject();
  delete userObj.passwordHash;
  return userObj;
}

// Get the currently signed-in student's basic profile. Course/lecture access
// checks and listings live behind their own (paginated / dedicated) endpoints
// so this stays cheap regardless of how many courses or lectures a student owns.
exports.getMe = async (req, res) => {
  try {
    const student = await Student.findById(req.user.userId);

    if (!student) {
      return res.status(404).json({ message: 'Student not found.' });
    }

    return res.status(200).json({ user: sanitizeUser(student) });
  } catch (error) {
    console.error('Get student error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

// Paginated list of courses the student is enrolled in.
exports.getMyCourses = async (req, res) => {
  try {
    const { page, limit, skip } = getPagination(req, { defaultLimit: 10, maxLimit: 50 });

    const student = await Student.findById(req.user.userId).select('courses');

    if (!student) {
      return res.status(404).json({ message: 'Student not found.' });
    }

    const now = new Date();
    const activeEntries = student.courses.filter((c) => c.expiresAt > now);
    const expiryMap = new Map(activeEntries.map((c) => [c.course.toString(), c.expiresAt]));

    const filter = { _id: { $in: activeEntries.map((c) => c.course) } };

    const [courses, total] = await Promise.all([
      Course.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('lectures', 'name price')
        .populate('teacher', 'name'),
      Course.countDocuments(filter),
    ]);

    const items = courses.map((course) => ({
      ...course.toObject(),
      expiresAt: expiryMap.get(course._id.toString()) || null,
    }));

    return res.status(200).json({ items, pagination: buildPagination({ page, limit, total }) });
  } catch (error) {
    console.error('Get my courses error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

// Paginated list of lectures the student bought individually, excluding any
// lecture already covered by a fully-owned course.
exports.getMyLectures = async (req, res) => {
  try {
    const { page, limit, skip } = getPagination(req, { defaultLimit: 10, maxLimit: 50 });

    const student = await Student.findById(req.user.userId).select('courses lectures');

    if (!student) {
      return res.status(404).json({ message: 'Student not found.' });
    }

    const now = new Date();
    const activeCourseIds = student.courses.filter((c) => c.expiresAt > now).map((c) => c.course);
    const activeLectureEntries = student.lectures.filter((l) => l.expiresAt > now);
    const expiryMap = new Map(activeLectureEntries.map((l) => [l.lecture.toString(), l.expiresAt]));

    const filter = {
      _id: { $in: activeLectureEntries.map((l) => l.lecture) },
      course: { $nin: activeCourseIds },
    };

    const [lectures, total] = await Promise.all([
      Lecture.find(filter)
        .select('-videoPath')
        .populate('teacher', 'name')
        .populate('course', 'name')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Lecture.countDocuments(filter),
    ]);

    const items = lectures.map((lecture) => ({
      ...lecture.toObject(),
      expiresAt: expiryMap.get(lecture._id.toString()) || null,
    }));

    return res.status(200).json({ items, pagination: buildPagination({ page, limit, total }) });
  } catch (error) {
    console.error('Get my lectures error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};
