# 08 — Page inventory

Every screen in the app (210; the 4 redirect-only routes are left out), with the fix IDs that apply to it. Tick **Done** when all of a row's fixes have landed. Generated 2026-10-18 at `5dbf823` by a one-off script; the counts are a snapshot, so ask for a re-run after big changes rather than editing numbers by hand.

**How the counts work:** each row scans the screen's page component plus the local files it imports one level down (its own `../components`). Shared components (DataTable, StatusBadge, …) are not counted here; they are fixed once in [01](01-SHARED-FIXES.md) and [02](02-DATA-TABLES.md).

| Column | Meaning |
|---|---|
| Table | `DataTable` = shared table · `own` = hand-built `<table>` (needs T4) · `DT + own` = both |
| <12px | uses of `text-[9px]` / `text-[10px]` / `text-[11px]` (S1) |
| Link>Btn | `<Link><Button>` nestings (S4) |
| Icon | icon-only buttons with no `aria-label` / `title` (S5) |
| Colour | hand-rolled status colours like `bg-emerald-500/10` (S2) |
| Num | bare `.toLocaleString()` or hand-built `৳` formatting (S3) |
| Lines | page component size (A6 at ≥600) |

## Customer portal (19)

2 with a table · 9 with sub-12px text · 14 with Link>Button · 0 with unlabelled icon buttons

| Screen | Page file | Table | <12px | Link>Btn | Icon | Colour | Num | Lines | Fixes | Done |
|---|---|---|---|---|---|---|---|---|---|---|
| `/customer/change-password` | `customer/change-password/pages/CustomerChangePasswordPage.tsx` | — | · | 2 | · | · | · | 173 | S4 I2 | ☐ |
| `/customer/dashboard` | `customer/dashboard/pages/CustomerDashboardPage.tsx` | — | 9 | 5 | · | 5 | · | 540 | S1 S2 S4 C1 C4 I2 | ☐ |
| `/customer/experience` | `admin/engines/pages/CustomerCxPage.tsx` | — | 6 | · | · | · | · | 427 | S1 I2 | ☐ |
| `/customer/help` | `customer/help/pages/CustomerHelpPage.tsx` | — | · | · | · | · | · | 18 | I2 | ☐ |
| `/customer/news` | `customer/news/pages/CustomerNewsPage.tsx` | — | · | · | · | · | · | 176 | I2 | ☐ |
| `/customer/packages` | `customer/packages/pages/CustomerPackagesPage.tsx` | — | · | 2 | · | · | · | 194 | S4 I2 | ☐ |
| `/customer/payments` | `customer/payments/pages/CustomerPaymentsPage.tsx` | DataTable | 1 | 2 | · | · | · | 174 | S1 S4 T1 C5 I2 | ☐ |
| `/customer/payments/[id]/invoice` | `customer/payments/pages/CustomerInvoicePage.tsx` | — | · | · | · | · | · | 118 | I2 | ☐ |
| `/customer/payments/auto-pay` | `customer/payments/pages/CustomerAutoPayPage.tsx` | — | · | 1 | · | · | · | 247 | S4 I2 | ☐ |
| `/customer/payments/pay` | `customer/payments/pages/CustomerPayPage.tsx` | — | · | 1 | · | · | · | 209 | S4 C1 I2 | ☐ |
| `/customer/profile` | `customer/profile/pages/CustomerProfilePage.tsx` | — | · | 1 | · | · | · | 196 | S4 I2 | ☐ |
| `/customer/rewards` | `customer/rewards/pages/CustomerRewardsPage.tsx` | — | 2 | · | · | · | 9 | 353 | S1 S3 I2 | ☐ |
| `/customer/router` | `customer/router/pages/CustomerRouterPage.tsx` | — | 1 | 4 | · | 2 | · | 276 | S1 S2 S4 I2 | ☐ |
| `/customer/router/devices` | `customer/router/pages/CustomerDevicesPage.tsx` | DataTable | 1 | 1 | · | · | · | 229 | S1 S4 T1 C5 I2 | ☐ |
| `/customer/router/wifi` | `customer/router/pages/CustomerWifiSettingsPage.tsx` | — | · | 2 | · | · | · | 203 | S4 I2 | ☐ |
| `/customer/subscription` | `customer/subscription/pages/CustomerSubscriptionPage.tsx` | — | 1 | 2 | · | · | · | 286 | S1 S4 I2 | ☐ |
| `/customer/support` | `customer/support/pages/CustomerSupportPage.tsx` | — | 2 | 2 | · | · | · | 269 | S1 S4 C5 I2 | ☐ |
| `/customer/support/[id]` | `customer/support/pages/CustomerTicketDetailPage.tsx` | — | 1 | 1 | · | 1 | · | 213 | S1 S2 S4 I2 | ☐ |
| `/customer/support/new` | `customer/support/pages/CustomerNewTicketPage.tsx` | — | · | 2 | · | · | · | 216 | S4 I2 | ☐ |

## Employee portal (6)

3 with a table · 1 with sub-12px text · 0 with Link>Button · 0 with unlabelled icon buttons

