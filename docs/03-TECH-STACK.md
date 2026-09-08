# 03 — Tech Stack

Lock-in list. Do not substitute libraries without updating this doc and `AGENTS.md`.

## Core

| Package | Version target | Purpose |
|---------|----------------|---------|
| `next` | 15.x | App Router, SSR/SSG |
| `react` | 19.x | UI |
| `typescript` | 5.x | Strict mode |
| `pnpm` | 9.x | Package manager |

## Styling & UI

| Package | Purpose |
|---------|---------|
| `tailwindcss` | v4 utility CSS |
| `@tailwindcss/postcss` | PostCSS integration |
| `class-variance-authority` | Component variants |
| `clsx` + `tailwind-merge` | `cn()` helper |
| `shadcn/ui` | Component primitives (copy into `components/ui/`) |
| `@radix-ui/*` | Accessible primitives (via shadcn) |
| `lucide-react` | Icons |
| `next-themes` | Light/dark toggle |
| `framer-motion` | Landing animations |
| `embla-carousel-react` | Testimonials/partner carousels |
| `@number-flow/react` | Animated stat counters |
| `@fontsource-variable/inter` | Landing body font (self-hosted) |
| `@fontsource-variable/plus-jakarta-sans` | Landing display font |
| `@fontsource/noto-sans-bengali` | Bengali copy |
| `@fontsource/ibm-plex-mono` | Monospace IDs/amounts |
| Satoshi (local) | Portal UI — `public/fonts/satoshi/` + `src/styles/fonts/satoshi.css` |

## Data & forms

| Package | Purpose |
|---------|---------|
| `@tanstack/react-query` | Data fetching cache (mock-api) |
| `@tanstack/react-table` | Sortable/filterable tables |
| `react-hook-form` | Forms |
| `@hookform/resolvers` | Zod resolver |
| `zod` | Validation |
| `zustand` | Auth + UI state |
| `nuqs` | URL search params state |

## Feedback & UX

| Package | Purpose |
|---------|---------|
| `sonner` | Toast notifications |
| `cmdk` | Command palette (admin ⌘K) |
| `vaul` | Mobile drawer sheets |
| `react-day-picker` | Date picker (shadcn calendar) |
| `recharts` | Dashboard charts |

## i18n

| Package | Purpose |
|---------|---------|
| `next-intl` | EN + BN translations |

## Dev quality

| Package | Purpose |
|---------|---------|
| `eslint` + `eslint-config-next` | Lint |
| `prettier` + `prettier-plugin-tailwindcss` | Format |
| `vitest` + `@testing-library/react` | Unit tests |
| `@playwright/test` | E2E (Phase 7) |

## shadcn components to install (Phase 0)

Install via `pnpm dlx shadcn@latest add`:

```
button input label textarea select checkbox radio-group
switch form card badge avatar separator
dialog sheet drawer dropdown-menu popover
command navigation-menu breadcrumb
table tabs accordion collapsible
calendar date-picker (calendar + popover)
alert alert-dialog toast sonner
skeleton progress spinner
sidebar tooltip scroll-area
```

## Init commands (Phase 0)

```bash
pnpm create next-app@latest . --typescript --tailwind --eslint --app --src-dir --import-alias "@/*"
pnpm dlx shadcn@latest init
# Follow prompts: New York style, zinc slate, CSS variables yes
pnpm add @tanstack/react-query @tanstack/react-table react-hook-form @hookform/resolvers zod zustand sonner next-themes framer-motion nuqs cmdk vaul recharts next-intl
pnpm add -D vitest @testing-library/react @playwright/test prettier prettier-plugin-tailwindcss
```

## Offline requirements

| Asset | Rule |
|-------|------|
| Fonts | Self-host — `@fontsource` + Satoshi in `public/fonts/` — see **`docs/FONTS.md`** |
| Images | `public/images/` only |
| Icons | Lucide (bundled) — no Font Awesome CDN |
| Maps | Mapbox GL via `react-map-gl` — `NEXT_PUBLIC_MAPBOX_TOKEN` |
| Charts | Recharts with mock data — no external analytics |

## Environment variables (Phase 1)

```env
# .env.example
NEXT_PUBLIC_APP_NAME=ISP Pay BD
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_USE_MOCK=true
# Phase 2 only:
# NEXT_PUBLIC_API_URL=https://test.isppaybd.com
```

## Libraries explicitly NOT used

| Library | Reason |
|---------|--------|
| MUI, Chakra, Ant Design | Conflicts with Tailwind/shadcn |
| jQuery | Legacy — not in Next.js |
| DaisyUI | Backend admin uses it; frontend uses shadcn for distinct modern stack |
| Axios | Use native `fetch` in Phase 2 |
| Redux | Zustand + TanStack Query sufficient |
