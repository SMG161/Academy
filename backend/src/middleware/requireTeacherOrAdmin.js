function requireTeacherOrAdmin(req, res, next) {
  if (!req.user || (req.user.role !== 'teacher' && req.user.role !== 'admin')) {
    return res.status(403).json({ message: 'Teacher or admin access required' });
  }

  next();
}

module.exports = requireTeacherOrAdmin;
