# Phase 8 API Integration — Master Progress Tracker

> **Tracking Rule:** Mark an item `[x]` ONLY after it has passed its strict Test Gate (`pnpm lint && pnpm typecheck && pnpm test`) and has been verified in the browser.

---

## 🟢 Track A: Ready Modules (Frontend Integration against Existing zapi Endpoints)

### Module 0: Foundation & Auth
- [ ] `src/lib/api/client.ts` (Axios, Bearer interceptor, 401 refresh queue)
- [ ] `src/lib/api/types.ts` & `endpoints.ts` & `query-keys.ts`
- [ ] `src/lib/api/services/auth.service.ts` & `adapters/auth.adapter.ts`
- [ ] Zustand store update (`src/features/auth/shared/stores/auth-store.ts`)
- [ ] Next.js proxy rewrites (`next.config.ts`)
- [ ] **Test Gate 0 Passed** (Lint + Typecheck + Unit Tests)

### Module 1: Customer Portal (12 Screens)
- [ ] `src/lib/api/services/customer.service.ts` & `adapters/customer.adapter.ts`
- [ ] Dashboard & Quota (`useCustomerDashboardQuery`, `useCustomerQuotaQuery`)
- [ ] Connected Devices & Usage Graph
- [ ] Subscription renew / package switch
- [ ] Payments history & online checkout gateway redirect
- [ ] Support ticket list, thread & create ticket mutation
- [ ] Router Wi-Fi settings & quick-fix ping diagnostics
- [ ] Rewards wallet & News announcements
- [ ] **Test Gate 1 Passed**

### Module 2 & 3: Admin Dashboard & Customers
- [ ] `src/lib/api/services/admin.service.ts` (Core & Customers)
- [ ] Admin Dashboard live stats
- [ ] Customer CRUD (List, Detail, Create, Update, Delete)
- [ ] Bulk actions (Recharge, Delete)
- [ ] PPPoE Sync & MAC Binding
- [ ] Excel customer import multipart upload
- [ ] **Test Gate 2 & 3 Passed**

### Module 4 & 5: Admin Areas, Subareas & Billing
- [ ] Area & Subarea CRUD integration
- [ ] Customer payment collection & invoice generation
- [ ] Reseller subscription renew & POP funding ledger
- [ ] **Test Gate 4 & 5 Passed**

### Module 6 & 7: Admin HR & Support Tickets
- [ ] Employee directory CRUD & salary distribution
- [ ] Staff attendance check-in/out & advance loans
- [ ] Support ticket queue, SLA filtering & staff reply mutation
- [ ] **Test Gate 6 & 7 Passed**

### Module 8 & 9: Admin SMS & Accounting
- [ ] SMS broadcast & Voice SMS campaigns + templates
- [ ] Balance Sheet, Chart of Accounts & Journal Entries
- [ ] Transaction stream & financial ledger
- [ ] **Test Gate 8 & 9 Passed**

### Module 10 & 11: Admin Network & Rewards
- [ ] MikroTik Routers & active PPPoE sessions
- [ ] IPv4 Pool CRUD & live available IP query
- [ ] Reward configuration & customer referral approval
- [ ] **Test Gate 10 & 11 Passed**

### Module 12: Employee Portal Self-Service
- [ ] `src/lib/api/services/employee.service.ts`
- [ ] Payslip view & monthly salary summary
- [ ] Advance salary request form
- [ ] Staff self attendance check-in/out
- [ ] **Test Gate 12 Passed**

---

## 🟡 Track B: New Backend Endpoints (`zapi`) + Frontend Integration

### Admin Missing Modules
- [ ] **Package CRUD**: Build `PackageApiController.php` -> Wire `src/features/admin/packages`
- [ ] **OLT & Fiber**: Build `OltApiController.php` -> Wire `src/features/admin/olt`
- [ ] **Hotspot & Bandwidth**: Build `HotspotApiController.php` -> Wire `src/features/admin/hotspot`
- [ ] **Inventory & Purchase**: Build `InventoryApiController.php` -> Wire `src/features/admin/inventory`
- [ ] **Reports & BTRC**: Build `ReportApiController.php` -> Wire `src/features/admin/reports`
- [ ] **WhatsApp & Settings**: Build `WhatsAppApiController.php` -> Wire `src/features/admin/whatsapp`
- [ ] **Admin Extended (Section D8-D13, H, I)**: Bandwidth SLA, Network Maps, Theme Studio, POP details, AI Chat, Invoices/PDF, RADIUS/CoA (Reference `07-ADMIN-EXTENDED-MODULES.md`)

### ISP Engines Suite
- [ ] Backend: Build `zapi/Modules/Engines/` catalog & registry endpoints
- [ ] Frontend: Wire `src/features/admin/engines/` dynamic schema renderer
- [ ] Integration: Automation, Provisioning, CRM, Installation, CX modules (Reference `08-ENGINES-SUITE-PLAN.md`)

### Platform Super-Admin Module
- [ ] Backend: Build `zapi/Modules/Platform/` controllers (Tenants, Admins, Revenue, Plugins)
- [ ] Frontend: `src/lib/api/services/platform.service.ts`
- [ ] Wire Platform Dashboard & Tenant Management
- [ ] Wire Platform Admins, Revenue & System Plugins
- [ ] Platform Extended: Metering, SLA, File Manager, Redis Inspector (Reference `09-MISC-MODULES.md`)
- [ ] **Platform Test Gate Passed**

### Employee Field Ops & Marketing
- [ ] Employee: GPS Attendance, Field Installations, Work Orders
- [ ] Marketing: Captive Portal, Public Status, Knowledge Base
- [ ] Auth: Reset Password, Custom Access Rules

---

## 🏁 Final Phase 8 Sign-Off
- [ ] Full build check: `pnpm lint && pnpm typecheck && pnpm test && pnpm build`
- [ ] Zero mock handlers active in production mode (`NEXT_PUBLIC_USE_MOCK_API=false`)
- [ ] All customer, admin, employee, and platform user journeys verified end-to-end