| Screen | Page file | Table | <12px | Link>Btn | Icon | Colour | Num | Lines | Fixes | Done |
|---|---|---|---|---|---|---|---|---|---|---|
| `/employee/advance-salary` | `employee/advance-salary/pages/EmployeeAdvanceSalaryPage.tsx` | DataTable | 1 | · | · | · | · | 271 | S1 T1 I3 | ☐ |
| `/employee/attendance` | `employee/attendance/pages/EmployeeAttendancePage.tsx` | — | · | · | · | · | · | 181 | I3 | ☐ |
| `/employee/installations` | `admin/engines/pages/EmployeeInstallPage.tsx` | own | · | · | · | · | · | 248 | T4 E1 I3 | ☐ |
| `/employee/jobs` | `employee/jobs/pages/EmployeeJobsPage.tsx` | — | · | · | · | 1 | · | 142 | S2 I3 | ☐ |
| `/employee/profile` | `employee/profile/pages/EmployeeProfilePage.tsx` | — | · | · | · | · | · | 186 | I3 | ☐ |
| `/employee/salaries` | `employee/salaries/pages/EmployeeSalariesPage.tsx` | DataTable | · | · | · | · | 2 | 204 | S3 T1 I3 | ☐ |

## Admin portal (145)

111 with a table · 115 with sub-12px text · 21 with Link>Button · 32 with unlabelled icon buttons

