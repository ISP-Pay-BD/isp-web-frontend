# 07 — Screen Inventory

Complete list of every screen to build. Mark status: `[ ]` todo, `[x]` done.

**Legend:** P = permission menu key, R = roles allowed

---

## A. Public marketing

| # | Route | Page title | Sections / components | Data file | Status |
|---|-------|------------|----------------------|-----------|--------|
| A1 | `/` | Landing | See section list below (28 sections) | `data/marketing/landing.data.ts` | [x] |
| A2 | `/pricing` | Pricing | Pricing tiers, FAQ snippet, CTA | `data/marketing/pricing.data.ts` | [x] |
| A3 | `/plugins` | Plugins marketplace | Plugin cards, categories | `data/marketing/plugins.data.ts` | [x] |
| A4 | `/contact` | Contact | Form, office info, map placeholder | `data/marketing/landing.data.ts` | [x] |
| A5 | `/register` | Start free trial | Multi-step tenant signup form | `data/marketing/` inline | [x] |
| A6 | `/register/referral` | Referral signup | Referral code field, lead form | `data/marketing/` inline | [x] |

### A1 Landing sections (28 total — single page, anchor nav)

Mirror **all** `app/Views/landing/partials/`:

| Section ID | Partial file | Component name |
|------------|--------------|----------------|
| `#hero` | hero.php | `HeroSection` |
| `#stats` | stats.php | `StatsBand` |
| `#features` | features.php | `FeaturesGrid` |
| `#benefits` | benefits.php | `BenefitsSection` |
| `#why-choose` | why_choose.php | `WhyChooseSection` |
| `#how-it-works` | how_it_works.php | `HowItWorks` |
| `#product-preview` | product_preview.php | `ProductPreview` |
| `#auto-reconcile` | auto_reconciliation.php | `AutoReconcile` |
| `#roi` | roi.php | `RoiSection` |
| `#pricing` | pricing.php | `PricingSection` |
| `#comparison` | comparison.php | `ComparisonTable` |
| `#testimonials` | testimonials.php | `Testimonials` |
| `#faq` | faq.php | `FAQSection` |
| `#integrations` | integrations.php | `IntegrationsOrbit` |
| `#plugins` | plugins.php | `PluginsHighlight` |
| `#mobile-app` | mobile_app.php | `MobileAppPromo` |
| `#reseller` | reseller_hierarchy.php | `ResellerHierarchy` |
| `#roles` | roles_access.php | `RolesAccess` |
| `#permissions` | permissions.php | `PermissionsMatrix` |
| `#case-study` | case_study.php | `CaseStudy` |
| `#partners` | partners.php, our_partners.php | `PartnersLogos` |
| `#trust` | trust.php | `TrustBadges` |
| `#proof` | proof.php, proof_band.php | `ProofBand` |
| `#connects` | connects.php | `ConnectsSection` |
| `#try-it` | try_it.php | `TryItSection` |
| `#cta` | cta_contact.php | `CTASection` |
| — | nav.php | `MarketingNav` |
| — | footer.php | `MarketingFooter` |

Marketing layout: sticky nav, EN/BN toggle, dark hero, orange CTAs, mobile sticky CTA bar.

**Quality bar:** See `QUALITY-STANDARDS.md` — ≥90% PHP parity, Lighthouse mobile ≥85.

---

## B. Authentication

| # | Route | Page | Features | Mock | P | Status |
|---|-------|------|----------|------|---|--------|
| B1 | `/login` | Login | Email/phone, password, demo quick-pick, role redirect | `auth.login` | — | [x] |
| B2 | `/forgot-password` | Forgot password | Email form → toast sent | mock | — | [x] |
| B3 | `/register` | (if separate from A5) | Customer registration | mock | — | [x] |

---

## C. Customer portal (`/customer/*`)

**R:** `user` | **Layout:** Customer shell — sidebar desktop, bottom nav mobile

