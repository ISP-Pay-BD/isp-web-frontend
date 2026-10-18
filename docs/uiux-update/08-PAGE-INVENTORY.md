# 08 — Page inventory (after implementation)

Every screen in the app (210; the 4 redirect-only routes are left out) with its state after the UI/UX update. Snapshot 2026-10-18 on top of `3f66a97`, produced by a one-off scan of each screen's page component plus its own `../components` (shared components are fixed once, see [01](01-SHARED-FIXES.md) and [02](02-DATA-TABLES.md)).

| Column | Meaning |
|---|---|
| Table | `DataTable` (phone cards, sticky header, URL state) · `own (phone-safe)` = kept hand-built on purpose · `—` no table |
| URL | the screen keeps search / filters / page in the URL (or reads deep-link params) |
| Bangla | the screen uses `t()` (`✓` = the page or its own components call `t()`; `✗` = a portal screen that does not itself (check whether it only wraps a translated page); `—` = legal text or the landing page, whose copy is translated inside its own sections) |
| Open | rules from [01](01-SHARED-FIXES.md) still violated here (S1 text <12px, S2 hand-coloured Badge, S3 bare `toLocaleString`, S4 `Link>Button`, S5 unlabelled icon button, S6 `router.push` click). Empty = clean; the ratchet tests keep it that way |
| Done | ✅ when nothing is open and (for customer/employee) the screen is bilingual |

## Customer portal (19) — 19 clean

| Screen | Page file | Table | URL | Bangla | Lines | Open | Done |
|---|---|---|---|---|---|---|---|
| `/customer/change-password` | `customer/change-password/pages/CustomerChangePasswordPage.tsx` | — | · | ✓ | 173 | · | ✅ |
| `/customer/dashboard` | `customer/dashboard/pages/CustomerDashboardPage.tsx` | — | · | ✓ | 528 | · | ✅ |
| `/customer/experience` | `admin/engines/pages/CustomerCxPage.tsx` | — | · | ✓ | 491 | · | ✅ |
| `/customer/help` | `customer/help/pages/CustomerHelpPage.tsx` | — | · | ✓ | 24 | · | ✅ |
| `/customer/news` | `customer/news/pages/CustomerNewsPage.tsx` | — | · | ✓ | 187 | · | ✅ |
| `/customer/packages` | `customer/packages/pages/CustomerPackagesPage.tsx` | — | · | ✓ | 207 | · | ✅ |
| `/customer/payments` | `customer/payments/pages/CustomerPaymentsPage.tsx` | DataTable | ✓ | ✓ | 180 | · | ✅ |
| `/customer/payments/[id]/invoice` | `customer/payments/pages/CustomerInvoicePage.tsx` | — | · | ✓ | 125 | · | ✅ |
| `/customer/payments/auto-pay` | `customer/payments/pages/CustomerAutoPayPage.tsx` | — | · | ✓ | 299 | · | ✅ |
| `/customer/payments/pay` | `customer/payments/pages/CustomerPayPage.tsx` | — | ✓ | ✓ | 304 | · | ✅ |
| `/customer/profile` | `customer/profile/pages/CustomerProfilePage.tsx` | — | · | ✓ | 232 | · | ✅ |
| `/customer/rewards` | `customer/rewards/pages/CustomerRewardsPage.tsx` | — | · | ✓ | 396 | · | ✅ |
| `/customer/router` | `customer/router/pages/CustomerRouterPage.tsx` | — | · | ✓ | 307 | · | ✅ |
| `/customer/router/devices` | `customer/router/pages/CustomerDevicesPage.tsx` | DataTable | ✓ | ✓ | 255 | · | ✅ |
| `/customer/router/wifi` | `customer/router/pages/CustomerWifiSettingsPage.tsx` | — | · | ✓ | 205 | · | ✅ |
| `/customer/subscription` | `customer/subscription/pages/CustomerSubscriptionPage.tsx` | — | · | ✓ | 314 | · | ✅ |
| `/customer/support` | `customer/support/pages/CustomerSupportPage.tsx` | — | · | ✓ | 285 | · | ✅ |
| `/customer/support/[id]` | `customer/support/pages/CustomerTicketDetailPage.tsx` | — | · | ✓ | 213 | · | ✅ |
| `/customer/support/new` | `customer/support/pages/CustomerNewTicketPage.tsx` | — | · | ✓ | 185 | · | ✅ |

## Employee portal (6) — 6 clean

