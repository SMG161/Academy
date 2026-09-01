const Course = require('../models/Course.model');
const Lecture = require('../models/Lecture.model');
const Student = require('../models/Student.model');
const { signVideoUrl } = require('../utils/cloudfrontSign');
const { resolveCdnUrl, withThumbnailUrl } = require('../utils/cdn');

// Public lecture responses never include the video path/URL — playback URLs
// are only issued via getLectureVideo, after an auth + access check.
function sanitizeLecture(lecture) {
  const lectureObj = lecture.toObject();
  delete lectureObj.videoPath;
  return withThumbnailUrl(lectureObj);
}

// Create lecture
exports.createLecture = async (req, res) => {
  try {
    const { name, course, description, videoPath, price, thumbnailPath } = req.body;

    if (!name || !course || !videoPath || price === undefined) {
      return res.status(400).json({ message: 'Name, course, videoPath and price are required' });
    }

    const courseDoc = await Course.findById(course);

    if (!courseDoc) {
      return res.status(404).json({ message: 'Course not found' });
    }

    const isOwner = courseDoc.teacher && courseDoc.teacher.toString() === req.user.userId;
    if (!isOwner && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'You do not have permission to add lectures to this course' });
    }

    // videoPath must come from this teacher's own presigned upload namespace.
    if (req.user.role !== 'admin' && !videoPath.startsWith(`lectures/${req.user.userId}/`)) {
      return res.status(403).json({ message: 'Invalid videoPath' });
    }

    // thumbnailPath must come from this teacher's own presigned upload namespace.
    if (thumbnailPath && req.user.role !== 'admin' && !thumbnailPath.startsWith(`thumbnails/${req.user.userId}/`)) {
      return res.status(403).json({ message: 'Invalid thumbnailPath' });
    }

    const lecture = await Lecture.create({
      name,
      course,
      description,
      videoPath,
      price,
      thumbnailPath: thumbnailPath || null,
      teacher: req.user.userId,
    });

    courseDoc.lectures.push(lecture._id);

    // A course with no thumbnail of its own picks up the first frame
    // captured from its first uploaded lecture.
    if (!courseDoc.thumbnailPath && thumbnailPath) {
      courseDoc.thumbnailPath = thumbnailPath;
    }

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
    const now = new Date();

    const hasCourseAccess = Boolean(
      student &&
        student.courses.some(
          (c) => c.course.toString() === lecture.course.toString() && c.expiresAt > now
        )
    );

    const hasLectureAccess = Boolean(
      student &&
        student.lectures.some(
          (l) => l.lecture.toString() === lecture._id.toString() && l.expiresAt > now
        )
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

// Whether the signed-in student has access to this lecture (course enrollment
// or an individual lecture purchase).
exports.getLectureAccess = async (req, res) => {
  try {
    const lecture = await Lecture.findById(req.params.id).select('course');

    if (!lecture) {
      return res.status(404).json({ message: 'Lecture not found' });
    }

    const student = await Student.findById(req.user.userId).select('courses lectures');

    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    const now = new Date();
    const courseEntry = student.courses.find(
      (c) => c.course.toString() === lecture.course.toString() && c.expiresAt > now
    );
    const lectureEntry = student.lectures.find(
      (l) => l.lecture.toString() === lecture._id.toString() && l.expiresAt > now
    );

    const hasAccess = Boolean(courseEntry || lectureEntry);
    const expiresAt = courseEntry ? courseEntry.expiresAt : lectureEntry ? lectureEntry.expiresAt : null;

    res.json({ hasAccess, expiresAt });
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
