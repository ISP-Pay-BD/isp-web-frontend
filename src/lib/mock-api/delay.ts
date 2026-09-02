import { MOCK_DELAY_MS as DEFAULT_DELAY } from '@/lib/constants';

export const MOCK_DELAY_MS = DEFAULT_DELAY;

export async function mockDelay(ms = MOCK_DELAY_MS): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, ms));
}