| Screen | Page file | Table | URL | Bangla | Lines | Open | Done |
|---|---|---|---|---|---|---|---|
| `/employee/advance-salary` | `employee/advance-salary/pages/EmployeeAdvanceSalaryPage.tsx` | DataTable | ✓ | ✓ | 306 | · | ✅ |
| `/employee/attendance` | `employee/attendance/pages/EmployeeAttendancePage.tsx` | — | · | ✓ | 220 | · | ✅ |
| `/employee/installations` | `employee/installations/pages/EmployeeInstallationsPage.tsx` | — | ✓ | ✓ | 298 | · | ✅ |
| `/employee/jobs` | `employee/jobs/pages/EmployeeJobsPage.tsx` | — | ✓ | ✓ | 192 | · | ✅ |
| `/employee/profile` | `employee/profile/pages/EmployeeProfilePage.tsx` | — | · | ✓ | 207 | · | ✅ |
| `/employee/salaries` | `employee/salaries/pages/EmployeeSalariesPage.tsx` | DataTable | ✓ | ✓ | 232 | · | ✅ |

## Admin portal (145) — 145 clean

| Screen | Page file | Table | URL | Bangla | Lines | Open | Done |
|---|---|---|---|---|---|---|---|
| `/admin/accounting/balance-sheet` | `admin/accounting/balance-sheet/pages/BalanceSheetPage.tsx` | — | · | ✓ | 349 | · | ✅ |
| `/admin/accounting/chart-of-accounts` | `admin/accounting/chart-of-accounts/pages/ChartOfAccountsPage.tsx` | DataTable | ✓ | ✓ | 627 | · | ✅ |
| `/admin/accounting/expenses` | `admin/accounting/expenses/pages/ExpensesPage.tsx` | DataTable | ✓ | ✓ | 21 | · | ✅ |
| `/admin/accounting/incomes` | `admin/accounting/incomes/pages/IncomesPage.tsx` | DataTable | ✓ | ✓ | 21 | · | ✅ |
| `/admin/accounting/journal-entries` | `admin/accounting/journal-entries/pages/JournalEntriesPage.tsx` | DataTable + own | ✓ | ✓ | 472 | · | ✅ |
| `/admin/accounting/reports` | `admin/accounting/reports/pages/AccountingReportsPage.tsx` | own (phone-safe) | · | ✓ | 295 | · | ✅ |
| `/admin/acs` | `admin/isp-ops/pages/AcsPage.tsx` | DataTable | ✓ | ✓ | 434 | · | ✅ |
| `/admin/addons` | `admin/isp-ops/pages/AddonsPage.tsx` | DataTable | ✓ | ✓ | 911 | · | ✅ |
| `/admin/ai-chat` | `admin/ai-chat/pages/AiChatPage.tsx` | — | · | ✓ | 289 | · | ✅ |
| `/admin/announcements` | `admin/isp-ops/pages/AnnouncementsPage.tsx` | DataTable | ✓ | ✓ | 452 | · | ✅ |
| `/admin/areas` | `admin/areas/pages/AreasPage.tsx` | DataTable | · | ✓ | 801 | · | ✅ |
| `/admin/audit-logs` | `admin/audit-logs/pages/AuditLogsPage.tsx` | DataTable | ✓ | ✓ | 223 | · | ✅ |
| `/admin/backup` | `admin/isp-ops/pages/BackupPage.tsx` | DataTable | ✓ | ✓ | 261 | · | ✅ |
| `/admin/bandwidth/buy` | `admin/bandwidth/pages/BandwidthBuyHubPage.tsx` | — | · | ✓ | 186 | · | ✅ |
| `/admin/bandwidth/buy/bills` | `admin/bandwidth/pages/BandwidthBillsPage.tsx` | DataTable + own | ✓ | ✓ | 363 | · | ✅ |
| `/admin/bandwidth/buy/categories` | `admin/bandwidth/pages/BandwidthCategoriesPage.tsx` | DataTable | ✓ | ✓ | 395 | · | ✅ |
| `/admin/bandwidth/buy/items` | `admin/bandwidth/pages/BandwidthItemsPage.tsx` | DataTable | ✓ | ✓ | 357 | · | ✅ |
| `/admin/bandwidth/buy/providers` | `admin/bandwidth/pages/BandwidthProvidersPage.tsx` | DataTable | ✓ | ✓ | 317 | · | ✅ |
| `/admin/bandwidth/daily-bill` | `admin/bandwidth/pages/BandwidthDailyBillPage.tsx` | DataTable | ✓ | ✓ | 281 | · | ✅ |
| `/admin/bandwidth/sell` | `admin/bandwidth/pages/BandwidthSellHubPage.tsx` | — | · | ✓ | 161 | · | ✅ |
| `/admin/bandwidth/sell/clients` | `admin/bandwidth/pages/BandwidthSellClientsPage.tsx` | DataTable | ✓ | ✓ | 219 | · | ✅ |
| `/admin/bandwidth/sell/invoices` | `admin/bandwidth/pages/BandwidthInvoicesPage.tsx` | DataTable + own | ✓ | ✓ | 381 | · | ✅ |
| `/admin/bandwidth/sla` | `admin/isp-ops/pages/BandwidthSlaPage.tsx` | DataTable | ✓ | ✓ | 332 | · | ✅ |
| `/admin/billing/deposits` | `admin/isp-ops/pages/DepositsPage.tsx` | DataTable | ✓ | ✓ | 733 | · | ✅ |
| `/admin/billing/dunning` | `admin/isp-ops/pages/DunningPage.tsx` | own (phone-safe) | · | ✓ | 539 | · | ✅ |
| `/admin/billing/policies` | `admin/isp-ops/pages/BillingPoliciesPage.tsx` | DataTable + own | ✓ | ✓ | 897 | · | ✅ |
| `/admin/billing/proration` | `admin/isp-ops/pages/ProrationPage.tsx` | — | · | ✓ | 274 | · | ✅ |
| `/admin/billing/tax` | `admin/isp-ops/pages/TaxSettingsPage.tsx` | own (phone-safe) | · | ✓ | 466 | · | ✅ |
| `/admin/branding` | `admin/isp-ops/pages/BrandingPage.tsx` | — | · | ✓ | 263 | · | ✅ |
| `/admin/collections/cashbook` | `admin/isp-ops/pages/CashbookPage.tsx` | DataTable | ✓ | ✓ | 275 | · | ✅ |
| `/admin/collections/reminders` | `admin/isp-ops/pages/RemindersPage.tsx` | DataTable | ✓ | ✓ | 686 | · | ✅ |
| `/admin/compliance/ip-logs` | `admin/isp-ops/pages/IpLogsPage.tsx` | DataTable | ✓ | ✓ | 237 | · | ✅ |
| `/admin/contracts` | `admin/isp-ops/pages/ContractsPage.tsx` | DataTable | ✓ | ✓ | 591 | · | ✅ |
| `/admin/corporate/queues` | `admin/corporate/pages/CorporateQueuesPage.tsx` | DataTable | ✓ | ✓ | 399 | · | ✅ |
| `/admin/customer-payments` | `admin/customer-payments/pages/CustomerPaymentsPage.tsx` | DataTable + own | ✓ | ✓ | 446 | · | ✅ |
| `/admin/customer-payments/[id]/pos` | `admin/isp-ops/pages/PosReceiptPage.tsx` | — | · | ✓ | 353 | · | ✅ |
| `/admin/customer-payments/new` | `admin/customer-payments/pages/NewCustomerPaymentPage.tsx` | — | ✓ | ✓ | 241 | · | ✅ |
| `/admin/customers` | `admin/customers/pages/AllCustomersPage.tsx` | DataTable | ✓ | ✓ | 1051 | · | ✅ |
| `/admin/customers/[id]` | `admin/customers/pages/CustomerDetailPage.tsx` | — | · | ✓ | 796 | · | ✅ |
| `/admin/customers/[id]/audit` | `admin/customers/pages/CustomerAuditPage.tsx` | DataTable | ✓ | ✓ | 118 | · | ✅ |
| `/admin/customers/[id]/edit` | `admin/customers/pages/EditCustomerPage.tsx` | — | · | ✓ | 129 | · | ✅ |
| `/admin/customers/[id]/kyc` | `admin/isp-ops/pages/CustomerKycPage.tsx` | DataTable | ✓ | ✓ | 372 | · | ✅ |
| `/admin/customers/[id]/mac-bind` | `admin/customers/pages/MacBindPage.tsx` | — | · | ✓ | 88 | · | ✅ |
| `/admin/customers/expired` | `admin/customers/pages/ExpiredCustomersPage.tsx` | DataTable | ✓ | ✓ | 381 | · | ✅ |
| `/admin/customers/free-requests` | `admin/customers/pages/FreeRequestsPage.tsx` | DataTable | ✓ | ✓ | 263 | · | ✅ |
| `/admin/customers/groups` | `admin/isp-ops/pages/CustomerGroupsPage.tsx` | DataTable | ✓ | ✓ | 528 | · | ✅ |
| `/admin/customers/import` | `admin/customers/pages/ImportCustomersPage.tsx` | own (phone-safe) | · | ✓ | 234 | · | ✅ |
| `/admin/customers/inactive` | `admin/isp-ops/pages/InactiveCustomersPage.tsx` | DataTable | ✓ | ✓ | 279 | · | ✅ |
| `/admin/customers/new` | `admin/customers/pages/NewCustomerPage.tsx` | — | · | ✓ | 98 | · | ✅ |
| `/admin/dashboard` | `admin/dashboard/pages/AdminDashboardPage.tsx` | — | · | ✓ | 649 | · | ✅ |
| `/admin/dealers` | `admin/isp-ops/pages/DealersPage.tsx` | DataTable | ✓ | ✓ | 616 | · | ✅ |
| `/admin/developers` | `admin/isp-ops/pages/DevelopersPage.tsx` | DataTable + own | ✓ | ✓ | 730 | · | ✅ |
| `/admin/engines` | `admin/engines/pages/EnginesIndexPage.tsx` | DataTable | ✓ | ✓ | 241 | · | ✅ |
| `/admin/engines/[slug]` | `admin/engines/pages/EngineHubPage.tsx` | DataTable | ✓ | ✓ | 561 | · | ✅ |
| `/admin/fraud` | `admin/isp-ops/pages/FraudPage.tsx` | DataTable | ✓ | ✓ | 283 | · | ✅ |
| `/admin/hierarchy` | `admin/hierarchy/pages/AdminHierarchyPage.tsx` | — | · | ✓ | 23 | · | ✅ |
| `/admin/hotspot` | `admin/hotspot/pages/HotspotHubPage.tsx` | — | · | ✓ | 218 | · | ✅ |
| `/admin/hotspot/dashboard` | `admin/hotspot/pages/HotspotDashboardPage.tsx` | DataTable | ✓ | ✓ | 301 | · | ✅ |
| `/admin/hotspot/packages` | `admin/hotspot/pages/HotspotPackagesPage.tsx` | DataTable | ✓ | ✓ | 653 | · | ✅ |
| `/admin/hotspot/reports` | `admin/hotspot/pages/HotspotReportsPage.tsx` | DataTable | ✓ | ✓ | 240 | · | ✅ |
| `/admin/hotspot/users` | `admin/hotspot/pages/HotspotUsersPage.tsx` | DataTable | ✓ | ✓ | 703 | · | ✅ |
| `/admin/hotspot/vouchers` | `admin/isp-ops/pages/HotspotVouchersPage.tsx` | DataTable | ✓ | ✓ | 618 | · | ✅ |
| `/admin/hotspot/walled-garden` | `admin/isp-ops/pages/WalledGardenPage.tsx` | DataTable | ✓ | ✓ | 435 | · | ✅ |
| `/admin/hr/accounts` | `admin/hr/accounts/pages/EmployeeAccountsPage.tsx` | DataTable | ✓ | ✓ | 226 | · | ✅ |
| `/admin/hr/advance-salary` | `admin/hr/advance-salary/pages/AdvanceSalaryPage.tsx` | DataTable | ✓ | ✓ | 379 | · | ✅ |
| `/admin/hr/attendance` | `admin/hr/attendance/pages/AttendancePage.tsx` | DataTable | ✓ | ✓ | 264 | · | ✅ |
| `/admin/hr/employees` | `admin/hr/employees/pages/EmployeesPage.tsx` | DataTable | ✓ | ✓ | 331 | · | ✅ |
| `/admin/hr/employees/[id]` | `admin/hr/employees/pages/EmployeeDetailsPage.tsx` | DataTable | · | ✓ | 697 | · | ✅ |
| `/admin/hr/salaries` | `admin/hr/salaries/pages/SalariesPage.tsx` | DataTable | ✓ | ✓ | 230 | · | ✅ |
| `/admin/inventory/assign` | `admin/isp-ops/pages/CpeAssignPage.tsx` | DataTable | ✓ | ✓ | 644 | · | ✅ |
| `/admin/inventory/categories` | `admin/inventory/pages/InventoryCategoriesPage.tsx` | DataTable | ✓ | ✓ | 604 | · | ✅ |
| `/admin/inventory/items` | `admin/inventory/pages/InventoryItemsPage.tsx` | DataTable | ✓ | ✓ | 585 | · | ✅ |
| `/admin/inventory/locations` | `admin/inventory/pages/InventoryLocationsPage.tsx` | DataTable | ✓ | ✓ | 317 | · | ✅ |
| `/admin/inventory/stock` | `admin/inventory/pages/InventoryStockPage.tsx` | DataTable | ✓ | ✓ | 626 | · | ✅ |
| `/admin/inventory/transfers` | `admin/isp-ops/pages/StockTransfersPage.tsx` | DataTable | ✓ | ✓ | 256 | · | ✅ |
| `/admin/inventory/units` | `admin/inventory/pages/InventoryUnitsPage.tsx` | DataTable | ✓ | ✓ | 270 | · | ✅ |
| `/admin/invoices` | `admin/isp-ops/pages/InvoicesPage.tsx` | DataTable | ✓ | ✓ | 333 | · | ✅ |
| `/admin/invoices/[id]` | `admin/isp-ops/pages/InvoiceDetailPage.tsx` | — | · | ✓ | 121 | · | ✅ |
| `/admin/ip-pools` | `admin/ip-pools/pages/IpPoolsPage.tsx` | DataTable | ✓ | ✓ | 345 | · | ✅ |
| `/admin/ipam` | `admin/isp-ops/pages/IpamPage.tsx` | DataTable | ✓ | ✓ | 252 | · | ✅ |
| `/admin/jobs` | `admin/isp-ops/pages/JobsPage.tsx` | DataTable | ✓ | ✓ | 433 | · | ✅ |
| `/admin/leads` | `admin/isp-ops/pages/LeadsPage.tsx` | DataTable | ✓ | ✓ | 632 | · | ✅ |
| `/admin/movie-servers` | `admin/movie-servers/pages/MovieServersPage.tsx` | — | · | ✓ | 428 | · | ✅ |
| `/admin/network/cgnat` | `admin/isp-ops/pages/CgnatPage.tsx` | DataTable | ✓ | ✓ | 132 | · | ✅ |
| `/admin/network/diagram` | `admin/network/pages/NetworkDiagramPage.tsx` | — | · | ✓ | 629 | · | ✅ |
| `/admin/network/ipoe` | `admin/isp-ops/pages/IpoePage.tsx` | DataTable | ✓ | ✓ | 89 | · | ✅ |
| `/admin/network/map` | `admin/network/pages/NetworkMapPage.tsx` | — | · | ✓ | 340 | · | ✅ |
| `/admin/network/netflow` | `admin/isp-ops/pages/NetflowPage.tsx` | DataTable | ✓ | ✓ | 502 | · | ✅ |
| `/admin/network/outages` | `admin/isp-ops/pages/OutagesPage.tsx` | DataTable | ✓ | ✓ | 128 | · | ✅ |
| `/admin/network/pon` | `admin/isp-ops/pages/PonMapPage.tsx` | DataTable | ✓ | ✓ | 103 | · | ✅ |
| `/admin/news` | `admin/news/pages/AdminNewsPage.tsx` | DataTable | ✓ | ✓ | 444 | · | ✅ |
| `/admin/noc` | `admin/isp-ops/pages/NocPage.tsx` | DataTable | ✓ | ✓ | 467 | · | ✅ |
| `/admin/notifications/usage-alerts` | `admin/isp-ops/pages/UsageAlertsPage.tsx` | DataTable | · | ✓ | 574 | · | ✅ |
| `/admin/olt` | `admin/olt/pages/OltPage.tsx` | DataTable + own | ✓ | ✓ | 510 | · | ✅ |
| `/admin/olt/[id]/onus` | `admin/isp-ops/pages/OltOnusPage.tsx` | DataTable | ✓ | ✓ | 361 | · | ✅ |
| `/admin/olt/vendors` | `admin/isp-ops/pages/OltVendorsPage.tsx` | DataTable | ✓ | ✓ | 263 | · | ✅ |
| `/admin/packages` | `admin/packages/pages/PackagesPage.tsx` | DataTable | · | ✓ | 721 | · | ✅ |
| `/admin/payment` | `admin/payment/pages/AdminPaymentPage.tsx` | DataTable + own | ✓ | ✓ | 365 | · | ✅ |
| `/admin/payment-gateways` | `admin/payment-gateways/pages/PaymentGatewaysPage.tsx` | — | · | ✓ | 178 | · | ✅ |
| `/admin/payment-gateways/[id]` | `admin/payment-gateways/pages/PaymentGatewayDetailPage.tsx` | — | · | ✓ | 196 | · | ✅ |
| `/admin/payments/credits` | `admin/isp-ops/pages/CreditsPage.tsx` | DataTable | · | ✓ | 633 | · | ✅ |
| `/admin/payments/reconcile` | `admin/isp-ops/pages/PaymentReconcilePage.tsx` | DataTable | ✓ | ✓ | 275 | · | ✅ |
| `/admin/pop-packages` | `admin/pop-packages/pages/PopPackagesPage.tsx` | DataTable | ✓ | ✓ | 403 | · | ✅ |
| `/admin/pop/commissions` | `admin/isp-ops/pages/PopCommissionsPage.tsx` | DataTable | ✓ | ✓ | 382 | · | ✅ |
| `/admin/pop/funding` | `admin/pop/funding/pages/PopFundingPage.tsx` | DataTable | · | ✓ | 561 | · | ✅ |
| `/admin/pop/package-profit` | `admin/isp-ops/pages/PackageProfitPage.tsx` | DataTable | ✓ | ✓ | 179 | · | ✅ |
| `/admin/pop/resellers` | `admin/pop/resellers/pages/PopResellersPage.tsx` | DataTable | ✓ | ✓ | 391 | · | ✅ |
| `/admin/pop/transactions` | `admin/pop/transactions/pages/PopTransactionsPage.tsx` | DataTable | ✓ | ✓ | 389 | · | ✅ |
| `/admin/product-showcase` | `admin/product-showcase/pages/AdminProductShowcasePage.tsx` | — | · | ✓ | 189 | · | ✅ |
| `/admin/profile` | `admin/profile/pages/ProfilePage.tsx` | — | · | ✓ | 667 | · | ✅ |
| `/admin/purchase/bills` | `admin/purchase/pages/PurchaseBillsPage.tsx` | DataTable + own | ✓ | ✓ | 423 | · | ✅ |
| `/admin/purchase/requisitions` | `admin/purchase/pages/RequisitionsPage.tsx` | DataTable + own | ✓ | ✓ | 384 | · | ✅ |
| `/admin/purchase/vendors` | `admin/purchase/pages/VendorsPage.tsx` | DataTable | ✓ | ✓ | 455 | · | ✅ |
| `/admin/radius` | `admin/isp-ops/pages/RadiusPanelPage.tsx` | DataTable | · | ✓ | 406 | · | ✅ |
| `/admin/recycle-bin` | `admin/recycle-bin/pages/RecycleBinPage.tsx` | DataTable | ✓ | ✓ | 315 | · | ✅ |
| `/admin/reports/btrc` | `admin/reports/pages/BtrcReportPage.tsx` | DataTable | ✓ | ✓ | 296 | · | ✅ |
| `/admin/reports/collections-map` | `admin/isp-ops/pages/CollectionsMapPage.tsx` | DataTable | ✓ | ✓ | 405 | · | ✅ |
| `/admin/reports/otc` | `admin/reports/pages/OtcReportPage.tsx` | DataTable | ✓ | ✓ | 382 | · | ✅ |
| `/admin/reports/usage` | `admin/isp-ops/pages/UsageReportPage.tsx` | DataTable | ✓ | ✓ | 186 | · | ✅ |
| `/admin/rewards` | `admin/rewards/pages/RewardsPage.tsx` | DataTable | · | ✓ | 565 | · | ✅ |
| `/admin/rewards/analytics` | `admin/isp-ops/pages/ReferralAnalyticsPage.tsx` | DataTable | ✓ | ✓ | 269 | · | ✅ |
| `/admin/routers` | `admin/routers/pages/RoutersPage.tsx` | DataTable | ✓ | ✓ | 354 | · | ✅ |
| `/admin/routers/[id]` | `admin/isp-ops/pages/RouterDetailPage.tsx` | — | · | ✓ | 174 | · | ✅ |
| `/admin/routers/[id]/users` | `admin/isp-ops/pages/RouterUsersPage.tsx` | DataTable | ✓ | ✓ | 213 | · | ✅ |
| `/admin/services` | `admin/isp-ops/pages/ServicesPage.tsx` | — | · | ✓ | 491 | · | ✅ |
| `/admin/services/mobile` | `admin/isp-ops/pages/MobilePlansPage.tsx` | — | · | ✓ | 517 | · | ✅ |
| `/admin/settings` | `admin/settings/pages/SettingsPage.tsx` | — | · | ✓ | 580 | · | ✅ |
| `/admin/sidebar-pins` | `admin/sidebar-pins/pages/SidebarPinsPage.tsx` | — | · | ✓ | 272 | · | ✅ |
| `/admin/sms` | `admin/sms/pages/SmsPage.tsx` | DataTable | ✓ | ✓ | 873 | · | ✅ |
| `/admin/sms-templates` | `admin/sms-templates/pages/SmsTemplatesPage.tsx` | DataTable | ✓ | ✓ | 563 | · | ✅ |
| `/admin/subscription` | `admin/subscription/pages/SelfRechargePage.tsx` | — | · | ✓ | 322 | · | ✅ |
| `/admin/support` | `admin/support/pages/SupportTicketsPage.tsx` | DataTable | ✓ | ✓ | 462 | · | ✅ |
| `/admin/support/[id]` | `admin/support/pages/SupportTicketDetailPage.tsx` | — | · | ✓ | 237 | · | ✅ |
| `/admin/support/feedback` | `admin/support/pages/CustomerFeedbackPage.tsx` | DataTable | ✓ | ✓ | 258 | · | ✅ |
| `/admin/theme-studio` | `admin/theme-studio/pages/ThemeStudioPage.tsx` | — | · | ✓ | 445 | · | ✅ |
| `/admin/user-access` | `shared/permission/components/PermissionGuard.tsx` | — | · | ✗ | 35 | · | ✅ |
| `/admin/voice-sms` | `admin/voice-sms/pages/VoiceSmsPage.tsx` | DataTable | · | ✓ | 571 | · | ✅ |
| `/admin/vpn` | `admin/isp-ops/pages/VpnPage.tsx` | DataTable | ✓ | ✓ | 355 | · | ✅ |
| `/admin/wallet` | `admin/wallet/pages/WalletPage.tsx` | DataTable | ✓ | ✓ | 400 | · | ✅ |
| `/admin/whatsapp/campaigns` | `admin/whatsapp/pages/WhatsAppCampaignsPage.tsx` | DataTable | ✓ | ✓ | 385 | · | ✅ |
| `/admin/whatsapp/inbox` | `admin/whatsapp/pages/WhatsAppInboxPage.tsx` | — | · | ✓ | 449 | · | ✅ |
| `/admin/whatsapp/message-log` | `admin/whatsapp/pages/WhatsAppMessageLogPage.tsx` | DataTable | ✓ | ✓ | 331 | · | ✅ |
| `/admin/whatsapp/opt-ins` | `admin/whatsapp/pages/WhatsAppOptInsPage.tsx` | DataTable | ✓ | ✓ | 336 | · | ✅ |
| `/admin/whatsapp/settings` | `admin/whatsapp/pages/WhatsAppSettingsPage.tsx` | — | · | ✓ | 366 | · | ✅ |
| `/admin/whatsapp/templates` | `admin/whatsapp/pages/WhatsAppTemplatesPage.tsx` | DataTable | ✓ | ✓ | 540 | · | ✅ |

