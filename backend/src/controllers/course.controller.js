const Course = require('../models/Course.model');
const Student = require('../models/Student.model');
const { signVideoUrl } = require('../utils/cloudfrontSign');

const rawCdnBaseUrl = process.env.CDN_BASE_URL || '';
const CDN_BASE_URL = rawCdnBaseUrl && !/^https?:\/\//i.test(rawCdnBaseUrl)
  ? `https://${rawCdnBaseUrl}`
  : rawCdnBaseUrl;

// videoPath is stored as the raw S3 key; resolve it against the CDN
function resolveCdnUrl(videoPath) {
  if (!CDN_BASE_URL) return videoPath;
  return `${CDN_BASE_URL.replace(/\/$/, '')}/${videoPath.replace(/^\//, '')}`;
}

// Public course responses never include the video path/URL — playback URLs
// are only issued via getCourseVideo, after an auth + enrollment check.
function sanitizeCourse(course) {
  const courseObj = course.toObject();
  delete courseObj.videoPath;
  return courseObj;
}

// Create course
exports.createCourse = async (req, res) => {
  try {
    const { name, price } = req.body;

    if (!name || price === undefined) {
      return res.status(400).json({ message: 'Name and price are required' });
    }

    const course = await Course.create({
      name,
      price,
      teacher: req.user?.id || null, // optional
      videoPath: '/videos/sample.mp4',
    });

    res.status(201).json(course);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all courses
exports.getAllCourses = async (req, res) => {
  try {
    const courses = await Course.find().sort({ createdAt: -1 });
    res.json(courses.map(sanitizeCourse));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get course by ID
exports.getCourseById = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    res.json(sanitizeCourse(course));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get a short-lived, signed video URL — only for authenticated students enrolled in this course
exports.getCourseVideo = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    const student = await Student.findById(req.user.userId);

    const isEnrolled = Boolean(
      student && student.courses.some((courseId) => courseId.toString() === course._id.toString())
    );

    if (!isEnrolled) {
      return res.status(403).json({ message: 'You are not enrolled in this course' });
    }

    const videoUrl = signVideoUrl(resolveCdnUrl(course.videoPath));

    res.json({ videoUrl });
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