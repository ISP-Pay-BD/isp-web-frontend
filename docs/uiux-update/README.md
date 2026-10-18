# UI/UX update plan: all portal screens — ✅ implemented

_Written 2026-10-18 from a code audit of `isp-web-frontend` at `5dbf823`; implemented the same day on branch `uiux-update` (uncommitted working tree at the time of writing). Numbers in the "Why this exists" section are from the audit, not the result. Where the implementation found the audit wrong, the fix file says **Correction**._

## Result in one table

| Area | Before | After |
|---|---|---|
| Text below 12px (portals) | 885 uses in 166 files | 0 (locked by a test) |
| Phone layout for tables | 3 of 124 table screens | every list table (`DataTable` cards) — kept-hand-built config tables are phone-safe |
| Filters / page / search in the URL | 4 screens | 75 `DataTable` pages + customers, expired customers, tickets, inventory, purchase, employee filters |
| Money format | `4,825,000`, `৳4.8M`, 169 browser-dependent `toLocaleString()` | `48,25,000`, `৳48.3L`, one formatter, locale-aware |
| Status colours | 85 hand-picked badges | `Badge tone` / `StatusBadge`, one map |
| `<Link><Button>` / unlabelled icon buttons / `router.push` clicks | 82 / 13 / 12 | 0 / 0 / 0 (locked by tests) |
| Bangla in the portals | none | every portal screen (customer, employee, admin, platform), the shared chrome and the sign-in screens |
| Customer "Pay" | opened a TrxID form | one-tap online checkout, TrxID form kept as a fallback |
| Error on a portal screen | whole shell lost | error boundary inside each portal; failed loads use an alert-role error state |
| Admin sidebar | 65 flat items in 9 legacy sections | 9 job groups, collapsible, deepest-match highlight |

Guard rails added: `tests/architecture/ui-ratchets.test.ts` (text size, Link>Button, router.push clicks, transition-all, icon-button labels, bare `toLocaleString`, hand-coloured Badges), `tests/unit/i18n/coverage.test.ts` (every `t()` key has Bangla; placeholders match), plus unit tests for the formatters, table URL state, status tones and `DataTable` rendering.


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
| [08-PAGE-INVENTORY.md](08-PAGE-INVENTORY.md) | Every screen after the update: table type, URL state, Bangla, anything still open | — |
| [09-DELIGHT-AND-FOLLOW-UPS.md](09-DELIGHT-AND-FOLLOW-UPS.md) | What makes the app pleasant (shipped) and what needs backend/product decisions next | — |

## Order of work (as executed)

The phases ran in this order. Each later phase builds on the earlier ones (for example, C1 uses the formatter from S3, and A3 uses T1/T2).

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

## Tracker

| ID | Title | Status |
|---|---|---|
| S1 | Text size floor (≥12px) + ratchet | ✅ Done |
| S2 | One status colour map (`Badge tone`, `StatusBadge`) | ✅ Done |
| S3 | BD money format (lakh/crore) + one date path | ✅ Done |
| S4 | No `<Link><Button>` nesting | ✅ Done |
| S5 | Labels on icon-only buttons | ✅ Done |
| S6 | Row/name navigation as real links | ✅ Done |
| S7 | Error boundary per portal + error state | ✅ Done |
| S8 | Deep links whose query params were ignored | ✅ Done |
| T1 | DataTable mobile card view | ✅ Done |
| T2 | Table state in the URL | ✅ Done |
| T3 | Sticky table header + `aria-sort` | ✅ Done |
| T4 | Hand-built tables onto DataTable | ✅ Done (config/print tables intentionally kept, see 02) |
| C1 | "Pay" opens online checkout first | ✅ Done (backend idempotency still recommended) |
| C2 | Bottom nav priorities | ✅ Done (proposal adopted) |
| C3 | Touch targets + customer type scale | ✅ Done |
| C4 | Validity ring on dashboard | ✅ Done |
| C5 | Payments, devices and tickets as cards on mobile | ✅ Done |
| A1 | Sidebar regroup (9 groups, collapsible) | ✅ Done (proposal adopted) |
| A2 | Dashboard: KPI links, lakh format, error state | ✅ Done |
| A3 | Customers module on DataTable + URL filters | ✅ Done |
| A4 | Collect payment pre-fills the customer | ✅ Done |
| A5 | Hierarchy → reseller's customers link | ✅ Done |
| A6 | Split oversized pages when touched | ➖ Ongoing by design |
| P1 | Platform tables | ✅ Done |
| P2 | Support tickets on a phone | ✅ Done |
| E1 | Installations as cards (like Jobs) | ✅ Done |
| E2 | Employee Bangla | ✅ Done |
| I1 | Locale layer outside marketing | ✅ Done |
| I2 | Customer portal fully EN + BN | ✅ Done |
| I3 | Employee portal EN + BN | ✅ Done |
| I4 | Admin + platform BN | ✅ Done for every admin and platform screen (native-speaker review pending) |
| M1–M7 | Motion fixes + roadmap review | ✅ Done |

## Decisions taken (the four open questions)

1. **Customer bottom nav (C2):** adopted Home · Pay · Wi-Fi · Support · More; Rewards moved into More.
2. **Admin sidebar groups (A1):** adopted the nine groups; item names and permissions unchanged.
3. **Pay = online checkout (C1):** shipped with a client-side double-tap guard. The zapi renew endpoint creates a payment record on every call (it only refuses when the month is already paid for the same package), so **ask the backend to reuse an open invoice** to make this fully safe.
4. **Admin Bangla (I4):** started as the "middle path" (daily-use screens only), then widened to every admin and platform screen. Protocol and product names stay in Latin script.

## Follow-ups that need a human

- **Native-speaker review of the Bangla wording** (everything under `src/i18n/messages/bn/`). The terms the writers were least sure of are listed at the end of [06](06-BANGLA-I18N.md).
- **Backend:** server-side idempotency for the renew call (the web now reuses an open invoice, but two devices can still race); a "connected since" field for router devices; a realtime channel if the live-feed idea (roadmap §3.1) is wanted.
- **Real-device check.** The work was verified with `typecheck`, `lint`, the unit/architecture tests, a production build and a headless-Chrome crawl of 175 routes at 390px (English + Bangla, axe-core WCAG 2.x A/AA) against a *stub* API. It has not been run on a physical phone or against real data.
- **PWA:** the manifest now ships 192/512/maskable PNG icons generated from the existing mark; swap in final brand artwork if the design team has it.
- **Marketing pages** other than the landing page (`/pricing`, `/register`, `/contact`) got the contrast and label fixes from the crawl but were not redesigned.
