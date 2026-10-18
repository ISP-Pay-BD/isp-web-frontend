# 04. Platform SuperAdmin API

> Multi-tenant SaaS management: Platform statistics, tenant provisioning, subscription billing, and platform health.

**Total Endpoints:** 12

## Endpoint List

| Method | Route | Controller & Action | Filters |
|---|---|---|---|
| `GET` | `/api/v1/platform/stats` | `\…\Platform\Controllers\PlatformApiController::stats` | `zapijwt cors maintenance tenantresolve trafficstart` |
| `GET` | `/api/v1/platform/tenants` | `\…\Platform\Controllers\PlatformApiController::tenants` | `zapijwt cors maintenance tenantresolve trafficstart` |
| `GET` | `/api/v1/platform/subscriptions` | `\…\Platform\Controllers\PlatformApiController::subscriptions` | `zapijwt cors maintenance tenantresolve trafficstart` |
| `GET` | `/api/v1/platform/system-health` | `\…\Platform\Controllers\PlatformApiController::systemHealth` | `zapijwt cors maintenance tenantresolve trafficstart` |
| `GET` | `/api/internal/ai/platform-health` | `\…\Ai\Controllers\AiInternalController::platformHealth` | `cors maintenance tenantresolve trafficstart` |
| `GET` | `/api/internal/ai/platform-revenue` | `\…\Ai\Controllers\AiInternalController::platformRevenue` | `cors maintenance tenantresolve trafficstart` |
| `GET` | `/api/internal/ai/platform-churn` | `\…\Ai\Controllers\AiInternalController::platformChurn` | `cors maintenance tenantresolve trafficstart` |
| `GET` | `/zapi/internal/ai/platform-health` | `\…\Ai\Controllers\AiInternalController::platformHealth` | `cors maintenance tenantresolve trafficstart` |
| `GET` | `/zapi/internal/ai/platform-revenue` | `\…\Ai\Controllers\AiInternalController::platformRevenue` | `cors maintenance tenantresolve trafficstart` |
| `GET` | `/zapi/internal/ai/platform-churn` | `\…\Ai\Controllers\AiInternalController::platformChurn` | `cors maintenance tenantresolve trafficstart` |
| `POST` | `/api/v1/platform/tenants` | `\…\Platform\Controllers\PlatformApiController::createTenant` | `zapijwt cors maintenance tenantresolve trafficstart` |
| `PATCH` | `/api/v1/platform/tenants/([^/]+)/status` | `\…\Platform\Controllers\PlatformApiController::updateTenantStatus/$1` | `zapijwt cors maintenance tenantresolve trafficstart` |
