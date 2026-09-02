# AGENT TASK — WT10 Employee + Global Polish

**Worktree:** `.worktrees/wt10-employee-polish`  
**Branch:** `wt/10-employee-polish`  
**Agent ID:** 10 of 10

---

## Mission

Build **employee portal** + **Phase 7 polish**: shared gaps, command palette, 404/500, inventory completion, integration QA.

## Owned paths

| Path |
|------|
| `src/features/employee/**` |
| `src/app/(portal)/employee/**` |
| `src/data/employee/` |
| `src/components/shared/` — **only missing pieces** (SearchInput, PageHeader, DateDisplay, FilterBar, ChartCard) |
| `src/features/shared/page-header/` |
| `src/app/not-found.tsx`, error pages |
| `docs/07-SCREEN-INVENTORY.md` — final status sync after others merge (or in final PR) |
| Optional: `package.json` for missing polish deps only |

## Modules

employee salaries · advance-salary · profile · shared · polish checklist

## Phase 7 polish checklist

- [x] Command palette ⌘K (admin)
- [x] Sidebar search
- [x] Dark mode check on portals
- [x] 403/404/500 styled
- [x] No external CDN requests
- [x] Final inventory pass

## Reference

- `isppaybd_isp/app/Views/employee/`, `payments/employee/`
- `docs/DEFINITION-OF-DONE.md`

## DO NOT touch

- Rewrite other agents’ feature UIs — only glue/polish/shared gaps

## Done when

- [x] Employee screens done
- [x] Shared gaps filled
- [x] Verify commands pass
- [x] Ready for merge-order last PR

## Skill

`.cursor/skills/isp-pay-bd/SKILL.md`
