# ISP Pay BD — Frontend ↔ zapi Integration Tracker

> Last verified: **2026-10-12** (web-completion pass). Verified against the code
> and the test suites, not against intent. The previous version of this file
> claimed "0 pure-mock screens" from a grep for `http.` calls; a screen-by-screen
> audit on 2026-10-11 found only ~10 of 208 screens were genuinely live. This
> file replaces it.

## 1. Current state

| Area | State |
|---|---|
| Admin portal (network, customers, billing, accounting, inventory, HR, comms, settings, isp-ops) | Live — every list/KPI/chart from zapi, every action calls the backend |
| Customer self-care portal (19 screens) | Live |
| Employee portal (6 screens) | Live — uses `/api/v1/employee-portal/*` (employee role) |
| Super-admin platform portal (25 screens) + engines | Live |
| Public: login, forgot/reset password, register, pricing, plugins, status, captive, contact | Live (public `/api/v1/public/*` endpoints) |
| Landing proof numbers (ISPs, subscribers, payments) | Live — `GET /api/v1/public/stats` (aggregate counts, cached 10 min; the page revalidates every 10 min and hides a figure it cannot load) |
| Sidebar "Engines" entries | Live — "All Engines" plus the real engine catalog (`GET /v1/engines/catalog`); the 16 hardcoded engine links and the "ONUs (sample)" link to a fake OLT id are gone |
| Privacy Policy / Terms of Service (`/privacy`, `/terms`) | Live, owner-managed — written in **Platform → Software Settings → Legal pages**, served by `GET /api/v1/public/legal[/{slug}]`; a page is published once it has text and the footer links only published ones. There is no legal copy in the codebase. |
| Reward points for auto-pay, feedback and support-ticket ratings | Awarded — the tenant settings (`autopay_points`, `feedback_points` + monthly cap, `ticket_rating_points`) existed but nothing ever awarded them (`CustomerActionRewards`, idempotent, in-app notice only) |
| Marketing landing copy (headlines, testimonials, FAQ, illustrative demo visuals, 99.9% SLA) | Static by design — `src/data/marketing` |

Guard rails (enforced by `tests/architecture/folder-structure.test.ts`):
- `src/lib/mock-api` and all dummy datasets are deleted; nothing may import `mock-api`/`mockFetch`.
- Only `src/data/marketing/*` may be imported, and never from a portal, `lib/api` or `stores`.

## 2. Client conventions (src/lib/api)

- `http.get` / `http.getPage` (keeps backend pagination `meta`) / `post` / `put` / `patch` / `delete` / `download` + `saveBlob`.
- Failures reject with `ApiError` carrying the backend message, status and field `details`.
- 401 → one transparent refresh via `POST /api/v1/auth/refresh` (was broken: missing `/api` prefix, so every session died after 60 min). Anonymous 401s no longer redirect public pages to `/login`.
- `getResellerId()` / `getAuthUserId()` — no hardcoded tenant id (the old `369` fallback is gone).
- `camelizeKeys` / `snakeizeKeys` / `num` / `str` in `src/lib/api/case.ts` — map snake_case once per feature.
- Single `queryClient` (`src/lib/query-client.ts`): retries only network/5xx, mutation errors toast the backend message, cache cleared on login/logout/impersonation switch.
- `DataTable` `server` prop for server pagination + debounced search.

## 3. Deploying this pass

Step-by-step runbook (backup → migrate → env → verify → crontab → frontend → smoke test → rollback):
**`isppaybd_isp/deploy/WEB_COMPLETION_RELEASE.md`**. After `php spark migrate`, run **`php spark deploy:check`**:
it reports PASS / WARN / FAIL for pending migrations, the 40 tables this release creates (read from the
migration files), required secrets, `WEB_APP_URL` / CORS / `app.baseURL` / `CI_ENVIRONMENT` / `CRON_ENABLED` /
GenieACS, cache read-write and writable dirs, and exits non-zero on any FAIL (`--strict`: on WARN too).

