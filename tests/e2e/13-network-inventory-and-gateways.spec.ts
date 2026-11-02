import { test, expect } from '@playwright/test';
import { loginAs, ADMIN_SESSION } from './helpers/auth';

test.describe('Admin Network, Inventory & Gateways Journeys', () => {
  test.beforeEach(async ({ context, page }) => {
    await loginAs(context, page, ADMIN_SESSION);
  });

  test('navigates to routers management and verifies routers portal shell', async ({ page }) => {
    await page.goto('/admin/routers');

    await expect(page.locator('header')).toBeVisible();
    await expect(page.locator('main')).toBeVisible();

    const routerHeader = page.getByText(/routers|রাউটার/i).first();
    await expect(routerHeader).toBeVisible();
  });

  test('navigates to payment gateways configuration and verifies gateway controls', async ({ page }) => {
    await page.goto('/admin/payment-gateways');

    await expect(page.locator('header')).toBeVisible();
    await expect(page.locator('main')).toBeVisible();

    const gatewayHeader = page.getByText(/gateways|পেমেন্ট গেটওয়ে/i).first();
    await expect(gatewayHeader).toBeVisible();
  });

  test('navigates to inventory stock and checks inventory overview', async ({ page }) => {
    await page.goto('/admin/inventory/stock');

    await expect(page.locator('header')).toBeVisible();
    await expect(page.locator('main')).toBeVisible();

    const inventoryHeader = page.getByText(/inventory|stock|মজুদ/i).first();
    await expect(inventoryHeader).toBeVisible();
  });
});
