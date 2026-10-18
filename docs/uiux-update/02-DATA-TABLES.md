# 02 — Data tables (T1–T4)

**124 screens show a table.** 81 use the shared [`DataTable`](../../src/features/shared/data-table/components/DataTable.tsx), and **43 build their own `<table>`**. Only 3 have any phone layout. The rest scroll sideways on a phone. [`AllCustomersPage`](../../src/features/admin/customers/pages/AllCustomersPage.tsx#L728), the most-used screen, is a hand-built `<table className="min-w-[1300px]">`.

The rules already demand more than that. [`DEFINITION-OF-DONE.md`](../DEFINITION-OF-DONE.md) §F says "Mobile: card list fallback below 768px" and "Sticky header on desktop". [`10-RESPONSIVE-AND-MOBILE.md`](../10-RESPONSIVE-AND-MOBILE.md) even names the API (`renderMobileRow`). Neither was built.

| ID | Fix | Screens | Effort |
|---|---|---|---|
| T1 | Mobile card view in DataTable | 81 at once, then 43 after T4 | M |
| T2 | Table state (search, filters, page, sort) in the URL | 72 server-mode tables + filters | M |
| T3 | Sticky header + `aria-sort` | 81 at once | S |
| T4 | Move the 43 hand-built tables onto DataTable | 43, one PR per module | L (spread out) |

Do T1–T3 inside DataTable first. Every DataTable screen gets them for free. Then T4 moves the hand-built screens onto it, and they pick up T1–T3 too.

---

## T1 — Mobile card view

**Problem.** Below 768px, [`DataTable.tsx:534`](../../src/features/shared/data-table/components/DataTable.tsx#L534) just wraps the table in `overflow-x-auto`. A reseller collecting dues in the field has to scroll sideways to find the amount and the action.

**Fix.** Below `md`, render cards instead of rows. Make it work with **zero changes per page**, and let pages refine it:

1. Add an optional column meta, `meta.mobile`: `'title' | 'subtitle' | 'status' | 'amount' | 'hide'`.
2. Default when no meta is set: the first visible column is the title, a column named `status` renders through `StatusBadge`, the `actions` column becomes a `⋯` menu, and the next 3 columns show as `label: value` lines.
3. Optional `renderMobileRow(row)` prop for screens that need a custom card (as named in doc 10).
4. The card is one tap target that leads to the record. Secondary actions go in the `⋯` menu. Min height 44px (doc 10).

Target layout (from doc 10):
```
┌─────────────────────────────┐
│ Rahim Uddin       ● Active  │
│ rahim_pppoe · 20 Mbps       │
│ Expires: 15 Sep 2026        │
│ ৳500 due          [ ⋯ ]     │
└─────────────────────────────┘
```

5. Toolbar on mobile: search full width, facet filters inside a "Filters" sheet, and the column-visibility toggle hidden.

**Done when:** at 390px, `/admin/customer-payments`, `/admin/hotspot/users` and `/admin/routers` show cards with no sideways scroll. The worst first, by field use: customers → payments → collections → hotspot users → support tickets.

---

## T2 — Table state in the URL

**Problem.** Search, filters, page and sort live in `useState`. Back, refresh and "copy link" all lose them. An operator who filters to "expired · Mirpur area · page 3" loses it every time they open a customer and come back. This is also why the dashboard deep links fail ([S8](01-SHARED-FIXES.md#s8--deep-links-whose-query-params-are-ignored)).

**Fix.**
1. A shared `useTableUrlState({ defaults })` hook built on `useUrlParam` (moved to shared in S8). It returns `{ page, pageSize, search, sort, filters, set… }` and writes with `history.replaceState`. That doesn't trigger a navigation, and it doesn't add history entries for every keystroke.
2. 72 screens already pass `server={...}` (`ServerTableState`) to DataTable. Feed that from the hook, so each screen needs a few lines, not a rewrite.
3. Param names: `q`, `page`, `size`, `sort` (`field:asc`), and one param per filter (`status`, `area`, `resellerId`…). Keep them readable, so links can be written by hand.
4. Wrap the screens in `<Suspense>` (needed by `useSearchParams`).

**Done when:** on `/admin/customers`, filter + search + page survive opening a customer and pressing Back, and `/admin/customers?status=expired` opens already filtered.

---

## T3 — Sticky header + `aria-sort`

**Problem.** On long tables the column names scroll out of view, though DoD §F asks for a sticky header. The sortable headers are `role="button"` divs ([DataTable.tsx ~548](../../src/features/shared/data-table/components/DataTable.tsx#L548)) with no `aria-sort`, so screen readers can't tell which column is sorted.

**Fix.** On `md+`, make `TableHeader` `sticky top-0 z-10 bg-card` inside the scroll container (give the container a max height). Put `aria-sort="ascending|descending|none"` on the `<th>`. Also bring the header text up to `text-xs` here and in `ui/table.tsx` ([S1](01-SHARED-FIXES.md#s1--text-size-floor-12px)).

---

## T4 — Move hand-built tables onto DataTable

**43 screens** render their own `<table>` / `<Table>` and get none of T1–T3. Move them **one module per PR**, and use the time to check each screen against the DoD.

| Module | Screens |
|---|---|
| Customers | `/admin/customers` (1324 lines, `min-w-[1300px]`), `/customers/expired`, `/customers/inactive`, `/customers/free-requests`, `/customers/groups`, `/customers/import` |
| Billing & collections | `/billing/deposits`, `/billing/dunning`, `/billing/policies`, `/billing/tax`, `/collections/cashbook`, `/collections/reminders`, `/payments/credits`, `/wallet` |
| Accounting | `/accounting/chart-of-accounts`, `/expenses`, `/incomes`, `/journal-entries`, `/reports` |
| HR | `/hr/employees`, `/hr/employees/[id]`, `/hr/accounts`, `/hr/advance-salary`, `/hr/attendance`, `/hr/salaries` |
| POP | `/pop/funding`, `/pop/transactions`, `/pop-packages` |
| Reports | `/reports/btrc`, `/reports/otc`, `/reports/usage`, `/reports/collections-map` |
| Network & ops | `/network/netflow`, `/compliance/ip-logs`, `/areas`, `/packages`, `/jobs`, `/leads`, `/engines`, `/developers`, `/backup` |
| Other portals | `/employee/installations`, `/platform/engines` (both render admin feature pages) |

Do Customers first, because it is also [A3](04-ADMIN-PORTAL.md#a3--customers-module-first).

Seven more screens mix both (DataTable plus a hand-built table): `/admin/bandwidth/buy/bills`, `/admin/bandwidth/sell/invoices`, `/admin/customer-payments`, `/admin/olt`, `/admin/payment`, `/admin/purchase/bills`, `/admin/purchase/requisitions`. Check whether the second table is a real list or just a small key/value block. Key/value blocks can stay.

**Not every `<table>` must move.** Print layouts (invoice, POS slip, BTRC export) and small fixed key/value tables can stay hand-built, but must still meet S1 (text size) and must not scroll sideways at 390px.
