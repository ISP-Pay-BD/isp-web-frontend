# 07 — Screen Inventory

Complete list of every screen to build. Mark status: `[ ]` todo, `[x]` done.

**Legend:** P = permission menu key, R = roles allowed

---

## A. Public marketing

| # | Route | Page title | Sections / components | Data file | Status |
|---|-------|------------|----------------------|-----------|--------|
| A1 | `/` | Landing | See section list below (28 sections) | `data/marketing/landing.data.ts` | [ ] |
| A2 | `/pricing` | Pricing | Pricing tiers, FAQ snippet, CTA | `data/marketing/pricing.data.ts` | [ ] |
| A3 | `/plugins` | Plugins marketplace | Plugin cards, categories | `data/marketing/plugins.data.ts` | [ ] |
| A4 | `/contact` | Contact | Form, office info, map placeholder | `data/marketing/landing.data.ts` | [ ] |
| A5 | `/register` | Start free trial | Multi-step tenant signup form | `data/marketing/` inline | [ ] |
| A6 | `/register/referral` | Referral signup | Referral code field, lead form | `data/marketing/` inline | [ ] |

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
| B1 | `/login` | Login | Email/phone, password, demo quick-pick, role redirect | `auth.login` | — | [ ] |
| B2 | `/forgot-password` | Forgot password | Email form → toast sent | mock | — | [ ] |
| B3 | `/register` | (if separate from A5) | Customer registration | mock | — | [ ] |

---

## C. Customer portal (`/customer/*`)

**R:** `user` | **Layout:** Customer shell — sidebar desktop, bottom nav mobile

| # | Route | Title | Key UI | Mock handler | P | Status |
|---|-------|-------|--------|--------------|---|--------|
| C1 | `/customer/dashboard` | Dashboard | Expiry banner, package card, quick actions, usage chart | `customer.dashboard` | — | [ ] |
| C2 | `/customer/subscription` | My Subscription | Current plan, renew button, quota, history | `customer.subscription` | subscription:read | [ ] |
| C3 | `/customer/packages` | Packages | Available packages grid, upgrade CTA | `customer.packages` | — | [ ] |
| C4 | `/customer/payments` | Payment History | Table, filters, invoice download btn | `customer.payments` | payment:read | [ ] |
| C5 | `/customer/payments/pay` | Pay Now | Amount, gateway select (bKash/Nagad), confirm modal | `customer.payments.pay` | payment:payment | [ ] |
| C6 | `/customer/support` | Support | Ticket list, status badges | `customer.support` | support_ticket:read | [ ] |
| C7 | `/customer/support/[id]` | Ticket detail | Message thread, reply form | `customer.support` | support_ticket:send_msg | [ ] |
| C8 | `/customer/support/new` | New ticket | Subject, body, submit | `customer.support` | support_ticket:create | [ ] |
| C9 | `/customer/rewards` | Referrals & Rewards | Points wallet, referral link, redeem | `customer.rewards` | — | [ ] |
| C10 | `/customer/news` | News & Notices | Card list, read modal | `customer.news` | — | [ ] |
| C11 | `/customer/router` | Router Tools | Quick fix buttons grid | `customer.router` | — | [ ] |
| C12 | `/customer/router/wifi` | Change WiFi | SSID + password form | `customer.router` | — | [ ] |
| C13 | `/customer/router/devices` | Connected Devices | Device list table | `customer.router` | — | [ ] |
| C14 | `/customer/profile` | My Profile | Edit name, phone, email | `customer.profile` | profile_update | [ ] |
| C15 | `/customer/change-password` | Change Password | Old/new/confirm | mock | password_change | [ ] |

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
| D1 | `/admin/dashboard` | Dashboard | KPI cards, charts, recent activity | `admin.dashboard` | — | admin,reseller | [ ] |

### D2. Customers

| # | Route | Title | Key UI | Mock | P | Status |
|---|-------|-------|--------|------|---|--------|
| D2a | `/admin/customers` | All Customers | DataTable, search, filters, bulk actions | `admin.customers` | customer:read | [ ] |
| D2b | `/admin/customers/expired` | Expired | Filtered table | same | customer:read | [ ] |
| D2c | `/admin/customers/free-requests` | Free User Requests | Approval table | mock | free_customer_create | [ ] |
| D2d | `/admin/customers/new` | Add Customer | Multi-field form | mock | customer:create | [ ] |
| D2e | `/admin/customers/import` | Import Excel | Upload UI, preview table | mock | customer:create | [ ] |
| D2f | `/admin/customers/[id]` | Customer detail | Tabs: info, subscription, payments, logs | mock | customer:read | [ ] |
| D2g | `/admin/customers/[id]/edit` | Edit customer | Form | mock | customer:update | [ ] |

