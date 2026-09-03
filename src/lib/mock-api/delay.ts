import { MOCK_DELAY_MS as DEFAULT_DELAY } from '@/lib/constants';

export const MOCK_DELAY_MS = DEFAULT_DELAY;

export async function mockDelay(ms: number = MOCK_DELAY_MS): Promise<void> {
  // Ultra-responsive mock delay capped at 35ms so UI loads at lightning speed
  // while still giving a smooth, pleasant micro-skeleton shimmer
  const duration = Math.min(ms, 35);
  await new Promise((resolve) => setTimeout(resolve, duration));
}
