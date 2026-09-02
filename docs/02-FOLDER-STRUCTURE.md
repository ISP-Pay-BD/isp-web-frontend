# 02 — Folder Structure

Complete target tree. Create folders as each phase starts — do not create empty stubs for unreached phases.

```
isp-web-frontend/
├── .cursor/
│   └── rules/
│       └── isp-frontend.mdc
├── .github/
│   └── workflows/
│       ├── ci.yml                 # lint, typecheck, build
│       └── e2e.yml                # Playwright (Phase 7+)
├── docs/                          # This documentation set
├── public/
│   ├── fonts/
│   │   ├── satoshi-variable.woff2
│   │   ├── noto-sans-bengali-regular.woff2
│   │   └── noto-sans-bengali-bold.woff2
│   ├── images/
│   │   ├── logo.svg
│   │   ├── logo-dark.svg
│   │   ├── favicon.ico
│   │   └── marketing/             # Hero, testimonials, partners
│   └── icons/
├── src/
│   ├── app/
│   │   ├── (marketing)/
│   │   │   ├── layout.tsx
│   │   │   ├── page.tsx                    # Landing
│   │   │   ├── pricing/page.tsx
│   │   │   ├── plugins/page.tsx
│   │   │   ├── contact/page.tsx
│   │   │   └── register/
│   │   │       ├── page.tsx                  # Tenant trial signup
│   │   │       └── referral/page.tsx
│   │   ├── (auth)/
│   │   │   ├── layout.tsx
│   │   │   ├── login/page.tsx
│   │   │   ├── register/page.tsx             # Customer self-reg (if any)
│   │   │   └── forgot-password/page.tsx
│   │   ├── (portal)/
│   │   │   ├── layout.tsx                    # Providers: Query, Theme, Toaster
│   │   │   ├── customer/
│   │   │   │   ├── layout.tsx                # Customer shell
│   │   │   │   ├── dashboard/page.tsx
│   │   │   │   ├── subscription/page.tsx
│   │   │   │   ├── packages/page.tsx
│   │   │   │   ├── payments/page.tsx
│   │   │   │   ├── support/
│   │   │   │   │   ├── page.tsx
│   │   │   │   │   └── [id]/page.tsx
│   │   │   │   ├── rewards/page.tsx
│   │   │   │   ├── news/page.tsx
│   │   │   │   ├── router/
│   │   │   │   │   ├── page.tsx              # Router tools hub
│   │   │   │   │   ├── wifi/page.tsx
│   │   │   │   │   └── devices/page.tsx
│   │   │   │   ├── profile/page.tsx
│   │   │   │   └── change-password/page.tsx
│   │   │   ├── admin/
│   │   │   │   ├── layout.tsx                # Admin/reseller shell
│   │   │   │   ├── dashboard/page.tsx
│   │   │   │   ├── customers/
│   │   │   │   │   ├── page.tsx
│   │   │   │   │   ├── expired/page.tsx
│   │   │   │   │   ├── free-requests/page.tsx
│   │   │   │   │   ├── new/page.tsx
│   │   │   │   │   ├── import/page.tsx
│   │   │   │   │   └── [id]/
│   │   │   │   │       ├── page.tsx
│   │   │   │   │       └── edit/page.tsx
│   │   │   │   ├── customer-payments/
│   │   │   │   │   ├── page.tsx
│   │   │   │   │   └── new/page.tsx
│   │   │   │   ├── areas/page.tsx
│   │   │   │   ├── packages/page.tsx
│   │   │   │   ├── pop-packages/page.tsx
│   │   │   │   ├── subscription/self-recharge/page.tsx
│   │   │   │   ├── hr/
│   │   │   │   │   ├── employees/
│   │   │   │   │   ├── salaries/
│   │   │   │   │   ├── attendance/
│   │   │   │   │   ├── accounts/
│   │   │   │   │   └── advance-salary/
│   │   │   │   ├── accounting/
│   │   │   │   │   ├── incomes/
│   │   │   │   │   ├── expenses/
│   │   │   │   │   ├── reports/
│   │   │   │   │   ├── chart-of-accounts/
│   │   │   │   │   ├── journal-entries/
│   │   │   │   │   └── balance-sheet/
│   │   │   │   ├── pop/
│   │   │   │   │   ├── resellers/
│   │   │   │   │   ├── funding/
│   │   │   │   │   └── transactions/
│   │   │   │   ├── bandwidth/
│   │   │   │   │   ├── buy/
│   │   │   │   │   └── sell/
│   │   │   │   ├── inventory/
│   │   │   │   ├── purchase/
│   │   │   │   ├── reports/btrc/page.tsx
│   │   │   │   ├── hotspot/
│   │   │   │   ├── olt/page.tsx
│   │   │   │   ├── routers/page.tsx
│   │   │   │   ├── ip-pools/page.tsx
│   │   │   │   ├── network/
│   │   │   │   │   ├── diagram/page.tsx
│   │   │   │   │   └── map/page.tsx
│   │   │   │   ├── sms/
│   │   │   │   ├── voice-sms/page.tsx
│   │   │   │   ├── whatsapp/
│   │   │   │   ├── reward-center/page.tsx
│   │   │   │   ├── support-tickets/
│   │   │   │   ├── recycle-bin/page.tsx
│   │   │   │   ├── wallet/page.tsx
│   │   │   │   ├── user-access/page.tsx
│   │   │   │   ├── settings/software/page.tsx
│   │   │   │   ├── theme-studio/page.tsx
│   │   │   │   ├── profile/page.tsx
│   │   │   │   ├── change-password/page.tsx
│   │   │   │   └── payment/page.tsx          # My payment (admin self)
│   │   │   ├── platform/
│   │   │   │   ├── layout.tsx
│   │   │   │   ├── dashboard/page.tsx
│   │   │   │   ├── tenants/
│   │   │   │   ├── admins/
│   │   │   │   ├── revenue/page.tsx
│   │   │   │   ├── plugins/page.tsx
│   │   │   │   ├── contacts/page.tsx
│   │   │   │   ├── file-manager/page.tsx
│   │   │   │   ├── user-access/page.tsx
│   │   │   │   └── settings/software/page.tsx
│   │   │   └── employee/
│   │   │       ├── layout.tsx
│   │   │       ├── salaries/page.tsx
│   │   │       ├── advance-salary/page.tsx
│   │   │       └── profile/page.tsx
│   │   ├── layout.tsx                        # Root: html, fonts, providers
│   │   ├── globals.css
│   │   ├── not-found.tsx
│   │   └── error.tsx
│   ├── components/
│   │   ├── ui/                               # shadcn — auto-generated
│   │   ├── layout/
│   │   ├── marketing/
│   │   └── shared/
│   ├── features/                             # See module list below
│   ├── lib/
│   │   ├── mock-api/
│   │   │   ├── client.ts
│   │   │   ├── delay.ts
│   │   │   ├── errors.ts
│   │   │   └── handlers/
│   │   ├── permissions/
│   │   │   ├── can.ts
│   │   │   └── use-permission.ts
│   │   └── utils/
│   ├── mocks/                                # Static data only
│   ├── hooks/
│   ├── stores/
│   ├── config/
│   ├── types/
│   └── middleware.ts
├── .env.example
├── .gitignore
├── AGENTS.md
├── components.json
├── next.config.ts
├── package.json
├── postcss.config.mjs
├── tailwind.config.ts
├── tsconfig.json
└── README.md
```

