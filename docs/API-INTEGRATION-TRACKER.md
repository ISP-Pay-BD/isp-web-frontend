# ISP Pay BD — Frontend API Integration & Progress Tracker

> **Status of frontend ↔ `zapi` backend integration, verified against the real
> route table (`php spark routes`) and the frontend source — not against intent.**
>
> Verification method and raw numbers: see §5. Last verified: 2026-09-14
> (gap-closure pass — see §4 and §7).

---

## 7. Mock-fallback audit pass (2026-09-14)

> **2026-09-14 gap-closure verification:** lint 0 errors (653 warnings) ·
> typecheck clean · vitest **38/38** (4 new) · build succeeds · backend phpunit
> **233 tests / 653 assertions OK** (PlatformCatalogApiTest: 21 tests incl.
> metering, SLA, recycle-bin restore/purge contracts) · api-crosscheck
> **0 unmatched** of 197 call sites · screen-coverage check **0 pure-mock**.
> New: `GET platform/metering`, `GET platform/sla`,
> `GET/POST/DELETE platform/recycle-bin*`.

The crosscheck proves a call site *exists*; this pass proves its **response is
actually used**. Two hooks called the API, discarded the result, and always
returned mock data (invisible to every route-based check):

| File | Was | Now |
|---|---|---|
| `use-marketing-pricing.ts` | `http.get('/v1/platform/subscriptions')` then unconditional `return mock` | static pricing dataset imported directly — marketing pricing is site content, not tenant data; `/v1/platform/subscriptions` returns platform-tenant billing rows (admin surface), semantically wrong for public tiers |
| `use-marketing-plugins.ts` | `http.get('/v1/engines/catalog')` (phantom route) then unconditional `return mock` | real `GET /v1/platform/plugins` (`{items:[{id,name,category,desc,priceBdt,installs}]}`) mapped into the marketplace card shape; falls back to static marketplace content on error/shape mismatch |

Verified state after the pass:

- Files importing `mock-api`: **23** (down from 35 — was under-counted in §1)
- Files where mock is the **primary** data source: **0**
- All remaining `mockFetch` uses are inside a `catch` block (API-first,
  static/mock fallback only on backend failure)

## 6. Reverse-check pass (2026-09-13): backend routes → frontend consumers

The original verification only proved every *frontend call* resolves to a real
backend route. This pass adds the reverse check: every backend `api/v1/*` route
must be matched by some frontend call (prefix-aware, CodeIgniter regex params
normalised). Tool: `scripts/api-crosscheck.mjs` (run with the dumped route
table, see §5).

### 6.1 Real call-site bugs found & fixed

| Bug | Was | Now |
|---|---|---|
| Admin news list | `GET /api/common/news` — axios baseURL already ends in `/api`, so the request went to `/api/api/common/news` (404) | `GET /common/news` |
| Customer reward redeem | `POST /v1/customer/reward/redeem-preview` — backend only registers **GET**; also required `package_id` which was never sent | `GET /v1/customer/reward/redeem-preview?package_id=&points=` |
| Customer reward wallet | returned raw backend wallet; UI shape mismatch (`pointsBalance` vs `balance`) and referral code/counts never fetched | composes `reward/wallet` + `referral/overview` (`Promise.allSettled`) into the UI shape |
| Customer autofix tools | `quickFixPing` called `/autofix/quick-fix` for every tool; backend reads `user_id` from the **query string** even on POST, and each tool has its own endpoint | per-tool mapping: `quick_fix→quick-fix`, `reset_session→reset-session`, `reconnect→reconnect`, `dns_flush→flush-dns`, with `user_id` + `issue` query params |
| Admin rewards screen | hook cast the API payload to the *mock* shape (`data.config.pointsPerReferral` — always `undefined` on live data); approve/reject/config-save were local state only | composes `rewards/{id}/config` + `referrals/{id}` + `rewards/{id}/report`; real mutations `PUT rewards/{id}/config`, `POST referrals/{id}/{rid}/approve|reject` |

### 6.2 Backend v1 routes newly wired

