# Quality Standards — ISP Pay BD (Strict)

> **This is NOT a generic CRM template project.**  
> Every screen must feel like a **premium ISP operations platform** built for Bangladesh ISPs — billing, PPPoE, MikroTik, bKash/Nagad, resellers, POP funding, network ops.

**Violating these standards = screen is NOT done.** No exceptions in Phase 1.

Read with: `UI-FUSION-GUIDE.md`, `DEFINITION-OF-DONE.md`, `MASTER-BUILD-PLAN.md`

---

## 1. Product identity (what we are building)

| ✅ This project IS | ❌ This project is NOT |
|-------------------|------------------------|
| Multi-tenant ISP billing SaaS | Generic admin dashboard |
| Bangladesh ISP domain (৳, bKash, areas, POP) | US-style SaaS clone |
| Reference-faithful to `isppaybd_isp` | "Inspired by" with different features |
| Dark premium marketing + pro portal shells | Bootstrap-style CRUD tables |
| Permission-driven ISP ops (50+ modules) | 5-page demo app |

**Copy, labels, and workflows must use ISP terminology:** customers (not "contacts"), packages (not "plans"), POP/reseller, PPPoE, MikroTik, due/expiry, recharge, areas, OLT, bandwidth buy/sell.

---

## 2. Visual quality bar

### Marketing (public)

| Rule | Requirement |
|------|-------------|
| Theme | **Dark only** — `#0c0118` background, no white hero |
| CTA color | `#f75803` orange — primary actions only |
| Accent | `#2E8BFF` azure — links, eyebrows, highlights |
| Typography | Plus Jakarta Sans (display) + Inter (body) — self-hosted |
| Motion | Framer Motion scroll reveals, stat counters, orbital hero — **purposeful, not decorative spam** |
| Sections | All **28** landing partials from PHP reference (see `07-SCREEN-INVENTORY`) |
| Parity target | **≥90%** visual + content parity with PHP landing |
| Lighthouse mobile | **≥85** performance, **≥90** accessibility |
| JS budget | **<150 KB** gzipped on landing |

### Portals (logged-in)

| Rule | Requirement |
|------|-------------|
| Components | shadcn/ui — polished, consistent, not raw HTML tables |
| Density | Comfortable — readable, not cramped AdminLTE |
| Sidebar | Full ISP menu from `sidebar.php` — searchable, collapsible, permission-filtered |
| Stats/KPIs | Icon + number + delta chip + sparkline where relevant |
| Tables | TanStack Table — sort, filter, pagination, sticky header, mobile card fallback |
| Forms | 2-col desktop / 1-col mobile, inline validation, clear labels |
| Dark mode | Full support on all portal screens |
| Brand | `#f75803` primary, `#1a0b38` sidebar |

---

## 3. Anti-slop rules (FORBIDDEN)

These patterns mean the screen **fails review**:

| Forbidden | Why |
|-----------|-----|
| Inter/Roboto as display font on marketing | Generic AI default |
| Purple gradient on white background | Not ISP brand |
| "Welcome back, User!" empty dashboard | Placeholder quality |
| 3-card dashboard with fake numbers | CRM template |
| Font Awesome / Material icons | Wrong stack |
| MUI / Chakra / Ant / DaisyUI | Wrong stack |
| Google Fonts CDN | Offline requirement |
| Fetch to isppaybd.com in Phase 1 | Mock-only |
| One giant 500-line `page.tsx` | Architecture violation |
| Missing empty/loading/error states | Incomplete |
| Admin buttons without `<Can>` | Permission violation |
| Tables that break on mobile | Responsive failure |
| Heavy 21st shaders (Black Hole, Spline) | Performance + off-brand |
| Rainbow/neon buttons | Off-brand |
| Lorem ipsum copy | Must use real ISP copy from reference |

---

## 4. Animation standards (modern but controlled)

**Marketing — allowed:**
- Hero fade-in + orbital diagram rotation
- Stat counter tween (easeOutExpo, like `landing.js`)
- Section scroll reveal (`whileInView`, once)
- Pricing slider value transitions
- CTA shimmer on hover (subtle)
- Mobile sticky CTA bar slide-up

**Marketing — forbidden:**
- Parallax on every section
- Continuous particle fields
- Auto-playing video backgrounds
- Bounce animations on all elements
- Animation blocking content (LCP)

**Portals — allowed:**
- 150–200ms CSS transitions (hover, focus)
- Skeleton pulse on load
- Sheet/dialog enter/exit
- Toast slide-in

**Portals — forbidden:**
- Framer Motion on every portal page
- Layout-shifting animations
- Infinite spinners without skeleton

**Always:** `@media (prefers-reduced-motion: reduce)` disables non-essential motion.

---

## 5. Domain fidelity (reference is law)

Before building any screen, read the PHP reference:

