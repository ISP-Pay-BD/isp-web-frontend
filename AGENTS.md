# AGENTS.md — ISP Web Frontend

## User goal (remember always)

Build a **high-quality, professional, modern ISP Pay BD platform** — complete in every module, every screen, every state. **NOT a generic CRM template.**

## Start every session (in order)

1. **`docs/PROJECT-MEMORY.md`** — project context
2. **`docs/13-STRICT-AGENT-MANDATE.md`** — non-negotiable rules
3. **`docs/QUALITY-STANDARDS.md`** — premium quality bar
4. **`docs/UI-FUSION-GUIDE.md`** — ISP + shadcn + 21st.dev
5. **`docs/MASTER-BUILD-PLAN.md`** — complete plan + current phase
6. **`docs/FONTS.md`** — typography (5 fonts, folders, usage)
7. **`docs/DEFINITION-OF-DONE.md`** — per-screen checklist
8. **`docs/12-AI-CODING-RULES.md`** — coding rules

## Stack (CLI-installed — do not replace)

| Layer | Tool |
|-------|------|
| Framework | Next.js 16 (App Router, Turbopack) |
| UI | shadcn/ui (portals) + ISP landing dark theme |
| State | TanStack Query + Zustand |
| Forms | react-hook-form + Zod |
| Toasts | Sonner |
| Motion | Framer Motion (marketing only) |
| Icons | Lucide |
| Tests | Vitest in `/tests` (outside `src/app`) |

## UI fusion (mandatory)

```
Marketing  →  ISP landing.css (#0c0118) + 21st.dev inspiration + Framer Motion
Portals    →  shadcn/ui + ISP tokens (#f75803, #1a0b38)
Forbidden  →  Generic CRM look, MUI, Chakra, Ant, DaisyUI, Font Awesome CDN
```

## Architecture

```
src/app/           → thin routes only
src/features/      → one module = one folder (pages, components, hooks, schemas, types)
src/data/          → ALL static dummy data
src/lib/mock-api/  → ONLY data access
tests/             → outside src/app
```

Reference backend (read-only): `../isppaybd_isp` — path map in **`docs/REFERENCE-MAP.md`**

## Phase 1 scope

Static mock UI only. No backend API. All data from `src/data/` via mock-api.

## Current status

- **P0:** ✅ Complete — see `docs/P0-READY.md`
- **Plan docs (MD):** ✅ Complete — see `docs/PLAN-STATUS.md`
- **Phase 1:** ⏳ Ready to start (28 landing sections)
- **Permissions nav filter:** ✅ `useFilteredNav` wired

## Git

- PR workflow to `test` then `main`
- Never delete `main` or `test`
- Commit only when user asks

## Verify before done

```bash
pnpm lint && pnpm typecheck && pnpm test && pnpm build
```

Mark completed screens in `docs/07-SCREEN-INVENTORY.md` only after `DEFINITION-OF-DONE.md` passes.
