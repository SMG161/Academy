const { getPasswordPolicyError } = require('../src/utils/passwordPolicy');

describe('getPasswordPolicyError', () => {
  it('rejects passwords shorter than 8 characters', () => {
    expect(getPasswordPolicyError('abc123')).toMatch(/at least 8 characters/);
  });

  it('rejects a non-string value', () => {
    expect(getPasswordPolicyError(undefined)).toMatch(/at least 8 characters/);
  });

  it('rejects a password with no digit', () => {
    expect(getPasswordPolicyError('abcdefgh')).toMatch(/letter and one number/);
  });

  it('rejects a password with no letter', () => {
    expect(getPasswordPolicyError('12345678')).toMatch(/letter and one number/);
  });

  it('accepts a password with a letter, a number, and 8+ characters', () => {
    expect(getPasswordPolicyError('abcd1234')).toBeNull();
  });

  it('accepts a long password with mixed characters', () => {
    expect(getPasswordPolicyError('Str0ngPassword!')).toBeNull();
  });
});
