const express = require('express');
const router = express.Router();

const lectureController = require('../controllers/lecture.controller');
const watchProgressController = require('../controllers/watchProgress.controller');
const authMiddleware = require('../middleware/authMiddleware');
const requireTeacherOrAdmin = require('../middleware/requireTeacherOrAdmin');

// Protected
router.post('/', authMiddleware, requireTeacherOrAdmin, lectureController.createLecture);
router.patch('/:id', authMiddleware, requireTeacherOrAdmin, lectureController.updateLecture);
router.delete('/:id', authMiddleware, requireTeacherOrAdmin, lectureController.deleteLecture);
router.get('/:id/video', authMiddleware, lectureController.getLectureVideo);
router.get('/:id/access', authMiddleware, lectureController.getLectureAccess);
router.get('/:id/progress', authMiddleware, watchProgressController.getProgress);
router.put('/:id/progress', authMiddleware, watchProgressController.saveProgress);

// Public
router.get('/:id', lectureController.getLectureById);
router.get('/:id/preview', lectureController.getLecturePreview);

module.exports = router;
