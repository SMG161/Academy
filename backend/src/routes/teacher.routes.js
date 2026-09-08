const express = require('express');
const router = express.Router();

const teacherController = require('../controllers/teacher.controller');
const authMiddleware = require('../middleware/authMiddleware');
const requireTeacher = require('../middleware/requireTeacher');

router.use(authMiddleware, requireTeacher);

router.get('/courses', teacherController.getMyCourses);
router.get('/lectures', teacherController.getMyLectures);

router.get('/students', teacherController.getMyStudents);
router.get('/students/search', teacherController.searchStudents);
router.get('/students/:studentId', teacherController.getStudentDetail);
router.get('/students/:studentId/available-courses', teacherController.getAvailableCourses);
router.get('/students/:studentId/available-lectures', teacherController.getAvailableLectures);
router.post('/students/:studentId/courses', teacherController.grantCourseAccess);
router.patch('/students/:studentId/courses/:grantId', teacherController.updateCourseGrant);
router.delete('/students/:studentId/courses/:grantId', teacherController.deleteCourseGrant);
router.post('/students/:studentId/lectures', teacherController.grantLectureAccess);
router.patch('/students/:studentId/lectures/:grantId', teacherController.updateLectureGrant);
router.delete('/students/:studentId/lectures/:grantId', teacherController.deleteLectureGrant);

module.exports = router;
