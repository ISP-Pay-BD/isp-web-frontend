# Definition of Done — Every Screen & Module

> A screen is **NOT done** until every checkbox below is true.  
> No "good enough" — this is a premium ISP platform, not a demo.

Cross-reference: `QUALITY-STANDARDS.md`, `07-SCREEN-INVENTORY.md`

---

## A. Route & architecture

- [ ] Route exists in `src/app/` (thin — max ~10 lines)
- [ ] Page component in `src/features/{portal}/{module}/pages/`
- [ ] Module has `components/`, `hooks/`, `schemas/`, `types/` as needed
- [ ] Row in `07-SCREEN-INVENTORY.md` marked `[x]`
- [ ] Metadata (title, description) set

---

## B. Data & API boundary

- [ ] Static data in `src/data/{domain}/`
- [ ] Handler in `src/lib/mock-api/handlers/`
- [ ] Feature hooks call `mockFetch()` only
- [ ] **Zero** `@/data` or `@/mocks` imports in features/components
- [ ] Realistic ISP data (৳, BD phones, package names)

---

## C. UI quality

- [ ] Correct surface: marketing dark OR portal shadcn
- [ ] Design tokens from `04-DESIGN-SYSTEM.md`
- [ ] UI fusion rules from `UI-FUSION-GUIDE.md` followed
- [ ] Looks like ISP Pay BD — **not generic CRM**
- [ ] Icons: Lucide only
- [ ] Typography: correct fonts for surface (landing vs portal)
- [ ] Spacing: 8px grid, consistent padding
- [ ] No anti-slop violations (see `QUALITY-STANDARDS.md` §3)

---

## D. States (all four required)

- [ ] **Loading** — skeleton matching final layout (not spinner-only)
- [ ] **Empty** — illustration/icon + message + primary action
- [ ] **Error** — message + retry action
- [ ] **Success/data** — full UI with real mock content

---

## E. Forms (if applicable)

- [ ] react-hook-form + Zod schema in `schemas/`
- [ ] Inline field errors
- [ ] Submit → mock-api → Sonner toast (success + error)
- [ ] Disabled state while submitting
- [ ] Mobile: single column layout

---

## F. Lists & tables (if applicable)

- [ ] TanStack Table or approved DataTable component
- [ ] Sort and/or filter where reference has it
- [ ] Pagination for lists >20 items
- [ ] Sticky header on desktop
- [ ] Mobile: card list fallback below 768px
- [ ] Row actions behind permission gates

---

## G. Permissions (admin/reseller/platform)

- [ ] Nav item in `config/navigation.ts` with `menu` key
- [ ] Nav hidden if no `read` permission
- [ ] Direct URL → 403 if no access
- [ ] Create button: `<Can action="create">`
- [ ] Edit button: `<Can action="update">`
- [ ] Delete button: `<Can action="delete">` + ConfirmDialog

---

## H. Responsive

Tested and correct at:

- [ ] 320px
- [ ] 375px
- [ ] 768px
- [ ] 1024px
- [ ] 1440px

---

## I. Theme & motion

- [ ] Portal: light + dark mode both work
- [ ] Marketing: dark-only (no light sections)
- [ ] Animations purposeful (see `QUALITY-STANDARDS.md` §4)
- [ ] `prefers-reduced-motion` disables non-essential animation

---

## J. i18n (marketing + customer)

- [ ] EN strings present
- [ ] BN strings present (where reference has BN)
- [ ] Currency: ৳ (BDT)
- [ ] Date format consistent

---

## K. Performance & offline

- [ ] No external CDN (fonts, images, APIs)
- [ ] Images via `next/image` with appropriate sizes
- [ ] Charts lazy-loaded (`dynamic import`)
- [ ] No layout shift on load (CLS)

---

## K. Verification commands

```bash
pnpm lint && pnpm typecheck && pnpm test && pnpm build
```

All must pass with zero errors.

---

## L. Module-level done (entire feature folder)

A **module** (e.g. `features/admin/customers/`) is done when:

- [ ] All routes for that module pass screen DoD above
- [ ] `index.ts` exports public API
- [ ] `README.md` describes routes and permissions
- [ ] Mock data complete for all CRUD operations shown in UI
- [ ] No TODO/FIXME left in module code

---

## Quick reject reasons (auto-fail)

| Seen this | Verdict |
|-----------|---------|
| "Lorem ipsum" | ❌ Fail |
| 3 fake table rows | ❌ Fail |
| No skeleton | ❌ Fail |
| White marketing hero | ❌ Fail |
| Generic "Dashboard" with 3 cards only | ❌ Fail |
| Missing `<Can>` on delete | ❌ Fail |
| `@/data` import in component | ❌ Fail |
| Broken mobile layout | ❌ Fail |
