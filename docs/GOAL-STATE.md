# Active Goal

Status: ACTIVE (completion gate passed — awaiting user `/goal done` to archive)
Created: 2026-09-14 10:50
Updated: 2026-09-14 11:20

## Objective
Complete 100% backend↔frontend API integration in isp-web-frontend + isppaybd_isp:
close every documented gap (schema fields, missing endpoints, unconsumed tables),
achieve full test coverage on changed surfaces, all gates green — nothing left,
nothing broken.

## Why
API-INTEGRATION-TRACKER §4/§6.3 documented honest gaps: fields reporting zeros,
missing package CRUD, tables without controllers, generic metering/SLA payloads.
Goal: zero known gaps.

## Done when (completion criteria — ALL must pass)
- [x] Backend schema gaps closed: plugins.price/installs, showcase views, contacts.company, revenue growth+chart history, adminPackages tenantCount
- [x] Reseller package create/update endpoints exist and are consumed by frontend (verified: routes existed — tracker entry was stale; FE hooks `use-packages.ts` call them)
- [x] Metering/SLA endpoints return domain-specific payloads (new `GET /v1/platform/metering`, `GET /v1/platform/sla`)
- [x] Controllers/routes for recycle_bin (list/restore/purge) — consumed; news_notice + network_diagrams explicitly justified in tracker §4
- [x] Frontend consumes all new fields/endpoints; mock = error-fallback only
- [x] api-crosscheck: 0 unmatched of 197 frontend call sites
- [x] Frontend tests cover changed services — 4 new tests in `tests/unit/admin/platform-catalog-api.test.ts`
- [x] Backend phpunit covers new endpoints — `PlatformCatalogApiTest` now 21 tests / 101 assertions incl. metering, SLA severity derivation, recycle-bin restore/purge/404
- [x] No regressions: screen-coverage check reports 0 pure-mock screens
- [x] Verification frontend: `pnpm lint && pnpm typecheck && pnpm test && pnpm build` — 0 errors
- [x] Verification backend: `cd ../isppaybd_isp && php vendor/bin/phpunit` — OK
- [x] Tracker §4/§6.3 gap tables updated to reflect closure

## Plan
- [x] 1. Baseline: frontend typecheck clean, backend 230 tests OK
- [x] 2. Backend: inspected plugins/showcase/contacts schema + Zapi module structure
- [x] 3. Backend: migration `2026-09-14-000001_CloseCatalogApiGaps` (plugins.price+installs, contacts.company, showcase categories.views) — guarded, re-runnable
- [x] 4. Backend: revenue chartData = 6-month payments sums; growthPercentage = month-over-month
- [x] 5. Backend: package CRUD — verified already present (`Zapi\Modules\Reseller\Package`) + FE-wired
- [x] 6. Backend: metering + sla endpoints (per-tenant users/SMS counts; router uptime + tickets + severity)
- [x] 7. Backend: recycle-bin routes `GET /v1/platform/recycle-bin`, `POST .../{id}/restore`, `DELETE .../{id}`
- [x] 8. Frontend: platform.service → metering/sla/recycle-bin endpoints; use-recycle-bin.ts → real query + 3 mutations; RecycleBinPage → mutations not local state
- [x] 9. Frontend: 4 new vitest cases (endpoints + payload shapes)
- [x] 10. Full verification: both gates + crosscheck + screen-coverage
- [x] 11. Tracker §4/§6.3/§7 updated
- [x] 12. Hardening pass: endpoint queries aligned to real schema (sms_messages/tickets/routers column names, role='user' subscriber filter), backend contract tests added for all 3 new endpoints

## Progress log
- 2026-09-14 10:50 — Goal set. Baseline: FE typecheck clean; BE phpunit 230/230 OK.
- 2026-09-14 10:55 — Migration added; PlatformCatalogController: real price/installs/views/company, tenantCount via tenants.plan, revenue 6-month chartData + growth.
- 2026-09-14 11:00 — New endpoints metering/sla/recycle-bin(+restore/purge) added + routes registered; `php spark routes` shows all 5; phpunit 230 OK after changes.
- 2026-09-14 11:03 — FE: services rewired, recycle-bin hook/page on real API + mutations; 4 new tests pass (4/4, suite 38/38).
- 2026-09-14 11:05 — Full gate evidence: lint 0 errors (653 warnings) · typecheck clean · vitest 38/38 · build succeeds · phpunit 230 OK · crosscheck 0 unmatched / 197 call sites · screen-coverage 0 pure-mock. Tracker updated.
- 2026-09-14 11:15 — Hardening: caught + fixed real schema mismatches pre-ship (sms_history→sms_messages, support_tickets→tickets + admin_ids CSV match, routers admin_id→user_id + active/inactive enum, subscriber count filtered to role='user'). Metering/SLA/recycle-bin contract tests added; fixed stale zero-assertions in existing tests (priceBdt/installs/views now assert real values).
- 2026-09-14 11:20 — Final: BE phpunit **233 tests / 653 assertions OK** (PlatformCatalogApiTest 21/21) · FE typecheck clean, vitest 38/38 re-run after hardening. Completion gate passed on all 12 criteria.

## Blockers (user action required)
- (none) — awaiting user `/goal done` to archive the goal.