| # | Route | Title | Key UI | Mock handler | P | Status |
|---|-------|-------|--------|--------------|---|--------|
| C1 | `/customer/dashboard` | Dashboard | Expiry banner, package card, quick actions, usage chart | `customer.dashboard` | — | [x] |
| C2 | `/customer/subscription` | My Subscription | Current plan, renew button, quota, history | `customer.subscription` | subscription:read | [x] |
| C3 | `/customer/packages` | Packages | Available packages grid, upgrade CTA | `customer.packages` | — | [x] |
| C4 | `/customer/payments` | Payment History | Table, filters, invoice download btn | `customer.payments` | payment:read | [x] |
| C5 | `/customer/payments/pay` | Pay Now | Amount, gateway select (bKash/Nagad), confirm modal | `customer.payments.pay` | payment:payment | [x] |
| C6 | `/customer/support` | Support | Ticket list, status badges | `customer.support` | support_ticket:read | [x] |
| C7 | `/customer/support/[id]` | Ticket detail | Message thread, reply form | `customer.support` | support_ticket:send_msg | [x] |
| C8 | `/customer/support/new` | New ticket | Subject, body, submit | `customer.support` | support_ticket:create | [x] |
| C9 | `/customer/rewards` | Referrals & Rewards | Points wallet, referral link, redeem | `customer.rewards` | — | [x] |
| C10 | `/customer/news` | News & Notices | Card list, read modal | `customer.news` | — | [x] |
| C11 | `/customer/router` | Router Tools | Quick fix buttons grid | `customer.router` | — | [x] |
| C12 | `/customer/router/wifi` | Change WiFi | SSID + password form | `customer.router` | — | [x] |
| C13 | `/customer/router/devices` | Connected Devices | Device list table | `customer.router` | — | [x] |
| C14 | `/customer/profile` | My Profile | Edit name, phone, email | `customer.profile` | profile_update | [x] |
| C15 | `/customer/change-password` | Change Password | Old/new/confirm | mock | password_change | [x] |

### Customer mobile UX

- Bottom nav: Home, Pay, Support, Rewards, More
- Pay flow: full-screen sheet
- Tables → card list below 768px

---

## D. Admin / Reseller portal (`/admin/*`)

**R:** `admin`, `resellerAdmin`, `employee` (partial) | **Layout:** Admin shell — collapsible sidebar, ⌘K command palette

### D1. Core

| # | Route | Title | Key UI | Mock | P | R | Status |
|---|-------|-------|--------|------|---|---|--------|
| D1 | `/admin/dashboard` | Dashboard | KPI cards, charts, recent activity | `admin.dashboard` | — | admin,reseller | [x] |
| D1b | `/admin/hierarchy` | Org hierarchy graph/table | Super→Admin→Reseller→Customer | `hierarchy.tree` | — | admin,reseller | [x] |

### D2. Customers

| # | Route | Title | Key UI | Mock | P | Status |
|---|-------|-------|--------|------|---|--------|
| D2a | `/admin/customers` | All Customers | DataTable, search, filters, bulk actions | `admin.customers` | customer:read | [x] |
| D2b | `/admin/customers/expired` | Expired | Filtered table | same | customer:read | [x] |
| D2c | `/admin/customers/free-requests` | Free User Requests | Approval table | mock | free_customer_create | [x] |
| D2d | `/admin/customers/new` | Add Customer | Multi-field form | mock | customer:create | [x] |
| D2e | `/admin/customers/import` | Import Excel | Upload UI, preview table | mock | customer:create | [x] |
| D2f | `/admin/customers/[id]` | Customer detail | Tabs: info, subscription, payments, logs | mock | customer:read | [x] |
| D2g | `/admin/customers/[id]/edit` | Edit customer | Form | mock | customer:update | [x] |

### D3. Customer payments

| # | Route | Title | Mock | P | Status |
|---|-------|-------|------|---|--------|
| D3a | `/admin/customer-payments` | Payments list | `admin.customer-payments` | customer_payment:read | [x] |
| D3b | `/admin/customer-payments/new` | Record payment | mock | customer_payment:create | [x] |

