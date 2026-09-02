# 00 — Project Overview

## What this project is

**ISP Pay BD Web Frontend** is a modern **Next.js 15** application that replaces the server-rendered UI of the legacy **ISP Pay BD** platform (`isppaybd_isp`).

| Attribute | Value |
|-----------|-------|
| Repo | `isp-web-frontend` |
| Reference backend | `isppaybd_isp` (CodeIgniter 4) |
| Product | Multi-tenant ISP billing & operations SaaS for Bangladesh |
| Domain (prod) | isppaybd.com |
| Domain (staging) | test.isppaybd.com |

## Phase 1 goal (current scope)

Build **100% of the UI** with **static/mock data only** — as a **premium ISP operations platform**, not a generic CRM:

- ✅ Every portal screen from landing through super-admin (~132 screens)
- ✅ Permission-based navigation and button visibility
- ✅ Forms validate and submit → toast + local state update
- ✅ Fully offline after `pnpm build` — no API, no CDN fonts/images
- ✅ High visual quality — ISP brand fidelity + modern components + purposeful animation
- ❌ No real JWT, no payment gateway, no MikroTik — **backend comes later**

**Quality docs:** `QUALITY-STANDARDS.md`, `DEFINITION-OF-DONE.md`, `MASTER-BUILD-PLAN.md`

## Five user portals to replicate

| Portal | Role key | Description |
|--------|----------|-------------|
| **Public marketing** | guest | Landing, pricing, plugins, register, contact |
| **Customer** | `user` | Subscription, payments, support, rewards, news |
| **Reseller (POP)** | `resellerAdmin` | Scoped ISP operations under a tenant |
| **Tenant admin** | `admin` | Full ISP back-office for one tenant |
| **Super admin** | `super_admin` | SaaS platform owner |
| **Employee** | `employee` | Staff self-service (salary, advance) |

## Special session states

| State | Behavior |
|-------|----------|
| **Active** | Full sidebar per role + permissions |
| **Expired (`inactive`)** | Limited sidebar: packages, subscription/self-recharge, payment only |
| **Demo mode** | Dev toolbar to switch role without re-login |

## Success criteria (Definition of Done)

A screen is **done** when ALL criteria in **`DEFINITION-OF-DONE.md`** pass, including:

1. Route exists and is listed in `07-SCREEN-INVENTORY.md`
2. Renders correctly at **320px, 768px, 1024px, 1440px**
3. Uses mock data via `lib/mock-api/` — never imports `@/data` in components
4. Permission gates applied (sidebar item, page access, action buttons)
5. Loading skeleton, empty state, and error state implemented
6. Form screens: Zod validation + Sonner toast on success/error
7. Dark mode works on portals; marketing is dark-only
8. No external network requests at runtime (fonts/images local)
9. TypeScript strict — no `any` without comment
10. Matches design tokens + UI fusion guide
11. Looks like **ISP Pay BD** — not generic CRM (see `QUALITY-STANDARDS.md`)

## Estimated scope

| Category | Approx. count |
|----------|---------------|
| Unique routes/pages | ~130–150 |
| Feature modules | ~35 |
| Mock data files | ~40 |
| Demo users | 5 (+ 1 expired variant each) |
| Landing sections | 20+ |

## Timeline estimate (static UI)

| Phase | Duration |
|-------|----------|
| 0 Foundation | 2–3 days |
| 1 Marketing | 3–4 days |
| 2 Auth | 1 day |
| 3 Customer | 4–5 days |
| 4 Reseller | 5–7 days |
| 5 Tenant admin | 15–20 days |
| 6 Super admin | 3–4 days |
| 7 Employee + polish | 3–4 days |
| **Total** | **~6–8 weeks** |

## Future phase (not now)

When backend is ready:

1. Replace `lib/mock-api/` with `lib/api/` calling `zapi/` endpoints
2. Real JWT auth (access + refresh cookies)
3. Payment gateway redirect flows
4. Generate TypeScript types from `zapi/swagger-ui/swagger.json`

Keep mock layer behind the same interface so swap is one folder change.

## Open decisions (defaults if user silent)

| Question | Default |
|----------|---------|
| Language | EN + BN from start (customer + marketing) |
| Mobile nav (portal) | Bottom sheet nav for customer; drawer sidebar for admin |
| Design | Match ISP Pay BD tokens; modernize with shadcn + subtle motion |
| Demo users | 5 preset accounts in mock auth |
| Brand assets | Placeholder logo until user provides files |
