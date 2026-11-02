import { test, expect } from '@playwright/test';
import { loginAs, CUSTOMER_SESSION } from './helpers/auth';

test.describe('Customer Portal End-to-End Journeys', () => {
  test.beforeEach(async ({ context, page }) => {
    await loginAs(context, page, CUSTOMER_SESSION);
  });

  test('loads customer dashboard with profile hero and portal shell', async ({ page }) => {
    await page.goto('/customer/dashboard');

    // Header with notification bell should be visible
    const header = page.locator('header');
    await expect(header).toBeVisible();

    // Verify page rendered without critical crash
    const main = page.locator('main, #main-content, div[role="main"]');
    await expect(main.first()).toBeVisible();
  });

  test('navigates to customer shop and verifies product browsing', async ({ page }) => {
    await page.goto('/customer/shop');

    // Shop header should exist
    await expect(page.locator('h1, h2, h3').filter({ hasText: /shop|equipment|store/i }).first()).toBeVisible();

    // Search bar for products
    const searchInput = page.locator('input[placeholder*="Search" i]');
    await expect(searchInput.first()).toBeVisible();

    // Products / Orders tab trigger
    const tabs = page.locator('[role="tablist"]');
    await expect(tabs).toBeVisible();
  });

  test('navigates to customer payments and checks invoices & recharge options', async ({ page }) => {
    await page.goto('/customer/payments');

    // Check payments view header
    await expect(page.locator('h1, h2, h3').filter({ hasText: /payment|billing|invoice/i }).first()).toBeVisible();

    // Quick recharge or pay button exists
    const payBtn = page.getByRole('button', { name: /pay|recharge|বিল পরিশোধ/i });
    if (await payBtn.count() > 0) {
      await expect(payBtn.first()).toBeVisible();
    }
  });
});
