const express = require('express');
const router = express.Router();
const accountController = require('../controllers/account.controller');
const authMiddleware = require('../middleware/authMiddleware');

router.use(authMiddleware);

router.get('/me', accountController.getMe);
router.patch('/me', accountController.updateMe);
router.patch('/password', accountController.changePassword);

module.exports = router;
