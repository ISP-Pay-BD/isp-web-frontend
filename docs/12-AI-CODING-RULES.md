# 12 — AI Coding Rules

**Mandatory for every AI agent session.** Read before writing any code.

## Project context

- **Repo:** `isp-web-frontend` — Next.js UI for ISP Pay BD
- **Reference:** `isppaybd_isp` — read-only for menus, permissions, copy, tokens
- **Current phase:** Static mock data only — **no real API calls**
- **Docs:** Start at `docs/README.md`

## Absolute rules

1. **Follow phases** in `docs/08-IMPLEMENTATION-PHASES.md` — complete Phase 0 before Phase 1.
2. **Never call external APIs** or CDNs in Phase 1 — fonts/images local in `public/`.
3. **Never import `@/mocks/*` from components or features** — use `lib/mock-api/client` only.
4. **Use shadcn/ui + Tailwind** — no MUI, Chakra, Ant Design, DaisyUI.
5. **Use Lucide icons** — no Font Awesome CDN.
6. **Every form submit** → Zod validate → mock-api → Sonner toast.
7. **Every list page** → loading skeleton + empty state + DataTable.
8. **Every admin action button** → wrap in `<Can menu action>`.
9. **Match design tokens** in `docs/04-DESIGN-SYSTEM.md` — primary `#f75803`.
10. **Update screen status** in `docs/07-SCREEN-INVENTORY.md` when a screen is done.

## File creation rules

| Creating | Put it in |
|----------|-----------|
| New page route | `src/app/.../page.tsx` (thin — compose features) |
| Domain UI/logic | `src/features/{module}/` |
| Shared UI | `src/components/shared/` or `components/layout/` |
| shadcn primitive | `src/components/ui/` (via CLI) |
| Static data | `src/mocks/{domain}/` |
| Data access | `src/lib/mock-api/handlers/` |
| Types shared across features | `src/types/` |
| Nav/permission config | `src/config/` |

## Code style

- TypeScript **strict** — no `any` without `// intentional` comment
- Prefer named exports for features; default export for pages only
- Max ~150 lines per component file — split if larger
- Use `cn()` for conditional classes
- Async mock handlers: always `await delay(MOCK_DELAY_MS)`

## Page template

```tsx
// src/app/(portal)/admin/customers/page.tsx
import { CustomersPage } from '@/features/admin/customers/components/CustomersPage';

export const metadata = { title: 'Customers | ISP Pay BD' };

export default function Page() {
  return <CustomersPage />;
}
```

## When adding a new screen

1. Add row to `docs/07-SCREEN-INVENTORY.md`
2. Create mock data in `mocks/`
3. Create handler in `lib/mock-api/handlers/`
4. Create feature components
5. Create app route
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
pnpm lint
pnpm build
```

Manually verify:
- Screen loads at 320px and 1440px
- Dark mode toggle works
- Toast appears on form submit
- Wrong role gets 403

## Common mistakes to avoid

| Mistake | Fix |
|---------|-----|
| Fetch to isppaybd.com in dev | Use mock-api |
| Google Fonts CDN | Self-host in public/fonts |
| jQuery patterns | React Hook Form + shadcn |
| One giant page.tsx | Split into features/ |
| Hardcoded sidebar links | Use config/navigation.ts |
| Skipping mobile layout | See docs/10-RESPONSIVE-AND-MOBILE.md |

## Questions — use these defaults

If user did not specify:

- Language: EN + BN for marketing/customer
- Mobile customer nav: bottom tabs
- Design: ISP Pay BD tokens + modern shadcn
- Demo users: all 6 from `docs/05-PERMISSIONS-AND-ROLES.md`

## Reference files (read when stuck)

| Problem | Read |
|---------|------|
| What screens exist | `docs/07-SCREEN-INVENTORY.md` |
| Sidebar structure | `isppaybd_isp/app/Views/layout/sidebar.php` |
| Permission keys | `docs/05-PERMISSIONS-AND-ROLES.md` |
| Mock data shapes | `docs/06-MOCK-DATA-SPEC.md` |
| Colors/fonts | `docs/04-DESIGN-SYSTEM.md` |
| Landing copy | `isppaybd_isp/app/Views/landing/partials/` |
