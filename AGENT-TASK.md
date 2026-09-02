# AGENT TASK — WT05 Admin Ops Core

**Worktree:** `.worktrees/wt05-admin-ops`  
**Branch:** `wt/05-admin-ops`  
**Agent ID:** 05 of 10

---

## Mission

Build **admin operations core**: dashboard, customers, packages, areas, customer payments, POP packages, subscription, self-recharge/payment flows.

## Owned paths

| Path |
|------|
| `src/features/admin/dashboard/` |
| `src/features/admin/customers/` |
| `src/features/admin/customer-payments/` |
| `src/features/admin/packages/` |
| `src/features/admin/pop-packages/` |
| `src/features/admin/areas/` |
| `src/features/admin/subscription/` |
| `src/features/admin/payment/` |
| `src/features/admin/pop/` (funding/resellers/transactions if ops-related) |
| `src/app/(portal)/admin/` routes for above only |
| `src/data/admin/` for above domains |

## Reference

- `isppaybd_isp/app/Views/customers/`, `packages/`, `areas/`, `payments/customer/`, `dashboard/sAdmin.php`

## DO NOT touch

- HR, accounting, network, SMS/WhatsApp, platform, customer portal

## Done when

- [x] List/detail/create flows with DataTable + EmptyState + Can
- [x] Inventory D* ops screens marked
- [x] Verify commands pass

## Skill

`.cursor/skills/isp-pay-bd/SKILL.md`
