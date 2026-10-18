# 01. Completed & Live API Endpoints (80 Total)

> Exhaustive list of all **80 endpoints** currently connected to the live backend with zero mock fallbacks.

---

## 1. Authentication & Session Management (3 Endpoints)

| Method | Backend Route | Frontend Service Method | Frontend Hook / Component | Status |
|---|---|---|---|:---:|
| `POST` | `/api/v1/auth/login` | `authService.login` | `src/features/auth/login/components/LoginForm.tsx` | ✅ Live |
| `POST` | `/api/v1/auth/refresh` | `authService.refreshToken` | `src/lib/api/client.ts` (Interceptor) | ✅ Live |
| `GET` | `/api/v1/auth/me` | `authService.getCurrentUser` | `src/stores/auth-store.ts` | ✅ Live |

---

## 2. Reseller / Admin Portal (33 Endpoints)

| Method | Backend Route | Frontend Service Method | Frontend Hook / Component | Status |
|---|---|---|---|:---:|
| `GET` | `/api/v1/reseller/dashboard/{id}` | `adminService.getDashboardStats` | `use-admin-dashboard.ts` | ✅ Live |
| `GET` | `/api/v1/reseller/customers/{id}` | `adminService.getCustomers` | `use-customers.ts` | ✅ Live |
| `GET` | `/api/v1/reseller/customers/{id}/{customerId}` | `adminService.getCustomerDetail` | `use-customers.ts` | ✅ Live |
| `POST` | `/api/v1/reseller/customers/create/{id}` | `adminService.createCustomer` | `use-customers.ts` | ✅ Live |
| `POST` | `/api/v1/reseller/customers/{id}/{customerId}` | `adminService.updateCustomer` | `use-customers.ts` | ✅ Live |
| `DELETE` | `/api/v1/reseller/customers/{id}/{customerId}` | `adminService.deleteCustomer` | `use-customers.ts` | ✅ Live |
| `POST` | `/api/v1/reseller/customers/{id}/bulk-recharge` | `adminService.bulkRecharge` | `use-customers.ts` | ✅ Live |
| `POST` | `/api/v1/reseller/customers/{id}/bulk-delete` | `adminService.bulkDelete` | `use-customers.ts` | ✅ Live |
| `POST` | `/api/v1/reseller/customers/{id}/sync-pppoe` | `adminService.syncPppoe` | `use-customers.ts` | ✅ Live |
| `POST` | `/api/v1/reseller/customers/{id}/bind-mac` | `adminService.bindMac` | `use-customers.ts` | ✅ Live |
| `GET` | `/api/v1/reseller/areas/{id}` | `adminService.getAreas` | `use-areas.ts` | ✅ Live |
| `POST` | `/api/v1/reseller/areas/{id}` | `adminService.createArea` | `use-areas.ts` | ✅ Live |
| `POST` | `/api/v1/reseller/areas/{id}/{areaId}` | `adminService.updateArea` | `use-areas.ts` | ✅ Live |
| `DELETE` | `/api/v1/reseller/areas/{id}/{areaId}` | `adminService.deleteArea` | `use-areas.ts` | ✅ Live |
| `POST` | `/api/v1/reseller/subareas/{id}` | `adminService.createSubarea` | `use-areas.ts` | ✅ Live |
| `POST` | `/api/v1/reseller/subareas/{id}/{subareaId}` | `adminService.updateSubarea` | `use-areas.ts` | ✅ Live |
| `DELETE` | `/api/v1/reseller/subareas/{id}/{subareaId}` | `adminService.deleteSubarea` | `use-areas.ts` | ✅ Live |
| `GET` | `/api/v1/reseller/packages/{id}` | `adminService.getPackages` | `use-packages.ts` | ✅ Live |
| `POST` | `/api/v1/reseller/packages/{id}` | `adminService.createPackage` | `use-packages.ts` | ✅ Live |
| `POST` | `/api/v1/reseller/packages/{id}/{pkgId}` | `adminService.updatePackage` | `use-packages.ts` | ✅ Live |
| `DELETE` | `/api/v1/reseller/packages/{id}/{pkgId}` | `adminService.deletePackage` | `use-packages.ts` | ✅ Live |
| `GET` | `/api/v1/reseller/customer-payments/{id}` | `adminService.getPayments` | `use-customer-payments.ts` | ✅ Live |
| `POST` | `/api/v1/reseller/customer-payments/{id}/collect` | `adminService.collectPayment` | `use-customer-payments.ts` | ✅ Live |
| `GET` | `/api/v1/reseller/employees/{id}` | `adminService.getEmployees` | `use-employees.ts` | ✅ Live |
| `GET` | `/api/v1/reseller/support-tickets/{id}` | `adminService.getTickets` | `use-support.ts` | ✅ Live |
| `POST` | `/api/v1/reseller/support-tickets/{id}` | `adminService.createTicket` | `use-support.ts` | ✅ Live |
| `POST` | `/api/v1/reseller/support-tickets/{id}/{ticketId}/messages` | `adminService.replyTicket` | `use-support.ts` | ✅ Live |
| `GET` | `/api/v1/reseller/sms/{id}` | `adminService.getSmsHistory` | `use-sms.ts` | ✅ Live |
| `POST` | `/api/v1/reseller/sms/{id}` | `adminService.broadcastSms` | `use-sms.ts` | ✅ Live |
| `GET` | `/api/v1/reseller/accounting/{id}/balance-sheet` | `adminService.getBalanceSheet` | `use-balance-sheet.ts` | ✅ Live |
| `GET` | `/api/v1/reseller/accounting/{id}/chart-of-accounts` | `adminService.getChartOfAccounts` | `use-chart-of-accounts.ts` | ✅ Live |
| `GET` | `/api/v1/reseller/accounting/{id}/journal-entries` | `adminService.getJournalEntries` | `use-journal-entries.ts` | ✅ Live |
| `GET` | `/api/v1/reseller/rewards/{id}/wallets` | `adminService.getRewardsWallets` | `use-rewards.ts` | ✅ Live |

