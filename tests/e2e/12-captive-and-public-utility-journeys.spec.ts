import { test, expect } from '@playwright/test';

test.describe('Captive Portal & Public Utilities Journeys', () => {
  test('captive portal renders connection identifier paywall', async ({ page }) => {
    await page.goto('/captive');

    // Page must render the captive surface
    await expect(page.locator('body')).toBeVisible();

    // Check for either the connection check or the not-found / disconnected status
    const captiveIndicator = page.getByText(/identify your connection|checking your connection|সংযোগ/i).first();
    await expect(captiveIndicator).toBeVisible();
  });

  test('public status page loads operational interface or fallback', async ({ page }) => {
    await page.goto('/status');

    await expect(page.locator('body')).toBeVisible();
    const statusText = page.getByText(/status|service|systems|operational/i).first();
    await expect(statusText).toBeVisible();
  });

  test('pricing page displays subscription tiers and call to action', async ({ page }) => {
    await page.goto('/pricing');

    await expect(page.locator('header, nav').first()).toBeVisible();
    const pricingHeading = page.getByText(/pricing|plan|প্যাকেজ/i).first();
    await expect(pricingHeading).toBeVisible();
  });

  test('forgot password flow renders email input and back-to-login navigation', async ({ page }) => {
    await page.goto('/forgot-password');

    const emailInput = page.locator('input[type="email"], input[name="email"]').first();
    await expect(emailInput).toBeVisible();

    // Back to login link
    const backToLogin = page.locator('a[href="/login"]').first();
    await expect(backToLogin).toBeVisible();

    await backToLogin.click();
    await expect(page).toHaveURL(/\/login/);
  });
});
