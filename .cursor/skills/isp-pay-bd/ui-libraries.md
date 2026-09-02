# UI References & Libraries — ISP Pay BD Frontend

Companion to `.cursor/skills/isp-pay-bd/SKILL.md` and `docs/UI-REFERENCES-LIBS.md`.

---

## USE — implementation libraries (install via pnpm / shadcn CLI)

| Library | Version area | Purpose | Docs |
|---------|--------------|---------|------|
| next | 16.x | App Router, Turbopack | https://nextjs.org/docs |
| react | 19.x | UI | https://react.dev |
| typescript | 5.x | Strict types | https://www.typescriptlang.org/docs |
| tailwindcss | 4.x | Utilities | https://tailwindcss.com/docs |
| shadcn/ui | latest CLI | Portal components | https://ui.shadcn.com/docs |
| @radix-ui/* | via shadcn | A11y primitives | https://www.radix-ui.com |
| lucide-react | bundled | Icons | https://lucide.dev/icons |
| framer-motion | marketing only | Scroll, hero | https://motion.dev/docs |
| @tanstack/react-query | 5.x | Server/mock cache | https://tanstack.com/query/latest |
| @tanstack/react-table | 9.x | Data tables | https://tanstack.com/table/latest |
| react-hook-form | 7.x | Forms | https://react-hook-form.com/docs |
| zod | 3.x | Schemas | https://zod.dev |
| zustand | 5.x | Auth/UI state | https://zustand.docs.pmnd.rs |
| nuqs | latest | URL query state | https://nuqs.47ng.com |
| sonner | latest | Toasts | https://sonner.emilkowal.ski |
| next-themes | latest | Dark mode | https://github.com/pacocoursey/next-themes |
| recharts | latest | Charts (lazy) | https://recharts.org |
| embla-carousel-react | latest | Carousels | https://www.embla-carousel.com |
| @number-flow/react | latest | Stat counters | https://number-flow.barvian.me |
| next-intl | latest | EN/BN | https://next-intl.dev/docs |
| cmdk | latest | Command palette | https://cmdk.paco.me |
| date-fns | latest | Dates | https://date-fns.org |
| vitest | tests/ | Unit tests | https://vitest.dev |

**Install shadcn component:** `pnpm dlx shadcn@latest add <name> --yes`

---

## DO NOT USE — libraries

| Library | Reason |
|---------|--------|
| @mui/material | Conflicts with Tailwind/shadcn |
| @chakra-ui/react | Different design system |
| antd | Generic enterprise CRM |
| daisyui | Backend stack only |
| jquery | Legacy |
| bootstrap | Legacy AdminLTE era |
| axios | Use fetch in Phase 2+ |
| redux / @reduxjs/toolkit | Zustand sufficient |
| mobx | Not in stack |
| styled-components / emotion | Tailwind only |
| fontawesome (CDN) | Lucide bundled |
| @fontsource/roboto | Generic — see FONTS.md |

---

## USE — UI inspiration websites (copy patterns, adapt to ISP tokens)

### Primary (mandatory awareness)

| Site | Use for | Link |
|------|---------|------|
| **21st.dev** | Hero, pricing, bento, stats, nav, FAQ, testimonials | https://21st.dev/community/components |
| **isppaybd_isp** | Copy, fields, menus, behavior | `docs/REFERENCE-MAP.md` |

### Marketing / landing inspiration

| Site | Use for | Link |
|------|---------|------|
| Vercel | Dark hero, typography | https://vercel.com |
| Linear | Premium dark SaaS | https://linear.app |
| Raycast | Product marketing | https://www.raycast.com |
| Stripe | Pricing, trust | https://stripe.com |
| Resend | Developer SaaS landing | https://resend.com |
| Magic UI | Animated sections (light use) | https://magicui.design |
| Aceternity UI | Dark effects (light use) | https://ui.aceternity.com |
| Motion Primitives | Scroll patterns | https://motion-primitives.com |
| Tailwind UI | Section layouts | https://tailwindui.com |

### Portal / admin inspiration

| Site | Use for | Link |
|------|---------|------|
| shadcn/ui examples | Tables, forms, sidebar | https://ui.shadcn.com/examples |
| Tremor | Dashboard KPI layout | https://www.tremor.so |
| Radix Colors | Token scales | https://www.radix-ui.com/colors |

---

## DO NOT USE — inspiration patterns

| Pattern | Why |
|---------|-----|
| Generic admin dashboard template (3-card only) | Fails quality bar |
| White marketing hero on ISP landing | Breaks brand — dark `#0c0118` only |
| Neon/rainbow gradients on CTAs | Use `#f75803` only |
| Heavy WebGL shaders on landing | LCP/mobile — max 0–1 lazy |
| 3D globe replacing ISP orbital diagram | Keep PHP hero orbit |
| Material Design look (Roboto, elevation cards) | CRM slop |
| Copy-paste 21st.dev without ISP colors/fonts | Must fuse with UI-FUSION-GUIDE |

---

## 21st.dev → ISP section mapping

| ISP section | 21st.dev category | Link |
|-------------|-------------------|------|
| hero.php | Heros | https://21st.dev/community/components |
| stats.php | Stats & KPIs | https://21st.dev/community/components |
| features.php | Features / Bento | https://21st.dev/community/components |
| pricing.php | Pricing Sections | https://21st.dev/community/components |
| testimonials.php | Testimonials | https://21st.dev/community/components |
| faq.php | FAQs | https://21st.dev/community/components |
| nav.php | Navigation Menus | https://21st.dev/community/components |
| footer.php | Footers | https://21st.dev/community/components |
| Admin dashboard | Dashboards, Tables, Sidebars | https://21st.dev/community/components |

Implement portal patterns with **shadcn**, not 21st npm packages.

---

## Fonts — USE / DO NOT USE

| USE | DO NOT USE |
|-----|------------|
| Plus Jakarta Sans (marketing display) | Roboto |
| Inter (marketing body) | Inter everywhere on portals |
| Satoshi (portals) | Geist/DM Sans as brand |
| Noto Sans Bengali | Baloo Da 2 for admin |
| IBM Plex Mono | Roboto Mono |

See `docs/FONTS.md`.
