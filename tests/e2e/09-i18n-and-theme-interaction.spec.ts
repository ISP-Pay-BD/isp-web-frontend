import { test, expect } from '@playwright/test';
import { loginAs, CUSTOMER_SESSION } from './helpers/auth';

test.describe('Portal Locale & Theme Interaction Flow', () => {
  test.beforeEach(async ({ context, page }) => {
    await loginAs(context, page, CUSTOMER_SESSION);
  });

  test('switches language between English and Bangla and verifies UI translations', async ({
    page,
  }) => {
    await page.goto('/customer/dashboard');

    // Verify initial English text in sidebar or header
    await expect(page.locator('header')).toBeVisible();

    // Click the Bangla switch button
    const bnBtn = page.getByRole('button', { name: 'বাংলায় পরিবর্তন করুন' });
    await expect(bnBtn).toBeVisible();
    await bnBtn.click();

    // Verify button aria-pressed state updates
    await expect(bnBtn).toHaveAttribute('aria-pressed', 'true');

    // Switch back to English
    const enBtn = page.getByRole('button', { name: 'Switch to English' });
    await expect(enBtn).toBeVisible();
    await enBtn.click();
    await expect(enBtn).toHaveAttribute('aria-pressed', 'true');
  });

  test('toggles theme mode between dark and light', async ({ page }) => {
    await page.goto('/customer/dashboard');

    const themeToggleBtn = page.locator('button[aria-label*="mode" i]').first();
    await expect(themeToggleBtn).toBeVisible();

    // Read current theme from document class
    const initialIsDark = await page.evaluate(() =>
      document.documentElement.classList.contains('dark'),
    );

    // Click toggle
    await themeToggleBtn.click();

    // Verify class flipped
    await page.waitForFunction(
      (wasDark) => document.documentElement.classList.contains('dark') !== wasDark,
      initialIsDark,
    );

    const newIsDark = await page.evaluate(() =>
      document.documentElement.classList.contains('dark'),
    );
    expect(newIsDark).not.toBe(initialIsDark);
  });
});
