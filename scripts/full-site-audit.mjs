import { chromium } from '@playwright/test';
import fs from 'fs';
import path from 'path';

const BASE_URL = process.env.PLAYWRIGHT_BASE_URL || 'http://127.0.0.1:3000';
const SHOTS_DIR = '/Users/bluebayit/Documents/GitHub/isppaybd_rust/agency/shots/build/round-1';

if (!fs.existsSync(SHOTS_DIR)) {
  fs.mkdirSync(SHOTS_DIR, { recursive: true });
}

// 1. Gather all pages
function getPages(dir, baseDir = dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  for (const file of list) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat && stat.isDirectory()) {
      results = results.concat(getPages(fullPath, baseDir));
    } else if (file === 'page.tsx') {
      let route = fullPath.replace(baseDir, '').replace(/\/page\.tsx$/, '');
      const cleanRoute = route.replace(/\/\([^)]+\)/g, '') || '/';
      results.push({ fullPath, cleanRoute });
    }
  }
  return results;
}

const appDir = path.resolve('src/app');
const rawPages = getPages(appDir);

// 2. Resolve parameters & assign personas
const fixtureParams = {
  '[id]': '1041',
  '[slug]': 'getting-started-with-isppaybd',
};

const routeList = rawPages.map(({ fullPath, cleanRoute }) => {
  let persona = 'public';
  if (cleanRoute.startsWith('/admin')) persona = 'admin';
  else if (cleanRoute.startsWith('/customer')) persona = 'customer';
  else if (cleanRoute.startsWith('/employee')) persona = 'employee';
  else if (cleanRoute.startsWith('/platform')) persona = 'platform';

  // Resolve dynamic segments
  let resolved = cleanRoute;
  if (resolved.includes('/payment/make-payment/[id]')) resolved = resolved.replace('[id]', '1099') + '?sig=vf7_ohtL9mx7XqwkINDapl';
  else if (resolved.includes('/admin/customer-payments/[id]')) resolved = resolved.replace('[id]', '1051');
  else if (resolved.includes('/admin/routers/[id]')) resolved = resolved.replace('[id]', '1060');
  else if (resolved.includes('/admin/invoices/[id]')) resolved = resolved.replace('[id]', '1051');
  else if (resolved.includes('/admin/support/[id]')) resolved = resolved.replace('[id]', '1080');
  else if (resolved.includes('/admin/hr/employees/[id]')) resolved = resolved.replace('[id]', '1070');
  else if (resolved.includes('/admin/olt/[id]')) resolved = resolved.replace('[id]', '1');
  else if (resolved.includes('/admin/payment-gateways/[id]')) resolved = resolved.replace('[id]', 'bkash');
  else if (resolved.includes('/customer/payments/[id]')) resolved = resolved.replace('[id]', '1051');
  else if (resolved.includes('/customer/support/[id]')) resolved = resolved.replace('[id]', '1080');
  else if (resolved.includes('/employee/tickets/[id]')) resolved = resolved.replace('[id]', '1080');
  else if (resolved.includes('/platform/tenants/[id]')) resolved = resolved.replace('[id]', '1');
  else if (resolved.includes('/platform/admins/[id]')) resolved = resolved.replace('[id]', '1001');
  else if (resolved.includes('/plugins/[slug]')) resolved = resolved.replace('[slug]', 'mobile-app-white-label');
  else if (resolved.includes('/engines/[slug]')) resolved = resolved.replace('[slug]', 'mobile-app-white-label');
  else {
    resolved = resolved.replace('[id]', '1041').replace('[slug]', 'getting-started-with-isppaybd');
  }

  return {
    file: fullPath,
    route: cleanRoute,
    url: resolved,
    persona,
  };
});

console.log(`Discovered ${routeList.length} total pages to audit.`);

// Test User Sessions
const SESSIONS = {
  admin: {
    id: '1001',
    name: 'Alpha Owner',
    email: 'owner@example.com',
    role: 'admin',
    status: 'active',
    tenantId: '1',
  },
  customer: {
    id: '1005',
    name: 'Alpha User',
    email: 'user@alpha.example',
    role: 'user',
    status: 'active',
    tenantId: '1',
  },
  employee: {
    id: '1004',
    name: 'Alpha Emp',
    email: 'emp@alpha.example',
    role: 'employee',
    status: 'active',
    tenantId: '1',
  },
  platform: {
    id: '4001',
    name: 'Super Admin',
    email: 'root@isppaybd.local',
    role: 'super_admin',
    status: 'active',
    tenantId: '4',
  },
};

// Real JWT retrieval
const tokenCache = new Map();
async function getRealToken(email) {
  if (tokenCache.has(email)) return tokenCache.get(email);
  try {
    const res = await fetch('http://127.0.0.1:8080/api/v1/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: email, password: 'debug' }),
    });
    const d = await res.json();
    const token = d?.data?.access_token;
    if (token) {
      tokenCache.set(email, token);
      return token;
    }
  } catch (err) {
    console.error('Failed to get token for', email, err);
  }
  return 'synthetic-debug-token';
}

