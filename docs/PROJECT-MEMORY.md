# PROJECT MEMORY — ISP Pay BD Frontend

> **AI agents: READ THIS FIRST every session.**  
> **Goal: premium ISP platform — NOT a generic CRM.** Follow strict mandate in `13-STRICT-AGENT-MANDATE.md`.

## One-line summary

Next.js 16 frontend for **ISP Pay BD** — complete UI migration from `isppaybd_isp`, offline static data, real `zapi/` API later. **High quality, professional, modern ISP website.**

## Current phase

**P0 ✅ COMPLETE — plan docs ✅ COMPLETE — ready to start Phase 1 (28 landing sections).**

| Item | State |
|------|-------|
| **Plan documentation (MD)** | ✅ Complete — see `PLAN-STATUS.md` |
| P0 foundation (code) | ✅ Done |
| Fonts (5 families) | ✅ Done — `FONTS.md` |
| MarketingLayout | ✅ Done |
| Full navigation | ✅ Done |
| Shared components | ✅ Done |
| **Default AI skill** | ✅ `.cursor/skills/isp-pay-bd/` |
| Phase 1 landing (28 sections) | ⏳ **Next — awaiting your go** |

---

## Mandatory doc reading order

0. **`.cursor/skills/isp-pay-bd/SKILL.md`** ← default project skill (USE/DO NOT USE)
1. **`PROJECT-MEMORY.md`** ← this file
2. **`13-STRICT-AGENT-MANDATE.md`** ← non-negotiable rules
3. **`QUALITY-STANDARDS.md`** ← anti-CRM quality bar
4. **`UI-FUSION-GUIDE.md`** ← ISP + shadcn + 21st.dev
5. **`UI-REFERENCES-LIBS.md`** ← USE / DO NOT USE libraries & UI sites
6. **`MASTER-BUILD-PLAN.md`** ← complete plan + current phase
7. **`PLAN-STATUS.md`** ← plan docs complete? + phase index
8. **`REFERENCE-MAP.md`** ← old ISP website PHP paths (before any UI)
9. **`FONTS.md`** ← typography (5 fonts, folders, usage)
10. **`PROJECT-STRUCTURE-MAP.md`** ← helpers, config, colors, formatters, i18n
11. **`DEFINITION-OF-DONE.md`** ← per-screen checklist
12. **`12-AI-CODING-RULES.md`** ← coding rules

---

## UI fusion (CRITICAL)

```
Marketing  →  ISP landing.css dark (#0c0118) + 21st.dev inspiration + Framer Motion
Portals    →  shadcn/ui + ISP tokens (#f75803, #1a0b38)
Quality    →  Premium ISP ops platform — complete states, permissions, responsive
Data       →  src/data/ via mock-api only
Fonts      →  Satoshi (portals) + Plus Jakarta/Inter (marketing) — see docs/FONTS.md
Reference  →  Old ISP website: ../isppaybd_isp — see docs/REFERENCE-MAP.md
UI libs      →  USE/DO NOT USE: docs/UI-REFERENCES-LIBS.md + skill isp-pay-bd
Structure   →  Helpers/config/tokens: docs/PROJECT-STRUCTURE-MAP.md
```

---

## Architecture (9.2/10)

```
src/app/           → thin routes ONLY
src/features/      → 84 modules (pages/ components/ hooks/ schemas/ types/)
src/data/          → ALL static dummy data
src/lib/mock-api/  → ONLY data access
tests/             → OUTSIDE src/app
```

**Golden rules:**
- One feature = one folder. All module code inside.
- Features → mockFetch() → handlers → @/data. Never import @/data in UI.

---

## Scope (~132 screens)

| Portal | Modules | Routes |
|--------|---------|--------|
| Marketing | 6 | 6 + 28 landing sections |
| Auth | 2 | 3 |
| Customer | 11 | 15 |
| Admin | 42 | ~75 |
| Platform | 12 | 13 |
| Employee | 4 | 3 |
| System | — | 403, 404, 500 |

Full list: `07-SCREEN-INVENTORY.md` + `MASTER-BUILD-PLAN.md`

---

## Demo logins

All password: `demo1234` — see `src/data/users/users.data.ts`

---

## Quality bar (never compromise)

- NOT a generic CRM — ISP domain fidelity required
- All 4 states: loading, empty, error, success
- All breakpoints: 320, 375, 768, 1024, 1440
- Permissions: nav + route + buttons
- Marketing Lighthouse mobile ≥85
- Verify: `pnpm lint && typecheck && test && build`

---

## Next action

**✅ P0 complete.** Say **"start Phase 1"** to build all 28 landing sections.

See `docs/P0-READY.md` for verification checklist.
