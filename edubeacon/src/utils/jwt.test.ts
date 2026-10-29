import { describe, expect, it } from 'vitest';
import { decodeToken } from './jwt';

function toBase64Url(value: string): string {
  return btoa(value).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

describe('decodeToken', () => {
  it('decodes a well-formed JWT payload', () => {
    const payload = { userId: 'abc123', email: 'test@example.com', role: 'student' };
    const token = `header.${toBase64Url(JSON.stringify(payload))}.signature`;

    expect(decodeToken(token)).toEqual(payload);
  });

  it('translates base64url (- and _) back to base64 (+ and /) before decoding', () => {
    // Verified fixture: this payload's base64 encoding contains both "+" and
    // "/", so its base64url form contains "-" and "_" — exercising the
    // translation decodeToken has to do before atob() can parse it.
    const payload = {
      userId: 'abc123???>>>subject_sign~~~',
      email: 'test+alias@example.com',
      role: 'teacher',
    };
    const base64Url =
      'eyJ1c2VySWQiOiJhYmMxMjM_Pz8-Pj5zdWJqZWN0X3NpZ25-fn4iLCJlbWFpbCI6InRlc3QrYWxpYXNAZXhhbXBsZS5jb20iLCJyb2xlIjoidGVhY2hlciJ9';

    expect(decodeToken(`header.${base64Url}.signature`)).toEqual(payload);
  });

  it('returns null for garbage input', () => {
    expect(decodeToken('not-a-jwt')).toBeNull();
  });

  it('returns null for an empty string', () => {
    expect(decodeToken('')).toBeNull();
  });

  it('returns null when the payload segment is not valid base64', () => {
    expect(decodeToken('header.not!!valid!!base64.signature')).toBeNull();
  });

  it('returns null when the decoded payload is not valid JSON', () => {
    const token = `header.${toBase64Url('not json')}.signature`;
    expect(decodeToken(token)).toBeNull();
  });
});
