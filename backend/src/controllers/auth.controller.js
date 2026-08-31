const User = require('../models/User.model');
const Student = require('../models/Student.model');
const { hashPassword, comparePassword } = require('../utils/hash');
const { signToken } = require('../utils/jwt');
const { sendVerificationEmail, sendOtpEmail, sendPasswordResetEmail } = require('../utils/email');
const { generateVerificationToken, hashToken, generateOtpCode } = require('../utils/otp');

const OTP_REQUIRED_ROLES = new Set(['student']);

// Add an entry here for each new role (e.g. teacher, admin) as its model is created.
const ROLE_MODELS = {
  student: Student,
};

const ROLE_DEFAULTS = {
  student: { courses: [], lectures: [] },
};

const VERIFICATION_TOKEN_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours
const OTP_TTL_MS = 10 * 60 * 1000; // 10 minutes
const RESET_TOKEN_TTL_MS = 60 * 60 * 1000; // 1 hour

function sanitizeUser(user) {
  if (!user) return null;

  const userObj = user.toObject();
  delete userObj.passwordHash;
  delete userObj.emailVerificationTokenHash;
  delete userObj.emailVerificationExpires;
  delete userObj.otpCodeHash;
  delete userObj.otpExpires;
  delete userObj.resetPasswordTokenHash;
  delete userObj.resetPasswordExpires;
  return userObj;
}

async function issueVerificationEmail(user) {
  const { rawToken, tokenHash } = generateVerificationToken();

  user.emailVerificationTokenHash = tokenHash;
  user.emailVerificationExpires = new Date(Date.now() + VERIFICATION_TOKEN_TTL_MS);
  await user.save();

  await sendVerificationEmail(user.email, user.name, rawToken);
}