### D4. Areas & packages

| # | Route | Title | Mock | P | Status |
|---|-------|-------|------|---|--------|
| D4a | `/admin/areas` | Service Areas | Tree: areas + subareas | `admin.areas` | area:read | [x] |
| D4b | `/admin/packages` | Packages | CRUD table | `admin.packages` | packages:read | [x] |
| D4c | `/admin/pop-packages` | POP Packages | Reseller packages | mock | packages:read | [x] |

### D5. HR

| # | Route | Title | Mock | P | Status |
|---|-------|-------|------|---|--------|
| D5a | `/admin/hr/employees` | Staff List | `admin.employees` | employee:read | [x] |
| D5b | `/admin/hr/salaries` | Salary Payments | mock | employee_payment:read | [x] |
| D5c | `/admin/hr/attendance` | Attendance | Calendar + table | mock | employee_attendance:read | [x] |
| D5d | `/admin/hr/accounts` | Employee Accounts | Ledger view | mock | employee_payment | [x] |
| D5e | `/admin/hr/advance-salary` | Advance Salary | Request/approve table | mock | advance_salary:read | [x] |

### D6. Accounting

| # | Route | Title | Mock | P | Status |
|---|-------|-------|------|---|--------|
| D6a | `/admin/accounting/incomes` | Incomes | mock | accounting:read | [x] |
| D6b | `/admin/accounting/expenses` | Expenses | mock | accounting:read | [x] |
| D6c | `/admin/accounting/reports` | Accounts Report | Date range + chart | mock | accounting:read | [x] |
| D6d | `/admin/accounting/chart-of-accounts` | COA | Tree table | `admin.accounting` | — | [x] |
| D6e | `/admin/accounting/journal-entries` | Journal | Entry list + form | mock | — | [x] |
| D6f | `/admin/accounting/balance-sheet` | Balance Sheet | Report layout | mock | — | [x] |

### D7. POP (resellers)

| # | Route | Title | Mock | P | R | Status |
|---|-------|-------|------|---|---|--------|
| D7a | `/admin/pop/resellers` | POP list | `admin.pop` | Resellers:read | admin | [x] |
| D7b | `/admin/pop/funding` | POP Funding | mock | customer_payment:read | admin,reseller | [x] |
| D7c | `/admin/pop/transactions` | POP Transactions | mock | customer_payment:read | admin,reseller | [x] |

### D8. Bandwidth (admin only)

| # | Route | Title | Status |
|---|-------|-------|--------|
| D8a | `/admin/bandwidth/buy/items` | Bandwidth items | [x] |
| D8b | `/admin/bandwidth/buy/categories` | Categories | [x] |
| D8c | `/admin/bandwidth/buy/providers` | Providers | [x] |
| D8d | `/admin/bandwidth/buy/bills` | Purchase bills | [x] |
| D8e | `/admin/bandwidth/sell/clients` | Sell clients | [x] |
| D8f | `/admin/bandwidth/sell/invoices` | Sales invoices | [x] |

### D9. Inventory & purchase (admin only)

| # | Route | Title | P | Status |
|---|-------|-------|---|--------|
| D9a | `/admin/purchase/vendors` | Vendors | inventory_purchess:read | [x] |
| D9b | `/admin/purchase/requisitions` | Requisitions | [x] |
| D9c | `/admin/purchase/bills` | Purchase bills | [x] |
| D9d | `/admin/inventory/units` | Units | [x] |
| D9e | `/admin/inventory/locations` | Store locations | [x] |
| D9f | `/admin/inventory/categories` | Categories | [x] |
| D9g | `/admin/inventory/items` | Items | [x] |
| D9h | `/admin/inventory/stock` | Stock | [x] |

### D10. Reports

| # | Route | Title | P | Status |
|---|-------|-------|---|--------|
| D10 | `/admin/reports/btrc` | BTRC Report | reports:read | [x] |

