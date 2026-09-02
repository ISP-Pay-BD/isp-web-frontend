# Reference Map — Old ISP Website (`isppaybd_isp`)

> **For AI agents:** Before building any UI or feature, read the matching file in the **reference backend**.  
> Do **not** invent layouts, copy, or menus — mirror the PHP app.

---

## Repo locations

| Repo | Path (this workspace) | Role |
|------|------------------------|------|
| **Frontend (build here)** | `C:\Users\SHOHAN\Documents\GitHub\isp-web-frontend` | Next.js UI |
| **Reference backend (read-only)** | `C:\Users\SHOHAN\Documents\GitHub\isppaybd_isp` | Old ISP website — source of truth |

From frontend repo, reference root is always:

```
../isppaybd_isp/
```

**Rule:** Frontend-only work → **never edit** `isppaybd_isp`. Future API work → `isppaybd_isp/zapi/` only.

---

## AI workflow (every screen / feature)

```
1. docs/07-SCREEN-INVENTORY.md     → find route + screen ID
2. This file (REFERENCE-MAP.md)    → find PHP view / CSS / JS path
3. Read PHP partial(s)             → copy, layout, fields, labels
4. src/data/ + mock-api            → static data matching PHP
5. src/features/...                → build Next.js UI
6. docs/DEFINITION-OF-DONE.md      → verify before marking done
```

---

## Global reference files (read first for any surface)

| Purpose | Path in `isppaybd_isp` |
|---------|--------------------------|
| **Admin sidebar menu** | `app/Views/layout/sidebar.php` |
| **Platform super-admin sidebar** | `app/Views/layout/_sidebar_platform.php` |
| **Main portal layout shell** | `app/Views/layout/main-layout.php` (and variants) |
| **Permission matrix (all keys)** | `app/Views/access/partial/default-access-fields.php` |
| **Portal design tokens** | `public/assets/css/saas/tokens.css` |
| **Landing dark theme CSS** | `public/assets/css/landing/landing.css` |
| **Landing interactions (PAYG, slider)** | `public/assets/js/landing/landing.js` |
| **Brand logo partial** | `app/Views/auth/partials/_brand_logo.php` |
| **Web routes (URL → controller)** | `app/Config/Routes.php` |
| **Future JSON API (Phase 8)** | `zapi/config/api_routes.php`, `zapi/Documentation/ENDPOINT_CATALOG.md` |

---

## Marketing / public website

| Frontend route | Read in reference |
|----------------|-------------------|
| `/` landing (28 sections) | `app/Views/landing/partials/*.php` — one file per section |
| Landing nav | `app/Views/landing/partials/nav.php` |
| Landing footer | `app/Views/landing/partials/footer.php` |
| `/pricing` | `app/Views/landing/partials/pricing.php` + `landing.js` |
| `/plugins` | `app/Views/plugins/` |
| `/contact` | `app/Views/dashboard/contact.php` or landing CTA partials |
| `/register` | `app/Views/auth/registration.php`, `auth/partials/_register_panel.php` |
| `/login` | `app/Views/auth/gate.php`, `auth/forgot.php` |

### Landing partial → Next component map

See **`docs/07-SCREEN-INVENTORY.md`** section A1 for full 28-section list.

| PHP partial | Section ID | Typical reference file |
|-------------|------------|------------------------|
| `hero.php` | `#hero` | `app/Views/landing/partials/hero.php` |
| `stats.php` | `#stats` | `app/Views/landing/partials/stats.php` |
| `features.php` | `#features` | `app/Views/landing/partials/features.php` |
| `pricing.php` | `#pricing` | `app/Views/landing/partials/pricing.php` |
| `faq.php` | `#faq` | `app/Views/landing/partials/faq.php` |
| `integrations.php` | `#integrations` | `app/Views/landing/partials/integrations.php` |
| `cta_contact.php` | `#cta` | `app/Views/landing/partials/cta_contact.php` |
| *(all others)* | *(see inventory)* | `app/Views/landing/partials/{name}.php` |

