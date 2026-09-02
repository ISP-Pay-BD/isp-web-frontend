# AGENT TASK — WT09 Platform Super-Admin

**Worktree:** `.worktrees/wt09-platform`  
**Branch:** `wt/09-platform`  
**Agent ID:** 09 of 10

---

## Mission

Build **entire platform portal** (super-admin): tenants, dashboard, revenue, plugins, file manager, contacts, admins, settings, support, showcase, user-access.

## Owned paths

| Path |
|------|
| `src/features/platform/**` |
| `src/app/(portal)/platform/**` |
| `src/data/platform/` |
| `src/config/navigation/platform.ts` (if needed) |
| Platform mock-api handlers |

## Modules

dashboard · tenants · revenue · plugins · file-manager · contacts · admins · settings · support · showcase · user-access · shared

## Reference

- `isppaybd_isp/app/Views/tenants/`, `file-manager/`, `plugins/`, `SecondAdmin/`
- `_sidebar_platform.php`

## DO NOT touch

- Tenant admin modules (WT05–08), customer, marketing

## Done when

- [ ] All platform inventory (E*) screens pass DoD
- [ ] Tenant branding fields in forms
- [ ] Verify commands pass

## Skill

`.cursor/skills/isp-pay-bd/SKILL.md`
