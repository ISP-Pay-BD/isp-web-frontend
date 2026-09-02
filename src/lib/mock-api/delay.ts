export const MOCK_DELAY_MS = 200;

export async function mockDelay(ms = MOCK_DELAY_MS): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, ms));
}