---

## Auth

| Screen | Reference views | Controller (behavior) |
|--------|-----------------|-------------------------|
| Login | `app/Views/auth/gate.php` | `app/Controllers/AuthController.php` |
| Forgot password | `app/Views/auth/forgot.php` | `AuthController.php` |
| Register / trial | `app/Views/auth/registration.php` | `app/Controllers/RegistrationController.php` |
| Access denied | `app/Views/access/` | `app/Controllers/Access.php` |

---

## Customer portal (`/customer/*`)

| Module | Reference views folder | Controller |
|--------|------------------------|------------|
| Dashboard | `app/Views/dashboard/user.php` | `app/Controllers/Dashboard.php` |
| Subscription | `app/Views/customers/subscription.php` | `app/Controllers/Subscription.php` |
| Packages | `app/Views/packages/` | `app/Controllers/Packages.php` |
| Payments | `app/Views/payments/customer/` | `app/Controllers/CustomerPayment.php` |
| Support tickets | `app/Views/tickets/` | `app/Controllers/SupportTicket.php` |
| News | `app/Views/news/` | `app/Controllers/NewsController.php` |
| Profile | `app/Views/profile/profile.php` | `app/Controllers/Profile.php` |
| Router / MAC tools | `app/Views/RouterUsers/` | `app/Controllers/Customer.php` |

---

## Admin / tenant portal (`/admin/*`)

| Module | Reference views folder | Controller |
|--------|------------------------|------------|
| Dashboard | `app/Views/dashboard/sAdmin.php`, `reseller.php` | `app/Controllers/Dashboard.php` |
| Customers | `app/Views/customers/` | `app/Controllers/Customer.php` |
| Customer payments | `app/Views/payments/customer/` | `CustomerPayment.php` |
| Areas / POP | `app/Views/areas/` | `app/Controllers/Area.php` |
| Packages | `app/Views/packages/` | `app/Controllers/Packages.php` |
| HR / employees | `app/Views/employee/` | `app/Controllers/Employee.php` |
| Employee payments | `app/Views/payments/employee/` | `EmployeePayment.php` |
| Accounting | `app/Views/accounts/` | `*Controller.php` in accounts |
| Bandwidth | `app/Views/bandwidth/` | `BandwidthController.php` |
| Bandwidth sell | `app/Views/bandwidth_sell/` | `bandwidth_sell_controller.php` |
| Inventory | `app/Views/inventory/` | `InventoryController.php` |
| Purchase / requisition | `app/Views/purchase/` | `RequisitionController.php` |
| Reports / BTRC | `app/Views/reports/` | `Reports.php` |
| Network map / diagram | `app/Views/network/` | `PremiumNetworkController.php` |
| Routers / MikroTik | `app/Views/routers/` | `Routers.php` |
| OLT | `app/Views/olt/` | `OltController.php` |
| Hotspot | `app/Views/hotspot/` | `Hotspot.php` |
| SMS | `app/Views/sms/` | `Sms.php` |
| WhatsApp | `app/Views/whatsapp/` | `WhatsAppSettings.php` |
| Voice SMS | `app/Views/voice_sms/` | `VoiceSms.php` |
| Tickets | `app/Views/tickets/` | `SupportTicket.php` |
| Settings | `app/Views/settings/` | `Settings.php` |
| Wallet | `app/Views/wallet/` | `Wallet.php` |
| Reseller funding | `app/Views/resellerFunding/` | `ResellerFunding.php` |
| Recycle bin | `app/Views/recyclebin/` | `RecycleBin.php` |
| User access | `app/Views/access/` | `Access.php` |
| Plugins admin | `app/Views/plugins/` | `Plugins.php` |
| Audit logs | *(controller)* | `Audit.php` |
| Redis / system | `app/Views/system/` | `RedisInspector.php` |
| File manager | `app/Views/file-manager/` | `FileManager.php` |

