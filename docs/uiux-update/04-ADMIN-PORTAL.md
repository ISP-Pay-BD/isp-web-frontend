# 04 — Admin portal (A1–A6) — ✅ implemented (A6 stays 'when touched')

**145 screens**, used by tenant admins and resellers. The shared fixes (S1–S8) and the table work (T1–T4) cover most of this portal. This file covers what is specific to admin.

Module briefs exist for most modules (`src/features/admin/*/DESIGN_BRIEF.md`). Where a fix here changes a brief, the fix says so, and the brief must be updated in the same PR.

| ID | Fix | Effort |
|---|---|---|
| A1 | Sidebar: 65 items → 9 job groups, collapsible | M |
| A2 | Dashboard: KPI links, lakh format, error state | S |
| A3 | Customers module goes first for T1/T2/T4 | M |
| A4 | "Collect payment" pre-fills the customer | S |
| A5 | Hierarchy → reseller's customers link | S |
| A6 | Split oversized screens when you touch them | ongoing |

---

## A1 — Sidebar regroup (decision needed)

**Today** ([`src/config/navigation/admin.ts`](../../src/config/navigation/admin.ts)): **65 top-level items** in 9 sections, and the sections can't be collapsed. Sidebar search and Pinned already exist and are good. Three problems:

- **Two look-alike pairs:** "Self Recharge" / "Subscription" both go to `/admin/subscription`, and "My Payment" / "Payment" both go to `/admin/payment`. *(Correction found while implementing: they are not true duplicates — the "Self Recharge" and "My Payment" entries are `expiredOnly`, i.e. what an expired tenant sees instead of the normal entries. Both pairs were kept and now sit together in "Your Account".)*
- **"System" holds 17 unrelated items**: plan and wallet, network (Movie Servers, Corporate Queues), security, and Profile.
- **"Network" is both an item (under Operations) and a section.** "Billing" mixes packages with reseller bandwidth trading.

**Proposal.** Only the `section` values change. Item ids, hrefs, permissions and icons stay the same.

| Group | Items |
|---|---|
| Overview | Dashboard, Reports, Hierarchy |
| Customers | Customers, Service Areas, Work Orders, Leads, Support Tickets, Customer Feedback, Contracts, Usage Alerts |
| Billing & collections | Packages, Billing, Collections, Addons, Services, Payment Gateways |
| Resellers & bandwidth | POP, Dealers, Bandwidth Buy, Bandwidth Sell, Bandwidth SLA |
| Network | Network, Routers, OLT, Hotspot, RADIUS, IP Pools, IPAM, ACS / TR-069, NOC Hooks, VPN, Movie Servers, Corporate Queues |
| Messaging & engagement | SMS, SMS Templates, Voice SMS, WhatsApp Business, Announcements, News & Notices, Rewards, AI Chat, Product Showcase |
| Finance & back office | Accounting, Inventory, Purchase, HR Management |
| Settings & security | Settings, Branding, Theme Studio, User Access Management, Compliance, Fraud, Audit Logs, Backup, Recycle Bin, Developers, ISP Engines, Sidebar Pins |
| Your ISP Pay BD account | Subscription / Recharge, Payment, Wallet |

Profile moves to the avatar menu in the header.