## Platform (super-admin) (24) — 24 clean

| Screen | Page file | Table | URL | Bangla | Lines | Open | Done |
|---|---|---|---|---|---|---|---|
| `/platform/admins` | `platform/admins/pages/AdminsListPage.tsx` | DataTable | ✓ | ✓ | 347 | · | ✅ |
| `/platform/admins/[id]/billing` | `platform/admins/pages/AdminBillingModePage.tsx` | — | · | ✓ | 193 | · | ✅ |
| `/platform/admins/packages` | `platform/admins/pages/AdminPackagesPage.tsx` | — | · | ✓ | 438 | · | ✅ |
| `/platform/contacts` | `platform/contacts/pages/ContactsPage.tsx` | — | · | ✓ | 228 | · | ✅ |
| `/platform/dashboard` | `platform/dashboard/pages/PlatformDashboardPage.tsx` | — | · | ✓ | 402 | · | ✅ |
| `/platform/engines` | `admin/engines/pages/EnginesIndexPage.tsx` | DataTable | ✓ | ✓ | 241 | · | ✅ |
| `/platform/engines/[slug]` | `admin/engines/pages/EngineHubPage.tsx` | DataTable | ✓ | ✓ | 561 | · | ✅ |
| `/platform/file-manager` | `platform/file-manager/pages/FileManagerPage.tsx` | — | · | ✓ | 140 | · | ✅ |
| `/platform/hierarchy` | `platform/hierarchy/pages/PlatformHierarchyPage.tsx` | — | · | ✓ | 18 | · | ✅ |
| `/platform/maintenance` | `platform/settings/pages/MaintenancePage.tsx` | — | · | ✓ | 170 | · | ✅ |
| `/platform/metering` | `platform/metering/pages/PlatformMeteringPage.tsx` | DataTable | ✓ | ✓ | 151 | · | ✅ |
| `/platform/plugins` | `platform/plugins/pages/PluginsPage.tsx` | — | · | ✓ | 432 | · | ✅ |
| `/platform/redis-logs` | `platform/settings/pages/RedisLogsPage.tsx` | — | · | ✓ | 133 | · | ✅ |
| `/platform/revenue` | `platform/revenue/pages/RevenuePage.tsx` | DataTable | ✓ | ✓ | 253 | · | ✅ |
| `/platform/settings/software` | `platform/settings/pages/SoftwareSettingsPage.tsx` | — | · | ✓ | 253 | · | ✅ |
| `/platform/showcase` | `platform/showcase/pages/ShowcasePage.tsx` | — | · | ✓ | 326 | · | ✅ |
| `/platform/sla` | `platform/sla/pages/PlatformSlaPage.tsx` | DataTable | ✓ | ✓ | 162 | · | ✅ |
| `/platform/support-tickets` | `platform/support/pages/SupportTicketsPage.tsx` | — | ✓ | ✓ | 341 | · | ✅ |
| `/platform/tenants` | `platform/tenants/pages/TenantsListPage.tsx` | DataTable | ✓ | ✓ | 345 | · | ✅ |
| `/platform/tenants/[id]` | `platform/tenants/pages/TenantDetailPage.tsx` | — | · | ✓ | 204 | · | ✅ |
| `/platform/tenants/[id]/edit` | `platform/tenants/pages/TenantFormPage.tsx` | — | · | ✓ | 368 | · | ✅ |
| `/platform/tenants/[id]/health` | `platform/tenants/pages/TenantHealthPage.tsx` | — | · | ✓ | 98 | · | ✅ |
| `/platform/tenants/new` | `platform/tenants/pages/TenantFormPage.tsx` | — | · | ✓ | 368 | · | ✅ |
| `/platform/user-access` | `platform/user-access/pages/UserAccessPage.tsx` | DataTable | ✓ | ✓ | 193 | · | ✅ |

