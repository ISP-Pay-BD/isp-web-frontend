# 03. Phase-by-Phase Implementation Checklist

> Interactive checklist for migrating all screens from mock data to live backend APIs.

---

### [ ] Phase 8.1: Network & MikroTik Live Controls
- [ ] Connect Bandwidth Live Graph (`/admin/bandwidth`) → `GET /api/v1/reseller/routers/{id}/traffic`
- [ ] Connect Active PPPoE Sessions (`/admin/network/sessions`) → `GET /api/v1/reseller/routers/{id}/sessions`
- [ ] Connect Disconnect PPPoE Session Action → `POST /api/v1/reseller/routers/{id}/disconnect`
- [ ] Connect DHCP Leases Table (`/admin/network/dhcp`) → `GET /api/v1/reseller/routers/{id}/dhcp-leases`
- [ ] Connect Simple Queues Bandwidth Throttles (`/admin/network/queues`) → `GET /api/v1/reseller/routers/{id}/queues`

---

### [ ] Phase 8.2: Billing, Invoices PDF & Telecom Compliance
- [ ] Connect Invoice PDF Viewer & Download → `GET /api/v1/reseller/invoices/{id}/pdf`
- [ ] Connect BTRC Telecom Compliance Monthly Report → `GET /api/v1/reseller/reports/btrc/{id}`
- [ ] Connect Revenue Breakdown Report → `GET /api/v1/reseller/reports/revenue/{id}`
- [ ] Connect Corporate Enterprise Billing Invoices → `GET /api/v1/reseller/corporate/{id}/invoices`
- [ ] Connect Bank Reconciliation Ledgers → `GET /api/v1/reseller/accounting/{id}/reconciliation`

---

### [ ] Phase 8.3: Inventory & Hardware Asset Management
- [ ] Connect Inventory Items Stock Table → `GET/POST /api/v1/reseller/inventory/{id}`
- [ ] Connect Supplier Purchase Orders List & Create → `GET/POST /api/v1/reseller/purchase/{id}`
- [ ] Connect Stock Transfer & Tech Assignment → `GET/POST /api/v1/reseller/inventory/{id}/transfers`

---

### [ ] Phase 8.4: OLT Optical Power (PON) & Hotspot Suite
- [ ] Connect OLT Devices Registry → `GET /api/v1/reseller/olt/{id}`
- [ ] Connect PON Port & ONU Optical Signal (dBm) → `GET /api/v1/reseller/olt/{id}/optical-power`
- [ ] Connect Hotspot Server Profile → `GET /api/v1/reseller/hotspot/{id}`
- [ ] Connect Hotspot Voucher Batch Generator → `POST /api/v1/reseller/hotspot/vouchers/{id}/batch`
- [ ] Connect Voucher Printable Sheet View → `GET /api/v1/reseller/hotspot/vouchers/{id}/print`

---

### [ ] Phase 8.5: Staff Attendance & GPS Punch
- [ ] Connect Employee Check-In / Check-Out Punch → `POST /api/v1/reseller/employees/{id}/attendance/check-in`
- [ ] Connect Employee GPS Location Logger → `POST /api/v1/reseller/employees/{id}/attendance/location`
- [ ] Connect Monthly Salary Calculation Sheet → `GET /api/v1/reseller/employee-payments/{id}/salary-summary`
- [ ] Connect Staff Leave Applications & Approvals → `GET/POST /api/v1/reseller/employees/{id}/leaves`

---

### [ ] Phase 8.6: SMS, Voice OTP & WhatsApp Business
- [ ] Connect SMS Templates Editor with Variable Tags → `GET/POST /api/v1/reseller/sms/{id}/templates`
- [ ] Connect Voice OTP Automated Dispatcher → `POST /api/v1/reseller/voice-sms/{id}/broadcast`
- [ ] Connect WhatsApp Bot Connection & QR Session → `GET /api/v1/reseller/whatsapp/settings/{id}`
- [ ] Connect WhatsApp Message Automation Templates → `GET/POST /api/v1/reseller/whatsapp/{id}/templates`

---

### [ ] Phase 8.7: AI Chatbot Assistant & Diagnostics
- [ ] Connect Live Admin AI Assistant Chat Panel → `POST /api/v1/ai/query`
- [ ] Connect Automated Customer Query Triage → `GET/POST /api/internal/ai/leads`
- [ ] Connect AI Router Fault Diagnostic Engine → `GET /api/internal/ai/diagnose`

---

### [ ] Phase 8.8: Extra Modern Modules (New Backend Endpoints)
- [ ] Field Work Orders & Tech Dispatch (`isp-ops`) → `GET/POST /api/v1/reseller/work-orders`
- [ ] Soft-Deleted Trash & Restore (`recycle-bin`) → `GET/POST /api/v1/reseller/trash/...`
- [ ] Wholesale POP Bandwidth Profiles (`pop-packages`) → `GET/POST /api/v1/reseller/pop-packages`
- [ ] Customer Hardware Store Showcase (`product-showcase`) → `GET /api/v1/customer/store/products`
