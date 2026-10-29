const crypto = require('crypto');
const { generateVerificationToken, hashToken, generateOtpCode } = require('../src/utils/otp');

describe('generateVerificationToken', () => {
  it('produces a 64-char hex raw token and its matching sha256 hash', () => {
    const { rawToken, tokenHash } = generateVerificationToken();

    expect(rawToken).toMatch(/^[0-9a-f]{64}$/);
    expect(tokenHash).toBe(crypto.createHash('sha256').update(rawToken).digest('hex'));
  });

  it('never produces the same token twice', () => {
    const first = generateVerificationToken();
    const second = generateVerificationToken();

    expect(first.rawToken).not.toBe(second.rawToken);
  });
});

describe('hashToken', () => {
  it('matches a manually computed sha256 hash of the same input', () => {
    expect(hashToken('some-raw-value')).toBe(
      crypto.createHash('sha256').update('some-raw-value').digest('hex')
    );
  });

  it('is deterministic for the same input', () => {
    expect(hashToken('abc')).toBe(hashToken('abc'));
  });
});

describe('generateOtpCode', () => {
  it('always produces a 6-digit, zero-padded numeric code', () => {
    const randomIntSpy = jest.spyOn(crypto, 'randomInt').mockReturnValueOnce(42);

    const { code, codeHash } = generateOtpCode();

    expect(code).toBe('000042');
    expect(code).toMatch(/^\d{6}$/);
    expect(codeHash).toBe(crypto.createHash('sha256').update(code).digest('hex'));

    randomIntSpy.mockRestore();
  });

  it('stays within the 6-digit range for the largest possible value', () => {
    const randomIntSpy = jest.spyOn(crypto, 'randomInt').mockReturnValueOnce(999999);

    const { code } = generateOtpCode();

    expect(code).toBe('999999');

    randomIntSpy.mockRestore();
  });
});
