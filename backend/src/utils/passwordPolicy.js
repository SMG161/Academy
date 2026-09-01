const MIN_LENGTH = 8;

// Requires at least one letter and one number, min 8 chars.
function getPasswordPolicyError(password) {
  if (typeof password !== 'string' || password.length < MIN_LENGTH) {
    return `Password must be at least ${MIN_LENGTH} characters long.`;
  }

  if (!/[a-zA-Z]/.test(password) || !/[0-9]/.test(password)) {
    return 'Password must contain at least one letter and one number.';
  }

  return null;
}

module.exports = { getPasswordPolicyError };
