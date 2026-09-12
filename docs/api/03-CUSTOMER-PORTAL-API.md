# 03. Customer Portal & Self-Care API

> Endpoints for subscriber self-care: Subscription details, self-renewal, online invoice payments, support tickets, AutoFix router tools, connected devices, and referral rewards.

**Total Endpoints:** 88

## Endpoint List

| Method | Route | Controller & Action | Filters |
|---|---|---|---|
| `GET` | `/api/v1/customer/users-load-traffic/([0-9]+)` | `\…\Customer\User\Controllers\RouterTrafficController::UsersloadTraffic_api/$1` | `zapijwt zapirole cors maintenance tenantresolve trafficstart` |
| `GET` | `/api/v1/customer/routers/load-traffic/([0-9]+)` | `\…\Customer\User\Controllers\RouterTrafficController::loadTraffic/$1` | `zapijwt zapirole cors maintenance tenantresolve trafficstart` |
| `GET` | `/api/v1/customer/users/([0-9]+)` | `\…\Customer\User\Controllers\UserController::index/$1` | `zapijwt zapirole cors maintenance tenantresolve trafficstart` |
| `GET` | `/api/v1/customer/payment-fetch` | `\…\Customer\User\Controllers\UserController::fetch` | `zapijwt zapirole cors maintenance tenantresolve trafficstart` |
| `GET` | `/api/v1/customer/packages` | `\…\Customer\User\Controllers\UserController::packages` | `zapijwt zapirole cors maintenance tenantresolve trafficstart` |
| `GET` | `/api/v1/customer/ping-user` | `\…\Customer\User\Controllers\UserController::pingUserApi` | `zapijwt zapirole cors maintenance tenantresolve trafficstart` |
| `GET` | `/api/v1/customer/subscription/index` | `\…\Customer\Subscription\Controllers\SubscriptionController::index` | `zapijwt zapirole cors maintenance tenantresolve trafficstart` |
| `GET` | `/api/v1/customer/subscription/renew` | `\…\Customer\Subscription\Controllers\SubscriptionController::renew` | `zapijwt zapirole cors maintenance tenantresolve trafficstart` |
| `GET` | `/api/v1/customer/subscription/quota` | `\…\Customer\Subscription\Controllers\SubscriptionController::quota` | `zapijwt zapirole cors maintenance tenantresolve trafficstart` |
| `GET` | `/api/v1/customer/support/fetch` | `\…\Customer\Support\Controllers\SupportController::fetch` | `zapijwt zapirole cors maintenance tenantresolve trafficstart` |
| `GET` | `/api/v1/customer/support/contact` | `\…\Customer\Support\Controllers\SupportController::contact` | `zapijwt zapirole cors maintenance tenantresolve trafficstart` |
| `GET` | `/api/v1/customer/support/details` | `\…\Customer\Support\Controllers\SupportController::details` | `zapijwt zapirole cors maintenance tenantresolve trafficstart` |
| `GET` | `/api/v1/customer/permission` | `\…\Customer\Permission\Controllers\PermissionController::index` | `zapijwt zapirole cors maintenance tenantresolve trafficstart` |
| `GET` | `/api/v1/customer/make-payment/([0-9]+)` | `\…\Customer\Payment\Controllers\PaymentController::makePayment/$1` | `zapijwt zapirole cors maintenance tenantresolve trafficstart` |
| `GET` | `/api/v1/customer/json/make-payment/([0-9]+)` | `\…\Customer\Payment\Controllers\PaymentController::makePaymentJson/$1` | `zapijwt zapirole cors maintenance tenantresolve trafficstart` |
| `GET` | `/api/v1/customer/invoice-print` | `\…\Common\Common\Controllers\CommonController::invoicePrint` | `zapijwt zapirole cors maintenance tenantresolve trafficstart` |
| `GET` | `/api/v1/customer/json/invoice-print` | `\…\Common\Common\Controllers\CommonController::invoicePrintJson` | `zapijwt zapirole cors maintenance tenantresolve trafficstart` |
| `GET` | `/api/v1/customer/usage` | `\…\Common\Common\Controllers\CommonController::get_user_data_usage` | `zapijwt zapirole cors maintenance tenantresolve trafficstart` |
| `GET` | `/api/v1/customer/device/connected` | `\…\Customer\Device\Controllers\DeviceController::getDevices` | `zapijwt zapirole cors maintenance tenantresolve trafficstart` |
| `GET` | `/api/v1/customer/router-control/targets` | `\…\Customer\RouterControl\Controllers\RouterControlController::targets` | `zapijwt zapirole cors maintenance tenantresolve trafficstart` |
| `GET` | `/api/v1/customer/router-control/devices` | `\…\Customer\RouterControl\Controllers\RouterControlController::devices` | `zapijwt zapirole cors maintenance tenantresolve trafficstart` |
| `GET` | `/api/v1/customer/referral/overview` | `\…\Customer\Referral\Controllers\ReferralController::overview` | `zapijwt zapirole cors maintenance tenantresolve trafficstart` |
| `GET` | `/api/v1/customer/referral/history` | `\…\Customer\Referral\Controllers\ReferralController::history` | `zapijwt zapirole cors maintenance tenantresolve trafficstart` |
| `GET` | `/api/v1/customer/reward/wallet` | `\…\Customer\Reward\Controllers\RewardController::wallet` | `zapijwt zapirole cors maintenance tenantresolve trafficstart` |
| `GET` | `/api/v1/customer/reward/transactions` | `\…\Customer\Reward\Controllers\RewardController::transactions` | `zapijwt zapirole cors maintenance tenantresolve trafficstart` |
| `GET` | `/api/v1/customer/reward/redeem-preview` | `\…\Customer\Reward\Controllers\RewardController::redeemPreview` | `zapijwt zapirole cors maintenance tenantresolve trafficstart` |
| `GET` | `/api/v1/customer/notifications` | `\…\Customer\Notification\Controllers\NotificationController::getNotifications` | `zapijwt zapirole cors maintenance tenantresolve trafficstart` |
| `GET` | `/api/customer/users-load-traffic/([0-9]+)` | `\…\Customer\User\Controllers\RouterTrafficController::UsersloadTraffic_api/$1` | `zapijwt zapirole cors maintenance tenantresolve trafficstart` |
| `GET` | `/api/customer/users/([0-9]+)` | `\…\Customer\User\Controllers\UserController::index/$1` | `zapijwt zapirole cors maintenance tenantresolve trafficstart` |
| `GET` | `/api/customer/payment-fetch` | `\…\Customer\User\Controllers\UserController::fetch` | `zapijwt zapirole cors maintenance tenantresolve trafficstart` |
| `GET` | `/api/customer/packages` | `\…\Customer\User\Controllers\UserController::packages` | `zapijwt zapirole cors maintenance tenantresolve trafficstart` |
| `GET` | `/api/customer/ping-user` | `\…\Customer\User\Controllers\UserController::pingUserApi` | `zapijwt zapirole cors maintenance tenantresolve trafficstart` |
| `GET` | `/api/customer/subscription/index` | `\…\Customer\Subscription\Controllers\SubscriptionController::index` | `zapijwt zapirole cors maintenance tenantresolve trafficstart` |
| `GET` | `/api/customer/subscription/renew` | `\…\Customer\Subscription\Controllers\SubscriptionController::renew` | `zapijwt zapirole cors maintenance tenantresolve trafficstart` |
| `GET` | `/api/customer/subscription/quota` | `\…\Customer\Subscription\Controllers\SubscriptionController::quota` | `zapijwt zapirole cors maintenance tenantresolve trafficstart` |
| `GET` | `/api/customer/support/fetch` | `\…\Customer\Support\Controllers\SupportController::fetch` | `zapijwt zapirole cors maintenance tenantresolve trafficstart` |
| `GET` | `/api/customer/support/contact` | `\…\Customer\Support\Controllers\SupportController::contact` | `zapijwt zapirole cors maintenance tenantresolve trafficstart` |
| `GET` | `/api/customer/support/details` | `\…\Customer\Support\Controllers\SupportController::details` | `zapijwt zapirole cors maintenance tenantresolve trafficstart` |
| `GET` | `/api/customer/permission` | `\…\Customer\Permission\Controllers\PermissionController::index` | `zapijwt zapirole cors maintenance tenantresolve trafficstart` |
| `GET` | `/api/customer/make-payment/([0-9]+)` | `\…\Customer\Payment\Controllers\PaymentController::makePayment/$1` | `zapijwt zapirole cors maintenance tenantresolve trafficstart` |
| `GET` | `/api/customer/json/make-payment/([0-9]+)` | `\…\Customer\Payment\Controllers\PaymentController::makePaymentJson/$1` | `zapijwt zapirole cors maintenance tenantresolve trafficstart` |
| `GET` | `/api/customer/invoice-print` | `\…\Common\Common\Controllers\CommonController::invoicePrint` | `zapijwt zapirole cors maintenance tenantresolve trafficstart` |
| `GET` | `/api/customer/json/invoice-print` | `\…\Common\Common\Controllers\CommonController::invoicePrintJson` | `zapijwt zapirole cors maintenance tenantresolve trafficstart` |
| `GET` | `/api/customer/usage` | `\…\Common\Common\Controllers\CommonController::get_user_data_usage` | `zapijwt zapirole cors maintenance tenantresolve trafficstart` |
| `GET` | `/api/customer/routers/load-traffic/([0-9]+)` | `\…\Customer\User\Controllers\RouterTrafficController::loadTraffic/$1` | `zapijwt zapirole cors maintenance tenantresolve trafficstart` |
| `GET` | `/api/customer/device/connected` | `\…\Customer\Device\Controllers\DeviceController::getDevices` | `zapijwt zapirole cors maintenance tenantresolve trafficstart` |
| `GET` | `/api/customer/router-control/targets` | `\…\Customer\RouterControl\Controllers\RouterControlController::targets` | `zapijwt zapirole cors maintenance tenantresolve trafficstart` |
| `GET` | `/api/customer/router-control/devices` | `\…\Customer\RouterControl\Controllers\RouterControlController::devices` | `zapijwt zapirole cors maintenance tenantresolve trafficstart` |
| `GET` | `/api/customer/referral/overview` | `\…\Customer\Referral\Controllers\ReferralController::overview` | `zapijwt zapirole cors maintenance tenantresolve trafficstart` |
| `GET` | `/api/customer/referral/history` | `\…\Customer\Referral\Controllers\ReferralController::history` | `zapijwt zapirole cors maintenance tenantresolve trafficstart` |
| `GET` | `/api/customer/reward/wallet` | `\…\Customer\Reward\Controllers\RewardController::wallet` | `zapijwt zapirole cors maintenance tenantresolve trafficstart` |
| `GET` | `/api/customer/reward/transactions` | `\…\Customer\Reward\Controllers\RewardController::transactions` | `zapijwt zapirole cors maintenance tenantresolve trafficstart` |
| `GET` | `/api/customer/reward/redeem-preview` | `\…\Customer\Reward\Controllers\RewardController::redeemPreview` | `zapijwt zapirole cors maintenance tenantresolve trafficstart` |
| `GET` | `/api/customer/notifications` | `\…\Customer\Notification\Controllers\NotificationController::getNotifications` | `zapijwt zapirole cors maintenance tenantresolve trafficstart` |
| `GET` | `/api/internal/whatsapp/resolve-customer` | `\App\Controllers\WhatsAppInternal::resolveCustomer` | `cors maintenance tenantresolve trafficstart` |
| `GET` | `/api/internal/whatsapp/tenant-by-customer` | `\App\Controllers\WhatsAppInternal::tenantByCustomer` | `cors maintenance tenantresolve trafficstart` |
| `GET` | `/api/internal/ai/admin-customers` | `\…\Ai\Controllers\AiInternalController::adminCustomers` | `cors maintenance tenantresolve trafficstart` |
| `GET` | `/zapi/internal/ai/admin-customers` | `\…\Ai\Controllers\AiInternalController::adminCustomers` | `cors maintenance tenantresolve trafficstart` |
| `POST` | `/api/v1/customer/subscription/renew` | `\…\Customer\Subscription\Controllers\SubscriptionController::renew` | `zapijwt zapirole cors maintenance tenantresolve trafficstart` |
| `POST` | `/api/v1/customer/subscription/activate-package` | `\…\Customer\Subscription\Controllers\SubscriptionController::activatePackage` | `zapijwt zapirole cors maintenance tenantresolve trafficstart` |
| `POST` | `/api/v1/customer/subscription/update` | `\…\Customer\Subscription\Controllers\SubscriptionController::update` | `zapijwt zapirole cors maintenance tenantresolve trafficstart` |
| `POST` | `/api/v1/customer/support/send-message` | `\…\Customer\Support\Controllers\SupportController::sendMessage` | `zapijwt zapirole cors maintenance tenantresolve trafficstart` |
| `POST` | `/api/v1/customer/support/create-ticket` | `\…\Customer\Support\Controllers\SupportController::createTicket` | `zapijwt zapirole cors maintenance tenantresolve trafficstart` |
| `POST` | `/api/v1/customer/profile/update` | `\…\Customer\Profile\Controllers\ProfileController::update` | `zapijwt zapirole cors maintenance tenantresolve trafficstart` |
| `POST` | `/api/v1/customer/autofix/reboot` | `\…\Customer\AutoFix\Controllers\AutoFixController::rebootRouter` | `zapijwt zapirole cors maintenance tenantresolve trafficstart` |
| `POST` | `/api/v1/customer/autofix/reconnect` | `\…\Customer\AutoFix\Controllers\AutoFixController::reconnectPPPoE` | `zapijwt zapirole cors maintenance tenantresolve trafficstart` |
| `POST` | `/api/v1/customer/autofix/flush-dns` | `\…\Customer\AutoFix\Controllers\AutoFixController::flushDNS` | `zapijwt zapirole cors maintenance tenantresolve trafficstart` |
| `POST` | `/api/v1/customer/autofix/reset-session` | `\…\Customer\AutoFix\Controllers\AutoFixController::resetSession` | `zapijwt zapirole cors maintenance tenantresolve trafficstart` |
| `POST` | `/api/v1/customer/autofix/quick-fix` | `\…\Customer\AutoFix\Controllers\AutoFixController::quickFix` | `zapijwt zapirole cors maintenance tenantresolve trafficstart` |
| `POST` | `/api/v1/customer/router-control/reboot` | `\…\Customer\RouterControl\Controllers\RouterControlController::reboot` | `zapijwt zapirole cors maintenance tenantresolve trafficstart` |
| `POST` | `/api/v1/customer/router-control/wifi` | `\…\Customer\RouterControl\Controllers\RouterControlController::changeWifi` | `zapijwt zapirole cors maintenance tenantresolve trafficstart` |
| `POST` | `/api/v1/customer/router-control/onboard-tr069` | `\…\Customer\RouterControl\Controllers\RouterControlController::onboardTr069` | `zapijwt zapirole cors maintenance tenantresolve trafficstart` |
| `POST` | `/api/v1/customer/notifications/read` | `\…\Customer\Notification\Controllers\NotificationController::markAsRead` | `zapijwt zapirole cors maintenance tenantresolve trafficstart` |
| `POST` | `/api/customer/subscription/renew` | `\…\Customer\Subscription\Controllers\SubscriptionController::renew` | `zapijwt zapirole cors maintenance tenantresolve trafficstart` |
| `POST` | `/api/customer/subscription/activate-package` | `\…\Customer\Subscription\Controllers\SubscriptionController::activatePackage` | `zapijwt zapirole cors maintenance tenantresolve trafficstart` |
| `POST` | `/api/customer/subscription/update` | `\…\Customer\Subscription\Controllers\SubscriptionController::update` | `zapijwt zapirole cors maintenance tenantresolve trafficstart` |
| `POST` | `/api/customer/support/send-message` | `\…\Customer\Support\Controllers\SupportController::sendMessage` | `zapijwt zapirole cors maintenance tenantresolve trafficstart` |
| `POST` | `/api/customer/support/create-ticket` | `\…\Customer\Support\Controllers\SupportController::createTicket` | `zapijwt zapirole cors maintenance tenantresolve trafficstart` |
| `POST` | `/api/customer/profile/update` | `\…\Customer\Profile\Controllers\ProfileController::update` | `zapijwt zapirole cors maintenance tenantresolve trafficstart` |
| `POST` | `/api/customer/autofix/reboot` | `\…\Customer\AutoFix\Controllers\AutoFixController::rebootRouter` | `zapijwt zapirole cors maintenance tenantresolve trafficstart` |
| `POST` | `/api/customer/autofix/reconnect` | `\…\Customer\AutoFix\Controllers\AutoFixController::reconnectPPPoE` | `zapijwt zapirole cors maintenance tenantresolve trafficstart` |
| `POST` | `/api/customer/autofix/flush-dns` | `\…\Customer\AutoFix\Controllers\AutoFixController::flushDNS` | `zapijwt zapirole cors maintenance tenantresolve trafficstart` |
| `POST` | `/api/customer/autofix/reset-session` | `\…\Customer\AutoFix\Controllers\AutoFixController::resetSession` | `zapijwt zapirole cors maintenance tenantresolve trafficstart` |
| `POST` | `/api/customer/autofix/quick-fix` | `\…\Customer\AutoFix\Controllers\AutoFixController::quickFix` | `zapijwt zapirole cors maintenance tenantresolve trafficstart` |
| `POST` | `/api/customer/router-control/reboot` | `\…\Customer\RouterControl\Controllers\RouterControlController::reboot` | `zapijwt zapirole cors maintenance tenantresolve trafficstart` |
| `POST` | `/api/customer/router-control/wifi` | `\…\Customer\RouterControl\Controllers\RouterControlController::changeWifi` | `zapijwt zapirole cors maintenance tenantresolve trafficstart` |
| `POST` | `/api/customer/router-control/onboard-tr069` | `\…\Customer\RouterControl\Controllers\RouterControlController::onboardTr069` | `zapijwt zapirole cors maintenance tenantresolve trafficstart` |
| `POST` | `/api/customer/notifications/read` | `\…\Customer\Notification\Controllers\NotificationController::markAsRead` | `zapijwt zapirole cors maintenance tenantresolve trafficstart` |
