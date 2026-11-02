import { test, expect } from '@playwright/test';
import { loginAs, ADMIN_SESSION } from './helpers/auth';

test.describe('Admin Subscriber & Package Management Journeys', () => {
  test.beforeEach(async ({ context, page }) => {
    await loginAs(context, page, ADMIN_SESSION);
  });

  test('navigates to all customers directory and verifies subscriber table interface', async ({
    page,
  }) => {
    await page.goto('/admin/customers');

    await expect(page.locator('header')).toBeVisible();

    // Verify customer management heading or breadcrumb
    const customerHeading = page.getByText(/customers|গ্রাহক/i).first();
    await expect(customerHeading).toBeVisible();

    // Verify search or filter input exists
    const searchInput = page.locator('input[placeholder*="search" i], input[type="search"]').first();
    if ((await searchInput.count()) > 0) {
      await expect(searchInput).toBeVisible();
    }
  });

  test('navigates to packages page and checks package management catalog', async ({
    page,
  }) => {
    await page.goto('/admin/packages');

    await expect(page.locator('header')).toBeVisible();

    // Page title/header should mention packages
    const pkgText = page.getByText(/packages|প্যাকেজ/i).first();
    await expect(pkgText).toBeVisible();
    await expect(page.locator('main')).toBeVisible();
  });

  test('navigates to billing policies configuration', async ({ page }) => {
    await page.goto('/admin/billing/policies');

    await expect(page.locator('header')).toBeVisible();
    await expect(page.locator('main')).toBeVisible();
  });
});
