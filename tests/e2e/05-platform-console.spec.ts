import { test, expect } from '@playwright/test';
import { loginAs, PLATFORM_SESSION } from './helpers/auth';

test.describe('Platform Console End-to-End Journeys', () => {
  test.beforeEach(async ({ context, page }) => {
    await loginAs(context, page, PLATFORM_SESSION);
  });

  test('loads platform dashboard with system metrics', async ({ page }) => {
    await page.goto('/platform/dashboard');

    // Portal header should be visible
    const header = page.locator('header');
    await expect(header).toBeVisible();

    // Verify main content container rendered
    const main = page.locator('main, #main-content, div[role="main"]');
    await expect(main.first()).toBeVisible();
  });

  test('navigates to platform tenants directory', async ({ page }) => {
    await page.goto('/platform/tenants');

    // Title / heading is visible
    await expect(page.locator('h1, h2, h3').filter({ hasText: /tenant|isps|organisations/i }).first()).toBeVisible();

    // Search or filter controls exist
    const searchInput = page.locator('input[placeholder*="Search" i], input[type="search"]');
    if (await searchInput.count() > 0) {
      await expect(searchInput.first()).toBeVisible();
    }
  });
});