---

## 3. Customer Portal & Self-Care (21 Endpoints)

| Method | Backend Route | Frontend Service Method | Frontend Hook / Component | Status |
|---|---|---|---|:---:|
| `GET` | `/api/v1/customer/dashboard` | `customerService.getDashboard` | `use-customer-dashboard.ts` | ✅ Live |
| `GET` | `/api/v1/customer/subscription/index` | `customerService.getSubscription` | `use-customer-subscription.ts` | ✅ Live |
| `POST` | `/api/v1/customer/subscription/renew` | `customerService.renewSubscription` | `use-customer-subscription.ts` | ✅ Live |
| `GET` | `/api/v1/customer/packages` | `customerService.getPackages` | `use-customer-packages.ts` | ✅ Live |
| `GET` | `/api/v1/customer/payment-fetch` | `customerService.getPayments` | `use-customer-payments.ts` | ✅ Live |
| `POST` | `/api/v1/customer/payments` | `customerService.checkoutPayment` | `use-customer-payments.ts` | ✅ Live |
| `GET` | `/api/v1/customer/support/fetch` | `customerService.getTickets` | `use-customer-support.ts` | ✅ Live |
| `GET` | `/api/v1/customer/support/details` | `customerService.getTicketDetail` | `use-customer-support.ts` | ✅ Live |
| `POST` | `/api/v1/customer/support/create-ticket` | `customerService.createTicket` | `use-customer-support.ts` | ✅ Live |
| `POST` | `/api/v1/customer/support/send-message` | `customerService.sendMessage` | `use-customer-support.ts` | ✅ Live |
| `GET` | `/api/v1/customer/router-control/targets` | `customerService.getRouterTargets` | `use-customer-router.ts` | ✅ Live |
| `POST` | `/api/v1/customer/router-control/wifi` | `customerService.updateWifi` | `use-customer-router.ts` | ✅ Live |
| `POST` | `/api/v1/customer/autofix/quick-fix` | `customerService.runAutoFix` | `use-customer-router.ts` | ✅ Live |
| `GET` | `/api/v1/customer/device/connected` | `customerService.getConnectedDevices` | `use-customer-router.ts` | ✅ Live |
| `GET` | `/api/v1/customer/reward/wallet` | `customerService.getRewardWallet` | `use-customer-rewards.ts` | ✅ Live |
| `POST` | `/api/v1/customer/reward/redeem-preview` | `customerService.redeemRewardPreview` | `use-customer-rewards.ts` | ✅ Live |
| `GET` | `/api/common/news` | `customerService.getNews` | `use-customer-news.ts` | ✅ Live |
| `GET` | `/api/common/news/{id}` | `customerService.getNewsItem` | `use-customer-news.ts` | ✅ Live |
| `GET` | `/api/v1/customer/profile` | `customerService.getProfile` | `use-customer-profile.ts` | ✅ Live |
| `POST` | `/api/v1/customer/profile/update` | `customerService.updateProfile` | `use-customer-profile.ts` | ✅ Live |
| `POST` | `/api/v1/customer/profile/change-password` | `customerService.changePassword` | `CustomerChangePasswordPage.tsx` | ✅ Live |