| Need | Read in `isppaybd_isp` |
|------|------------------------|
| Menu structure | `app/Views/layout/sidebar.php` |
| Platform menu | `app/Views/layout/_sidebar_platform.php` |
| Permissions | `app/Views/access/partial/default-access-fields.php` |
| Landing section | `app/Views/landing/partials/{name}.php` |
| Landing styles | `public/assets/css/landing/landing.css` |
| Landing JS behavior | `public/assets/js/landing/landing.js` |
| Portal tokens | `public/assets/css/saas/tokens.css` |
| Customer views | `app/Views/customer/` or equivalent |
| Admin views | `app/Views/` module folders |

**Do not invent features** not in reference unless added to `07-SCREEN-INVENTORY.md` Section H.

---

## 6. Data quality

| Rule | Requirement |
|------|-------------|
| Location | `src/data/{domain}/` only |
| Access | Features → `mockFetch()` → handlers → `@/data` |
| Realism | Bangladesh phone formats, ৳ currency, ISP package names |
| Volume | Lists show realistic counts (customers: 40+, not 3) |
| i18n | EN + BN strings for marketing + customer-facing |
| Demo users | All 6 accounts with correct permission presets |

---

## 7. Permission quality

| Rule | Requirement |
|------|-------------|
| Sidebar | Every item has `menu` key + role filter |
| Nav filter | Hidden if user lacks `read` on menu |
| Route guard | 403 page if direct URL without permission |
| Buttons | `<Can menu="X" action="create|update|delete">` |
| Expired user | Limited nav: packages, subscription, payment only |
| Reseller | Scoped data labels (POP/reseller context) |

---

## 8. Responsive quality (mandatory breakpoints)

Test every screen at:

| Width | Device |
|-------|--------|
| 320px | Small mobile |
| 375px | iPhone |
| 768px | Tablet |
| 1024px | Laptop |
| 1440px | Desktop |

| Pattern | Mobile behavior |
|---------|-----------------|
| Admin tables | Card list with key fields |
| Admin sidebar | Sheet overlay |
| Customer portal | Bottom nav (5 tabs) |
| Marketing | Hamburger + sticky CTA |
| Forms | Single column |
| Modals | Sheet on mobile, Dialog on desktop |
| Touch targets | Min 44×44px |

---

## 9. Accessibility minimum

- WCAG AA contrast (4.5:1 body text)
- Focus visible on all interactive elements
- `aria-label` on icon-only buttons
- Form errors linked via `aria-describedby`
- Table headers with `scope="col"`
- Skip link on marketing + portal layouts
- Keyboard navigable sidebar and modals

---

## 10. Code quality

| Rule | Requirement |
|------|-------------|
| TypeScript | Strict — no `any` without comment |
| Component size | Max ~150 lines — split if larger |
| Feature colocation | All module code in `src/features/{portal}/{module}/` |
| App routes | Thin (~3 lines) — import from features |
| Tests | Architecture tests pass; unit tests for permissions/utils |
| Verify | `pnpm lint && pnpm typecheck && pnpm test && pnpm build` |

---

## 11. Phase gate rules (cannot skip)

| Gate | Must pass before next phase |
|------|----------------------------|
| P0 → Phase 1 | Tokens, fonts, marketing data, MarketingLayout |
| Phase 1 → 2 | All 28 landing sections, Lighthouse ≥85, EN/BN |
| Phase 2 → 3 | Login + 6 demo users + role redirect + 403 |
| Phase 3 → 4 | All 15 customer screens pass DoD |
| Phase 4 → 5 | Reseller-scoped admin screens pass DoD |
| Phase 5 → 6 | All admin modules pass DoD |
| Phase 6 → 7 | Platform screens pass DoD |
| Phase 7 → done | Employee + polish + full inventory `[x]` |

See `MASTER-BUILD-PLAN.md` for full module list per phase.

---

## 12. Pre-ship self-audit (every screen)

Before marking `[x]` in screen inventory, answer ALL:

- [ ] Does this look like an **ISP platform**, not a generic CRM?
- [ ] Does copy match reference PHP (or approved BN translation)?
- [ ] All 5 breakpoints tested?
- [ ] Loading skeleton present?
- [ ] Empty state present (with helpful action)?
- [ ] Error state present?
- [ ] Dark mode works (portals)?
- [ ] Permissions enforced (nav + route + buttons)?
- [ ] Toast on form submit?
- [ ] No external network requests?
- [ ] No anti-slop violations?
- [ ] `prefers-reduced-motion` respected?
- [ ] TypeScript strict, no lint errors?

**If any answer is NO → screen stays `[ ]`.**

---

## 13. Inspiration sources (use correctly)

| Source | How to use |
|--------|------------|
| `isppaybd_isp` | **Source of truth** — copy, layout, behavior, permissions |
| [21st.dev/components](https://21st.dev/community/components) | Layout + motion **patterns** — adapt to ISP brand |
| shadcn/ui | Portal components — forms, tables, dialogs |
| shadcn blocks | Portal dashboard shells only |

**Never copy 21st.dev npm packages wholesale.** Adapt patterns to ISP tokens.
