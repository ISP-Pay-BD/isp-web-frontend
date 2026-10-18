# 01 — Shared fixes (S1–S8)

Each fix here is made once, in a shared component or as a mechanical pattern change. Each one lands on dozens of screens at once.

**Scope for the counts below:** `src/features/{admin,customer,platform,employee,shared}` + `src/components/{shared,layout}`, which is 289 `.tsx` files. Marketing is out of scope here; see [07-MOTION.md](07-MOTION.md) and the landing brief.

| ID | Fix | Size of problem | Effort |
|---|---|---|---|
| S1 | Text size floor (≥12px) | 885 uses in 166 files | M |
| S2 | One status colour map | 97 files hand-roll colours; 42 use `StatusBadge` | M |
| S3 | BD money format + one date path | `formatBdt` groups the western way; 169 bare `.toLocaleString()` | S–M |
| S4 | No `<Link><Button>` nesting | 82 places | S |
| S5 | Labels on icon-only buttons | 65 of 105 unlabelled | S |
| S6 | Navigation as real links | 12 `onClick={() => router.push(...)}` | S |
| S7 | Error boundary per portal | 0 portal-level `error.tsx` | S |
| S8 | Deep links whose params are ignored | 7 links, 2 target screens | S |

---

## S1 — Text size floor (≥12px)

**Problem.** `text-[9px]`, `text-[10px]` and `text-[11px]` appear **885 times in 166 files**. The shared primitives cause much of it, so every screen inherits the small text:

