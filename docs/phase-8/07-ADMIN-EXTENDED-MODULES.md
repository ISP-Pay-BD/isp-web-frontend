# Phase 8 — Admin Extended Modules (Sections D8–D13 + H)

> Covers all Admin screens NOT in `03-ADMIN-READY-MODULES.md` — bandwidth, POP details, network diagram/map, settings, theme-studio, recycle-bin, wallet, AI chat, audit-logs, movie-servers, news, corporate, payment-gateways, sidebar-pins, product-showcase.

---

## Module A: Bandwidth Buy & Sell (6 Screens — D8a–D8f)

| Feature | Route | zapi Status | Strategy |
|---|---|---|---|
| Bandwidth Items | `/admin/bandwidth/buy/items` | ❌ No zapi endpoint | Build `BandwidthApiController.php` |
| Categories | `/admin/bandwidth/buy/categories` | ❌ No zapi | Build new controller |
| Providers | `/admin/bandwidth/buy/providers` | ❌ No zapi | Build new controller |
| Purchase Bills | `/admin/bandwidth/buy/bills` | ❌ No zapi | Build new controller |
| Sell Clients | `/admin/bandwidth/sell/clients` | ❌ No zapi | Build new controller |
| Sales Invoices | `/admin/bandwidth/sell/invoices` | ❌ No zapi | Build new controller |
| Daily Bill | `/admin/bandwidth/daily-bill` | ❌ No zapi | Build new controller |
| Bandwidth SLA | `/admin/bandwidth/sla` | ❌ No zapi | Build new controller |

**Backend Plan:** New `zapi/Modules/Reseller/Controllers/BandwidthApiController.php`
```
GET    /api/v1/reseller/bandwidth/{resellerId}/items
POST   /api/v1/reseller/bandwidth/{resellerId}/items
GET    /api/v1/reseller/bandwidth/{resellerId}/categories
GET    /api/v1/reseller/bandwidth/{resellerId}/providers
GET    /api/v1/reseller/bandwidth/{resellerId}/purchase-bills
POST   /api/v1/reseller/bandwidth/{resellerId}/purchase-bills
GET    /api/v1/reseller/bandwidth/{resellerId}/sell-clients
GET    /api/v1/reseller/bandwidth/{resellerId}/sell-invoices
GET    /api/v1/reseller/bandwidth/{resellerId}/daily-bill
```

---

## Module B: POP / Reseller Management Detail (3 Screens — D7a–D7c)

| Feature | Route | zapi Status | Strategy |
|---|---|---|---|
| POP Reseller List | `/admin/pop/resellers` | ✅ `GET /api/reseller/profile/{resellerId}` (partial) | Wire existing + extend |
| POP Funding | `/admin/pop/funding` | ✅ `GET/POST/DELETE /api/reseller/funding/{resellerId}` | Wire existing |
| POP Transactions | `/admin/pop/transactions` | ✅ `GET /api/reseller/transactions/{resellerId}` | Wire existing |
| POP Commissions | `/admin/pop/commissions` | ❌ No zapi | Build new endpoint |
| POP Package Profit | `/admin/pop/package-profit` | ❌ No zapi | Build new endpoint |
| Impersonate POP | `/admin/pop/resellers` (action) | ❌ No zapi | Build new endpoint |

---

## Module C: Network Visualization (2 Screens — D11i–D11j)

| Feature | Route | zapi Status | Strategy |
|---|---|---|---|
| Network Diagram | `/admin/network/diagram` | ❌ No zapi | Client-side only (topology from router data) |
| Network Map | `/admin/network/map` | ❌ No zapi | Client-side only (Google Maps + area coords) |
| Network Outage Board | `/admin/network/outages` | ❌ No zapi | Build new endpoint |
| NetFlow | `/admin/network/netflow` | ❌ No zapi | Build new endpoint |
| CGNAT Map | `/admin/network/cgnat` | ❌ No zapi | Build new endpoint |
| PON / Splitter Map | `/admin/network/pon` | ❌ No zapi | Build new endpoint |
| IPoE Dual-Stack | `/admin/network/ipoe` | ❌ No zapi | Build new endpoint |

---

## Module D: Settings, Theme & System Admin (6 Screens — D13d–D13i + H14)

| Feature | Route | zapi Status | Strategy |
|---|---|---|---|
| Software Settings | `/admin/settings/software` | ❌ No zapi | Build `SettingsApiController.php` |
| Theme Studio | `/admin/theme-studio` | N/A | Client-side only (CSS variable editor, local preview) |
| Recycle Bin | `/admin/recycle-bin` | ❌ No zapi | Build new endpoint |
| Admin Wallet | `/admin/wallet` | ✅ Related to funding | Wire existing funding endpoints |
| Self-Recharge | `/admin/subscription/self-recharge` | ✅ `GET /api/reseller/make-reseller-payment/{resellerId}` | Wire existing |
| Sidebar Pins | `/admin/sidebar-pins` | N/A | Client-side only (localStorage + Zustand) |

---

## Module E: Communications Extended (6 WhatsApp Screens — D12d–D12i)

| Feature | Route | zapi Status | Strategy |
|---|---|---|---|
| WA Inbox | `/admin/whatsapp/inbox` | ❌ No zapi | Build `WhatsAppApiController.php` |
| WA Templates | `/admin/whatsapp/templates` | ❌ No zapi | Build new controller |
| WA Message Log | `/admin/whatsapp/message-log` | ❌ No zapi | Build new controller |
| WA Opt-ins | `/admin/whatsapp/opt-ins` | ❌ No zapi | Build new controller |
| WA Campaigns | `/admin/whatsapp/campaigns` | ❌ No zapi | Build new controller |
| WA Settings | `/admin/whatsapp/settings` | ❌ No zapi | Build new controller |
| SMS Templates | `/admin/sms/templates` | ❌ No zapi | Build new controller |

