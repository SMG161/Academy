const jwt = require('jsonwebtoken');

function getJwtConfig() {
  const secret = process.env.JWT_SECRET;
  const expiresIn = process.env.JWT_EXPIRES_IN || '7d';

  if (!secret) {
    throw new Error('JWT_SECRET is not set in environment variables');
  }

  return { secret, expiresIn };
}

function signToken(payload) {
  const { secret, expiresIn } = getJwtConfig();
  return jwt.sign(payload, secret, { expiresIn });
}

module.exports = {
  signToken,
};


