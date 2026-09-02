# AGENT TASK — WT08 Admin Comms + Settings

**Worktree:** `.worktrees/wt08-admin-comms`  
**Branch:** `wt/08-admin-comms`  
**Agent ID:** 08 of 10

---

## Mission

Build **communications + settings**: SMS, templates, WhatsApp, voice SMS, support tickets, rewards, profile, theme studio, settings, recycle bin.

## Owned paths

| Path |
|------|
| `src/features/admin/sms/` |
| `src/features/admin/sms-templates/` |
| `src/features/admin/whatsapp/` |
| `src/features/admin/voice-sms/` |
| `src/features/admin/support/` |
| `src/features/admin/rewards/` |
| `src/features/admin/profile/` |
| `src/features/admin/theme-studio/` |
| `src/features/admin/settings/` |
| `src/features/admin/recycle-bin/` |
| Matching app routes + data |

## Reference

- `isppaybd_isp/app/Views/sms/`, `whatsapp/`, `voice_sms/`, `tickets/`, `settings/`, `recyclebin/`, `profile/`

## DO NOT touch

- Customers/network/HR (WT05–07), platform (WT09)

## Done when

- [x] All owned screens pass DoD
- [x] Ticket thread UI
- [x] Verify commands pass

## Skill

`.cursor/skills/isp-pay-bd/SKILL.md`
