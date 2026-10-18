# 02. Reseller / Admin Portal API

> All reseller and admin operations: Dashboard, Customers, Subscriptions, Billing, Invoices, HR, Attendance, Salaries, Routers, IP Pools, Accounting, SMS, Voice SMS, and WhatsApp.

**Total Endpoints:** 270

## Endpoint List

| Method | Route | Controller & Action | Filters |
|---|---|---|---|
| `GET` | `/api/v1/reseller/dashboard/([0-9]+)` | `\…\Reseller\Dashboard\Controllers\DashboardController::dashboard/$1` | `zapijwt zapirole cors maintenance tenantresolve trafficstart` |
| `GET` | `/api/v1/reseller/areas/([0-9]+?)` | `\…\Reseller\Area\Controllers\ServiceAreaController::index/$1` | `<unknown>` |
| `GET` | `/api/v1/reseller/areas/([0-9]+)/sub/([0-9]+)` | `\…\Reseller\Area\Controllers\ServiceAreaController::subindex/$1/$2` | `zapijwt zapirole zapipermission cors maintenance tenantresolve trafficstart` |
| `GET` | `/api/v1/reseller/areas/edit/([0-9]+)` | `\…\Reseller\Area\Controllers\ServiceAreaController::edit/$1` | `zapijwt zapirole zapipermission cors maintenance tenantresolve trafficstart` |
| `GET` | `/api/v1/reseller/subareas/edit/([0-9]+)` | `\…\Reseller\Area\Controllers\ServiceAreaController::editsub/$1` | `zapijwt zapirole zapipermission cors maintenance tenantresolve trafficstart` |
| `GET` | `/api/v1/reseller/packages/([0-9]+?)` | `\…\Reseller\Package\Controllers\PackageController::fetch/$1` | `<unknown>` |
| `GET` | `/api/v1/reseller/customers/([0-9]+)/corporate-queues/([0-9]+)` | `\…\Reseller\Customer\Controllers\CustomerController::listCorporateQueues/$1/$2` | `zapijwt zapirole zapipermission cors maintenance tenantresolve trafficstart` |
| `GET` | `/api/v1/reseller/customers/([0-9]+)/export-excel` | `\…\Reseller\Customer\Controllers\CustomerController::exportExcel/$1` | `zapijwt zapirole zapipermission cors maintenance tenantresolve trafficstart` |
| `GET` | `/api/v1/reseller/customers/([0-9]+)/index` | `\…\Reseller\Customer\Controllers\CustomerController::index/$1` | `zapijwt zapirole zapipermission cors maintenance tenantresolve trafficstart` |
| `GET` | `/api/v1/reseller/customers/([0-9]+)/([0-9]+)/audit-logs` | `\…\Reseller\Customer\Controllers\CustomerController::auditLogs/$1/$2` | `zapijwt zapirole zapipermission cors maintenance tenantresolve trafficstart` |
| `GET` | `/api/v1/reseller/customers/([0-9]+)/([0-9]+)/mac-status` | `\…\Reseller\Customer\Controllers\CustomerController::macStatus/$1/$2` | `zapijwt zapirole zapipermission cors maintenance tenantresolve trafficstart` |
| `GET` | `/api/v1/reseller/customers/([0-9]+?)` | `\…\Reseller\Customer\Controllers\CustomerController::fetch/$1` | `<unknown>` |
| `GET` | `/api/v1/reseller/customers/([0-9]+?)/([0-9]+?)` | `\…\Reseller\Customer\Controllers\CustomerController::details/$1/$2` | `<unknown>` |
| `GET` | `/api/v1/reseller/customer-payments/([0-9]+)` | `\…\Reseller\CustomerPayment\Controllers\CustomerPaymentController::fetch/$1` | `zapijwt zapirole zapipermission cors maintenance tenantresolve trafficstart` |
| `GET` | `/api/v1/reseller/customer-payments/([0-9]+)/user/([0-9]+)` | `\…\Reseller\CustomerPayment\Controllers\CustomerPaymentController::userPayments/$1/$2` | `zapijwt zapirole zapipermission cors maintenance tenantresolve trafficstart` |
| `GET` | `/api/v1/reseller/employees/([0-9]+)` | `\…\Reseller\Employee\Controllers\EmployeeController::fetch/$1` | `zapijwt zapirole zapipermission cors maintenance tenantresolve trafficstart` |
| `GET` | `/api/v1/reseller/employees/([0-9]+)/([0-9]+)` | `\…\Reseller\Employee\Controllers\EmployeeController::details/$1/$2` | `zapijwt zapirole zapipermission cors maintenance tenantresolve trafficstart` |
| `GET` | `/api/v1/reseller/employees/([0-9]+)/attendance` | `\…\Reseller\EmployeeAttendance\Controllers\EmployeeAttendanceController::fetch/$1` | `zapijwt zapirole zapipermission cors maintenance tenantresolve trafficstart` |
| `GET` | `/api/v1/reseller/employees/([0-9]+)/advance-salary` | `\…\Reseller\AdvanceSalary\Controllers\AdvanceSalaryController::fetch/$1` | `zapijwt zapirole zapipermission cors maintenance tenantresolve trafficstart` |
| `GET` | `/api/v1/reseller/employee-payments/([0-9]+)` | `\…\Reseller\EmployeePayment\Controllers\EmployeePaymentController::fetch/$1` | `zapijwt zapirole zapipermission cors maintenance tenantresolve trafficstart` |
| `GET` | `/api/v1/reseller/employee-payments/([0-9]+)/salary-summary/([0-9]+)/([^/]+)` | `\…\Reseller\EmployeePayment\Controllers\EmployeePaymentController::salarySummary/$1/$2/$3` | `zapijwt zapirole zapipermission cors maintenance tenantresolve trafficstart` |
| `GET` | `/api/v1/reseller/accounting/([0-9]+)/balance-sheet` | `\…\Reseller\BalanceSheet\Controllers\BalanceSheetController::balanceSheet/$1` | `zapijwt zapirole zapipermission cors maintenance tenantresolve trafficstart` |
| `GET` | `/api/v1/reseller/accounting/([0-9]+)/chart-of-accounts` | `\…\Reseller\BalanceSheet\Controllers\BalanceSheetController::chartOfAccounts/$1` | `zapijwt zapirole zapipermission cors maintenance tenantresolve trafficstart` |
| `GET` | `/api/v1/reseller/accounting/([0-9]+)/journal-entries` | `\…\Reseller\BalanceSheet\Controllers\BalanceSheetController::journalEntries/$1` | `zapijwt zapirole zapipermission cors maintenance tenantresolve trafficstart` |
| `GET` | `/api/v1/reseller/support-tickets/([0-9]+)` | `\…\Reseller\SupportTicket\Controllers\SupportTicketController::fetch/$1` | `zapijwt zapirole zapipermission cors maintenance tenantresolve trafficstart` |
| `GET` | `/api/v1/reseller/support-tickets/([0-9]+)/([0-9]+)` | `\…\Reseller\SupportTicket\Controllers\SupportTicketController::details/$1/$2` | `zapijwt zapirole zapipermission cors maintenance tenantresolve trafficstart` |
| `GET` | `/api/v1/reseller/transactions/([0-9]+)` | `\…\Reseller\Transaction\Controllers\TransactionController::fetch/$1` | `zapijwt zapirole zapipermission cors maintenance tenantresolve trafficstart` |
| `GET` | `/api/v1/reseller/funding/([0-9]+)` | `\…\Reseller\Funding\Controllers\FundingController::fetch/$1` | `zapijwt zapirole zapipermission cors maintenance tenantresolve trafficstart` |
| `GET` | `/api/v1/reseller/subscription/([0-9]+)/([0-9]+)` | `\…\Reseller\Subscription\Controllers\SubscriptionController::info/$1/$2` | `zapijwt zapirole zapipermission cors maintenance tenantresolve trafficstart` |
| `GET` | `/api/v1/reseller/sms/([0-9]+)/recipients` | `\…\Reseller\Sms\Controllers\SmsController::recipients/$1` | `zapijwt zapirole zapipermission cors maintenance tenantresolve trafficstart` |
| `GET` | `/api/v1/reseller/sms/([0-9]+)` | `\…\Reseller\Sms\Controllers\SmsController::fetch/$1` | `zapijwt zapirole zapipermission cors maintenance tenantresolve trafficstart` |
| `GET` | `/api/v1/reseller/voice-sms/([0-9]+)/recipients` | `\…\Reseller\VoiceSms\Controllers\VoiceSmsController::recipients/$1` | `zapijwt zapirole zapipermission cors maintenance tenantresolve trafficstart` |
| `GET` | `/api/v1/reseller/voice-sms/([0-9]+)/templates` | `\…\Reseller\VoiceSms\Controllers\VoiceSmsController::templates/$1` | `zapijwt zapirole zapipermission cors maintenance tenantresolve trafficstart` |
| `GET` | `/api/v1/reseller/voice-sms/([0-9]+)/settings` | `\…\Reseller\VoiceSms\Controllers\VoiceSmsController::settings/$1` | `zapijwt zapirole zapipermission cors maintenance tenantresolve trafficstart` |
| `GET` | `/api/v1/reseller/voice-sms/([0-9]+)/gateway-voices` | `\…\Reseller\VoiceSms\Controllers\VoiceSmsController::gatewayVoices/$1` | `zapijwt zapirole zapipermission cors maintenance tenantresolve trafficstart` |
| `GET` | `/api/v1/reseller/payments/([0-9]+)` | `\…\Reseller\Payment\Controllers\PaymentController::fetch/$1` | `zapijwt zapirole zapipermission cors maintenance tenantresolve trafficstart` |
| `GET` | `/api/v1/reseller/make-reseller-payment/([0-9]+)` | `\…\Customer\Payment\Controllers\PaymentController::makeResellerPayment/$1` | `zapijwt zapirole cors maintenance tenantresolve trafficstart` |
| `GET` | `/api/v1/reseller/profile/([0-9]+)` | `\…\Reseller\Profile\Controllers\ProfileController::fetch/$1` | `zapijwt zapirole zapipermission cors maintenance tenantresolve trafficstart` |
| `GET` | `/api/v1/reseller/permission` | `\…\Customer\Permission\Controllers\PermissionController::index` | `zapijwt zapirole cors maintenance tenantresolve trafficstart` |
| `GET` | `/api/v1/reseller/routers/([0-9]+)` | `\…\Reseller\Router\Controllers\RouterController::list/$1` | `zapijwt zapirole zapipermission cors maintenance tenantresolve trafficstart` |
| `GET` | `/api/v1/reseller/router-users/([0-9]+)/([0-9]+)` | `\…\Reseller\Router\Controllers\RouterController::fetch/$1/$2` | `zapijwt zapirole zapipermission cors maintenance tenantresolve trafficstart` |
| `GET` | `/api/v1/reseller/ip-pools/([0-9]+)` | `\…\Reseller\IpPool\Controllers\IpPoolController::list/$1` | `zapijwt zapirole zapipermission cors maintenance tenantresolve trafficstart` |
| `GET` | `/api/v1/reseller/ip-pools/([0-9]+)/([0-9]+)/available` | `\…\Reseller\IpPool\Controllers\IpPoolController::availableIps/$1/$2` | `zapijwt zapirole zapipermission cors maintenance tenantresolve trafficstart` |
| `GET` | `/api/v1/reseller/referrals/([0-9]+)` | `\…\Reseller\Referral\Controllers\ReferralController::list/$1` | `zapijwt zapirole zapipermission cors maintenance tenantresolve trafficstart` |
| `GET` | `/api/v1/reseller/referrals/([0-9]+)/([0-9]+)` | `\…\Reseller\Referral\Controllers\ReferralController::details/$1/$2` | `zapijwt zapirole zapipermission cors maintenance tenantresolve trafficstart` |
| `GET` | `/api/v1/reseller/rewards/global-config` | `\…\Reseller\Reward\Controllers\RewardConfigController::getGlobal` | `zapijwt zapirole cors maintenance tenantresolve trafficstart` |
| `GET` | `/api/v1/reseller/rewards/([0-9]+)/report` | `\…\Reseller\Reward\Controllers\RewardController::report/$1` | `zapijwt zapirole cors maintenance tenantresolve trafficstart` |
| `GET` | `/api/v1/reseller/rewards/([0-9]+)/wallets` | `\…\Reseller\Reward\Controllers\RewardController::wallets/$1` | `zapijwt zapirole cors maintenance tenantresolve trafficstart` |
| `GET` | `/api/v1/reseller/rewards/([0-9]+)/config` | `\…\Reseller\Reward\Controllers\RewardConfigController::get/$1` | `zapijwt zapirole cors maintenance tenantresolve trafficstart` |
| `GET` | `/api/v1/customer/make-reseller-payment/([0-9]+)` | `\…\Customer\Payment\Controllers\PaymentController::makeResellerPayment/$1` | `zapijwt zapirole cors maintenance tenantresolve trafficstart` |
| `GET` | `/api/v1/customer/json/make-reseller-payment/([0-9]+)` | `\…\Customer\Payment\Controllers\PaymentController::makeResellerPaymentJson/$1` | `zapijwt zapirole cors maintenance tenantresolve trafficstart` |
| `GET` | `/api/v1/reseller/olt` | `\…\Reseller\Olt\Controllers\OltApiController::index` | `zapijwt zapirole cors maintenance tenantresolve trafficstart` |
| `GET` | `/api/v1/reseller/olt/([^/]+)` | `\…\Reseller\Olt\Controllers\OltApiController::show/$1` | `zapijwt zapirole cors maintenance tenantresolve trafficstart` |
| `GET` | `/api/v1/reseller/olt/([^/]+)/onus` | `\…\Reseller\Olt\Controllers\OltApiController::onus/$1` | `zapijwt zapirole cors maintenance tenantresolve trafficstart` |
| `GET` | `/api/v1/reseller/hotspot/plans` | `\…\Reseller\Hotspot\Controllers\HotspotApiController::plans` | `zapijwt zapirole cors maintenance tenantresolve trafficstart` |
| `GET` | `/api/v1/reseller/hotspot/vouchers` | `\…\Reseller\Hotspot\Controllers\HotspotApiController::vouchers` | `zapijwt zapirole cors maintenance tenantresolve trafficstart` |
| `GET` | `/api/v1/reseller/hotspot/active-users` | `\…\Reseller\Hotspot\Controllers\HotspotApiController::activeUsers` | `zapijwt zapirole cors maintenance tenantresolve trafficstart` |
| `GET` | `/api/v1/reseller/inventory/items` | `\…\Reseller\Inventory\Controllers\InventoryApiController::items` | `zapijwt zapirole cors maintenance tenantresolve trafficstart` |
| `GET` | `/api/v1/reseller/inventory/categories` | `\…\Reseller\Inventory\Controllers\InventoryApiController::categories` | `zapijwt zapirole cors maintenance tenantresolve trafficstart` |
| `GET` | `/api/v1/reseller/inventory/suppliers` | `\…\Reseller\Inventory\Controllers\InventoryApiController::suppliers` | `zapijwt zapirole cors maintenance tenantresolve trafficstart` |
| `GET` | `/api/v1/reseller/reports/revenue` | `\…\Reseller\Reports\Controllers\ReportApiController::revenue` | `zapijwt zapirole cors maintenance tenantresolve trafficstart` |
| `GET` | `/api/v1/reseller/reports/customers` | `\…\Reseller\Reports\Controllers\ReportApiController::customers` | `zapijwt zapirole cors maintenance tenantresolve trafficstart` |
| `GET` | `/api/v1/reseller/reports/bandwidth` | `\…\Reseller\Reports\Controllers\ReportApiController::bandwidth` | `zapijwt zapirole cors maintenance tenantresolve trafficstart` |
| `GET` | `/api/v1/reseller/reports/export` | `\…\Reseller\Reports\Controllers\ReportApiController::export` | `zapijwt zapirole cors maintenance tenantresolve trafficstart` |
| `GET` | `/api/v1/reseller/whatsapp/sessions` | `\…\Reseller\WhatsApp\Controllers\WhatsAppApiController::sessions` | `zapijwt zapirole cors maintenance tenantresolve trafficstart` |
| `GET` | `/api/v1/reseller/whatsapp/templates` | `\…\Reseller\WhatsApp\Controllers\WhatsAppApiController::templates` | `zapijwt zapirole cors maintenance tenantresolve trafficstart` |
| `GET` | `/api/customer/make-reseller-payment/([0-9]+)` | `\…\Customer\Payment\Controllers\PaymentController::makeResellerPayment/$1` | `zapijwt zapirole cors maintenance tenantresolve trafficstart` |
| `GET` | `/api/customer/json/make-reseller-payment/([0-9]+)` | `\…\Customer\Payment\Controllers\PaymentController::makeResellerPaymentJson/$1` | `zapijwt zapirole cors maintenance tenantresolve trafficstart` |
| `GET` | `/api/reseller/users-load-traffic/([0-9]+)` | `\…\Customer\User\Controllers\RouterTrafficController::UsersloadTraffic_api/$1` | `zapijwt zapirole zapipermission cors maintenance tenantresolve trafficstart` |
| `GET` | `/api/reseller/dashboard/([0-9]+)` | `\…\Reseller\Dashboard\Controllers\DashboardController::dashboard/$1` | `zapijwt zapirole cors maintenance tenantresolve trafficstart` |
| `GET` | `/api/reseller/areas/([0-9]+?)` | `\…\Reseller\Area\Controllers\ServiceAreaController::index/$1` | `<unknown>` |
| `GET` | `/api/reseller/areas/([0-9]+)/sub/([0-9]+)` | `\…\Reseller\Area\Controllers\ServiceAreaController::subindex/$1/$2` | `zapijwt zapirole zapipermission cors maintenance tenantresolve trafficstart` |
| `GET` | `/api/reseller/areas/edit/([0-9]+)` | `\…\Reseller\Area\Controllers\ServiceAreaController::edit/$1` | `zapijwt zapirole zapipermission cors maintenance tenantresolve trafficstart` |
| `GET` | `/api/reseller/subareas/edit/([0-9]+)` | `\…\Reseller\Area\Controllers\ServiceAreaController::editsub/$1` | `zapijwt zapirole zapipermission cors maintenance tenantresolve trafficstart` |
| `GET` | `/api/reseller/packages/([0-9]+?)` | `\…\Reseller\Package\Controllers\PackageController::fetch/$1` | `<unknown>` |
| `GET` | `/api/reseller/customers/([0-9]+)/corporate-queues/([0-9]+)` | `\…\Reseller\Customer\Controllers\CustomerController::listCorporateQueues/$1/$2` | `zapijwt zapirole zapipermission cors maintenance tenantresolve trafficstart` |
| `GET` | `/api/reseller/customers/([0-9]+)/export-excel` | `\…\Reseller\Customer\Controllers\CustomerController::exportExcel/$1` | `zapijwt zapirole zapipermission cors maintenance tenantresolve trafficstart` |
| `GET` | `/api/reseller/customers/([0-9]+)/index` | `\…\Reseller\Customer\Controllers\CustomerController::index/$1` | `zapijwt zapirole zapipermission cors maintenance tenantresolve trafficstart` |
| `GET` | `/api/reseller/customers/([0-9]+)/([0-9]+)/audit-logs` | `\…\Reseller\Customer\Controllers\CustomerController::auditLogs/$1/$2` | `zapijwt zapirole zapipermission cors maintenance tenantresolve trafficstart` |
| `GET` | `/api/reseller/customers/([0-9]+)/([0-9]+)/mac-status` | `\…\Reseller\Customer\Controllers\CustomerController::macStatus/$1/$2` | `zapijwt zapirole zapipermission cors maintenance tenantresolve trafficstart` |
| `GET` | `/api/reseller/customers/([0-9]+?)` | `\…\Reseller\Customer\Controllers\CustomerController::fetch/$1` | `<unknown>` |
| `GET` | `/api/reseller/customers/([0-9]+?)/([0-9]+?)` | `\…\Reseller\Customer\Controllers\CustomerController::details/$1/$2` | `<unknown>` |
| `GET` | `/api/reseller/customer-payments/([0-9]+)` | `\…\Reseller\CustomerPayment\Controllers\CustomerPaymentController::fetch/$1` | `zapijwt zapirole zapipermission cors maintenance tenantresolve trafficstart` |
| `GET` | `/api/reseller/customer-payments/([0-9]+)/user/([0-9]+)` | `\…\Reseller\CustomerPayment\Controllers\CustomerPaymentController::userPayments/$1/$2` | `zapijwt zapirole zapipermission cors maintenance tenantresolve trafficstart` |
| `GET` | `/api/reseller/employees/([0-9]+)` | `\…\Reseller\Employee\Controllers\EmployeeController::fetch/$1` | `zapijwt zapirole zapipermission cors maintenance tenantresolve trafficstart` |
| `GET` | `/api/reseller/employees/([0-9]+)/([0-9]+)` | `\…\Reseller\Employee\Controllers\EmployeeController::details/$1/$2` | `zapijwt zapirole zapipermission cors maintenance tenantresolve trafficstart` |
| `GET` | `/api/reseller/employees/([0-9]+)/attendance` | `\…\Reseller\EmployeeAttendance\Controllers\EmployeeAttendanceController::fetch/$1` | `zapijwt zapirole zapipermission cors maintenance tenantresolve trafficstart` |
| `GET` | `/api/reseller/employees/([0-9]+)/advance-salary` | `\…\Reseller\AdvanceSalary\Controllers\AdvanceSalaryController::fetch/$1` | `zapijwt zapirole zapipermission cors maintenance tenantresolve trafficstart` |
| `GET` | `/api/reseller/employee-payments/([0-9]+)` | `\…\Reseller\EmployeePayment\Controllers\EmployeePaymentController::fetch/$1` | `zapijwt zapirole zapipermission cors maintenance tenantresolve trafficstart` |
| `GET` | `/api/reseller/employee-payments/([0-9]+)/salary-summary/([0-9]+)/([^/]+)` | `\…\Reseller\EmployeePayment\Controllers\EmployeePaymentController::salarySummary/$1/$2/$3` | `zapijwt zapirole zapipermission cors maintenance tenantresolve trafficstart` |
| `GET` | `/api/reseller/accounting/([0-9]+)/balance-sheet` | `\…\Reseller\BalanceSheet\Controllers\BalanceSheetController::balanceSheet/$1` | `zapijwt zapirole zapipermission cors maintenance tenantresolve trafficstart` |
| `GET` | `/api/reseller/accounting/([0-9]+)/chart-of-accounts` | `\…\Reseller\BalanceSheet\Controllers\BalanceSheetController::chartOfAccounts/$1` | `zapijwt zapirole zapipermission cors maintenance tenantresolve trafficstart` |
| `GET` | `/api/reseller/accounting/([0-9]+)/journal-entries` | `\…\Reseller\BalanceSheet\Controllers\BalanceSheetController::journalEntries/$1` | `zapijwt zapirole zapipermission cors maintenance tenantresolve trafficstart` |
| `GET` | `/api/reseller/support-tickets/([0-9]+)` | `\…\Reseller\SupportTicket\Controllers\SupportTicketController::fetch/$1` | `zapijwt zapirole zapipermission cors maintenance tenantresolve trafficstart` |
| `GET` | `/api/reseller/support-tickets/([0-9]+)/([0-9]+)` | `\…\Reseller\SupportTicket\Controllers\SupportTicketController::details/$1/$2` | `zapijwt zapirole zapipermission cors maintenance tenantresolve trafficstart` |
| `GET` | `/api/reseller/transactions/([0-9]+)` | `\…\Reseller\Transaction\Controllers\TransactionController::fetch/$1` | `zapijwt zapirole zapipermission cors maintenance tenantresolve trafficstart` |
| `GET` | `/api/reseller/funding/([0-9]+)` | `\…\Reseller\Funding\Controllers\FundingController::fetch/$1` | `zapijwt zapirole zapipermission cors maintenance tenantresolve trafficstart` |
| `GET` | `/api/reseller/subscription/([0-9]+)/([0-9]+)` | `\…\Reseller\Subscription\Controllers\SubscriptionController::info/$1/$2` | `zapijwt zapirole zapipermission cors maintenance tenantresolve trafficstart` |
| `GET` | `/api/reseller/sms/([0-9]+)/recipients` | `\…\Reseller\Sms\Controllers\SmsController::recipients/$1` | `zapijwt zapirole zapipermission cors maintenance tenantresolve trafficstart` |
| `GET` | `/api/reseller/sms/([0-9]+)` | `\…\Reseller\Sms\Controllers\SmsController::fetch/$1` | `zapijwt zapirole zapipermission cors maintenance tenantresolve trafficstart` |
| `GET` | `/api/reseller/voice-sms/([0-9]+)/recipients` | `\…\Reseller\VoiceSms\Controllers\VoiceSmsController::recipients/$1` | `zapijwt zapirole zapipermission cors maintenance tenantresolve trafficstart` |
| `GET` | `/api/reseller/voice-sms/([0-9]+)/templates` | `\…\Reseller\VoiceSms\Controllers\VoiceSmsController::templates/$1` | `zapijwt zapirole zapipermission cors maintenance tenantresolve trafficstart` |
| `GET` | `/api/reseller/voice-sms/([0-9]+)/settings` | `\…\Reseller\VoiceSms\Controllers\VoiceSmsController::settings/$1` | `zapijwt zapirole zapipermission cors maintenance tenantresolve trafficstart` |
| `GET` | `/api/reseller/voice-sms/([0-9]+)/gateway-voices` | `\…\Reseller\VoiceSms\Controllers\VoiceSmsController::gatewayVoices/$1` | `zapijwt zapirole zapipermission cors maintenance tenantresolve trafficstart` |
| `GET` | `/api/reseller/payments/([0-9]+)` | `\…\Reseller\Payment\Controllers\PaymentController::fetch/$1` | `zapijwt zapirole zapipermission cors maintenance tenantresolve trafficstart` |
| `GET` | `/api/reseller/make-reseller-payment/([0-9]+)` | `\…\Customer\Payment\Controllers\PaymentController::makeResellerPayment/$1` | `zapijwt zapirole cors maintenance tenantresolve trafficstart` |
| `GET` | `/api/reseller/profile/([0-9]+)` | `\…\Reseller\Profile\Controllers\ProfileController::fetch/$1` | `zapijwt zapirole zapipermission cors maintenance tenantresolve trafficstart` |
| `GET` | `/api/reseller/permission` | `\…\Customer\Permission\Controllers\PermissionController::index` | `zapijwt zapirole cors maintenance tenantresolve trafficstart` |
| `GET` | `/api/reseller/routers/([0-9]+)` | `\…\Reseller\Router\Controllers\RouterController::list/$1` | `zapijwt zapirole zapipermission cors maintenance tenantresolve trafficstart` |
| `GET` | `/api/reseller/router-users/([0-9]+)/([0-9]+)` | `\…\Reseller\Router\Controllers\RouterController::fetch/$1/$2` | `zapijwt zapirole zapipermission cors maintenance tenantresolve trafficstart` |
| `GET` | `/api/reseller/ip-pools/([0-9]+)` | `\…\Reseller\IpPool\Controllers\IpPoolController::list/$1` | `zapijwt zapirole zapipermission cors maintenance tenantresolve trafficstart` |
| `GET` | `/api/reseller/ip-pools/([0-9]+)/([0-9]+)/available` | `\…\Reseller\IpPool\Controllers\IpPoolController::availableIps/$1/$2` | `zapijwt zapirole zapipermission cors maintenance tenantresolve trafficstart` |
| `GET` | `/api/reseller/referrals/([0-9]+)` | `\…\Reseller\Referral\Controllers\ReferralController::list/$1` | `zapijwt zapirole zapipermission cors maintenance tenantresolve trafficstart` |
| `GET` | `/api/reseller/referrals/([0-9]+)/([0-9]+)` | `\…\Reseller\Referral\Controllers\ReferralController::details/$1/$2` | `zapijwt zapirole zapipermission cors maintenance tenantresolve trafficstart` |
| `GET` | `/api/reseller/rewards/global-config` | `\…\Reseller\Reward\Controllers\RewardConfigController::getGlobal` | `zapijwt zapirole cors maintenance tenantresolve trafficstart` |
| `GET` | `/api/reseller/rewards/([0-9]+)/report` | `\…\Reseller\Reward\Controllers\RewardController::report/$1` | `zapijwt zapirole cors maintenance tenantresolve trafficstart` |
| `GET` | `/api/reseller/rewards/([0-9]+)/wallets` | `\…\Reseller\Reward\Controllers\RewardController::wallets/$1` | `zapijwt zapirole cors maintenance tenantresolve trafficstart` |
| `GET` | `/api/reseller/rewards/([0-9]+)/config` | `\…\Reseller\Reward\Controllers\RewardConfigController::get/$1` | `zapijwt zapirole cors maintenance tenantresolve trafficstart` |
| `GET` | `/api/internal/ai/reseller-overview` | `\…\Ai\Controllers\AiInternalController::resellerOverview` | `cors maintenance tenantresolve trafficstart` |
| `GET` | `/api/internal/ai/reseller-customers` | `\…\Ai\Controllers\AiInternalController::resellerCustomers` | `cors maintenance tenantresolve trafficstart` |
| `GET` | `/api/internal/ai/reseller-performance` | `\…\Ai\Controllers\AiInternalController::resellerPerformance` | `cors maintenance tenantresolve trafficstart` |
| `GET` | `/api/internal/ai/admin-reseller-performance` | `\…\Ai\Controllers\AiInternalController::adminResellerPerformance` | `cors maintenance tenantresolve trafficstart` |
| `GET` | `/zapi/internal/ai/reseller-overview` | `\…\Ai\Controllers\AiInternalController::resellerOverview` | `cors maintenance tenantresolve trafficstart` |
| `GET` | `/zapi/internal/ai/reseller-customers` | `\…\Ai\Controllers\AiInternalController::resellerCustomers` | `cors maintenance tenantresolve trafficstart` |
| `GET` | `/zapi/internal/ai/reseller-performance` | `\…\Ai\Controllers\AiInternalController::resellerPerformance` | `cors maintenance tenantresolve trafficstart` |
| `GET` | `/zapi/internal/ai/admin-reseller-performance` | `\…\Ai\Controllers\AiInternalController::adminResellerPerformance` | `cors maintenance tenantresolve trafficstart` |
| `POST` | `/api/v1/reseller/areas/([0-9]+)` | `\…\Reseller\Area\Controllers\ServiceAreaController::create/$1` | `zapijwt zapirole zapipermission cors maintenance tenantresolve trafficstart` |
| `POST` | `/api/v1/reseller/subareas` | `\…\Reseller\Area\Controllers\ServiceAreaController::subcreate` | `zapijwt zapirole zapipermission cors maintenance tenantresolve trafficstart` |
| `POST` | `/api/v1/reseller/customers/create/([0-9]+?)` | `\…\Reseller\Customer\Controllers\CustomerController::create/$1` | `<unknown>` |
| `POST` | `/api/v1/reseller/customers/([0-9]+)/sync-pppoe` | `\…\Reseller\Customer\Controllers\CustomerController::syncPppoeIds/$1` | `zapijwt zapirole zapipermission cors maintenance tenantresolve trafficstart` |
| `POST` | `/api/v1/reseller/customers/([0-9]+)/sync-corporate/([0-9]+)` | `\…\Reseller\Customer\Controllers\CustomerController::syncCorporate/$1/$2` | `zapijwt zapirole zapipermission cors maintenance tenantresolve trafficstart` |
| `POST` | `/api/v1/reseller/customers/([0-9]+)/import-excel` | `\…\Reseller\Customer\Controllers\CustomerController::importExcel/$1` | `zapijwt zapirole zapipermission cors maintenance tenantresolve trafficstart` |
| `POST` | `/api/v1/reseller/customers/([0-9]+)/bulk-recharge` | `\…\Reseller\Customer\Controllers\CustomerController::bulkRecharge/$1` | `zapijwt zapirole zapipermission cors maintenance tenantresolve trafficstart` |
| `POST` | `/api/v1/reseller/customers/([0-9]+)/transfer` | `\…\Reseller\Customer\Controllers\CustomerController::transfer/$1` | `zapijwt zapirole zapipermission cors maintenance tenantresolve trafficstart` |
| `POST` | `/api/v1/reseller/customers/([0-9]+)/bulk-delete` | `\…\Reseller\Customer\Controllers\CustomerController::bulkDelete/$1` | `zapijwt zapirole zapipermission cors maintenance tenantresolve trafficstart` |
| `POST` | `/api/v1/reseller/customers/([0-9]+)/pppoe-status` | `\…\Reseller\Customer\Controllers\CustomerController::pppoeStatus/$1` | `zapijwt zapirole zapipermission cors maintenance tenantresolve trafficstart` |
| `POST` | `/api/v1/reseller/customers/([0-9]+)/update-pop` | `\…\Reseller\Customer\Controllers\CustomerController::updatePop/$1` | `zapijwt zapirole zapipermission cors maintenance tenantresolve trafficstart` |
| `POST` | `/api/v1/reseller/customers/([0-9]+)/bulk-update-pop` | `\…\Reseller\Customer\Controllers\CustomerController::bulkUpdatePop/$1` | `zapijwt zapirole zapipermission cors maintenance tenantresolve trafficstart` |
| `POST` | `/api/v1/reseller/customers/([0-9]+)/update-router` | `\…\Reseller\Customer\Controllers\CustomerController::updateRouter/$1` | `zapijwt zapirole zapipermission cors maintenance tenantresolve trafficstart` |
| `POST` | `/api/v1/reseller/customers/([0-9]+)/bulk-update-router` | `\…\Reseller\Customer\Controllers\CustomerController::bulkUpdateRouter/$1` | `zapijwt zapirole zapipermission cors maintenance tenantresolve trafficstart` |
| `POST` | `/api/v1/reseller/customers/([0-9]+)/([0-9]+)/mac-bind` | `\…\Reseller\Customer\Controllers\CustomerController::macBind/$1/$2` | `zapijwt zapirole zapipermission cors maintenance tenantresolve trafficstart` |
| `POST` | `/api/v1/reseller/customers/([0-9]+)/([0-9]+)/mac-unbind` | `\…\Reseller\Customer\Controllers\CustomerController::macUnbind/$1/$2` | `zapijwt zapirole zapipermission cors maintenance tenantresolve trafficstart` |
| `POST` | `/api/v1/reseller/customers/([0-9]+?)/([0-9]+?)` | `\…\Reseller\Customer\Controllers\CustomerController::update/$1/$2` | `<unknown>` |
| `POST` | `/api/v1/reseller/customer-payments/([0-9]+)` | `\…\Reseller\CustomerPayment\Controllers\CustomerPaymentController::create/$1` | `zapijwt zapirole zapipermission cors maintenance tenantresolve trafficstart` |
| `POST` | `/api/v1/reseller/employees/([0-9]+)` | `\…\Reseller\Employee\Controllers\EmployeeController::create/$1` | `zapijwt zapirole zapipermission cors maintenance tenantresolve trafficstart` |
| `POST` | `/api/v1/reseller/employees/([0-9]+)/attendance/check-in` | `\…\Reseller\EmployeeAttendance\Controllers\EmployeeAttendanceController::checkIn/$1` | `zapijwt zapirole zapipermission cors maintenance tenantresolve trafficstart` |
| `POST` | `/api/v1/reseller/employees/([0-9]+)/attendance/check-out` | `\…\Reseller\EmployeeAttendance\Controllers\EmployeeAttendanceController::checkOut/$1` | `zapijwt zapirole zapipermission cors maintenance tenantresolve trafficstart` |
| `POST` | `/api/v1/reseller/employees/([0-9]+)/attendance/location` | `\…\Reseller\EmployeeAttendance\Controllers\EmployeeAttendanceController::updateLocation/$1` | `zapijwt zapirole zapipermission cors maintenance tenantresolve trafficstart` |
| `POST` | `/api/v1/reseller/employees/([0-9]+)/advance-salary` | `\…\Reseller\AdvanceSalary\Controllers\AdvanceSalaryController::apply/$1` | `zapijwt zapirole zapipermission cors maintenance tenantresolve trafficstart` |
| `POST` | `/api/v1/reseller/employees/([0-9]+)/advance-salary/([0-9]+)/deduct` | `\…\Reseller\AdvanceSalary\Controllers\AdvanceSalaryController::deduct/$1/$2` | `zapijwt zapirole zapipermission cors maintenance tenantresolve trafficstart` |
| `POST` | `/api/v1/reseller/employee-payments/([0-9]+)` | `\…\Reseller\EmployeePayment\Controllers\EmployeePaymentController::create/$1` | `zapijwt zapirole zapipermission cors maintenance tenantresolve trafficstart` |
| `POST` | `/api/v1/reseller/support-tickets/([0-9]+)` | `\…\Reseller\SupportTicket\Controllers\SupportTicketController::create/$1` | `zapijwt zapirole zapipermission cors maintenance tenantresolve trafficstart` |
| `POST` | `/api/v1/reseller/support-tickets/([0-9]+)/([0-9]+)/message` | `\…\Reseller\SupportTicket\Controllers\SupportTicketController::sendMessage/$1/$2` | `zapijwt zapirole zapipermission cors maintenance tenantresolve trafficstart` |
| `POST` | `/api/v1/reseller/funding/([0-9]+)` | `\…\Reseller\Funding\Controllers\FundingController::create/$1` | `zapijwt zapirole zapipermission cors maintenance tenantresolve trafficstart` |
| `POST` | `/api/v1/reseller/subscription/([0-9]+)/renew` | `\…\Reseller\Subscription\Controllers\SubscriptionController::renew/$1` | `zapijwt zapirole zapipermission cors maintenance tenantresolve trafficstart` |
| `POST` | `/api/v1/reseller/subscription/([0-9]+)/bulk-renew` | `\…\Reseller\Subscription\Controllers\SubscriptionController::bulkRenew/$1` | `zapijwt zapirole zapipermission cors maintenance tenantresolve trafficstart` |
| `POST` | `/api/v1/reseller/sms/([0-9]+)/send` | `\…\Reseller\Sms\Controllers\SmsController::send/$1` | `zapijwt zapirole zapipermission cors maintenance tenantresolve trafficstart` |
| `POST` | `/api/v1/reseller/voice-sms/([0-9]+)/send` | `\…\Reseller\VoiceSms\Controllers\VoiceSmsController::send/$1` | `zapijwt zapirole zapipermission cors maintenance tenantresolve trafficstart` |
| `POST` | `/api/v1/reseller/voice-sms/([0-9]+)/templates` | `\…\Reseller\VoiceSms\Controllers\VoiceSmsController::createTemplate/$1` | `zapijwt zapirole zapipermission cors maintenance tenantresolve trafficstart` |
| `POST` | `/api/v1/reseller/profile/([0-9]+)/change-password` | `\…\Reseller\Profile\Controllers\ProfileController::changePassword/$1` | `zapijwt zapirole zapipermission cors maintenance tenantresolve trafficstart` |
| `POST` | `/api/v1/reseller/ip-pools/([0-9]+)` | `\…\Reseller\IpPool\Controllers\IpPoolController::create/$1` | `zapijwt zapirole zapipermission cors maintenance tenantresolve trafficstart` |
| `POST` | `/api/v1/reseller/referrals/([0-9]+)/([0-9]+)/approve` | `\…\Reseller\Referral\Controllers\ReferralController::approve/$1/$2` | `zapijwt zapirole zapipermission cors maintenance tenantresolve trafficstart` |
| `POST` | `/api/v1/reseller/referrals/([0-9]+)/([0-9]+)/reject` | `\…\Reseller\Referral\Controllers\ReferralController::reject/$1/$2` | `zapijwt zapirole zapipermission cors maintenance tenantresolve trafficstart` |
| `POST` | `/api/v1/reseller/olt` | `\…\Reseller\Olt\Controllers\OltApiController::create` | `zapijwt zapirole cors maintenance tenantresolve trafficstart` |
| `POST` | `/api/v1/reseller/olt/([^/]+)/sync` | `\…\Reseller\Olt\Controllers\OltApiController::sync/$1` | `zapijwt zapirole cors maintenance tenantresolve trafficstart` |
| `POST` | `/api/v1/reseller/hotspot/plans` | `\…\Reseller\Hotspot\Controllers\HotspotApiController::createPlan` | `zapijwt zapirole cors maintenance tenantresolve trafficstart` |
| `POST` | `/api/v1/reseller/hotspot/vouchers/generate` | `\…\Reseller\Hotspot\Controllers\HotspotApiController::generateVouchers` | `zapijwt zapirole cors maintenance tenantresolve trafficstart` |
| `POST` | `/api/v1/reseller/inventory/items` | `\…\Reseller\Inventory\Controllers\InventoryApiController::createItem` | `zapijwt zapirole cors maintenance tenantresolve trafficstart` |
| `POST` | `/api/v1/reseller/inventory/transactions` | `\…\Reseller\Inventory\Controllers\InventoryApiController::recordTransaction` | `zapijwt zapirole cors maintenance tenantresolve trafficstart` |
| `POST` | `/api/v1/reseller/whatsapp/sessions` | `\…\Reseller\WhatsApp\Controllers\WhatsAppApiController::createSession` | `zapijwt zapirole cors maintenance tenantresolve trafficstart` |
| `POST` | `/api/v1/reseller/whatsapp/send` | `\…\Reseller\WhatsApp\Controllers\WhatsAppApiController::sendMessage` | `zapijwt zapirole cors maintenance tenantresolve trafficstart` |
| `POST` | `/api/reseller/areas/([0-9]+)` | `\…\Reseller\Area\Controllers\ServiceAreaController::create/$1` | `zapijwt zapirole zapipermission cors maintenance tenantresolve trafficstart` |
| `POST` | `/api/reseller/subareas` | `\…\Reseller\Area\Controllers\ServiceAreaController::subcreate` | `zapijwt zapirole zapipermission cors maintenance tenantresolve trafficstart` |
| `POST` | `/api/reseller/customers/create/([0-9]+?)` | `\…\Reseller\Customer\Controllers\CustomerController::create/$1` | `<unknown>` |
| `POST` | `/api/reseller/customers/([0-9]+)/sync-pppoe` | `\…\Reseller\Customer\Controllers\CustomerController::syncPppoeIds/$1` | `zapijwt zapirole zapipermission cors maintenance tenantresolve trafficstart` |
| `POST` | `/api/reseller/customers/([0-9]+)/sync-corporate/([0-9]+)` | `\…\Reseller\Customer\Controllers\CustomerController::syncCorporate/$1/$2` | `zapijwt zapirole zapipermission cors maintenance tenantresolve trafficstart` |
| `POST` | `/api/reseller/customers/([0-9]+)/import-excel` | `\…\Reseller\Customer\Controllers\CustomerController::importExcel/$1` | `zapijwt zapirole zapipermission cors maintenance tenantresolve trafficstart` |
| `POST` | `/api/reseller/customers/([0-9]+)/bulk-recharge` | `\…\Reseller\Customer\Controllers\CustomerController::bulkRecharge/$1` | `zapijwt zapirole zapipermission cors maintenance tenantresolve trafficstart` |
| `POST` | `/api/reseller/customers/([0-9]+)/transfer` | `\…\Reseller\Customer\Controllers\CustomerController::transfer/$1` | `zapijwt zapirole zapipermission cors maintenance tenantresolve trafficstart` |
| `POST` | `/api/reseller/customers/([0-9]+)/bulk-delete` | `\…\Reseller\Customer\Controllers\CustomerController::bulkDelete/$1` | `zapijwt zapirole zapipermission cors maintenance tenantresolve trafficstart` |
| `POST` | `/api/reseller/customers/([0-9]+)/pppoe-status` | `\…\Reseller\Customer\Controllers\CustomerController::pppoeStatus/$1` | `zapijwt zapirole zapipermission cors maintenance tenantresolve trafficstart` |
| `POST` | `/api/reseller/customers/([0-9]+)/update-pop` | `\…\Reseller\Customer\Controllers\CustomerController::updatePop/$1` | `zapijwt zapirole zapipermission cors maintenance tenantresolve trafficstart` |
| `POST` | `/api/reseller/customers/([0-9]+)/bulk-update-pop` | `\…\Reseller\Customer\Controllers\CustomerController::bulkUpdatePop/$1` | `zapijwt zapirole zapipermission cors maintenance tenantresolve trafficstart` |
| `POST` | `/api/reseller/customers/([0-9]+)/update-router` | `\…\Reseller\Customer\Controllers\CustomerController::updateRouter/$1` | `zapijwt zapirole zapipermission cors maintenance tenantresolve trafficstart` |
| `POST` | `/api/reseller/customers/([0-9]+)/bulk-update-router` | `\…\Reseller\Customer\Controllers\CustomerController::bulkUpdateRouter/$1` | `zapijwt zapirole zapipermission cors maintenance tenantresolve trafficstart` |
| `POST` | `/api/reseller/customers/([0-9]+)/([0-9]+)/mac-bind` | `\…\Reseller\Customer\Controllers\CustomerController::macBind/$1/$2` | `zapijwt zapirole zapipermission cors maintenance tenantresolve trafficstart` |
| `POST` | `/api/reseller/customers/([0-9]+)/([0-9]+)/mac-unbind` | `\…\Reseller\Customer\Controllers\CustomerController::macUnbind/$1/$2` | `zapijwt zapirole zapipermission cors maintenance tenantresolve trafficstart` |
| `POST` | `/api/reseller/customers/([0-9]+?)/([0-9]+?)` | `\…\Reseller\Customer\Controllers\CustomerController::update/$1/$2` | `<unknown>` |
| `POST` | `/api/reseller/customer-payments/([0-9]+)` | `\…\Reseller\CustomerPayment\Controllers\CustomerPaymentController::create/$1` | `zapijwt zapirole zapipermission cors maintenance tenantresolve trafficstart` |
| `POST` | `/api/reseller/employees/([0-9]+)` | `\…\Reseller\Employee\Controllers\EmployeeController::create/$1` | `zapijwt zapirole zapipermission cors maintenance tenantresolve trafficstart` |
| `POST` | `/api/reseller/employees/([0-9]+)/attendance/check-in` | `\…\Reseller\EmployeeAttendance\Controllers\EmployeeAttendanceController::checkIn/$1` | `zapijwt zapirole zapipermission cors maintenance tenantresolve trafficstart` |
| `POST` | `/api/reseller/employees/([0-9]+)/attendance/check-out` | `\…\Reseller\EmployeeAttendance\Controllers\EmployeeAttendanceController::checkOut/$1` | `zapijwt zapirole zapipermission cors maintenance tenantresolve trafficstart` |
| `POST` | `/api/reseller/employees/([0-9]+)/attendance/location` | `\…\Reseller\EmployeeAttendance\Controllers\EmployeeAttendanceController::updateLocation/$1` | `zapijwt zapirole zapipermission cors maintenance tenantresolve trafficstart` |
| `POST` | `/api/reseller/employees/([0-9]+)/advance-salary` | `\…\Reseller\AdvanceSalary\Controllers\AdvanceSalaryController::apply/$1` | `zapijwt zapirole zapipermission cors maintenance tenantresolve trafficstart` |
| `POST` | `/api/reseller/employees/([0-9]+)/advance-salary/([0-9]+)/deduct` | `\…\Reseller\AdvanceSalary\Controllers\AdvanceSalaryController::deduct/$1/$2` | `zapijwt zapirole zapipermission cors maintenance tenantresolve trafficstart` |
| `POST` | `/api/reseller/employee-payments/([0-9]+)` | `\…\Reseller\EmployeePayment\Controllers\EmployeePaymentController::create/$1` | `zapijwt zapirole zapipermission cors maintenance tenantresolve trafficstart` |
| `POST` | `/api/reseller/support-tickets/([0-9]+)` | `\…\Reseller\SupportTicket\Controllers\SupportTicketController::create/$1` | `zapijwt zapirole zapipermission cors maintenance tenantresolve trafficstart` |
| `POST` | `/api/reseller/support-tickets/([0-9]+)/([0-9]+)/message` | `\…\Reseller\SupportTicket\Controllers\SupportTicketController::sendMessage/$1/$2` | `zapijwt zapirole zapipermission cors maintenance tenantresolve trafficstart` |
| `POST` | `/api/reseller/funding/([0-9]+)` | `\…\Reseller\Funding\Controllers\FundingController::create/$1` | `zapijwt zapirole zapipermission cors maintenance tenantresolve trafficstart` |
| `POST` | `/api/reseller/subscription/([0-9]+)/renew` | `\…\Reseller\Subscription\Controllers\SubscriptionController::renew/$1` | `zapijwt zapirole zapipermission cors maintenance tenantresolve trafficstart` |
| `POST` | `/api/reseller/subscription/([0-9]+)/bulk-renew` | `\…\Reseller\Subscription\Controllers\SubscriptionController::bulkRenew/$1` | `zapijwt zapirole zapipermission cors maintenance tenantresolve trafficstart` |
| `POST` | `/api/reseller/sms/([0-9]+)/send` | `\…\Reseller\Sms\Controllers\SmsController::send/$1` | `zapijwt zapirole zapipermission cors maintenance tenantresolve trafficstart` |
| `POST` | `/api/reseller/voice-sms/([0-9]+)/send` | `\…\Reseller\VoiceSms\Controllers\VoiceSmsController::send/$1` | `zapijwt zapirole zapipermission cors maintenance tenantresolve trafficstart` |
| `POST` | `/api/reseller/voice-sms/([0-9]+)/templates` | `\…\Reseller\VoiceSms\Controllers\VoiceSmsController::createTemplate/$1` | `zapijwt zapirole zapipermission cors maintenance tenantresolve trafficstart` |
| `POST` | `/api/reseller/profile/([0-9]+)/change-password` | `\…\Reseller\Profile\Controllers\ProfileController::changePassword/$1` | `zapijwt zapirole zapipermission cors maintenance tenantresolve trafficstart` |
| `POST` | `/api/reseller/ip-pools/([0-9]+)` | `\…\Reseller\IpPool\Controllers\IpPoolController::create/$1` | `zapijwt zapirole zapipermission cors maintenance tenantresolve trafficstart` |
| `POST` | `/api/reseller/referrals/([0-9]+)/([0-9]+)/approve` | `\…\Reseller\Referral\Controllers\ReferralController::approve/$1/$2` | `zapijwt zapirole zapipermission cors maintenance tenantresolve trafficstart` |
| `POST` | `/api/reseller/referrals/([0-9]+)/([0-9]+)/reject` | `\…\Reseller\Referral\Controllers\ReferralController::reject/$1/$2` | `zapijwt zapirole zapipermission cors maintenance tenantresolve trafficstart` |
| `PUT` | `/api/v1/reseller/areas/update/([0-9]+)` | `\…\Reseller\Area\Controllers\ServiceAreaController::update/$1` | `zapijwt zapirole zapipermission cors maintenance tenantresolve trafficstart` |
| `PUT` | `/api/v1/reseller/subareas/update/([0-9]+)` | `\…\Reseller\Area\Controllers\ServiceAreaController::updatesub/$1` | `zapijwt zapirole zapipermission cors maintenance tenantresolve trafficstart` |
| `PUT` | `/api/v1/reseller/customer-payments/([0-9]+)/([0-9]+)` | `\…\Reseller\CustomerPayment\Controllers\CustomerPaymentController::update/$1/$2` | `zapijwt zapirole zapipermission cors maintenance tenantresolve trafficstart` |
| `PUT` | `/api/v1/reseller/employees/([0-9]+)/([0-9]+)` | `\…\Reseller\Employee\Controllers\EmployeeController::update/$1/$2` | `zapijwt zapirole zapipermission cors maintenance tenantresolve trafficstart` |
| `PUT` | `/api/v1/reseller/employees/([0-9]+)/attendance/([0-9]+)` | `\…\Reseller\EmployeeAttendance\Controllers\EmployeeAttendanceController::update/$1/$2` | `zapijwt zapirole zapipermission cors maintenance tenantresolve trafficstart` |
| `PUT` | `/api/v1/reseller/employees/([0-9]+)/advance-salary/([0-9]+)` | `\…\Reseller\AdvanceSalary\Controllers\AdvanceSalaryController::updateStatus/$1/$2` | `zapijwt zapirole zapipermission cors maintenance tenantresolve trafficstart` |
| `PUT` | `/api/v1/reseller/employee-payments/([0-9]+)/([0-9]+)` | `\…\Reseller\EmployeePayment\Controllers\EmployeePaymentController::update/$1/$2` | `zapijwt zapirole zapipermission cors maintenance tenantresolve trafficstart` |
| `PUT` | `/api/v1/reseller/support-tickets/([0-9]+)/([0-9]+)` | `\…\Reseller\SupportTicket\Controllers\SupportTicketController::update/$1/$2` | `zapijwt zapirole zapipermission cors maintenance tenantresolve trafficstart` |
| `PUT` | `/api/v1/reseller/voice-sms/([0-9]+)/templates/([0-9]+)` | `\…\Reseller\VoiceSms\Controllers\VoiceSmsController::updateTemplate/$1/$2` | `zapijwt zapirole zapipermission cors maintenance tenantresolve trafficstart` |
| `PUT` | `/api/v1/reseller/voice-sms/([0-9]+)/settings` | `\…\Reseller\VoiceSms\Controllers\VoiceSmsController::updateSettings/$1` | `zapijwt zapirole zapipermission cors maintenance tenantresolve trafficstart` |
| `PUT` | `/api/v1/reseller/voice-sms/([0-9]+)/event-config` | `\…\Reseller\VoiceSms\Controllers\VoiceSmsController::updateEventConfig/$1` | `zapijwt zapirole zapipermission cors maintenance tenantresolve trafficstart` |
| `PUT` | `/api/v1/reseller/profile/([0-9]+)` | `\…\Reseller\Profile\Controllers\ProfileController::update/$1` | `zapijwt zapirole zapipermission cors maintenance tenantresolve trafficstart` |
| `PUT` | `/api/v1/reseller/profile/([0-9]+)/organization` | `\…\Reseller\Profile\Controllers\ProfileController::updateOrganization/$1` | `zapijwt zapirole zapipermission cors maintenance tenantresolve trafficstart` |
| `PUT` | `/api/v1/reseller/ip-pools/([0-9]+)/([0-9]+)` | `\…\Reseller\IpPool\Controllers\IpPoolController::update/$1/$2` | `zapijwt zapirole zapipermission cors maintenance tenantresolve trafficstart` |
| `PUT` | `/api/v1/reseller/rewards/global-config` | `\…\Reseller\Reward\Controllers\RewardConfigController::updateGlobal` | `zapijwt zapirole cors maintenance tenantresolve trafficstart` |
| `PUT` | `/api/v1/reseller/rewards/([0-9]+)/config` | `\…\Reseller\Reward\Controllers\RewardConfigController::update/$1` | `zapijwt zapirole cors maintenance tenantresolve trafficstart` |
| `PUT` | `/api/reseller/areas/update/([0-9]+)` | `\…\Reseller\Area\Controllers\ServiceAreaController::update/$1` | `zapijwt zapirole zapipermission cors maintenance tenantresolve trafficstart` |
| `PUT` | `/api/reseller/subareas/update/([0-9]+)` | `\…\Reseller\Area\Controllers\ServiceAreaController::updatesub/$1` | `zapijwt zapirole zapipermission cors maintenance tenantresolve trafficstart` |
| `PUT` | `/api/reseller/customer-payments/([0-9]+)/([0-9]+)` | `\…\Reseller\CustomerPayment\Controllers\CustomerPaymentController::update/$1/$2` | `zapijwt zapirole zapipermission cors maintenance tenantresolve trafficstart` |
| `PUT` | `/api/reseller/employees/([0-9]+)/([0-9]+)` | `\…\Reseller\Employee\Controllers\EmployeeController::update/$1/$2` | `zapijwt zapirole zapipermission cors maintenance tenantresolve trafficstart` |
| `PUT` | `/api/reseller/employees/([0-9]+)/attendance/([0-9]+)` | `\…\Reseller\EmployeeAttendance\Controllers\EmployeeAttendanceController::update/$1/$2` | `zapijwt zapirole zapipermission cors maintenance tenantresolve trafficstart` |
| `PUT` | `/api/reseller/employees/([0-9]+)/advance-salary/([0-9]+)` | `\…\Reseller\AdvanceSalary\Controllers\AdvanceSalaryController::updateStatus/$1/$2` | `zapijwt zapirole zapipermission cors maintenance tenantresolve trafficstart` |
| `PUT` | `/api/reseller/employee-payments/([0-9]+)/([0-9]+)` | `\…\Reseller\EmployeePayment\Controllers\EmployeePaymentController::update/$1/$2` | `zapijwt zapirole zapipermission cors maintenance tenantresolve trafficstart` |
| `PUT` | `/api/reseller/support-tickets/([0-9]+)/([0-9]+)` | `\…\Reseller\SupportTicket\Controllers\SupportTicketController::update/$1/$2` | `zapijwt zapirole zapipermission cors maintenance tenantresolve trafficstart` |
| `PUT` | `/api/reseller/voice-sms/([0-9]+)/templates/([0-9]+)` | `\…\Reseller\VoiceSms\Controllers\VoiceSmsController::updateTemplate/$1/$2` | `zapijwt zapirole zapipermission cors maintenance tenantresolve trafficstart` |
| `PUT` | `/api/reseller/voice-sms/([0-9]+)/settings` | `\…\Reseller\VoiceSms\Controllers\VoiceSmsController::updateSettings/$1` | `zapijwt zapirole zapipermission cors maintenance tenantresolve trafficstart` |
| `PUT` | `/api/reseller/voice-sms/([0-9]+)/event-config` | `\…\Reseller\VoiceSms\Controllers\VoiceSmsController::updateEventConfig/$1` | `zapijwt zapirole zapipermission cors maintenance tenantresolve trafficstart` |
| `PUT` | `/api/reseller/profile/([0-9]+)` | `\…\Reseller\Profile\Controllers\ProfileController::update/$1` | `zapijwt zapirole zapipermission cors maintenance tenantresolve trafficstart` |
| `PUT` | `/api/reseller/profile/([0-9]+)/organization` | `\…\Reseller\Profile\Controllers\ProfileController::updateOrganization/$1` | `zapijwt zapirole zapipermission cors maintenance tenantresolve trafficstart` |
| `PUT` | `/api/reseller/ip-pools/([0-9]+)/([0-9]+)` | `\…\Reseller\IpPool\Controllers\IpPoolController::update/$1/$2` | `zapijwt zapirole zapipermission cors maintenance tenantresolve trafficstart` |
| `PUT` | `/api/reseller/rewards/global-config` | `\…\Reseller\Reward\Controllers\RewardConfigController::updateGlobal` | `zapijwt zapirole cors maintenance tenantresolve trafficstart` |
| `PUT` | `/api/reseller/rewards/([0-9]+)/config` | `\…\Reseller\Reward\Controllers\RewardConfigController::update/$1` | `zapijwt zapirole cors maintenance tenantresolve trafficstart` |
| `DELETE` | `/api/v1/reseller/areas/([0-9]+)/delete` | `\…\Reseller\Area\Controllers\ServiceAreaController::delete/$1` | `zapijwt zapirole zapipermission cors maintenance tenantresolve trafficstart` |
| `DELETE` | `/api/v1/reseller/areas/delete` | `\…\Reseller\Area\Controllers\ServiceAreaController::delete` | `zapijwt zapirole zapipermission cors maintenance tenantresolve trafficstart` |
| `DELETE` | `/api/v1/reseller/subareas/delete` | `\…\Reseller\Area\Controllers\ServiceAreaController::deletesub` | `zapijwt zapirole zapipermission cors maintenance tenantresolve trafficstart` |
| `DELETE` | `/api/v1/reseller/packages/([0-9]+)/([0-9]+)` | `\…\Reseller\Package\Controllers\PackageController::delete/$1/$2` | `zapijwt zapirole zapipermission cors maintenance tenantresolve trafficstart` |
| `DELETE` | `/api/v1/reseller/customers/([0-9]+)/bulk-delete` | `\…\Reseller\Customer\Controllers\CustomerController::bulkDelete/$1` | `zapijwt zapirole zapipermission cors maintenance tenantresolve trafficstart` |
| `DELETE` | `/api/v1/reseller/customers/([0-9]+?)/([0-9]+?)` | `\…\Reseller\Customer\Controllers\CustomerController::delete/$1/$2` | `<unknown>` |
| `DELETE` | `/api/v1/reseller/customer-payments/([0-9]+)` | `\…\Reseller\CustomerPayment\Controllers\CustomerPaymentController::delete/$1` | `zapijwt zapirole zapipermission cors maintenance tenantresolve trafficstart` |
| `DELETE` | `/api/v1/reseller/employees/([0-9]+)` | `\…\Reseller\Employee\Controllers\EmployeeController::delete/$1` | `zapijwt zapirole zapipermission cors maintenance tenantresolve trafficstart` |
| `DELETE` | `/api/v1/reseller/employee-payments/([0-9]+)` | `\…\Reseller\EmployeePayment\Controllers\EmployeePaymentController::delete/$1` | `zapijwt zapirole zapipermission cors maintenance tenantresolve trafficstart` |
| `DELETE` | `/api/v1/reseller/support-tickets/([0-9]+)` | `\…\Reseller\SupportTicket\Controllers\SupportTicketController::delete/$1` | `zapijwt zapirole zapipermission cors maintenance tenantresolve trafficstart` |
| `DELETE` | `/api/v1/reseller/transactions/([0-9]+)` | `\…\Reseller\Transaction\Controllers\TransactionController::delete/$1` | `zapijwt zapirole zapipermission cors maintenance tenantresolve trafficstart` |
| `DELETE` | `/api/v1/reseller/funding/([0-9]+)` | `\…\Reseller\Funding\Controllers\FundingController::delete/$1` | `zapijwt zapirole zapipermission cors maintenance tenantresolve trafficstart` |
| `DELETE` | `/api/v1/reseller/sms/([0-9]+)` | `\…\Reseller\Sms\Controllers\SmsController::delete/$1` | `zapijwt zapirole zapipermission cors maintenance tenantresolve trafficstart` |
| `DELETE` | `/api/v1/reseller/voice-sms/([0-9]+)/templates/([0-9]+)` | `\…\Reseller\VoiceSms\Controllers\VoiceSmsController::deleteTemplate/$1/$2` | `zapijwt zapirole zapipermission cors maintenance tenantresolve trafficstart` |
| `DELETE` | `/api/v1/reseller/ip-pools/([0-9]+)/([0-9]+)` | `\…\Reseller\IpPool\Controllers\IpPoolController::delete/$1/$2` | `zapijwt zapirole zapipermission cors maintenance tenantresolve trafficstart` |
| `DELETE` | `/api/reseller/areas/([0-9]+)/delete` | `\…\Reseller\Area\Controllers\ServiceAreaController::delete/$1` | `zapijwt zapirole zapipermission cors maintenance tenantresolve trafficstart` |
| `DELETE` | `/api/reseller/areas/delete` | `\…\Reseller\Area\Controllers\ServiceAreaController::delete` | `zapijwt zapirole zapipermission cors maintenance tenantresolve trafficstart` |
| `DELETE` | `/api/reseller/subareas/delete` | `\…\Reseller\Area\Controllers\ServiceAreaController::deletesub` | `zapijwt zapirole zapipermission cors maintenance tenantresolve trafficstart` |
| `DELETE` | `/api/reseller/packages/([0-9]+)/([0-9]+)` | `\…\Reseller\Package\Controllers\PackageController::delete/$1/$2` | `zapijwt zapirole zapipermission cors maintenance tenantresolve trafficstart` |
| `DELETE` | `/api/reseller/customers/([0-9]+)/bulk-delete` | `\…\Reseller\Customer\Controllers\CustomerController::bulkDelete/$1` | `zapijwt zapirole zapipermission cors maintenance tenantresolve trafficstart` |
| `DELETE` | `/api/reseller/customers/([0-9]+?)/([0-9]+?)` | `\…\Reseller\Customer\Controllers\CustomerController::delete/$1/$2` | `<unknown>` |
| `DELETE` | `/api/reseller/customer-payments/([0-9]+)` | `\…\Reseller\CustomerPayment\Controllers\CustomerPaymentController::delete/$1` | `zapijwt zapirole zapipermission cors maintenance tenantresolve trafficstart` |
| `DELETE` | `/api/reseller/employees/([0-9]+)` | `\…\Reseller\Employee\Controllers\EmployeeController::delete/$1` | `zapijwt zapirole zapipermission cors maintenance tenantresolve trafficstart` |
| `DELETE` | `/api/reseller/employee-payments/([0-9]+)` | `\…\Reseller\EmployeePayment\Controllers\EmployeePaymentController::delete/$1` | `zapijwt zapirole zapipermission cors maintenance tenantresolve trafficstart` |
| `DELETE` | `/api/reseller/support-tickets/([0-9]+)` | `\…\Reseller\SupportTicket\Controllers\SupportTicketController::delete/$1` | `zapijwt zapirole zapipermission cors maintenance tenantresolve trafficstart` |
| `DELETE` | `/api/reseller/transactions/([0-9]+)` | `\…\Reseller\Transaction\Controllers\TransactionController::delete/$1` | `zapijwt zapirole zapipermission cors maintenance tenantresolve trafficstart` |
| `DELETE` | `/api/reseller/funding/([0-9]+)` | `\…\Reseller\Funding\Controllers\FundingController::delete/$1` | `zapijwt zapirole zapipermission cors maintenance tenantresolve trafficstart` |
| `DELETE` | `/api/reseller/sms/([0-9]+)` | `\…\Reseller\Sms\Controllers\SmsController::delete/$1` | `zapijwt zapirole zapipermission cors maintenance tenantresolve trafficstart` |
| `DELETE` | `/api/reseller/voice-sms/([0-9]+)/templates/([0-9]+)` | `\…\Reseller\VoiceSms\Controllers\VoiceSmsController::deleteTemplate/$1/$2` | `zapijwt zapirole zapipermission cors maintenance tenantresolve trafficstart` |
| `DELETE` | `/api/reseller/ip-pools/([0-9]+)/([0-9]+)` | `\…\Reseller\IpPool\Controllers\IpPoolController::delete/$1/$2` | `zapijwt zapirole zapipermission cors maintenance tenantresolve trafficstart` |
