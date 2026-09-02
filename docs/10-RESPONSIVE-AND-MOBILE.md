# 10 — Responsive & Mobile UX

Every screen must work from **320px to 2560px**.

## Breakpoints (Tailwind defaults)

| Token | Width | Target devices |
|-------|-------|----------------|
| default | 0–639px | Mobile phones |
| `sm` | 640px+ | Large phones / small tablets |
| `md` | 768px+ | Tablets |
| `lg` | 1024px+ | Laptops |
| `xl` | 1280px+ | Desktops |
| `2xl` | 1536px+ | Large monitors |

## Layout behavior by portal

### Marketing pages

| Element | Mobile | Tablet | Desktop |
|---------|--------|--------|---------|
| Nav | Hamburger → full-screen sheet | Same | Horizontal links |
| Hero | Stacked text + visual | Stacked | 2-column grid |
| Features | 1 column | 2 columns | 3 columns |
| Pricing | Carousel or stacked cards | 2 columns | 3 columns |
| Footer | Accordion columns | 2 columns | 4 columns |

### Customer portal

| Element | Mobile | Desktop |
|---------|--------|---------|
| Navigation | **Bottom tab bar** (5 items) | Left sidebar (optional) or top |
| Dashboard stats | 2×2 grid | 4 columns |
| Payment table | Card list | Table |
| Pay flow | Full-screen steps | Modal wizard |
| Support thread | Full height chat | Split panel |

**Bottom nav items (customer):**
1. Home (`/customer/dashboard`)
2. Pay (`/customer/payments`)
3. Support (`/customer/support`)
4. Rewards (`/customer/rewards`)
5. More (sheet: Profile, News, Router, Logout)

Touch targets: minimum **44×44px**.

### Admin / reseller portal

| Element | Mobile | Tablet | Desktop |
|---------|--------|--------|---------|
| Sidebar | Hidden → hamburger opens **Sheet** | Collapsed icons | Full sidebar |
| Header | Compact: menu + title + avatar | Breadcrumb | Full breadcrumb + search |
| Data tables | **Card list** with key fields | Horizontal scroll table | Full table |
| Forms | 1 column | 1–2 columns | 2 columns |
| Modals | Bottom sheet | Dialog | Dialog |
| Dashboard charts | Stacked, full width | 2 columns | 2×2 grid |

### Super admin

Same as admin portal patterns.

## Table → mobile card pattern

Each row becomes a card:

```
┌─────────────────────────────┐
│ John Doe          ● Active  │
│ john_pppoe · 20 Mbps        │
│ Expires: 15 Sep 2026        │
│ ৳500 due          [···]     │
└─────────────────────────────┘
```

Implement in `DataTable` via `renderMobileRow(row)`.

## Sidebar mobile sheet

- Trigger: hamburger in header
- Sheet slides from left, full height
- Includes search + full nav tree
- Close on route change

## Typography scale (responsive)

| Element | Mobile | Desktop |
|---------|--------|---------|
| Page title | `text-xl` | `text-2xl` |
| Section title | `text-lg` | `text-xl` |
| Body | `text-sm` | `text-base` |
| Table text | `text-xs` | `text-sm` |

## Spacing

| Context | Mobile padding | Desktop padding |
|---------|------------------|-----------------|
| Page content | `p-4` | `p-6` |
| Card | `p-4` | `p-6` |
| Section gap | `gap-4` | `gap-6` |

## Images

- Use `next/image` with `sizes` attribute
- Hero images: `priority` load
- Marketing: WebP in `public/images/marketing/`

## Testing matrix (required per screen)

Test at these widths in browser DevTools:

- [ ] 320px (iPhone SE)
- [ ] 390px (iPhone 14)
- [ ] 768px (iPad)
- [ ] 1024px (iPad landscape)
- [ ] 1440px (laptop)

Checklist per width:
- [ ] No horizontal overflow (`overflow-x-hidden` on body if needed)
- [ ] Text readable without zoom
- [ ] Buttons tappable
- [ ] Modals fit viewport
- [ ] Charts not clipped

## Safe areas

Support notched phones:

```css
.pb-safe { padding-bottom: env(safe-area-inset-bottom); }
```

Apply to bottom nav.

## Orientation

- Charts and tables reflow on landscape mobile
- Bottom nav stays fixed

## Print (optional)

Payment invoice preview: `@media print` hides sidebar/nav.

## Performance on mobile

- Lazy load below-fold landing sections
- Dynamic import charts: `const Chart = dynamic(() => import('./Chart'), { ssr: false })`
- Skeleton loaders prevent layout shift
