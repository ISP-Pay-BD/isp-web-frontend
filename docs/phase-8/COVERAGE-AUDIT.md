# Phase 8 — FULL MODULE COVERAGE AUDIT

> Cross-referenced against [`07-SCREEN-INVENTORY.md`](file:///c:/Users/SHOHAN/Documents/GitHub/isp-web-frontend/docs/07-SCREEN-INVENTORY.md) (sections A–J, ~132 base + 66 ISP catalog + 23 engines = **~220 screens**).

---

## 🔴 GAPS FOUND — Modules NOT in Phase 8 Docs Until Now

The following frontend features exist in the screen inventory and feature directories but were **MISSING** from the Phase 8 integration docs:

### Admin Missing from Plan (Section H — Additional Screens)
| # | Feature / Route | Feature Dir | Status |
|---|---|---|---|
| H1 | `/admin/ai-chat` | `src/features/admin/ai-chat` | ❌ NOT in docs |
| H2 | `/admin/audit-logs` | `src/features/admin/audit-logs` | ❌ NOT in docs |
| H3 | `/admin/movie-servers` | `src/features/admin/movie-servers` | ❌ NOT in docs |
| H4 | `/admin/news` | `src/features/admin/news` | ❌ NOT in docs |
| H6 | `/admin/product-showcase` | `src/features/admin/product-showcase` | ❌ NOT in docs |
| H8 | `/admin/reports/otc` | `src/features/admin/reports` | ❌ NOT in docs |
| H12 | `/admin/corporate/queues` | `src/features/admin/corporate` | ❌ NOT in docs |
| H13 | `/admin/payment-gateways/*` | `src/features/admin/payment-gateways` | ❌ NOT in docs |
| H14 | `/admin/sidebar-pins` | `src/features/admin/sidebar-pins` | ❌ NOT in docs |

### Admin Missing from Plan (Section D — Core Admin)
| # | Feature / Route | Feature Dir | Status |
|---|---|---|---|
| D7 | `/admin/pop/*` (Resellers, Funding, Transactions) | `src/features/admin/pop` | 🟡 Partial (funding mentioned, reseller list & transactions missing) |
| D8 | `/admin/bandwidth/*` (6 screens) | `src/features/admin/bandwidth` | ❌ NOT in docs |
| D9 | `/admin/inventory/*` + `/admin/purchase/*` (8 screens) | `src/features/admin/inventory` + `purchase` | 🟡 Partial (04-doc mentions backend build but not frontend wiring detail) |
| D11i | `/admin/network/diagram` | `src/features/admin/network` | ❌ NOT in docs |
| D11j | `/admin/network/map` | `src/features/admin/network` | ❌ NOT in docs |
| D13d | `/admin/recycle-bin` | `src/features/admin/recycle-bin` | ❌ NOT in docs |
| D13e | `/admin/wallet` | `src/features/admin/wallet` | ❌ NOT in docs |
| D13g | `/admin/settings/software` | `src/features/admin/settings` | ❌ NOT in docs |
| D13h | `/admin/theme-studio` | `src/features/admin/theme-studio` | ❌ NOT in docs |
| D13i | `/admin/subscription/self-recharge` | `src/features/admin/subscription` | ❌ NOT in docs |

### ISP Feature Catalog (Section I — 66 Screens)
| Range | Examples | Status |
|---|---|---|
| I1–I66 | Router Health, RADIUS, Invoices/PDF, POS Receipt, Reconcile, Captive, BTRC Logs, Billing Policies, Tax, Reminders, Cashbook, ONU Optical, PON Map, CPE Assign, IPAM, CGNAT, Hotspot Vouchers, Usage Reports, Outage Board, Public Status, Dunning, Proration, Credits, Deposits, Commissions, Contracts, Dealers, Fraud, VPN, IPoE, NetFlow, NOC, ACS/TR-069, Backup, etc. | ❌ ZERO in docs |

### ISP Engines Suite (Section J — 23 Groups, ~300 Features)
| Range | Examples | Status |
|---|---|---|
| J0–J23 | Automation, Provisioning, Network Events, Customer Lifecycle, Installation, Accounting-X, CRM, API Platform, Security, Backup/DR, AI Platform, CX, Inventory-X, Reseller-X, NOC Advanced, FTTH Advanced, Billing Advanced, Reporting/BI, Platform Engines | ❌ ZERO in docs |

### Marketing Missing
| Feature | Route | Status |
|---|---|---|
| Captive Portal | `/captive` | ❌ NOT in docs |
| Public Status Page | `/status` | ❌ NOT in docs |
| Help / Knowledge Base | `/help`, `/customer/help` | ❌ NOT in docs |
| Plugin Detail | `/plugins/[slug]` | ❌ NOT in docs |

### Employee Missing
| Feature | Route | Status |
|---|---|---|
| Employee Attendance (GPS) | `/employee/attendance` | ❌ NOT in docs |
| Employee Jobs / Work Orders | `/employee/jobs` | ❌ NOT in docs |
| Employee Installations | `/employee/installations` | ❌ NOT in docs |

### Platform Missing
| Feature | Route | Status |
|---|---|---|
| Platform Metering | `/platform/metering` | ❌ NOT in docs |
| Tenant Health | `/platform/tenants/[id]/health` | ❌ NOT in docs |
| Tenant Billing Mode | `/platform/admins/[id]/billing` | ❌ NOT in docs |
| Platform SLA | `/platform/sla` | ❌ NOT in docs |
| Platform Engines (2 groups) | `/platform/engines/*` | ❌ NOT in docs |

### Auth Missing
| Feature | Route | Status |
|---|---|---|
| Reset Password | `/reset-password` | ❌ NOT in docs |
| Custom Access Rules CRUD | `auth.customAccess.list` | ❌ NOT in docs |
| Demo Credentials | `auth.demoCredentials` | ❌ NOT in docs |

### Mock Handler Keys NOT Mapped in Any Doc
| Key | Purpose | Doc Status |
|---|---|---|
| `admin.domain` | Admin domain/tenant resolution | ❌ NOT in docs |
| `customer.domain` | Customer domain resolution | ❌ NOT in docs |
| `employee.domain` | Employee domain resolution | ❌ NOT in docs |
| `platform.domain` | Platform domain resolution | ❌ NOT in docs |
| `platform.maintenance` | Maintenance mode toggle | ❌ NOT in docs |
| `platform.file-manager` | File manager tree | ❌ NOT in docs |
| `platform.redis-logs` | Redis log inspector | ❌ NOT in docs |
| `news.item` | Shared news item detail | ❌ NOT in docs |
| `support.ticket` | Shared support ticket detail | ❌ NOT in docs |
| `health.ping` | Health check ping | ❌ NOT in docs |

---

## ✅ MODULES CORRECTLY COVERED IN DOCS

| Doc File | Modules Covered | Status |
|---|---|---|
| `01-FOUNDATION-AND-AUTH.md` | Login, Refresh, Me, Permissions (get/update/sections), Hierarchy (platform + reseller) | ✅ |
| `02-CUSTOMER-PORTAL.md` | Dashboard, Quota, Devices, Subscription, Packages, Renew, Payments, Pay, Support (CRUD), Router/WiFi, QuickFix, Ping, Rewards, News | ✅ |
| `03-ADMIN-READY-MODULES.md` | Dashboard, Profile, Customer CRUD+Bulk+Import, Areas+Subareas, Billing, HR (Employees/Attendance/Advance/Payroll), Support, SMS+Voice, Accounting, Routers+IP Pools, Rewards | ✅ |
| `04-ADMIN-BACKEND-BUILD-PLAN.md` | Package CRUD (backend), OLT (backend), Hotspot (backend), Inventory (backend), Reports (backend), WhatsApp (backend), Settings (backend) | ✅ but frontend wiring not detailed |
| `05-EMPLOYEE-PORTAL.md` | Salaries, Advance, Attendance, Profile | ✅ |
| `06-PLATFORM-PORTAL-BUILD-PLAN.md` | Dashboard, Tenants CRUD, Admins, Revenue, Plugins, Redis | ✅ but partial |

---

## 📊 FINAL COUNT

| Category | Total Screens | In Docs | Missing |
|---|---|---|---|
| Auth & Permissions | 6 | 4 | **2** (reset-password, customAccess, demoCredentials) |
| Marketing | 10 | 6 | **4** (captive, status, help, plugin-detail) |
| Customer | 17 | 15 | **2** (help, customer-experience) |
| Admin Core (D1–D13) | ~75 | ~50 | **~25** (bandwidth, pop details, network diagram/map, recycle-bin, wallet, settings, theme-studio, self-recharge, audit-logs, AI chat, movie-servers, news admin, corporate, payment-gateways, sidebar-pins, product-showcase) |
| Admin ISP Catalog (I1–I66) | 66 | 0 | **66** |
| Admin Engines (J0–J18) | 19 | 0 | **19** |
| Employee | 6 | 3 | **3** (attendance, jobs, installations) |
| Platform | 18 | 8 | **10** (metering, health, billing-mode, SLA, engines, maintenance, file-manager, redis-logs detail, domain) |
| **TOTALS** | **~220** | **~86** | **~131 MISSING** |