### D3. Customer payments

| # | Route | Title | Mock | P | Status |
|---|-------|-------|------|---|--------|
| D3a | `/admin/customer-payments` | Payments list | `admin.customer-payments` | customer_payment:read | [ ] |
| D3b | `/admin/customer-payments/new` | Record payment | mock | customer_payment:create | [ ] |

### D4. Areas & packages

| # | Route | Title | Mock | P | Status |
|---|-------|-------|------|---|--------|
| D4a | `/admin/areas` | Service Areas | Tree: areas + subareas | `admin.areas` | area:read | [ ] |
| D4b | `/admin/packages` | Packages | CRUD table | `admin.packages` | packages:read | [ ] |
| D4c | `/admin/pop-packages` | POP Packages | Reseller packages | mock | packages:read | [ ] |

### D5. HR

| # | Route | Title | Mock | P | Status |
|---|-------|-------|------|---|--------|
| D5a | `/admin/hr/employees` | Staff List | `admin.employees` | employee:read | [ ] |
| D5b | `/admin/hr/salaries` | Salary Payments | mock | employee_payment:read | [ ] |
| D5c | `/admin/hr/attendance` | Attendance | Calendar + table | mock | employee_attendance:read | [ ] |
| D5d | `/admin/hr/accounts` | Employee Accounts | Ledger view | mock | employee_payment | [ ] |
| D5e | `/admin/hr/advance-salary` | Advance Salary | Request/approve table | mock | advance_salary:read | [ ] |

### D6. Accounting

| # | Route | Title | Mock | P | Status |
|---|-------|-------|------|---|--------|
| D6a | `/admin/accounting/incomes` | Incomes | mock | accounting:read | [ ] |
| D6b | `/admin/accounting/expenses` | Expenses | mock | accounting:read | [ ] |
| D6c | `/admin/accounting/reports` | Accounts Report | Date range + chart | mock | accounting:read | [ ] |
| D6d | `/admin/accounting/chart-of-accounts` | COA | Tree table | `admin.accounting` | — | [ ] |
| D6e | `/admin/accounting/journal-entries` | Journal | Entry list + form | mock | — | [ ] |
| D6f | `/admin/accounting/balance-sheet` | Balance Sheet | Report layout | mock | — | [ ] |

### D7. POP (resellers)

| # | Route | Title | Mock | P | R | Status |
|---|-------|-------|------|---|---|--------|
| D7a | `/admin/pop/resellers` | POP list | `admin.pop` | Resellers:read | admin | [ ] |
| D7b | `/admin/pop/funding` | POP Funding | mock | customer_payment:read | admin,reseller | [ ] |
| D7c | `/admin/pop/transactions` | POP Transactions | mock | customer_payment:read | admin,reseller | [ ] |

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
| D9a | `/admin/purchase/vendors` | Vendors | inventory_purchess:read | [ ] |
| D9b | `/admin/purchase/requisitions` | Requisitions | [ ] |
| D9c | `/admin/purchase/bills` | Purchase bills | [ ] |
| D9d | `/admin/inventory/units` | Units | [ ] |
| D9e | `/admin/inventory/locations` | Store locations | [ ] |
| D9f | `/admin/inventory/categories` | Categories | [ ] |
| D9g | `/admin/inventory/items` | Items | [ ] |
| D9h | `/admin/inventory/stock` | Stock | [ ] |

### D10. Reports

| # | Route | Title | P | Status |
|---|-------|-------|---|--------|
| D10 | `/admin/reports/btrc` | BTRC Report | reports:read | [ ] |

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
| D12a | `/admin/sms` | Send SMS | sms_message | [ ] |
| D12b | `/admin/sms/templates` | SMS templates | [ ] |
| D12c | `/admin/voice-sms` | Voice SMS | [ ] |
| D12d | `/admin/whatsapp/inbox` | WA Inbox | whatsapp_business:read | [ ] |
| D12e | `/admin/whatsapp/templates` | WA Templates | [ ] |
| D12f | `/admin/whatsapp/message-log` | Message log | [ ] |
| D12g | `/admin/whatsapp/opt-ins` | Opt-ins | whatsapp_business:marketing | [ ] |
| D12h | `/admin/whatsapp/campaigns` | Campaigns | [ ] |
| D12i | `/admin/whatsapp/settings` | WA Settings | whatsapp_business:update | [ ] |

