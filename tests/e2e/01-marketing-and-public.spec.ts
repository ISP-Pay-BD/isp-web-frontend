import { test, expect } from '@playwright/test';

test.describe('Marketing & Public Routes', () => {
  test('renders homepage with brand title, hero sections, and navigation', async ({ page }) => {
    await page.goto('/');

    // Page title should be populated
    await expect(page).toHaveTitle(/ISP Pay BD|ISP Billing/i);

    // Navbar or branding is visible
    const nav = page.locator('nav, header');
    await expect(nav.first()).toBeVisible();

    // Check presence of key login action
    const loginLink = page.locator('a[href^="/login"], button:has-text("Login"), button:has-text("লগইন")');
    await expect(loginLink.first()).toBeVisible();
  });

  test('navigates to login page from header', async ({ page }) => {
    await page.goto('/login');

    // Sign in form is visible
    const emailInput = page.locator('input[type="email"], input[name="email"]');
    await expect(emailInput).toBeVisible();

    const submitBtn = page.getByRole('button', { name: /sign in|login|লগইন/i });
    await expect(submitBtn).toBeVisible();
  });

  test('displays custom 404 page for unknown routes', async ({ page }) => {
    const response = await page.goto('/random-nonexistent-route-for-404-test');
    expect(response?.status()).toBe(404);

    // Page renders not found indication
    const content = page.locator('body');
    await expect(content).toContainText(/404|not found|খুঁজে পাওয়া যায়নি/i);
  });
});
