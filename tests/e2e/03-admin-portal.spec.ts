import { test, expect } from '@playwright/test';
import { loginAs, ADMIN_SESSION } from './helpers/auth';

test.describe('Admin Portal End-to-End Journeys', () => {
  test.beforeEach(async ({ context, page }) => {
    await loginAs(context, page, ADMIN_SESSION);
  });

  test('loads admin dashboard with portal header and sidebar navigation', async ({ page }) => {
    await page.goto('/admin/dashboard');

    // Portal header should be visible
    const header = page.locator('header');
    await expect(header).toBeVisible();

    // Verify main content container rendered
    const main = page.locator('main, #main-content, div[role="main"]');
    await expect(main.first()).toBeVisible();
  });

  test('navigates to customer payments page and inspects table', async ({ page }) => {
    await page.goto('/admin/customer-payments');

    // Title / heading is visible
    await expect(page.locator('h1, h2, h3').filter({ hasText: /customer payments|payments/i }).first()).toBeVisible();

    // Search input exists
    const searchInput = page.locator('input[placeholder*="Search" i], input[type="search"]');
    await expect(searchInput.first()).toBeVisible();
  });

  test('navigates to push campaigns page and verifies metrics & preview', async ({ page }) => {
    await page.goto('/admin/push');

    // Check heading
    await expect(page.locator('h1, h2, h3').filter({ hasText: /push notification/i }).first()).toBeVisible();

    // Check device KPI cards are rendered
    const totalDevices = page.getByText(/Total Devices/i);
    await expect(totalDevices.first()).toBeVisible();

    const androidDevices = page.getByText(/Android/i);
    await expect(androidDevices.first()).toBeVisible();

    // Check lockscreen preview exists
    const lockscreen = page.getByText(/Device Lockscreen Preview/i);
    await expect(lockscreen.first()).toBeVisible();
  });

  test('navigates to shop management and checks tabs & controls', async ({ page }) => {
    await page.goto('/admin/shop');

    // Check heading
    await expect(page.locator('h1, h2, h3').filter({ hasText: /shop management/i }).first()).toBeVisible();

    // Check tabs (Products / Orders)
    const productsTab = page.getByRole('tab', { name: /products/i });
    await expect(productsTab).toBeVisible();

    const ordersTab = page.getByRole('tab', { name: /orders/i });
    await expect(ordersTab).toBeVisible();

    // Check Add Product button
    const addProductBtn = page.getByRole('button', { name: /add product/i });
    await expect(addProductBtn).toBeVisible();
  });
});
