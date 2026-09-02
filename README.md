# ISP Pay BD — Web Frontend

Modern Next.js frontend for the ISP Pay BD platform. **Phase 1: complete UI with offline static mock data.** Backend API integration comes later.

## Documentation

**Start here:** [`docs/README.md`](./docs/README.md)

| Doc | Description |
|-----|-------------|
| [00-OVERVIEW](./docs/00-OVERVIEW.md) | Scope, portals, success criteria |
| [07-SCREEN-INVENTORY](./docs/07-SCREEN-INVENTORY.md) | Every route (~118 screens) |
| [08-IMPLEMENTATION-PHASES](./docs/08-IMPLEMENTATION-PHASES.md) | Build order & checklists |
| [12-AI-CODING-RULES](./docs/12-AI-CODING-RULES.md) | Rules for AI agents |

## Reference backend

Read-only reference: [`isppaybd_isp`](../isppaybd_isp) — sidebar, permissions, landing copy, design tokens.

## Tech stack

Next.js 15 · TypeScript · Tailwind · shadcn/ui · TanStack Query · Zustand · Sonner · next-intl

## Status

**Not scaffolded yet.** Begin with Phase 0 in `docs/08-IMPLEMENTATION-PHASES.md`.

## Git workflow

- `main` — production (stable)
- `test` — staging
- Feature branches → PR to `test` → PR to `main`
- Never delete `main` or `test`
