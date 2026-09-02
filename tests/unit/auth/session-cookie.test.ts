import { describe, expect, it } from 'vitest';
import {
  parseAuthCookie,
  serializeAuthCookie,
} from '@/lib/auth/session-cookie';

describe('auth/session-cookie', () => {
  it('round-trips cookie payload', () => {
    const payload = {
      userId: 'user_004',
      role: 'admin' as const,
      status: 'active' as const,
    };
    const raw = serializeAuthCookie(payload);
    expect(parseAuthCookie(raw)).toEqual(payload);
  });

  it('returns null for invalid cookie', () => {
    expect(parseAuthCookie(undefined)).toBeNull();
    expect(parseAuthCookie('not-json')).toBeNull();
  });
});
