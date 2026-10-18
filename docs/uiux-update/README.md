# UI/UX update plan: all portal screens

_Written 2026-10-18 from a code audit of `isp-web-frontend` at `5dbf823`. Every number below comes from the code, not from the docs._

## Why this exists

The app has 214 `page.tsx` routes. Four are redirects, so there are **210 real screens**:

| Surface | Screens |
|---|---|
| Admin (tenant + reseller) | 145 |
| Platform (super-admin) | 24 |
| Customer self-care | 19 |
| Employee | 6 |
| Marketing, auth, status, help, captive, 403 | 16 |

Most screens are not broken one by one. They share the same few components (DataTable, Button, StatusBadge, the formatters, the portal layouts). The defects live in those shared pieces, or in a pattern that was copied from page to page. So the plan fixes **shared pieces first**. One shared fix lands on 80–150 screens at once.

Many of these gaps are already rules in [`DEFINITION-OF-DONE.md`](../DEFINITION-OF-DONE.md) and [`10-RESPONSIVE-AND-MOBILE.md`](../10-RESPONSIVE-AND-MOBILE.md), but the shipped screens don't meet them. Examples: a mobile card list below 768px, a sticky table header, Bangla in the customer portal, and 44px touch targets. This plan closes that gap. It does not invent a new design.

## Files

| File | What it covers | IDs |
|---|---|---|
| [01-SHARED-FIXES.md](01-SHARED-FIXES.md) | Text size floor, status colours, money/date format, `Link`+`Button` nesting, icon labels, row links, error boundaries, broken deep links | S1–S8 |
| [02-DATA-TABLES.md](02-DATA-TABLES.md) | Mobile card view, filters in the URL, sticky header, moving hand-built tables onto DataTable | T1–T4 |
| [03-CUSTOMER-PORTAL.md](03-CUSTOMER-PORTAL.md) | Pay flow, bottom nav, touch targets, validity ring | C1–C5 |
| [04-ADMIN-PORTAL.md](04-ADMIN-PORTAL.md) | Sidebar regroup, dashboard, customers module, collect-payment flow, oversized pages | A1–A6 |
| [05-PLATFORM-AND-EMPLOYEE.md](05-PLATFORM-AND-EMPLOYEE.md) | Platform tables + support tickets on a phone, employee field-staff screens | P1–P2, E1–E2 |
| [06-BANGLA-I18N.md](06-BANGLA-I18N.md) | Bangla for customer + employee portals, then admin | I1–I4 |
| [07-MOTION.md](07-MOTION.md) | Review of `15-ANIMATION-AND-UX-ROADMAP.md` and fixes to the motion code that ships today | M1–M7 |
| [08-PAGE-INVENTORY.md](08-PAGE-INVENTORY.md) | Every screen, with the fix IDs that apply to it and a Done column | — |

## Order of work

Do the phases in order. Each later phase builds on the earlier ones (for example, C1 uses the formatter from S3, and A3 uses T1/T2).

| Phase | IDs | Screens touched | Effort |
|---|---|---|---|
| 1. Shared quick wins | S1, S2, S3, S4, S5, S6, S7 | 188 of 210 | 2–3 days |
| 2. Tables | T1, T2, T3, then T4 page by page | 124 table screens | 3–5 days + T4 |
| 3. Customer portal | C1–C5, I1–I2 | 19 | 3–4 days |
| 4. Admin | S8, A1–A5 | 145 | 3–4 days |
| 5. Platform + employee | P1–P2, E1–E2, I3 | 30 | 2 days |
| 6. Motion clean-up | M1–M7 | landing + portals | 1 day |
| Ongoing | A6, I4, and RHF+Zod forms when a page is touched | — | — |

Effort: **S** < half a day · **M** 1–2 days · **L** 3+ days. The per-fix docs give S/M/L.

## Rules for whoever implements this

- Follow [`AGENTS.md`](../../AGENTS.md): shadcn portals, ISP tokens, **no Framer on portals**, no new UI kit, no new dependency unless a fix says so.
- Module briefs win over this plan where they conflict, for example [`src/features/admin/DESIGN_BRIEF.md`](../../src/features/admin/DESIGN_BRIEF.md) and [`src/features/marketing/landing/DESIGN_BRIEF.md`](../../src/features/marketing/landing/DESIGN_BRIEF.md).
- Use **one PR per fix ID**, so each one can be reviewed and reverted on its own.
- Before you call a fix done, run `pnpm lint && pnpm typecheck && pnpm test && pnpm build`. Then run `graphify update .`, as AGENTS.md requires.
- Where a fix says "ratchet", add a check to `tests/architecture/` that fails if the bad pattern comes back.
- When a fix lands, tick its rows in [08-PAGE-INVENTORY.md](08-PAGE-INVENTORY.md) and update the tracker below.

## Decisions the owner must make

These change product behaviour, so don't implement them without a yes:

1. **Customer bottom nav (C2).** `10-RESPONSIVE-AND-MOBILE.md` says Home / Pay / Support / Rewards / More. This plan proposes Home / Pay / Router / Support / More, with Rewards moved into More.
2. **Admin sidebar groups (A1).** The proposed regroup is in 04. Item names and permissions stay the same. Only the grouping changes.
3. **Pay = online checkout (C1).** Before the dashboard "Pay Bill" button starts a gateway checkout, confirm that the zapi renew endpoint reuses an existing pending invoice instead of creating a second one.
4. **Admin Bangla scope (I4).** `11-I18N.md` marks admin Bangla as optional. Decide whether resellers and field collectors need it.

## Tracker

| ID | Title | Status |
|---|---|---|
| S1 | Text size floor (≥12px) + ratchet | Not started |
| S2 | One status colour map (StatusBadge) | Not started |
| S3 | BD money format (lakh/crore) + one date path | Not started |
| S4 | No `<Link><Button>` nesting | Not started |
| S5 | Labels on icon-only buttons | Not started |
| S6 | Row/name navigation as real links | Not started |
| S7 | Error boundary per portal | Not started |
| S8 | Deep links whose query params are ignored | Not started |
| T1 | DataTable mobile card view | Not started |
| T2 | Table state in the URL | Not started |
| T3 | Sticky table header | Not started |
| T4 | Move hand-built tables to DataTable | Not started |
| C1 | "Pay" opens online checkout first | Not started |
| C2 | Bottom nav priorities | Decision needed |
| C3 | Touch targets + customer type scale | Not started |
| C4 | Validity ring on dashboard | Not started |
| C5 | Payment list as cards on mobile | Not started |
| A1 | Sidebar regroup (65 items → 9 groups, 2 duplicates removed) | Decision needed |
| A2 | Dashboard: KPI links, lakh format, error state | Not started |
| A3 | Customers module first for T1/T2 | Not started |
| A4 | Collect payment pre-fills the customer | Not started |
| A5 | Hierarchy → customers filter link | Not started |
| A6 | Split oversized pages when touched | Ongoing |
| P1 | Platform tables (after T1/T2) | Not started |
| P2 | Support tickets on a phone | Not started |
| E1 | Installations as cards (like Jobs) | Not started |
| E2 | Employee Bangla | Not started |
| I1 | Move LocaleProvider out of marketing | Not started |
| I2 | Customer portal fully EN + BN | Not started |
| I3 | Employee portal EN + BN | Not started |
| I4 | Admin BN (scope decision) | Decision needed |
| M1–M7 | Motion fixes | Not started |