- [`src/components/ui/table.tsx:64`](../../src/components/ui/table.tsx#L64): every table header is 11px uppercase
- [`src/components/shared/StatusBadge.tsx:49`](../../src/components/shared/StatusBadge.tsx#L49): every status badge is 11px
- `PortalSidebar.tsx` (5), `PortalHeader.tsx` (5), `CustomerBottomNav.tsx:118` (tab labels)

The worst screens are `CustomerDetailPage` (24), `BillingPoliciesPage` (23), `AdminDashboardPage` (21), `RemindersPage` (19) and `HierarchyExplorer` (18).

**Why it matters.** Bangla conjuncts break up below about 12px. The admin brief already says body text is 14–16px, and `10-RESPONSIVE-AND-MOBILE.md` says table text is `text-xs` (12px) at minimum. Operators read these screens all day, often on cheap monitors or phones.

**Fix.**
1. Fix the primitives first: `table.tsx` header, `StatusBadge`, sidebar, header and bottom nav → `text-xs`.
2. Codemod the rest of the portal scope: `text-[9px]|text-[10px]|text-[11px]` → `text-xs`. Then look at each changed screen. Uppercase tracked labels may need `tracking-normal` once they are bigger.
3. Bangla bump, text only (no layout change). Tailwind v4 utilities read `var(--text-*)`, so add this to `globals.css`:
   ```css
   html:lang(bn) {
     --text-xs: 0.8125rem;  /* 13px */
     --text-sm: 0.9375rem;  /* 15px */
   }
   ```
   `LocaleProvider` already sets `<html lang>`. Check the built CSS to confirm `.text-xs` uses the variable.
4. **Ratchet:** add a test in `tests/architecture/` that fails if `text-\[(9|10|11)px\]` appears in the portal scope.

**Done when:** zero matches in the portal scope, the ratchet test passes, and a 390px screenshot of `/admin/customers`, `/admin/dashboard` and `/customer/dashboard` has no text under 12px.

---

## S2 — One status colour map

**Problem.** [`StatusBadge`](../../src/components/shared/StatusBadge.tsx) exists and has a dot plus a label, so colour is not the only signal. But only **42 files** use it. **97 files** hand-roll `bg-emerald-500/1x`, `bg-rose-500/1x`, `bg-amber-500/1x` and so on. The same status ends up in different colours on different screens, and new statuses have no fixed colour.

**Fix.**
1. Extend the `statusStyles` / `dotStyles` maps with every status the zapi adapters return. Missing today: `inactive`, `disabled`, `open`, `closed`, `failed`, `overdue`, `partial`, `refunded`, `draft`, `processing`. Get the full list from `src/lib/api/adapters`.
2. Add a `tone` prop (`success | warning | danger | neutral | info`) for badges that aren't a status word, so they don't hand-roll colours either.
3. Replace the hand-rolled badges. Not every `emerald-500/10` is a badge (some are icon tiles), so review each file instead of running a blind replace.

**Done when:** every status chip in the portals renders through `StatusBadge`, and "Expired" looks the same on customers, payments, hotspot and reports.

---

## S3 — BD money format (lakh/crore) + one date path

**Problem.**
- [`formatBdt`](../../src/lib/format/currency.ts) uses the `en-BD` locale, which groups the western way: `4,825,000`. Bangladeshi operators read lakh/crore: `48,25,000`.
  | Locale | Plain | Compact |
  |---|---|---|
  | `en-BD` (today) | 4,825,000 | 4.8M |
  | `en-IN` | 48,25,000 | 48L · 13Cr |
  | `bn-BD` | ৪৮,২৫,০০০ | ৪৮ লা |
- **169 bare `.toLocaleString()` calls in 67 files** format with the browser's locale, so the same amount looks different on different machines.
- The dashboard KPIs use `NumberFlow` with `notation: 'compact'` and no locale, which shows "৳4.8M" ([AdminDashboardPage.tsx:174](../../src/features/admin/dashboard/pages/AdminDashboardPage.tsx#L174)).
- Dates: `formatDate` / `formatDateTime` (`en-GB`, `Asia/Dhaka`) are correct. Five places bypass them with `toLocaleDateString` / `toLocaleTimeString` in the browser's time zone:
  `FreeRequestsPage.tsx:25`, `ReferralAnalyticsPage.tsx:22`, `AiChatPage.tsx:183`, `ProfilePage.tsx:136`, `WhatsAppInboxPage.tsx:43`.
- `DateDisplay` exists, but no screen uses it.

**Fix.**
1. `formatBdt`: change `'en-BD'` to `'en-IN'` (one line). Add `formatBdtCompact(amount)` with `notation: 'compact'` → `৳48L`.
2. Add `formatCount(n)` (`en-IN`) for non-money numbers such as customers and tickets.
3. `NumberFlow`: pass `locales="en-IN"`.
4. Replace `.toLocaleString()` on amounts with `formatBdt` / `CurrencyDisplay`, and on counts with `formatCount`.
5. Move the 5 raw date calls to `formatDate` / `formatDateTime` or `<DateDisplay>`.
6. Once [I1](06-BANGLA-I18N.md) lands, the formatters take the active locale (`bn-BD` gives Bengali digits). Whether Bengali digits are wanted in bn mode is a product call; the default is yes for the customer portal.

**Watch out:** check `tests/unit` for assertions on formatted strings before you change the locale.

**Done when:** no `.toLocaleString()` on money or counts in the portal scope, and the dashboard shows `৳48L`, not `৳4.8M`.

---

## S4 — No `<Link><Button>` nesting

**Problem.** There are **82 places** with `<Link><Button>…</Button></Link>`. That is a `<button>` inside an `<a>`. It's invalid HTML, keyboard users get two tab stops for one action, and screen readers announce it twice.

**Fix.** `Button` already supports Base UI's `render` prop, and three places use it correctly (for example [`not-found.tsx:16`](../../src/app/not-found.tsx#L16)):

```tsx
// before
<Link href="/admin/customers/new"><Button size="sm">Add customer</Button></Link>
// after
<Button size="sm" render={<Link href="/admin/customers/new" />}>Add customer</Button>
```

Codemod it, then **ratchet** with an architecture test (`/<Link\b[^>]*>\s*<Button\b/`).

**Done when:** zero matches, and each action is one tab stop.

---

## S5 — Labels on icon-only buttons

**Problem.** Of 105 `<Button size="icon">`, **65 have no `aria-label` or `title`**. A screen reader announces them as just "button". [`SidebarPinsPage`](../../src/features/admin/sidebar-pins/pages/SidebarPinsPage.tsx) ("Move up" / "Move down") shows the right way.

**Fix.** Give each one an `aria-label` that names the action and the thing it acts on, for example `aria-label="Edit customer"` or `aria-label="Delete package"`. Where sighted users also need the hint, add the existing Tooltip. **Ratchet** with a test that fails on an icon Button without `aria-label`.

---

## S6 — Navigation as real links

**Problem.** Twelve places navigate with `onClick={() => router.push(...)}` on a `<button>`, so middle-click, Ctrl+click and "open in new tab" don't work. Operators often open several customers in tabs.

| File | Lines |
|---|---|
| `admin/customers/pages/AllCustomersPage.tsx` | 844, 1016, 1023 |
| `admin/customers/pages/CustomerDetailPage.tsx` | 230, 236, 257, 776 |
| `admin/isp-ops/pages/InvoicesPage.tsx` | 184, 188 |
| `admin/inventory/pages/InventoryLocationsPage.tsx` | 103 |
| `admin/inventory/pages/InventoryCategoriesPage.tsx` | 196 |
| `admin/purchase/pages/VendorsPage.tsx` | 188 |

**Fix.** Use `<Link>`. If something looks like a button, use `<Button render={<Link …/>}>` (S4). For a row you can click anywhere on, keep the row `onClick` for mouse users, but make the primary cell (the name) a real `<Link>`.

---

## S7 — Error boundary per portal

**Problem.** The only error boundary is [`src/app/error.tsx`](../../src/app/error.tsx). When an admin screen throws, that boundary replaces everything under the root layout, **including the portal shell and sidebar**. The user is left with no navigation. On top of that, query errors on screens are drawn with `EmptyState` ([AdminDashboardPage.tsx:75-83](../../src/features/admin/dashboard/pages/AdminDashboardPage.tsx#L75-L83)), so an error looks like "nothing here".

**Fix.**
1. Add `error.tsx` to `src/app/(portal)/admin`, `customer`, `platform` and `employee`. It renders inside the shell: message, **Try again** (`reset()`), **Go to dashboard**, and the error `digest` in small mono text for support tickets.
2. Add an error variant to `EmptyState` (or a small `ErrorState`): warning icon, `role="alert"` and a retry button. Use it wherever a query has `isError`.

**Done when:** an error thrown on any portal screen keeps the sidebar and header on screen.

---

## S8 — Deep links whose query params are ignored

**Problem.** Some links put a filter or record in the query string, but the target screen never reads it:

| Link (source) | Target ignores | What the user sees |
|---|---|---|
| Dashboard KPI "Active customers" / "Payment due" → `/admin/customers?status=` ([AdminDashboardPage.tsx:143](../../src/features/admin/dashboard/pages/AdminDashboardPage.tsx#L143), [:185](../../src/features/admin/dashboard/pages/AdminDashboardPage.tsx#L185)) | `status` (filter is `useState('all')`, [AllCustomersPage.tsx:154](../../src/features/admin/customers/pages/AllCustomersPage.tsx#L154)) | **All** customers, not the due ones |
| "Collect payment" → `/admin/customer-payments/new?customerId=` (AllCustomersPage:1032, CustomerDetailPage:194, :735, ExpiredCustomersPage:370) | `customerId` (form starts empty, [NewCustomerPaymentPage.tsx:59](../../src/features/admin/customer-payments/pages/NewCustomerPaymentPage.tsx#L59)) | Has to search for the customer again, in the money flow |
| Hierarchy → `/admin/customers?resellerId=` ([HierarchyExplorer.tsx:379](../../src/features/shared/hierarchy/components/HierarchyExplorer.tsx#L379)) | `resellerId` | All customers, not that reseller's |

Links that already work: inventory and purchase (`?category_id=`, `?location_id=`, `?vendor_id=`) through [`useUrlParam`](../../src/features/admin/inventory/shared/hooks.ts), and platform tickets (`?ticket=`), which reads `window.location.search` once on mount ([SupportTicketsPage.tsx:42-45](../../src/features/platform/support/pages/SupportTicketsPage.tsx#L42-L45)). `AuthGuard`'s `?expired=1` is harmless, because `ExpiredBanner` already explains the expiry.

**Fix.**
1. Move `useUrlParam` (and `useDebouncedValue`, which is currently copied **5 times**: customers, settings, sms, bandwidth, hr) to `src/features/shared/hooks/`. Point all users at the shared copy.
2. Read the param in each target above. For `customerId`: fetch the customer and preselect it in `CustomerPicker`. For consistency, also switch the platform tickets screen from its one-off `window.location` read to `useUrlParam`.
3. The targets need a `<Suspense>` boundary, because `useSearchParams` requires it.
4. The full table-state version of this (search, page, sort) is [T2](02-DATA-TABLES.md#t2--table-state-in-the-url).

**Done when:** each link in the table opens its target already filtered or pre-filled.
