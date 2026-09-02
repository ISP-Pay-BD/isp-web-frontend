# P0 Foundation — ✅ COMPLETE

**Status: Ready to start Phase 1 landing sections.**

Last verified: build + tests pass. Plan docs synced Sep 2026.

## P0 gate — all done ✅

| # | Task | Location |
|---|------|----------|
| 1 | Landing tokens (`#0c0118`, `#f75803`, `#2E8BFF`) | `src/app/globals.css` |
| 2 | Self-hosted fonts (5 families, 17 woff2, folder per font) | `public/fonts/` + `docs/FONTS.md` |
| 3 | Brand logo + payment/partner SVGs | `public/images/` |
| 4 | Polish libs: embla-carousel, number-flow | `package.json` |
| 5 | shadcn components (table, accordion, command…) | `src/components/ui/` |
| 6 | MarketingLayout + nav + footer + mobile CTA | `features/marketing/shared/` |
| 7 | Shared: DataTable, StatCard, EmptyState, etc. | `components/shared/` |
| 8 | Full nav (~50 admin + customer + platform items) | `config/navigation/` |
| 9 | `useFilteredNav` permission filter | `hooks/use-filtered-nav.ts` |
| 10 | AppShell + PortalSidebar + PortalHeader | `components/layout/` |
| 11 | Marketing data + PAYG calculator data | `data/marketing/` |
| 12 | Build + tests pass | `pnpm build`, `pnpm test` |

## Verify commands (all pass)

```bash
pnpm typecheck && pnpm test && pnpm build
```

## Optional (not blocking Phase 1)

| Item | Notes |
|------|-------|
| OG image | `public/images/brand/og-image.png` |
| `next-intl` wiring | Do alongside Phase 1 sections |

---

## ▶ START Phase 1 when you say:

**"start Phase 1"** or **"build landing"**

Phase 1 builds all **28 landing sections** on `/` per `07-SCREEN-INVENTORY.md`.