---

## 4. Employee, Platform SuperAdmin & Direct Hooks (23 Endpoints)

| Method | Backend Route | Scope | Method / Hook | Status |
|---|---|---|---|:---:|
| `GET` | `/api/v1/reseller/employee-payments/{id}` | Employee | `use-employee-salaries.ts` | ✅ Live |
| `GET` | `/api/v1/reseller/employees/{id}/advance-salary` | Employee | `use-employee-advance.ts` | ✅ Live |
| `POST` | `/api/v1/reseller/employees/{id}/advance-salary` | Employee | `use-employee-advance.ts` | ✅ Live |
| `GET` | `/api/v1/auth/me` | Employee | `use-employee-profile.ts` | ✅ Live |
| `GET` | `/api/v1/platform/stats` | Platform | `PlatformDashboardPage.tsx` | ✅ Live |
| `GET` | `/api/v1/platform/tenants` | Platform | `platformService.getTenants` | ✅ Live |
| `GET` | `/api/v1/platform/tenants/{id}` | Platform | `platformService.getTenantDetail` | ✅ Live |
| `POST` | `/api/v1/platform/tenants` | Platform | `platformService.createTenant` | ✅ Live |
| `PATCH` | `/api/v1/platform/tenants/{id}/status` | Platform | `platformService.updateTenantStatus` | ✅ Live |
| `DELETE` | `/api/v1/platform/tenants/{id}` | Platform | `platformService.deleteTenant` | ✅ Live |
| `GET` | `/api/v1/platform/subscriptions` | Platform | `platformService.getSubscriptions` | ✅ Live |
| `GET` | `/api/v1/engines/catalog` | Platform | `platformService.getEnginesCatalog` | ✅ Live |
| `GET` | `/api/v1/platform/system-health` | Platform | `platformService.getSystemHealth` | ✅ Live |
| `GET` | `/api/v1/reseller/routers/{id}` | Routers | `useRouters.ts` | ✅ Live |
| `POST` | `/api/v1/reseller/routers/{id}` | Routers | `useRouters.ts` | ✅ Live |
| `GET` | `/api/v1/reseller/ip-pools/{id}` | IP Pools | `useIpPools.ts` | ✅ Live |
| `POST` | `/api/v1/reseller/ip-pools/{id}` | IP Pools | `useIpPools.ts` | ✅ Live |
| `GET` | `/api/v1/reseller/packages/{id}` | Packages | `use-packages.ts` | ✅ Live |
| `POST` | `/api/v1/reseller/packages/{id}` | Packages | `use-packages.ts` | ✅ Live |
| `GET` | `/api/v1/reseller/rewards/{id}/wallets` | Rewards | `use-rewards.ts` | ✅ Live |
