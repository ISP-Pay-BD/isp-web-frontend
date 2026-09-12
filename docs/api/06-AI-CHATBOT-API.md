# 06. AI Assistant & Chatbot API

> AI lead generation, automated customer service assistant, context ingestion, and chatbot webhook tools.

**Total Endpoints:** 33

## Endpoint List

| Method | Route | Controller & Action | Filters |
|---|---|---|---|
| `GET` | `/api/monitor/maintain-queue` | `\…\Monitor\Traffic\Controllers\TrafficMonitorController::maintainQueue` | `cors maintenance tenantresolve trafficstart` |
| `GET` | `/api/internal/ai/user-profile` | `\…\Ai\Controllers\AiInternalController::userProfile` | `cors maintenance tenantresolve trafficstart` |
| `GET` | `/api/internal/ai/admin-overview` | `\…\Ai\Controllers\AiInternalController::adminOverview` | `cors maintenance tenantresolve trafficstart` |
| `GET` | `/api/internal/ai/admin-performance` | `\…\Ai\Controllers\AiInternalController::adminPerformance` | `cors maintenance tenantresolve trafficstart` |
| `GET` | `/api/internal/ai/tenant-detail` | `\…\Ai\Controllers\AiInternalController::tenantDetail` | `cors maintenance tenantresolve trafficstart` |
| `GET` | `/api/internal/ai/employee-overview` | `\…\Ai\Controllers\AiInternalController::employeeOverview` | `cors maintenance tenantresolve trafficstart` |
| `GET` | `/api/internal/ai/employee-tickets` | `\…\Ai\Controllers\AiInternalController::employeeTickets` | `cors maintenance tenantresolve trafficstart` |
| `GET` | `/api/internal/ai/public-packages` | `\…\Ai\Controllers\AiInternalController::publicPackages` | `cors maintenance tenantresolve trafficstart` |
| `GET` | `/api/internal/ai/tenants` | `\…\Ai\Controllers\AiInternalController::tenants` | `cors maintenance tenantresolve trafficstart` |
| `GET` | `/api/internal/ai/movie-servers` | `\…\Ai\Controllers\AiInternalController::movieServers` | `cors maintenance tenantresolve trafficstart` |
| `GET` | `/api/internal/ai/ping` | `\…\Ai\Controllers\AiInternalController::pingCustomer` | `cors maintenance tenantresolve trafficstart` |
| `GET` | `/api/internal/ai/diagnose` | `\…\Ai\Controllers\AiInternalController::diagnoseNetwork` | `cors maintenance tenantresolve trafficstart` |
| `GET` | `/zapi/internal/ai/user-profile` | `\…\Ai\Controllers\AiInternalController::userProfile` | `cors maintenance tenantresolve trafficstart` |
| `GET` | `/zapi/internal/ai/admin-overview` | `\…\Ai\Controllers\AiInternalController::adminOverview` | `cors maintenance tenantresolve trafficstart` |
| `GET` | `/zapi/internal/ai/admin-performance` | `\…\Ai\Controllers\AiInternalController::adminPerformance` | `cors maintenance tenantresolve trafficstart` |
| `GET` | `/zapi/internal/ai/tenant-detail` | `\…\Ai\Controllers\AiInternalController::tenantDetail` | `cors maintenance tenantresolve trafficstart` |
| `GET` | `/zapi/internal/ai/employee-overview` | `\…\Ai\Controllers\AiInternalController::employeeOverview` | `cors maintenance tenantresolve trafficstart` |
| `GET` | `/zapi/internal/ai/employee-tickets` | `\…\Ai\Controllers\AiInternalController::employeeTickets` | `cors maintenance tenantresolve trafficstart` |
| `GET` | `/zapi/internal/ai/public-packages` | `\…\Ai\Controllers\AiInternalController::publicPackages` | `cors maintenance tenantresolve trafficstart` |
| `GET` | `/zapi/internal/ai/tenants` | `\…\Ai\Controllers\AiInternalController::tenants` | `cors maintenance tenantresolve trafficstart` |
| `GET` | `/zapi/internal/ai/movie-servers` | `\…\Ai\Controllers\AiInternalController::movieServers` | `cors maintenance tenantresolve trafficstart` |
| `GET` | `/zapi/internal/ai/ping` | `\…\Ai\Controllers\AiInternalController::pingCustomer` | `cors maintenance tenantresolve trafficstart` |
| `GET` | `/zapi/internal/ai/diagnose` | `\…\Ai\Controllers\AiInternalController::diagnoseNetwork` | `cors maintenance tenantresolve trafficstart` |
| `POST` | `/api/internal/ai/leads` | `\…\Ai\Controllers\AiInternalController::leads` | `cors maintenance tenantresolve trafficstart` |
| `POST` | `/api/internal/ai/autofix/reboot` | `\…\Ai\Controllers\AiInternalController::autofixReboot` | `cors maintenance tenantresolve trafficstart` |
| `POST` | `/api/internal/ai/autofix/reconnect` | `\…\Ai\Controllers\AiInternalController::autofixReconnect` | `cors maintenance tenantresolve trafficstart` |
| `POST` | `/api/internal/ai/autofix/flush-dns` | `\…\Ai\Controllers\AiInternalController::autofixFlushDns` | `cors maintenance tenantresolve trafficstart` |
| `POST` | `/api/internal/ai/autofix/reset-session` | `\…\Ai\Controllers\AiInternalController::autofixResetSession` | `cors maintenance tenantresolve trafficstart` |
| `POST` | `/zapi/internal/ai/leads` | `\…\Ai\Controllers\AiInternalController::leads` | `cors maintenance tenantresolve trafficstart` |
| `POST` | `/zapi/internal/ai/autofix/reboot` | `\…\Ai\Controllers\AiInternalController::autofixReboot` | `cors maintenance tenantresolve trafficstart` |
| `POST` | `/zapi/internal/ai/autofix/reconnect` | `\…\Ai\Controllers\AiInternalController::autofixReconnect` | `cors maintenance tenantresolve trafficstart` |
| `POST` | `/zapi/internal/ai/autofix/flush-dns` | `\…\Ai\Controllers\AiInternalController::autofixFlushDns` | `cors maintenance tenantresolve trafficstart` |
| `POST` | `/zapi/internal/ai/autofix/reset-session` | `\…\Ai\Controllers\AiInternalController::autofixResetSession` | `cors maintenance tenantresolve trafficstart` |
