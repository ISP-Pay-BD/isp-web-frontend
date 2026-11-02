import { test, expect } from '@playwright/test';
import { loginAs, CUSTOMER_SESSION } from './helpers/auth';

test.describe('Customer Shop Interactive Order Placement Flow', () => {
  test.beforeEach(async ({ context, page }) => {
    // Intercept customer shop products query with synthetic catalog for isolated E2E flow
    await page.route('**/*customer/shop/products*', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: [
            {
              id: 1,
              admin_id: 1,
              title: 'Dual-Band Gigabit Wi-Fi 6 Router',
              description: 'High-speed 1800Mbps MU-MIMO Router for high-performance fiber.',
              price: 3850,
              original_price: 4500,
              category: 'routers',
              stock_status: 'in_stock',
              stock_quantity: 25,
              status: 'active',
            },
          ],
        }),
      });
    });

    // Intercept customer shop orders query
    await page.route('**/*customer/shop/orders*', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: [],
        }),
      });
    });

    await loginAs(context, page, CUSTOMER_SESSION);
  });

  test('interactively selects a product, customizes quantity, and validates order dialog', async ({
    page,
  }) => {
    await page.goto('/customer/shop');

    // Wait for product card to render
    const productTitle = page.getByText('Dual-Band Gigabit Wi-Fi 6 Router');
    await expect(productTitle.first()).toBeVisible({ timeout: 10000 });

    // Click "Order Now" button
    const orderBtn = page.getByRole('button', { name: /order now|buy|অর্ডার/i }).first();
    await expect(orderBtn).toBeVisible();
    await orderBtn.click();

    // Verify order modal dialog appears
    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();

    // Verify dialog title
    await expect(dialog.getByText(/order equipment/i)).toBeVisible();

    // Check quantity controls exist
    const quantityPlusBtn = dialog.locator('button:has-text("+")');
    if (await quantityPlusBtn.count() > 0) {
      await quantityPlusBtn.first().click();
    }

    // Fill in delivery address
    const addressInput = dialog.locator('#delivery-address');
    await expect(addressInput).toBeVisible();
    await addressInput.fill('House 42, Road 7, Dhanmondi, Dhaka');

    // Check Confirm button is present
    const confirmBtn = dialog.getByRole('button', { name: /confirm order/i });
    await expect(confirmBtn).toBeVisible();
  });
});
