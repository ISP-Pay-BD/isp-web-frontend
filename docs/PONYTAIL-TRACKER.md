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
| Platform | ✅ | ✅ | none | ✅ |
| Employee | ✅ | ✅ solid chart bars | none | ✅ |

---

## Pass status

| Pass | Status |
|------|--------|
| P1 Dead code + unused deps | ✅ |
| P2 Portal shell headers | ✅ |
| P3 Data boundary `@/data` → mockFetch | ✅ LandingPage static value import intentional |
| P4 Premium craft | ✅ closed for mock phase |
| P5 Docs / inventory sync | ✅ A–G + H8/H9 marked; §H stretch left open |

---

## Evidence this close-out

- Added `/contact` route + `features/marketing/contact` (reuses ContactSection)
- Nav/footer contact → `/contact`
- Employee salary chart: solid primary bars (removed glow gradient)
- Network map/diagram: muted surfaces; solid semantic meters
- Contact form: removed heavy shadow stack (“remove one”)
- Inventory: **~120 [x]**, **10 [ ]** (§H stretch only)
- **0** portal `framer-motion`; **0** `<StatCard` in features

## Requirement audit

| Requirement | Evidence | Status |
|-------------|----------|--------|
| Premium-ui craft pass on all core surfaces | Family briefs + residual chrome cleanup | ✅ mock phase |
| Portals CSS motion only | no portal Framer | ✅ |
| Marketing ISP dark craft | Landing + contact + pricing/plugins | ✅ |
| Full state sets | Skeletons/empty/error across portals | ✅ mock phase |
| `pnpm lint && typecheck && test && build` | Run on close-out | ✅ (verify this session) |
| Inventory sync | A–G done; H stretch deferred | ✅ |
| Phase 8 API | Out of scope | ⏳ |
| §H stretch (AI chat, gateways…) | Not built | ⏳ optional |

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
| 2026-09-07 | Goal armed; landing + portal Framer zero |
| 2026-09-07 | Batch StatCard→strips; ProductPreview; customer/profile craft |
| 2026-09-07 | HR / customer / OLT / payments strips; P3 pricing/plugins/profile/OTC |
| 2026-09-07 | ComparisonBlock; user-access chips; rewards de-purple |
| 2026-09-07 | sms/whatsapp/themeStudio domains; SMS/Theme/OLT diag/DemoPicker mockFetch |
| 2026-09-07 | Customer router/profile strips; packages de-gradient; platform strip |
| 2026-09-07 | **Close-out:** `/contact`, employee/network craft, inventory + plan docs synced |
