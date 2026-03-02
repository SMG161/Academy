const User = require('../models/User.model');
const { hashPassword, comparePassword } = require('../utils/hash');
const { signToken } = require('../utils/jwt');

function sanitizeUser(user) {
  if (!user) return null;

  const userObj = user.toObject();
  delete userObj.passwordHash;
  return userObj;
}

async function signup(req, res) {
  try {
    const { email, username, password, confirmPassword } = req.body;

    if (!email || !password || !confirmPassword) {
      return res.status(400).json({
        message: 'Email, password and confirm password are required.',
      });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ message: 'Passwords do not match.' });
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

    const newUser = await User.create({
      email,
      username,
      passwordHash,
    });

    const token = signToken({
      userId: newUser._id.toString(),
      email: newUser.email,
    });

    console.log('Signed up successfully', newUser);

    return res.status(201).json({
      message: 'User registered successfully',
      user: sanitizeUser(newUser),
      token,
    });
  } catch (error) {
    // Handle duplicate key error (just in case)
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

    const token = signToken({
      userId: user._id.toString(),
      email: user.email,
    });

    console.log('Signed in successfully', user);

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

module.exports = {
  signup,
  signin,
};