const express = require('express');
const router = express.Router();

const studentController = require('../controllers/student.controller');
const authMiddleware = require('../middleware/authMiddleware');

router.get('/me', authMiddleware, studentController.getMe);
router.get('/me/courses', authMiddleware, studentController.getMyCourses);
router.get('/me/lectures', authMiddleware, studentController.getMyLectures);

module.exports = router;
