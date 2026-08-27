const express = require('express');
const router = express.Router();

const courseController = require('../controllers/course.controller');
const authMiddleware = require('../middleware/authMiddleware');

// Protected
router.post('/', authMiddleware, courseController.createCourse);
router.delete('/:id', authMiddleware, courseController.deleteCourse);
router.get('/:id/access', authMiddleware, courseController.getCourseAccess);

// Public
router.get('/', courseController.getAllCourses);
router.get('/:id', courseController.getCourseById);

module.exports = router;