# Phase 8 API Integration — Master Plan & Blueprint

> **Mission:** Transform `isp-web-frontend` into a 100% production-ready, real-API driven application powered by `isppaybd_isp/zapi`. Every single screen, module, and state across **Customer**, **Admin/Reseller**, **Employee**, and **Platform Super-Admin** is documented, tracked, and planned for full backend + frontend integration.

---

## 1. Plan Structure & Documentation Map

The Phase 8 documentation is organized in `docs/phase-8/`:

| Document | Purpose |
|---|---|
| [`00-OVERVIEW.md`](file:///c:/Users/SHOHAN/Documents/GitHub/isp-web-frontend/docs/phase-8/00-OVERVIEW.md) | Architectural standards, HTTP client, interceptors, query key factories, response envelope unwrappers, and error adapters. |
| [`01-FOUNDATION-AND-AUTH.md`](file:///c:/Users/SHOHAN/Documents/GitHub/isp-web-frontend/docs/phase-8/01-FOUNDATION-AND-AUTH.md) | Core Axios client, JWT flow, refresh token queue, auth store, role & permission guards. |
| [`02-CUSTOMER-PORTAL.md`](file:///c:/Users/SHOHAN/Documents/GitHub/isp-web-frontend/docs/phase-8/02-CUSTOMER-PORTAL.md) | All 12 Customer portal screens (Dashboard, Subscriptions, Payments, Support, Wifi/Router, Quotas, Usage, Rewards, News). |
| [`03-ADMIN-READY-MODULES.md`](file:///c:/Users/SHOHAN/Documents/GitHub/isp-web-frontend/docs/phase-8/03-ADMIN-READY-MODULES.md) | 20+ Admin modules with live `zapi` endpoints (Customers, Areas, Payments, Billing, HR, Support, SMS, Voice, Accounting, Routers, IP Pools, Rewards). |
| [`04-ADMIN-BACKEND-BUILD-PLAN.md`](file:///c:/Users/SHOHAN/Documents/GitHub/isp-web-frontend/docs/phase-8/04-ADMIN-BACKEND-BUILD-PLAN.md) | Specification to build missing backend endpoints in `zapi` (Package CRUD, OLT, Hotspot, Bandwidth, Inventory, Purchase, Reports, WhatsApp, Settings). |
| [`05-EMPLOYEE-PORTAL.md`](file:///c:/Users/SHOHAN/Documents/GitHub/isp-web-frontend/docs/phase-8/05-EMPLOYEE-PORTAL.md) | Employee portal self-service endpoints (Salaries, Advance requests, Attendance check-in/out, Profile). |
| [`06-PLATFORM-PORTAL-BUILD-PLAN.md`](file:///c:/Users/SHOHAN/Documents/GitHub/isp-web-frontend/docs/phase-8/06-PLATFORM-PORTAL-BUILD-PLAN.md) | Full specification for new `zapi/Modules/Platform/` backend controllers + frontend integration (Tenants, Admins, Revenue, Plugins, Settings). |
| [`PROGRESS-TRACKER.md`](file:///c:/Users/SHOHAN/Documents/GitHub/isp-web-frontend/docs/phase-8/PROGRESS-TRACKER.md) | Comprehensive checklist tracking every endpoint, service, hook, page, and test gate. |

---

## 2. Core Execution Principles

1. **Zero Mock in Final Build**: Every feature must connect to real endpoints with zero fallback to static mock files.
2. **Build-Test-Advance Gate**:
   ```bash
   # Strict check before any module is marked complete:
   pnpm lint && pnpm typecheck && pnpm test
   ```
3. **Data Shape Protection**: All backend responses pass through typed schema adapters to ensure UI consistency (`snake_case` -> `camelCase`).
4. **Resilient UX**: Error boundaries, loading skeletons, and form error mappings (422) for all user actions.