## Marketing, auth and public screens (16) — 16 clean

| Screen | Page file | Table | URL | Bangla | Lines | Open | Done |
|---|---|---|---|---|---|---|---|
| `/` | `marketing/landing/pages/LandingPage.tsx` | — | · | — | 82 | · | ✅ |
| `/403` | `shared/permission/components/ForbiddenPage.tsx` | — | · | ✓ | 44 | · | ✅ |
| `/captive` | `marketing/captive/pages/CaptivePage.tsx` | — | ✓ | ✓ | 235 | · | ✅ |
| `/contact` | `marketing/contact/pages/ContactPage.tsx` | — | · | — | 16 | · | ✅ |
| `/forgot-password` | `auth/forgot-password/pages/ForgotPasswordPage.tsx` | — | · | ✓ | 150 | · | ✅ |
| `/help` | `marketing/help/pages/HelpPage.tsx` | — | · | ✓ | 129 | · | ✅ |
| `/login` | `auth/login/pages/LoginPage.tsx` | — | ✓ | ✓ | 27 | · | ✅ |
| `/plugins` | `marketing/plugins/pages/PluginsPage.tsx` | — | · | ✓ | 227 | · | ✅ |
| `/plugins/[slug]` | `marketing/plugins/pages/PluginDetailPage.tsx` | — | · | ✓ | 243 | · | ✅ |
| `/pricing` | `marketing/pricing/pages/PricingPage.tsx` | — | · | ✓ | 345 | · | ✅ |
| `/privacy` | `marketing/legal/pages/LegalPage.tsx` | — | · | — | 68 | · | ✅ |
| `/register` | `marketing/register/pages/RegisterPage.tsx` | — | · | ✓ | 573 | · | ✅ |
| `/register/referral` | `marketing/register/pages/RegisterPage.tsx` | — | · | ✓ | 573 | · | ✅ |
| `/reset-password` | `auth/reset-password/pages/ResetPasswordPage.tsx` | — | ✓ | ✓ | 152 | · | ✅ |
| `/status` | `marketing/status/pages/StatusPage.tsx` | — | · | ✓ | 171 | · | ✅ |
| `/terms` | `marketing/legal/pages/LegalPage.tsx` | — | · | — | 68 | · | ✅ |

**Total: 210 of 210 screens clean.**
