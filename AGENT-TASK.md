# AGENT TASK — WT04 Customer Portal

**Worktree:** `.worktrees/wt04-customer-portal`  
**Branch:** `wt/04-customer-portal`  
**Agent ID:** 04 of 10

---

## Mission

Build **full customer portal** (~15 screens) + `CustomerBottomNav`.

## Owned paths

| Path | Action |
|------|--------|
| `src/features/customer/**` | All customer modules |
| `src/app/(portal)/customer/**` | All customer routes |
| `src/data/customer/` | Customer mock data |
| `src/lib/mock-api/handlers/` | Customer domain keys |
| `src/config/navigation/customer.ts` | Only if needed |

## Modules

dashboard · subscription · packages · payments · support · rewards · news · router tools · profile · change-password · shared (bottom nav)

## Reference

- `docs/REFERENCE-MAP.md` → customer views
- `isppaybd_isp/app/Views/dashboard/user.php`, `customers/`, `tickets/`, `payments/customer/`

## DO NOT touch

- Admin/platform/employee modules
- Marketing (except links out)

## Done when

- [x] All customer inventory screens (C*) pass DoD
- [x] Mobile bottom nav works
- [x] Expired customer demo limited nav
- [x] Verify commands pass

## Skill

`.cursor/skills/isp-pay-bd/SKILL.md`
