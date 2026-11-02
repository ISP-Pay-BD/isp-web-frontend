import { test, expect } from '@playwright/test';
import { loginAs, EMPLOYEE_SESSION } from './helpers/auth';

test.describe('Employee Portal End-to-End Journeys', () => {
  test.beforeEach(async ({ context, page }) => {
    await loginAs(context, page, EMPLOYEE_SESSION);
  });

  test('loads employee portal with shell, attendance, and job dispatch routes', async ({ page }) => {
    await page.goto('/employee/attendance');

    // Header & shell should be visible
    await expect(page.locator('header')).toBeVisible();

    // Verify employee identity is rendered in header or sidebar
    const profileBtn = page.getByText(/Field Technician Employee/i).first();
    await expect(profileBtn).toBeVisible();

    // Verify attendance and employee navigation links
    await expect(page.getByRole('link', { name: 'Attendance' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Work Orders' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Installations' })).toBeVisible();
    await expect(page.locator('main')).toBeVisible();
  });

  test('navigates to employee profile and verifies profile information', async ({ page }) => {
    await page.goto('/employee/profile');

    // Profile page should show employee details
    await expect(page.getByText('technician@isppaybd.com').first()).toBeVisible();
  });

  test('enforces role isolation: employee is blocked from admin portal', async ({ page }) => {
    const response = await page.goto('/admin/dashboard');

    // Either redirected to /403 or renders 403 Forbidden content
    const url = page.url();
    const is403Page = url.includes('/403') || (await page.locator('text=/403|Forbidden|Access Denied/i').count()) > 0;
    expect(is403Page || response?.status() === 403).toBeTruthy();
  });
});
