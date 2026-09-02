# Master Build Plan — Complete Structure Before Code

> **Read this before writing any UI code.**  
> Goal: premium ISP Pay BD platform — **not** a generic CRM. Every module listed. Every gate defined.

Companion docs: `QUALITY-STANDARDS.md`, `DEFINITION-OF-DONE.md`, `UI-FUSION-GUIDE.md`, `FONTS.md`, `PRE-PHASE-AUDIT.md`, `P0-READY.md`

**Plan docs status:** ✅ Specification complete (P0–Phase 8 written). **Execution:** Phase 1 next.

---

## Vision (locked)

Build the **complete ISP Pay BD frontend** — all portals, all modules, all permissions — with:

- **Reference fidelity** to `isppaybd_isp` (menus, copy, workflows)
- **Premium visual quality** (dark ISP marketing + polished shadcn portals)
- **Modern motion** (purposeful, not excessive)
- **Offline static data** in Phase 1; real `zapi/` API in Phase 8

**Success = ~132 screens all marked `[x]` in inventory with DoD passed.**

---

## Execution order (strict — no skipping)

```
P0 Foundation polish
  ↓
Phase 1 Marketing (28 landing sections + 5 routes)
  ↓
Phase 2 Auth + Permissions P0
  ↓
Phase 3 Customer portal (11 modules)
  ↓
Phase 4 Reseller-scoped admin subset
  ↓
Phase 5 Full tenant admin (42 modules)
  ↓
Phase 6 Platform super-admin (12 modules)
  ↓
Phase 7 Employee + global polish
  ↓
Phase 8 API integration (future — out of scope now)
```

---

## P0 — Complete before Phase 1 code

### P0-A: Design tokens & assets

| Task | Output file(s) | Reference |
|------|----------------|-----------|
| Landing CSS vars in Tailwind | `src/app/globals.css`, `tailwind` config | `landing.css` |
| Portal shadcn vars | `globals.css` `.dark` / `:root` | `tokens.css` |
| Self-host fonts | `public/fonts/{family}/`, `src/styles/fonts/`, `src/config/fonts.ts` | **`docs/FONTS.md`** |
| Logo + placeholders | `public/images/` | `_brand_logo.php` |
| Favicon | `public/favicon.ico` | ISP brand |

#### Font setup (mandatory — see `docs/FONTS.md`)

**One folder per font in `public/fonts/`. One CSS file per font in `src/styles/fonts/`.**

| Font | Folder | CSS file | Class | Use on |
|------|--------|----------|-------|--------|
| Plus Jakarta Sans | `public/fonts/plus-jakarta-sans/` | `plus-jakarta-sans.css` | `font-landing-display` | Marketing headings, hero |
| Inter | `public/fonts/inter/` | `inter.css` | `font-landing-body` | Marketing body, nav, footer |
| **Satoshi** | `public/fonts/satoshi/*.woff2` | `satoshi.css` | `font-portal` | All portals (admin, customer, platform, employee) |
| Noto Sans Bengali | `public/fonts/noto-sans-bengali/` | `noto-sans-bengali.css` | `font-bengali` | BN locale (all surfaces) |
| IBM Plex Mono | `public/fonts/ibm-plex-mono/` | `ibm-plex-mono.css` | `font-mono` | Invoice #, TrxID, IP, MAC |

Registry: `src/config/fonts.ts` · Load: `src/lib/fonts.ts` → `src/styles/fonts/index.css`

**Do NOT use Roboto, Open Sans, or single-font-everywhere.**

### P0-B: Shared layouts (build once, reuse everywhere)

| Component | Location | Used by | Status |
|-----------|----------|---------|--------|
| `MarketingLayout` | `features/marketing/shared/` | All marketing routes | ✅ |
| `MarketingNav` | `features/marketing/shared/components/` | Sticky blur nav | ✅ |
| `MarketingFooter` | `features/marketing/shared/components/` | All marketing | ✅ |
| `MobileStickyCta` | `features/marketing/shared/components/` | Landing mobile | ✅ |
| `AppShell` | `components/layout/` | All portals | ✅ |
| `PortalSidebar` | `components/layout/` | Admin, platform | ✅ |
| `PortalHeader` | `components/layout/` | All portals | ✅ |
| `CustomerBottomNav` | `features/customer/shared/` | Customer mobile | ⏳ Phase 3 |
| `PageHeader` | `features/shared/page-header/` | All list/detail pages | ⏳ Phase 1+ |
| `ForbiddenPage` | `app/(portal)/403/` | Permission denied | ⏳ Phase 2 |
| `NotFoundPage` | `app/not-found.tsx` | 404 | ✅ |

### P0-C: Shared components (build before modules)

