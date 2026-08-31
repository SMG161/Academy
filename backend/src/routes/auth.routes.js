const express = require('express');
const {
  signup,
  signin,
  verifyEmail,
  resendVerification,
  requestOtp,
  verifyOtp,
  forgotPassword,
  resetPassword,
} = require('../controllers/auth.controller');

const router = express.Router();

router.post('/signup', signup);
router.post('/signin', signin);
router.post('/verify-email', verifyEmail);
router.post('/resend-verification', resendVerification);
router.post('/otp/request', requestOtp);
router.post('/otp/verify', verifyOtp);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

module.exports = router;
