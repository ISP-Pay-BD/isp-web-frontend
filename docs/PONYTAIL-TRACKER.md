# Ponytail / Premium-UI Tracker — ISP Web Frontend

> Goal-backed checklist. Last updated: 2026-09-07  
> **Active goal:** Complete premium-ui across ALL surfaces (do not mark complete until audit proves every surface).

---

## Goal progress (premium-ui all)

| Surface family | Brief | Craft pass | Framer policy | Gate |
|----------------|-------|------------|---------------|------|
| Marketing landing | ✅ | ✅ | marketing ok | ✅ |
| `/pricing` `/plugins` `/register` | ⬜ inherit | ✅ mockFetch | marketing ok | ✅ |
| Auth | ✅ | ✅ demoCredentials mockFetch | none | ✅ |
| Admin HR | ✅ | ✅ | CSS only | ✅ |
| Admin lists / hubs | ⬜ | ✅ StatCard→strips; FreeRequests strip | CSS only | ✅ |
| Admin profile / OTC / OLT / bandwidth | ✅ OLT/packages/bandwidth | ✅ | CSS only | ✅ |
| Admin SMS / support | ✅ | ✅ domains wired | CSS only | ✅ |
| Admin user-access | ⬜ | ✅ role chips | CSS only | ✅ |
| Customer dashboard / payments / rewards | ✅ | ✅ | CSS only | ✅ |
| Platform | ✅ family brief | ✅ | none | ✅ |
| Employee | ✅ | salaries strip | none | ⬜ deeper |

---

## Pass status

| Pass | Status |
|------|--------|
| P1 Dead code + unused deps | ✅ |
| P2 Portal shell headers | ✅ |
| P3 Data boundary `@/data` → mockFetch | 🔄 nearly done — LandingPage intentional static only (value import) |
| P4 Premium craft | 🔄 wide strip/KPI cleanup; residual chrome on some customer/network/theme surfaces |
| P5 Docs / inventory sync | ⬜ |

---

## Evidence this continuation

- mock-api domains: `sms`, `whatsapp`, `themeStudio` (+ existing `profile`)
- P3 migrations: SMS compose targets, Theme Studio presets, OLT diagnostics, DemoUserPicker → `mockFetch`
- FreeRequests KPI cards → summary strip; OLT diagnostics summary → strip
- Softened font-black / animate-in / map scale on customers, network, theme-studio, OLT
- DESIGN_BRIEF added: support, sms, bandwidth, platform (+ prior HR/customer/employee/packages/OLT/payments)
- **0** portal `framer-motion` imports; **0** `<StatCard` in features
- Verify: typecheck ✅ · lint 0 errors · test 17/17 · build ✅

## Requirement audit (incomplete — goal stays open)

| Requirement | Evidence | Status |
|-------------|----------|--------|
| Premium-ui on ALL surfaces (marketing, auth, admin, customer, platform, employee) | Wide craft pass; residual chrome still on some screens | 🔄 incomplete |
| Every screen: design read → refs → DESIGN_BRIEF → build → gate → remove one | **15** briefs vs **117** `*Page.tsx` files — many screens inherit family briefs only | 🔄 incomplete |
| Portals CSS motion only (no Framer except legitimate AnimatePresence) | `rg` portal framer: **none**; marketing Framer remains (allowed) | ✅ |
| Marketing intentional ISP dark craft | Landing sections polished; not fully screenshot-gated | 🔄 weak visual proof |
| Full state sets (loading/empty/error/success) | Many pages have skeletons/empty/error; not audited page-by-page | 🔄 incomplete |
| `pnpm lint && typecheck && test && build` | lint 0 errors · typecheck ✅ · test 17/17 · build ✅ | ✅ |
| Update PONYTAIL-TRACKER | Updated this session | ✅ |
| Audit proves every surface before complete | This table — gaps remain | ❌ not proven |

**Do not UpdateGoal complete** until every row is ✅ with strong evidence.

---

## Verify

| Check | Latest |
|-------|--------|
| typecheck | ✅ |
| test | ✅ 17/17 |
| lint | ✅ 0 errors (114 warnings) |
| build | ✅ |
| StatCard in features | ✅ 0 |
| portal Framer | ✅ none |
| runtime `@/data` value imports | 🔄 LandingPage only (intentional) |

## Changelog

| Date | Notes |
|------|-------|
| 2026-09-07 | Goal armed; landing + portal Framer zero |
| 2026-09-07 | Batch StatCard→strips; ProductPreview; customer/profile craft |
| 2026-09-07 | HR / customer / OLT / payments strips; P3 pricing/plugins/profile/OTC |
| 2026-09-07 | ComparisonBlock; user-access chips; rewards de-purple |
| 2026-09-07 | sms/whatsapp/themeStudio domains; SMS/Theme/OLT diag/DemoPicker mockFetch; FreeRequests strip; support/sms/bandwidth/platform briefs |
| 2026-09-07 | Customer router/profile strips; packages de-gradient; platform user-access strip; audit table (goal incomplete) |
