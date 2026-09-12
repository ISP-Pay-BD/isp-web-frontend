# ISP Pay BD — Frontend API Integration & Progress Tracker

> Complete status of frontend API integration: cataloging **what is 100% completed & live**, **what is pending migration from mock API**, and **step-by-step phased checklists** for full platform completion.

---

## 1. Executive Summary & Progress Metrics

```mermaid
pie title API Frontend Integration Status (488 Total Backend Endpoints)
    "Live Connected in Frontend (80)" : 80
    "Pending Migration from Mock API (408)" : 408
```

| Metric | Count | Status | Notes |
|---|:---:|:---:|---|
| **Total Backend Registered Routes** | **488** | ✅ 100% Valid | Cataloged in [`docs/api/00-MASTER-API-CATALOG.md`](./api/00-MASTER-API-CATALOG.md) |
| **Frontend HTTP Service Methods** | **80** | ✅ Live | In `src/lib/api/services/` & direct hooks |
| **Features Wired to Live Backend** | **27** | ✅ Live & Tested | Real data rendering, zero mock fallback |
| **Features Using Mock API** | **70** | ⏳ In Progress | In `src/features/`, using `src/lib/mock-api/` |
| **Overall API Integration Progress** | **16.4%** | 🚀 Active Phase 8 | Core modules live; sub-modules queued |

---

## 2. Completed & Live Modules (27 Features / 80 Endpoints)

The following modules are **fully integrated with live backend APIs**, tested, and rendering real database records:

