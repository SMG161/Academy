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
const {
  signinLimiter,
  otpVerifyLimiter,
  emailRequestLimiter,
  signupLimiter,
  resetPasswordLimiter,
} = require('../middleware/rateLimiters');

const router = express.Router();

router.post('/signup', signupLimiter, signup);
router.post('/signin', signinLimiter, signin);
router.post('/verify-email', verifyEmail);
router.post('/resend-verification', emailRequestLimiter, resendVerification);
router.post('/otp/request', emailRequestLimiter, requestOtp);
router.post('/otp/verify', otpVerifyLimiter, verifyOtp);
router.post('/forgot-password', emailRequestLimiter, forgotPassword);
router.post('/reset-password', resetPasswordLimiter, resetPassword);

module.exports = router;
