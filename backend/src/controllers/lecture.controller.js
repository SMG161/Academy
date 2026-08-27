const Course = require('../models/Course.model');
const Lecture = require('../models/Lecture.model');
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

// Public lecture responses never include the video path/URL — playback URLs
// are only issued via getLectureVideo, after an auth + access check.
function sanitizeLecture(lecture) {
  const lectureObj = lecture.toObject();
  delete lectureObj.videoPath;
  return lectureObj;
}

// Create lecture
exports.createLecture = async (req, res) => {
  try {
    const { name, course, description, videoPath, price } = req.body;

    if (!name || !course || !videoPath || price === undefined) {
      return res.status(400).json({ message: 'Name, course, videoPath and price are required' });
    }

    const courseDoc = await Course.findById(course);

    if (!courseDoc) {
      return res.status(404).json({ message: 'Course not found' });
    }

    const lecture = await Lecture.create({
      name,
      course,
      description,
      videoPath,
      price,
      teacher: req.user?.userId || null,
    });

    courseDoc.lectures.push(lecture._id);
    await courseDoc.save();

    res.status(201).json(sanitizeLecture(lecture));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get lecture by ID
exports.getLectureById = async (req, res) => {
  try {
    const lecture = await Lecture.findById(req.params.id)
      .populate('course', 'name')
      .populate('teacher', 'name');

    if (!lecture) {
      return res.status(404).json({ message: 'Lecture not found' });
    }

    res.json(sanitizeLecture(lecture));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get a short-lived, signed video URL. Access is granted if the student is
// enrolled in the parent course, or has bought this lecture individually.
exports.getLectureVideo = async (req, res) => {
  try {
    const lecture = await Lecture.findById(req.params.id);

    if (!lecture) {
      return res.status(404).json({ message: 'Lecture not found' });
    }

    const student = await Student.findById(req.user.userId);

    const hasCourseAccess = Boolean(
      student && student.courses.some((courseId) => courseId.toString() === lecture.course.toString())
    );

    const hasLectureAccess = Boolean(
      student && student.lectures.some((lectureId) => lectureId.toString() === lecture._id.toString())
    );

    if (!hasCourseAccess && !hasLectureAccess) {
      return res.status(403).json({ message: 'You do not have access to this lecture' });
    }

    const videoUrl = signVideoUrl(resolveCdnUrl(lecture.videoPath));

    res.json({ videoUrl });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete lecture
exports.deleteLecture = async (req, res) => {
  try {
    const lecture = await Lecture.findByIdAndDelete(req.params.id);

    if (!lecture) {
      return res.status(404).json({ message: 'Lecture not found' });
    }

    await Course.findByIdAndUpdate(lecture.course, { $pull: { lectures: lecture._id } });

    res.json({ message: 'Lecture deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
