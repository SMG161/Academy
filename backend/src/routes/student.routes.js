const express = require('express');
const router = express.Router();

const studentController = require('../controllers/student.controller');
const authMiddleware = require('../middleware/authMiddleware');

router.get('/me', authMiddleware, studentController.getMe);

module.exports = router;
