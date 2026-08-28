const express = require('express');
const router = express.Router();

const teacherController = require('../controllers/teacher.controller');
const authMiddleware = require('../middleware/authMiddleware');
const requireTeacher = require('../middleware/requireTeacher');

router.use(authMiddleware, requireTeacher);

router.get('/courses', teacherController.getMyCourses);

module.exports = router;
