# AGENT TASK — WT06 Admin HR + Finance

**Worktree:** `.worktrees/wt06-admin-hr-finance`  
**Branch:** `wt/06-admin-hr-finance`  
**Agent ID:** 06 of 10

---

## Mission

Build **HR + accounting + wallet + reports + purchase/inventory**.

## Owned paths

| Path |
|------|
| `src/features/admin/hr/**` |
| `src/features/admin/accounting/**` |
| `src/features/admin/wallet/` |
| `src/features/admin/reports/` |
| `src/features/admin/purchase/` |
| `src/features/admin/inventory/` |
| Matching `src/app/(portal)/admin/` routes |
| Matching `src/data/admin/` |

## Modules

employees · salaries · attendance · accounts · advance-salary · chart-of-accounts · journal · incomes · expenses · balance-sheet · accounting reports · wallet · BTRC/reports · purchase · inventory

## Reference

- `isppaybd_isp/app/Views/employee/`, `accounts/`, `wallet/`, `reports/`, `purchase/`, `inventory/`

## DO NOT touch

- Customers/packages (WT05), network (WT07), SMS (WT08)

## Done when

- [x] All owned screens pass DoD
- [x] CurrencyDisplay ৳ formatting
- [x] Verify commands pass

## Skill

`.cursor/skills/isp-pay-bd/SKILL.md`