### D11. Network ops

| # | Route | Title | P | R | Status |
|---|-------|-------|---|---|--------|
| D11a | `/admin/hotspot` | Hotspot hub | hotspot | admin | [x] |
| D11b | `/admin/hotspot/dashboard` | Hotspot dashboard | [x] |
| D11c | `/admin/hotspot/packages` | Hotspot packages | [x] |
| D11d | `/admin/hotspot/users` | Hotspot users | [x] |
| D11e | `/admin/hotspot/reports` | Hotspot reports | [x] |
| D11f | `/admin/olt` | OLT list | olt | admin | [x] |
| D11g | `/admin/routers` | MikroTik routers | routers | admin | [x] |
| D11h | `/admin/ip-pools` | IP pools | routers | admin | [x] |
| D11i | `/admin/network/diagram` | Network diagram | network | admin | [x] |
| D11j | `/admin/network/map` | Network map | network | admin | [x] |

### D12. Communications

| # | Route | Title | P | Status |
|---|-------|-------|---|--------|
| D12a | `/admin/sms` | Send SMS | sms_message | [x] |
| D12b | `/admin/sms/templates` | SMS templates | [x] |
| D12c | `/admin/voice-sms` | Voice SMS | [x] |
| D12d | `/admin/whatsapp/inbox` | WA Inbox | whatsapp_business:read | [x] |
| D12e | `/admin/whatsapp/templates` | WA Templates | [x] |
| D12f | `/admin/whatsapp/message-log` | Message log | [x] |
| D12g | `/admin/whatsapp/opt-ins` | Opt-ins | whatsapp_business:marketing | [x] |
| D12h | `/admin/whatsapp/campaigns` | Campaigns | [x] |
| D12i | `/admin/whatsapp/settings` | WA Settings | whatsapp_business:update | [x] |

### D13. Other admin

| # | Route | Title | P | Status |
|---|-------|-------|---|--------|
| D13a | `/admin/reward-center` | Referral & Reward admin | referral:read | [x] |
| D13b | `/admin/support-tickets` | Support tickets | support_ticket:read | [x] |
| D13c | `/admin/support-tickets/[id]` | Ticket detail | support_ticket:send_msg | [x] |
| D13d | `/admin/recycle-bin` | Recycle bin | recycle_bin:read | [x] |
| D13e | `/admin/wallet` | My Wallet | admin only | [x] |
| D13f | `/admin/user-access` | User access mgmt | admin | [x] |
| D13g | `/admin/settings/software` | Software settings | software_settings | [x] |
| D13h | `/admin/theme-studio` | Theme studio | all roles | [x] |
| D13i | `/admin/subscription/self-recharge` | Self recharge | admin,reseller | [x] |
| D13j | `/admin/payment` | My payment | payment:read | [x] |
| D13k | `/admin/profile` | Profile | profile_update | [x] |
| D13l | `/admin/change-password` | Change password | password_change | [x] |

---

## E. Super admin (`/platform/*`)

**R:** `super_admin` only

| # | Route | Title | Mock | Status |
|---|-------|-------|------|--------|
| E1 | `/platform/dashboard` | Platform dashboard | `platform/revenue` | [x] |
| E1b | `/platform/hierarchy` | Org hierarchy graph/table | `hierarchy.tree` | [x] |
| E2 | `/platform/tenants` | Tenant portals | `platform/tenants` | [x] |
| E3 | `/platform/tenants/new` | Create portal | mock | [x] |
| E4 | `/platform/admins` | Second admins | `platform/admins` | [x] |
| E5 | `/platform/admins/packages` | Admin packages | mock | [x] |
| E6 | `/platform/revenue` | Platform revenue | mock | [x] |
| E7 | `/platform/showcase` | Product showcase | mock | [x] |
| E8 | `/platform/contacts` | Contact infos | mock | [x] |
| E9 | `/platform/plugins` | Plugins admin | `platform/plugins-admin` | [x] |
| E10 | `/platform/file-manager` | File manager | static tree UI | [x] |
| E11 | `/platform/user-access` | User access | same as D13f | [x] |
| E12 | `/platform/settings/software` | Software settings | mock | [x] |
| E13 | `/platform/support-tickets` | Admin support | shared support mock | [x] |