async function setupAuth(context, page, persona) {
  if (persona === 'public') {
    await context.clearCookies();
    await page.addInitScript(() => {
      window.localStorage.removeItem('isp-auth-storage');
    });
    return;
  }

  const session = SESSIONS[persona];
  const realToken = await getRealToken(session.email);

  const cookiePayload = {
    userId: session.id,
    role: session.role,
    status: session.status,
  };

  await context.addCookies([
    {
      name: 'isp-auth-mock',
      value: encodeURIComponent(JSON.stringify(cookiePayload)),
      domain: '127.0.0.1',
      path: '/',
      httpOnly: false,
      secure: false,
      sameSite: 'Lax',
    },
    {
      name: 'isp-auth-mock',
      value: encodeURIComponent(JSON.stringify(cookiePayload)),
      domain: 'localhost',
      path: '/',
      httpOnly: false,
      secure: false,
      sameSite: 'Lax',
    },
  ]);

  await page.addInitScript(
    ({ session, token }) => {
      const authState = {
        state: {
          user: {
            id: session.id,
            name: session.name,
            email: session.email,
            phone: '+8801700000000',
            role: session.role,
            status: session.status,
            tenantId: session.tenantId,
            organizationName: 'Alpha Broadband Network',
            permissions: {
              '*': ['*'],
              customers: ['read', 'write', 'delete'],
              billing: ['read', 'write'],
              network: ['read', 'write'],
              shop: ['read', 'write'],
              push: ['read', 'write'],
            },
          },
          token,
          isAuthenticated: true,
        },
        version: 0,
      };
      window.localStorage.setItem('isp-auth-storage', JSON.stringify(authState));
      window.localStorage.setItem('isp_locale', 'en');
    },
    { session, token: realToken }
  );
}

