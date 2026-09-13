# 02. Remaining Integration Work

> **Corrected 2026-09-13.** This file previously claimed "488 endpoints, 100%
> integrated". Verification against the real route table
> (`php spark routes`) and the frontend source showed that was overstated.
> Authoritative status lives in [`../API-INTEGRATION-TRACKER.md`](../API-INTEGRATION-TRACKER.md).

---

## 1. Actual State

The backend registers **499 `api/*` routes** (263 of them under `api/v1`). All
**122 real API call sites in the frontend resolve to a real backend route** —
there are no broken calls — and **no screen depends on pure mock data**.

| Area | Status |
|---|---|
| API call ↔ route consistency | ✅ Verified, 122/122 resolve |
| Pure-mock screens | ✅ 0 remaining (was 16) |
| Router live ops (sessions, DHCP, queues, disconnect) | ✅ MikroTik-backed routes added |
| Reseller settings / gateways / audit trail / self-subscription | ✅ Routes added |
| Platform tenant detail, health, admins, packages, plugins, showcase, contacts, revenue, sidebar pins, logs, file manager | ✅ Routes added |
| BTRC report | ✅ Route added (`reports/btrc/{id}`) |
| Customer dashboard / profile / change-password / payments | ✅ Routes added or remapped |
| AI chat | ✅ Data-backed `POST /v1/ai/chat` |
| Forgot password | ✅ `POST /api/common/forgot-password` (real reset link + email) |
| Role permissions / custom access | ✅ `role-permissions/{role}`, `custom-access` |
| `getMetering` / `getSla` semantic accuracy | ⚠️ Calls succeed but return generic payloads |
| Schema gaps (plugin price/installs, showcase views, lead company, revenue trend) | ⚠️ Report zeros honestly — see the tracker's §4 |

### Backend surfaces that do **not** exist

These were previously listed as "backend endpoints ready". They are not
implemented anywhere in `zapi`:

- `/api/v1/reseller/invoices/{id}/pdf` — only `api/v1/customer/invoice-print` exists
- `/api/v1/reseller/trash` — no route; the `recycle_bin` table is unwired
- `/api/v1/customer/store/products` — no route; `product_showcase_*` tables are unwired
- `/api/v1/ai/query` — internal AI feeds live at `api/internal/ai/*`
- `/api/v1/reseller/corporate/{id}/invoices` — unrelated route; corporate queues are at `/v1/reseller/customers/{id}/corporate-queues`
- `/api/v1/admin/*` — the entire prefix; the real surface is `/api/v1/reseller/*`


---

## 2. Incomplete Modules & Screen Mapping

### 2.1 Deep MikroTik Controls & Network (`/admin/network/*`, `/admin/bandwidth`)
- **Current State:** Screens render UI with mock interface lists and static graph charts.
- **Backend Endpoints Ready:**
  - `GET /api/v1/reseller/routers/{id}/traffic` (Live Rx/Tx stream)
  - `GET /api/v1/reseller/routers/{id}/sessions` (Active PPPoE connections)
  - `POST /api/v1/reseller/routers/{id}/disconnect` (Kill active session)
  - `GET /api/v1/reseller/routers/{id}/dhcp-leases` (DHCP leases table)
  - `GET /api/v1/reseller/routers/{id}/queues` (Bandwidth throttles)
- **Frontend Target:** Replace `mockFetch('network.routers')` in `src/features/admin/network/`.

### 2.2 Invoicing & Telecom Compliance Reports (`/admin/reports/*`, `/admin/invoices/*`)
- **Current State:** Static tables for BTRC and monthly billing summaries.
- **Backend Endpoints Ready:**
  - `GET /api/v1/reseller/reports/btrc/{id}` (BTRC user statistics)
  - `GET /api/v1/reseller/reports/revenue/{id}` (Monthly cash collection trends)
  - `GET /api/v1/reseller/invoices/{id}` (Invoice details and PDF format)
  - `GET /api/v1/reseller/corporate/{id}/invoices` (Corporate enterprise billing)
- **Frontend Target:** Replace mock tables in `src/features/admin/reports/`.

### 2.3 Inventory Management & Supplier Purchase (`/admin/inventory/*`, `/admin/purchase/*`)
- **Current State:** Mock list of fiber patch cords, routers, and ONUs.
- **Backend Endpoints Ready:**
  - `GET/POST /api/v1/reseller/inventory/{id}` (Stock quantity & alerts)
  - `GET/POST /api/v1/reseller/purchase/{id}` (Vendor purchase orders)
- **Frontend Target:** Replace mock data in `src/features/admin/inventory/`.

### 2.4 OLT & Hotspot Voucher Engine (`/admin/olt/*`, `/admin/hotspot/*`)
- **Current State:** Mock display of PON ports and voucher generation modal.
- **Backend Endpoints Ready:**
  - `GET /api/v1/reseller/olt/{id}` (OLT devices list)
  - `GET /api/v1/reseller/olt/{id}/optical-power` (dBm signal telemetry)
  - `GET /api/v1/reseller/hotspot/{id}` (Hotspot server status)
  - `POST /api/v1/reseller/hotspot/vouchers/{id}/batch` (Batch voucher generation)
- **Frontend Target:** Replace mock data in `src/features/admin/olt/` and `src/features/admin/hotspot/`.

### 2.5 Field Staff Attendance & GPS Punch (`/admin/hr/*`, `/employee/attendance`)
- **Current State:** Mock attendance calendars and punch buttons.
- **Backend Endpoints Ready:**
  - `POST /api/v1/reseller/employees/{id}/attendance/check-in`
  - `POST /api/v1/reseller/employees/{id}/attendance/check-out`
  - `POST /api/v1/reseller/employees/{id}/attendance/location`
- **Frontend Target:** Replace mock hooks in `src/features/employee/attendance/`.

### 2.6 SMS Templates & WhatsApp Automated Bots (`/admin/sms-templates`, `/admin/whatsapp`)
- **Current State:** Mock template editor and mock QR code modal.
- **Backend Endpoints Ready:**
  - `GET/POST /api/v1/reseller/sms/{id}/templates`
  - `GET/POST /api/v1/reseller/whatsapp/{id}/templates`
  - `GET /api/v1/reseller/whatsapp/settings/{id}`
- **Frontend Target:** Replace mock templates in `src/features/admin/whatsapp/`.
