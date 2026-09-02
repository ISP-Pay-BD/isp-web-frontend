# AGENT TASK — WT03 Auth + Permissions

**Worktree:** `.worktrees/wt03-auth-permissions`  
**Branch:** `wt/03-auth-permissions`  
**Agent ID:** 03 of 10

---

## Mission

Complete **Phase 2**: login, forgot password, route guards, 403 page, user-access UI, demo role switcher polish.

## Owned paths

| Path | Action |
|------|--------|
| `src/features/auth/login/` | Login page + demo user quick-pick |
| `src/features/auth/forgot-password/` | Forgot password toast flow |
| `src/features/shared/permission/` | Route guard hooks |
| `src/features/admin/user-access/` | Permission matrix UI (static) |
| `src/app/(auth)/` or login routes | `/login`, `/forgot-password` |
| `src/app/(portal)/403/` | Forbidden page |
| `src/middleware.ts` | Permission-aware guards (careful) |
| `src/hooks/use-filtered-nav.ts` | Enhance only if needed |
| `src/data/users/` | Demo users / permissions if needed |

## Deliverables

- [x] Login → redirect by role (6 demo users)
- [x] Logout → `/login`
- [x] Forgot password → toast
- [x] Unauthorized URL → 403
- [x] User Access Management static UI
- [x] Expired-user nav rules documented/wired

## Reference

- `isppaybd_isp/app/Views/auth/`
- `isppaybd_isp/app/Views/access/`
- `docs/05-PERMISSIONS-AND-ROLES.md`

## DO NOT touch

- Marketing landing sections (WT01/02)
- Customer/admin feature pages (WT04–09)

## Skill

`.cursor/skills/isp-pay-bd/SKILL.md`
