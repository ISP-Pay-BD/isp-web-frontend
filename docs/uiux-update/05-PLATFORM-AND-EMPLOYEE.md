# 05 — Platform and employee portals (P1–P2, E1–E2) — ✅ implemented

Both portals are small: 24 platform screens and 6 employee screens. Most of their problems are the shared ones, which S1–S8 and T1–T4 fix. This file lists what is left.

## Platform (super-admin), 24 screens

The users are ISP Pay BD operators, mostly on a desktop. From the [inventory](08-PAGE-INVENTORY.md): 21 of 24 screens have sub-12px text (S1), 8 nest `<Link><Button>` (S4), and 8 are tables with no phone layout (T1).

| ID | Fix | Effort |
|---|---|---|
| P1 | Tables: tenants first, then admins, revenue, metering, SLA, user access, engines | S (after T1/T2) |
| P2 | Support tickets on a phone | S |

### P1 — Platform tables

Once T1/T2 land in DataTable, set `meta.mobile` on these screens, in this order: `/platform/tenants` (tenant name · plan · status · customers · MRR), `/platform/admins`, `/platform/revenue`, `/platform/metering`, `/platform/sla`, `/platform/user-access`, `/platform/engines/[slug]`.

`/platform/engines` renders the admin `EnginesIndexPage`, which is a hand-built table, so it is fixed by [T4](02-DATA-TABLES.md#t4--move-hand-built-tables-onto-datatable).

### P2 — Support tickets on a phone

[`SupportTicketsPage`](../../src/features/platform/support/pages/SupportTicketsPage.tsx) is a list plus a selected ticket. Check it at 390px. The list and the thread should be two views (list → full-screen thread with a Back button), not two squeezed columns. This matches the "Support thread: full height chat" rule in `10-RESPONSIVE-AND-MOBILE.md`. While you're in this file, swap its one-off `window.location` read for `useUrlParam('ticket')` ([S8](01-SHARED-FIXES.md#s8--deep-links-whose-query-params-are-ignored)), so selecting a ticket also updates the URL.

---

## Employee, 6 screens

The users are ISP field staff (installers, collectors), **on a phone, in the field**. The employee brief already says "dense, mobile-first".

| Screen | Today | Status |
|---|---|---|
| `/employee/jobs` | Card list with filters and pagination | ✅ The model to copy |
| `/employee/installations` | Hand-built `<table>`, in the **admin** feature folder (`admin/engines/pages/EmployeeInstallPage.tsx`, now moved) | ❌ E1 |
| `/employee/salaries`, `/employee/advance-salary` | DataTable | Fixed by T1 |
| `/employee/attendance`, `/employee/profile` | Forms / summary | S1 + I3 only |

| ID | Fix | Effort |
|---|---|---|
| E1 | Installations as cards, like Jobs | S |
| E2 | Employee Bangla (see [I3](06-BANGLA-I18N.md)) | M |

### E1 — Installations as cards

Rebuild `/employee/installations` in the same shape as [`EmployeeJobsPage`](../../src/features/employee/jobs/pages/EmployeeJobsPage.tsx): one card per installation with customer, address/area, phone (a `tel:` link), scheduled time, a status badge, and the primary action ("Start", "Mark done") as a full-width button at the bottom of the card. Use the existing dialogs for the actions.

While you're there, move the screen from `features/admin/engines/pages/` to `features/employee/installations/pages/`. An employee screen shouldn't live in the admin feature.

### E2 — Employee Bangla

Field staff are the users least likely to read English comfortably. Do employee Bangla straight after the customer portal (I3).


---

## What was built

- **P1** Platform tables inherit the `DataTable` phone cards (tenant name / plan / status as card, actions in the footer) and `urlState`.
- **P2** `/platform/support-tickets` shows the list or the thread below `lg` (with an "All tickets" back button), the open ticket is `?ticket=` via `useUrlParam`, priority chips use `Badge tone`, controls are 40px.
- **E1** Installations moved to `src/features/employee/installations/` as cards (customer, address, map link, `tel:` phone, schedule, status, full-width Start/Complete).
- **E2** All six employee screens are bilingual (`employee.*`, `validation`); dates/months follow the active language; GPS errors are translated.
