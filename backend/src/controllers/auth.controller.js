const {
  createUser,
  findUserByEmailOrUsername,
  findUserByEmail,
} = require('../models/User.model');
const { hashPassword, comparePassword } = require('../utils/hash');
const { signToken } = require('../utils/jwt');

function sanitizeUser(user) {
  if (!user) return null;
  // Remove sensitive fields
  // eslint-disable-next-line no-unused-vars
  const { passwordHash, ...safeUser } = user;
  return safeUser;
}

async function signup(req, res) {
  try {
    const { email, username, password, confirmPassword } = req.body;

    if (!email || !password || !confirmPassword) {
      return res
        .status(400)
        .json({ message: 'Email, password and confirm password are required.' });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ message: 'Passwords do not match.' });
    }

    const existingByEmail = await findUserByEmail(email);
    if (existingByEmail) {
      return res.status(409).json({ message: 'Email is already registered.' });
    }

    if (username) {
      const existingByUsername = await findUserByEmailOrUsername(username);
      if (existingByUsername) {
        return res
          .status(409)
          .json({ message: 'Username is already taken.' });
      }
    }

    const passwordHash = await hashPassword(password);

    const newUser = await createUser({
      email,
      username,
      passwordHash,
    });

    const token = signToken({
      userId: newUser._id.toString(),
      email: newUser.email,
    });

    console.log("Signed up successfully", newUser);

    return res.status(201).json({
      message: 'User registered successfully',
      user: sanitizeUser(newUser),
      token,
    });
  } catch (error) {
    // Handle duplicate key errors defensively
    if (error && error.code === 11000) {
      const field = Object.keys(error.keyPattern || {})[0] || 'field';
      return res.status(409).json({
        message: `${field.charAt(0).toUpperCase() + field.slice(1)} already in use.`,
      });
    }

    // eslint-disable-next-line no-console
    console.error('Signup error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}

async function signin(req, res) {
  try {
    const { emailOrUsername, password } = req.body;

    if (!emailOrUsername || !password) {
      return res
        .status(400)
        .json({ message: 'Email/username and password are required.' });
    }

    const user = await findUserByEmailOrUsername(emailOrUsername);

    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials.' });
    }

    const isMatch = await comparePassword(password, user.passwordHash);

    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials.' });
    }

    const token = signToken({
      userId: user._id.toString(),
      email: user.email,
    });

    console.log("Signed in successfully", user);

    return res.status(200).json({
      message: 'Signed in successfully',
      user: sanitizeUser(user),
      token,
    });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Signin error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}

module.exports = {
  signup,
  signin,
};


