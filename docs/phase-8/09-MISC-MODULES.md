# Phase 8 — Platform Extended & Miscellaneous Modules

> Covers remaining gaps from the Coverage Audit: Platform extensions, Employee field ops, Marketing dynamic pages, and Auth edge cases.

---

## 1. Platform Super-Admin Extended

| Feature | Route | Backend Strategy (`zapi/Modules/Platform/`) |
|---|---|---|
| Platform Metering | `/platform/metering` | `GET /api/v1/platform/metering` (Global API/Bandwidth usage stats) |
| Tenant Health | `/platform/tenants/[id]/health` | `GET /api/v1/platform/tenants/{id}/health-check` (DB, Redis, Sync status) |
| Tenant Billing Mode | `/platform/admins/[id]/billing` | `PUT /api/v1/platform/tenants/{id}/billing-config` (Prepaid/Postpaid toggle) |
| Platform SLA | `/platform/sla` | `GET /api/v1/platform/sla-reports` |
| Maintenance Mode | `platform.maintenance` | `PUT /api/v1/platform/system/maintenance` (Toggle global maintenance lock) |
| File Manager | `/platform/file-manager` | `GET/POST /api/v1/platform/system/files` (S3/Local log explorer) |
| Redis Logs Detail | `/platform/redis-logs` | `GET /api/v1/platform/system/redis-inspector` |
| Domain Resolution | `*.domain` mocks | Central `GET /api/common/resolve-tenant?domain={host}` |

---

## 2. Employee Field Operations

| Feature | Route | Backend Strategy (`zapi/Modules/Reseller/`) |
|---|---|---|
| Employee GPS Attendance| `/employee/attendance` | `POST /api/reseller/employees/{resellerId}/attendance/gps-check-in` |
| Jobs / Work Orders | `/employee/jobs` | `GET/PUT /api/reseller/work-orders/{resellerId}` (Assigned tickets & dispatch) |
| Field Installations | `/employee/installations` | `GET/POST /api/reseller/installations/{resellerId}` (New customer setup logs) |

---

## 3. Marketing & Public Pages

| Feature | Route | Backend Strategy |
|---|---|---|
| Captive Portal | `/captive` | Client-side UI that submits to `POST /api/customer/hotspot/login` |
| Public Status Page | `/status` | `GET /api/common/system-status` (Network uptime, scheduled maintenance) |
| Knowledge Base / Help | `/help`, `/customer/help` | `GET /api/common/knowledge-base/articles` |
| Plugin Detail | `/plugins/[slug]` | `GET /api/common/plugins/{slug}` |
| News Item Detail | `news.item` | `GET /api/common/news/{id}` |

---

## 4. Auth & Security Edge Cases

| Feature | Route/Key | Backend Strategy (`zapi/v1_auth_routes.php`) |
|---|---|---|
| Reset Password | `/reset-password` | `POST /api/v1/auth/reset-password` (Via email token or SMS OTP) |
| Custom Access Rules | `auth.customAccess.list`| `GET/PUT /api/v1/auth/roles/custom-overrides/{userId}` |
| Demo Credentials | `auth.demoCredentials` | Static UI helper (no backend needed, pre-fills login form) |
| Shared Ticket Detail | `support.ticket` | `GET /api/common/support/tickets/{ticketId}` (Cross-portal schema) |
