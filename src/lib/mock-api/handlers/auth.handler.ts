import type { AuthSession, User } from '@/types/auth';
import { demoUsers } from '@/data/users';
import { mockDelay } from '../delay';
import { MockApiError } from '../errors';

export interface LoginPayload {
  email: string;
  password: string;
}

export async function mockLogin(payload: LoginPayload): Promise<AuthSession> {
  await mockDelay();

  const user = demoUsers.find(
    (entry) => entry.email === payload.email && entry.password === payload.password,
  );

  if (!user) {
    throw new MockApiError('Invalid email or password', 'AUTH_INVALID');
  }

  const { password: _password, ...safeUser } = user;

  return {
    user: safeUser as User,
    token: `mock-token-${safeUser.id}`,
  };
}

export async function mockGetCurrentUser(userId: string): Promise<User | null> {
  await mockDelay(100);

  const user = demoUsers.find((entry) => entry.id === userId);
  if (!user) return null;

  const { password: _password, ...safeUser } = user;
  return safeUser as User;
}
