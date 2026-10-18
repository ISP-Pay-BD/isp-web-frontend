# Phase 8 — ISP Engines Suite Integration (Section J)

> Covers all 20+ Engine groups (Automation, Provisioning, Network Events, CRM, etc.) which act as advanced operational features for ISPs.

---

## 1. Scope & Objective
The ISP Engines suite (screens J0–J23) contains over 300 named features currently functioning via a static mock catalog (`src/data/admin/engines.catalog.ts`). In Phase 8, these will be backed by a new set of dynamic `zapi` controllers.

---

## 2. Backend Module: `zapi/Modules/Engines/`

Due to the massive scope of the engines, the backend will expose a unified dynamic registry endpoint, plus specific CRUD endpoints for active engine records.

### 2.1 Engine Registry & Metadata
* `GET /api/v1/engines/catalog` — Returns the full feature hierarchy, pricing, and activation status for the current reseller.
* `POST /api/v1/engines/activate/{engineId}` — Activate a specific engine module for a tenant.

### 2.2 Core Engine Sub-Controllers (To Be Built)
| Engine Group | Backend Controller | Purpose |
|---|---|---|
| Automation / Workflow | `EngineAutomationApiController.php` | Trigger-based workflows and auto-reconciliation. |
| Service Provisioning | `EngineProvisioningApiController.php` | Zero-touch provisioning and ACS integration. |
| Network Events | `EngineNetworkApiController.php` | Outage detection, BGP monitoring. |
| Customer Lifecycle | `EngineLifecycleApiController.php` | Dunning, churn prediction, onboarding. |
| Installation Mgmt | `EngineInstallationApiController.php` | Field technician dispatch and scheduling. |
| CRM / Sales | `EngineCrmApiController.php` | Lead pipeline, quoting, and SLA tracking. |

*(This pattern repeats for all 20 engine groups: Accounting-X, Security, Backup/DR, AI Platform, CX, Inventory-X, Reporting/BI, etc.)*

---

## 3. Frontend Integration Plan

### 3.1 Service & Adapter
* `src/lib/api/services/engines.service.ts`
* `src/lib/api/adapters/engines.adapter.ts`

### 3.2 Dynamic Engine UI
Instead of building 300 individual pages, the frontend `src/features/admin/engines/` uses a dynamic rendering engine based on the catalog schema.
1. Wire `useEngineCatalogQuery` to fetch available engines from backend.
2. Wire `useEngineActionMutation` for standardized engine actions (e.g., "Run Diagnostics", "Generate Report").
3. Wire `useEngineLogsQuery` for the unified audit trail of engine operations.

### 3.3 Target Screens
* `/admin/engines` (Index)
* `/admin/engines/[group-slug]` (e.g., `/admin/engines/automation`)
* `/platform/engines/*` (Super-admin global engine management)
