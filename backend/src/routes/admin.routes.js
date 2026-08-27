const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admin.controller');
const authMiddleware = require('../middleware/authMiddleware');
const requireAdmin = require('../middleware/requireAdmin');

router.use(authMiddleware, requireAdmin);

router.post('/teachers', adminController.createTeacher);
router.get('/teachers', adminController.getAllTeachers);
router.get('/stats', adminController.getStats);

module.exports = router;
