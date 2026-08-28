const express = require('express');
const router = express.Router();

const lectureController = require('../controllers/lecture.controller');
const authMiddleware = require('../middleware/authMiddleware');
const requireTeacherOrAdmin = require('../middleware/requireTeacherOrAdmin');

// Protected
router.post('/', authMiddleware, requireTeacherOrAdmin, lectureController.createLecture);
router.delete('/:id', authMiddleware, lectureController.deleteLecture);
router.get('/:id/video', authMiddleware, lectureController.getLectureVideo);
router.get('/:id/access', authMiddleware, lectureController.getLectureAccess);

// Public
router.get('/:id', lectureController.getLectureById);

module.exports = router;