| Module | Screen | Page file | Table | <12px | Link>Btn | Icon | Colour | Num | Lines | Fixes | Done |
|---|---|---|---|---|---|---|---|---|---|---|---|
| **accounting** | `/admin/accounting/balance-sheet` | `admin/accounting/balance-sheet/pages/BalanceSheetPage.tsx` | — | 3 | · | · | 9 | · | 343 | S1 S2 | ☐ |
|  | `/admin/accounting/chart-of-accounts` | `admin/accounting/chart-of-accounts/pages/ChartOfAccountsPage.tsx` | own | 6 | · | · | 6 | · | 632 | S1 S2 T4 A6 | ☐ |
|  | `/admin/accounting/expenses` | `admin/accounting/expenses/pages/ExpensesPage.tsx` | own | 2 | · | · | 6 | 3 | 14 | S1 S2 S3 T4 | ☐ |
|  | `/admin/accounting/incomes` | `admin/accounting/incomes/pages/IncomesPage.tsx` | own | 2 | · | · | 6 | 3 | 14 | S1 S2 S3 T4 | ☐ |
|  | `/admin/accounting/journal-entries` | `admin/accounting/journal-entries/pages/JournalEntriesPage.tsx` | own | 8 | · | · | 5 | 3 | 447 | S1 S2 S3 T4 | ☐ |
|  | `/admin/accounting/reports` | `admin/accounting/reports/pages/AccountingReportsPage.tsx` | own | 1 | · | · | 3 | · | 279 | S1 S2 T4 | ☐ |
| **acs** | `/admin/acs` | `admin/isp-ops/pages/AcsPage.tsx` | DataTable | 6 | · | 3 | · | 1 | 407 | S1 S3 S5 T1 | ☐ |
| **addons** | `/admin/addons` | `admin/isp-ops/pages/AddonsPage.tsx` | DataTable | 14 | · | · | 6 | 12 | 827 | S1 S2 S3 T1 A6 | ☐ |
| **ai-chat** | `/admin/ai-chat` | `admin/ai-chat/pages/AiChatPage.tsx` | — | 5 | · | · | · | · | 275 | S1 | ☐ |
| **announcements** | `/admin/announcements` | `admin/isp-ops/pages/AnnouncementsPage.tsx` | DataTable | 4 | · | 3 | · | · | 400 | S1 S5 T1 | ☐ |
| **areas** | `/admin/areas` | `admin/areas/pages/AreasPage.tsx` | own | 7 | · | 2 | 4 | · | 786 | S1 S2 S5 T4 A6 | ☐ |
| **audit-logs** | `/admin/audit-logs` | `admin/audit-logs/pages/AuditLogsPage.tsx` | DataTable | · | · | · | · | 1 | 206 | S3 T1 | ☐ |
| **backup** | `/admin/backup` | `admin/isp-ops/pages/BackupPage.tsx` | own | 2 | · | · | 2 | 1 | 224 | S1 S2 S3 T4 | ☐ |
| **bandwidth** | `/admin/bandwidth/buy` | `admin/bandwidth/pages/BandwidthBuyHubPage.tsx` | — | 3 | 2 | · | 2 | · | 181 | S1 S2 S4 | ☐ |
|  | `/admin/bandwidth/buy/bills` | `admin/bandwidth/pages/BandwidthBillsPage.tsx` | DT + own | 4 | · | · | · | · | 349 | S1 T1 | ☐ |
|  | `/admin/bandwidth/buy/categories` | `admin/bandwidth/pages/BandwidthCategoriesPage.tsx` | DataTable | 2 | · | · | · | · | 362 | S1 T1 | ☐ |
|  | `/admin/bandwidth/buy/items` | `admin/bandwidth/pages/BandwidthItemsPage.tsx` | DataTable | 3 | · | · | · | · | 351 | S1 T1 | ☐ |
|  | `/admin/bandwidth/buy/providers` | `admin/bandwidth/pages/BandwidthProvidersPage.tsx` | DataTable | 3 | · | · | · | · | 303 | S1 T1 | ☐ |
|  | `/admin/bandwidth/daily-bill` | `admin/bandwidth/pages/BandwidthDailyBillPage.tsx` | DataTable | 3 | · | · | · | · | 279 | S1 T1 | ☐ |
|  | `/admin/bandwidth/sell` | `admin/bandwidth/pages/BandwidthSellHubPage.tsx` | — | 3 | 2 | · | 2 | · | 161 | S1 S2 S4 | ☐ |
|  | `/admin/bandwidth/sell/clients` | `admin/bandwidth/pages/BandwidthSellClientsPage.tsx` | DataTable | 3 | · | · | · | · | 216 | S1 T1 | ☐ |
|  | `/admin/bandwidth/sell/invoices` | `admin/bandwidth/pages/BandwidthInvoicesPage.tsx` | DT + own | 6 | · | · | · | · | 376 | S1 T1 | ☐ |
|  | `/admin/bandwidth/sla` | `admin/isp-ops/pages/BandwidthSlaPage.tsx` | DataTable | 1 | · | 2 | 1 | 3 | 307 | S1 S2 S3 S5 T1 | ☐ |
| **billing** | `/admin/billing/deposits` | `admin/isp-ops/pages/DepositsPage.tsx` | own | 12 | · | · | 4 | · | 662 | S1 S2 T4 A6 | ☐ |
|  | `/admin/billing/dunning` | `admin/isp-ops/pages/DunningPage.tsx` | own | 15 | · | 1 | 2 | · | 457 | S1 S2 S5 T4 | ☐ |
|  | `/admin/billing/policies` | `admin/isp-ops/pages/BillingPoliciesPage.tsx` | own | 23 | · | · | 7 | 8 | 830 | S1 S2 S3 T4 A6 | ☐ |
|  | `/admin/billing/proration` | `admin/isp-ops/pages/ProrationPage.tsx` | — | 17 | · | · | 3 | · | 259 | S1 S2 | ☐ |
|  | `/admin/billing/tax` | `admin/isp-ops/pages/TaxSettingsPage.tsx` | own | 11 | · | · | 4 | · | 443 | S1 S2 T4 | ☐ |
| **branding** | `/admin/branding` | `admin/isp-ops/pages/BrandingPage.tsx` | — | 4 | · | · | · | · | 229 | S1 | ☐ |
| **collections** | `/admin/collections/cashbook` | `admin/isp-ops/pages/CashbookPage.tsx` | own | 2 | 1 | · | 5 | 2 | 236 | S1 S2 S3 S4 T4 | ☐ |
|  | `/admin/collections/reminders` | `admin/isp-ops/pages/RemindersPage.tsx` | own | 19 | · | · | 7 | 2 | 639 | S1 S2 S3 T4 A6 | ☐ |
| **compliance** | `/admin/compliance/ip-logs` | `admin/isp-ops/pages/IpLogsPage.tsx` | own | 4 | · | · | 3 | 4 | 225 | S1 S2 S3 T4 | ☐ |
| **contracts** | `/admin/contracts` | `admin/isp-ops/pages/ContractsPage.tsx` | DataTable | 8 | · | · | · | · | 572 | S1 T1 | ☐ |
| **corporate** | `/admin/corporate/queues` | `admin/corporate/pages/CorporateQueuesPage.tsx` | DataTable | · | · | · | 4 | · | 350 | S2 T1 | ☐ |
| **customer-payments** | `/admin/customer-payments` | `admin/customer-payments/pages/CustomerPaymentsPage.tsx` | DT + own | 15 | 2 | · | 2 | · | 438 | S1 S2 S4 T1 | ☐ |
|  | `/admin/customer-payments/[id]/pos` | `admin/isp-ops/pages/PosReceiptPage.tsx` | — | 6 | 1 | · | 1 | 2 | 321 | S1 S2 S3 S4 | ☐ |
|  | `/admin/customer-payments/new` | `admin/customer-payments/pages/NewCustomerPaymentPage.tsx` | — | · | 2 | 1 | · | · | 211 | S4 S5 A4 | ☐ |
| **customers** | `/admin/customers` | `admin/customers/pages/AllCustomersPage.tsx` | own | 17 | 2 | 1 | 1 | 2 | 1324 | S1 S2 S3 S4 S5 S6 T4 A3 A6 | ☐ |
|  | `/admin/customers/[id]` | `admin/customers/pages/CustomerDetailPage.tsx` | — | 24 | 3 | · | 6 | · | 791 | S1 S2 S4 S6 M6 A6 | ☐ |
|  | `/admin/customers/[id]/audit` | `admin/customers/pages/CustomerAuditPage.tsx` | DataTable | · | · | · | · | 1 | 115 | S3 T1 | ☐ |
|  | `/admin/customers/[id]/edit` | `admin/customers/pages/EditCustomerPage.tsx` | — | 1 | 2 | 1 | · | 1 | 131 | S1 S3 S4 S5 | ☐ |
|  | `/admin/customers/[id]/kyc` | `admin/isp-ops/pages/CustomerKycPage.tsx` | DataTable | 2 | · | · | · | · | 329 | S1 T1 | ☐ |
|  | `/admin/customers/[id]/mac-bind` | `admin/customers/pages/MacBindPage.tsx` | — | · | · | · | · | · | 84 | — | ☐ |
|  | `/admin/customers/expired` | `admin/customers/pages/ExpiredCustomersPage.tsx` | own | 6 | 1 | · | 3 | · | 417 | S1 S2 S4 T4 A3 | ☐ |
|  | `/admin/customers/free-requests` | `admin/customers/pages/FreeRequestsPage.tsx` | own | 6 | · | · | · | · | 279 | S1 T4 | ☐ |
|  | `/admin/customers/groups` | `admin/isp-ops/pages/CustomerGroupsPage.tsx` | own | 3 | · | 3 | 2 | · | 516 | S1 S2 S5 T4 | ☐ |
|  | `/admin/customers/import` | `admin/customers/pages/ImportCustomersPage.tsx` | own | · | 2 | 1 | · | · | 224 | S4 S5 T4 | ☐ |
|  | `/admin/customers/inactive` | `admin/isp-ops/pages/InactiveCustomersPage.tsx` | own | 5 | · | · | 4 | · | 280 | S1 S2 T4 | ☐ |
|  | `/admin/customers/new` | `admin/customers/pages/NewCustomerPage.tsx` | — | 1 | 2 | 1 | · | 1 | 100 | S1 S3 S4 S5 | ☐ |
| **dashboard** | `/admin/dashboard` | `admin/dashboard/pages/AdminDashboardPage.tsx` | — | 21 | 5 | · | 4 | 15 | 636 | S1 S2 S3 S4 A2 A6 | ☐ |
| **dealers** | `/admin/dealers` | `admin/isp-ops/pages/DealersPage.tsx` | DataTable | 9 | · | · | 2 | 1 | 575 | S1 S2 S3 T1 | ☐ |
| **developers** | `/admin/developers` | `admin/isp-ops/pages/DevelopersPage.tsx` | own | 11 | · | 1 | 4 | 1 | 644 | S1 S2 S3 S5 T4 A6 | ☐ |
| **engines** | `/admin/engines` | `admin/engines/pages/EnginesIndexPage.tsx` | own | 1 | · | · | · | · | 276 | S1 T4 | ☐ |
|  | `/admin/engines/[slug]` | `admin/engines/pages/EngineHubPage.tsx` | DataTable | 1 | · | · | · | · | 542 | S1 T1 | ☐ |
| **fraud** | `/admin/fraud` | `admin/isp-ops/pages/FraudPage.tsx` | DataTable | 9 | · | 1 | · | 2 | 250 | S1 S3 S5 T1 | ☐ |
| **hierarchy** | `/admin/hierarchy` | `admin/hierarchy/pages/AdminHierarchyPage.tsx` | — | · | · | · | · | · | 21 | A5 | ☐ |
| **hotspot** | `/admin/hotspot` | `admin/hotspot/pages/HotspotHubPage.tsx` | — | · | 2 | · | 3 | · | 197 | S2 S4 | ☐ |
|  | `/admin/hotspot/dashboard` | `admin/hotspot/pages/HotspotDashboardPage.tsx` | DataTable | · | 1 | · | · | · | 284 | S4 T1 | ☐ |
|  | `/admin/hotspot/packages` | `admin/hotspot/pages/HotspotPackagesPage.tsx` | DataTable | · | · | · | · | · | 608 | T1 A6 | ☐ |
|  | `/admin/hotspot/reports` | `admin/hotspot/pages/HotspotReportsPage.tsx` | DataTable | · | · | · | · | · | 228 | T1 | ☐ |
|  | `/admin/hotspot/users` | `admin/hotspot/pages/HotspotUsersPage.tsx` | DataTable | · | · | · | 1 | · | 638 | S2 T1 A6 | ☐ |
|  | `/admin/hotspot/vouchers` | `admin/isp-ops/pages/HotspotVouchersPage.tsx` | DataTable | · | · | · | 2 | · | 589 | S2 T1 | ☐ |
|  | `/admin/hotspot/walled-garden` | `admin/isp-ops/pages/WalledGardenPage.tsx` | DataTable | · | · | · | 3 | · | 436 | S2 T1 | ☐ |
| **hr** | `/admin/hr/accounts` | `admin/hr/accounts/pages/EmployeeAccountsPage.tsx` | own | 11 | · | · | · | · | 221 | S1 T4 | ☐ |
|  | `/admin/hr/advance-salary` | `admin/hr/advance-salary/pages/AdvanceSalaryPage.tsx` | own | 10 | · | · | 4 | · | 387 | S1 S2 T4 | ☐ |
|  | `/admin/hr/attendance` | `admin/hr/attendance/pages/AttendancePage.tsx` | own | 9 | · | 1 | 6 | · | 293 | S1 S2 S5 T4 | ☐ |
|  | `/admin/hr/employees` | `admin/hr/employees/pages/EmployeesPage.tsx` | own | 9 | 1 | 2 | 1 | · | 432 | S1 S2 S4 S5 T4 | ☐ |
|  | `/admin/hr/employees/[id]` | `admin/hr/employees/pages/EmployeeDetailsPage.tsx` | own | 9 | 1 | · | 8 | · | 652 | S1 S2 S4 T4 A6 | ☐ |
|  | `/admin/hr/salaries` | `admin/hr/salaries/pages/SalariesPage.tsx` | own | 11 | · | · | 3 | · | 243 | S1 S2 T4 | ☐ |
| **inventory** | `/admin/inventory/assign` | `admin/isp-ops/pages/CpeAssignPage.tsx` | DataTable | 3 | · | · | 1 | 3 | 625 | S1 S2 S3 T1 A6 | ☐ |
|  | `/admin/inventory/categories` | `admin/inventory/pages/InventoryCategoriesPage.tsx` | DataTable | · | · | · | 1 | 1 | 565 | S2 S3 S6 T1 | ☐ |
|  | `/admin/inventory/items` | `admin/inventory/pages/InventoryItemsPage.tsx` | DataTable | · | · | · | 1 | 1 | 547 | S2 S3 T1 | ☐ |
|  | `/admin/inventory/locations` | `admin/inventory/pages/InventoryLocationsPage.tsx` | DataTable | · | · | · | · | 2 | 305 | S3 S6 T1 | ☐ |
|  | `/admin/inventory/stock` | `admin/inventory/pages/InventoryStockPage.tsx` | DataTable | · | · | · | 7 | 4 | 606 | S2 S3 T1 A6 | ☐ |
|  | `/admin/inventory/transfers` | `admin/isp-ops/pages/StockTransfersPage.tsx` | DataTable | · | · | · | · | 4 | 253 | S3 T1 | ☐ |
|  | `/admin/inventory/units` | `admin/inventory/pages/InventoryUnitsPage.tsx` | DataTable | · | · | · | · | 1 | 259 | S3 T1 | ☐ |
| **invoices** | `/admin/invoices` | `admin/isp-ops/pages/InvoicesPage.tsx` | DataTable | 2 | 1 | · | 2 | · | 324 | S1 S2 S4 S6 T1 | ☐ |
|  | `/admin/invoices/[id]` | `admin/isp-ops/pages/InvoiceDetailPage.tsx` | — | · | 1 | · | · | · | 121 | S4 | ☐ |
| **ip-pools** | `/admin/ip-pools` | `admin/ip-pools/pages/IpPoolsPage.tsx` | DataTable | · | · | · | · | 3 | 336 | S3 T1 | ☐ |
| **ipam** | `/admin/ipam` | `admin/isp-ops/pages/IpamPage.tsx` | DataTable | · | · | · | · | 5 | 239 | S3 T1 | ☐ |
| **jobs** | `/admin/jobs` | `admin/isp-ops/pages/JobsPage.tsx` | own | 14 | · | · | 6 | 1 | 398 | S1 S2 S3 T4 | ☐ |
| **leads** | `/admin/leads` | `admin/isp-ops/pages/LeadsPage.tsx` | own | 17 | · | · | 6 | 2 | 603 | S1 S2 S3 T4 A6 | ☐ |
| **movie-servers** | `/admin/movie-servers` | `admin/movie-servers/pages/MovieServersPage.tsx` | — | 6 | · | · | 4 | · | 410 | S1 S2 | ☐ |
| **network** | `/admin/network/cgnat` | `admin/isp-ops/pages/CgnatPage.tsx` | DataTable | 1 | · | · | · | 4 | 118 | S1 S3 T1 | ☐ |
|  | `/admin/network/diagram` | `admin/network/pages/NetworkDiagramPage.tsx` | — | 16 | · | 2 | 4 | · | 613 | S1 S2 S5 A6 | ☐ |
|  | `/admin/network/ipoe` | `admin/isp-ops/pages/IpoePage.tsx` | DataTable | · | · | · | 2 | 2 | 95 | S2 S3 T1 | ☐ |
|  | `/admin/network/map` | `admin/network/pages/NetworkMapPage.tsx` | — | 6 | · | · | 3 | · | 335 | S1 S2 | ☐ |
|  | `/admin/network/netflow` | `admin/isp-ops/pages/NetflowPage.tsx` | own | 17 | · | · | 3 | 2 | 460 | S1 S2 S3 T4 | ☐ |
|  | `/admin/network/outages` | `admin/isp-ops/pages/OutagesPage.tsx` | DataTable | 1 | · | · | 4 | 4 | 114 | S1 S2 S3 T1 | ☐ |
|  | `/admin/network/pon` | `admin/isp-ops/pages/PonMapPage.tsx` | DataTable | 1 | · | · | · | 3 | 99 | S1 S3 T1 | ☐ |
| **news** | `/admin/news` | `admin/news/pages/AdminNewsPage.tsx` | DataTable | 5 | · | 3 | 2 | · | 410 | S1 S2 S5 T1 | ☐ |
| **noc** | `/admin/noc` | `admin/isp-ops/pages/NocPage.tsx` | DataTable | 3 | · | 2 | 5 | 2 | 392 | S1 S2 S3 S5 T1 | ☐ |
| **notifications** | `/admin/notifications/usage-alerts` | `admin/isp-ops/pages/UsageAlertsPage.tsx` | DataTable | 7 | · | 2 | · | · | 547 | S1 S5 T1 | ☐ |
| **olt** | `/admin/olt` | `admin/olt/pages/OltPage.tsx` | DT + own | 21 | · | · | 8 | · | 498 | S1 S2 T1 | ☐ |
|  | `/admin/olt/[id]/onus` | `admin/isp-ops/pages/OltOnusPage.tsx` | DataTable | 3 | · | · | 5 | · | 336 | S1 S2 T1 | ☐ |
|  | `/admin/olt/vendors` | `admin/isp-ops/pages/OltVendorsPage.tsx` | DataTable | · | · | · | 1 | · | 254 | S2 T1 | ☐ |
| **packages** | `/admin/packages` | `admin/packages/pages/PackagesPage.tsx` | own | 16 | · | 2 | 2 | 4 | 666 | S1 S2 S3 S5 T4 A6 | ☐ |
| **payment** | `/admin/payment` | `admin/payment/pages/AdminPaymentPage.tsx` | DT + own | 7 | 1 | · | · | · | 320 | S1 S4 T1 | ☐ |
| **payment-gateways** | `/admin/payment-gateways` | `admin/payment-gateways/pages/PaymentGatewaysPage.tsx` | — | 7 | · | · | 5 | 4 | 178 | S1 S2 S3 | ☐ |
|  | `/admin/payment-gateways/[id]` | `admin/payment-gateways/pages/PaymentGatewayDetailPage.tsx` | — | 2 | · | · | · | 4 | 186 | S1 S3 | ☐ |
| **payments** | `/admin/payments/credits` | `admin/isp-ops/pages/CreditsPage.tsx` | own | 10 | · | · | 2 | · | 590 | S1 S2 T4 | ☐ |
|  | `/admin/payments/reconcile` | `admin/isp-ops/pages/PaymentReconcilePage.tsx` | DataTable | 1 | · | · | · | · | 245 | S1 T1 | ☐ |
| **pop-packages** | `/admin/pop-packages` | `admin/pop-packages/pages/PopPackagesPage.tsx` | own | 1 | · | · | · | · | 353 | S1 T4 | ☐ |
| **pop** | `/admin/pop/commissions` | `admin/isp-ops/pages/PopCommissionsPage.tsx` | DataTable | 6 | · | · | · | 2 | 361 | S1 S3 T1 | ☐ |
|  | `/admin/pop/funding` | `admin/pop/funding/pages/PopFundingPage.tsx` | own | 7 | · | · | 2 | 2 | 521 | S1 S2 S3 T4 | ☐ |
|  | `/admin/pop/package-profit` | `admin/isp-ops/pages/PackageProfitPage.tsx` | DataTable | 1 | · | · | 2 | · | 173 | S1 S2 T1 | ☐ |
|  | `/admin/pop/resellers` | `admin/pop/resellers/pages/PopResellersPage.tsx` | DataTable | 9 | · | · | · | 1 | 358 | S1 S3 T1 | ☐ |
|  | `/admin/pop/transactions` | `admin/pop/transactions/pages/PopTransactionsPage.tsx` | own | 4 | · | · | 6 | · | 358 | S1 S2 T4 | ☐ |
| **product-showcase** | `/admin/product-showcase` | `admin/product-showcase/pages/AdminProductShowcasePage.tsx` | — | 2 | · | · | · | · | 165 | S1 | ☐ |
| **profile** | `/admin/profile` | `admin/profile/pages/ProfilePage.tsx` | — | 2 | · | · | 3 | 1 | 636 | S1 S2 S3 A6 | ☐ |
| **purchase** | `/admin/purchase/bills` | `admin/purchase/pages/PurchaseBillsPage.tsx` | DT + own | 12 | · | · | 3 | 1 | 405 | S1 S2 S3 T1 | ☐ |
|  | `/admin/purchase/requisitions` | `admin/purchase/pages/RequisitionsPage.tsx` | DT + own | 12 | · | · | 1 | 1 | 370 | S1 S2 S3 T1 | ☐ |
|  | `/admin/purchase/vendors` | `admin/purchase/pages/VendorsPage.tsx` | DataTable | · | · | · | · | 2 | 433 | S3 S6 T1 | ☐ |
| **radius** | `/admin/radius` | `admin/isp-ops/pages/RadiusPanelPage.tsx` | DataTable | 1 | · | · | 2 | · | 407 | S1 S2 T1 | ☐ |
| **recycle-bin** | `/admin/recycle-bin` | `admin/recycle-bin/pages/RecycleBinPage.tsx` | DataTable | 2 | · | · | 2 | 1 | 270 | S1 S2 S3 T1 | ☐ |
| **reports** | `/admin/reports/btrc` | `admin/reports/pages/BtrcReportPage.tsx` | own | 4 | · | · | 1 | · | 272 | S1 S2 T4 | ☐ |
|  | `/admin/reports/collections-map` | `admin/isp-ops/pages/CollectionsMapPage.tsx` | own | 11 | · | · | 1 | · | 416 | S1 S2 T4 | ☐ |
|  | `/admin/reports/otc` | `admin/reports/pages/OtcReportPage.tsx` | own | 3 | · | · | 6 | 3 | 433 | S1 S2 S3 T4 | ☐ |
|  | `/admin/reports/usage` | `admin/isp-ops/pages/UsageReportPage.tsx` | own | 3 | · | · | 2 | · | 171 | S1 S2 T4 | ☐ |
| **rewards** | `/admin/rewards` | `admin/rewards/pages/RewardsPage.tsx` | DataTable | 9 | · | 2 | 1 | 4 | 531 | S1 S2 S3 S5 T1 | ☐ |
|  | `/admin/rewards/analytics` | `admin/isp-ops/pages/ReferralAnalyticsPage.tsx` | DataTable | 8 | · | · | · | 6 | 260 | S1 S3 T1 | ☐ |
| **routers** | `/admin/routers` | `admin/routers/pages/RoutersPage.tsx` | DataTable | 1 | · | · | · | 2 | 338 | S1 S3 T1 | ☐ |
|  | `/admin/routers/[id]` | `admin/isp-ops/pages/RouterDetailPage.tsx` | — | · | · | · | · | · | 161 | — | ☐ |
|  | `/admin/routers/[id]/users` | `admin/isp-ops/pages/RouterUsersPage.tsx` | DataTable | · | · | · | · | · | 211 | T1 | ☐ |
| **services** | `/admin/services` | `admin/isp-ops/pages/ServicesPage.tsx` | — | 11 | · | · | 5 | 5 | 461 | S1 S2 S3 | ☐ |
|  | `/admin/services/mobile` | `admin/isp-ops/pages/MobilePlansPage.tsx` | — | 12 | · | · | 4 | 6 | 509 | S1 S2 S3 | ☐ |
| **settings** | `/admin/settings` | `admin/settings/pages/SettingsPage.tsx` | — | 11 | · | · | · | · | 558 | S1 | ☐ |
| **sidebar-pins** | `/admin/sidebar-pins` | `admin/sidebar-pins/pages/SidebarPinsPage.tsx` | — | · | · | 2 | · | · | 261 | S5 | ☐ |
| **sms** | `/admin/sms` | `admin/sms/pages/SmsPage.tsx` | DataTable | 11 | · | 2 | · | · | 833 | S1 S5 T1 A6 | ☐ |
| **sms-templates** | `/admin/sms-templates` | `admin/sms-templates/pages/SmsTemplatesPage.tsx` | DataTable | 6 | · | 3 | · | · | 558 | S1 S5 T1 | ☐ |
| **subscription** | `/admin/subscription` | `admin/subscription/pages/SelfRechargePage.tsx` | — | 7 | 1 | · | 2 | 4 | 309 | S1 S2 S3 S4 | ☐ |
| **support** | `/admin/support` | `admin/support/pages/SupportTicketsPage.tsx` | DataTable | 8 | · | · | · | · | 424 | S1 T1 | ☐ |
|  | `/admin/support/[id]` | `admin/support/pages/SupportTicketDetailPage.tsx` | — | 1 | · | · | · | · | 222 | S1 | ☐ |
|  | `/admin/support/feedback` | `admin/support/pages/CustomerFeedbackPage.tsx` | DataTable | 2 | · | · | · | · | 234 | S1 T1 | ☐ |
| **theme-studio** | `/admin/theme-studio` | `admin/theme-studio/pages/ThemeStudioPage.tsx` | — | 12 | · | · | 2 | · | 430 | S1 S2 | ☐ |
| **user-access** | `/admin/user-access` | `shared/permission/components/PermissionGuard.tsx` | — | · | · | · | · | · | 35 | — | ☐ |
| **voice-sms** | `/admin/voice-sms` | `admin/voice-sms/pages/VoiceSmsPage.tsx` | DataTable | 4 | · | 2 | · | · | 496 | S1 S5 T1 | ☐ |
| **vpn** | `/admin/vpn` | `admin/isp-ops/pages/VpnPage.tsx` | DataTable | 2 | · | 2 | 2 | 1 | 341 | S1 S2 S3 S5 T1 | ☐ |
| **wallet** | `/admin/wallet` | `admin/wallet/pages/WalletPage.tsx` | own | 2 | · | · | 3 | 12 | 356 | S1 S2 S3 T4 | ☐ |
| **whatsapp** | `/admin/whatsapp/campaigns` | `admin/whatsapp/pages/WhatsAppCampaignsPage.tsx` | DataTable | 13 | · | 1 | 1 | · | 362 | S1 S2 S5 T1 | ☐ |
|  | `/admin/whatsapp/inbox` | `admin/whatsapp/pages/WhatsAppInboxPage.tsx` | — | 8 | · | 1 | · | · | 397 | S1 S5 | ☐ |
|  | `/admin/whatsapp/message-log` | `admin/whatsapp/pages/WhatsAppMessageLogPage.tsx` | DataTable | 13 | · | 1 | · | · | 316 | S1 S5 T1 | ☐ |
|  | `/admin/whatsapp/opt-ins` | `admin/whatsapp/pages/WhatsAppOptInsPage.tsx` | DataTable | 11 | · | 2 | · | · | 308 | S1 S5 T1 | ☐ |
|  | `/admin/whatsapp/settings` | `admin/whatsapp/pages/WhatsAppSettingsPage.tsx` | — | 10 | · | 3 | · | · | 312 | S1 S5 | ☐ |
|  | `/admin/whatsapp/templates` | `admin/whatsapp/pages/WhatsAppTemplatesPage.tsx` | DataTable | 14 | · | 3 | · | · | 499 | S1 S5 T1 | ☐ |

