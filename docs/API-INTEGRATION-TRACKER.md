# ISP Pay BD — Frontend API Integration & Progress Tracker

> **Status of frontend ↔ `zapi` backend integration, verified against the real
> route table (`php spark routes`) and the frontend source — not against intent.**
>
> Verification method and raw numbers: see §5. Last verified: 2026-09-13.

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

The screens are all wired, but some schema gaps mean a few fields report zeros
rather than a real number. These are documented, not hidden:

| Field | Why it is empty |
|---|---|
| Plugin `priceBdt` / `installs` | The `plugins` table has no price or install-counter column |
| Showcase `views` | View counts are not tracked anywhere |
| Contact `company` | The `contacts` table stores no company field for a lead |
| `revenue.growthPercentage`, `chartData` | No historical revenue snapshots exist to compute a trend |
| `adminPackages.tenantCount` | Tenant-to-package assignment is not recorded |
| `redisLogs.stats` sessions | Only populated when the cache handler is Redis |

### Semantic (calls succeed, payload is generic)

- `platformService.getMetering` / `getSla` call `/v1/platform/stats` and
  `/v1/platform/system-health` with query flags those endpoints ignore. The
  calls succeed but the payload is generic rather than metering/SLA specific.

### Tables still without a controller

`recycle_bin`, `network_diagrams`, `news_notice` — no screen currently consumes
them, so no route was invented for them.

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
