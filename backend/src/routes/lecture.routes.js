const express = require('express');
const router = express.Router();

const lectureController = require('../controllers/lecture.controller');
const authMiddleware = require('../middleware/authMiddleware');

// Protected
router.post('/', authMiddleware, lectureController.createLecture);
router.delete('/:id', authMiddleware, lectureController.deleteLecture);
router.get('/:id/video', authMiddleware, lectureController.getLectureVideo);

// Public
router.get('/:id', lectureController.getLectureById);

module.exports = router;
