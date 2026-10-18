# 05. Engines Suite & Extended Services API

> OLT synchronization, MikroTik Hotspot vouchers, Inventory management, Business reports, and Engine suite orchestration.

## Endpoint List

| Method | Route | Controller & Action | Filters |
|---|---|---|---|
| `GET` | `/api/v1/engines/catalog` | `\…\Engines\Controllers\EnginesApiController::catalog` | `zapijwt cors maintenance tenantresolve trafficstart` |
| `GET` | `/api/v1/engines/instances` | `\…\Engines\Controllers\EnginesApiController::instances` | `zapijwt cors maintenance tenantresolve trafficstart` |
| `GET` | `/api/common/hotspot-detect.html` | `\…\Common\CaptivePortal\Controllers\CaptivePortalController::index` | `zapijwt cors maintenance tenantresolve trafficstart` |
| `POST` | `/api/v1/engines/instances/deploy` | `\…\Engines\Controllers\EnginesApiController::deploy` | `zapijwt cors maintenance tenantresolve trafficstart` |
| `POST` | `/api/v1/engines/instances/([^/]+)/action` | `\…\Engines\Controllers\EnginesApiController::action/$1` | `zapijwt cors maintenance tenantresolve trafficstart` |
