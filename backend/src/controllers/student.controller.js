const Student = require('../models/Student.model');

function sanitizeUser(user) {
  if (!user) return null;

  const userObj = user.toObject();
  delete userObj.passwordHash;
  return userObj;
}

// Get the currently signed-in student, with enrolled courses populated
exports.getMe = async (req, res) => {
  try {
    const student = await Student.findById(req.user.userId).populate('courses');

    if (!student) {
      return res.status(404).json({ message: 'Student not found.' });
    }

    return res.status(200).json({ user: sanitizeUser(student) });
  } catch (error) {
    console.error('Get student error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};
