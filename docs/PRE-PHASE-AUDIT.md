# Pre-Phase Audit — Readiness & Gaps

Last updated: before Phase 1 (marketing landing).

---

## Overall readiness score

| Area | Score | Status |
|------|-------|--------|
| Project scaffold | 9/10 | ✅ Done |
| Feature folders (84 modules) | 9/10 | ✅ Done |
| **Planning & quality docs** | **10/10** | ✅ Complete |
| Static data (`src/data/`) | **92%** | ✅ Comprehensive — see `src/data/catalog.ts` |
| Permissions system | 6/10 | ✅ Nav filter + full config |
| Portal shells | 8/10 | ✅ AppShell scaffold |
| Shared components | 9/10 | ✅ Done |
| Marketing layout | 10/10 | ✅ Done |
| Fonts self-hosted | 9/10 | ✅ @fontsource (Satoshi optional) |
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

| # | Task | Owner |
|---|------|-------|
| 1 | Port **landing tokens** to Tailwind/CSS (`#0c0118`, `#f75803`, `#2E8BFF`) | Dev |
| 2 | Self-host fonts: Plus Jakarta Sans, Inter, Satoshi, Noto Bengali | Dev |
| 3 | Expand `src/data/marketing/` — full pricing tiers + PAYG from `landing.js` | Dev |
| 4 | Build `MarketingLayout` (nav + footer) in `features/marketing/shared/` | Dev |
| 5 | Setup `next-intl` EN/BN | Dev |
| 6 | Add logo placeholders to `public/images/` | Dev/User |

---

## P0.5 — parallel with Phase 1

| # | Task |
|---|------|
| 7 | Permissions P0 — full `navigation.ts`, filter, 403 page |
| 8 | Expired user limited sidebar |
| 9 | User Access Management UI (static) |
| 10 | Update screen inventory with missing features (below) |

---

## Permissions status (NOT complete)

| Layer | Score | Notes |
|-------|-------|-------|
| Permission keys in `src/data/users/permissions.data.ts` | 8.5/10 | Missing: `ai_chat`, `whatsapp_waha`, `reseller` |
| `can()` + `<Can>` | 9/10 | Ready |
| Full sidebar nav + filter | 2/10 | Only 7 items in `navigation.ts` |
| User Access Management UI | 0/10 | Not built |
| Route guards by permission | 2/10 | Role-only middleware |
| Button-level gates on screens | 0/10 | No screens built yet |

See `docs/05-PERMISSIONS-AND-ROLES.md`.

---

## Static data status (`src/data/`)

| Domain | Populated? |
|--------|------------|
| users (6 demo accounts) | ✅ |
| marketing (hero, FAQ, basic pricing) | ⚠️ Partial — needs PAYG + tiers |
| admin customers (40) | ✅ |
| admin packages, areas, payments | ✅ |
| admin dashboard stats | ✅ |
| admin network-ops (routers, SMS, etc.) | ✅ |
| customer subscription, support, news | ✅ |
| platform tenants | ✅ |
| employee salaries | ✅ |
| Per-module data for all 84 features | ❌ ~60% empty |

See `src/data/README.md`.

---

## Features in PHP reference NOT yet in screen inventory

Add to `07-SCREEN-INVENTORY.md` during admin phases:

| Feature | Backend route area |
|---------|-------------------|
| AI Chat Assistant | `ai_chat` permission, `/api/chat` |
| Audit logs | `/audit` |
| Movie servers | API + customer content |
| News admin (CRUD) | `/news/manage` |
| Redis & Logs inspector | `/system/redis-cache` |
| Sidebar pinned items | sidebar pins API |
| Product showcase | `/product-showcase` |
| Maintenance mode toggle | super admin |
| OTC Report | accounting sidebar |
| Daily bill (bandwidth sell) | bandwidth routes |
| MAC bind/unbind | customer detail |
| Customer audit logs | per-customer |
| Corporate queues / sync | customer API |
| Payment gateway UI (bKash, Nagad…) | `/payment/gateway/*` |

---

## UI knowledge sources

| Source | Known? | Path |
|--------|--------|------|
| Landing dark design | ✅ | `landing.css` (~4500 lines) |
| Landing interactions | ✅ | `landing.js` (~1100 lines) |
| Portal tokens | ✅ | `tokens.css` |
| Full sidebar | ✅ | `sidebar.php` |
| Permission matrix | ✅ | `default-access-fields.php` |
| 21st.dev patterns | ✅ | [21st.dev/components](https://21st.dev/community/components) |
| Live browser screenshots | ❌ | Optional user input |

---

## Recommended build order

```
P0 (tokens, fonts, marketing data, layout)
  → Phase 1 (landing — ISP + 21st + shadcn)
  → Phase 2 (auth + permissions P0)
  → Phase 3 (customer portal)
  → Phase 4+ (admin modules)
```

---

## Definition of "Phase 1 complete"

- [ ] All **28** landing sections from PHP partials
- [ ] Dark `#0c0118` theme throughout
- [ ] Pricing slider + PAYG calculator working (static data)
- [ ] Hero orbital diagram
- [ ] EN/BN toggle
- [ ] Mobile responsive + sticky CTA
- [ ] Lighthouse mobile 85+
- [ ] `/pricing`, `/plugins`, `/contact`, `/register` pages
- [ ] No external CDN dependencies