| Domain | Routes now consumed |
|---|---|
| Rewards (reseller) | `GET/PUT rewards/{id}/config`, `GET rewards/{id}/report`, `GET rewards/{id}/wallets`, `GET/PUT rewards/global-config` |
| Referrals (reseller) | `GET referrals/{id}`, `GET referrals/{id}/{rid}`, `POST referrals/{id}/{rid}/approve`, `POST referrals/{id}/{rid}/reject` |
| Reseller billing | `GET payments/{id}`, `GET make-reseller-payment/{id}` (+ `json/` variants) |
| Areas | `GET areas/edit/{id}`, `DELETE areas/delete` (bulk) |
| Reports / inventory | `GET reports/export?type=`, `POST inventory/transactions` |
| Customer extras | `GET notifications`, `POST notifications/read`, `GET subscription/quota`, `GET usage`, `GET reward/transactions`, `GET referral/history` |
| Customer actions | `POST autofix/{reboot,reconnect,flush-dns,reset-session,quick-fix}`, `POST router-control/reboot`, `GET router-control/devices` |
| Customer gateway | `GET make-payment/{id}`, `GET make-reseller-payment/{id}` (+ `json/` variants) |

### 6.3 Remaining known-unconsumed v1 routes (accepted gaps)

| Route | Why not wired |
|---|---|
| `POST auth/login`, `POST auth/refresh` | called via `API_ENDPOINTS` constants, not string literals — false positive |
| `POST autofix/*` | called via dynamic `` `/v1/customer/autofix/${action}` `` — false positive |
| `GET features`, `GET features/{id}` | feature-flag surface with no screen yet |
| `GET/POST subscription/activate-package`, `POST subscription/update` | admin-side subscription ops; customer portal does renew only |
| `POST router-control/onboard-tr069` | TR-069 onboarding is an installer flow, not customer self-care |
| `GET ping-user`, `GET routers/load-traffic/{id}`, `GET users-load-traffic/{id}` | live-traffic probes not surfaced in customer UI |
| `GET invoice-print`, `GET permission` (both portals) | print view / raw permission dump not consumed |
| Package create/update (`POST/PUT reseller/packages/*`) | ✅ **Resolved 2026-09-14** — routes **do exist** (`POST packages/{id}`, `PUT packages/{id}/{pkgId}`, `DELETE packages/{id}/{pkgId}` → `Zapi\Modules\Reseller\Package`) and the frontend consumes them via `use-packages.ts` mutations; tracker entry was stale |

---

## 1. Verified Metrics

| Metric | Value | How measured |
|---|:---:|---|
| Backend registered routes (all) | **1068** rows | `php spark routes` |
| Backend `api/*` routes | **499** | filtered route table (465 before this work, **+34 added**) |
| `api/v1/*` routes | **263** | filtered route table |
| Frontend real `http.*()` call sites | **122** | every `http.get/post/put/patch/delete/upload` in `src/` |
| **Call sites that resolve to a real backend route** | **122 / 122** | automated cross-check (§5) |
| Frontend `*Page.tsx` screens | **203** | `find src/features -name '*Page.tsx'` |
| Screens backed by pure mock data | **0** | verified by dependency scan (§5) |
| Files still referencing `mock-api` | 26 | API-first with a mock **fallback** on error (graceful degradation, not a dependency) |

**Overall: complete. Every live call resolves and no screen reads mock data as
its source of truth.**

### Verify commands

```bash
# Frontend
pnpm lint && pnpm typecheck && pnpm test && pnpm build
# Backend
cd ../isppaybd_isp && php vendor/bin/phpunit && php spark routes
```

Last run: lint **0 errors** (654 warnings) · typecheck **clean** · tests
**34/34 pass** · build **succeeds** · backend phpunit **194 tests, 517 assertions, OK**.

Screen-coverage check (must report **0**):

```bash
cd isp-web-frontend
for f in $(grep -rl mockFetch src --include=*.ts --include=*.tsx \
  | grep -v 'src/lib/mock-api/client.ts' | grep -v 'src/data/index.ts'); do
  grep -qE 'http\.(get|post|put|patch|delete)|apiClient\.|Service\.|/v1/|/common/' "$f" || echo "PURE-MOCK: $f"
done
```

---

## 2. Backend surface

The backend exposes **two generations** of routes. Use the `v1` forms.

| Generation | Count | Example |
|---|:---:|---|
| `api/v1/*` (current) | 229 | `api/v1/reseller/customers/{id}/index` |
| `api/*` legacy (no version) | ~257 | `api/common/news` |