async function signup(req, res) {
  try {
    const { name, email, username, password, confirmPassword, role = 'student' } = req.body;

    if (!name || !email || !password || !confirmPassword) {
      return res.status(400).json({
        message: 'Name, email, password and confirm password are required.',
      });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ message: 'Passwords do not match.' });
    }

    const RoleModel = ROLE_MODELS[role];

    if (!RoleModel) {
      return res.status(400).json({ message: `Invalid role: ${role}` });
    }

    const existingByEmail = await User.findOne({
      email: email.toLowerCase(),
    });

    if (existingByEmail) {
      return res.status(409).json({ message: 'Email is already registered.' });
    }

    if (username) {
      const existingByUsername = await User.findOne({ username });

      if (existingByUsername) {
        return res.status(409).json({ message: 'Username is already taken.' });
      }
    }

    const passwordHash = await hashPassword(password);

    const newUser = await RoleModel.create({
      name,
      email,
      username,
      passwordHash,
      isVerified: false,
      ...(ROLE_DEFAULTS[role] || {}),
    });

    await issueVerificationEmail(newUser);

    console.log('Signed up successfully, verification email sent', newUser.email);

    return res.status(201).json({
      message: 'Account created. Please check your email to verify your account before signing in.',
      email: newUser.email,
    });
  } catch (error) {
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern || {})[0];
      return res.status(409).json({
        message: `${field} already in use.`,
      });
    }

    console.error('Signup error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}

async function signin(req, res) {
  try {
    const { emailOrUsername, password } = req.body;

    if (!emailOrUsername || !password) {
      return res.status(400).json({
        message: 'Email/username and password are required.',
      });
    }

    const user = await User.findOne({
      $or: [
        { email: emailOrUsername.toLowerCase() },
        { username: emailOrUsername },
      ],
    });

    if (!user) {
      return res.status(401).json({ message: 'User not found.' });
    }

    const isMatch = await comparePassword(password, user.passwordHash);

    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials.' });
    }

    if (!user.isVerified) {
      return res.status(403).json({
        message: 'Please verify your email before signing in.',
        code: 'EMAIL_NOT_VERIFIED',
      });
    }

    if (OTP_REQUIRED_ROLES.has(user.role)) {
      const { code, codeHash } = generateOtpCode();
      user.otpCodeHash = codeHash;
      user.otpExpires = new Date(Date.now() + OTP_TTL_MS);
      await user.save();

      await sendOtpEmail(user.email, user.name, code);

      console.log('Password verified, OTP sent', user.email);

      return res.status(200).json({
        message: 'Enter the verification code sent to your email.',
        requiresOtp: true,
        email: user.email,
      });
    }

    const token = signToken({
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
    });

    console.log('Signed in successfully', user.email);

    return res.status(200).json({
      message: 'Signed in successfully',
      user: sanitizeUser(user),
      token,
    });
  } catch (error) {
    console.error('Signin error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}

async function verifyEmail(req, res) {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({ message: 'Verification token is required.' });
    }

    const tokenHash = hashToken(token);

    const user = await User.findOne({
      emailVerificationTokenHash: tokenHash,
      emailVerificationExpires: { $gt: new Date() },
    });

    if (!user) {
      return res.status(400).json({ message: 'Verification link is invalid or has expired.' });
    }

    user.isVerified = true;
    user.emailVerificationTokenHash = null;
    user.emailVerificationExpires = null;
    await user.save();

    if (user.role === 'student') {
      await user.populate('courses');
    }

    const jwtToken = signToken({
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
    });

    return res.status(200).json({
      message: 'Email verified successfully.',
      user: sanitizeUser(user),
      token: jwtToken,
    });
  } catch (error) {
    console.error('Verify email error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}

async function resendVerification(req, res) {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Email is required.' });
    }

    const user = await User.findOne({ email: email.toLowerCase() });

    if (user && !user.isVerified) {
      await issueVerificationEmail(user);
    }

    return res.status(200).json({
      message: 'If that account exists and is not yet verified, a new verification email has been sent.',
    });
  } catch (error) {
    console.error('Resend verification error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}

async function requestOtp(req, res) {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Email is required.' });
    }

    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      return res.status(200).json({
        message: 'If that account exists, a login code has been sent to it.',
      });
    }

    if (!user.isVerified) {
      return res.status(403).json({
        message: 'Please verify your email before signing in.',
        code: 'EMAIL_NOT_VERIFIED',
      });
    }

    const { code, codeHash } = generateOtpCode();
    user.otpCodeHash = codeHash;
    user.otpExpires = new Date(Date.now() + OTP_TTL_MS);
    await user.save();

    await sendOtpEmail(user.email, user.name, code);

    return res.status(200).json({
      message: 'If that account exists, a login code has been sent to it.',
    });
  } catch (error) {
    console.error('Request OTP error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}

async function verifyOtp(req, res) {
  try {
    const { email, code } = req.body;

    if (!email || !code) {
      return res.status(400).json({ message: 'Email and code are required.' });
    }

    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user || !user.otpCodeHash || !user.otpExpires || user.otpExpires < new Date()) {
      return res.status(401).json({ message: 'Invalid or expired code.' });
    }

    const codeHash = hashToken(code);

    if (codeHash !== user.otpCodeHash) {
      return res.status(401).json({ message: 'Invalid or expired code.' });
    }

    user.otpCodeHash = null;
    user.otpExpires = null;
    await user.save();

    if (user.role === 'student') {
      await user.populate('courses');
    }

    const token = signToken({
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
    });

    console.log('Signed in via OTP', user.email);

    return res.status(200).json({
      message: 'Signed in successfully',
      user: sanitizeUser(user),
      token,
    });
  } catch (error) {
    console.error('Verify OTP error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}

async function forgotPassword(req, res) {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Email is required.' });
    }

    const user = await User.findOne({ email: email.toLowerCase() });

    if (user) {
      const { rawToken, tokenHash } = generateVerificationToken();

      user.resetPasswordTokenHash = tokenHash;
      user.resetPasswordExpires = new Date(Date.now() + RESET_TOKEN_TTL_MS);
      await user.save();

      await sendPasswordResetEmail(user.email, user.name, rawToken);
    }

    return res.status(200).json({
      message: 'If that account exists, a password reset link has been sent to it.',
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}

async function resetPassword(req, res) {
  try {
    const { token, newPassword, confirmNewPassword } = req.body;

    if (!token || !newPassword || !confirmNewPassword) {
      return res.status(400).json({
        message: 'Token, new password and confirmation are required.',
      });
    }

    if (newPassword !== confirmNewPassword) {
      return res.status(400).json({ message: 'Passwords do not match.' });
    }

    const tokenHash = hashToken(token);

    const user = await User.findOne({
      resetPasswordTokenHash: tokenHash,
      resetPasswordExpires: { $gt: new Date() },
    });

    if (!user) {
      return res.status(400).json({ message: 'Reset link is invalid or has expired.' });
    }

    user.passwordHash = await hashPassword(newPassword);
    user.resetPasswordTokenHash = null;
    user.resetPasswordExpires = null;
    user.otpCodeHash = null;
    user.otpExpires = null;
    await user.save();

    return res.status(200).json({ message: 'Password reset successfully. Please sign in.' });
  } catch (error) {
    console.error('Reset password error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}

module.exports = {
  signup,
  signin,
  verifyEmail,
  resendVerification,
  requestOtp,
  verifyOtp,
  forgotPassword,
  resetPassword,
};
