const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    username: { type: String, unique: true, sparse: true, trim: true },
    passwordHash: { type: String, required: true },
    isVerified: { type: Boolean, default: false },
    emailVerificationTokenHash: { type: String, default: null },
    emailVerificationExpires: { type: Date, default: null },
    otpCodeHash: { type: String, default: null },
    otpExpires: { type: Date, default: null },
    resetPasswordTokenHash: { type: String, default: null },
    resetPasswordExpires: { type: Date, default: null },
    failedLoginAttempts: { type: Number, default: 0 },
    lockUntil: { type: Date, default: null },
    otpAttempts: { type: Number, default: 0 },
    termsAcceptedAt: { type: Date, default: null },
    // Set when the account is deactivated (self-service or admin action).
    // Teachers/admins stay deactivated indefinitely — other students may
    // still depend on a teacher's courses/lectures. Deactivated students are
    // permanently purged by a background sweep (see jobs/studentPurge.js).
    deactivatedAt: { type: Date, default: null },
    // Bumped whenever existing sessions should stop working immediately
    // (deactivation, password change) — checked against a JWT's `iat` claim
    // in authMiddleware, since a JWT itself can't be revoked directly.
    sessionsInvalidatedAt: { type: Date, default: null },
  },
  { timestamps: true, discriminatorKey: 'role' }
);

module.exports = mongoose.model('User', userSchema);