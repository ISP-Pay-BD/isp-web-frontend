# AGENT TASK — WT01 Marketing Landing A

**Worktree:** `.worktrees/wt01-marketing-landing-a`  
**Branch:** `wt/01-marketing-landing-a`  
**Agent ID:** 01 of 10

---

## Mission

Build **landing sections 1–14** on `/` (dark ISP marketing). Do **not** build sections 15–28 (that is WT02).

## Owned paths (ONLY edit these)

| Path | Action |
|------|--------|
| `src/features/marketing/landing/` | Components for sections 1–14 + compose into LandingPage |
| `src/app/(marketing)/page.tsx` | Wire LandingPage (coordinate with WT02 — keep section slots) |
| `src/data/marketing/` | Data for sections 1–14 only |
| `src/lib/mock-api/handlers/` | Marketing landing keys only |

## Sections to build

1. Hero + orbital · 2. Stats · 3. Features · 4. Benefits · 5. Why choose · 6. How it works · 7. Product preview · 8. Auto reconciliation · 9. ROI · 10. Pricing + PAYG · 11. Comparison · 12. Testimonials · 13. FAQ · 14. Integrations orbit

## Reference

- `docs/REFERENCE-MAP.md` → `../isppaybd_isp/app/Views/landing/partials/`
- `docs/UI-FUSION-GUIDE.md` + skill `isp-pay-bd`
- Colors: `#0c0118` / `#f75803` / `#2E8BFF` · Fonts: `font-landing-display` / `font-landing-body`

## DO NOT touch

- Sections 15–28, `/pricing` `/plugins` `/contact` `/register` (WT02)
- Auth, portals, `package.json`, shared components (unless missing critical export)

## Done when

- [x] Sections 1–14 render on `/`
- [x] Dark theme + Framer Motion (respect reduced-motion)
- [x] PAYG/pricing slider works with mock data
- [x] `pnpm lint && typecheck && test && build` pass
- [x] Inventory A1 sections 1–14 marked in your PR description

## Skill

Read `.cursor/skills/isp-pay-bd/SKILL.md` first.