| Component | Location | Priority | Status |
|-----------|----------|----------|--------|
| `DataTable` | `features/shared/data-table/` | P0 — used everywhere | ✅ |
| `StatCard` | `components/shared/` | P0 — dashboards | ✅ |
| `EmptyState` | `components/shared/` | P0 | ✅ |
| `LoadingSkeleton` variants | `components/shared/` | P0 | ✅ |
| `ConfirmDialog` | `components/shared/` | P0 | ✅ |
| `StatusBadge` | `components/shared/` | P0 — active/expired/online | ✅ |
| `CurrencyDisplay` | `components/shared/` | P0 — ৳ formatting | ✅ |
| `DateDisplay` | `components/shared/` | P1 | ⏳ P1 |
| `SearchInput` | `components/shared/` | P0 — sidebar + tables | ⏳ Phase 1+ |
| `FilterBar` | `components/shared/` | P1 | ⏳ P1 |
| `ChartCard` | `components/shared/` | P1 — lazy Recharts | ⏳ P1 |

### P0-D: Config & navigation

| Task | File | Requirement | Status |
|------|------|-------------|--------|
| Full sidebar structure | `src/config/navigation/admin.ts` | Mirror `sidebar.php` (~50+ items) | ✅ |
| Platform sidebar | `src/config/navigation/platform.ts` | Mirror `_sidebar_platform.php` | ✅ |
| Customer nav | `src/config/navigation/customer.ts` | 5 bottom tabs + drawer | ✅ |
| Nav filter hook | `src/hooks/use-filtered-nav.ts` | Permission + role filter | ✅ |
| Site metadata | `src/config/site.ts` | Brand, URLs | ✅ |
| i18n setup | `src/i18n/` + `next-intl` | EN + BN | ⏳ Phase 1 parallel |

### P0-E: Data layer completion (marketing first)

| Data file | Status | Needed for |
|-----------|--------|------------|
| `data/marketing/landing.data.ts` | ✅ | Hero, FAQ, contact copy |
| `data/marketing/sections.data.ts` | ✅ | All 28 section content |
| `data/marketing/pricing.data.ts` | ✅ | Tiers + PAYG calculator |
| `data/marketing/plugins.data.ts` | ✅ | Plugin marketplace |
| `data/marketing/i18n/` | ⏳ Phase 1 | EN + BN strings (with next-intl) |
| Handlers wired | ✅ | `lib/mock-api/handlers/data.handler.ts` |

### P0 gate (ALL must pass)

- [x] MarketingLayout renders with nav + footer
- [x] Landing tokens applied (dark `#0c0118`)
- [x] Fonts self-hosted — 5 families in `public/fonts/` — see `docs/FONTS.md`
- [x] Full navigation config written (`config/navigation/`)
- [x] Shared DataTable + EmptyState + StatCard exist
- [x] `pnpm build` passes

**P0 gate: ✅ PASSED.** Optional before Phase 1: `next-intl`, OG image, `403` page, `SearchInput`.

---

## Phase 1 — Marketing (complete landing)

### Routes (6)

| Route | Module | Page component |
|-------|--------|----------------|
| `/` | `marketing/landing` | `LandingPage` |
| `/pricing` | `marketing/pricing` | `PricingPage` |
| `/plugins` | `marketing/plugins` | `PluginsPage` |
| `/contact` | `marketing/contact` | `ContactPage` |
| `/register` | `marketing/register` | `RegisterPage` |
| `/register/referral` | `marketing/register` | `ReferralRegisterPage` |

### Landing sections (28 — all required on `/`)

Build in `features/marketing/landing/components/`:

| # | Section | PHP partial | 21st.dev inspiration |
|---|---------|-------------|---------------------|
| 1 | Hero + orbital diagram | hero.php | Hero / Radial Orbital |
| 2 | Stats band | stats.php | Stats & KPIs |
| 3 | Features grid | features.php | Bento / Features |
| 4 | Benefits | benefits.php | Features |
| 5 | Why choose us | why_choose.php | Features |
| 6 | How it works | how_it_works.php | How it works |
| 7 | Product preview | product_preview.php | Product preview |
| 8 | Auto reconciliation | auto_reconciliation.php | Feature highlight |
| 9 | ROI calculator | roi.php | Interactive |
| 10 | Pricing + PAYG | pricing.php | Pricing Sections |
| 11 | Comparison table | comparison.php | Comparison |
| 12 | Testimonials | testimonials.php | Testimonials |
| 13 | FAQ | faq.php | FAQs (Accordion) |
| 14 | Integrations orbit | integrations.php | Keep ISP SVG orbit |
| 15 | Plugins highlight | plugins.php | Cards |
| 16 | Mobile app promo | mobile_app.php | App promo |
| 17 | Reseller hierarchy | reseller_hierarchy.php | Diagram |
| 18 | Roles & access | roles_access.php | Matrix preview |
| 19 | Permissions matrix | permissions.php | Table preview |
| 20 | Case study | case_study.php | Case study |
| 21 | Partners logos | partners.php, our_partners.php | Logo cloud |
| 22 | Trust badges | trust.php | Trust strip |
| 23 | Proof band | proof.php, proof_band.php | Social proof |
| 24 | Connects / ecosystem | connects.php | Integration strip |
| 25 | Try it / demo CTA | try_it.php | CTA |
| 26 | CTA contact | cta_contact.php | CTA shimmer |
| 27 | Nav | nav.php | Sticky nav |
| 28 | Footer | footer.php | Multi-column footer |

