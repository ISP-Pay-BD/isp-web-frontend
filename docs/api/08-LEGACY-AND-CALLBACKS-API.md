# 08. Legacy & Webhook Callbacks API

> External payment gateway webhooks (bKash, Nagad, SSLCommerz, Aamarpay), SMS delivery reports, and legacy compatibility endpoints.

**Total Endpoints:** 48

## Endpoint List

| Method | Route | Controller & Action | Filters |
|---|---|---|---|
| `GET` | `/api/v1/features` | `\…\Common\Feature\Controllers\FeatureController::index` | `zapijwt cors maintenance tenantresolve trafficstart` |
| `GET` | `/api/v1/features/([^/]+)` | `\…\Common\Feature\Controllers\FeatureController::get/$1` | `zapijwt cors maintenance tenantresolve trafficstart` |
| `GET` | `/api/docs` | `\…\Common\SwaggerUi\Controllers\DocsController::index` | `cors maintenance tenantresolve authcheck` |
| `GET` | `/api/docs/swagger.json` | `\…\Common\SwaggerUi\Controllers\DocsController::swagger` | `cors maintenance tenantresolve authcheck` |
| `GET` | `/api/docs/swagger-ui/(.*)` | `\…\Common\SwaggerUi\Controllers\DocsController::asset/$1` | `cors maintenance tenantresolve authcheck` |
| `GET` | `/api/monitor/traffic` | `\…\Monitor\Traffic\Controllers\TrafficMonitorController::traffic` | `cors maintenance tenantresolve trafficstart authcheck` |
| `GET` | `/api/monitor/overview` | `\…\Monitor\Traffic\Controllers\TrafficMonitorController::overview` | `cors maintenance tenantresolve trafficstart authcheck` |
| `GET` | `/api/monitor/top-endpoints` | `\…\Monitor\Traffic\Controllers\TrafficMonitorController::topEndpoints` | `cors maintenance tenantresolve trafficstart authcheck` |
| `GET` | `/api/monitor/timeline` | `\…\Monitor\Traffic\Controllers\TrafficMonitorController::timeline` | `cors maintenance tenantresolve trafficstart authcheck` |
| `GET` | `/api/monitor/recent` | `\…\Monitor\Traffic\Controllers\TrafficMonitorController::recent` | `cors maintenance tenantresolve trafficstart authcheck` |
| `GET` | `/api/monitor/snapshot` | `\…\Monitor\Traffic\Controllers\TrafficMonitorController::snapshot` | `cors maintenance tenantresolve trafficstart authcheck` |
| `GET` | `/api/monitor/flush-queue` | `\…\Monitor\Traffic\Controllers\TrafficMonitorController::flushQueue` | `cors maintenance tenantresolve trafficstart` |
| `GET` | `/api/monitor/retention-cleanup` | `\…\Monitor\Traffic\Controllers\TrafficMonitorController::retentionCleanup` | `cors maintenance tenantresolve trafficstart` |
| `GET` | `/api/users-load-traffic/([0-9]+)` | `\…\Customer\User\Controllers\RouterTrafficController::UsersloadTraffic_api/$1` | `zapijwt zapirole cors maintenance tenantresolve trafficstart` |
| `GET` | `/api/internal/whatsapp/account-by-phone-id/([^/]+)` | `\App\Controllers\WhatsAppInternal::accountByPhoneId/$1` | `cors maintenance tenantresolve trafficstart` |
| `GET` | `/api/internal/whatsapp/account-by-verify-token` | `\App\Controllers\WhatsAppInternal::accountByVerifyToken` | `cors maintenance tenantresolve trafficstart` |
| `GET` | `/api/internal/whatsapp/account-by-session` | `\App\Controllers\WhatsAppInternal::accountBySession` | `cors maintenance tenantresolve trafficstart` |
| `GET` | `/api/internal/whatsapp/account-by-admin` | `\App\Controllers\WhatsAppInternal::accountByAdmin` | `cors maintenance tenantresolve trafficstart` |
| `GET` | `/api/internal/whatsapp/service-token` | `\App\Controllers\WhatsAppInternal::serviceToken` | `cors maintenance tenantresolve trafficstart` |
| `GET` | `/reward-center` | `\…\Shared\Rewards\Controllers\RewardWebController::index` | `authcheck cors maintenance tenantresolve csrf trafficstart` |
| `GET` | `/my-rewards` | `\…\Customer\RewardPortal\Controllers\CustomerRewardPortalController::index` | `authcheck cors maintenance tenantresolve csrf trafficstart` |
| `GET` | `/my-rewards/redeem-preview` | `\…\Customer\RewardPortal\Controllers\CustomerRewardPortalController::redeemPreview` | `authcheck cors maintenance tenantresolve csrf trafficstart` |
| `GET` | `/register` | `\…\Common\Registration\Controllers\ReferralRegistrationWebController::index` | `cors maintenance tenantresolve csrf trafficstart` |
| `GET` | `/api/dashboard/sadmin-data` | `\App\Controllers\Dashboard::sadminData` | `authcheck cors maintenance tenantresolve trafficstart` |
| `GET` | `/api/dashboard/sadmin-charts-data` | `\App\Controllers\Dashboard::sadminChartsData` | `authcheck cors maintenance tenantresolve trafficstart` |
| `GET` | `/api/movieservers` | `\App\Controllers\MovieNewsApiController::movieIndex` | `authcheck cors maintenance tenantresolve trafficstart` |
| `GET` | `/api/movieservers/view/([0-9]+)` | `\App\Controllers\MovieNewsApiController::movieView/$1` | `authcheck cors maintenance tenantresolve trafficstart` |
| `GET` | `/api/movieservers/delete/([0-9]+)` | `\App\Controllers\MovieNewsApiController::movieDelete/$1` | `authcheck cors maintenance tenantresolve trafficstart` |
| `GET` | `/api/news` | `\App\Controllers\MovieNewsApiController::newsIndex` | `authcheck cors maintenance tenantresolve trafficstart` |
| `GET` | `/api/news/view/([0-9]+)` | `\App\Controllers\MovieNewsApiController::newsView/$1` | `authcheck cors maintenance tenantresolve trafficstart` |
| `GET` | `/api/news/delete/([0-9]+)` | `\App\Controllers\MovieNewsApiController::newsDelete/$1` | `authcheck cors maintenance tenantresolve trafficstart` |
| `GET` | `/api/bkash/get_bkash_sendmoney` | `\App\Controllers\Bkash_webhook::get_bkash_sendmoney` | `cors maintenance tenantresolve trafficstart` |
| `POST` | `/api/chat` | `\App\Controllers\AiChatController::aiChat` | `cors maintenance tenantresolve trafficstart` |
| `POST` | `/api/bkash/webhook` | `\…\Common\BkashWebhook\Controllers\BkashWebhookController::Test` | `cors maintenance tenantresolve trafficstart` |
| `POST` | `/api/bkash/get_bkash_sendmoney` | `\…\Common\BkashWebhook\Controllers\BkashWebhookController::get_bkash_sendmoney` | `cors maintenance tenantresolve trafficstart` |
| `POST` | `/api/internal/whatsapp/notify-escalation` | `\App\Controllers\WhatsAppInternal::notifyEscalation` | `cors maintenance tenantresolve trafficstart` |
| `POST` | `/api/internal/whatsapp/log-message` | `\App\Controllers\WhatsAppInternal::logMessage` | `cors maintenance tenantresolve trafficstart` |
| `POST` | `/api/internal/whatsapp/marketing-opt-out` | `\App\Controllers\WhatsAppInternal::marketingOptOut` | `cors maintenance tenantresolve trafficstart` |
| `POST` | `/reward-center/referrals/([0-9]+)/approve` | `\…\Shared\Rewards\Controllers\RewardWebController::approve/$1` | `authcheck cors maintenance tenantresolve csrf trafficstart` |
| `POST` | `/reward-center/referrals/([0-9]+)/reject` | `\…\Shared\Rewards\Controllers\RewardWebController::reject/$1` | `authcheck cors maintenance tenantresolve csrf trafficstart` |
| `POST` | `/reward-center/config` | `\…\Shared\Rewards\Controllers\RewardWebController::saveConfig` | `authcheck cors maintenance tenantresolve csrf trafficstart` |
| `POST` | `/register/submit` | `\…\Common\Registration\Controllers\ReferralRegistrationWebController::submit` | `cors maintenance tenantresolve csrf trafficstart` |
| `POST` | `/api/movieservers/add` | `\App\Controllers\MovieNewsApiController::movieAdd` | `authcheck cors maintenance tenantresolve trafficstart` |
| `POST` | `/api/movieservers/update/([0-9]+)` | `\App\Controllers\MovieNewsApiController::movieUpdate/$1` | `authcheck cors maintenance tenantresolve trafficstart` |
| `POST` | `/api/news/add` | `\App\Controllers\MovieNewsApiController::newsAdd` | `authcheck cors maintenance tenantresolve trafficstart` |
| `POST` | `/api/news/update/([0-9]+)` | `\App\Controllers\MovieNewsApiController::newsUpdate/$1` | `authcheck cors maintenance tenantresolve trafficstart` |
| `OPTIONS` | `/api/(.*)` | `(Closure)` | `cors maintenance tenantresolve trafficstart` |
