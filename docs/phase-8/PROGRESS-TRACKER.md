# Phase 8 API Integration — Master Progress Tracker

> **Tracking Rule:** Mark an item `[x]` ONLY after it has passed its strict Test Gate (`pnpm lint && pnpm typecheck && pnpm test`) and has been verified in the browser.

---

## 🟢 Track A: Ready Modules (Frontend Integration against Existing zapi Endpoints)

### Module 0: Foundation & Auth
- [x] `src/lib/api/client.ts` (Axios, Bearer interceptor, 401 refresh queue)
- [x] `src/lib/api/types.ts` & `endpoints.ts` & `query-keys.ts`
- [x] `src/lib/api/services/auth.service.ts` & `adapters/auth.adapter.ts`
- [x] Zustand store update (`src/features/auth/shared/stores/auth-store.ts`)
- [x] Next.js proxy rewrites (`next.config.ts`)
- [x] **Test Gate 0 Passed** (Lint + Typecheck + Unit Tests)

### Module 1: Customer Portal (12 Screens)
- [x] `src/lib/api/services/customer.service.ts` & `adapters/customer.adapter.ts`
- [x] Dashboard & Quota (`useCustomerDashboardQuery`, `useCustomerQuotaQuery`)
- [x] Connected Devices & Usage Graph
- [x] Subscription renew / package switch
- [x] Payments history & online checkout gateway redirect
- [x] Support ticket list, thread & create ticket mutation
- [x] Router Wi-Fi settings & quick-fix ping diagnostics
- [x] Rewards wallet & News announcements
- [x] **Test Gate 1 Passed**

### Module 2 & 3: Admin Dashboard & Customers
- [x] `src/lib/api/services/admin.service.ts` (Core & Customers)
- [x] Admin Dashboard live stats
- [x] Customer CRUD (List, Detail, Create, Update, Delete)
- [x] Bulk actions (Recharge, Delete)
- [x] PPPoE Sync & MAC Binding
- [x] Excel customer import multipart upload
- [x] **Test Gate 2 & 3 Passed**

### Module 4 & 5: Admin Areas, Subareas & Billing
- [x] Area & Subarea CRUD integration
- [x] Customer payment collection & invoice generation
- [x] Reseller subscription renew & POP funding ledger
- [x] **Test Gate 4 & 5 Passed**

### Module 6 & 7: Admin HR & Support Tickets
- [x] Employee directory CRUD & salary distribution
- [x] Staff attendance check-in/out & advance loans
- [x] Support ticket queue, SLA filtering & staff reply mutation
- [x] **Test Gate 6 & 7 Passed**

### Module 8 & 9: Admin SMS & Accounting
- [x] SMS broadcast & Voice SMS campaigns + templates
- [x] Balance Sheet, Chart of Accounts & Journal Entries
- [x] Transaction stream & financial ledger
- [x] **Test Gate 8 & 9 Passed**

### Module 10 & 11: Admin Network & Rewards
- [x] MikroTik Routers & active PPPoE sessions
- [x] IPv4 Pool CRUD & live available IP query
- [x] Reward configuration & customer referral approval
- [x] **Test Gate 10 & 11 Passed**

### Module 12: Employee Portal Self-Service
- [x] `src/lib/api/services/employee.service.ts`
- [x] Payslip view & monthly salary summary
- [x] Advance salary request form
- [x] Staff self attendance check-in/out
- [x] **Test Gate 12 Passed**

---

## 🟡 Track B: New Backend Endpoints (`zapi`) + Frontend Integration

### Admin Missing Modules
- [x] **Package CRUD**: Build `PackageApiController.php` -> Wire `src/features/admin/packages`
- [x] **OLT & Fiber**: Build `OltApiController.php` -> Wire `src/features/admin/olt`
- [x] **Hotspot & Bandwidth**: Build `HotspotApiController.php` -> Wire `src/features/admin/hotspot`
- [x] **Inventory & Purchase**: Build `InventoryApiController.php` -> Wire `src/features/admin/inventory`
- [x] **Reports & BTRC**: Build `ReportApiController.php` -> Wire `src/features/admin/reports`
- [x] **WhatsApp & Settings**: Build `WhatsAppApiController.php` -> Wire `src/features/admin/whatsapp`
- [x] **Admin Extended (Section D8-D13, H, I)**: Bandwidth SLA, Network Maps, Theme Studio, POP details, AI Chat, Invoices/PDF, RADIUS/CoA (Reference `07-ADMIN-EXTENDED-MODULES.md`)

### ISP Engines Suite
- [x] Backend: Build `zapi/Modules/Engines/` catalog & registry endpoints
- [x] Frontend: Wire `src/features/admin/engines/` dynamic schema renderer
- [x] Integration: Automation, Provisioning, CRM, Installation, CX modules (Reference `08-ENGINES-SUITE-PLAN.md`)

### Platform Super-Admin Module
- [x] Backend: Build `zapi/Modules/Platform/` controllers (Tenants, Admins, Revenue, Plugins)
- [x] Frontend: `src/lib/api/services/platform.service.ts`
- [x] Wire Platform Dashboard & Tenant Management
- [x] Wire Platform Admins, Revenue & System Plugins
- [x] Platform Extended: Metering, SLA, File Manager, Redis Inspector (Reference `09-MISC-MODULES.md`)
- [x] **Platform Test Gate Passed**

### Employee Field Ops & Marketing
- [x] Employee: GPS Attendance, Field Installations, Work Orders
- [x] Marketing: Captive Portal, Public Status, Knowledge Base
- [x] Auth: Reset Password, Custom Access Rules

---

## Overall Summary

- **Total Tracked Modules:** 13 Modules + Platform + 18 Engines
- **Frontend Live API Adapters & Services:** 100% Connected (0 remaining mock endpoints)
- **Backend `zapi` Controller & Route Endpoints:** 100% Implemented & Registered
- **Test Suite Pass Rate:** 100% (34/34 tests passing)
- **TypeScript Typecheck:** 0 Errors
- **Turbopack Production Build:** 212/212 Routes Built Cleanly

---

## 🏁 Final Phase 8 Sign-Off
- [x] Full build check: `pnpm typecheck && pnpm test && pnpm build` (212/212 pages built successfully, 34/34 tests passing)
- [x] Zero mock handlers active in production mode (`NEXT_PUBLIC_USE_MOCK_API=false`)
- [x] All customer, admin, employee, and platform user journeys verified end-to-end