## Platform (super-admin) (24)

8 with a table · 21 with sub-12px text · 8 with Link>Button · 0 with unlabelled icon buttons

| Module | Screen | Page file | Table | <12px | Link>Btn | Icon | Colour | Num | Lines | Fixes | Done |
|---|---|---|---|---|---|---|---|---|---|---|---|
| **admins** | `/platform/admins` | `platform/admins/pages/AdminsListPage.tsx` | DataTable | 5 | 2 | · | 1 | · | 342 | S1 S2 S4 T1 P1 | ☐ |
|  | `/platform/admins/[id]/billing` | `platform/admins/pages/AdminBillingModePage.tsx` | — | · | · | · | · | 3 | 181 | S3 | ☐ |
|  | `/platform/admins/packages` | `platform/admins/pages/AdminPackagesPage.tsx` | — | 1 | 1 | · | · | 1 | 431 | S1 S3 S4 | ☐ |
| **contacts** | `/platform/contacts` | `platform/contacts/pages/ContactsPage.tsx` | — | 3 | · | · | · | · | 214 | S1 | ☐ |
| **dashboard** | `/platform/dashboard` | `platform/dashboard/pages/PlatformDashboardPage.tsx` | — | 2 | 3 | · | 7 | 3 | 409 | S1 S2 S3 S4 | ☐ |
| **engines** | `/platform/engines` | `admin/engines/pages/EnginesIndexPage.tsx` | own | 1 | · | · | · | · | 276 | S1 T4 P1 | ☐ |
|  | `/platform/engines/[slug]` | `admin/engines/pages/EngineHubPage.tsx` | DataTable | 1 | · | · | · | · | 542 | S1 T1 P1 | ☐ |
| **file-manager** | `/platform/file-manager` | `platform/file-manager/pages/FileManagerPage.tsx` | — | 2 | · | · | · | · | 138 | S1 | ☐ |
| **hierarchy** | `/platform/hierarchy` | `platform/hierarchy/pages/PlatformHierarchyPage.tsx` | — | · | · | · | · | · | 16 | — | ☐ |
| **maintenance** | `/platform/maintenance` | `platform/settings/pages/MaintenancePage.tsx` | — | 1 | · | · | · | 1 | 149 | S1 S3 | ☐ |
| **metering** | `/platform/metering` | `platform/metering/pages/PlatformMeteringPage.tsx` | DataTable | 1 | · | · | · | 9 | 146 | S1 S3 T1 P1 | ☐ |
| **plugins** | `/platform/plugins` | `platform/plugins/pages/PluginsPage.tsx` | — | 3 | · | · | · | 2 | 418 | S1 S3 | ☐ |
| **redis-logs** | `/platform/redis-logs` | `platform/settings/pages/RedisLogsPage.tsx` | — | 3 | · | · | 2 | 1 | 128 | S1 S2 S3 | ☐ |
| **revenue** | `/platform/revenue` | `platform/revenue/pages/RevenuePage.tsx` | DataTable | 1 | · | · | · | 7 | 247 | S1 S3 T1 P1 | ☐ |
| **settings** | `/platform/settings/software` | `platform/settings/pages/SoftwareSettingsPage.tsx` | — | 2 | 1 | · | · | 2 | 244 | S1 S3 S4 | ☐ |
| **showcase** | `/platform/showcase` | `platform/showcase/pages/ShowcasePage.tsx` | — | 3 | · | · | · | · | 317 | S1 | ☐ |
| **sla** | `/platform/sla` | `platform/sla/pages/PlatformSlaPage.tsx` | DataTable | 1 | · | · | 3 | · | 150 | S1 S2 T1 P1 | ☐ |
| **support-tickets** | `/platform/support-tickets` | `platform/support/pages/SupportTicketsPage.tsx` | — | 4 | · | · | 1 | · | 321 | S1 S2 P2 | ☐ |
| **tenants** | `/platform/tenants` | `platform/tenants/pages/TenantsListPage.tsx` | DataTable | 2 | 4 | · | 2 | 1 | 336 | S1 S2 S3 S4 T1 P1 | ☐ |
|  | `/platform/tenants/[id]` | `platform/tenants/pages/TenantDetailPage.tsx` | — | · | 4 | · | · | 3 | 208 | S3 S4 | ☐ |
|  | `/platform/tenants/[id]/edit` | `platform/tenants/pages/TenantFormPage.tsx` | — | 1 | 2 | · | · | · | 365 | S1 S4 | ☐ |
|  | `/platform/tenants/[id]/health` | `platform/tenants/pages/TenantHealthPage.tsx` | — | 1 | · | · | · | · | 97 | S1 | ☐ |
|  | `/platform/tenants/new` | `platform/tenants/pages/TenantFormPage.tsx` | — | 1 | 2 | · | · | · | 365 | S1 S4 | ☐ |
| **user-access** | `/platform/user-access` | `platform/user-access/pages/UserAccessPage.tsx` | DataTable | 1 | · | · | · | 1 | 163 | S1 S3 T1 P1 | ☐ |

