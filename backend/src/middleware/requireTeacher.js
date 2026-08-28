function requireTeacher(req, res, next) {
  if (!req.user || req.user.role !== 'teacher') {
    return res.status(403).json({ message: 'Teacher access required' });
  }

  next();
}

module.exports = requireTeacher;
