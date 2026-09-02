---
name: isp-pay-bd
description: >-
  Default skill for isp-web-frontend — premium ISP Pay BD platform (NOT generic CRM).
  Enforces UI fusion, approved libraries, forbidden stacks, PHP reference workflow,
  fonts, phases, and quality gates. Use for ANY work in this repo: UI, features,
  landing, portals, mock data, docs, or debugging.
---

# ISP Pay BD Frontend — Default Project Skill

**Goal:** Premium ISP operations platform for Bangladesh — complete, professional, modern. **NOT a generic CRM.**

---

## Session start (always, in order)

1. `docs/PROJECT-MEMORY.md`
2. `docs/13-STRICT-AGENT-MANDATE.md`
3. `docs/QUALITY-STANDARDS.md`
4. `docs/UI-FUSION-GUIDE.md`
5. `docs/MASTER-BUILD-PLAN.md` — current phase
6. `docs/PLAN-STATUS.md` — plan vs execution

**Before any screen/feature:**
7. `docs/07-SCREEN-INVENTORY.md` — screen spec
8. `docs/REFERENCE-MAP.md` — PHP path in `../isppaybd_isp`
9. Read PHP view → then code

**Before typography:** `docs/FONTS.md`  
**Before marking done:** `docs/DEFINITION-OF-DONE.md`

---

## Build workflow (every feature)

```
Inventory → REFERENCE-MAP → read PHP → src/data/ → mock-api handler → src/features/ → thin app route
```

| Step | Rule |
|------|------|
| Data | `src/data/` only; features use `mockFetch()` never `@/data` |
| Routes | `src/app/` thin (~3 lines); UI in `src/features/{portal}/{module}/` |
| Reference | Copy/behavior from `../isppaybd_isp` — do not invent |
| Verify | `pnpm lint && pnpm typecheck && pnpm test && pnpm build` |
| Done | Update `07-SCREEN-INVENTORY.md` only after DoD passes |

---

## UI fusion (two surfaces — never mix wrongly)

