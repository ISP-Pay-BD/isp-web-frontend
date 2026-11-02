import { test, expect } from '@playwright/test';
import { loginAs, CUSTOMER_SESSION } from './helpers/auth';

test.describe('Authentication & Access Control Gate', () => {
  test('unauthenticated access to /admin/dashboard redirects to /login', async ({ page }) => {
    await page.goto('/admin/dashboard');

    await expect(page).toHaveURL(/\/login\?redirect=%2Fadmin%2Fdashboard/);
  });

  test('unauthenticated access to /customer/dashboard redirects to /login', async ({ page }) => {
    await page.goto('/customer/dashboard');

    await expect(page).toHaveURL(/\/login\?redirect=%2Fcustomer%2Fdashboard/);
  });

  test('unauthenticated access to /platform/dashboard redirects to /login', async ({ page }) => {
    await page.goto('/platform/dashboard');

    await expect(page).toHaveURL(/\/login\?redirect=%2Fplatform%2Fdashboard/);
  });

  test('customer role is blocked from admin portal with 403', async ({ context, page }) => {
    // Authenticate as a normal customer
    await loginAs(context, page, CUSTOMER_SESSION);

    // Try navigating to admin dashboard
    await page.goto('/admin/dashboard');

    // Proxy must intercept and redirect to /403
    await expect(page).toHaveURL(/\/403/);
    const body = page.locator('body');
    await expect(body).toContainText(/403|forbidden|unauthorized|access denied/i);
  });
});
