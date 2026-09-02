# 04 — Design System

Ported from `isppaybd_isp` — **two surfaces**, one brand.

> **Full UI fusion rules:** `docs/UI-FUSION-GUIDE.md`

## Two surfaces (do not mix)

| Surface | Theme | Tokens source | Fonts |
|---------|-------|---------------|-------|
| **Marketing** (`/`, `/pricing`…) | Dark only — `#0c0118` bg | `landing.css` | Plus Jakarta Sans + Inter |
| **Portals** (`/admin`, `/customer`…) | Light + dark toggle | `tokens.css` | Satoshi + Noto Sans Bengali |

### Marketing-only tokens

| Token | Value | Usage |
|-------|-------|-------|
| Background | `#0c0118` | Entire landing — no white sections |
| CTA | `#f75803` | Primary buttons only |
| Accent | `#2E8BFF` | Links, eyebrows, highlights |
| Panel | `#180a30` | Cards on dark bg |

### Portal tokens (below)

Used with shadcn/ui CSS variables in logged-in app shells.

---

## Brand identity (portals + shared CTAs)

| Token | Value | Usage |
|-------|-------|-------|
| Primary | `#f75803` | CTAs, active nav, links, focus rings |
| Primary hover | `#e04f00` | Button hover |
| Secondary | `#1a0b38` | Headers, dark backgrounds, sidebar dark |
| Secondary light | `#180a30` | Card backgrounds (dark mode) |
| Background dark | `#0c0118` | Page background (dark mode) |
| Success | `#22c55e` | Active status, paid |
| Warning | `#f59e0b` | Expiring soon |
| Destructive | `#ef4444` | Delete, expired, error |
| Muted | `#64748b` | Secondary text |

## Typography

| Role | Font | Fallback | Surface |
|------|------|----------|---------|
| Marketing display | **Plus Jakarta Sans** | system-ui | Landing |
| Marketing body | **Inter** | system-ui | Landing |
| Portal UI / headings | **Satoshi** | Inter, system-ui | Admin, customer, platform, employee |
| Monospace / IDs | **IBM Plex Mono** | monospace | All |
| Bengali | **Noto Sans Bengali** | sans-serif | All (locale `bn`) |

**Full setup guide:** `docs/FONTS.md`

```css
/* globals.css */
--font-portal-sans: 'Satoshi', 'Inter Variable', 'Inter', system-ui, sans-serif;
--font-portal-mono: 'IBM Plex Mono', ui-monospace, monospace;
--font-landing-display: 'Plus Jakarta Sans Variable', 'Plus Jakarta Sans', system-ui, sans-serif;
--font-landing-body: 'Inter Variable', 'Inter', system-ui, sans-serif;
--font-bengali: 'Noto Sans Bengali', var(--font-landing-body);
```

Apply Bengali font when `locale === 'bn'` on body or `.font-bengali`.

## Border radius

| Token | Value |
|-------|-------|
| `--radius` | `12px` (0.75rem) |
| Card | `rounded-xl` (12px) |
| Button | `rounded-lg` (8px) |
| Input | `rounded-md` (6px) |

## Spacing

8px grid. Use Tailwind spacing scale only (`2`, `4`, `6`, `8`, `12`, `16`…).

## shadcn CSS variables mapping

Map in `globals.css`:

```css
:root {
  --background: 0 0% 100%;
  --foreground: 260 60% 8%;
  --primary: 22 97% 49%;           /* #f75803 */
  --primary-foreground: 0 0% 100%;
  --secondary: 260 68% 13%;        /* #1a0b38 */
  --secondary-foreground: 0 0% 98%;
  --muted: 260 10% 96%;
  --muted-foreground: 260 5% 45%;
  --accent: 22 97% 95%;
  --accent-foreground: 22 97% 35%;
  --destructive: 0 84% 60%;
  --border: 260 10% 90%;
  --ring: 22 97% 49%;
  --radius: 0.75rem;
}

.dark {
  --background: 260 80% 4%;        /* #0c0118 */
  --foreground: 0 0% 98%;
  --primary: 22 97% 49%;
  --secondary: 260 68% 13%;
  --muted: 260 30% 15%;
  --border: 260 20% 18%;
}
```

## Component styling rules

| Component | Style |
|-----------|-------|
| Primary button | Orange bg, white text, shimmer on marketing CTAs |
| Secondary button | Outline or violet bg |
| Cards | Subtle shadow, border `border/50`, no heavy borders |
| Tables | Sticky header, zebra optional, row hover |
| Sidebar | Violet dark bg (dark mode) or white (light); orange active indicator |
| Badges | Semantic colors: active=green, expired=red, pending=amber |
| Stat cards | Icon + number + delta chip |

## Landing page (marketing) aesthetic

Reference: `isppaybd_isp/app/Views/landing/partials/`

| Element | Treatment |
|---------|-----------|
| Hero | Gradient orbs, grid pattern, orbital integration diagram |
| Sections | Scroll reveal (Framer Motion), `lp-container` max-width ~1200px |
| Pricing | 3-tier cards, highlight middle tier |
| FAQ | Accordion (shadcn) |
| CTA | Orange shimmer button |

Design inspiration (copy patterns, not npm dependencies):
- [21st.dev/community/components](https://21st.dev/community/components) — hero, bento, pricing, testimonials
- [shadcn blocks](https://ui.shadcn.com/blocks) — portal dashboard shells only
- PHP landing partials — content/copy source of truth

See `docs/UI-FUSION-GUIDE.md` for section-by-section mapping.

## Portal (app) aesthetic

| Element | Treatment |
|---------|-----------|
| Density | Comfortable — not cramped like legacy AdminLTE |
| Sidebar | Collapsible, searchable menu, pinned items |
| Dashboard | Stat grid 2×2 mobile, 4×1 desktop + charts |
| Forms | 2-column desktop, 1-column mobile |
| Modals | shadcn Dialog desktop; Sheet on mobile |

## Theme Studio (static UI)

Page at `/admin/theme-studio` — controls that update CSS variables in localStorage:

- Primary color picker (default `#f75803`)
- Secondary color picker
- Radius slider (8–16px)
- Density: comfortable / compact

Persist key: `ipb_brand_theme` (match backend).

## Dark mode

- Toggle in header; persist `ipb_theme` in localStorage
- Default: `system` with manual override
- All shadcn components must work in both modes

## Status colors (ISP domain)

| Status | Color | Badge text |
|--------|-------|------------|
| Active | Green | Active |
| Expired | Red | Expired |
| Expiring (<7d) | Amber | Expiring |
| Suspended | Gray | Suspended |
| Online (PPPoE) | Green dot | Online |
| Offline | Gray dot | Offline |

## Accessibility

- Minimum contrast 4.5:1 body text (WCAG AA)
- Focus visible rings on all interactive elements
- `aria-label` on icon-only buttons
- Table headers scoped with `<th scope="col">`
- Form errors linked via `aria-describedby`

## Motion

| Context | Duration | Easing |
|---------|----------|--------|
| Micro (hover) | 150ms | ease-out |
| Modal open | 200ms | ease-out |
| Page transition | 300ms | ease-in-out |
| Landing reveal | 500ms | spring (low bounce) |

Respect `prefers-reduced-motion` — disable animations.
