const express = require('express');
const router = express.Router();

const courseController = require('../controllers/course.controller');
const authMiddleware = require('../middleware/authMiddleware');
const requireTeacherOrAdmin = require('../middleware/requireTeacherOrAdmin');

// Protected
router.post('/', authMiddleware, requireTeacherOrAdmin, courseController.createCourse);
router.patch('/:id', authMiddleware, requireTeacherOrAdmin, courseController.updateCourse);
router.delete('/:id', authMiddleware, requireTeacherOrAdmin, courseController.deleteCourse);
router.get('/:id/access', authMiddleware, courseController.getCourseAccess);

// Public
router.get('/', courseController.getAllCourses);
router.get('/filters', courseController.getCourseFilters);
router.get('/:id', courseController.getCourseById);

module.exports = router;