> **`/api/v1/admin/*` does not exist.** The backend's tenant-admin surface is
> `/api/v1/reseller/*` and the customer surface is `/api/v1/customer/*`.
> `src/lib/api/endpoints.ts` previously declared ~94 `/v1/admin/*` paths that
> were never implemented; they have been removed.

---

## 3. Fixed in this pass (call-site ↔ route mismatches)

Each of these previously hit a route the backend does not have.

### 3.1 Frontend remapped onto existing routes

| Service | Was | Now |
|---|---|---|
| `customerService.getDashboard` | `GET /v1/customer/dashboard` ✗ | `GET /v1/customer/users/{id}` (returns the full self-care payload) |
| `customerService.getProfile` | `GET /v1/customer/profile` ✗ | `GET /v1/customer/users/{id}` |
| `customerService.getNews` | `GET /v1/common/news` ✗ | `GET /common/news` |
| `customerService.getNewsById` | `GET /v1/common/news/{id}` ✗ | `GET /common/news/view/{id}` |
| `customerService.getPackages` | missing `user_id` (400) | `GET /v1/customer/packages?user_id=` |
| `customerService.getPayments` | missing `user_id` (400) | `GET /v1/customer/payment-fetch?user_id=` |
| `CorporateQueuesPage` | `.../corporate-queues/1` (hardcoded router) | `.../corporate-queues` |
| `AiChatPage` | `POST /api/chat` (double-prefixed → `/api/api/chat`) | `POST /v1/ai/chat` |
| `platformService.getAdmins` | pointed at `/v1/platform/tenants` (wrong data) | `GET /v1/platform/admins` |
| `platformService.getSupportTickets` | pointed at `/v1/platform/system-health` (wrong data) | `GET /v1/platform/support-tickets` |

### 3.2 Screen coverage — 16 pure-mock screens wired (now 0)

| Screen | Now backed by |
|---|---|
| `MovieServersPage` | `GET /common/movieservers` |
| `PaymentGatewaysPage`, `PaymentGatewayDetailPage` | `GET /v1/reseller/payment-gateways/{id}` (config + settlement figures from the payments ledger) |
| `AdminsListPage` | `GET /v1/platform/admins` |
| `AdminPackagesPage` | `GET /v1/platform/admin-packages` |
| `PluginsPage` | `GET /v1/platform/plugins` |
| `ShowcasePage`, `AdminProductShowcasePage` | `GET /v1/platform/showcase` |
| `ContactsPage` | `GET /v1/platform/contacts`, `PATCH /v1/platform/contacts/{id}/status` |
| `RevenuePage` | `GET /v1/platform/revenue` |
| `SidebarPinsPage` | `GET /v1/platform/sidebar-pins` |
| `MaintenancePage` | `GET/POST /v1/platform/settings` |
| `RedisLogsPage` | `GET /v1/platform/redis-logs` (real framework log files + live Redis stats) |
| `FileManagerPage` | `GET /v1/platform/file-manager` (read-only, path-confined) |
| `UserAccessPage` (admin) | `GET/POST /v1/reseller/role-permissions/{role}`, `GET /v1/reseller/custom-access` |
| `ForgotPasswordPage` | `POST /api/common/forgot-password` (real reset link + email) |
| `DemoUserPicker` | Local seeded demo credentials (not API data — demo affordance) |

### 3.3 Dead code deleted

| Item | Why |
|---|---|
| `endpoints.ts` → `/v1/admin`, `/v1/customer`, `/v1/employee`, `/v1/platform` blocks (~94 paths) | Routes never existed; only `auth` was ever imported |
| `platformService.getContacts` | 0 callers |
| `platformService.updateContactStatus` | 0 callers; `contacts` table has no status column |
| `platformService.getRedisLogs` | 0 callers |

### 3.4 Backend routes added (34)

