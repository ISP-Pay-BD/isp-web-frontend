# 09 — Making it a pleasure to use: what shipped, what is next

Fixing defects (docs 01–08) makes the app *not annoying*. This file covers the second layer — speed, small moments of satisfaction and reasons to come back — and records what was built and what still needs a decision or a backend change.

The test for every item: **does it make a real task faster, clearer or more rewarding, without costing performance?** Nothing here is decoration.

## Built

| Idea | What shipped | Where |
|---|---|---|
| One-tap payment | The customer's *Pay* buttons start the provider's checkout directly; the TrxID form is a fallback | `CustomerPayPage`, [03](03-CUSTOMER-PORTAL.md) |
| The moment that matters | Validity ring on the dashboard: fills once, turns amber ≤3 days, rose when ended | `ValidityRing` |
| Calm destructive actions | Confirmation before *Restart router* and *Reset connection* (they drop the line) | `CustomerRouterPage`, dashboard |
| Fast for operators | `/` focuses the page search, `g` then `d/c/e/p/t/r` jumps between screens, `?` lists them; ⌘K was already there | `use-global-shortcuts.ts`, `ShortcutsDialog` |
| Never lose your place | Filters, search, page and sort live in the URL (back button, refresh, shared links, dashboard KPI links) | [02](02-DATA-TABLES.md) |
| Right language, right numbers | Bangla UI, lakh/crore money, Bangla month names | [06](06-BANGLA-I18N.md) |
| Honest header | Removed the fake "Live gateway" badge and the always-on unread dot | `PortalHeader` |
| Phone first | Cards instead of sideways-scrolling tables; 44px targets; safe-area bottom nav | [02](02-DATA-TABLES.md), [03](03-CUSTOMER-PORTAL.md) |
| Add to home screen | Web app manifest (`/manifest.webmanifest`) with PNG icons (192, 512, maskable 512) so Chrome offers *Install* | `src/app/manifest.ts`, `public/images/brand/icon-*.png` |
| Instant customer detail | Hovering / focusing a customer name prefetches the detail query | `usePrefetchCustomer` in `admin/customers/hooks/use-customers.ts` |
| No duplicate invoices | *Pay* reuses the customer's open invoice instead of creating another; a 10-second double-tap guard sits on top | `CustomerPayPage` |
| Receipt SMS in the customer's language | `receiptSmsText(receipt, locale)` | `admin/customer-payments/lib/mappers.ts` |

## Deliberately not built (and why)

- **Scratch cards, confetti, glow effects, sounds, portal 3D** — slow down daily work and contradict the briefs.
- **Fake live indicators** (`Live gateway`, unread dots, "100% heartbeat") — no data behind them.
- **Staggered table rows, ping rings** — noise on dense screens, forbidden by the portal motion brief.

## Next (needs backend or a product decision)

| Idea | Why it is worth it | What it needs |
|---|---|---|
| **"Today" list for admins** — dues today, expiring in 3 days, routers down, tickets waiting, each with a one-click action ("SMS all") | The reason to open the app every morning; the dashboard already has the numbers | A `/dashboard/today` aggregate or reuse of the summary endpoints; product wording |
| **Undo instead of "are you sure?"** for reversible actions (toggle, status change) | Faster than a dialog and safer | Optimistic updates per mutation + an undo endpoint or inverse call |
| **On-time-payment streaks / rewards** for customers | Gives a reason to pay early | Reward rules in the backend |
| **Daily collection target ring** for collectors | Progress they can see | Target value per collector |
| **Router reboot countdown with real "back online"** | Reassurance during the 60 s outage | Poll the router state until it answers |
| **Push/SMS reminder with one-tap pay link** | Closes the loop with C1 | Backend reminder template + pay-link endpoint |
| **Product analytics** (pay-button → paid funnel, time to record a payment, weekly active admins) | Without measurement there is no proof it is used more | Choose a tool (privacy-friendly, self-hosted if possible) |
| **Final brand icon artwork** | The shipped PNGs are generated from the existing mark; replace them if the brand team supplies artwork | Design asset |
| **Idempotent invoice creation (backend)** | Done on `isppaybd_isp` branch `fix/renew-invoice-idempotent`: a repeat renew returns the same pending invoice with the same number, and a per-customer MySQL lock stops two simultaneous calls creating two. Tested (Zapi suite 1,065 and App suite 288 pass) but **not yet merged or deployed**. Not changed: a month-keyed row is still reused for a *different* package even when the earlier one was paid — a legacy design worth a separate review | PR review + deploy |

## Honest limits of this pass

**Verified:** `pnpm typecheck`, `pnpm lint` (0 errors), `pnpm test` (architecture + UI ratchets + i18n coverage + formatter/table unit tests) and `pnpm build`. A production build was also driven in headless Chrome against a *stub* API (no real backend, no real data): 175 portal routes at 390px plus 13 public/auth routes at 390px and 1366px, each in English and Bangla. Final result: **0 horizontal overflow, 0 text under 12px in the portals, 0 axe-core violations (WCAG 2.0/2.1/2.2 A+AA)**. Problems found on the way are listed in [01 — S9](01-SHARED-FIXES.md#s9--what-the-browser-audit-found-axe-core-390px---fixed). The landing page keeps small text inside its product mock-ups on purpose. The four console `TypeError`s the first runs showed (hierarchy ×2, settings, user access — the stub returned an empty list where an object was expected) are fixed: those pages now treat a malformed response as an empty or error state.

**Not verified — do these before calling the work final:**

1. **A real phone.** The browser run emulates 390px and touch; it is not an Android/iOS device. Check the customer pay flow, the bottom nav (safe-area) and the install prompt on a physical phone.
2. **Real data.** The stub returns a few rows per list. Long names, hundreds of rows, slow networks and server errors were not exercised end to end.
3. **Bangla copy.** The wording was written by the implementers; a native speaker should review it — the terms to check are listed at the end of [06](06-BANGLA-I18N.md).
4. **Backend:** the idempotent-renew fix is on a `zapi` branch awaiting review/deploy (see *Next*); API error messages stay in English.
5. **Analytics:** none is wired up, so "do people use it more?" cannot be answered yet.