### Phase 1 gate

- [ ] All 28 sections on landing page
- [ ] Pricing slider + PAYG calculator works
- [ ] EN/BN toggle works
- [ ] Mobile sticky CTA
- [ ] Lighthouse mobile ≥85
- [ ] All 6 marketing routes pass DoD

---

## Phase 2 — Auth + Permissions

### Modules

| Module | Routes | Deliverables |
|--------|--------|--------------|
| `auth/login` | `/login` | Form, 6 demo quick-select, role redirect |
| `auth/forgot-password` | `/forgot-password` | Toast flow |
| `shared/permission` | — | Nav filter hook, route guard hook |
| `admin/user-access` | `/admin/user-access` | Permission matrix UI (static) |

### Permissions P0 (must complete in Phase 2)

- [ ] `useFilteredNav()` — hide items by permission
- [ ] `useRouteGuard()` — 403 on direct URL
- [ ] Expired user limited nav
- [ ] Demo mode role switcher (dev toolbar)
- [ ] All 6 demo users login correctly

### Phase 2 gate

- [ ] Login → correct portal by role
- [ ] Logout → `/login`
- [ ] 403 page for unauthorized routes
- [ ] Sidebar shows full ISP menu (filtered)

---

## Phase 3 — Customer portal (11 modules)

| Module | Route(s) | Priority |
|--------|----------|----------|
| `customer/dashboard` | `/customer` | P0 |
| `customer/subscription` | `/customer/subscription` | P0 |
| `customer/packages` | `/customer/packages` | P0 |
| `customer/payments` | `/customer/payments` | P0 |
| `customer/support` | `/customer/support`, `/customer/support/:id` | P1 |
| `customer/rewards` | `/customer/rewards` | P2 |
| `customer/news` | `/customer/news`, `/customer/news/:id` | P2 |
| `customer/router` | `/customer/router` | P1 |
| `customer/profile` | `/customer/profile` | P1 |
| `customer/change-password` | `/customer/change-password` | P1 |
| `customer/shared` | — | Layout, bottom nav |

Build order: dashboard → subscription → packages → payments → profile → support → router → rewards → news → change-password

---

## Phase 4 — Reseller admin subset

Reseller (`resellerAdmin`) gets scoped subset of admin modules. Build these first with POP/reseller context:

| Module | Route |
|--------|-------|
| `admin/dashboard` | `/admin` |
| `admin/customers` | `/admin/customers` |
| `admin/customer-payments` | `/admin/customer-payments` |
| `admin/packages` | `/admin/packages` |
| `admin/pop-packages` | `/admin/pop-packages` |
| `admin/areas` | `/admin/areas` |
| `admin/support` | `/admin/support` |
| `admin/reports` | `/admin/reports` |
| `admin/profile` | `/admin/profile` |

---

## Phase 5 — Full tenant admin (42 modules)

Build in dependency order:

### Tier 1 — Core ops (week 1)
- customers, customer-payments, packages, pop-packages, areas, dashboard

### Tier 2 — Network (week 2)
- routers, olt, hotspot, ip-pools, network/diagram, network/map

### Tier 3 — Communications (week 2)
- sms, sms-templates, voice-sms, whatsapp, support

### Tier 4 — Finance (week 3)
- accounting/incomes, accounting/expenses, accounting/reports
- accounting/chart-of-accounts, accounting/journal-entries, accounting/balance-sheet
- wallet, payment, subscription, purchase

### Tier 5 — HR (week 3)
- hr/employees, hr/salaries, hr/attendance, hr/accounts, hr/advance-salary

### Tier 6 — POP & bandwidth (week 4)
- pop/resellers, pop/funding, pop/transactions
- bandwidth/buy, bandwidth/sell

### Tier 7 — Advanced (week 4)
- inventory, reports, rewards, recycle-bin
- user-access, settings, theme-studio, profile

### Tier 8 — Audit additions (Section H in inventory)
- ai-chat, audit-logs, movie-servers, news admin, payment gateways, etc.

---

## Phase 6 — Platform super-admin (12 modules)