**Reseller-scoped views:** `app/Views/reseller/`, `app/Views/SecondAdmin/`

---

## Platform super-admin (`/platform/*`)

| Module | Reference views | Controller |
|--------|-----------------|------------|
| Tenants | `app/Views/tenants/` | `Tenants.php` |
| Platform dashboard | `app/Views/dashboard/` (sAdmin variants) | `Sadmin.php` |
| Second admin / resellers | `app/Views/SecondAdmin/` | `Admin.php` |

Use **`app/Views/layout/_sidebar_platform.php`** for platform menu structure.

---

## Employee portal (`/employee/*`)

| Module | Reference views | Controller |
|--------|-----------------|------------|
| Salaries | `app/Views/payments/employee/` | `EmployeePayment.php` |
| Advance salary | `app/Views/employee/advance_salary_list.php` | `Employee.php` |
| Profile | `app/Views/profile/`, `employee/edit.php` | `EmployeePortalController.php` |
| Attendance | `app/Views/employee/` | `EmployeeAttendance.php` |

---

## Shared UI components (PHP → shadcn patterns)

| PHP partial | Use for |
|-------------|---------|
| `app/Views/components/list-toolbar.php` | Table toolbar, filters |
| `app/Views/components/badge.php` | Status badges |
| `app/Views/components/skeleton-kpi.php` | Loading skeletons |
| `app/Views/components/command-palette.php` | ⌘K nav (Phase 7) |
| `app/Views/components/date-range.php` | Date filters |

---

## Static assets (copy to frontend `public/`)

| Asset type | Reference path |
|------------|----------------|
| Landing images / partner logos | `public/assets/images/landing/` |
| Payment method logos | `public/assets/images/` (methods) |
| Brand SVG | `app/Views/auth/partials/_brand_logo.php` + assets |
| Fonts (Satoshi) | `public/assets/css/saas/tokens.css` (names) — frontend uses `public/fonts/` |

---

## Permissions & roles

| Need | Path |
|------|------|
| All permission field definitions | `app/Views/access/partial/default-access-fields.php` |
| Frontend permission doc | `docs/05-PERMISSIONS-AND-ROLES.md` |
| Demo user presets | `src/data/users/users.data.ts` |

---

## Quick lookup by frontend feature folder

| `src/features/...` | Start reading here |
|----------------------|--------------------|
| `marketing/landing` | `app/Views/landing/partials/` |
| `marketing/pricing` | `landing/partials/pricing.php` |
| `admin/customers` | `app/Views/customers/` |
| `admin/packages` | `app/Views/packages/` |
| `admin/dashboard` | `app/Views/dashboard/sAdmin.php` |
| `customer/dashboard` | `app/Views/dashboard/user.php` |
| `platform/tenants` | `app/Views/tenants/` |
| *(any module)* | Match folder name under `app/Views/` |

If folder name differs, search:

```bash
# From isppaybd_isp root — find views for a keyword
rg -l "keyword" app/Views/
```

Or check `app/Config/Routes.php` for URL → controller → view chain.

---

## Related frontend docs

| Doc | Purpose |
|-----|---------|
| `07-SCREEN-INVENTORY.md` | Every screen to build |
| `UI-FUSION-GUIDE.md` | How to adapt PHP → Next.js visually |
| `06-MOCK-DATA-SPEC.md` | Data shapes from PHP models |
| `05-PERMISSIONS-AND-ROLES.md` | Permission keys |
| `QUALITY-STANDARDS.md` | ≥90% PHP parity bar |

---

## Do not

- Guess menu items — read `sidebar.php`
- Guess landing copy — read `landing/partials/`
- Use generic CRM patterns — read the PHP view first
- Modify `isppaybd_isp` during frontend Phase 1–7
