# Phase 8 — Platform Super-Admin Backend & Integration Plan

---

## 1. Scope & Objective
Create a dedicated `isppaybd_isp/zapi/Modules/Platform/` module on the backend to expose standard REST APIs for the Platform Super-Admin portal, then replace mock handlers across all 15 platform frontend features.

---

## 2. New Backend Module: `zapi/Modules/Platform/`

### 2.1 Route Definitions: `zapi/config/v1_platform_routes.php`
* Filter Stack: `zapijwt` -> `zapirole:superadmin`

### 2.2 Endpoints Specification

#### Platform Dashboard & Metrics
* `GET /api/v1/platform/dashboard` — Platform tenant counts, active MRR, system load, SMS gateway balances.

#### Tenant Management (`PlatformTenantApiController.php`)
* `GET /api/v1/platform/tenants` — Paginated list of ISP tenants/resellers.
* `GET /api/v1/platform/tenants/{tenantId}` — Deep tenant diagnostics (database, domain, license).
* `POST /api/v1/platform/tenants` — Provision new ISP company tenant.
* `PUT /api/v1/platform/tenants/{tenantId}` — Update subscription plan & bandwidth limit.
* `POST /api/v1/platform/tenants/{tenantId}/suspend` — Instant tenant lock/suspend.

#### Super-Admin Accounts (`PlatformAdminApiController.php`)
* `GET/POST/PUT/DELETE /api/v1/platform/admins/*` — Manage global super-admin accounts & permissions.

#### Platform Revenue & Subscriptions (`PlatformRevenueApiController.php`)
* `GET /api/v1/platform/revenue` — Platform monthly recurring revenue, pending reseller invoices.
* `POST /api/v1/platform/revenue/invoice` — Generate billing invoice for ISP tenant.

#### System Plugins & Redis (`PlatformSystemApiController.php`)
* `GET/POST /api/v1/platform/plugins` — Enable/disable modular system plugins (bKash tokenized, AI Chat, etc.).
* `GET /api/v1/platform/redis-logs` — Live Redis cache metrics and task queue health.

---

## 3. Frontend Platform Features to Connect
- `src/features/platform/dashboard`
- `src/features/platform/tenants`
- `src/features/platform/admins`
- `src/features/platform/revenue`
- `src/features/platform/plugins`
- `src/features/platform/contacts`
- `src/features/platform/settings`
- `src/features/platform/user-access`
