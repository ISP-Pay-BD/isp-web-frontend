# 09 — Components & Patterns

Reusable patterns every screen must follow.

## Shared layout components

| Component | Path | Purpose |
|-----------|------|---------|
| `AppShell` | `components/layout/AppShell.tsx` | Sidebar + header + main + mobile nav |
| `Sidebar` | `components/layout/Sidebar.tsx` | Nav from `config/navigation.ts`, search, collapse |
| `Header` | `components/layout/Header.tsx` | Breadcrumb, theme toggle, user menu, notifications |
| `MobileNav` | `components/layout/MobileNav.tsx` | Bottom tabs (customer) or drawer trigger (admin) |
| `PageHeader` | `components/shared/PageHeader.tsx` | Title, description, action buttons slot |
| `MarketingNav` | `components/marketing/MarketingNav.tsx` | Landing sticky nav |
| `MarketingFooter` | `components/marketing/MarketingFooter.tsx` | Footer links |

## Shared data components

| Component | Purpose |
|-----------|---------|
| `DataTable` | TanStack Table + shadcn Table + pagination + sort + filter |
| `DataTableToolbar` | Search input, faceted filters, export button |
| `StatCard` | KPI number + label + trend chip + icon |
| `EmptyState` | Icon + title + description + CTA button |
| `ConfirmDialog` | Delete/destructive action confirmation |
| `LoadingSkeleton` | Page-level and table-row skeletons |
| `StatusBadge` | Maps domain status → color (see design system) |
| `CurrencyDisplay` | Formats BDT with ৳ symbol |
| `DateDisplay` | Consistent date formatting |

## Permission components

```tsx
// components/shared/Can.tsx
interface CanProps {
  menu: MenuKey;
  action?: Action;
  fallback?: React.ReactNode;
  children: React.ReactNode;
}
```

```tsx
// Usage
<Can menu="customer" action="delete">
  <Button variant="destructive">Delete</Button>
</Can>
```

## Form pattern

Every form screen uses:

```tsx
const form = useForm<FormValues>({
  resolver: zodResolver(schema),
  defaultValues: ...
});

async function onSubmit(values: FormValues) {
  try {
    await mutation.mutateAsync(values);
    toast.success('Saved successfully');
    router.push('/admin/customers');
  } catch (e) {
    toast.error(e.message ?? 'Something went wrong');
  }
}
```

Form layout:
- `<FormField>` + shadcn `FormItem`, `FormLabel`, `FormControl`, `FormMessage`
- Desktop: `grid grid-cols-2 gap-4`
- Mobile: `grid grid-cols-1`

## List page pattern

```tsx
export default function CustomersPage() {
  return (
    <>
      <PageHeader
        title="Customers"
        description="Manage all PPPoE subscribers"
        actions={
          <Can menu="customer" action="create">
            <Button asChild><Link href="/admin/customers/new">Add Customer</Link></Button>
          </Can>
        }
      />
      <DataTable columns={columns} data={data} isLoading={isLoading} />
    </>
  );
}
```

## Detail page pattern

- Header: name + status badge + action dropdown (Edit, Delete, Renew)
- Tabs: Overview | Subscription | Payments | Audit Log
- Mobile: tabs → select dropdown

## Modal vs sheet rule

| Viewport | Pattern |
|----------|---------|
| ≥768px | `Dialog` |
| <768px | `Sheet` (bottom or side) |

Use hook:

```tsx
const isMobile = useMediaQuery('(max-width: 767px)');
const Modal = isMobile ? Sheet : Dialog;
```

## Toast rules (Sonner)

| Action | Toast |
|--------|-------|
| Create | `toast.success('Customer created')` |
| Update | `toast.success('Changes saved')` |
| Delete | `toast.success('Customer deleted')` |
| Error | `toast.error(message)` |
| Copy | `toast.info('Copied to clipboard')` |
| Async long | `toast.promise(promise, { loading, success, error })` |

Position: `top-right` desktop, `top-center` mobile.

## Table column patterns

Standard customer table columns:
- Checkbox (bulk select)
- Name + username subtext
- Phone
- Package
- Status badge
- Expiry date
- Balance (BDT)
- Actions dropdown

Always include mobile card alternative via `DataTable` `mobileRenderer` prop.

## Chart patterns

Dashboard charts (Recharts):
- Collection trend: AreaChart, last 30 days
- Customer growth: BarChart
- Package distribution: PieChart

Use mock `chartData` from dashboard mock. Responsive: `ResponsiveContainer width="100%" height={300}`.

## Search & filter pattern

- Debounced search (300ms) on client-side mock data
- Filters in popover: status, area, package
- Sync filters to URL via `nuqs` for shareable links

## Bulk actions pattern

- Select rows → sticky bottom bar appears (mobile) or toolbar button (desktop)
- Actions: Bulk renew, Bulk delete, Export Excel (toast only in mock)

## Expired user banner

Show on all portal pages when `user.status === 'inactive'`:

```tsx
<Alert variant="destructive">
  Your subscription expired on {date}. <Link href="...">Renew now</Link>
</Alert>
```

## Command palette (admin)

⌘K / Ctrl+K opens `CommandDialog`:
- Jump to any nav route
- Quick actions: Add customer, Send SMS
- Fuzzy search nav labels

## Icon usage

Use Lucide icons exclusively. Map nav icons in `config/navigation.ts`:

```typescript
import { Users, Package, Wallet } from 'lucide-react';
export const navIcons = { customers: Users, packages: Package, wallet: Wallet };
```

## Do not

- ❌ Inline fetch in page components
- ❌ Import from `@/mocks` in features (use mock-api)
- ❌ Hardcode colors — use CSS variables / Tailwind semantic classes
- ❌ Skip empty states
- ❌ Use `alert()` — always Sonner
