const Course = require('../models/Course.model');
const Student = require('../models/Student.model');
const { getPagination, buildPagination } = require('../utils/pagination');

// Create course
exports.createCourse = async (req, res) => {
  try {
    const { name, price, description } = req.body;

    if (!name || price === undefined) {
      return res.status(400).json({ message: 'Name and price are required' });
    }

    const course = await Course.create({
      name,
      price,
      description: description || '',
      teacher: req.user.userId,
    });

    res.status(201).json(course);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all courses (paginated)
exports.getAllCourses = async (req, res) => {
  try {
    const { page, limit, skip } = getPagination(req, { defaultLimit: 20, maxLimit: 100 });

    const [courses, total] = await Promise.all([
      Course.find()
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('lectures', 'name price'),
      Course.countDocuments(),
    ]);

    res.json({ items: courses, pagination: buildPagination({ page, limit, total }) });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get course by ID
exports.getCourseById = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id).populate('lectures', 'name price');

    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    res.json(course);
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

    const isEnrolledInCourse = student.courses.some(
      (courseId) => courseId.toString() === course._id.toString()
    );

    const courseLectureIds = new Set(course.lectures.map((l) => l.toString()));
    const purchasedLectureIds = isEnrolledInCourse
      ? course.lectures.map((l) => l.toString())
      : student.lectures.map((l) => l.toString()).filter((l) => courseLectureIds.has(l));

    res.json({ isEnrolledInCourse, purchasedLectureIds });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete course
exports.deleteCourse = async (req, res) => {
  try {
    const course = await Course.findByIdAndDelete(req.params.id);

    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    res.json({ message: 'Course deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