---

## Module F: Additional Admin Features (Section H — 14 Screens)

| Feature | Route | zapi Status | Strategy |
|---|---|---|---|
| AI Chat Assistant | `/admin/ai-chat` | ✅ `zapi/Modules/Ai/` endpoints exist | Wire existing AI endpoints |
| Audit Logs | `/admin/audit-logs` | ❌ No zapi | Build `AuditLogApiController.php` |
| Movie Servers | `/admin/movie-servers` | ✅ `GET /api/common/movie-servers` | Wire existing |
| News Admin | `/admin/news` | ✅ `GET/POST /api/common/news` | Wire existing |
| Product Showcase | `/admin/product-showcase` | ❌ No zapi | Build new endpoint |
| OTC Report | `/admin/reports/otc` | ❌ No zapi | Build `ReportApiController.php` |
| Corporate Queues | `/admin/corporate/queues` | ❌ No zapi | Build new endpoint |
| Payment Gateways | `/admin/payment-gateways/*` | ❌ No zapi (config in old PHP) | Build `PaymentGatewayApiController.php` |
| MAC Bind/Unbind | `/admin/customers/:id/mac-bind` | ✅ `POST .../mac-bind` | Wire existing |
| Customer Audit | `/admin/customers/:id/audit` | ❌ No zapi | Build new endpoint |

---

## Module G: Billing & Financial Extended

| Feature | Route | zapi Status | Strategy |
|---|---|---|---|
| Invoices + PDF | `/admin/invoices`, `/admin/invoices/[id]` | ❌ No zapi | Build `InvoiceApiController.php` |
| POS Thermal Receipt | `/admin/customer-payments/[id]/pos` | N/A | Client-side PDF generation |
| Payment Reconcile | `/admin/payments/reconcile` | ❌ No zapi | Build new endpoint |
| Billing Policies | `/admin/billing/policies` | ❌ No zapi | Build new endpoint |
| Tax / VAT | `/admin/billing/tax` | ❌ No zapi | Build new endpoint |
| Due Reminders | `/admin/collections/reminders` | ❌ No zapi | Build new endpoint |
| Cashbook | `/admin/collections/cashbook` | ❌ No zapi | Build new endpoint |
| Dunning Schedule | `/admin/billing/dunning` | ❌ No zapi | Build new endpoint |
| Proration Wizard | `/admin/billing/proration` | N/A | Client-side calculation |
| Credit Notes | `/admin/payments/credits` | ❌ No zapi | Build new endpoint |
| Deposits / OTC | `/admin/billing/deposits` | ❌ No zapi | Build new endpoint |

---

## Module H: Advanced ISP Operations

| Feature | Route | zapi Status | Strategy |
|---|---|---|---|
| RADIUS / CoA / PoD | `/admin/radius` | ❌ No zapi | Build new controller |
| Captive Paywall | `/captive` | N/A | Client-side Wi-Fi portal page |
| Inactive Customers | `/admin/customers/inactive` | ✅ Filtered via customer list | Wire existing with status filter |
| BTRC IP/NAT Logs | `/admin/compliance/ip-logs` | ❌ No zapi | Build new endpoint |
| CPE Assign | `/admin/inventory/assign` | ❌ No zapi | Build new endpoint |
| Stock Transfer | `/admin/inventory/transfers` | ❌ No zapi | Build new endpoint |
| IPAM IPv4/IPv6 | `/admin/ipam` | ❌ Related to IP pools | Extend existing IP pool endpoints |
| Hotspot Vouchers | `/admin/hotspot/vouchers` | ❌ No zapi | Build via `HotspotApiController.php` |
| Walled Garden | `/admin/hotspot/walled-garden` | ❌ No zapi | Build via `HotspotApiController.php` |
| Usage Reports | `/admin/reports/usage` | ❌ No zapi | Build via `ReportApiController.php` |
| Leads Pipeline | `/admin/leads` | ❌ No zapi | Build new controller |
| KYC Vault | `/admin/customers/[id]/kyc` | ❌ No zapi | Build new endpoint |
| Parent–Child Groups | `/admin/customers/groups` | ❌ No zapi | Build new endpoint |
| Usage Alerts | `/admin/notifications/usage-alerts` | ❌ No zapi | Build new controller |
| Announcements | `/admin/announcements` | ❌ No zapi | Build new controller |
| Rewards Analytics | `/admin/rewards/analytics` | ❌ No zapi | Build new endpoint |
| OTT / IPTV Addons | `/admin/addons` | ❌ No zapi | Build new controller |
| Multi-service + Mobile | `/admin/services` | ❌ No zapi | Build new controller |
| API Keys / Webhooks | `/admin/developers` | ❌ No zapi | Build new controller |
| White-label Branding | `/admin/branding` | ❌ No zapi | Build new controller |
| TR-069 / ACS | `/admin/acs` | ❌ No zapi | Build new controller |
| NOC Hooks | `/admin/noc` | ❌ No zapi | Build new controller |
| VPN Tunnels | `/admin/vpn` | ❌ No zapi | Build new controller |
| Fraud Score | `/admin/fraud` | ❌ No zapi | Build new controller |
| Contract E-Sign | `/admin/contracts` | ❌ No zapi | Build new controller |
| Dealer 6-Tier | `/admin/dealers` | ❌ No zapi | Build new controller |
| Backup / Restore | `/admin/backup` | ❌ No zapi | Build new controller |