| Surface | Routes | USE | DO NOT USE |
|---------|--------|-----|------------|
| **Marketing** | `/`, `/pricing`, `/plugins`… | ISP dark `#0c0118`, CTA `#f75803`, accent `#2E8BFF`, Plus Jakarta + Inter, [21st.dev](https://21st.dev/community/components) inspiration, Framer Motion | White hero, shadcn light theme, MUI, generic SaaS template, Roboto, heavy shaders |
| **Portals** | `/admin`, `/customer`, `/platform`, `/employee` | shadcn/ui, Satoshi, `#f75803` / `#1a0b38`, TanStack Table, Lucide | 21st.dev copy-paste, DaisyUI, MUI, Chakra, Ant Design, landing dark theme |

**Golden rule:** Marketing = ISP landing + 21st inspiration. Portals = shadcn + ISP tokens. Never 3 UI libraries on one page.

---

## USE — approved libraries (default stack)

| Layer | Library | Link |
|-------|---------|------|
| Framework | Next.js 16, React 19, TypeScript | https://nextjs.org |
| Styling | Tailwind CSS v4 | https://tailwindcss.com |
| Portal UI | shadcn/ui + Radix | https://ui.shadcn.com |
| Icons | Lucide React | https://lucide.dev |
| Motion | Framer Motion (**marketing only**) | https://motion.dev |
| Tables | TanStack Table | https://tanstack.com/table |
| Data cache | TanStack Query | https://tanstack.com/query |
| Forms | React Hook Form + Zod | https://react-hook-form.com |
| State | Zustand | https://zustand.docs.pmnd.rs |
| URL state | nuqs | https://nuqs.47ng.com |
| Toasts | Sonner | https://sonner.emilkowal.ski |
| Theme | next-themes | https://github.com/pacocoursey/next-themes |
| Charts | Recharts (lazy) | https://recharts.org |
| Carousel | Embla | https://www.embla-carousel.com |
| Counters | @number-flow/react | https://number-flow.barvian.me |
| i18n | next-intl | https://next-intl.dev |
| Command ⌘K | cmdk | https://cmdk.paco.me |

Full list: [ui-libraries.md](ui-libraries.md)

---

## DO NOT USE — forbidden

| Category | Forbidden | Why |
|----------|-----------|-----|
| UI kits | MUI, Chakra, Ant Design, DaisyUI | Conflicts with shadcn/Tailwind; generic CRM look |
| Legacy | jQuery, Bootstrap 3, AdminLTE | Not Next.js |
| Icons CDN | Font Awesome CDN | Offline rule — use Lucide |
| Fonts CDN | Google Fonts CDN | Self-host — `docs/FONTS.md` |
| Fonts | Roboto, Open Sans as primary | Generic CRM / dated SaaS |
| State | Redux | Zustand + Query enough |
| HTTP | Axios (Phase 1) | Native fetch later |
| Motion | GSAP + Framer + anime together | Framer only on marketing |
| 21st.dev | Heavy Shaders, 3D globes everywhere | Bad LCP; use ISP SVG orbit |
| Backend | Edit `isppaybd_isp` in frontend work | Read-only reference |

---

## UI inspiration — USE for reference (patterns only, not npm)

| Purpose | Site | Link |
|---------|------|------|
| **Primary component inspiration** | 21st.dev | https://21st.dev/community/components |
| **Source of truth (copy/layout)** | isppaybd_isp PHP | `docs/REFERENCE-MAP.md` |
| Dark SaaS polish | Linear, Vercel, Raycast | https://linear.app |
| Pricing/trust sections | Stripe | https://stripe.com |
| shadcn patterns | shadcn docs | https://ui.shadcn.com |
| Dashboard KPIs | Tremor (inspiration) | https://www.tremor.so |
| Motion ideas | Magic UI, Motion Primitives | https://magicui.design |

Full list with categories: [ui-libraries.md](ui-libraries.md)

---

## Fonts (locked — 5 families)

| Surface | Font | Class |
|---------|------|-------|
| Marketing headings | Plus Jakarta Sans | `font-landing-display` |
| Marketing body | Inter | `font-landing-body` |
| Portals | Satoshi | `font-portal` (default) |
| Bengali | Noto Sans Bengali | `font-bengali` |
| IDs / TrxID / IP | IBM Plex Mono | `font-mono` |

Details: `docs/FONTS.md` · Sync: `pnpm fonts:sync`

---

## Formatters & constants

| Need | Import |
|------|--------|
| ৳ / date / BD phone / MAC | `@/lib/format` |
| Status enums, page size | `@/lib/constants` |
| Tenant colors / brand | `@/config/theme` |
| EN/BN strings | `@/i18n` (`messages/en.json`, `bn.json`) |

Map: `docs/PROJECT-STRUCTURE-MAP.md`

---

## Phase gate

| Phase | Status | Trigger |
|-------|--------|---------|
| P0 | ✅ Complete | — |
| Phase 1 | ⏳ Next | User says **"start Phase 1"** |
| Phase 2–7 | Planned | After prior phase DoD |
| Phase 8 API | Out of scope | Future |

Do not skip phases. Do not start Phase 1 landing without user go-ahead.

---

## Quality (non-negotiable)

- 4 states: loading, empty, error, success
- Responsive: 320px → 1440px
- Permissions: `useFilteredNav` + route guard + `<Can>` on actions
- No lorem ipsum; realistic BD ISP data (৳, bKash, PPPoE)
- No external CDN (fonts, images, APIs) in Phase 1
- `prefers-reduced-motion` on marketing animations

---

## Git

- Commit only when user asks
- Never delete `main` or `test` branches
- PR workflow to `test` then `main`

---

## Additional resources

- UI + libs detail: [ui-libraries.md](ui-libraries.md)
- PHP paths: `docs/REFERENCE-MAP.md`
- UI fusion matrix: `docs/UI-FUSION-GUIDE.md`
- Tech stack lock: `docs/03-TECH-STACK.md`