### 2.1 Authentication & Identity (3 Endpoints)
- [x] **Login Session**: `POST /api/v1/auth/login` → [`authService.login`](file:///c:/Users/SHOHAN/Documents/GitHub/isp-web-frontend/src/lib/api/services/auth.service.ts)
- [x] **Token Refresh**: `POST /api/v1/auth/refresh` → [`authService.refreshToken`](file:///c:/Users/SHOHAN/Documents/GitHub/isp-web-frontend/src/lib/api/services/auth.service.ts)
- [x] **User Profile & RBAC**: `GET /api/v1/auth/me` → [`authService.getCurrentUser`](file:///c:/Users/SHOHAN/Documents/GitHub/isp-web-frontend/src/lib/api/services/auth.service.ts)

### 2.2 Reseller / Admin Core (33 Endpoints)
- [x] **Admin Dashboard Stats**: `GET /api/v1/reseller/dashboard/{id}` → [`use-admin-dashboard.ts`](file:///c:/Users/SHOHAN/Documents/GitHub/isp-web-frontend/src/features/admin/dashboard/hooks/use-admin-dashboard.ts)
- [x] **Customer Registry List**: `GET /api/v1/reseller/customers/{id}` → [`use-customers.ts`](file:///c:/Users/SHOHAN/Documents/GitHub/isp-web-frontend/src/features/admin/customers/hooks/use-customers.ts)
- [x] **Customer Detail View**: `GET /api/v1/reseller/customers/{id}/{customerId}` → `adminService.getCustomerDetail`
- [x] **Customer Create / Edit / Delete**: `POST/DELETE /api/v1/reseller/customers/...` → `adminService.createCustomer`
- [x] **Customer Bulk Actions**: `POST /api/v1/reseller/customers/{id}/bulk-recharge` & `bulk-delete`
- [x] **MikroTik PPPoE Sync**: `POST /api/v1/reseller/customers/{id}/sync-pppoe`
- [x] **Customer MAC Binding**: `POST /api/v1/reseller/customers/{id}/bind-mac`
- [x] **Service Areas List & CRUD**: `GET/POST/DELETE /api/v1/reseller/areas/{id}` → [`use-areas.ts`](file:///c:/Users/SHOHAN/Documents/GitHub/isp-web-frontend/src/features/admin/areas/hooks/use-areas.ts)
- [x] **Sub-areas Management**: `GET/POST /api/v1/reseller/subareas/...`
- [x] **Packages & Tariffs List & CRUD**: `GET/POST/DELETE /api/v1/reseller/packages/{id}` → [`use-packages.ts`](file:///c:/Users/SHOHAN/Documents/GitHub/isp-web-frontend/src/features/admin/packages/hooks/use-packages.ts)
- [x] **Customer Payments Ledger**: `GET /api/v1/reseller/customer-payments/{id}` → [`use-customer-payments.ts`](file:///c:/Users/SHOHAN/Documents/GitHub/isp-web-frontend/src/features/admin/customer-payments/hooks/use-customer-payments.ts)
- [x] **Payment Collections**: `POST /api/v1/reseller/customer-payments/{id}/collect`
- [x] **Employees & Staff List**: `GET/POST /api/v1/reseller/employees/{id}` → [`use-employees.ts`](file:///c:/Users/SHOHAN/Documents/GitHub/isp-web-frontend/src/features/admin/hr/employees/hooks/use-employees.ts)
- [x] **Employee Salary Payments**: `GET/POST /api/v1/reseller/employee-payments/{id}`
- [x] **Support Tickets Helpdesk**: `GET/POST /api/v1/reseller/support-tickets/{id}` → [`use-support.ts`](file:///c:/Users/SHOHAN/Documents/GitHub/isp-web-frontend/src/features/admin/support/hooks/use-support.ts)
- [x] **Ticket Messages & Assignment**: `GET/POST /api/v1/reseller/support-tickets/{id}/...`
- [x] **SMS History Logs & Broadcast**: `GET/POST /api/v1/reseller/sms/{id}` → [`use-sms.ts`](file:///c:/Users/SHOHAN/Documents/GitHub/isp-web-frontend/src/features/admin/sms/hooks/use-sms.ts)
- [x] **Voice SMS Broadcasts**: `POST /api/v1/reseller/voice-sms/{id}`
- [x] **Accounting Balance Sheet**: `GET /api/v1/reseller/accounting/{id}/balance-sheet` → [`use-balance-sheet.ts`](file:///c:/Users/SHOHAN/Documents/GitHub/isp-web-frontend/src/features/admin/accounting/balance-sheet/hooks/use-balance-sheet.ts)
- [x] **Chart of Accounts**: `GET /api/v1/reseller/accounting/{id}/chart-of-accounts` → [`use-chart-of-accounts.ts`](file:///c:/Users/SHOHAN/Documents/GitHub/isp-web-frontend/src/features/admin/accounting/chart-of-accounts/hooks/use-chart-of-accounts.ts)
- [x] **Journal Entries**: `GET /api/v1/reseller/accounting/{id}/journal-entries` → [`use-journal-entries.ts`](file:///c:/Users/SHOHAN/Documents/GitHub/isp-web-frontend/src/features/admin/accounting/journal-entries/hooks/use-journal-entries.ts)
- [x] **Journal Transactions List**: `GET /api/v1/reseller/transactions/{id}`
- [x] **Network Routers List**: `GET/POST /api/v1/reseller/routers/{id}` → [`useRouters.ts`](file:///c:/Users/SHOHAN/Documents/GitHub/isp-web-frontend/src/features/admin/routers/hooks/useRouters.ts)
- [x] **IP Pools Subnets**: `GET/POST /api/v1/reseller/ip-pools/{id}` → [`useIpPools.ts`](file:///c:/Users/SHOHAN/Documents/GitHub/isp-web-frontend/src/features/admin/ip-pools/hooks/useIpPools.ts)
- [x] **Rewards Wallets & Reports**: `GET /api/v1/reseller/rewards/{id}/wallets` → [`use-rewards.ts`](file:///c:/Users/SHOHAN/Documents/GitHub/isp-web-frontend/src/features/admin/rewards/hooks/use-rewards.ts)

### 2.3 Customer Self-Care Portal (21 Endpoints)
- [x] **Customer Dashboard**: `GET /api/v1/customer/dashboard` → [`use-customer-dashboard.ts`](file:///c:/Users/SHOHAN/Documents/GitHub/isp-web-frontend/src/features/customer/dashboard/hooks/use-customer-dashboard.ts)
- [x] **Current Subscription Plan**: `GET /api/v1/customer/subscription/index` → [`use-customer-subscription.ts`](file:///c:/Users/SHOHAN/Documents/GitHub/isp-web-frontend/src/features/customer/subscription/hooks/use-customer-subscription.ts)
- [x] **Subscription Renewals**: `POST /api/v1/customer/subscription/renew`
- [x] **Available Packages**: `GET /api/v1/customer/packages` → [`use-customer-packages.ts`](file:///c:/Users/SHOHAN/Documents/GitHub/isp-web-frontend/src/features/customer/packages/hooks/use-customer-packages.ts)
- [x] **Customer Invoices & Payments**: `GET /api/v1/customer/payment-fetch` → [`use-customer-payments.ts`](file:///c:/Users/SHOHAN/Documents/GitHub/isp-web-frontend/src/features/customer/payments/hooks/use-customer-payments.ts)
- [x] **Checkout Payment Gateway Init**: `POST /api/v1/customer/payments`
- [x] **Customer Support Tickets**: `GET/POST /api/v1/customer/support/fetch` → [`use-customer-support.ts`](file:///c:/Users/SHOHAN/Documents/GitHub/isp-web-frontend/src/features/customer/support/hooks/use-customer-support.ts)
- [x] **Ticket Conversation Chat**: `GET/POST /api/v1/customer/support/send-message`
- [x] **WiFi & Router Control**: `GET/POST /api/v1/customer/router-control/wifi` → [`use-customer-router.ts`](file:///c:/Users/SHOHAN/Documents/GitHub/isp-web-frontend/src/features/customer/router/hooks/use-customer-router.ts)
- [x] **Self-Care Auto-Fix & Ping**: `POST /api/v1/customer/autofix/quick-fix`
- [x] **Connected Devices Radar**: `GET /api/v1/customer/device/connected`
- [x] **Reward Points & Wallet**: `GET /api/v1/customer/reward/wallet` → [`use-customer-rewards.ts`](file:///c:/Users/SHOHAN/Documents/GitHub/isp-web-frontend/src/features/customer/rewards/hooks/use-customer-rewards.ts)
- [x] **News, Notices & Banner**: `GET /api/common/news` → [`use-customer-news.ts`](file:///c:/Users/SHOHAN/Documents/GitHub/isp-web-frontend/src/features/customer/news/hooks/use-customer-news.ts)
- [x] **Customer Profile Details**: `GET/POST /api/v1/customer/profile` → [`use-customer-profile.ts`](file:///c:/Users/SHOHAN/Documents/GitHub/isp-web-frontend/src/features/customer/profile/hooks/use-customer-profile.ts)
- [x] **Change Password**: `POST /api/v1/customer/profile/change-password` → [`CustomerChangePasswordPage.tsx`](file:///c:/Users/SHOHAN/Documents/GitHub/isp-web-frontend/src/features/customer/change-password/pages/CustomerChangePasswordPage.tsx)

### 2.4 Employee & Platform SuperAdmin (15 Endpoints)
- [x] **Employee Salaries List**: `GET /api/v1/reseller/employee-payments/{id}` → [`use-employee-salaries.ts`](file:///c:/Users/SHOHAN/Documents/GitHub/isp-web-frontend/src/features/employee/salaries/hooks/use-employee-salaries.ts)
- [x] **Advance Salary Requests**: `GET/POST /api/v1/reseller/employees/{id}/advance-salary` → [`use-employee-advance.ts`](file:///c:/Users/SHOHAN/Documents/GitHub/isp-web-frontend/src/features/employee/advance-salary/hooks/use-employee-advance.ts)
- [x] **Platform SuperAdmin Stats**: `GET /api/v1/platform/stats` → [`PlatformDashboardPage.tsx`](file:///c:/Users/SHOHAN/Documents/GitHub/isp-web-frontend/src/features/platform/dashboard/pages/PlatformDashboardPage.tsx)
- [x] **Tenant Resellers List & Status**: `GET/POST/PATCH /api/v1/platform/tenants`
- [x] **SaaS Subscriptions**: `GET /api/v1/platform/subscriptions`
- [x] **Engines Catalog**: `GET /api/v1/engines/catalog`
- [x] **System Infrastructure Health**: `GET /api/v1/platform/system-health`

---

## 3. Incomplete & Pending Migration Roadmap (Phases 8.1 – 8.8)

The remaining **408 endpoints** in the backend catalog are organized into systematic migration batches to replace local mock data with live API endpoints:

### Phase 8.1: Network, MikroTik Deep Controls & Bandwidth Graphs
- [ ] **Bandwidth Live Graph**: Wire `/admin/bandwidth` to `/api/v1/reseller/routers/{id}/traffic`
- [ ] **Active PPPoE Sessions**: Wire `/admin/network/sessions` to `/api/v1/reseller/routers/{id}/sessions`
- [ ] **Session Disconnect Action**: Wire Disconnect button to `POST /api/v1/reseller/routers/{id}/disconnect`
- [ ] **DHCP Leases Table**: Wire `/admin/network/dhcp` to `/api/v1/reseller/routers/{id}/dhcp-leases`
- [ ] **Firewall & Simple Queues**: Wire `/admin/network/queues` to `/api/v1/reseller/routers/{id}/queues`

### Phase 8.2: Invoices PDF, Billing Automation & BTRC Reports
- [ ] **Invoice PDF Viewer / Print**: Wire `/admin/invoices/{id}` to `/api/v1/reseller/invoices/{id}/pdf`
- [ ] **BTRC Telecom Compliance Report**: Wire `/admin/reports/btrc` to `/api/v1/reseller/reports/btrc/{id}`
- [ ] **Revenue Breakdown Report**: Wire `/admin/reports/revenue` to `/api/v1/reseller/reports/revenue/{id}`
- [ ] **Corporate Billing Invoices**: Wire `/admin/corporate/invoices` to `/api/v1/reseller/corporate/{id}/invoices`
- [ ] **Bank Reconciliation**: Wire `/admin/accounting/reconciliation` to `/api/v1/reseller/accounting/{id}/reconciliation`

### Phase 8.3: Inventory Management & Asset Tracking
- [ ] **Inventory Items Stock**: Wire `/admin/inventory/items` to `/api/v1/reseller/inventory/{id}`
- [ ] **Purchase Orders & Supplier Invoices**: Wire `/admin/purchase` to `/api/v1/reseller/purchase/{id}`
- [ ] **Stock Transfers & Dispatch**: Wire `/admin/inventory/transfers` to `/api/v1/reseller/inventory/{id}/transfers`

### Phase 8.4: OLT Optical Power (PON) & Hotspot Voucher Suite
- [ ] **OLT Hardware List**: Wire `/admin/olt` to `/api/v1/reseller/olt/{id}`
- [ ] **PON Port & ONU Signal (dBm)**: Wire `/admin/olt/{id}/ports` to `/api/v1/reseller/olt/{id}/optical-power`
- [ ] **Hotspot Server Config**: Wire `/admin/hotspot` to `/api/v1/reseller/hotspot/{id}`
- [ ] **Hotspot Voucher Batch Generator**: Wire `/admin/hotspot/vouchers` to `POST /api/v1/reseller/hotspot/vouchers/{id}/batch`
- [ ] **Voucher Print Sheet**: Wire `/admin/hotspot/vouchers/print` to `/api/v1/reseller/hotspot/vouchers/{id}/print`

### Phase 8.5: Staff Attendance Check-In & Payroll
- [ ] **Employee Punch In / Out (GPS)**: Wire `/employee/attendance` to `POST /api/v1/reseller/employees/{id}/attendance/check-in`
- [ ] **Monthly Salary Sheet Generator**: Wire `/admin/hr/payroll` to `/api/v1/reseller/employee-payments/{id}/salary-summary`
- [ ] **Leave Application & Approval**: Wire `/admin/hr/leaves` to `/api/v1/reseller/employees/{id}/leaves`

### Phase 8.6: SMS, Voice OTP & WhatsApp Business Automation
- [ ] **SMS Template Variables Builder**: Wire `/admin/sms-templates` to `/api/v1/reseller/sms/{id}/templates`
- [ ] **Voice OTP Broadcast Dispatcher**: Wire `/admin/voice-sms` to `POST /api/v1/reseller/voice-sms/{id}/broadcast`
- [ ] **WhatsApp Bot Configuration & Session**: Wire `/admin/whatsapp` to `/api/v1/reseller/whatsapp/settings/{id}`
- [ ] **WhatsApp Auto-Templates**: Wire `/admin/whatsapp/templates` to `/api/v1/reseller/whatsapp/{id}/templates`

### Phase 8.7: AI Chatbot Assistant & Diagnostics
- [ ] **Live AI Assistant Chat Panel**: Wire `/admin/ai-chat` to `POST /api/v1/ai/query`
- [ ] **Automated Customer Triage**: Wire `/admin/ai-chat/leads` to `GET/POST /api/internal/ai/leads`
- [ ] **AI Router Fault Analyzer**: Wire `/admin/ai-chat/diagnose` to `/api/internal/ai/diagnose`

### Phase 8.8: Extra Modern Modules (New Backend Endpoints)
- [ ] **Field Work Orders (`isp-ops`)**: Create backend controller & wire to `GET/POST /api/v1/reseller/work-orders`
- [ ] **Recycle Bin Restore**: Create backend controller & wire to `GET/POST /api/v1/reseller/trash/...`
- [ ] **POP Wholesale Packages**: Create backend controller & wire to `GET/POST /api/v1/reseller/pop-packages`
- [ ] **Hardware Store Product Showcase**: Create customer store controller & wire to `/api/v1/customer/store/products`

---

## 4. Progress Verification Workflow

Whenever you complete a batch of screens:
1. Run backend tests:
   ```bash
   cd c:\Users\SHOHAN\Documents\GitHub\isppaybd_isp
   vendor/bin/phpunit
   ```
2. Run frontend tests & typecheck:
   ```bash
   cd c:\Users\SHOHAN\Documents\GitHub\isp-web-frontend
   npm run typecheck && npm test
   ```
3. Run safe live read verification suite:
   ```bash
   php c:\Users\SHOHAN\Documents\GitHub\isppaybd_isp\scripts\test_backend_api_suite.php
   ```
4. Update the checkboxes `[x]` in this document.