---

## F. Employee portal (`/employee/*`)

**R:** `employee`

| # | Route | Title | Mock | Status |
|---|-------|-------|------|--------|
| F1 | `/employee/salaries` | My Salaries | mock | [x] |
| F2 | `/employee/advance-salary` | Advance salary | mock | [x] |
| F3 | `/employee/profile` | Profile | mock | [x] |

---

## G. Global / system pages

| # | Route | Title | Status |
|---|-------|-------|--------|
| G1 | `/403` | Forbidden | [x] |
| G2 | `/404` | Not found | [x] |
| G3 | `/500` | Error | [x] |

---

## Screen count summary

| Portal | Screens |
|--------|---------|
| Marketing | 6 routes + **28 sections** |
| Auth | 3 |
| Customer | 15 |
| Admin/Reseller | ~75 |
| Platform | 13 |
| Employee | 3 |
| System | 3 |
| **Total routes** | **~118** |

---

## Per-screen deliverable checklist (copy for each screen)

When implementing screen `#___`, pass **`DEFINITION-OF-DONE.md`** in full:

- [ ] `app/.../page.tsx` created (thin)
- [ ] Page in `features/.../pages/`
- [ ] Data in `src/data/` + handler wired
- [ ] Permissions checked (route + buttons)
- [ ] Loading skeleton + empty + error states
- [ ] Mobile layout verified (320px–1440px)
- [ ] Dark mode verified (portals)
- [ ] Toast on mutations
- [ ] Quality bar passed (`QUALITY-STANDARDS.md`)
- [ ] `pnpm lint && typecheck && test && build` pass
- [ ] Status updated in this doc

---

## H. Additional screens (from backend audit — add during admin phases)

These features exist in `isppaybd_isp` but were not in the original inventory. Add as modules are built.

| # | Route (planned) | Title | Permission | Status |
|---|-----------------|-------|------------|--------|
| H1 | `/admin/ai-chat` | AI Chat Assistant | `ai_chat` | [x] |
| H2 | `/admin/audit-logs` | System audit logs | `audit_logs` | [x] |
| H3 | `/admin/movie-servers` | Movie servers | `movie_servers` | [x] |
| H4 | `/admin/news` | News admin CRUD | `news` | [x] |
| H5 | `/platform/redis-logs` | Redis & logs inspector | `super_admin` | [x] |
| H6 | `/admin/product-showcase` | Product showcase | `product_showcase` | [x] |
| H7 | `/platform/maintenance` | Maintenance mode toggle | `super_admin` | [x] |
| H8 | `/admin/reports/otc` | OTC report | `accounting` | [x] |
| H9 | `/admin/bandwidth/daily-bill` | Daily bill (bandwidth sell) | `bandwidth` | [x] |
| H10 | `/admin/customers/:id/mac-bind` | MAC bind/unbind | `customers` | [x] |
| H11 | `/admin/customers/:id/audit` | Customer audit logs | `customers` | [x] |
| H12 | `/admin/corporate/queues` | Corporate sync queues | `customers` | [x] |
| H13 | `/admin/payment-gateways/*` | Payment gateway UIs (bKash, Nagad…) | `payment_gateway` | [x] |
| H14 | `/admin/sidebar-pins` | Sidebar pinned items | `settings` | [x] |

**Updated total:** ~118 base routes + 14 audit additions ≈ **~132 screens** (mock UI complete)

---

## I. ISP Feature Catalog screens (`docs/14-ISP-FEATURE-CATALOG.md`)

Industry / BD competitor gaps implemented as mock UI (data: `src/data/admin/isp-ops.data.ts`, domain `ispOps`).

