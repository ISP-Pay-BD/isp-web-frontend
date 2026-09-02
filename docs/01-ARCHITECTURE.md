# 01 — Architecture

## High-level diagram

```
┌─────────────────────────────────────────────────────────────┐
│                     Next.js App Router                       │
├──────────────┬──────────────┬──────────────┬────────────────┤
│  (marketing) │    (auth)    │   (portal)   │   middleware   │
│  Public pages│ Login/Register│ Sidebar shell│ Role + perm    │
└──────┬───────┴──────┬───────┴──────┬───────┴────────┬───────┘
       │              │              │                │
       ▼              ▼              ▼                ▼
┌─────────────────────────────────────────────────────────────┐
│                      features/*                              │
│   Domain UI + hooks + schemas (NO direct fetch)              │
└──────────────────────────┬──────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                   lib/mock-api/  (Phase 1)                   │
│   client.ts → handlers/* → mocks/*                           │
│   Same interface as lib/api/ (Phase 2)                       │
└──────────────────────────┬──────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                      mocks/*                                 │
│   Static JSON/TS data — offline only                         │
└─────────────────────────────────────────────────────────────┘
```

## Layer responsibilities

### 1. `app/` — Routes only (thin)

- Compose layouts and feature components
- Export `metadata` for SEO (marketing pages)
- No business logic, no direct mock imports
- Max ~80 lines per page file

### 2. `features/` — Domain modules

Each feature is self-contained:

```
features/customers/
├── components/       # CustomerTable, CustomerForm, CustomerDetail
├── hooks/            # useCustomers, useCustomerMutations
├── schemas/          # customerFormSchema (Zod)
├── types/            # Customer, CustomerFilters
└── index.ts          # Public exports
```

**Rule:** Features call `lib/mock-api/client`, never `mocks/` directly.

### 3. `components/` — Shared UI

| Folder | Contents |
|--------|----------|
| `ui/` | shadcn primitives (Button, Dialog, Table…) |
| `layout/` | AppShell, Sidebar, Header, Footer, MobileNav |
| `marketing/` | Hero, PricingCard, FAQAccordion |
| `shared/` | DataTable, PageHeader, StatCard, EmptyState, ConfirmDialog |

### 4. `lib/mock-api/` — Data access boundary

```typescript
// lib/mock-api/client.ts
export async function mockFetch<T>(handler: string, params?: unknown): Promise<T> {
  await delay(200); // simulate network
  return handlers[handler](params) as T;
}
```

Phase 2: rename/swap to `lib/api/client.ts` with real fetch + JWT.

### 5. `mocks/` — Static data only

Pure data. No React, no side effects. Typed with shared types from `types/`.

### 6. `stores/` — Client state (Zustand)

| Store | Purpose |
|-------|---------|
| `auth-store` | Current user, role, permissions, expired flag |
| `ui-store` | Sidebar collapsed, theme, mobile drawer open |
| `demo-store` | Dev role switcher (optional) |

### 7. `config/` — Static configuration

| File | Purpose |
|------|---------|
| `navigation.ts` | Sidebar items per role (with permission keys) |
| `site.ts` | App name, URLs, metadata |
| `theme.ts` | CSS variable mapping |

## Auth flow (mock phase)

```
Login form → mock-api/auth.login(credentials)
  → match demo user in mocks/users/
  → set auth-store (user + permissions)
  → redirect by role:
      user        → /customer/dashboard
      resellerAdmin → /admin/dashboard
      admin       → /admin/dashboard
      super_admin → /platform/dashboard
      employee    → /employee/salaries
```

No cookies required in mock phase. Use Zustand + `localStorage` persistence optional.

## Permission flow

```
auth-store.permissions: Record<MenuKey, Action[]>
         │
         ▼
can(menu, action?) → boolean
         │
    ┌────┴────┐
    ▼         ▼
middleware   <Can menu="customer" action="create"> button
(route)      (component)
```

## Layout groups (App Router)

| Group | Path prefix | Layout |
|-------|-------------|--------|
| `(marketing)` | `/`, `/pricing`, `/plugins`… | Marketing header + footer |
| `(auth)` | `/login`, `/register`… | Centered card, no sidebar |
| `(portal)/customer` | `/customer/*` | Portal shell, customer nav |
| `(portal)/admin` | `/admin/*` | Portal shell, admin/reseller nav |
| `(portal)/platform` | `/platform/*` | Portal shell, super-admin nav |
| `(portal)/employee` | `/employee/*` | Portal shell, employee nav |

## State management rules

| Use case | Tool |
|----------|------|
| Server-like data (lists, details) | TanStack Query + mock-api |
| Auth session | Zustand |
| Form state | React Hook Form |
| URL filters/pagination | `nuqs` or searchParams |
| Theme | next-themes |

## Error handling

| Layer | Pattern |
|-------|---------|
| mock-api | Throw `MockApiError` with code + message |
| hooks | TanStack Query `onError` → Sonner toast |
| forms | Zod + field errors + toast |
| pages | `error.tsx` boundary per route group |

## Backend swap strategy (future)

1. Define `ApiClient` interface in `lib/api/types.ts`
2. `mock-api` and `api` both implement it
3. Env flag: `NEXT_PUBLIC_USE_MOCK=true|false`
4. Components unchanged — only client import switches

## Non-goals (Phase 1)

- Server Components fetching real API
- SSR auth with httpOnly cookies
- WebSocket / real-time traffic
- File upload to server (UI only — show success toast)
- PDF generation (show preview modal with static HTML)
