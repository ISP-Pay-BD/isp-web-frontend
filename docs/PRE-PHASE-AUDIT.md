# Pre-Phase Audit — Readiness & Gaps

Last updated: **Sep 2026 — P0 complete, Phase 1 ready.**

---

## Overall readiness score

| Area | Score | Status |
|------|-------|--------|
| **Planning & quality docs** | **10/10** | ✅ Complete — all MD specs written |
| Project scaffold | 9/10 | ✅ Done |
| Feature folders (84 modules) | 9/10 | ✅ Done |
| Static data (`src/data/`) | **92%** | ✅ Comprehensive — see `src/data/catalog.ts` |
| Fonts (5 families, folder per font) | 10/10 | ✅ `public/fonts/` + `docs/FONTS.md` |
| Marketing layout | 10/10 | ✅ Done |
| Shared components | 9/10 | ✅ P0 set done |
| Portal shells | 8/10 | ✅ AppShell scaffold |
| Permissions system | 7/10 | ✅ Nav config + filter; UI screens Phase 2+ |
| **Ready for Phase 1?** | **10/10** | ✅ **YES — start landing** |

---

## Phase 0 — completed ✅

- [x] `pnpm create next-app@latest` — Next.js 16 + TypeScript + Tailwind
- [x] shadcn/ui init + core components
- [x] TanStack Query, Zustand, Zod, Sonner, Vitest
- [x] `src/features/` — 84 module folders
- [x] `src/data/` — core dummy data
- [x] `lib/mock-api/` + auth store + `can()` + `<Can>`
- [x] `tests/` outside `src/app`
- [x] `pnpm build` passes

---

## P0 — required before Phase 1 landing

| # | Task | Status |
|---|------|--------|
| 1 | Port **landing tokens** to Tailwind/CSS (`#0c0118`, `#f75803`, `#2E8BFF`) | ✅ |
| 2 | Self-host fonts — 5 families in `public/fonts/` | ✅ — `docs/FONTS.md` |
| 3 | Expand `src/data/marketing/` — pricing tiers + PAYG | ✅ |
| 4 | Build `MarketingLayout` (nav + footer + mobile CTA) | ✅ |
| 5 | Setup `next-intl` EN/BN | ⏳ Phase 1 parallel |
| 6 | Add logo + payment assets to `public/images/` | ✅ |

**P0 gate: ✅ PASSED** — see `P0-READY.md`

---

## P0.5 — parallel with Phase 1 / Phase 2

| # | Task | Status |
|---|------|--------|
| 7 | Full sidebar nav + permission filter | ✅ |
| 8 | User Access Management UI (static) | ⏳ Phase 2 |
| 9 | Expired user limited sidebar | ⏳ Phase 3 |
| 10 | Route guards by permission (403 page) | ⏳ Phase 2 |
| 11 | Update screen inventory with PHP-only features | ⏳ During admin phases |

---

## Permissions status

| Layer | Score | Notes |
|-------|-------|-------|
| Permission keys in `permissions.data.ts` | 8.5/10 | Missing: `ai_chat`, `whatsapp_waha`, `reseller` — add Phase 5 |
| `can()` + `<Can>` | 9/10 | Ready |
| Full sidebar nav config | 9/10 | ✅ `config/navigation/admin.ts` (~50+ items) |
| Nav permission filter | 9/10 | ✅ `useFilteredNav` |
| User Access Management UI | 0/10 | Phase 2 |
| Route guards by permission | 3/10 | Role-only middleware — enhance Phase 2 |
| Button-level gates on screens | 0/10 | No portal screens built yet |

See `docs/05-PERMISSIONS-AND-ROLES.md`.

---

## Static data status (`src/data/`)

| Domain | Populated? |
|--------|------------|
| users (6 demo accounts) | ✅ |
| marketing (hero, FAQ, sections, pricing, PAYG, plugins) | ✅ |
| admin customers (80+) | ✅ |
| admin packages, areas, payments | ✅ |
| admin dashboard, accounting, HR, bandwidth | ✅ |
| admin network-ops (routers, SMS, etc.) | ✅ |
| customer subscription, support, news | ✅ |
| platform tenants, contacts | ✅ |
| employee salaries | ✅ |
| Per-module data for all 84 features | ⚠️ ~92% — remainder during portal phases |

See `src/data/README.md` and `src/data/catalog.ts`.

---

## Features in PHP reference — add to inventory during build

Track in `07-SCREEN-INVENTORY.md` as each admin phase starts:

| Feature | Backend route area | Planned phase |
|---------|-------------------|---------------|
| AI Chat Assistant | `ai_chat` permission | Phase 5 |
| Audit logs | `/audit` | Phase 5 |
| Movie servers | API + customer content | Phase 5 |
| News admin (CRUD) | `/news/manage` | Phase 5 |
| Redis & Logs inspector | `/system/redis-cache` | Phase 6 |
| Sidebar pinned items | sidebar pins API | Phase 7 |
| Product showcase | `/product-showcase` | Phase 5 |
| Maintenance mode toggle | super admin | Phase 6 |
| OTC Report | accounting sidebar | Phase 5 |
| Daily bill (bandwidth sell) | bandwidth routes | Phase 5 |
| MAC bind/unbind | customer detail | Phase 3 |
| Customer audit logs | per-customer | Phase 4 |
| Corporate queues / sync | customer API | Phase 4 |
| Payment gateway UI (bKash, Nagad…) | `/payment/gateway/*` | Phase 5 |

---

## UI knowledge sources

| Source | Known? | Path |
|--------|--------|------|
| Landing dark design | ✅ | `landing.css` (~4500 lines) |
| Landing interactions | ✅ | `landing.js` (~1100 lines) |
| Portal tokens | ✅ | `tokens.css` |
| Full sidebar | ✅ | `sidebar.php` |
| Permission matrix | ✅ | `default-access-fields.php` |
| Font strategy | ✅ | `docs/FONTS.md` |
| 21st.dev patterns | ✅ | [21st.dev/components](https://21st.dev/community/components) |
| Live browser screenshots | ❌ | Optional user input |

---

## Recommended build order

```
P0 ✅ (tokens, fonts, marketing data, layout)
  → Phase 1 (landing — ISP + 21st + Framer Motion)
  → Phase 2 (auth + permissions UI + 403)
  → Phase 3 (customer portal)
  → Phase 4–7 (admin, platform, employee, polish)
  → Phase 8 (API — future)
```

---

## Definition of "Phase 1 complete"

- [ ] All **28** landing sections from PHP partials
- [ ] Dark `#0c0118` theme throughout
- [ ] Pricing slider + PAYG calculator working (static data)
- [ ] Hero orbital diagram
- [ ] EN/BN toggle (`next-intl`)
- [ ] Mobile responsive + sticky CTA
- [ ] Lighthouse mobile 85+
- [ ] `/pricing`, `/plugins`, `/contact`, `/register` pages
- [ ] No external CDN dependencies
