# Fonts — folder index

Each font has its **own folder** with **woff2 files**. CSS in `src/styles/fonts/`.

Re-sync from npm after install: `pnpm fonts:sync`

```
public/fonts/
├── satoshi/              ← 4 woff2 (portal UI)
├── inter/                ← inter-latin.woff2 (marketing body)
├── plus-jakarta-sans/    ← plus-jakarta-sans-latin.woff2 (marketing display)
├── noto-sans-bengali/    ← 8 woff2 (BN + latin subsets)
└── ibm-plex-mono/        ← 2 woff2 (400, 500)

src/styles/fonts/
├── index.css             ← imports all families
├── satoshi.css
├── inter.css
├── plus-jakarta-sans.css
├── noto-sans-bengali.css
└── ibm-plex-mono.css

src/config/fonts.ts       ← where to use what (registry)
src/lib/fonts.ts          ← single import in root layout
```

**Full usage map:** `docs/FONTS.md`

## Quick reference — which font where

| Use this class | Font | Where |
|----------------|------|-------|
| `font-landing-display` | Plus Jakarta Sans | Marketing headings, hero |
| `font-landing-body` | Inter | Marketing paragraphs, nav |
| `font-portal` (default on `html`) | Satoshi | Admin, customer, platform, employee |
| `font-bengali` | Noto Sans Bengali | When locale = `bn` |
| `font-mono` | IBM Plex Mono | Invoice #, TrxID, IP, MAC |

## Do NOT add

Roboto, Open Sans, Geist, DM Sans — generic CRM look.
