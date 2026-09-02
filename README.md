# ISP Pay BD — Web Frontend

Modern Next.js frontend for the ISP Pay BD platform.

## Quick start

```bash
pnpm install
cp .env.example .env.local
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000)

## Scripts

| Command | Description |
|---------|-------------|
| `pnpm dev` | Dev server (Turbopack) |
| `pnpm build` | Production build |
| `pnpm lint` | ESLint |
| `pnpm typecheck` | TypeScript check |
| `pnpm test` | All Vitest tests |
| `pnpm test:architecture` | Architecture boundary tests |
| `pnpm test:unit` | Unit tests |

## Documentation

| Doc | Description |
|-----|-------------|
| [**PROJECT-MEMORY.md**](./docs/PROJECT-MEMORY.md) | AI context — read first |
| [docs/README.md](./docs/README.md) | Full doc index |
| [docs/07-SCREEN-INVENTORY.md](./docs/07-SCREEN-INVENTORY.md) | All ~118 screens |
| [docs/08-IMPLEMENTATION-PHASES.md](./docs/08-IMPLEMENTATION-PHASES.md) | Build phases |

## Project structure

```
src/
├── app/              Next.js routes
├── features/         Domain modules
├── components/       UI + layout + shared
├── lib/mock-api/     Mock data layer (Phase 1)
├── mocks/            Static data
├── stores/           Zustand stores
├── config/           Site + navigation
└── types/            Shared types

tests/                Tests OUTSIDE src/app
├── architecture/     Structure & boundary tests
├── unit/             Logic tests
└── setup/            Vitest setup
```

## Reference backend

Read-only: [`isppaybd_isp`](../isppaybd_isp) — menus, permissions, landing copy.

## Status

**Phase 0 initialized** — Next.js + shadcn via CLI. Run `pnpm dev` to start. Phase 1 (marketing) is next.