## Marketing, auth and public screens (16)

0 with a table · 2 with sub-12px text · 4 with Link>Button · 1 with unlabelled icon buttons

| Screen | Page file | Table | <12px | Link>Btn | Icon | Colour | Num | Lines | Fixes | Done |
|---|---|---|---|---|---|---|---|---|---|---|
| `/` | `marketing/landing/pages/LandingPage.tsx` | — | · | · | · | · | · | 82 | — | ☐ |
| `/403` | `shared/permission/components/ForbiddenPage.tsx` | — | · | · | · | · | · | 38 | — | ☐ |
| `/captive` | `marketing/captive/pages/CaptivePage.tsx` | — | · | · | · | 1 | · | 217 | S2 | ☐ |
| `/contact` | `marketing/contact/pages/ContactPage.tsx` | — | · | · | · | · | · | 16 | — | ☐ |
| `/forgot-password` | `auth/forgot-password/pages/ForgotPasswordPage.tsx` | — | · | · | · | · | · | 148 | — | ☐ |
| `/help` | `marketing/help/pages/HelpPage.tsx` | — | · | · | · | · | · | 112 | — | ☐ |
| `/login` | `auth/login/pages/LoginPage.tsx` | — | · | · | 1 | · | · | 25 | S5 | ☐ |
| `/plugins` | `marketing/plugins/pages/PluginsPage.tsx` | — | 1 | 2 | · | · | · | 219 | S1 S4 | ☐ |
| `/plugins/[slug]` | `marketing/plugins/pages/PluginDetailPage.tsx` | — | · | · | · | 1 | · | 226 | S2 | ☐ |
| `/pricing` | `marketing/pricing/pages/PricingPage.tsx` | — | 1 | 3 | · | · | 4 | 295 | S1 S3 S4 | ☐ |
| `/privacy` | `marketing/legal/pages/LegalPage.tsx` | — | · | · | · | · | · | 68 | — | ☐ |
| `/register` | `marketing/register/pages/RegisterPage.tsx` | — | · | 1 | · | 2 | · | 457 | S2 S4 | ☐ |
| `/register/referral` | `marketing/register/pages/RegisterPage.tsx` | — | · | 1 | · | 2 | · | 457 | S2 S4 | ☐ |
| `/reset-password` | `auth/reset-password/pages/ResetPasswordPage.tsx` | — | · | · | · | · | · | 146 | — | ☐ |
| `/status` | `marketing/status/pages/StatusPage.tsx` | — | · | · | · | 3 | 1 | 158 | S2 S3 | ☐ |
| `/terms` | `marketing/legal/pages/LegalPage.tsx` | — | · | · | · | · | · | 68 | — | ☐ |
