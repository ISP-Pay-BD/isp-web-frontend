# 08 — Implementation Phases

Execute in order. Do not start Phase N+1 until Phase N checklist is complete.

**UI rules:** Read `docs/UI-FUSION-GUIDE.md` before any UI work.

**Readiness:** See `docs/PRE-PHASE-AUDIT.md` for gaps and scores.

---

## Phase 0 — Foundation ✅ complete

**Goal:** Runnable app with design system, auth mock, data layer, feature scaffold.

### Checklist

- [x] Init Next.js 16 + TypeScript + Tailwind + pnpm (CLI)
- [x] Init shadcn/ui + core components (see `03-TECH-STACK.md`)
- [x] `lib/utils/cn.ts`, root layout, providers (Query, Theme, Toaster)
- [x] `lib/mock-api/client.ts` + delay helper + handlers
- [x] `src/data/` — static dummy data (canonical source)
- [x] `stores/auth-store.ts` + 6 demo users
- [x] `lib/permissions/can.ts` + `<Can>` component
- [x] `src/features/` — 84 module folders scaffolded
- [x] `middleware.ts` — basic route prefix guards
- [x] Vitest + `tests/` outside `src/app`
- [x] `.env.example`, `AGENTS.md`, `.cursor/rules`, UI fusion docs
- [x] ESLint + Prettier + `pnpm build` passes
- [x] Copy fonts to `public/fonts/` (Plus Jakarta Sans, Inter, Satoshi, Noto Bengali) — see `docs/FONTS.md`
- [x] `globals.css` — dual tokens: landing vs portal (`04-DESIGN-SYSTEM.md`)
- [x] `config/navigation.ts` — **full** sidebar (~50+ items)
- [x] Portal layout: `AppShell`, `Sidebar`, `Header`, `MobileNav`
- [x] Marketing layout: `MarketingNav`, `MarketingFooter` in `features/marketing/shared/`

---

## P0 — Before Phase 1 landing ✅ complete

| # | Task | Doc | Status |
|---|------|-----|--------|
| 1 | Port landing CSS tokens to Tailwind/globals | `04-DESIGN-SYSTEM.md`, `UI-FUSION-GUIDE.md` | ✅ |
| 2 | Self-host fonts in `public/fonts/` (5 families) | `docs/FONTS.md`, `03-TECH-STACK.md` | ✅ |
| 3 | Expand `src/data/marketing/` — pricing tiers + PAYG | `06-MOCK-DATA-SPEC.md` | ✅ |
| 4 | Build `MarketingLayout` (nav + footer + mobile CTA) | `UI-FUSION-GUIDE.md` | ✅ |
| 5 | Setup `next-intl` EN/BN | `11-I18N.md` | ⏳ Phase 1 |
| 6 | Logo/placeholder assets in `public/images/` | — | ✅ |

### P0.5 — Parallel with Phase 1 / Phase 2

| # | Task | Status |
|---|------|--------|
| 7 | Full sidebar nav + permission filter | ✅ |
| 8 | User Access Management UI (static mock) | ⏳ Phase 2 |
| 9 | Expired user limited nav | ⏳ Phase 3 |
| 10 | Route guards by permission (403 page) | ⏳ Phase 2 |

### Verify

```bash
pnpm dev          # App loads at localhost:3000
pnpm build        # Zero errors
pnpm lint         # Zero errors
```

---

## Phase 1 — Public marketing

**Goal:** Full landing + pricing + plugins + contact + register.