| Module | Route |
|--------|-------|
| `platform/dashboard` | `/platform` |
| `platform/tenants` | `/platform/tenants` |
| `platform/admins` | `/platform/admins` |
| `platform/revenue` | `/platform/revenue` |
| `platform/contacts` | `/platform/contacts` |
| `platform/plugins` | `/platform/plugins` |
| `platform/showcase` | `/platform/showcase` |
| `platform/file-manager` | `/platform/file-manager` |
| `platform/user-access` | `/platform/user-access` |
| `platform/settings` | `/platform/settings` |
| `platform/support` | `/platform/support` |

---

## Phase 7 — Employee + polish

| Module | Route |
|--------|-------|
| `employee/salaries` | `/employee/salaries` |
| `employee/advance-salary` | `/employee/advance-salary` |
| `employee/profile` | `/employee/profile` |

### Final polish checklist

- [ ] All ~132 screens `[x]` in inventory
- [ ] Full nav works for all 6 demo users
- [ ] Expired user flow tested
- [ ] Dark mode every portal screen
- [ ] No external network requests
- [ ] `pnpm lint && typecheck && test && build` clean
- [ ] README + docs updated

---

## Data completion plan (by phase)

| Phase | Data domains to complete |
|-------|-------------------------|
| P0 | marketing (full), users/permissions |
| 1 | marketing/i18n |
| 2 | auth sessions |
| 3 | customer/* (all) |
| 4 | admin core (customers, packages, areas, payments) |
| 5 | admin/* (all remaining) |
| 6 | platform/* |
| 7 | employee/* |

Each data file must have: realistic BD ISP content, typed exports, index re-export.

---

## Handler completion plan

| Handler | Phase | Endpoints |
|---------|-------|-----------|
| `marketing.handler.ts` | 1 | landing, pricing, plugins, contact |
| `auth.handler.ts` | 2 | login, logout, session |
| `customer.handler.ts` | 3 | all customer modules |
| `customers.handler.ts` | 4 | CRUD, filters |
| `payments.handler.ts` | 4 | payments list |
| `dashboard.handler.ts` | 4 | stats, charts |
| `admin.handler.ts` | 5 | all admin modules |
| `platform.handler.ts` | 6 | platform modules |
| `support.handler.ts` | 3+ | tickets |

---

## Module file template (every feature)

When starting any module, create:

```
features/{portal}/{module}/
├── pages/
│   └── {Module}Page.tsx          ← main screen
├── components/
│   ├── {Module}Table.tsx         ← if list
│   ├── {Module}Form.tsx          ← if CRUD
│   └── {Module}Skeleton.tsx      ← loading
├── hooks/
│   └── use{Module}.ts            ← mockFetch wrapper
├── schemas/
│   └── {module}.schema.ts        ← Zod
├── types/
│   └── index.ts
├── index.ts                      ← export pages + hooks
└── README.md                     ← routes, permissions, data files
```

App route (always thin):

```tsx
import { CustomersPage } from '@/features/admin/customers';
export default function Page() { return <CustomersPage />; }
```

---

## AI agent pre-code checklist (every session)

Before writing code, confirm:

1. [ ] Read `PROJECT-MEMORY.md`
2. [ ] Read `QUALITY-STANDARDS.md`
3. [ ] Read `UI-FUSION-GUIDE.md`
4. [ ] Check current phase in `MASTER-BUILD-PLAN.md`
5. [ ] Check screen spec in `07-SCREEN-INVENTORY.md`
6. [ ] Read PHP reference for that screen
7. [ ] Confirm shared components exist (or build P0 first)
8. [ ] Confirm data file exists (or create first)
9. [ ] Build to `DEFINITION-OF-DONE.md`
10. [ ] Run verify commands before marking done

**If P0 not complete → do NOT start Phase 1 landing sections.**

**Current:** P0 ✅ complete — proceed with Phase 1 when user approves. See `P0-READY.md`.

---

## Timeline estimate (quality-focused)

| Phase | Duration | Notes |
|-------|----------|-------|
| P0 | 2–3 days | Layouts + shared components + nav |
| 1 Marketing | 5–7 days | 28 sections — quality over speed |
| 2 Auth + permissions | 2–3 days | Full nav filter |
| 3 Customer | 5–7 days | 11 modules |
| 4 Reseller | 5–7 days | Core admin subset |
| 5 Tenant admin | 20–25 days | 42 modules |
| 6 Platform | 4–5 days | 12 modules |
| 7 Employee + polish | 3–5 days | Final QA |
| **Total Phase 1 UI** | **~7–9 weeks** | Premium quality |

---

## What "complete" looks like

When this plan is finished:

- Every ISP Pay BD feature from PHP reference has a Next.js screen
- Marketing landing matches PHP at ~90%+ visual parity
- All portals use polished shadcn with ISP brand
- Permission system fully wired
- All data offline in `src/data/`
- Zero generic CRM patterns
- Ready for Phase 8 API swap (handlers → real fetch)