## Feature modules (`src/features/`)

| Module folder | Maps to backend area |
|---------------|---------------------|
| `marketing/` | Landing partials |
| `auth/` | `/auth/*` |
| `customer/dashboard/` | Customer home |
| `customer/subscription/` | Subscription renew |
| `customer/payments/` | Payment history |
| `customer/support/` | Tickets |
| `customer/rewards/` | my-rewards |
| `customer/news/` | News & notices |
| `customer/router/` | Router self-service |
| `admin/customers/` | Customer CRUD |
| `admin/customer-payments/` | Customer payments |
| `admin/areas/` | Service areas |
| `admin/packages/` | Packages |
| `admin/hr/` | HR management |
| `admin/accounting/` | Accounting |
| `admin/pop/` | POP / resellers |
| `admin/bandwidth/` | Bandwidth buy/sell |
| `admin/inventory/` | Inventory |
| `admin/purchase/` | Purchase |
| `admin/reports/` | BTRC etc. |
| `admin/hotspot/` | Hotspot |
| `admin/olt/` | OLT |
| `admin/routers/` | MikroTik |
| `admin/network/` | Diagram + map |
| `admin/sms/` | SMS |
| `admin/voice-sms/` | Voice SMS |
| `admin/whatsapp/` | WhatsApp Business |
| `admin/rewards/` | Reward center |
| `admin/support/` | Support tickets |
| `admin/wallet/` | Tenant wallet |
| `admin/settings/` | Software settings |
| `admin/user-access/` | Permissions UI |
| `admin/theme-studio/` | Theme studio |
| `admin/recycle-bin/` | Recycle bin |
| `platform/tenants/` | Super-admin tenants |
| `platform/admins/` | Second admins |
| `platform/revenue/` | Platform revenue |
| `platform/plugins/` | Plugins marketplace admin |
| `employee/` | Employee portal |
| `shared/` | Cross-cutting (permission gate, role badge) |

## File naming conventions

| Type | Convention | Example |
|------|------------|---------|
| Page | `page.tsx` in app router | `customers/page.tsx` |
| Component | PascalCase | `CustomerTable.tsx` |
| Hook | camelCase, `use` prefix | `useCustomers.ts` |
| Schema | camelCase + `Schema` | `customerFormSchema.ts` |
| Mock data | kebab-case | `customers.mock.ts` |
| Handler | kebab-case | `customers.handler.ts` |
| Type | PascalCase | `Customer.ts` |

## Import aliases (`tsconfig.json`)

```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

**Allowed imports:**
- `@/features/customers` ✅
- `@/lib/mock-api/client` ✅
- `@/mocks/customers` ❌ in components (handlers only)
