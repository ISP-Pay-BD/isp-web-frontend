# UI Fusion Guide — ISP + shadcn + 21st.dev

> **Mandatory read before building any UI.** Defines how three sources work together.

## Golden rule

```
Marketing (public)  →  ISP landing.css + 21st.dev inspiration + minimal shadcn
Portals (logged-in)   →  shadcn/ui + ISP portal tokens (orange/violet)
Never                 →  3 UI libraries on one page
```

Full inspiration catalog: [21st.dev community components](https://21st.dev/community/components)

---

## Source roles

| Source | Role | Where used |
|--------|------|------------|
| **ISP Pay BD PHP** (`isppaybd_isp`) | Brand, content, behavior, tokens | All surfaces — source of truth |
| **shadcn/ui** | Forms, tables, sidebar, dialogs, toasts | Customer + Admin + Platform portals |
| **[21st.dev](https://21st.dev/community/components)** | Layout + motion **inspiration** (copy patterns, not npm packages) | Marketing landing primarily |
| **Framer Motion** | Scroll reveals, hero, counters | Marketing only |
| **Lucide** | Icons | Everywhere |

---

## Dual design system (two surfaces)

### Surface A — Marketing landing

Reference: `isppaybd_isp/public/assets/css/landing/landing.css` + `landing.js`

| Token | Value | Usage |
|-------|-------|-------|
| Background | `#0c0118` | **Entire page** — dark only, no white sections |
| CTA buttons | `#f75803` | Primary actions ONLY (vermilion) |
| Accents / links | `#2E8BFF` | Azure highlights, icons, eyebrows |
| Success / online | `#22C55E` | Paid, reconciled, online status |
| Cards / panels | `#180a30` | Lifted dark panels |
| Text | `#FFFFFF` / muted violet | Body copy |
| Fonts | **Plus Jakarta Sans** + **Inter** | Landing typography |
| Mono | **IBM Plex Mono** | ৳ amounts, IDs, stats |

**Behaviors from `landing.js`:**
- Sticky nav + scroll state
- Stat counter tween (easeOutExpo)
- Hero orbital integration diagram
- Pricing tier slider + PAYG calculator
- Scroll reveal sections
- Mobile sticky CTA bar
- EN/BN language toggle
- `prefers-reduced-motion` respected

### Surface B — Admin / Customer / Platform portals

Reference: `isppaybd_isp/public/assets/css/saas/tokens.css` + `sidebar.php`

| Token | Value | Usage |
|-------|-------|-------|
| Primary | `#f75803` | Buttons, active nav |
| Sidebar | `#1a0b38` | Admin shell |
| Background dark | `#0c0118` | Dark mode page |
| Fonts | **Satoshi** + **Noto Sans Bengali** | Portal UI |
| Components | **shadcn/ui** full kit | All portal screens |

---

## 21st.dev → ISP section mapping

### Marketing sections

| ISP section (PHP partial) | 21st.dev category | Adapt |
|---------------------------|-------------------|-------|
| `hero.php` | [Heros](https://21st.dev/community/components) — Radial Orbital Timeline, Animated hero | Orbital diagram + scroll |
| `stats.php` | [Stats & KPIs](https://21st.dev/community/components) | Animated counters |
| `features.php` | [Features](https://21st.dev/community/components) — Bento / Grids | Bento feature grid |
| `pricing.php` | [Pricing Sections](https://21st.dev/community/components) | Tier cards + comparison |
| `testimonials.php` | [Testimonials](https://21st.dev/community/components) | Column or marquee layout |
| `faq.php` | [FAQs](https://21st.dev/community/components) | shadcn Accordion + dark styling |
| `integrations.php` | Hero orbit (keep ISP version) | Do NOT use heavy Shaders |
| `cta_contact.php` | [Calls to Action](https://21st.dev/community/components) | Shimmer CTA — color stays `#f75803` |
| `nav.php` | [Navigation Menus](https://21st.dev/community/components) | Sticky blur nav |
| `footer.php` | [Footers](https://21st.dev/community/components) | Multi-column dark |

### Portal modules

| ISP module | 21st.dev category | Implement with |
|------------|-------------------|----------------|
| Dashboard KPIs | [Dashboards](https://21st.dev/community/components), [Stats & KPIs](https://21st.dev/community/components) | shadcn Card + Recharts |
| Customer table | [Tables](https://21st.dev/community/components) | shadcn + TanStack Table |
| Sidebar | [Sidebars](https://21st.dev/community/components) | shadcn Sidebar |
| Login | [Sign Ins](https://21st.dev/community/components) | shadcn Card + Input |
| Support tickets | [AI Chats](https://21st.dev/community/components) | Thread layout (not AI unless built) |
| Empty states | [Empty States](https://21st.dev/community/components) | shadcn + Lucide |
| Register / trial | [Onboarding](https://21st.dev/community/components) | Multi-step form |

### Do NOT use from 21st.dev (keep lightweight)

| Skip | Why |
|------|-----|
| Heavy [Shaders](https://21st.dev/community/components) (Black Hole, Fluid, Spline) | Large JS, bad mobile LCP |
| 3D Globes on every page | Use ISP SVG orbit instead |
| Neon / rainbow buttons | Breaks ISP brand |
| Multiple animation libraries | Framer Motion only on marketing |

---

## shadcn/ui usage matrix

| Component | Marketing | Portal |
|-----------|-----------|--------|
| Button | ✅ CTAs | ✅ All actions |
| Card | ✅ Feature cards | ✅ Stat cards |
| Accordion | ✅ FAQ | ✅ Filters |
| Dialog / Sheet | ❌ rare | ✅ CRUD, mobile |
| Sidebar | ❌ | ✅ Admin shell |
| Table | ❌ | ✅ All lists |
| Form + Input | ✅ Contact | ✅ All forms |
| Sonner toast | ✅ | ✅ |
| Skeleton | ✅ | ✅ |
| Tabs | ✅ Pricing toggle | ✅ Detail pages |
| Command (⌘K) | ❌ | ✅ Admin quick nav |

Install via CLI: `pnpm dlx shadcn@latest add <component> --yes`

---

## Performance targets (fast + lightweight)

| Metric | Target |
|--------|--------|
| Lighthouse mobile (landing) | **85+** |
| Landing JS (gzipped) | **< 150 KB** |
| Portal route JS | **< 200 KB** per major page |
| Images | `next/image`, WebP, lazy below fold |
| Fonts | Self-host in `public/fonts/`, `font-display: swap` |
| Charts | `dynamic(() => import('recharts'), { ssr: false })` |
| 21st shader blocks | Max **0–1** per page, lazy loaded |

---

## Animation standards

| Surface | Animation | Tool |
|---------|-----------|------|
| Landing hero | Fade + orbital spin | Framer Motion + CSS |
| Landing stats | Count up | JS tween (like `landing.js`) |
| Landing sections | Scroll reveal | Framer `whileInView` |
| Pricing slider | Smooth value change | React state + CSS |
| Portal pages | 200ms fade | CSS transitions only |
| Buttons | hover scale ≤ 1.02 | Tailwind |
| All | Disable if | `@media (prefers-reduced-motion: reduce)` |

---

## Mobile UX

| Portal | Pattern |
|--------|---------|
| Customer | Bottom nav (5 tabs) + sheets |
| Admin | Hamburger → sidebar sheet |
| Marketing | Hamburger + sticky mobile CTA |
| Tables | Card list below 768px |
| Touch targets | Min **44×44px** |

---

## Reference file paths (backend)

| Purpose | Path in `isppaybd_isp` |
|---------|------------------------|
| Landing CSS | `public/assets/css/landing/landing.css` |
| Landing JS | `public/assets/js/landing/landing.js` |
| Landing partials | `app/Views/landing/partials/*.php` |
| Portal tokens | `public/assets/css/saas/tokens.css` |
| Sidebar menu | `app/Views/layout/sidebar.php` |
| Permissions | `app/Views/access/partial/default-access-fields.php` |

---

## Quality bar (realistic v1)

| Dimension | Target |
|-----------|--------|
| Landing visual parity with PHP | **~90%** |
| Portal shadcn polish | **Production-grade** |
| 21st-level motion | Hero, stats, pricing, testimonials |
| Bengali support | EN + BN on marketing + customer |
| Offline | All data from `src/data/`, no CDN |

---

## Locked stack (do not add)

| ✅ Use | ❌ Do not add |
|--------|---------------|
| shadcn/ui | MUI, Chakra, Ant Design |
| Tailwind v4 | DaisyUI on frontend |
| Framer Motion (marketing) | GSAP + Motion together |
| Lucide | Font Awesome CDN |
| TanStack Table | AG Grid (too heavy for v1) |
| Recharts | Heavy chart libraries |

---

## Implementation checklist per screen

- [ ] Correct surface (marketing vs portal tokens)
- [ ] Data from `mockFetch()` not `@/data` in components
- [ ] shadcn primitives for portal forms/tables
- [ ] Loading skeleton + empty state
- [ ] Responsive 320px → 1440px
- [ ] Sonner toast on mutations
- [ ] `<Can>` on admin actions
- [ ] `prefers-reduced-motion` safe
- [ ] Mark done in `07-SCREEN-INVENTORY.md`
