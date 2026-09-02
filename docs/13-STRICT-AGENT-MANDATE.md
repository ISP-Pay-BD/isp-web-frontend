# 13 — Strict Agent Mandate

> **Every AI agent MUST follow this file.** No shortcuts. No generic templates.  
> User goal: **premium ISP Pay BD platform** — complete, professional, modern — NOT a simple CRM.

---

## Non-negotiable principles

1. **Reference first** — read `isppaybd_isp` before inventing anything
2. **Quality gate** — every screen passes `DEFINITION-OF-DONE.md` or stays incomplete
3. **Phase order** — follow `MASTER-BUILD-PLAN.md`; P0 before Phase 1
4. **ISP domain** — Bangladesh ISP terminology, ৳, bKash, PPPoE, POP, MikroTik
5. **No slop** — see forbidden list in `QUALITY-STANDARDS.md` §3
6. **Complete states** — loading + empty + error + success on every screen
7. **Permissions everywhere** — nav + route + buttons on admin
8. **Offline only** — no CDN, no external API in Phase 1
9. **Verify before done** — `pnpm lint && typecheck && test && build`
10. **Mark inventory** — update `07-SCREEN-INVENTORY.md` when truly done

---

## Session start (mandatory order)

```
1. docs/PROJECT-MEMORY.md
2. docs/QUALITY-STANDARDS.md
3. docs/UI-FUSION-GUIDE.md
4. docs/MASTER-BUILD-PLAN.md        ← check current phase
5. docs/12-AI-CODING-RULES.md
6. docs/07-SCREEN-INVENTORY.md      ← screen you're building
7. isppaybd_isp reference file      ← PHP view for that screen
```

---

## Before writing ANY component

Answer these questions (in your head or notes):

| Question | If NO → |
|----------|---------|
| Is P0 complete for this phase? | Build P0 first |
| Does shared layout exist? | Build layout first |
| Does data file exist in `src/data/`? | Create data first |
| Does mock handler exist? | Create handler first |
| Did I read the PHP reference? | Read it now |
| Do I know marketing vs portal surface? | Read UI-FUSION-GUIDE |
| Is this ISP-specific, not generic CRM? | Redesign |

---

## While building

- Match existing code conventions in the repo
- One feature = one folder — all code inside
- Max ~150 lines per component — split if larger
- Use shadcn on portals, ISP dark theme on marketing
- Framer Motion on marketing only — purposeful animation
- Real ISP copy from reference — never lorem ipsum
- Bangladesh-realistic mock data

---

## Before marking a screen done

Run through `DEFINITION-OF-DONE.md` — **all checkboxes**.

Run verification:

```bash
pnpm lint && pnpm typecheck && pnpm test && pnpm build
```

Test at 320px, 768px, 1440px.

Only then mark `[x]` in `07-SCREEN-INVENTORY.md`.

---

## Forbidden shortcuts

| Shortcut | Why forbidden |
|----------|---------------|
| "I'll add permissions later" | Security + UX core |
| "Placeholder dashboard for now" | Fails quality bar |
| "Skip mobile, desktop first" | Responsive is mandatory |
| "Use fetch to real API temporarily" | Phase 1 is mock-only |
| "Copy shadcn default light landing" | Wrong surface |
| "Skip empty state" | Incomplete screen |
| "One file for whole module" | Architecture violation |
| "Mark done without testing" | False completion |

---

## When stuck

| Problem | Read |
|---------|------|
| What to build next | `MASTER-BUILD-PLAN.md` |
| Quality bar | `QUALITY-STANDARDS.md` |
| UI rules | `UI-FUSION-GUIDE.md` |
| Screen list | `07-SCREEN-INVENTORY.md` |
| PHP behavior | `isppaybd_isp/app/Views/` |
| Permissions | `05-PERMISSIONS-AND-ROLES.md` |
| Data shapes | `06-MOCK-DATA-SPEC.md` |

---

## User expectation (remember always)

The user has provided full reference (`isppaybd_isp`). They want:

- **High quality** — premium, professional, polished
- **Complete** — every module, every screen, every state
- **Modern** — animations and components where appropriate
- **ISP-specific** — not a generic admin template
- **Perfect structure** — clean architecture before and during code

**Delivering a half-done CRM-style dashboard is a failure.**
