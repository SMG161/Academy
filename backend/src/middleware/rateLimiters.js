const { rateLimit, ipKeyGenerator } = require('express-rate-limit');

function keyByEmailAndIp(req) {
  const email = typeof req.body?.email === 'string' ? req.body.email.toLowerCase() : '';
  const emailOrUsername =
    typeof req.body?.emailOrUsername === 'string' ? req.body.emailOrUsername.toLowerCase() : '';
  return `${ipKeyGenerator(req.ip)}:${email || emailOrUsername}`;
}

// Password sign-in: 5 attempts per 15 min per IP+identifier.
const signinLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 5,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: keyByEmailAndIp,
  message: { message: 'Too many sign-in attempts. Please try again later.' },
});

// OTP verify: 5 attempts per 10 min per IP+email (guards the 6-digit code space).
const otpVerifyLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  limit: 5,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: keyByEmailAndIp,
  message: { message: 'Too many attempts. Please request a new code.' },
});

// OTP / verification / reset email requests: 3 per 15 min per IP+email (prevents email-bombing).
const emailRequestLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 3,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: keyByEmailAndIp,
  message: { message: 'Too many requests. Please try again later.' },
});

// Signup: 10 per hour per IP (prevents mass account creation).
const signupLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many accounts created from this IP. Please try again later.' },
});

// Password reset completion: 10 per 15 min per IP. The reset token itself
// (an unguessable 256-bit value) is the real barrier here — this just
// bounds abuse/log-spam on the endpoint, consistent with the other auth routes.
const resetPasswordLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => ipKeyGenerator(req.ip),
  message: { message: 'Too many attempts. Please try again later.' },
});

module.exports = {
  signinLimiter,
  otpVerifyLimiter,
  emailRequestLimiter,
  signupLimiter,
  resetPasswordLimiter,
};
