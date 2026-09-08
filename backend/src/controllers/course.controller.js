const Course = require('../models/Course.model');
const Student = require('../models/Student.model');
const { getPagination, buildPagination } = require('../utils/pagination');
const { withThumbnailUrl } = require('../utils/cdn');

function sanitizeCourse(course) {
  return withThumbnailUrl(course.toObject());
}

// Create course
exports.createCourse = async (req, res) => {
  try {
    const { name, price, description, thumbnailPath } = req.body;

    if (!name || price === undefined) {
      return res.status(400).json({ message: 'Name and price are required' });
    }

    // thumbnailPath must come from this teacher's own presigned upload namespace.
    if (thumbnailPath && req.user.role !== 'admin' && !thumbnailPath.startsWith(`thumbnails/${req.user.userId}/`)) {
      return res.status(403).json({ message: 'Invalid thumbnailPath' });
    }

    const course = await Course.create({
      name,
      price,
      description: description || '',
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
    const { name, price, description, thumbnailPath } = req.body;

    if (!name || price === undefined) {
      return res.status(400).json({ message: 'Name and price are required' });
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
    if (thumbnailPath) {
      course.thumbnailPath = thumbnailPath;
    }

    await course.save();

    res.json(sanitizeCourse(course));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all courses (paginated)
exports.getAllCourses = async (req, res) => {
  try {
    const { page, limit, skip } = getPagination(req, { defaultLimit: 27, maxLimit: 27 });

    const [courses, total] = await Promise.all([
      Course.find()
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('lectures', 'name price')
        .populate('teacher', 'name'),
      Course.countDocuments(),
    ]);

    res.json({ items: courses.map(sanitizeCourse), pagination: buildPagination({ page, limit, total }) });
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