### Backend migrations (new) — `php spark migrate`
```
2026-10-11-240001_CreateCustomerKycDocumentsTable
2026-10-11-240002_CreateCustomerGroupTables
2026-10-11-410001_CreateInstallationsTable
2026-10-11-415001_CreateCommsQueueTables
2026-10-11-415002_AddNewsNoticeMetaColumns
2026-10-11-470001_CreateBillingConfigTables
2026-10-11-470002_CreateBillingPolicyChargesTable
2026-10-11-480001_AddBillingLedgerIndexes
2026-10-11-560001_CreateInventoryLedgerTables
2026-10-11-640001_CreateNetworkOpsTables
2026-10-11-650001_CreateResellerCatalogTables
2026-10-11-710001_AddPlatformTenantAndCatalogColumns
2026-10-11-710002_CreateEngineInstancesTable
2026-10-11-820001_CreateRouterDisconnectLogsTable
2026-10-11-930001_CreateUserTwoFactorTable
2026-10-11-930002_CreateTenantDeveloperTables
2026-10-11-930003_CreateTenantExportsTable
2026-10-11-961001_CreateCustomerPreferenceTables
2026-10-11-975001_AddWebhookDeliveryQueueColumns
2026-10-11-975002_AddAcsJobDispatchColumns
2026-10-11-985001_CreateRouterControlTables
```
`985001` creates `router_control_targets` + `cpe_param_maps`: the customer router-control code (targets, TR-069
onboarding) used both tables but no migration ever created them, so `/customer/router-control/*` answered 500.
Until they run, the affected endpoints answer `503` with a "run the migrations" message instead of SQL errors.
`zapi/Tests/Support/WebCompletionMigrationsTest.php` applies all of them, re-runs them (no-op) and rolls them back to
the exact original schema on SQLite. On MySQL they were applied to the local `isp_v2` copy (all 24 pending
migrations, 62 total / 144 tables, no errors); the local `isp` database was not touched. Staging and production
still need `php spark migrate`.

`admin_packages.duration_days` is the **free preview days** a new signup gets when the package's `trial_days` is 0
(not the billing period). The API exposes it as `preview_days` (registration plans also send the resolved
`free_days`); the renewal period comes from `pricing_type`.

### Backend env (`.env.example` documents them)
| Key | Purpose |
|---|---|
| `BKASH_SMS_FORWARDER_TOKEN` | **Required** for `/api/bkash/get_bkash_sendmoney` — unset = endpoint disabled (it was open to anyone) |
| `BKASH_WEBHOOK_TOKEN` | Optional; without it every bKash IPN must carry a valid AWS SNS signature |
| `WEB_APP_URL` | Password-reset emails link to `<WEB_APP_URL>/reset-password` |
| `CORS_ALLOWED_ORIGINS` | Comma-separated origins allowed with credentials; unset = any origin, never with credentials |
| `GENIEACS_NBI_URL` / `_USER` / `_PASS` | GenieACS NBI for the ACS job worker (unset = jobs stay queued, worker answers `ACS_NOT_CONFIGURED`) |
| `GENIEACS_MAC_FILTER_PARAM` | Optional CPE parameter path for customer device block (default `Device.WiFi.AccessPoint.1.X_ISP_BlockedMACAddresses`) |
| `zapi.apiKeyRateLimit` | Integration API requests per key per minute (default 120) |
| `zapi.impersonationRequirePassword` | `true` = "Log in as POP" requires the admin's password (default `false`, like the web app) |
| `reward.cronSecret` | **Required** for every `api/cron/*` worker below — unset or a `CHANGE_ME…` placeholder = they all answer 403. (It was missing from `.env.example`.) |

`.env.example` used to ship real values for `zapi.jwtSecret`, `security.sessionBridgeKey`, `cron.secret`,
`recaptcha.secretKey` and `ISP_INTERNAL_KEY`; they are placeholders now, but the old values remain in git
history. Run **`php spark secrets:check`** on each install: it lists every secret as OK / MISSING / PLACEHOLDER /
PUBLISHED (a value that older `.env.example` revisions published) and exits non-zero while a required one is not
OK. Values are never printed. A placeholder is treated as "not configured" everywhere it is read (tokens are not
issued or accepted, cron and internal-API calls are refused), so a copied-but-unedited file cannot run with a
publicly known key. Rotating `zapi.jwtSecret` signs every user out once.

### Cron (secret: `reward.cronSecret`; ready-to-paste crontab lines: `corn_job.md` items 13–24)
- `api/cron/sms-queue` — every minute (bulk SMS/voice are queued now, not sent in-request)
- `api/cron/dunning` — daily
- `api/cron/usage-alerts` — hourly
- `api/cron/billing-policies` — every 15 min (grace / auto-suspend / late & reconnection fees; live runs need `CRON_ENABLED = true`; `&dry_run=1` previews)
- `api/cron/webhooks` — every minute (signed integration webhook deliveries with retry)
- `api/cron/acs-jobs` — every minute (pushes queued ACS jobs to GenieACS)
- `api/cron/autopay-reminders` — daily (SMS with the bill and a pay link to customers with auto-pay on, `notify_days_before` days before expiry; once per expiry date)