**Behaviour.**
1. Groups collapse. The group holding the current route opens automatically. Remember which groups the user opened (`localStorage` is fine for this, since it's a per-user convenience).
2. Keep **Pinned** at the top and **Search** as they are. Add **Recent** (the last 5 visited admin routes, client side) under Pinned.
3. Resellers see fewer items through permissions. Hide a group that ends up empty.

---

## A2 — Dashboard

[`AdminDashboardPage`](../../src/features/admin/dashboard/pages/AdminDashboardPage.tsx). The brief says "links to filtered lists", but today those links don't filter.

1. **KPI links:** "Active customers" and "Payment due" link to `/admin/customers?status=…`, but the list ignores the param ([S8](01-SHARED-FIXES.md#s8--deep-links-whose-query-params-are-ignored)). Fixed by A3/T2.
2. **Money:** `৳4.8M` → `৳48L` ([S3](01-SHARED-FIXES.md#s3--bd-money-format-lakhcrore--one-date-path)). `Today: ৳{todayCollectionBdt.toLocaleString()}` → `formatBdt`.
3. **Error:** a failed load renders `EmptyState`, which reads as "nothing here" ([S7](01-SHARED-FIXES.md#s7--error-boundary-per-portal)).
4. **Text:** 21 labels at 10–11px ([S1](01-SHARED-FIXES.md#s1--text-size-floor-12px)).
5. "Payment due" goes to `?status=expired`. Check with the owner that "due" really means "expired". If due should include customers about to expire, use a `due` filter instead.

---

## A3 — Customers module first

"Find the customer, then open or collect" is the most frequent admin job, and its screens are the furthest behind:

- `/admin/customers` is a hand-built `<table className="min-w-[1300px]">` in a **1,324-line** file ([AllCustomersPage.tsx:728](../../src/features/admin/customers/pages/AllCustomersPage.tsx#L728)). The filter is `useState('all')` (line 154), and names navigate by `router.push` (lines 844, 1016, 1023).
- `/customers/expired`, `/inactive`, `/free-requests`, `/groups` and `/import` are also hand-built tables.

**Order:** T4 (move to DataTable) → T1 (cards with name, PPPoE id, package, status, due ৳, ⋯) → T2 (URL state with `status`, `area`, `resellerId`, `q`, `page`) → S6 (name is a `<Link>`) → S1.

**Brief change:** `admin/customers/DESIGN_BRIEF.md` item 11 says "filters local for now". Change it to "filters in the URL (T2)".

---

## A4 — "Collect payment" pre-fills the customer

Four places link to `/admin/customer-payments/new?customerId=…`: AllCustomersPage:1032, CustomerDetailPage:194 and :735, and ExpiredCustomersPage:370. The form starts empty ([NewCustomerPaymentPage.tsx:59](../../src/features/admin/customer-payments/pages/NewCustomerPaymentPage.tsx#L59)), so the collector has to search for the same customer again. This is the money flow, and it is used dozens of times a day.

**Fix:** read `customerId` (via the shared `useUrlParam`), fetch that customer, and preselect it in `CustomerPicker`, with the package fee in the amount field. Keep the picker editable. After saving, the screen already goes to the POS slip. Add a "Back to customer" link there when the payment started from a customer.

---

## A5 — Hierarchy → reseller's customers

[`HierarchyExplorer.tsx:379`](../../src/features/shared/hierarchy/components/HierarchyExplorer.tsx#L379) links to `/admin/customers?resellerId=…`. Once A3/T2 is in, the customers list reads `resellerId`. Show the active filter as a removable chip ("Reseller: Mirpur POP ✕"), so the user knows why the list is short.

---

## A6 — Split oversized screens when you touch them

These page files are hard to change safely, and each mixes several jobs on one screen. Don't refactor them for the sake of it. When a fix above touches one, split it into tabs or sections with their own components:

| Screen | Lines |
|---|---|
| `customers/pages/AllCustomersPage.tsx` | 1,324 |
| `sms/pages/SmsPage.tsx` | 832 |
| `isp-ops/pages/BillingPoliciesPage.tsx` | 829 |
| `isp-ops/pages/AddonsPage.tsx` | 826 |
| `customers/pages/CustomerDetailPage.tsx` | 790 |
| `areas/pages/AreasPage.tsx` | 785 |
| `packages/pages/PackagesPage.tsx` | 665 |
| `isp-ops/pages/DepositsPage.tsx` | 661 |
| `hr/employees/pages/EmployeeDetailsPage.tsx` | 651 |
| `isp-ops/pages/DevelopersPage.tsx` | 643 |
| `isp-ops/pages/RemindersPage.tsx` | 638 |
| `hotspot/pages/HotspotUsersPage.tsx` | 637 |
| `profile/pages/ProfilePage.tsx` | 635 |
| `dashboard/pages/AdminDashboardPage.tsx` | 635 |
| `accounting/chart-of-accounts/pages/ChartOfAccountsPage.tsx` | 631 |

Forms: `DEFINITION-OF-DONE.md` §E asks for react-hook-form + Zod. About 43 files use it, and many screens still keep form fields in `useState`. Move a form to RHF + Zod when you touch that screen, not in one big sweep.


---

## What was built

- **A1** `section` values in `src/config/navigation/admin.ts` regrouped into the nine groups of the table above (`adminSectionOrder` fixes their order); `PortalSidebar` folds groups (state remembered in `localStorage`, the group holding the current page is always open, everything opens while searching or when the rail is collapsed) and now highlights the **deepest** matching item (so `/admin/customers/12` marks "Customers", and `/admin/support/feedback` no longer marks both Support Tickets and Customer Feedback). Item ids, hrefs and permissions are unchanged. Labels and group names are translated (`nav.*`).
- **A2** Dashboard: KPI links now land on filtered lists (`?status=active`, `?status=expired`), money uses lakh format (`৳48L`), failed load shows the error state, text ≥12px.
- **A3** `AllCustomersPage` and `ExpiredCustomersPage` run on `DataTable` (phone cards, selection that survives paging, Columns menu), filters/search/page are in the URL, the name is a real link. New "Active" quick filter.
- **A4** `NewCustomerPaymentPage` reads `?customerId=`, loads the customer and preselects it with the package fee; the back arrow returns to the customer.
- **A5** `resellerId` filter in the customers API (`/v1/reseller/customers/{id}`) and a removable "Showing customers of reseller #…" chip.
- **A6** Not a sweep. Pages that were converted (`ExpiredCustomersPage`, `AllCustomersPage`, HR, ledger…) shrank as a side effect; remaining large files are listed above.
- **Extras:** keyboard shortcuts (`/` focuses search, `g` then `d/c/e/p/t/r` jumps, `?` lists them), "Live gateway" decoration and the always-on unread dot removed from the header (they were not backed by data), profile link fixed per portal.
