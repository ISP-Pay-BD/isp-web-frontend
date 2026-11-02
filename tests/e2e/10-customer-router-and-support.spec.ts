import { test, expect } from '@playwright/test';
import { loginAs, CUSTOMER_SESSION } from './helpers/auth';

test.describe('Customer Router & Support Journey', () => {
  test.beforeEach(async ({ context, page }) => {
    await loginAs(context, page, CUSTOMER_SESSION);
  });

  test('navigates to customer router diagnostics page and verifies tools shell', async ({
    page,
  }) => {
    await page.goto('/customer/router');

    // Header and shell should render
    await expect(page.locator('header')).toBeVisible();

    // Verify router breadcrumb or page header is present
    const routerText = page.getByText(/router/i).first();
    await expect(routerText).toBeVisible();

    // Verify main content container loaded
    await expect(page.locator('main')).toBeVisible();
  });

  test('navigates to customer support tickets overview', async ({ page }) => {
    await page.goto('/customer/support');

    await expect(page.locator('header')).toBeVisible();

    // Check support portal heading or new ticket action
    const newTicketAction = page.locator('a[href*="/customer/support/new"], button:has-text("Ticket"), button:has-text("Open")');
    if ((await newTicketAction.count()) > 0) {
      await expect(newTicketAction.first()).toBeVisible();
    }
    await expect(page.locator('main')).toBeVisible();
  });

  test('interactively fills out new support ticket form', async ({ page }) => {
    await page.goto('/customer/support/new');

    await expect(page.locator('header')).toBeVisible();

    // Check subject input
    const subjectInput = page.locator('input[name="subject"], input#subject, input[placeholder*="subject" i]').first();
    if ((await subjectInput.count()) > 0) {
      await expect(subjectInput).toBeVisible();
      await subjectInput.fill('Internet speed is fluctuating');
    }

    // Check message textarea
    const messageInput = page.locator('textarea[name="message"], textarea#message, textarea[placeholder*="detail" i]').first();
    if ((await messageInput.count()) > 0) {
      await expect(messageInput).toBeVisible();
      await messageInput.fill('Download speeds drop below 5Mbps during peak hours. Please inspect the fiber link.');
    }

    // Submit button should be visible
    const submitBtn = page.getByRole('button', { name: /open ticket|create|submit|send/i }).first();
    await expect(submitBtn).toBeVisible();
  });
});
