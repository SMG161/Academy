const express = require('express');
const router = express.Router();

const uploadController = require('../controllers/upload.controller');
const authMiddleware = require('../middleware/authMiddleware');
const requireTeacherOrAdmin = require('../middleware/requireTeacherOrAdmin');
const { uploadPresignLimiter } = require('../middleware/rateLimiters');

router.use(authMiddleware, requireTeacherOrAdmin, uploadPresignLimiter);

router.post('/lecture-video', uploadController.getLectureUploadUrl);
router.post('/thumbnail', uploadController.getThumbnailUploadUrl);

module.exports = router;