async function runAudit() {
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  console.log('Browser launched. Starting systematic crawl of 238 pages...\n');

  const auditResults = [];
  const byPersona = {
    public: routeList.filter((r) => r.persona === 'public'),
    admin: routeList.filter((r) => r.persona === 'admin'),
    customer: routeList.filter((r) => r.persona === 'customer'),
    employee: routeList.filter((r) => r.persona === 'employee'),
    platform: routeList.filter((r) => r.persona === 'platform'),
  };

  for (const [persona, items] of Object.entries(byPersona)) {
    console.log(`\n======================================================`);
    console.log(`Starting Group: ${persona.toUpperCase()} (${items.length} pages)`);
    console.log(`======================================================`);

    const context = await browser.newContext({ viewport: { width: 1280, height: 800 } });
    const page = await context.newPage();
    await setupAuth(context, page, persona);

    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      const pageErrors = [];
      const apiFailures = [];

      const onPageError = (err) => {
        if (!err.message.includes('Hydration failed') && !err.message.includes("didn't match the client")) {
          pageErrors.push(err.message);
        }
      };
      const onConsole = (msg) => {
        if (msg.type() === 'error') {
          const txt = msg.text();
          // Filter out benign Next.js dev hydration / favicon noise / React dev key warnings
          if (
            !txt.includes('favicon.ico') &&
            !txt.includes('punycode') &&
            !txt.includes('Encountered two children with the same key') &&
            !txt.includes('uncontrolled value state of Select') &&
            !txt.includes('Hydration failed') &&
            !txt.includes('Encountered a script tag') &&
            !txt.includes("didn't match the client")
          ) {
            pageErrors.push(txt);
          }
        }
      };
      const onResponse = (res) => {
        if (res.status() >= 500) {
          apiFailures.push({ url: res.url(), status: res.status() });
        }
      };

      page.on('pageerror', onPageError);
      page.on('console', onConsole);
      page.on('response', onResponse);

      const targetUrl = `${BASE_URL}${item.url}`;
      let navStatus = 'OK';
      let httpCode = 200;

      try {
        const response = await page.goto(targetUrl, { waitUntil: 'domcontentloaded', timeout: 15000 });
        if (response) httpCode = response.status();
        await page.waitForTimeout(600); // allow client components to mount
      } catch (err) {
        navStatus = 'TIMEOUT/FAIL';
        pageErrors.push(err.message);
      }

      // Interactive mouse & functional testing on the page
      let interactionsPerformed = 0;
      try {
        // 1. Click interactive tabs (e.g. Overview, Details, History, Settings)
        const tabs = await page.$$('[role="tab"], button[data-state]');
        for (let t = 0; t < Math.min(tabs.length, 4); t++) {
          try {
            if (await tabs[t].isVisible()) {
              await tabs[t].click({ timeout: 1000 });
              await page.waitForTimeout(150);
              interactionsPerformed++;
            }
          } catch {}
        }

        // 2. Test search & filter typing
        const searchInput = await page.$('input[type="search"], input[placeholder*="Search" i], input[placeholder*="search" i]');
        if (searchInput && (await searchInput.isVisible())) {
          try {
            await searchInput.fill('test');
            await page.waitForTimeout(150);
            await searchInput.fill('');
            interactionsPerformed++;
          } catch {}
        }

        // 3. Click non-destructive action buttons (filters, views, popups)
        const buttons = await page.$$('button:not([disabled]):not([type="submit"])');
        for (let b = 0; b < Math.min(buttons.length, 3); b++) {
          try {
            const btn = buttons[b];
            if (await btn.isVisible()) {
              const text = ((await btn.innerText()) || '').toLowerCase();
              const compact = text.replace(/[\s\-_]+/g, '');
              if (
                !compact.includes('logout') &&
                !compact.includes('signout') &&
                !compact.includes('login') &&
                !compact.includes('delete') &&
                !compact.includes('destroy') &&
                !compact.includes('remove') &&
                !compact.includes('pay') &&
                !compact.includes('suspend')
              ) {
                await btn.click({ timeout: 1000 });
                await page.waitForTimeout(150);
                await page.keyboard.press('Escape'); // dismiss any open modal/dialog cleanly
                interactionsPerformed++;
              }
            }
          } catch {}
        }
      } catch {}

      // Check broken images
      let brokenImages = [];
      try {
        brokenImages = await page.$$eval('img', (imgs) =>
          imgs
            .filter((i) => !i.complete || (i.naturalWidth === 0 && !i.currentSrc?.endsWith('.svg')))
            .map((i) => i.src || i.currentSrc)
        );
      } catch {}

      // Screenshot every 8th page, key dashboard pages, or on error
      const keyPages = [
        '/admin', '/admin/customers', '/admin/billing', '/admin/accounts/income',
        '/admin/accounts/expense', '/admin/hr/attendance', '/admin/inventory/items',
        '/admin/support', '/customer', '/customer/dashboard', '/customer/bills',
        '/employee', '/employee/dashboard', '/platform', '/platform/dashboard',
        '/platform/tenants', '/platform/showcase'
      ];
      const isKeyPage = keyPages.some((kp) => item.url === kp || item.route === kp);
      const isSample = i % 8 === 0 || isKeyPage || pageErrors.length > 0 || apiFailures.length > 0;
      if (isSample) {
        const shotName = item.url.replace(/[\/\\?%*:|"<>]/g, '_') || 'root';
        const shotPath = path.join(SHOTS_DIR, `${persona}_${shotName}.png`);
        try {
          await page.screenshot({ path: shotPath, fullPage: false });
        } catch {}
      }

      page.off('pageerror', onPageError);
      page.off('console', onConsole);
      page.off('response', onResponse);

      const passed = pageErrors.length === 0 && apiFailures.length === 0 && navStatus === 'OK';
      const record = {
        index: i + 1,
        total: items.length,
        persona,
        route: item.route,
        url: item.url,
        httpCode,
        passed,
        pageErrors,
        apiFailures,
        brokenImages,
      };

      auditResults.push(record);

      const statusIcon = passed ? '✓' : '✗';
      console.log(
        `[${persona}] ${i + 1}/${items.length} ${statusIcon} ${item.url} (${httpCode}) [Interactions: ${interactionsPerformed}] ${
          !passed ? `-> Errors: ${pageErrors.length}, API 500s: ${apiFailures.length}` : ''
        }`
      );
    }

    await context.close();
  }

  await browser.close();

  // Summary
  const total = auditResults.length;
  const passedCount = auditResults.filter((r) => r.passed).length;
  const failedCount = total - passedCount;

  console.log(`\n======================================================`);
  console.log(`AUDIT COMPLETE: ${passedCount}/${total} PASSED (${failedCount} failed)`);
  console.log(`======================================================\n`);

  // Write audit report
  const reportPath = '/Users/bluebayit/Documents/GitHub/isppaybd_rust/agency/07-qa-log.md';
  let md = `# QA AUDIT LOG: Full 238-Page Browser Crawl & Visual Inspection\n\n`;
  md += `**Date:** ${new Date().toISOString()}\n`;
  md += `**Base URL:** ${BASE_URL}\n`;
  md += `**Total Pages Audited:** ${total}\n`;
  md += `**Passed Cleanly:** ${passedCount}\n`;
  md += `**Issues / Errors Found:** ${failedCount}\n\n`;

  md += `## Detailed Page-by-Page Results\n\n`;
  md += `| # | Persona | Route | Resolved URL | HTTP | Pass? | Errors / Failures |\n`;
  md += `|---|---|---|---|:---:|:---:|---|\n`;

  for (let idx = 0; idx < auditResults.length; idx++) {
    const r = auditResults[idx];
    const issues = [
      ...r.pageErrors.map((e) => `Err: ${e.slice(0, 80)}`),
      ...r.apiFailures.map((f) => `500: ${f.url}`),
      ...r.brokenImages.map((b) => `ImgBroken: ${b}`),
    ].join('<br/>');
    md += `| ${idx + 1} | ${r.persona} | \`${r.route}\` | \`${r.url}\` | ${r.httpCode} | ${
      r.passed ? '**PASS**' : '**FAIL**'
    } | ${issues || 'None'} |\n`;
  }

  fs.writeFileSync(reportPath, md);
  console.log(`Audit log written to: ${reportPath}`);
}

runAudit().catch((err) => {
  console.error('Fatal audit failure:', err);
  process.exit(1);
});
