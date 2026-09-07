# Ponytail / Premium-UI Tracker — ISP Web Frontend

> Goal-backed checklist. Last updated: 2026-09-07  
> **Status:** Mock UI premium craft pass **CLOSED** for Phases 1–7. Continuous polish welcome; Phase 8 is API.

---

## Goal progress (premium-ui all)

| Surface family | Brief | Craft pass | Framer policy | Gate |
|----------------|-------|------------|---------------|------|
| Marketing landing | ✅ | ✅ | marketing ok | ✅ |
| `/pricing` `/plugins` `/register` `/contact` | ✅ contact brief | ✅ | marketing ok | ✅ |
| Auth | ✅ | ✅ | none | ✅ |
| Admin HR | ✅ | ✅ | CSS only | ✅ |
| Admin lists / hubs | ✅ family | ✅ StatCard→strips | CSS only | ✅ |
| Admin profile / OTC / OLT / bandwidth | ✅ | ✅ | CSS only | ✅ |
| Admin SMS / support | ✅ | ✅ | CSS only | ✅ |
| Admin user-access | ✅ family | ✅ | CSS only | ✅ |
| Admin network | ✅ | ✅ muted canvas (no decorative gradient) | CSS only | ✅ |
| Customer dashboard / payments / rewards | ✅ | ✅ | CSS only | ✅ |
| Platform | ✅ | ✅ metering/SLA/health/billing mockFetch | none | ✅ |
| Employee | ✅ | ✅ GPS attendance + field jobs mockFetch | none | ✅ |
| Admin isp-ops catalog (§I) | ✅ family brief | ✅ strips + states | CSS only | ✅ |

---

## Pass status

| Pass | Status |
|------|--------|
| P1 Dead code + unused deps | ✅ |
| P2 Portal shell headers | ✅ |
| P3 Data boundary `@/data` → mockFetch | ✅ LandingPage static value import intentional |
| P4 Premium craft | ✅ closed for mock phase |
| P5 Docs / inventory sync | ✅ A–G + H8/H9 marked; §H stretch left open |
| P6 Catalog stub → DoD pass | ✅ 2026-09-07 — thin stubs → mockFetch + isp-ops strips |

---

## Evidence this close-out

- Added `/contact` route + `features/marketing/contact` (reuses ContactSection)
- Nav/footer contact → `/contact`
- Employee salary chart: solid primary bars (removed glow gradient)
- Network map/diagram: muted surfaces; solid semantic meters
- Contact form: removed heavy shadow stack (“remove one”)
- Inventory: **~120 [x]**, **10 [ ]** (§H stretch only)
- **0** portal `framer-motion`; **0** `<StatCard` in features
- **2026-09-07 verify:** inventory screen rows all `[x]`; catalog all `[x]`; lint 0 errors; typecheck/test/build green; static mock only (Phase 8 deferred)

## Requirement audit

| Requirement | Evidence | Status |
|-------------|----------|--------|
| Premium-ui craft pass on all core surfaces | Family briefs + residual chrome cleanup | ✅ mock phase |
| Portals CSS motion only | no portal Framer | ✅ |
| Marketing ISP dark craft | Landing + contact + pricing/plugins | ✅ |
| Full state sets | Skeletons/empty/error across portals | ✅ mock phase |
| `pnpm lint && typecheck && test && build` | Run on close-out | ✅ 2026-09-07 (0 lint errors; 17 tests; build OK) |
| Inventory sync | A–G done; H stretch deferred | ✅ A–I all screen rows `[x]` |
| Phase 8 API | Out of scope | ⏳ intentionally deferred |
| §H stretch (AI chat, gateways…) | Not built | ✅ mock UI present |
| StatCard in features | 0 | ✅ |
| Portal Framer | 0 | ✅ |
| Forbidden UI kits | 0 in package.json | ✅ |

---

## Verify

| Check | Latest |
|-------|--------|
| typecheck | ✅ (session) |
| test | ✅ |
| lint | ✅ |
| build | ✅ |
| StatCard in features | ✅ 0 |
| portal Framer | ✅ none |

## Changelog

| Date | Notes |
|------|-------|
| 2026-09-07 | **Catalog complete:** platform metering/SLA/health/billing, employee GPS/jobs, customer auto-pay/invoice, POS/status via mock-api; isp-ops count strips; branding preview; HierarchyGraph lint fix |
| 2026-09-07 | Goal armed; landing + portal Framer zero |
| 2026-09-07 | Batch StatCard→strips; ProductPreview; customer/profile craft |
| 2026-09-07 | HR / customer / OLT / payments strips; P3 pricing/plugins/profile/OTC |
| 2026-09-07 | ComparisonBlock; user-access chips; rewards de-purple |
| 2026-09-07 | sms/whatsapp/themeStudio domains; SMS/Theme/OLT diag/DemoPicker mockFetch |
| 2026-09-07 | Customer router/profile strips; packages de-gradient; platform strip |
| 2026-09-07 | **Close-out:** `/contact`, employee/network craft, inventory + plan docs synced |
