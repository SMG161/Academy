const Student = require('../models/Student.model');

function sanitizeUser(user) {
  if (!user) return null;

  const userObj = user.toObject();
  delete userObj.passwordHash;
  return userObj;
}

// Get the currently signed-in student, with enrolled courses and
// individually-purchased lectures populated (videoPath excluded — playback
// URLs are only issued via the signed video endpoints).
exports.getMe = async (req, res) => {
  try {
    const student = await Student.findById(req.user.userId)
      .populate('courses')
      .populate({
        path: 'lectures',
        select: '-videoPath',
        populate: [
          { path: 'teacher', select: 'name' },
          { path: 'course', select: 'name' },
        ],
      });

    if (!student) {
      return res.status(404).json({ message: 'Student not found.' });
    }

    return res.status(200).json({ user: sanitizeUser(student) });
  } catch (error) {
    console.error('Get student error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};