| Domain | Routes |
|---|---|
| Router live ops | `GET routers/{id}/sessions`, `POST routers/{id}/disconnect`, `GET routers/{id}/dhcp-leases`, `GET routers/{id}/queues` |
| Reseller extras | `GET settings/{id}`, `GET payment-gateways/{id}`, `GET customers/{id}/audit-logs`, `GET customers/{id}/corporate-queues`, `GET subscription/{id}`, `POST subscription/{id}/recharge` |
| Reports | `GET reports/btrc/{id}` |
| Platform | `GET tenants/{id}`, `DELETE tenants/{id}`, `GET tenants/{id}/health`, `GET admins`, `GET support-tickets`, `GET settings`, `POST settings` |
| Customer | `POST payments`, `POST profile/change-password` |
| AI | `POST v1/ai/chat` |
| Platform catalog | `GET admin-packages`, `GET plugins`, `GET showcase`, `GET contacts`, `PATCH contacts/{id}/status`, `GET revenue`, `GET sidebar-pins`, `GET redis-logs`, `GET file-manager` |
| Permissions | `GET/POST role-permissions/{role}`, `GET custom-access` |
| Auth | `POST /api/common/forgot-password` |

Implementation notes:
- Router live ops use the existing MikroTik helpers (`getactive_user`,
  `getSimpleQueues`, `\RouterOS\Query`) and answer with
  `{ router_online: false, items: [] }` when a router is unreachable — an empty
  state, never a 404.
- Payment and recharge endpoints record a **pending** row only; settlement stays
  with the payment-gateway callback. They never mark a payment successful.
- `password_hash` / `password_verify` are used for password changes, matching
  the existing auth flow.
- `POST /v1/ai/chat` is a data-backed ops assistant reading the tenant's own
  tables — it is intentionally not a free-form LLM proxy.

---

## 4. Known data limitations (honest gaps, not broken calls)

> **2026-09-14 — gap-closure pass.** All schema/semantic gaps below were closed
> (migration `2026-09-14-000001_CloseCatalogApiGaps`, new Zapi endpoints, new
> frontend wiring + tests). Remaining notes are genuinely informational.

| Field | Status |
|---|---|
| Plugin `priceBdt` / `installs` | ✅ **Closed** — real `plugins.price` (existed via 2026-08-30 migration) + new `plugins.installs` counter column; controller now reads both |
| Showcase `views` | ✅ **Closed** — new `product_showcase_categories.views` column; controller reads it |
| Contact `company` | ✅ **Closed** — new `contacts.company` column; controller maps it |
| `revenue.growthPercentage`, `chartData` | ✅ **Closed** — computed from 6 months of real `payments` ledger sums (month-over-month growth) |
| `adminPackages.tenantCount` | ✅ **Closed** — counted from active `tenants.plan` matching the package name |
| `redisLogs.stats` sessions | Only populated when the cache handler is Redis (inherent — no Redis, no session store) |

### Semantic (was generic — now real)

- ✅ `platformService.getMetering` → dedicated **`GET /v1/platform/metering`**
  (per-tenant users/SMS row counts, real period).
- ✅ `platformService.getSla` → dedicated **`GET /v1/platform/sla`** (router
  uptime %, open tickets, derived severity vs 99.5% target).

### Tables without a controller — status

| Table | Status |
|---|---|
| `recycle_bin` | ✅ **Closed** — new `GET /v1/platform/recycle-bin`, `POST .../{id}/restore`, `DELETE .../{id}`; frontend hook + page wired to real API with mutations |
| `news_notice` | Not consumed by any screen; legacy `common/news` surface covers announcements — no route invented |
| `network_diagrams` | No such data exists in the deployed schema (OLT topology is served live from `olt/topology`); no route invented |

---

## 5. Verification method

1. Dump the authoritative route table:
   `cd ../isppaybd_isp && php spark routes`
2. Extract `METHOD<TAB>api/path` rows, normalise every `(:segment)` /
   `([0-9]+)` parameter to `:id`.
3. Parse every `http.get|post|put|patch|delete|upload(...)` call site in
   `src/**/*.ts(x)`, normalise `${...}` interpolations to `:id`, and diff
   against the backend set.
4. Result: **122 call sites, 0 real unmatched.**

One path is reported by a naive textual scan but is **not** a mismatch:
`admin.service.ts` builds
`` `/v1/reseller/accounting/${id}/${endpoint}` `` where `endpoint` is one of
`balance-sheet` | `chart-of-accounts` | `journal-entries` — all three exist.

### Re-run the check

```bash
cd ../isppaybd_isp && php spark routes | grep '^| ' \
  | awk -F'|' '{gsub(/^ +| +$/,"",$3); print $3}' | grep '^api/' | sort -u
```

Then grep the frontend for `http.` call sites and compare. The pass/fail
condition for this tracker is **0 unmatched call sites**.
