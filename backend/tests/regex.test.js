const { escapeRegex } = require('../src/utils/regex');

describe('escapeRegex', () => {
  it('leaves a plain string unchanged', () => {
    expect(escapeRegex('hello world')).toBe('hello world');
  });

  it('escapes every regex metacharacter', () => {
    const input = '.*+?^${}()|[]\\';
    const escaped = escapeRegex(input);
    // The escaped string, compiled as a regex, must match only the exact
    // literal input — none of the metacharacters may act as regex syntax.
    expect(new RegExp(`^${escaped}$`).test(input)).toBe(true);
  });

  it('prevents a crafted "match everything" input from acting as a wildcard', () => {
    const malicious = '.*';
    const escaped = escapeRegex(malicious);
    const pattern = new RegExp(escaped, 'i');

    expect(pattern.test('.*')).toBe(true);
    expect(pattern.test('any random string')).toBe(false);
  });

  it('is safe to embed in a case-insensitive search filter', () => {
    const search = 'a+b';
    const pattern = new RegExp(escapeRegex(search), 'i');

    expect(pattern.test('contains a+b literally')).toBe(true);
    expect(pattern.test('contains aaaab (no literal plus)')).toBe(false);
  });
});
