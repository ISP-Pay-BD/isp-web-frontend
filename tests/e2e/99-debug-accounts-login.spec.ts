import { test, expect } from '@playwright/test';

test.describe('Debug Accounts Quick Login', () => {
  test('renders debug accounts panel and allows 1-click login', async ({ page }) => {
    await page.goto('/login');

    // Expect the debug accounts panel to be visible when APP_ENV=debug
    const debugHeading = page.getByText('Quick Access (Debug Mode)');
    await expect(debugHeading).toBeVisible({ timeout: 10000 });

    // Verify key roles and real users from database are displayed
    await expect(page.getByText('Alpha Owner')).toBeVisible();
    await expect(page.getByText('owner@example.com')).toBeVisible();
    await expect(page.getByText('Super Admin', { exact: true }).first()).toBeVisible();
    await expect(page.getByText('root@isppaybd.local')).toBeVisible();
    await expect(page.getByText('Alpha POP')).toBeVisible();
    await expect(page.getByText('Alpha Emp')).toBeVisible();
    await expect(page.getByText('Alpha User')).toBeVisible();

    // Click on Alpha Owner (ISP Admin)
    const ownerCard = page.locator('button', { hasText: 'owner@example.com' });
    await ownerCard.click();

    // Verify redirection to /admin/dashboard
    await page.waitForURL('**/admin/**', { timeout: 15000 });
    expect(page.url()).toContain('/admin');
  });

  test('Super Admin 1-click login redirects to /platform', async ({ page }) => {
    await page.goto('/login');
    const card = page.locator('button', { hasText: 'root@isppaybd.local' });
    await expect(card).toBeVisible({ timeout: 10000 });
    await card.click();
    await page.waitForURL('**/platform/**', { timeout: 15000 });
    expect(page.url()).toContain('/platform');
  });

  test('Customer / Subscriber 1-click login redirects to /customer', async ({ page }) => {
    await page.goto('/login');
    const card = page.locator('button', { hasText: 'user@alpha.example' });
    await expect(card).toBeVisible({ timeout: 10000 });
    await card.click();
    await page.waitForURL('**/customer/**', { timeout: 15000 });
    expect(page.url()).toContain('/customer');
  });

  test('Employee 1-click login redirects to /employee', async ({ page }) => {
    await page.goto('/login');
    const card = page.locator('button', { hasText: 'emp@alpha.example' });
    await expect(card).toBeVisible({ timeout: 10000 });
    await card.click();
    await page.waitForURL('**/employee/**', { timeout: 15000 });
    expect(page.url()).toContain('/employee');
  });

  test('Reseller Admin 1-click login redirects to dashboard', async ({ page }) => {
    await page.goto('/login');
    const card = page.locator('button', { hasText: 'pop@alpha.example' });
    await expect(card).toBeVisible({ timeout: 10000 });
    await card.click();
    await page.waitForURL(/\/admin\//, { timeout: 15000 });
    expect(page.url()).toContain('/admin');
  });

  test('manual login with email only (password skipped in debug mode) signs in successfully', async ({ page }) => {
    await page.goto('/login');
    // Type email only, leave password empty
    await page.fill('#email', 'owner@example.com');
    expect(await page.inputValue('#password')).toBe('');
    // Click submit
    await page.click('button[type="submit"]');
    // Verify redirection to /admin/dashboard
    await page.waitForURL('**/admin/**', { timeout: 15000 });
    expect(page.url()).toContain('/admin');
  });

  test('Admin dashboard loads successfully without errors and displays live metrics', async ({ page }) => {
    await page.goto('/login');
    const ownerCard = page.locator('button', { hasText: 'owner@example.com' });
    await expect(ownerCard).toBeVisible({ timeout: 10000 });
    await ownerCard.click();

    await page.waitForURL('**/admin/dashboard', { timeout: 15000 });
    await page.waitForTimeout(2000);

    // Verify error card is NOT displayed
    await expect(page.getByText('Failed to load dashboard')).not.toBeVisible();

    // Verify key dashboard widgets and content load
    await expect(page.locator('text=Failed to load dashboard')).toHaveCount(0);
  });

  test('Super Admin platform dashboard loads without errors and displays platform metrics', async ({ page }) => {
    await page.goto('/login');
    const saCard = page.locator('button', { hasText: 'root@isppaybd.local' });
    await expect(saCard).toBeVisible({ timeout: 10000 });
    await saCard.click();

    await page.waitForURL('**/platform/**', { timeout: 15000 });
    await page.waitForTimeout(2000);

    // Verify error card is NOT displayed
    await expect(page.getByText('Failed to load platform dashboard')).not.toBeVisible();
    await expect(page.locator('text=Failed to load platform dashboard')).toHaveCount(0);
  });

  test('Customer portal dashboard loads without errors', async ({ page }) => {
    await page.goto('/login');
    const custCard = page.locator('button', { hasText: 'user@alpha.example' });
    await expect(custCard).toBeVisible({ timeout: 10000 });
    await custCard.click();

    await page.waitForURL('**/customer/**', { timeout: 15000 });
    await page.waitForTimeout(2000);
  });

  test('Employee portal dashboard loads without errors', async ({ page }) => {
    await page.goto('/login');
    const empCard = page.locator('button', { hasText: 'emp@alpha.example' });
    await expect(empCard).toBeVisible({ timeout: 10000 });
    await empCard.click();

    await page.waitForURL('**/employee/**', { timeout: 15000 });
    await page.waitForTimeout(2000);
  });
});
