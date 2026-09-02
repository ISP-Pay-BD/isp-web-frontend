# Static dummy data (`src/data/`)

**Complete offline ISP dataset** — realistic Bangladesh ISP context. Feels live when running `pnpm dev`.

Quality: ৳ BDT, bKash/Nagad TrxIDs, Dhaka/CTG areas, PPPoE usernames, MikroTik routers.

## Completeness: **~92%** (Phase 1 static UI)

See `catalog.ts` for full module list and record counts.

## Data flow

```
features/hooks → mockFetch() → lib/mock-api/handlers → src/data/*
```

**Never** import `@/data` from features/components (handlers + tests only).

## Record volumes (live-feel targets)

| Domain | Records | File |
|--------|---------|------|
| Customers | **80** | `admin/customers.data.ts` |
| Payments | **125+** | `admin/customer-payments.data.ts` |
| Support tickets | **18** | `customer/support.data.ts` |
| News | **8** | `customer/news.data.ts` |
| Packages | **14** | `admin/packages.data.ts` |
| Areas | **8** | `admin/areas.data.ts` |
| Employees | **12** | `admin/hr.data.ts` |
| Plugins | **15** | `marketing/plugins.data.ts` |
| Routers | **6** | `admin/network-ops.data.ts` |
| OLT devices | **3** | `admin/network-ops.data.ts` |
| SMS log | **25** | `admin/network-ops.data.ts` |
| WhatsApp threads | **12** | `admin/network-ops.data.ts` |
| POP resellers | **4** | `admin/network-ops.data.ts` |
| Tenants | **5** | `platform/tenants.data.ts` |
| Landing sections | **28** | `marketing/sections.data.ts` |
| FAQ (EN+BN) | **8** | `marketing/sections.data.ts` |
| Demo users | **6** | `users/users.data.ts` |

## Folder map

```
src/data/
├── catalog.ts              ← module inventory + stats
├── shared/
│   ├── types.ts            ← Customer, Package, Payment...
│   ├── constants.ts
│   └── generators.ts       ← BD names, phones, charts
├── users/
├── marketing/
│   ├── landing.data.ts
│   ├── sections.data.ts    ← all 28 landing sections
│   ├── pricing.data.ts     ← tiers + PAYG calculator
│   └── plugins.data.ts     ← 15 marketplace plugins
├── customer/
│   ├── subscription.data.ts
│   ├── support.data.ts
│   ├── news.data.ts
│   └── profile.data.ts
├── admin/
│   ├── customers.data.ts
│   ├── packages.data.ts
│   ├── areas.data.ts
│   ├── customer-payments.data.ts
│   ├── dashboard.data.ts
│   ├── hr.data.ts            ← staff, salary, attendance
│   ├── accounting.data.ts    ← COA, journal, P&L
│   ├── bandwidth.data.ts     ← buy/sell/daily bill
│   └── network-ops.data.ts   ← routers, OLT, SMS, WhatsApp, POP, inventory
├── platform/
│   ├── tenants.data.ts
│   └── contacts.data.ts
└── employee/
    └── salaries.data.ts
```

## mockFetch keys (handlers)

| Key | Returns |
|-----|---------|
| `marketing.landing` | Hero, features, sections, FAQ, testimonials |
| `marketing.pricing` | Plans, tiers, PAYG calculator |
| `marketing.plugins` | 15 plugins + categories |
| `admin.customers.list` | 80 customers |
| `admin.dashboard` | KPIs + chart + activities |
| `admin.domain` | `{domain}` → packages, accounting, hr, network… |
| `customer.domain` | subscription, payments, support, news… |
| `platform.domain` | tenants, contacts, support… |
| `employee.domain` | salaries, advance, attendance |

## Demo logins

All password: `demo1234`

| Email | Role |
|-------|------|
| customer@demo.isppaybd.com | Customer |
| admin@demo.isppaybd.com | Tenant admin |
| reseller@demo.isppaybd.com | POP reseller |
| super@demo.isppaybd.com | Super admin |
| employee@demo.isppaybd.com | Employee |
| customer-expired@demo.isppaybd.com | Expired customer |

## Optional additions (when UI built)

- Satoshi font files in `public/fonts/`
- Real product screenshots in `public/images/`
- Per-module data for remaining empty admin screens (~8% gap)
