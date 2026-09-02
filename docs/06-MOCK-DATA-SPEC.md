# 06 — Mock Data Specification

All static data for offline UI. **Phase 1 only** — replace handlers in Phase 2.

## Principles

1. **Realistic Bangladesh ISP context** — BDT currency, bKash/Nagad, Dhaka areas, Mbps packages
2. **Typed** — every mock exports TypeScript interfaces used by features
3. **Consistent IDs** — use stable string IDs (`cust_001`, `pkg_home_20`) across files
4. **Relationships** — customer references package_id, area_id, reseller_id
5. **Volume** — lists have 15–50 items for pagination testing; use generators if needed

## Directory layout

**All dummy data lives in `src/data/`** (not `src/mocks/`).

```
src/data/
├── index.ts                        # Central exports
├── README.md
├── shared/
│   ├── types.ts                    # Customer, Package, Payment...
│   └── constants.ts
├── users/
│   ├── users.data.ts               # 6 demo accounts
│   └── permissions.data.ts
├── marketing/
│   └── landing.data.ts             # Hero, FAQ, pricing, plugins
├── customer/
│   ├── subscription.data.ts
│   ├── support.data.ts
│   └── news.data.ts
├── admin/
│   ├── customers.data.ts           # 40 customers
│   ├── packages.data.ts
│   ├── areas.data.ts
│   ├── customer-payments.data.ts
│   ├── dashboard.data.ts
│   ├── employees.data.ts
│   └── network-ops.data.ts         # routers, OLT, SMS, WhatsApp, wallet...
├── platform/
│   └── tenants.data.ts
└── employee/
    └── index.ts
```

Legacy `src/mocks/` re-exports from `@/data` — use `src/data/` for all new work.

## Handler mapping (`lib/mock-api/handlers/`)

| Handler key | Mock file | Methods |
|-------------|-----------|---------|
| `auth.login` | demo-users | POST credentials → user session |
| `auth.me` | demo-users | GET current user |
| `marketing.landing` | landing | GET all landing sections |
| `customer.dashboard` | dashboard + subscription | GET stats |
| `customer.subscription` | subscription | GET, POST renew |
| `customer.payments` | payments | GET list, POST pay |
| `customer.support` | support-tickets | CRUD + messages |
| `admin.customers` | customers | list, detail, create, update, delete |
| `admin.dashboard` | dashboard | GET KPIs |
| … | … | one handler file per domain |

## Core entity types

### User

```typescript
interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: 'super_admin' | 'admin' | 'resellerAdmin' | 'employee' | 'user';
  status: 'active' | 'inactive'; // inactive = expired subscription
  tenantId: string;
  organizationName?: string;
  avatarUrl?: string;
  permissions: PermissionMap;
  createdAt: string;
}
```

### Customer (ISP subscriber)

```typescript
interface Customer {
  id: string;
  name: string;
  username: string;          // PPPoE username
  phone: string;
  email?: string;
  packageId: string;
  packageName: string;
  areaId: string;
  areaName: string;
  resellerId?: string;
  status: 'active' | 'expired' | 'suspended';
  expiryDate: string;
  balance: number;           // BDT
  connectionType: 'pppoe' | 'hotspot' | 'static';
  macAddress?: string;
  ipAddress?: string;
  online: boolean;
  createdAt: string;
}
```

### Package

```typescript
interface Package {
  id: string;
  name: string;
  speedMbps: number;
  priceBdt: number;
  validityDays: number;
  type: 'home' | 'corporate' | 'hotspot';
  visible: boolean;
}
```

### Payment

```typescript
interface Payment {
  id: string;
  customerId: string;
  customerName: string;
  amountBdt: number;
  method: 'bkash' | 'nagad' | 'cash' | 'bank' | 'sslcommerz';
  status: 'completed' | 'pending' | 'failed';
  invoiceNo: string;
  paidAt: string;
  note?: string;
}
```

### Support ticket

```typescript
interface SupportTicket {
  id: string;
  subject: string;
  status: 'open' | 'pending' | 'closed';
  priority: 'low' | 'medium' | 'high';
  customerId: string;
  messages: TicketMessage[];
  createdAt: string;
  updatedAt: string;
}
```

### Dashboard stats

```typescript
interface DashboardStats {
  totalCustomers: number;
  activeCustomers: number;
  expiredCustomers: number;
  todayCollectionBdt: number;
  monthlyCollectionBdt: number;
  onlineUsers: number;
  chartData: { date: string; collection: number; newCustomers: number }[];
}
```

## Sample data guidelines

| Entity | Count | Notes |
|--------|-------|-------|
| Customers | 50 | Mix active/expired, 3 areas |
| Packages | 12 | 5Mbps–100Mbps home + 2 corporate |
| Payments | 30 | Last 90 days |
| Support tickets | 8 | 3 open with message threads |
| Employees | 10 | Mixed departments |
| Routers | 4 | MikroTik names |
| OLT devices | 3 | With 20 ONUs each (nested) |
| Tenants | 8 | SaaS portals |
| Landing testimonials | 6 | Realistic ISP names |
| FAQ items | 12 | EN + BN text |

## Currency & locale

- Always display amounts as `৳1,500` or `BDT 1,500`
- Dates: `DD MMM YYYY` for EN; Bengali dates optional Phase 7
- Phone: `01XXXXXXXXX` format

## Mutations (mock)

When form submits:

1. Handler validates with same Zod schema as frontend
2. Update in-memory copy (Zustand or module-level store)
3. Return updated entity
4. TanStack Query invalidates relevant keys
5. Sonner toast: "Customer created successfully"

**Persist optional:** `localStorage` key `isp_mock_db_v1` to survive refresh during demo.

## Mock API delay

```typescript
export const MOCK_DELAY_MS = 200; // loading skeleton visible
export const MOCK_DELAY_SLOW_MS = 800; // import/export actions
```

## Offline assets in mocks

Never use URLs like `https://...` in mock data for images. Use:

```typescript
avatarUrl: '/images/avatars/customer-01.png'
```

## Backend field mapping (future)

When connecting zapi, map snake_case → camelCase in `lib/api/normalizers/`. Document mapping in handler files as comments.

Example:
```
API: GET /api/reseller/customers/{id}
Mock handler: admin.customers.list
Normalizer: normalizeCustomer(raw)
```
