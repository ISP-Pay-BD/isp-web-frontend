import { test, expect } from '@playwright/test';

const pagesToTest = [
  '/admin/customers',
  '/admin/areas',
  '/admin/packages',
  '/admin/billing',
  '/admin/invoices',
  '/admin/payments',
  '/admin/routers',
  '/admin/hr',
  '/admin/support',
  '/admin/bandwidth',
  '/admin/collections',
  '/admin/settings',
];

test('audit admin pages for errors and data loading', async ({ page }) => {
  // Listen for all failed responses
  const failures: { url: string; status: number; method: string }[] = [];
  page.on('response', (response) => {
    if (response.url().includes(':8080/api/v1') && response.status() >= 400) {
      failures.push({
        url: response.url(),
        status: response.status(),
        method: response.request().method(),
      });
    }
  });

  // 1. Login as Admin
  await page.goto('/login');
  const card = page.locator('button', { hasText: 'parvezrahman9696@gmail.com' });
  await expect(card).toBeVisible({ timeout: 10000 });
  await card.click();
  await page.waitForURL('**/admin/**', { timeout: 15000 });

  // 2. Visit each page
  for (const path of pagesToTest) {
    failures.length = 0;
    console.log(`\nTesting page: ${path}`);
    await page.goto(path);
    await page.waitForTimeout(2000);

    // Check for visible error banners/cards
    const errorBanners = await page.locator('text=Failed to load').allTextContents();
    const serverErrors = await page.locator('text=Internal server error').allTextContents();
    const recordNotFound = await page.locator('text=The requested record was not found').allTextContents();

    console.log(`Page: ${path} | API Failures: ${failures.length} | Errors on page: ${errorBanners.length + serverErrors.length + recordNotFound.length}`);
    if (failures.length > 0) {
      for (const f of failures) {
        console.log(`  -> [${f.status}] ${f.method} ${f.url}`);
      }
    }
    if (errorBanners.length > 0) console.log(`  -> UI Error: ${errorBanners.join('; ')}`);
    if (serverErrors.length > 0) console.log(`  -> Server Error: ${serverErrors.join('; ')}`);
    if (recordNotFound.length > 0) console.log(`  -> Not Found: ${recordNotFound.join('; ')}`);
  }
});
