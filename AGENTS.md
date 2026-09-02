# AGENTS.md — ISP Web Frontend

Instructions for AI agents and contributors working on `isp-web-frontend`.

## First steps every session

1. Read `docs/12-AI-CODING-RULES.md`
2. Check `docs/08-IMPLEMENTATION-PHASES.md` for current phase
3. Check `docs/07-SCREEN-INVENTORY.md` for screen status

## Project goal (Phase 1)

Build **100% of the UI** mirroring `isppaybd_isp` with **static mock data only**:

- All portals: marketing, customer, admin, reseller, super-admin, employee
- Permission-based navigation and buttons
- Fully offline — no API, no CDN
- Responsive: mobile, tablet, desktop
- Sonner toasts on all mutations

Backend (`zapi/`) integration is **Phase 8** — not now.

## Stack (locked)

| Layer | Choice |
|-------|--------|
| Framework | Next.js 15 App Router |
| Language | TypeScript strict |
| Styling | Tailwind CSS v4 + shadcn/ui |
| Icons | Lucide React |
| Data | TanStack Query + `lib/mock-api/` |
| State | Zustand (auth) |
| Forms | React Hook Form + Zod |
| Toasts | Sonner |
| i18n | next-intl (EN + BN) |
| Package manager | pnpm |

**Do not add:** MUI, Chakra, Ant Design, jQuery, DaisyUI, Axios.

## Architecture rules

```
app/           → thin routes only
features/      → domain UI + hooks + schemas
lib/mock-api/  → ONLY data access layer (Phase 1)
mocks/         → static data (imported by handlers only)
components/ui/ → shadcn primitives
config/        → navigation, site, theme
```

**Never** import `@/mocks/*` from features or components.

## Design

- Primary: `#f75803`
- Secondary: `#1a0b38`
- Fonts: Satoshi, Noto Sans Bengali (self-hosted)
- See `docs/04-DESIGN-SYSTEM.md`

## Permissions

5 roles: `super_admin`, `admin`, `resellerAdmin`, `employee`, `user`

Use `can(menu, action)` and `<Can>` component. Full matrix: `docs/05-PERMISSIONS-AND-ROLES.md`.

Demo logins: `docs/05-PERMISSIONS-AND-ROLES.md` → Demo users table.

## Git

- PR workflow only — no direct merge to `main`/`test`
- Never delete `main` or `test` branches
- Do not commit unless user explicitly asks

## Backend repo

`isppaybd_isp` is read-only reference during Phase 1.

When API work is needed later:
- API routes in `zapi/config/api_routes.php`
- Controllers in `zapi/` only
- Do not modify legacy `app/Controllers/api`

## Verification

Before marking work complete:

```bash
pnpm lint
pnpm build
```

Plus manual check: 320px + 1440px, dark mode, toast on submit, permissions.

## Screen completion

Update `docs/07-SCREEN-INVENTORY.md` status `[ ]` → `[x]` when done.