The dunning, usage-alert, auto-pay and billing-policy workers hold a `CronLock`, so an overlapping hit answers
`{"skipped": true}` instead of running twice; the queue workers (sms-queue, webhooks, acs-jobs) claim rows with
tokens and are safe to overlap.

## 4. Verification

```bash
# Frontend
npx tsc --noEmit && npx eslint src tests --quiet && npx vitest run
# Backend
php vendor/bin/phpunit --testsuite Zapi
php vendor/bin/phpunit --testsuite App
php spark routes
```
2026-10-12 results: tsc 0 errors · eslint 0 errors · vitest 46/46 · `next build` succeeds (215 routes — 21
static engine pages folded into `engines/[slug]`, plus `/privacy` and `/terms` — no warnings; built from a copy so
the running dev server's `.next` was untouched) · Zapi suite 1,064 tests OK · App suite 286 tests OK ·
`php spark routes` loads 1,334 API routes with no errors · `php spark deploy:check` on the `isp_v2` copy: database,
migrations (63 applied, none pending) and the 40 release tables PASS.

Final logged-in crawl, run once, uninterrupted, against the finished code: customer 18 pages, employee 6,
platform owner 24 (+ settings/plugins/engines focus pages), ISP admin 142 (+ 16 focus pages: customer detail,
router, hotspot, queues, RADIUS), POP 138 — **0 JS exceptions, 0 server errors from our backend, 0 failed
requests apart from plugin images that do not exist in the local checkout** (which now fall back to an icon).
Flagged lines are all expected: redirects, WhatsApp not enabled for that tenant (403) and its external chatbot
service blocked on purpose (503), and 66 permission refusals for the POP visiting URLs its sidebar does not offer.

Live smoke run against the local `isp_v2` MySQL (backend on `php -S`, frontend production build): 443 GET
endpoints across every portal → 0 × 500 (the run found and fixed MySQL-8 reserved aliases `manual`/`terminated`/
`empty` and a 500 on `makeResellerPayment` without an id); steady-state latency 150–230 ms. Public pages
(pricing, status, plugins, contact) were checked in the browser against that backend.

Session fix: `getSession()` (`app/Helpers/utility_helper.php`) and `TrafficEndFilter` (actor id, type and label)
no longer start a PHP/Redis session for a Bearer request without a session cookie (each one used to persist a
new 30-day session key). Cookie-based web pages and CLI are unchanged; `CookielessSessionTest` covers both.

**Logged-in browser crawl** (every portal page, headless Chrome over the DevTools protocol, signed in with
locally minted tokens for an ISP admin, a POP, a customer, an employee and the platform owner; router circuit
breakers open and all outbound HTTP blocked so no real router or outside service is contacted). It found and
fixed:
- `router_control_targets` / `cpe_param_maps` never migrated, `CpeParamMapModel` missing, the router-control
  ACS client ignoring `GENIEACS_NBI_URL`, and an undefined `getSubscriberActiveSession()` — customer router pages
  answered 500;
- route-filter 401/403 and unknown-path 404 responses had no CORS headers, so the browser showed a network error
  (and an expired token never reached the refresh logic); they now carry CORS (`ApiErrorCorsTest`);
- the admin sidebar ignored `roles` and gave a POP every page, and `can()` passed every check for a POP so the
  104 `<Can>` wrappers did nothing for them — a POP is now judged by its own permission rows (the rows the API's
  gate reads; a menu `/auth/me` cannot express stays with the API), in the sidebar, the dashboard buttons and the
  command palette (`canSee` in `src/lib/permissions/can.ts`, covered by `tests/unit/permissions/can.test.ts`);
- the command palette's "Sync MikroTik Gateways" only showed a success toast and "BTRC reports" pointed at a
  missing page — the fake action is gone, the BTRC link goes to `/admin/reports/btrc`, and the quick actions are
  a permission-gated list;
- a POP's router management list showed its parent ISP's router, whose detail pages it may not open;
- dead links: 16 hard-coded engine pages, "ONUs (sample)" to a fake OLT id, a breadcrumb to a missing
  corporate page, footer links to non-existent Privacy/Terms pages;
- an offline router reported as a server error (`/customer/usage` now 503 `ROUTER_UNREACHABLE`).

**Router-dependent pages against a RouterOS-speaking endpoint.** The first crawl ran with every router
deliberately unreachable, which proves the error states but not the happy paths (usage, live router details,
hotspot, corporate queues). A local server that speaks the real RouterOS API wire protocol (login, `?filters`,
`.id` lookups, `add` → `=ret=`) was then wired in with no database change, and the crawl was re-run for all five
logins: customer 18 pages, employee 6, platform owner 24, ISP admin 142 (+14 focus pages: customer detail,
router, hotspot, queues), POP 139 — **0 JS exceptions, 0 failed network requests, 0 server errors from the
backend**; every hotspot / router / queue / usage page returns data. What is left in the logs is environmental:
WhatsApp not enabled for that tenant (403 → "WhatsApp is not enabled" state), the external chatbot service blocked
on purpose (503 `PROVIDER_UNAVAILABLE`), and the POP being refused pages its permission rows do not include
(68 × 403, which its sidebar no longer offers). It also found two real bugs the mocked tests could not:
- `getSimpleQueues()` passed `['?dynamic' => 'false']` where the library takes `[key, value]` tuples → `TypeError`,
  so corporate queues could never load on any router; the legacy RADIUS setup (`CronJob`, `MikrotikSetup`) had
  the same mistake on `/radius/add`, `/ppp/aaa/set`, `/radius/incoming/set` and, worse, caught only `\Exception`
  so the `TypeError` escaped as a 500. All fixed; `RouterOsProtocolTest` drives the real helpers through the real
  client over TCP (mutation-checked: it fails against the old code);
- a POP's RADIUS and corporate-queue pickers offered its parent ISP's router, which the API then refuses to
  manage — those two pages now list only routers the caller owns.

Also fixed in this pass: outbound chatbot/WhatsApp cURL calls had no connect timeout (a dead host pinned a PHP
worker for the full 20 s); a time-of-day flaky test (`CustomerParityTest`, "due today" crossed midnight after
22:00); the `CronController` locks above; tracked OLT driver session files (`olt_brands/token_*.txt`,
`dbcsessions/`) are now git-ignored.

Note: backend tests read `.env`, whose cache handler is the local Redis; some pre-existing tests call
`cache()->clean()`, which flushes local Redis DB 0. Run them against a dev Redis only.

## 5. Still open (needs your decision or environment)

Nothing below is unfinished code; each item needs access, an external service, a business decision or content.

| Item | Status |
|---|---|
| Staging/production migrations | Applied and tested on local `isp_v2` only (63 migrations, `deploy:check` PASS). Run the runbook on staging, then production — a deploy step that needs server access. |
| Server configuration | Set `reward.cronSecret` and the other keys in `.env.example`, add the crontab lines from `corn_job.md`, then run `php spark deploy:check` and `php spark secrets:check` until they exit 0. |
| Secret rotation | `php spark secrets:check` reports any secret that still equals a value once published in `.env.example`. On the local install `security.sessionBridgeKey` and `recaptcha.secretKey` are such values, so check production the same way. |
| Unattended auto-debit | **Closed by decision (2026-10-12): keep reminders + pay link.** Not buildable on what the product has: customers have **no stored balance** — `users.fund` is only ever credited for reseller top-ups, and in the production-like copy all 13,073 customers sit at 0.00 while the fund ledger has rows for resellers only — and every gateway integration needs the customer to approve each payment. Auto-pay therefore sends the bill + pay link before expiry (`autopay-reminders`) and earns the tenant's `autopay_points`. True auto-debit needs a recurring-payment product from a gateway (merchant onboarding) or a customer wallet feature — a business decision. |
| GenieACS server | Worker and customer TR-069 onboarding are tested over real HTTP against a local NBI stub (`GenieAcsLiveHttpTest`); they act on real CPEs once `GENIEACS_NBI_URL` points at a GenieACS server. |
| OLT drivers for c_data, ecom, hsgq, fucascom; Rocket gateway | The repository (and the legacy web) ships no driver script / integration for them, so sync and payment answer an honest 501. They need vendor protocol documentation or an agreement, not a port. |
| Privacy Policy / Terms text | The pages and editor exist, and starter drafts grounded in what the platform collects are in `docs/legal/` (unpublished). Counsel reviews them, fills the `[PLACEHOLDER]`s, and the owner pastes them into Software Settings → Legal pages. |
| Tenant portal detail pages in the browser | `isp_v2` has no tenant portals, so `/platform/tenants/{id}/*` were covered by the API tests only. |
| Two stale OLT session files in git history | `app/Views/olt_brands/token_103.112.131.44_44.txt` and `dbcsessions/session_160_187_159_48.json` are untracked (staged deletion, files kept on disk, now git-ignored) but remain in history since Aug 18 — they are OLT device session tokens, so treat them as exposed if still valid on the device. |