| # | Route | Title | Status |
|---|-------|-------|--------|
| I1 | `/admin/routers/[id]` | Router health | [x] |
| I2 | `/admin/routers/[id]/users` | Live PPPoE users | [x] |
| I3 | `/admin/radius` | RADIUS / CoA / PoD | [x] |
| I4 | `/admin/invoices` · `/admin/invoices/[id]` | Invoices + PDF | [x] |
| I5 | `/admin/customer-payments/[id]/pos` | Thermal POS receipt | [x] |
| I6 | `/admin/payments/reconcile` | Payment reconcile | [x] |
| I7 | `/captive` | Captive paywall | [x] |
| I8 | `/admin/customers/inactive` | Inactive customers | [x] |
| I9 | `/admin/reports/btrc` | BTRC Excel/PDF export (deepen) | [x] |
| I10 | `/admin/compliance/ip-logs` | BTRC IP/NAT logs | [x] |
| I11 | `/admin/billing/policies` | Grace + FUP policy | [x] |
| I12 | `/admin/billing/tax` | VAT / tax | [x] |
| I13 | `/admin/collections/reminders` | Due reminders | [x] |
| I14 | `/admin/collections/cashbook` | Collector cash book | [x] |
| I15 | `/admin/olt/[id]/onus` | ONU optical / provision | [x] |
| I16 | `/admin/olt/vendors` | Multi-vendor OLT | [x] |
| I17 | `/admin/network/pon` | PON / splitter map | [x] |
| I18 | `/admin/inventory/assign` | CPE assign | [x] |
| I19 | `/admin/inventory/transfers` | Stock transfer | [x] |
| I20 | `/admin/ipam` | IPAM IPv4/IPv6 | [x] |
| I21 | `/admin/network/cgnat` | CGNAT map | [x] |
| I22 | `/admin/hotspot/vouchers` | Hotspot vouchers | [x] |
| I23 | `/admin/hotspot/walled-garden` | Walled garden | [x] |
| I24 | `/admin/reports/usage` | Bandwidth usage | [x] |
| I25 | `/admin/network/outages` | Outage board | [x] |
| I26 | `/status` | Public status | [x] |
| I27 | `/admin/billing/dunning` | Dunning schedule | [x] |
| I28 | `/admin/billing/proration` | Proration wizard | [x] |
| I29 | `/admin/payments/credits` | Credit notes | [x] |
| I30 | `/admin/billing/deposits` | Deposits / OTC | [x] |
| I31 | `/admin/pop/commissions` | POP commissions | [x] |
| I32 | `/admin/pop/package-profit` | Package profit by POP | [x] |
| I33 | `/admin/pop/resellers` | Impersonate POP (toast) | [x] |
| I34 | `/employee/attendance` | GPS attendance | [x] |
| I35 | `/admin/jobs` · `/employee/jobs` | Work orders | [x] |
| I36 | `/admin/reports/collections-map` | Collections map | [x] |
| I37 | `/admin/leads` | Leads pipeline | [x] |
| I38 | `/admin/customers/[id]/kyc` | KYC vault | [x] |
| I39 | `/admin/customers/groups` | Parent–child groups | [x] |
| I40 | `/customer/payments/[id]/invoice` | Customer invoice PDF | [x] |
| I41 | `/customer/payments/auto-pay` | Auto-pay | [x] |
| I42 | `/admin/notifications/usage-alerts` | Usage alerts | [x] |
| I43 | `/help` · `/customer/help` | Knowledge base | [x] |
| I44 | `/admin/announcements` | Announcement banners | [x] |
| I45 | `/admin/rewards/analytics` | Referral analytics | [x] |
| I46 | `/admin/addons` | OTT / IPTV addons | [x] |
| I47 | `/admin/services` · `/admin/services/mobile` | Multi-service + mobile | [x] |
| I48 | `/plugins/[slug]` | Plugin detail | [x] |
| I49 | `/reset-password` | Reset password | [x] |
| I50 | `/platform/admins` | Login-as tenant (toast) | [x] |
| I51 | `/platform/admins/[id]/billing` | Tenant billing mode | [x] |
| I52 | `/platform/metering` | Usage metering | [x] |
| I53 | `/platform/tenants/[id]/health` | Tenant health | [x] |
| I54 | `/admin/developers` | API keys / webhooks | [x] |
| I55 | `/admin/branding` | White-label branding | [x] |
| I56 | `/platform/sla` | Tenant SLA | [x] |
| I57 | `/admin/acs` | TR-069 / ACS | [x] |
| I58 | `/admin/network/netflow` | NetFlow | [x] |
| I59 | `/admin/noc` | NOC hooks | [x] |
| I60 | `/admin/vpn` | VPN tunnels | [x] |
| I61 | `/admin/network/ipoe` | IPoE dual-stack | [x] |
| I62 | `/admin/fraud` | Fraud score | [x] |
| I63 | `/admin/contracts` | Contract e-sign | [x] |
| I64 | `/admin/dealers` | Dealer 6-tier | [x] |
| I65 | `/admin/bandwidth/sla` | Bandwidth SLA | [x] |
| I66 | `/admin/backup` | Backup / restore | [x] |

