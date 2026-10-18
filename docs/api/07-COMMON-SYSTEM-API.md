# 07. Common & System Services API

> Invoices print/PDF generation, subscriber data usage sync, background cron jobs, and health check endpoints.

**Total Endpoints:** 30

## Endpoint List

| Method | Route | Controller & Action | Filters |
|---|---|---|---|
| `GET` | `/api/dashboard/bandwidth-usage/(.*)` | `\App\Controllers\Dashboard::bandwidthUsage/$1` | `cors maintenance tenantresolve trafficstart` |
| `GET` | `/api/common/referral/validate/([^/]+)` | `\…\Common\Registration\Controllers\RegistrationController::validateCode/$1` | `cors maintenance tenantresolve trafficstart` |
| `GET` | `/api/common/current-user` | `\…\Common\Auth\Controllers\AuthController::currentUser` | `zapijwt cors maintenance tenantresolve trafficstart` |
| `GET` | `/api/common/pppoe-expiry-check` | `\…\Common\Common\Controllers\CommonController::pppoeExpiryCheck` | `zapijwt cors maintenance tenantresolve trafficstart` |
| `GET` | `/api/common/captive-portal` | `\…\Common\CaptivePortal\Controllers\CaptivePortalController::index` | `zapijwt cors maintenance tenantresolve trafficstart` |
| `GET` | `/api/common/generate_204` | `\…\Common\CaptivePortal\Controllers\CaptivePortalController::index` | `zapijwt cors maintenance tenantresolve trafficstart` |
| `GET` | `/api/common/connecttest.txt` | `\…\Common\CaptivePortal\Controllers\CaptivePortalController::index` | `zapijwt cors maintenance tenantresolve trafficstart` |
| `GET` | `/api/common/ncsi.txt` | `\…\Common\CaptivePortal\Controllers\CaptivePortalController::index` | `zapijwt cors maintenance tenantresolve trafficstart` |
| `GET` | `/api/common/exhome` | `\…\Common\Auth\Controllers\AuthController::exhome` | `zapijwt cors maintenance tenantresolve trafficstart` |
| `GET` | `/api/common/movieservers` | `\…\Common\Common\Controllers\CommonController::movie_index` | `zapijwt cors maintenance tenantresolve trafficstart` |
| `GET` | `/api/common/movieservers/view/([0-9]+)` | `\…\Common\Common\Controllers\CommonController::view/$1` | `zapijwt cors maintenance tenantresolve trafficstart` |
| `GET` | `/api/common/movieservers/delete/([0-9]+)` | `\…\Common\Common\Controllers\CommonController::delete/$1` | `zapijwt cors maintenance tenantresolve trafficstart` |
| `GET` | `/api/common/news` | `\…\Common\Common\Controllers\CommonController::news_index` | `zapijwt cors maintenance tenantresolve trafficstart` |
| `GET` | `/api/common/news/view/([0-9]+)` | `\…\Common\Common\Controllers\CommonController::news_view/$1` | `zapijwt cors maintenance tenantresolve trafficstart` |
| `GET` | `/api/common/news/delete/([0-9]+)` | `\…\Common\Common\Controllers\CommonController::news_delete/$1` | `zapijwt cors maintenance tenantresolve trafficstart` |
| `GET` | `/api/cron/reward-reconcile` | `\…\Cron\Controllers\CronController::reconcileRewards` | `cors maintenance tenantresolve trafficstart` |
| `GET` | `/api/cron/reward-release-holds` | `\…\Cron\Controllers\CronController::releaseHolds` | `cors maintenance tenantresolve trafficstart` |
| `GET` | `/api/cron/reward-expire-points` | `\…\Cron\Controllers\CronController::expirePoints` | `cors maintenance tenantresolve trafficstart` |
| `GET` | `/api/cron/reward-loyalty` | `\…\Cron\Controllers\CronController::loyalty` | `cors maintenance tenantresolve trafficstart` |
| `GET` | `/api/cron/reward-birthday` | `\…\Cron\Controllers\CronController::birthday` | `cors maintenance tenantresolve trafficstart` |
| `POST` | `/api/common/login` | `\…\Common\Auth\Controllers\AuthController::validateLogin` | `cors maintenance tenantresolve trafficstart` |
| `POST` | `/api/common/check-user` | `\…\Common\Auth\Controllers\AuthController::checkUserExists` | `cors maintenance tenantresolve trafficstart` |
| `POST` | `/api/common/refresh` | `\…\Common\Auth\Controllers\AuthController::refreshToken` | `cors maintenance tenantresolve trafficstart` |
| `POST` | `/api/common/register` | `\…\Common\Registration\Controllers\RegistrationController::register` | `cors maintenance tenantresolve trafficstart` |
| `POST` | `/api/common/bkash/get_bkash_sendmoney` | `\App\Controllers\Bkash_webhook::get_bkash_sendmoney` | `cors maintenance tenantresolve trafficstart` |
| `POST` | `/api/common/movieservers/add` | `\…\Common\Common\Controllers\CommonController::add` | `zapijwt cors maintenance tenantresolve trafficstart` |
| `POST` | `/api/common/movieservers/update/([0-9]+)` | `\…\Common\Common\Controllers\CommonController::update/$1` | `zapijwt cors maintenance tenantresolve trafficstart` |
| `POST` | `/api/common/news/add` | `\…\Common\Common\Controllers\CommonController::news_add` | `zapijwt cors maintenance tenantresolve trafficstart` |
| `POST` | `/api/common/news/update/([0-9]+)` | `\…\Common\Common\Controllers\CommonController::news_update/$1` | `zapijwt cors maintenance tenantresolve trafficstart` |
| `POST` | `/api/common/news/news_view_update/([0-9]+)` | `\…\Common\Common\Controllers\CommonController::news_view_update/$1` | `zapijwt cors maintenance tenantresolve trafficstart` |
