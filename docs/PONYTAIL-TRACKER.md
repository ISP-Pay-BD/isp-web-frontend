# Ponytail Tracker — ISP Web Frontend

> Live checklist for YAGNI cleanup + UI/UX completion.  
> Last updated: 2026-09-07  
> Mode: **ponytail full** (delete first, then polish)

---

## Verdict

| Metric | Value |
|--------|------:|
| Simplicity score (pre) | 4.9 / 10 |
| Routes | 123 |
| P1+P2 this session | Done (partial portal Framer left on some pages) |

---

## Pass status

| Pass | Scope | Status |
|------|-------|--------|
| **P1** Dead code + unused deps | Delete stubs, dead hooks, unused packages | ✅ Done |
| **P2** Portal motion + headers | Static headers/shell; one PageHeader API | ✅ Core done |
| **P3** Data boundary | Runtime `@/data` → `mockFetch` only | ⬜ Queued |
| **P4** UI/UX polish | Hero budget, accent discipline, states | ⬜ Queued |
| **P5** Docs sync | PLAN-STATUS + inventory match code | ⬜ Queued |

---

## P1 — Dead code

| # | Item | Status |
|---|------|--------|
| 1.1 | Delete `use-landing-data.ts` | ✅ |
| 1.2 | Delete `PageTransition.tsx` | ✅ |
| 1.3 | Delete stub handlers (admin, payments, support, customers, dashboard) | ✅ |
| 1.4 | Delete `src/mocks/` | ✅ |
| 1.5 | Delete empty feature index stubs | ✅ |
| 1.6 | Delete 83 generic feature `README.md` stubs | ✅ |
| 1.7 | Remove deps: `cn`, `date-fns`, `embla-carousel-react`, `nuqs`, `vaul`, `next-intl` | ✅ |
| 1.8 | Move `shadcn` → `devDependencies` | ✅ |
| 1.9 | Replace `getRoleHomePath` with `ROLE_HOME` | ✅ |

---

## P2 — Portal motion + headers

| # | Item | Status |
|---|------|--------|
| 2.1 | `PageHero` / `PageContent` → plain divs | ✅ |
| 2.2 | `PortalContentTemplate` → no Framer | ✅ |
| 2.3 | `EmptyState` → no Framer | ✅ |
| 2.4 | Canonical `PageHeader` (breadcrumb/breadcrumbs, url/href) | ✅ |
| 2.5 | Thin re-exports admin/shared/platform | ✅ |
| 2.6 | `StatCard` / `SpotlightCard` static surfaces | ✅ |
| 2.7 | Admin dashboard + ChartTooltip Framer removed | ✅ |
| 2.8 | Remaining admin page `motion.*` staggers | ⬜ Optional later |
| 2.9 | Marketing Framer kept (`Reveal`, hero, pricing) | keep |

---

## P3 — Data boundary (queued)

| # | Item | Status |
|---|------|--------|
| 3.1 | Route runtime `@/data` through handlers | ⬜ |
| 3.2 | Architecture test: no runtime `@/data` in features | ⬜ |
| 3.3 | Replace `admin.domain` god-key | ⬜ later |

---

## P4 — UI/UX polish (queued — not one-shot)

| # | Surface | Work | Status |
|---|---------|------|--------|
| 4.1 | Marketing hero | Brand + 1 headline + 1 CTA + 1 visual | ⬜ |
| 4.2 | Admin dashboard | Denser ops layout (less KPI-template) | ⬜ |
| 4.3 | Status colors | One accent + ≤4 semantic hues | ⬜ |
| 4.4 | Radius | Prefer `lg` / `xl` / `full` | ⬜ |
| 4.5 | Shared empty/error/skeleton | Dedupe portal clones when touching | ⬜ |

> **ponytail:** Perfect UI/UX for 123 routes is multi-week. Say which surface next (e.g. “landing hero” or “admin customers”).

---

## P5 — Docs sync (queued)

| # | Item | Status |
|---|------|--------|
| 5.1 | Update `PLAN-STATUS.md` | ⬜ |
| 5.2 | Mark built screens in inventory after DoD | ⬜ |
| 5.3 | `/contact` route vs landing section | ⬜ |

---

## Do not delete

- Auth / permission guards / middleware
- Zod + RHF validation
- Loading / empty / error / success states
- `mockFetch` typed client
- TanStack Query / Table
- Marketing Framer Motion
- Self-hosted fonts

---

## Verify gate

```bash
pnpm lint && pnpm typecheck && pnpm test && pnpm build
```

| Check | Result |
|-------|--------|
| typecheck | ✅ pass |
| test | ✅ 17/17 |
| build | ✅ pass |
| lint | warnings OK if 0 errors |

---

## Changelog

| Date | Pass | Notes |
|------|------|-------|
| 2026-09-07 | Audit | Score 4.9; ~1,280 low-risk lines identified |
| 2026-09-07 | P1+P2 | Dead code/deps removed; headers unified; portal shell static |
