import { mockLogin, mockGetCurrentUser, type LoginPayload } from './handlers/auth.handler';
import { mockDelay } from './delay';

type HandlerMap = {
  'auth.login': (payload: LoginPayload) => ReturnType<typeof mockLogin>;
  'auth.me': (userId: string) => ReturnType<typeof mockGetCurrentUser>;
  'health.ping': () => Promise<{ ok: true; mode: 'mock' }>;
};

const handlers: HandlerMap = {
  'auth.login': mockLogin,
  'auth.me': mockGetCurrentUser,
  'health.ping': async () => {
    await mockDelay(50);
    return { ok: true as const, mode: 'mock' as const };
  },
};

export type MockHandlerKey = keyof HandlerMap;

export async function mockFetch<K extends MockHandlerKey>(
  key: K,
  ...args: Parameters<HandlerMap[K]>
): Promise<Awaited<ReturnType<HandlerMap[K]>>> {
  const handler = handlers[key];
  // @ts-expect-error — tuple spread for mock handler registry
  return handler(...args);
}
