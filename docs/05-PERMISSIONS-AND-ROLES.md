# 05 — Permissions & Roles

Source of truth: `isppaybd_isp/app/Views/access/partial/default-access-fields.php` and `app/Views/layout/sidebar.php`.

## User roles

| Role key | Label | Default redirect after login |
|----------|-------|------------------------------|
| `super_admin` | Super Admin | `/platform/dashboard` |
| `admin` | Tenant Admin | `/admin/dashboard` |
| `resellerAdmin` | Reseller / POP | `/admin/dashboard` |
| `employee` | Employee | `/employee/salaries` |
| `user` | Customer | `/customer/dashboard` |

## Permission model

Permissions are stored as:

```typescript
type PermissionMap = Record<MenuKey, Action[]>;

// Example
{
  "customer": ["read", "create", "update", "delete"],
  "customer_payment": ["read", "create"],
  "packages": ["read"]
}
```

### Menu keys and actions

| Menu key | Label | Actions |
|----------|-------|---------|
| `area` | Service Areas | read, create, update, delete |
| `packages` | Packages | read, create, update, delete |
| `customer` | Customers | read, create, update, delete, update_subscription, update_conn, free_customer_create |
| `employee` | Employees | read, create, update, delete |
| `employee_attendance` | Employee Attendance | read, create, update, delete |
| `advance_salary` | Advance Salary | read, create, update, delete |
| `Resellers` | Resellers (POP) | read, create, update, delete, update_subscription, update_conn, self_recharge, daily_payment_generate |
| `reseller` | Reseller (alias) | same as Resellers |
| `customer_payment` | Customers Payment | read, create, update, delete, invoice |
| `employee_payment` | Employees Payment | read, create, update, delete |
| `inventory_purchess` | Inventory & Purchase | read, create, update, delete |
| `network` | Network | read, create, update, delete |
| `hotspot` | Hotspot | read, create, update, delete |
| `olt` | OLT | read, create, update, delete |
| `accounting` | Accounting | read, create, update, delete |
| `support_ticket` | Support Tickets | read, create, update, delete, send_msg |
| `referral` | Referral & Reward | read, update |
| `recycle_bin` | Recycle Bin | read, restore, delete_forever, empty |
| `sms_message` | SMS | read, create, delete |
| `reports` | Reports | read, create, update, delete |
| `software_settings` | Software Settings | read, update |
| `routers` | Mikrotik Routers | read, create, update, delete, sync |
| `profile_update` | Profile Update | read, update |
| `password_change` | Change Password | update |
| `payment` | Payment Records | read, invoice, payment (online) |
| `subscription` | Subscription | read, renew |
| `ai_chat` | AI Chat Assistant | chat |
| `whatsapp_business` | WhatsApp Business | read, update, ai, utility, authentication, marketing |
| `whatsapp_waha` | WhatsApp WAHA | read, update |

## Role → default sidebar (without custom permissions)

### Super admin (`super_admin`)

Always visible (role-based, not permission-gated):
- Dashboard
- **System:** Tenants, Admins, Platform (showcase, revenue, contacts)
- Customers Payment (if `customer_payment`)
- Admin Support Tickets
- Plugins & Addons
- File Manager
- User Access Management
- Software Settings
- WhatsApp Business (full tree)
- Theme Studio, Change Password, Logout

### Tenant admin (`admin`)

Full tenant ops — gated by permissions per item. See sidebar sections:
- Operations: Service Areas, Customers, HR, Packages, Accounting, POP, Hotspot, OLT, Routers, IP Pools, Network, SMS, Voice SMS, Referral, Support, Recycle Bin, Settings, WhatsApp, User Access, Billing (admin packages, self recharge, wallet, my payment)

### Reseller (`resellerAdmin`)

Subset of admin:
- Service Areas (if `area`)
- Customers + Customer Payments
- HR (if any HR permission)
- POP Packages
- POP Transactions, POP Funding
- Accounting (limited)
- Support, Referral, SMS, Profile, Payment, Theme Studio

Resellers **do NOT** see (unless super_admin): Inventory, Bandwidth buy/sell, Network admin, OLT, Routers, User Access, Wallet, BTRC reports.

### Customer (`user`)

- Dashboard (implicit)
- My Subscription (if `subscription`)
- User's Packages
- My Payment (if `payment`)
- Referrals & Rewards
- News & Notices
- Support Tickets (if `support_ticket`)
- Profile, Theme Studio, Change Password, Logout

### Employee (`employee`)

- Dashboard (limited)
- My Salaries
- Advance Salary
- Profile, Theme Studio, Change Password, Logout

## Expired session sidebar

When `user.status === 'inactive'` (expired subscription):

| Role | Limited menu |
|------|--------------|
| `admin` | Admin's Packages, Self Recharge, My Payment, Logout |
| `user` | User's Packages, My Subscription, My Payment, Logout |

All other routes redirect to `/customer/subscription` or `/admin/subscription/self-recharge` with banner.

## Implementation

### `lib/permissions/can.ts`

```typescript
export function can(
  permissions: PermissionMap,
  menu: MenuKey,
  action?: Action,
  role?: Role
): boolean {
  if (role === 'super_admin') return true; // platform owner bypass
  const actions = permissions[menu];
  if (!actions?.length) return false;
  if (!action) return true;
  return actions.includes(action);
}
```

### React component

```tsx
<Can menu="customer" action="create">
  <Button>Add Customer</Button>
</Can>
```

### Route guard (`middleware.ts`)

Mock phase: read role from cookie/header set by client auth store, or allow all in dev with demo toolbar.

Check:
1. Is authenticated?
2. Role allowed for path prefix?
3. If expired → only billing routes

### Navigation config (`config/navigation.ts`)

Each nav item:

```typescript
{
  id: 'customers',
  label: 'Customers',
  href: '/admin/customers',
  icon: 'Users',
  roles: ['admin', 'resellerAdmin'],
  permission: { menu: 'customer', action: 'read' },
  children: [...]
}
```

Filter with `can()` + role + expired state.

## Demo users (mock auth)

| Email | Password | Role | Notes |
|-------|----------|------|-------|
| `customer@demo.isppaybd.com` | `demo1234` | `user` | Active subscription |
| `customer-expired@demo.isppaybd.com` | `demo1234` | `user` | Expired — limited nav |
| `reseller@demo.isppaybd.com` | `demo1234` | `resellerAdmin` | POP operator |
| `admin@demo.isppaybd.com` | `demo1234` | `admin` | Full permissions |
| `employee@demo.isppaybd.com` | `demo1234` | `employee` | HR self-service |
| `super@demo.isppaybd.com` | `demo1234` | `super_admin` | Platform owner |

Store full permission maps in `mocks/users/*.mock.ts`. Admin demo user gets all permissions; employee gets minimal set.

## User Access Management UI

Route: `/admin/user-access` and `/platform/user-access`

Static UI replicates `default-access-fields.php`:
- Select user type: employee, user, admin, resellerAdmin
- Checkbox grid per menu × actions
- Save → toast success (mock)

## Permission testing checklist

For each demo user, verify:
- [ ] Sidebar shows correct items only
- [ ] Direct URL to forbidden page → 403 page
- [ ] Create/Edit/Delete buttons hidden without action
- [ ] Expired user sees limited sidebar
- [ ] Super admin sees platform menu
