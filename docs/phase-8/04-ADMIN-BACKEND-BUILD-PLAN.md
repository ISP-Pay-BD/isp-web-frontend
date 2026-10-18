# Phase 8 — Missing Backend Endpoints Build Plan (`zapi`)

---

## 1. Scope & Objective
Define the required new REST controllers and routes in `isppaybd_isp/zapi/Modules/Reseller/` to provide 100% backend API coverage for remaining admin features.

---

## 2. New Backend Modules to Create in `zapi`

### 2.1 Package Management (`zapi/Modules/Reseller/Controllers/PackageApiController.php`)
* `POST /api/v1/reseller/packages/{resellerId}` — Create ISP bandwidth package.
* `PUT /api/v1/reseller/packages/{resellerId}/{packageId}` — Update bandwidth, validity, and pricing.
* `GET /api/v1/reseller/packages/{resellerId}/{packageId}` — Package detail view.

### 2.2 OLT & Fiber Management (`zapi/Modules/Reseller/Controllers/OltApiController.php`)
* `GET /api/v1/reseller/olts/{resellerId}` — List registered OLTs (BDCOM, VSOL, Huawei, ZTE).
* `POST /api/v1/reseller/olts/{resellerId}` — Add new OLT with Telnet/SNMP credentials.
* `GET /api/v1/reseller/olts/{resellerId}/{oltId}/onus` — Real-time optical power (Rx/Tx dBm) and ONU list.
* `POST /api/v1/reseller/olts/{resellerId}/{oltId}/reboot-onu` — Remote ONU restart.

### 2.3 Hotspot & Bandwidth Shaping (`zapi/Modules/Reseller/Controllers/HotspotApiController.php`)
* `GET /api/v1/reseller/hotspot/profiles/{resellerId}` — Hotspot user profiles.
* `POST /api/v1/reseller/hotspot/vouchers/generate` — Bulk voucher code generation.
* `GET /api/v1/reseller/bandwidth/queues/{resellerId}` — Simple Queues & Queue Trees.

### 2.4 Inventory & Purchase Requisitions (`zapi/Modules/Reseller/Controllers/InventoryApiController.php`)
* `GET/POST/PUT/DELETE /api/v1/reseller/inventory/items/{resellerId}` — Item catalog (Routers, Fiber, Patch cords, ONU).
* `GET/POST /api/v1/reseller/inventory/stock-in/{resellerId}` — Warehouse stock-in.
* `GET/POST /api/v1/reseller/inventory/requisitions/{resellerId}` — Staff equipment requisitions.

### 2.5 Reports & BTRC Compliance (`zapi/Modules/Reseller/Controllers/ReportApiController.php`)
* `GET /api/v1/reseller/reports/btrc/{resellerId}` — Official BTRC monthly compliance format.
* `GET /api/v1/reseller/reports/revenue/{resellerId}` — Monthly & annual billing analysis.
* `GET /api/v1/reseller/reports/tax-vat/{resellerId}` — VAT/AIT tax reports.

### 2.6 WhatsApp Gateway & Notification Config (`zapi/Modules/Reseller/Controllers/WhatsAppApiController.php`)
* `GET/PUT /api/v1/reseller/whatsapp/settings/{resellerId}` — UltraMsg / Cloud API credentials.
* `POST /api/v1/reseller/whatsapp/send/{resellerId}` — Send automated bill alert via WhatsApp.

### 2.7 System Settings & Branding (`zapi/Modules/Reseller/Controllers/SettingsApiController.php`)
* `GET/PUT /api/v1/reseller/settings/general/{resellerId}` — Currency, timezone, billing cycle defaults.
* `GET/PUT /api/v1/reseller/settings/sms-templates/{resellerId}` — Customizable SMS templates.
