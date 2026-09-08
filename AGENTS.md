# AGENTS.md — ISP Web Frontend

## User goal (remember always)

Build a **high-quality, professional, modern ISP Pay BD platform** — complete in every module, every screen, every state. **NOT a generic CRM template.**

## Start every session (in order)

1. **Skill `isp-pay-bd`** — `.cursor/skills/isp-pay-bd/SKILL.md` (project default)
2. **`docs/PROJECT-MEMORY.md`** — project context
3. **`docs/13-STRICT-AGENT-MANDATE.md`** — non-negotiable rules
4. **`docs/QUALITY-STANDARDS.md`** — premium quality bar
5. **`docs/UI-FUSION-GUIDE.md`** — ISP + shadcn + 21st.dev
6. **`docs/UI-REFERENCES-LIBS.md`** — USE / DO NOT USE libraries & UI sites
7. **`docs/MASTER-BUILD-PLAN.md`** — complete plan + current phase
8. **`docs/REFERENCE-MAP.md`** — old PHP website paths
9. **`docs/FONTS.md`** — typography
10. **`docs/DEFINITION-OF-DONE.md`** — per-screen checklist
11. **`docs/12-AI-CODING-RULES.md`** — coding rules

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
Forbidden  →  Generic flat CRM look, scrap AI templates, MUI, Chakra, Ant, DaisyUI, Font Awesome CDN
USE/DO NOT →  docs/UI-REFERENCES-LIBS.md + skill isp-pay-bd
```

## Visual & UX Standards (Anti-Flat / Premium Feel)

- **Framer Motion & Transitions**: Smooth, purposeful micro-animations, effortless entry reveals, and lightweight snappy CSS transitions (`duration-200 ease-out`). No sluggishness.
- **Anti-Flat / Depth & Visuals**: Never build flat, monotone AI junk or plain spreadsheet CRM boxes. Use subtle depth, elegant border glow/accents, layered cards, modern glassmorphism (backdrop-blur), and clean elevations.
- **Color Harmony**: Perfect cohesion across dark canvas (`#0c0118`), brand orange (`#f75803`), sidebar purple (`#1a0b38`), and crisp blue accents (`#2E8BFF`).
- **User-Friendly UX**: Responsive layouts, interactive hover states, tactile feedback, skeleton loaders, and zero jarring layout shifts.


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

- **Default skill:** `isp-pay-bd` — `.cursor/skills/isp-pay-bd/SKILL.md`
- **P0:** ✅ Complete — see `docs/P0-READY.md`
- **Plan docs (MD):** ✅ Complete — see `docs/PLAN-STATUS.md`
- **Phases 1–7:** ✅ Mock UI complete (dummy data) — inventory synced
- **Phase 8:** ⏳ API integration — await go
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

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
