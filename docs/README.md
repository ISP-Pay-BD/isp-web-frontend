# ISP Pay BD — Frontend Documentation Index

> **Purpose:** Complete specification for building the Next.js frontend (`isp-web-frontend`) as a **fully offline, static-data UI** that mirrors the legacy PHP app (`isppaybd_isp`). Backend API integration comes later.

## How AI agents should use these docs

1. Read **`00-OVERVIEW.md`** first — scope, constraints, success criteria.
2. Read **`12-AI-CODING-RULES.md`** — mandatory rules before writing code.
3. Follow **`08-IMPLEMENTATION-PHASES.md`** in order — do not skip Phase 0.
4. For each screen, open **`07-SCREEN-INVENTORY.md`** — route, components, mock file, permissions.
5. Use **`05-PERMISSIONS-AND-ROLES.md`** for sidebar, route guards, button visibility.
6. Use **`06-MOCK-DATA-SPEC.md`** for all static data shapes and demo users.
7. Use **`04-DESIGN-SYSTEM.md`** for colors, typography, spacing, dark mode.
8. Use **`09-COMPONENTS-AND-PATTERNS.md`** for reusable UI patterns.
9. Use **`10-RESPONSIVE-AND-MOBILE.md`** for breakpoints and mobile layouts.

## Document map

| Doc | Title | Use when |
|-----|-------|----------|
| [**PROJECT-MEMORY.md**](./PROJECT-MEMORY.md) | **AI quick context** | **Every AI session start** |
| [00-OVERVIEW.md](./00-OVERVIEW.md) | Project overview | Starting the project |
| [01-ARCHITECTURE.md](./01-ARCHITECTURE.md) | System architecture | Structuring code |
| [02-FOLDER-STRUCTURE.md](./02-FOLDER-STRUCTURE.md) | Folder layout | Creating files |
| [03-TECH-STACK.md](./03-TECH-STACK.md) | Libraries & tools | Installing deps |
| [04-DESIGN-SYSTEM.md](./04-DESIGN-SYSTEM.md) | Brand & UI tokens | Styling |
| [05-PERMISSIONS-AND-ROLES.md](./05-PERMISSIONS-AND-ROLES.md) | Roles & permissions | Auth & nav |
| [06-MOCK-DATA-SPEC.md](./06-MOCK-DATA-SPEC.md) | Static data spec | Mock layer |
| [07-SCREEN-INVENTORY.md](./07-SCREEN-INVENTORY.md) | Every screen & route | Building pages |
| [08-IMPLEMENTATION-PHASES.md](./08-IMPLEMENTATION-PHASES.md) | Build order & checklist | Sprint planning |
| [09-COMPONENTS-AND-PATTERNS.md](./09-COMPONENTS-AND-PATTERNS.md) | Shared components | Reuse patterns |
| [10-RESPONSIVE-AND-MOBILE.md](./10-RESPONSIVE-AND-MOBILE.md) | Responsive UX | Mobile layouts |
| [11-I18N.md](./11-I18N.md) | English + Bengali | Copy & locale |
| [12-AI-CODING-RULES.md](./12-AI-CODING-RULES.md) | AI agent rules | Every coding session |

## Reference backend (read-only)

| Resource | Path in `isppaybd_isp` |
|----------|------------------------|
| Sidebar / menu map | `app/Views/layout/sidebar.php` |
| Platform sidebar | `app/Views/layout/_sidebar_platform.php` |
| Permission matrix | `app/Views/access/partial/default-access-fields.php` |
| Landing sections | `app/Views/landing/partials/*.php` |
| Design tokens | `public/assets/css/saas/tokens.css` |
| Brand boot | `public/assets/js/saas/brand-boot.js` |
| API catalog (future) | `zapi/Documentation/ENDPOINT_CATALOG.md` |
| Swagger (future) | `zapi/swagger-ui/swagger.json` |

## Root files

- **`AGENTS.md`** — Git workflow + stack lock-in for all contributors and AI.
- **`.cursor/rules/isp-frontend.mdc`** — Cursor rule loaded automatically.

## Current phase

**Phase 0 — Foundation initialized.** Next: Phase 1 (marketing landing).

### Phase 0 checklist (completed via CLI)

- [x] `pnpm create next-app@latest` — Next.js 16 + TypeScript + Tailwind
- [x] `pnpm dlx shadcn@latest init` + core components
- [x] App dependencies (TanStack Query, Zustand, Zod, etc.)
- [x] Vitest + `tests/` folder outside `src/app`
- [x] Mock API layer + demo users + auth store
- [x] Permissions (`can`) + `<Can>` component
- [x] Providers (Query, Theme, Tooltip, Sonner)
- [x] `docs/PROJECT-MEMORY.md` + `AGENTS.md` + `.cursor/rules`
- [x] `pnpm build` passes
- [ ] Copy Satoshi/Noto fonts to `public/fonts/` (optional offline fonts)
- [ ] Portal shell layouts (Sidebar, AppShell) — Phase 0 remainder
