# 12 — AI Coding Rules

**Mandatory for every AI agent session.** Read before writing any code.

## Project context

- **Repo:** `isp-web-frontend` — Next.js UI for ISP Pay BD
- **User goal:** Premium ISP platform — high quality, professional, modern — **NOT generic CRM**
- **Reference:** `isppaybd_isp` — read-only for menus, permissions, copy, tokens
- **Current phase:** P0 → Phase 1 (planning complete, code not started)
- **Docs:** Start at `docs/PROJECT-MEMORY.md` → `docs/13-STRICT-AGENT-MANDATE.md`

## UI fusion (mandatory)

| Surface | Stack |
|---------|-------|
| Marketing | ISP `landing.css` dark (`#0c0118`) + [21st.dev](https://21st.dev/community/components) inspiration + Framer Motion |
| Portals | shadcn/ui + ISP portal tokens (`#f75803`, `#1a0b38`) |

- Landing is **dark-only** — do not apply generic shadcn light theme
- No heavy 21st shaders — use ISP SVG orbit for hero
- See `docs/UI-FUSION-GUIDE.md` for full matrix

## Absolute rules

1. **Follow phases** in `docs/08-IMPLEMENTATION-PHASES.md` — complete P0 before Phase 1.
2. **Never call external APIs** or CDNs in Phase 1 — fonts/images local in `public/`.
3. **Never import `@/data/*` or `@/mocks/*` from components or features** — use `lib/mock-api/client` only.
4. **Use shadcn/ui + Tailwind** — no MUI, Chakra, Ant Design, DaisyUI.
5. **Use Lucide icons** — no Font Awesome CDN.
6. **Every form submit** → Zod validate → mock-api → Sonner toast.
7. **Every list page** → loading skeleton + empty state + DataTable.
8. **Every admin action button** → wrap in `<Can menu action>`.
9. **Match design tokens** — marketing vs portal split in `docs/04-DESIGN-SYSTEM.md`.
10. **Update screen status** in `docs/07-SCREEN-INVENTORY.md` when DoD passes.
11. **One feature = one folder** under `src/features/` — pages live in `features/.../pages/`.
12. **Pass quality bar** in `docs/QUALITY-STANDARDS.md` — no generic CRM patterns.
13. **Follow master plan** in `docs/MASTER-BUILD-PLAN.md` — no skipping P0.

## File creation rules

| Creating | Put it in |
|----------|-----------|
| New page route | `src/app/.../page.tsx` (thin — import from features) |
| Full screen UI | `src/features/{portal}/{module}/pages/` |
| Module-only UI | `src/features/{portal}/{module}/components/` |
| Module hooks | `src/features/{portal}/{module}/hooks/` |
| Shared UI | `src/components/shared/` or `components/layout/` |
| shadcn primitive | `src/components/ui/` (via CLI) |
| Static data | `src/data/{domain}/` |
| Data access | `src/lib/mock-api/handlers/` |
| Types shared across features | `src/types/` |
| Nav/permission config | `src/config/` |

## Code style

- TypeScript **strict** — no `any` without `// intentional` comment
- Prefer named exports for features; default export for app pages only
- Max ~150 lines per component file — split if larger
- Use `cn()` for conditional classes
- Async mock handlers: always `await delay(MOCK_DELAY_MS)`

## Page template

```tsx
// src/app/(portal)/admin/customers/page.tsx
import { CustomersPage } from '@/features/admin/customers/pages/CustomersPage';

export const metadata = { title: 'Customers | ISP Pay BD' };

export default function Page() {
  return <CustomersPage />;
}
```

## When adding a new screen

1. Add row to `docs/07-SCREEN-INVENTORY.md`
2. Create static data in `src/data/{domain}/`
3. Create handler in `lib/mock-api/handlers/`
4. Create feature module (pages, components, hooks)
5. Create thin app route
6. Add nav item to `config/navigation.ts` with permission
7. Test responsive + dark mode + permissions
8. Mark `[x]` in screen inventory

## Permission checklist for new admin screen

- [ ] Nav item hidden if no `read` permission
- [ ] Route returns 403 page if no access
- [ ] Create button needs `create`
- [ ] Edit needs `update`
- [ ] Delete needs `delete` + ConfirmDialog

## Git rules

- **Do not commit** unless user asks
- **Do not push** unless user asks
- Never force-push `main` or `test`

## Backend changes

- **Do not modify** `isppaybd_isp` during frontend-only work
- When API is needed later, changes go in `isppaybd_isp/zapi/` only

## Verification before claiming done

Run and confirm zero errors:

```bash
pnpm lint && pnpm typecheck && pnpm test && pnpm build
```

Manually verify:
- Screen loads at 320px and 1440px
- Dark mode works (portals); landing is dark-only
- Toast appears on form submit
- Wrong role gets 403
- Animations respect `prefers-reduced-motion`

## Common mistakes to avoid

| Mistake | Fix |
|---------|-----|
| Fetch to isppaybd.com in dev | Use mock-api |
| Google Fonts CDN | Self-host in public/fonts |
| Import `@/data` in features | Use mockFetch() |
| jQuery patterns | React Hook Form + shadcn |
| One giant page.tsx | Split into features/ |
| Light shadcn theme on landing | Use landing dark tokens |
| Heavy 21st shaders | ISP SVG orbit only |
| Hardcoded sidebar links | Use config/navigation.ts |
| Skipping mobile layout | See docs/10-RESPONSIVE-AND-MOBILE.md |

## Questions — use these defaults

If user did not specify:

- Language: EN + BN for marketing/customer
- Mobile customer nav: bottom tabs
- Design: ISP tokens + shadcn portals + 21st-inspired marketing
- Demo users: all 6 from `docs/05-PERMISSIONS-AND-ROLES.md`

## Reference files (read when stuck)

| Problem | Read |
|---------|------|
| What to build next | `docs/MASTER-BUILD-PLAN.md` |
| Quality bar | `docs/QUALITY-STANDARDS.md` |
| Screen done? | `docs/DEFINITION-OF-DONE.md` |
| Strict rules | `docs/13-STRICT-AGENT-MANDATE.md` |
| What screens exist | `docs/07-SCREEN-INVENTORY.md` |
| UI fusion rules | `docs/UI-FUSION-GUIDE.md` |
| Readiness / gaps | `docs/PRE-PHASE-AUDIT.md` |
| Sidebar structure | `isppaybd_isp/app/Views/layout/sidebar.php` |
| Permission keys | `docs/05-PERMISSIONS-AND-ROLES.md` |
| Mock data shapes | `docs/06-MOCK-DATA-SPEC.md`, `src/data/` |
| Colors/fonts | `docs/04-DESIGN-SYSTEM.md` |
| Landing copy | `isppaybd_isp/app/Views/landing/partials/` |
| Landing CSS/JS | `isppaybd_isp/public/assets/css/landing/landing.css`, `landing.js` |
