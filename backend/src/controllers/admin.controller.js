const crypto = require('crypto');
const User = require('../models/User.model');
const Teacher = require('../models/Teacher.model');
const Student = require('../models/Student.model');
const Course = require('../models/Course.model');
const Lecture = require('../models/Lecture.model');
const { hashPassword } = require('../utils/hash');
const { getPagination, buildPagination } = require('../utils/pagination');
const { sendTeacherInviteEmail } = require('../utils/email');
const { generateVerificationToken } = require('../utils/otp');

const INVITE_TOKEN_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

function sanitizeUser(user) {
  if (!user) return null;

  const userObj = user.toObject();
  delete userObj.passwordHash;
  delete userObj.emailVerificationTokenHash;
  delete userObj.emailVerificationExpires;
  delete userObj.otpCodeHash;
  delete userObj.otpExpires;
  delete userObj.resetPasswordTokenHash;
  delete userObj.resetPasswordExpires;
  delete userObj.failedLoginAttempts;
  delete userObj.lockUntil;
  delete userObj.otpAttempts;
  return userObj;
}

exports.createTeacher = async (req, res) => {
  try {
    const { name, email } = req.body;

    if (!name || !email) {
      return res.status(400).json({ message: 'Name and email are required.' });
    }

    const existing = await User.findOne({ email: email.toLowerCase() });

    if (existing) {
      return res.status(409).json({ message: 'Email is already registered.' });
    }

    // Unusable placeholder — the teacher sets their real password via the invite link.
    const passwordHash = await hashPassword(crypto.randomBytes(32).toString('hex'));

    const teacher = await Teacher.create({ name, email, passwordHash, isVerified: false });

    const { rawToken, tokenHash } = generateVerificationToken();
    teacher.resetPasswordTokenHash = tokenHash;
    teacher.resetPasswordExpires = new Date(Date.now() + INVITE_TOKEN_TTL_MS);
    await teacher.save();

    await sendTeacherInviteEmail(teacher.email, teacher.name, rawToken);

    return res.status(201).json({
      message: 'Teacher invited successfully',
      teacher: sanitizeUser(teacher),
    });
  } catch (error) {
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern || {})[0];
      return res.status(409).json({ message: `${field} already in use.` });
    }

    console.error('Create teacher error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

exports.getAllTeachers = async (req, res) => {
  try {
    const { page, limit, skip } = getPagination(req, { defaultLimit: 25, maxLimit: 100 });

    const [teachers, total, courseCounts] = await Promise.all([
      Teacher.find().sort({ createdAt: -1 }).skip(skip).limit(limit),
      Teacher.countDocuments(),
      Course.aggregate([
        { $match: { teacher: { $ne: null } } },
        { $group: { _id: '$teacher', count: { $sum: 1 } } },
      ]),
    ]);

    const countMap = new Map(courseCounts.map((c) => [c._id.toString(), c.count]));

    const items = teachers.map((teacher) => ({
      ...sanitizeUser(teacher),
      numCourses: countMap.get(teacher._id.toString()) || 0,
    }));

    return res.status(200).json({ items, pagination: buildPagination({ page, limit, total }) });
  } catch (error) {
    console.error('Get teachers error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

exports.getStats = async (req, res) => {
  try {
    const [totalStudents, totalTeachers, totalCourses, totalLectures, courses, teachers] =
      await Promise.all([
        Student.countDocuments(),
        Teacher.countDocuments(),
        Course.countDocuments(),
        Lecture.countDocuments(),
        Course.find().select('name teacher'),
        Teacher.find().select('name'),
      ]);

    const lecturesPerCourse = await Lecture.aggregate([
      { $group: { _id: '$course', lectureCount: { $sum: 1 } } },
    ]);
    const lectureCountMap = new Map(
      lecturesPerCourse.map((l) => [l._id.toString(), l.lectureCount])
    );

    const coursesBreakdown = await Promise.all(
      courses.map(async (course) => ({
        courseId: course._id,
        courseName: course.name,
        lectureCount: lectureCountMap.get(course._id.toString()) || 0,
        studentCount: await Student.countDocuments({ 'courses.course': course._id }),
      }))
    );

    const teachersBreakdown = await Promise.all(
      teachers.map(async (teacher) => {
        const teacherCourseIds = courses
          .filter((c) => c.teacher && c.teacher.toString() === teacher._id.toString())
          .map((c) => c._id);

        const uniqueStudentCount = teacherCourseIds.length
          ? await Student.countDocuments({ 'courses.course': { $in: teacherCourseIds } })
          : 0;

        return {
          teacherId: teacher._id,
          teacherName: teacher.name,
          numCourses: teacherCourseIds.length,
          uniqueStudentCount,
        };
      })
    );

    return res.status(200).json({
      totalStudents,
      totalTeachers,
      totalCourses,
      totalLectures,
      coursesBreakdown,
      teachersBreakdown,
    });
  } catch (error) {
    console.error('Get stats error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};
