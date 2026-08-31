const crypto = require('crypto');

function generateVerificationToken() {
  const rawToken = crypto.randomBytes(32).toString('hex');
  const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');
  return { rawToken, tokenHash };
}

function hashToken(rawToken) {
  return crypto.createHash('sha256').update(rawToken).digest('hex');
}

function generateOtpCode() {
  const code = crypto.randomInt(0, 1000000).toString().padStart(6, '0');
  const codeHash = crypto.createHash('sha256').update(code).digest('hex');
  return { code, codeHash };
}

module.exports = {
  generateVerificationToken,
  hashToken,
  generateOtpCode,
};
