# PROJECT MEMORY — ISP Web Frontend

> **AI agents:** Read this file at the start of every session for instant project context.

## One-line summary

Next.js 16 frontend for **ISP Pay BD** — full UI migration from `isppaybd_isp` using **offline static mock data** first; real `zapi/` API later.

## Current status

| Item | State |
|------|-------|
| Phase | **0 — Foundation** (CLI initialized) |
| Next.js | 16.3.4 (create-next-app) |
| UI | shadcn/ui (base-nova) + Tailwind v4 |
| Data | Mock API only (`NEXT_PUBLIC_USE_MOCK=true`) |
| Backend | Not connected |

## What this repo is

```
isp-web-frontend/     ← YOU ARE HERE (Next.js UI)
isppaybd_isp/         ← Reference backend (CodeIgniter 4 + zapi/)
```

## Architecture (clean layers)

```
src/app/              Routes only (thin pages)
src/features/         Domain modules (UI + hooks + schemas)
src/components/       Shared UI (ui/, layout/, shared/, marketing/)
src/lib/mock-api/     ONLY data access in Phase 1
src/mocks/            Static data (handlers import this — NOT components)
src/stores/           Zustand (auth, UI)
src/config/           navigation, site metadata
src/types/            Shared TypeScript types

tests/                OUTSIDE src/app — architecture + unit tests
  tests/architecture/ Folder boundary & structure tests
  tests/unit/         Pure logic tests (permissions, utils)
  tests/setup/        Vitest setup
```

## Golden rules

1. **Never** import `@/mocks/*` from `features/` or `components/` — use `mockFetch()` from `@/lib/mock-api/client`
2. **Never** call external APIs in Phase 1
3. Every form → Zod + toast (Sonner)
4. Every admin button → `<Can menu action>`
5. Follow phases in `docs/08-IMPLEMENTATION-PHASES.md`

## Portals to build (~118 screens)

| Portal | Route prefix | Role |
|--------|--------------|------|
| Marketing | `/`, `/pricing`, `/plugins` | guest |
| Auth | `/login` | all |
| Customer | `/customer/*` | `user` |
| Admin/Reseller | `/admin/*` | `admin`, `resellerAdmin` |
| Super admin | `/platform/*` | `super_admin` |
| Employee | `/employee/*` | `employee` |

Full screen list: `docs/07-SCREEN-INVENTORY.md`

## Demo logins (mock auth)

| Email | Password | Role |
|-------|----------|------|
| customer@demo.isppaybd.com | demo1234 | user |
| customer-expired@demo.isppaybd.com | demo1234 | user (expired) |
| reseller@demo.isppaybd.com | demo1234 | resellerAdmin |
| admin@demo.isppaybd.com | demo1234 | admin |
| employee@demo.isppaybd.com | demo1234 | employee |
| super@demo.isppaybd.com | demo1234 | super_admin |

## Brand tokens

- Primary: `#f75803` (orange)
- Secondary: `#1a0b38` (violet)
- Radius: 12px
- Fonts: Satoshi + Noto Sans Bengali (self-host in `public/fonts/` — Phase 1)

## Key files

| File | Purpose |
|------|---------|
| `src/lib/mock-api/client.ts` | Mock data access |
| `src/stores/auth-store.ts` | Auth session |
| `src/lib/permissions/can.ts` | Permission checks |
| `src/config/navigation.ts` | Sidebar items |
| `src/mocks/users/demo-users.mock.ts` | Demo accounts |
| `docs/07-SCREEN-INVENTORY.md` | All screens |
| `docs/12-AI-CODING-RULES.md` | Coding rules |

## CLI setup history

Project initialized with official commands:

```bash
pnpm create next-app@latest . --typescript --tailwind --eslint --app --src-dir --import-alias "@/*" --turbopack --yes
pnpm dlx shadcn@latest init --defaults --force
pnpm dlx shadcn@latest add sonner card input ... sidebar --yes
```

## Next work

Phase 1: Marketing landing page — see `docs/08-IMPLEMENTATION-PHASES.md`
