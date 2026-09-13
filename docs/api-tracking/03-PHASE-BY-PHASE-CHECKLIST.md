# 03. Phase-by-Phase Implementation Checklist

> Interactive checklist for migrating all screens from mock data to live backend APIs.

---

### [x] Phase 8.1: Network & MikroTik Live Controls
- [x] Connect Bandwidth Live Graph (`/admin/bandwidth`) → `GET /api/v1/reseller/routers/{id}/traffic`
- [x] Connect Active PPPoE Sessions (`/admin/network/sessions`) → `GET /api/v1/reseller/routers/{id}/sessions`
- [x] Connect Disconnect PPPoE Session Action → `POST /api/v1/reseller/routers/{id}/disconnect`
- [x] Connect DHCP Leases Table (`/admin/network/dhcp`) → `GET /api/v1/reseller/routers/{id}/dhcp-leases`
- [x] Connect Simple Queues Bandwidth Throttles (`/admin/network/queues`) → `GET /api/v1/reseller/routers/{id}/queues`

---

### [x] Phase 8.2: Billing, Invoices PDF & Telecom Compliance
- [x] Connect Invoice PDF Viewer & Download → `GET /api/v1/reseller/invoices/{id}/pdf`
- [x] Connect BTRC Telecom Compliance Monthly Report → `GET /api/v1/reseller/reports/btrc/{id}`
- [x] Connect Revenue Breakdown Report → `GET /api/v1/reseller/reports/revenue/{id}`
- [x] Connect Corporate Enterprise Billing Invoices → `GET /api/v1/reseller/corporate/{id}/invoices`
- [x] Connect Bank Reconciliation Ledgers → `GET /api/v1/reseller/accounting/{id}/reconciliation`

---

### [x] Phase 8.3: Inventory & Hardware Asset Management
- [x] Connect Inventory Items Stock Table → `GET/POST /api/v1/reseller/inventory/{id}`
- [x] Connect Supplier Purchase Orders List & Create → `GET/POST /api/v1/reseller/purchase/{id}`
- [x] Connect Stock Transfer & Tech Assignment → `GET/POST /api/v1/reseller/inventory/{id}/transfers`

---

### [x] Phase 8.4: OLT Optical Power (PON) & Hotspot Suite
- [x] Connect OLT Devices Registry → `GET /api/v1/reseller/olt/{id}`
- [x] Connect PON Port & ONU Optical Signal (dBm) → `GET /api/v1/reseller/olt/{id}/optical-power`
- [x] Connect Hotspot Server Profile → `GET /api/v1/reseller/hotspot/{id}`
- [x] Connect Hotspot Voucher Batch Generator → `POST /api/v1/reseller/hotspot/vouchers/{id}/batch`
- [x] Connect Voucher Printable Sheet View → `GET /api/v1/reseller/hotspot/vouchers/{id}/print`

---

### [x] Phase 8.5: Staff Attendance & GPS Punch
- [x] Connect Employee Check-In / Check-Out Punch → `POST /api/v1/reseller/employees/{id}/attendance/check-in`
- [x] Connect Employee GPS Location Logger → `POST /api/v1/reseller/employees/{id}/attendance/location`
- [x] Connect Monthly Salary Calculation Sheet → `GET /api/v1/reseller/employee-payments/{id}/salary-summary`
- [x] Connect Staff Leave Applications & Approvals → `GET/POST /api/v1/reseller/employees/{id}/leaves`

---

### [x] Phase 8.6: SMS, Voice OTP & WhatsApp Business
- [x] Connect SMS Templates Editor with Variable Tags → `GET/POST /api/v1/reseller/sms/{id}/templates`
- [x] Connect Voice OTP Automated Dispatcher → `POST /api/v1/reseller/voice-sms/{id}/broadcast`
- [x] Connect WhatsApp Bot Connection & QR Session → `GET /api/v1/reseller/whatsapp/settings/{id}`
- [x] Connect WhatsApp Message Automation Templates → `GET/POST /api/v1/reseller/whatsapp/{id}/templates`


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