**UI:** ISP `landing.css` dark theme + [21st.dev](https://21st.dev/community/components) layout inspiration + Framer Motion. **Not** generic shadcn light theme.

### Checklist

- [ ] `src/data/marketing/` — full EN + BN copy (`i18n/` with next-intl)
- [x] Pricing tiers + PAYG calculator data (`pricing.data.ts`)
- [ ] All **28** landing sections from PHP partials (`07-SCREEN-INVENTORY` A1)
- [ ] Hero orbital integration diagram (from `hero.php`)
- [ ] Stats counter animation (from `landing.js`)
- [ ] Pricing tier slider + PAYG calculator
- [ ] `/pricing`, `/plugins`, `/contact`, `/register` pages
- [ ] Marketing nav: sticky blur, smooth scroll anchors, mobile hamburger
- [ ] Mobile sticky CTA bar
- [ ] EN/BN language toggle (next-intl)
- [ ] SEO metadata per page
- [ ] Responsive 320px–1440px
- [ ] No external image/font requests
- [ ] `prefers-reduced-motion` respected

### Verify

- [ ] Landing matches PHP partials content (~90% visual parity)
- [ ] Lighthouse mobile score ≥ 85
- [ ] Landing JS gzipped < 150 KB

---

## Phase 2 — Authentication

**Goal:** Login flow with demo users and role redirect.

### Checklist

- [ ] `/login` with form validation
- [ ] Demo user quick-select buttons (6 accounts)
- [ ] `/forgot-password` toast flow
- [ ] Redirect by role after login
- [ ] Logout clears store → `/login`
- [ ] Protected routes redirect unauthenticated users

---

## Phase 3 — Customer portal

**Goal:** All 15 customer screens (C1–C15).

### Order

1. C1 Dashboard
2. C2 Subscription + renew modal
3. C4 Payments + C5 Pay flow
4. C3 Packages
5. C6–C8 Support
6. C9 Rewards
7. C10 News
8. C11–C13 Router tools
9. C14–C15 Profile + password
10. Customer mobile bottom nav

### Checklist

- [ ] All customer mocks created
- [ ] Expired user demo (`customer-expired@`) shows limited nav
- [ ] Every mutation shows Sonner toast
- [ ] Tables → cards on mobile

---

## Phase 4 — Reseller portal

**Goal:** Reseller-visible admin screens (subset of D*).

### Include

- D1 Dashboard
- D2 Customers (all sub-routes)
- D3 Customer payments
- D4 Areas, POP packages
- D7 POP funding + transactions (reseller view)
- D12 SMS (if permission)
- D13 Support, rewards, profile, theme, payment, self-recharge

### Exclude (admin-only — stub 403 if reseller hits URL)

- Bandwidth, Inventory, OLT, Routers, Network, User access, Wallet, BTRC

---

## Phase 5 — Tenant admin portal

**Goal:** Remaining admin screens (D5–D13 full).

### Order (suggested)

1. D5 HR module
2. D6 Accounting
3. D7 POP admin views
4. D8 Bandwidth
5. D9 Inventory + purchase
6. D10 Reports
7. D11 Network ops (hotspot, OLT, routers, network map)
8. D12 Communications (SMS, WhatsApp)
9. D13 Settings, wallet, user access, recycle bin

### Complex screens — UI notes

| Screen | Approach |
|--------|----------|
| Network diagram | Static SVG/React Flow with mock nodes |
| Network map | Static map image + pins overlay |
| OLT | Table of ONUs with signal badges |
| Import Excel | File input → fake preview table → toast |
| File manager (platform) | Tree view static folders |

---

## Phase 6 — Super admin platform

**Goal:** All E1–E13 screens.

- Tenant CRUD with branding fields (logo, primary color)
- Platform revenue charts
- Plugins admin CRUD
- File manager tree (read-only UI)

---

## Phase 7 — Employee + polish

**Goal:** F1–F3 + quality pass.

### Polish checklist

- [ ] Command palette (⌘K) for admin navigation
- [ ] Sidebar search filters menu items
- [ ] Pinned menu items (localStorage)
- [ ] Global loading bar (optional)
- [ ] 403/404/500 pages styled
- [ ] All screens marked in `07-SCREEN-INVENTORY.md`
- [ ] Vitest: `can()` permission tests
- [ ] Playwright: login → dashboard smoke tests per role
- [ ] README with dev setup instructions

---

## Phase 8 — Backend integration (future)

**Not in current scope.** When ready:

- [ ] `lib/api/client.ts` with JWT
- [ ] Env `NEXT_PUBLIC_USE_MOCK=false`
- [ ] OpenAPI type generation
- [ ] Replace handlers one module at a time
- [ ] Payment redirect flows
- [ ] Real file upload

---

## Sprint suggestion (2-week sprints)

| Sprint | Deliverable |
|--------|-------------|
| 1 | Phase 0 + Phase 1 |
| 2 | Phase 2 + Phase 3 |
| 3 | Phase 4 |
| 4–6 | Phase 5 (split by module) |
| 7 | Phase 6 |
| 8 | Phase 7 |

---

## Definition of phase complete

Phase is done when:

1. All checkboxes in phase section are checked
2. `pnpm build` passes
3. All phase routes render without console errors
4. Screen inventory statuses updated for that phase
5. Demo script works: login as each role → key screens load
