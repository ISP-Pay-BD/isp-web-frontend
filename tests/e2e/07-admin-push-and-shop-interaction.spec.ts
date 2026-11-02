import { test, expect } from '@playwright/test';
import { loginAs, ADMIN_SESSION } from './helpers/auth';

test.describe('Admin Interactive Push Notification & Shop Flow', () => {
  test.beforeEach(async ({ context, page }) => {
    await loginAs(context, page, ADMIN_SESSION);
  });

  test('interactively types push notification and observes live lockscreen preview', async ({
    page,
  }) => {
    await page.goto('/admin/push');

    // Title input
    const titleInput = page.locator('input[placeholder*="Scheduled Network Maintenance" i], input[placeholder*="title" i]').first();
    await expect(titleInput).toBeVisible();
    await titleInput.fill('Fiber Maintenance Alert');

    // Body input
    const bodyInput = page.locator('textarea[placeholder*="Dear customer" i], textarea[placeholder*="maintenance" i]').first();
    await expect(bodyInput).toBeVisible();
    await bodyInput.fill('Routine fiber maintenance scheduled tonight from 2 AM to 4 AM.');

    // Verify lockscreen preview updates live with the typed title and message
    await expect(page.locator('h5', { hasText: 'Fiber Maintenance Alert' })).toBeVisible();
    await expect(page.locator('p', { hasText: 'Routine fiber maintenance scheduled tonight' })).toBeVisible();
  });

  test('interactively opens add product modal in shop management', async ({ page }) => {
    await page.goto('/admin/shop');

    // Click "+ Add Product" button
    const addBtn = page.getByRole('button', { name: /add product/i });
    await expect(addBtn).toBeVisible();
    await addBtn.click();

    // Verify modal dialog opens
    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();
    await expect(dialog.getByText(/add new product/i)).toBeVisible();

    // Check required form inputs exist
    const titleField = dialog.locator('input#product-title, input[placeholder*="title" i], input[placeholder*="Router" i]').first();
    await expect(titleField).toBeVisible();

    const priceField = dialog.locator('input#product-price, input[type="number"]').first();
    await expect(priceField).toBeVisible();

    // Close dialog
    const cancelBtn = dialog.getByRole('button', { name: /cancel/i });
    if (await cancelBtn.count() > 0) {
      await cancelBtn.click();
      await expect(dialog).toBeHidden();
    }
  });
});