**Catalog mock UI:** complete · Next real work: **Phase 8 API**

---

## J. ISP Engines suite (static mock — full feature dump)

All groups from the engines roadmap. Data: `src/data/admin/engines.catalog.ts` + `engines.data.ts`. Hub UI with per-feature actions, records, logs, builders.

| # | Route | Title | Portal | Status |
|---|-------|-------|--------|--------|
| J0 | `/admin/engines` | Engines index | admin | [x] |
| J1 | `/admin/engines/automation` | Automation / Workflow (19 features) | admin | [x] |
| J2 | `/admin/engines/provisioning` | Service Provisioning (18) | admin | [x] |
| J3 | `/admin/engines/network-events` | Network Event Management (22) | admin | [x] |
| J4 | `/admin/engines/lifecycle` | Customer Lifecycle (16) | admin | [x] |
| J5 | `/admin/engines/installation` | Installation Management (14) | admin | [x] |
| J6 | `/admin/engines/accounting-x` | Accounting Expansion (16) | admin | [x] |
| J7 | `/admin/engines/crm` | CRM / Sales (14) | admin | [x] |
| J8 | `/admin/engines/api-platform` | API Platform (16) | admin | [x] |
| J9 | `/admin/engines/security` | Security (19) | admin | [x] |
| J10 | `/admin/engines/backup-dr` | Backup / DR (12) | admin | [x] |
| J11 | `/admin/engines/ai-platform` | AI Platform (18) | admin | [x] |
| J12 | `/admin/engines/cx` | Customer Experience (11) | admin | [x] |
| J13 | `/admin/engines/inventory-x` | Inventory Expansion (14) | admin | [x] |
| J14 | `/admin/engines/reseller-x` | Reseller Expansion (12) | admin | [x] |
| J15 | `/admin/engines/noc-advanced` | NOC Advanced (14) | admin | [x] |
| J16 | `/admin/engines/ftth-advanced` | Advanced FTTH (16) | admin | [x] |
| J17 | `/admin/engines/billing-advanced` | Advanced Billing (16) | admin | [x] |
| J18 | `/admin/engines/reporting-bi` | Reporting / BI (17) | admin | [x] |
| J19 | `/platform/engines` | Platform engines index | platform | [x] |
| J20 | `/platform/engines/multi-tenant` | Multi-Tenant SaaS (15) | platform | [x] |
| J21 | `/platform/engines/saas-bi` | SaaS BI (14) | platform | [x] |
| J22 | `/customer/experience` | Customer CX prefs/feedback | customer | [x] |
| J23 | `/employee/installations` | Field installations | employee | [x] |

**Engines total:** 20 groups · ~300+ named features · dummy records + logs + static action logic
