# AGENT TASK — WT02 Marketing Landing B + Routes

**Worktree:** `.worktrees/wt02-marketing-landing-b`  
**Branch:** `wt/02-marketing-landing-b`  
**Agent ID:** 02 of 10

---

## Mission

Build **landing sections 15–28** plus marketing routes `/pricing`, `/plugins`, `/contact`, `/register`, `/register/referral`. Wire `next-intl` EN/BN for marketing.

## Owned paths

| Path | Action |
|------|--------|
| `src/features/marketing/landing/` | Sections 15–28 components |
| `src/features/marketing/pricing/` | Pricing page |
| `src/features/marketing/plugins/` | Plugins marketplace |
| `src/features/marketing/contact/` | Contact page |
| `src/features/marketing/register/` | Register + referral |
| `src/features/marketing/shared/` | EN/BN toggle if needed (careful merge with WT01) |
| `src/app/(marketing)/` | Routes for pricing/plugins/contact/register |
| `src/data/marketing/` | Data for sections 15–28 + route pages |
| `src/i18n/` | next-intl setup (marketing strings) |

## Sections to build

15 Plugins · 16 Mobile app · 17 Reseller hierarchy · 18 Roles · 19 Permissions · 20 Case study · 21 Partners · 22 Trust · 23 Proof · 24 Connects · 25 Try it · 26 CTA · 27 Nav polish · 28 Footer polish

## Reference

- PHP: `isppaybd_isp/app/Views/landing/partials/` + `auth/registration.php`
- `docs/11-I18N.md`

## DO NOT touch

- Sections 1–14 primary implementation (WT01)
- Auth login (WT03), portals

## Done when

- [x] Sections 15–28 on `/`
- [x] All 5 extra marketing routes work
- [x] EN/BN toggle works for marketing
- [x] Mobile sticky CTA OK
- [x] Verify commands pass

## Skill

`.cursor/skills/isp-pay-bd/SKILL.md`