### D13. Other admin

| # | Route | Title | P | Status |
|---|-------|-------|---|--------|
| D13a | `/admin/reward-center` | Referral & Reward admin | referral:read | [ ] |
| D13b | `/admin/support-tickets` | Support tickets | support_ticket:read | [ ] |
| D13c | `/admin/support-tickets/[id]` | Ticket detail | support_ticket:send_msg | [ ] |
| D13d | `/admin/recycle-bin` | Recycle bin | recycle_bin:read | [ ] |
| D13e | `/admin/wallet` | My Wallet | admin only | [ ] |
| D13f | `/admin/user-access` | User access mgmt | admin | [ ] |
| D13g | `/admin/settings/software` | Software settings | software_settings | [ ] |
| D13h | `/admin/theme-studio` | Theme studio | all roles | [ ] |
| D13i | `/admin/subscription/self-recharge` | Self recharge | admin,reseller | [ ] |
| D13j | `/admin/payment` | My payment | payment:read | [ ] |
| D13k | `/admin/profile` | Profile | profile_update | [ ] |
| D13l | `/admin/change-password` | Change password | password_change | [ ] |

---

## E. Super admin (`/platform/*`)

**R:** `super_admin` only

| # | Route | Title | Mock | Status |
|---|-------|-------|------|--------|
| E1 | `/platform/dashboard` | Platform dashboard | `platform/revenue` | [ ] |
| E2 | `/platform/tenants` | Tenant portals | `platform/tenants` | [ ] |
| E3 | `/platform/tenants/new` | Create portal | mock | [ ] |
| E4 | `/platform/admins` | Second admins | `platform/admins` | [ ] |
| E5 | `/platform/admins/packages` | Admin packages | mock | [ ] |
| E6 | `/platform/revenue` | Platform revenue | mock | [ ] |
| E7 | `/platform/showcase` | Product showcase | mock | [ ] |
| E8 | `/platform/contacts` | Contact infos | mock | [ ] |
| E9 | `/platform/plugins` | Plugins admin | `platform/plugins-admin` | [ ] |
| E10 | `/platform/file-manager` | File manager | static tree UI | [ ] |
| E11 | `/platform/user-access` | User access | same as D13f | [ ] |
| E12 | `/platform/settings/software` | Software settings | mock | [ ] |
| E13 | `/platform/support-tickets` | Admin support | shared support mock | [ ] |

---

## F. Employee portal (`/employee/*`)

**R:** `employee`

| # | Route | Title | Mock | Status |
|---|-------|-------|------|--------|
| F1 | `/employee/salaries` | My Salaries | mock | [ ] |
| F2 | `/employee/advance-salary` | Advance salary | mock | [ ] |
| F3 | `/employee/profile` | Profile | mock | [ ] |

---

## G. Global / system pages

| # | Route | Title | Status |
|---|-------|-------|--------|
| G1 | `/403` | Forbidden | [ ] |
| G2 | `/404` | Not found | [ ] |
| G3 | `/500` | Error | [ ] |

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
| H1 | `/admin/ai-chat` | AI Chat Assistant | `ai_chat` | [ ] |
| H2 | `/admin/audit-logs` | System audit logs | `audit_logs` | [ ] |
| H3 | `/admin/movie-servers` | Movie servers | `movie_servers` | [ ] |
| H4 | `/admin/news/manage` | News admin CRUD | `news` | [ ] |
| H5 | `/platform/redis-logs` | Redis & logs inspector | `super_admin` | [ ] |
| H6 | `/admin/product-showcase` | Product showcase | `product_showcase` | [ ] |
| H7 | `/platform/maintenance` | Maintenance mode toggle | `super_admin` | [ ] |
| H8 | `/admin/reports/otc` | OTC report | `accounting` | [ ] |
| H9 | `/admin/bandwidth/daily-bill` | Daily bill (bandwidth sell) | `bandwidth` | [x] |
| H10 | `/admin/customers/:id/mac-bind` | MAC bind/unbind | `customers` | [ ] |
| H11 | `/admin/customers/:id/audit` | Customer audit logs | `customers` | [ ] |
| H12 | `/admin/corporate/queues` | Corporate sync queues | `customers` | [ ] |
| H13 | `/admin/payment-gateways/*` | Payment gateway UIs (bKash, Nagad…) | `payment_gateway` | [ ] |
| H14 | `/admin/sidebar-pins` | Sidebar pinned items | `settings` | [ ] |

**Updated total:** ~118 base routes + ~14 audit additions ≈ **~132 screens**
