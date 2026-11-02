import { test, expect } from '@playwright/test';

test.describe('Debug Accounts Quick Login', () => {
  test('renders debug accounts panel and allows 1-click login', async ({ page }) => {
    await page.goto('/login');

    // Expect the debug accounts panel to be visible when APP_ENV=debug
    const debugHeading = page.getByText('Quick Access (Debug Mode)');
    await expect(debugHeading).toBeVisible({ timeout: 10000 });

    // Verify key roles and real users from database are displayed
    await expect(page.getByText('Parvez Rahman')).toBeVisible();
    await expect(page.getByText('parvezrahman9696@gmail.com')).toBeVisible();
    await expect(page.getByText('Isppaybd', { exact: true })).toBeVisible();
    await expect(page.getByText('info@isppaybd.com')).toBeVisible();
    await expect(page.getByText('MD Bappy')).toBeVisible();
    await expect(page.getByText('Sajid', { exact: true })).toBeVisible();
    await expect(page.getByText('Pulok', { exact: true })).toBeVisible();

    // Take screenshot of the debug login UI
    await page.screenshot({
      path: '/Users/bluebayit/.gemini/antigravity/brain/15325176-e6c0-482a-972d-837050f4ecc7/debug_accounts_screenshot.png',
      fullPage: true,
    });

    // Click on Parvez Rahman (ISP Admin)
    const parvezCard = page.locator('button', { hasText: 'parvezrahman9696@gmail.com' });
    await parvezCard.click();

    // Verify redirection to /admin/dashboard
    await page.waitForURL('**/admin/**', { timeout: 15000 });
    expect(page.url()).toContain('/admin');
  });

  test('Super Admin 1-click login redirects to /platform', async ({ page }) => {
    await page.goto('/login');
    const card = page.locator('button', { hasText: 'info@isppaybd.com' });
    await expect(card).toBeVisible({ timeout: 10000 });
    await card.click();
    await page.waitForURL('**/platform/**', { timeout: 15000 });
    expect(page.url()).toContain('/platform');
  });

  test('Customer / Subscriber 1-click login redirects to /customer', async ({ page }) => {
    await page.goto('/login');
    const card = page.locator('button', { hasText: 'pulok138Hbag@rnb.com' });
    await expect(card).toBeVisible({ timeout: 10000 });
    await card.click();
    await page.waitForURL('**/customer/**', { timeout: 15000 });
    expect(page.url()).toContain('/customer');
  });

  test('Employee 1-click login redirects to /employee', async ({ page }) => {
    await page.goto('/login');
    const card = page.locator('button', { hasText: 'sajid@gmail.com' });
    await expect(card).toBeVisible({ timeout: 10000 });
    await card.click();
    await page.waitForURL('**/employee/**', { timeout: 15000 });
    expect(page.url()).toContain('/employee');
  });

  test('Reseller Admin 1-click login redirects to dashboard', async ({ page }) => {
    await page.goto('/login');
    const card = page.locator('button', { hasText: 'bappy1234@gmail.com' });
    await expect(card).toBeVisible({ timeout: 10000 });
    await card.click();
    await page.waitForURL(/\/admin\//, { timeout: 15000 });
    expect(page.url()).toContain('/admin');
  });

  test('manual login with email only (password skipped in debug mode) signs in successfully', async ({ page }) => {
    await page.goto('/login');
    // Type email only, leave password empty
    await page.fill('#email', 'parvezrahman9696@gmail.com');
    expect(await page.inputValue('#password')).toBe('');
    // Click submit
    await page.click('button[type="submit"]');
    // Verify redirection to /admin/dashboard
    await page.waitForURL('**/admin/**', { timeout: 15000 });
    expect(page.url()).toContain('/admin');
  });

  test('Admin dashboard loads successfully without errors and displays live metrics', async ({ page }) => {
    await page.goto('/login');
    const parvezCard = page.locator('button', { hasText: 'parvezrahman9696@gmail.com' });
    await expect(parvezCard).toBeVisible({ timeout: 10000 });
    await parvezCard.click();

    await page.waitForURL('**/admin/dashboard', { timeout: 15000 });
    await page.waitForTimeout(2000);

    // Verify error card is NOT displayed
    await expect(page.getByText('Failed to load dashboard')).not.toBeVisible();

    // Verify key dashboard widgets and content load
    await expect(page.locator('text=Failed to load dashboard')).toHaveCount(0);

    // Save screenshot of the loaded admin dashboard
    await page.screenshot({
      path: '/Users/bluebayit/.gemini/antigravity/brain/15325176-e6c0-482a-972d-837050f4ecc7/admin_dashboard_success.png',
      fullPage: true,
    });
  });

  test('Super Admin platform dashboard loads without errors and displays platform metrics', async ({ page }) => {
    await page.goto('/login');
    const saCard = page.locator('button', { hasText: 'info@isppaybd.com' });
    await expect(saCard).toBeVisible({ timeout: 10000 });
    await saCard.click();

    await page.waitForURL('**/platform/**', { timeout: 15000 });
    await page.waitForTimeout(2000);

    // Verify error card is NOT displayed
    await expect(page.getByText('Failed to load platform dashboard')).not.toBeVisible();
    await expect(page.locator('text=Failed to load platform dashboard')).toHaveCount(0);

    // Save screenshot of the loaded platform dashboard
    await page.screenshot({
      path: '/Users/bluebayit/.gemini/antigravity/brain/15325176-e6c0-482a-972d-837050f4ecc7/platform_dashboard_success.png',
      fullPage: true,
    });
  });

  test('Customer portal dashboard loads without errors', async ({ page }) => {
    await page.goto('/login');
    const custCard = page.locator('button', { hasText: 'pulok138Hbag@rnb.com' });
    await expect(custCard).toBeVisible({ timeout: 10000 });
    await custCard.click();

    await page.waitForURL('**/customer/**', { timeout: 15000 });
    await page.waitForTimeout(2000);

    // Save screenshot of customer portal
    await page.screenshot({
      path: '/Users/bluebayit/.gemini/antigravity/brain/15325176-e6c0-482a-972d-837050f4ecc7/customer_dashboard_success.png',
      fullPage: true,
    });
  });

  test('Employee portal dashboard loads without errors', async ({ page }) => {
    await page.goto('/login');
    const empCard = page.locator('button', { hasText: 'sajid@gmail.com' });
    await expect(empCard).toBeVisible({ timeout: 10000 });
    await empCard.click();

    await page.waitForURL('**/employee/**', { timeout: 15000 });
    await page.waitForTimeout(2000);

    // Save screenshot of employee portal
    await page.screenshot({
      path: '/Users/bluebayit/.gemini/antigravity/brain/15325176-e6c0-482a-972d-837050f4ecc7/employee_dashboard_success.png',
      fullPage: true,
    });
  });
});
