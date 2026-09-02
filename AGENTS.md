# AGENTS.md — ISP Web Frontend

## Start every session

1. `docs/PROJECT-MEMORY.md` — project context
2. `docs/12-AI-CODING-RULES.md` — coding rules
3. `docs/08-IMPLEMENTATION-PHASES.md` — current phase

## Stack (CLI-installed)

- **Next.js 16** (App Router, Turbopack dev)
- **shadcn/ui** (base-nova) + Tailwind CSS v4
- **TanStack Query** + **Zustand** + **Sonner**
- **Vitest** — tests in `/tests` (outside `src/app`)

## Architecture

```
app/ → features/ → lib/mock-api/ → mocks/
tests/ → architecture + unit (separate from app)
```

## Phase 1 scope

Static mock UI only. No backend. See `docs/00-OVERVIEW.md`.

## Git

- PR workflow to `test` then `main`
- Never delete `main` or `test`
- Commit only when user asks

## Verify before done

```bash
pnpm lint && pnpm typecheck && pnpm test && pnpm build
```
