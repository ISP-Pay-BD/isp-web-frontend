# Phase 8 — Complete `zapi` API Integration Plan (v2.0)

> **Goal:** Migrate `isp-web-frontend` from static mock handlers (`mockFetch()`) to live HTTP calls against the `isppaybd_isp/zapi` backend. Every module, hook, mutation, error state, and schema adapter must be fully implemented, typed, and tested before advancing to the next module.

---

## 1. System Architecture & Standards

### 1.1 HTTP Client & Middleware Stack (`src/lib/api/`)

```
Component / Page
       │
       ▼
Feature Hooks (TanStack Query / Mutation)
       │
       ▼
Service Layer (`src/lib/api/services/{module}.service.ts`)
       │
       ▼
Schema / Adapter Layer (`src/lib/api/adapters/{module}.adapter.ts`)
       │
       ▼
API Client (`src/lib/api/client.ts`) ── Axios Interceptors
       │  ├─ Auth Header Injector (Bearer JWT)
       │  ├─ 401 Silent Token Refresher (`POST /api/v1/auth/refresh`)
       │  ├─ Response Envelope Unwrapper (`response.data.data`)
       │  └─ Error Normalizer (`ApiError`)
       │
       ▼
Next.js Rewrite Proxy (`/api/backend/:path*` ──> `http://localhost:8080/api/:path*`)
       │
       ▼
`isppaybd_isp/zapi` Backend Controller
```

### 1.2 Response Envelopes & Error Handling

All backend responses conform to the standard envelope:

```typescript
// Standard Success Envelope
export interface ApiResponse<T> {
  statusCode: number;
  success: boolean;
  data: T;
  error: null;
}

// Standard Error Envelope
export interface ApiErrorResponse {
  statusCode: number;
  success: false;
  data: null;
  error: {
    code: string;           // e.g. "VALIDATION_ERROR", "TOKEN_EXPIRED", "UNAUTHORIZED"
    message: string;
    details?: Record<string, string | string[]>; // Field validation messages
  };
}
```

#### Form Error Binding Helper
A standard utility `applyServerValidationErrors(form, error.details)` will map 422 validation errors directly into `react-hook-form` fields, with global toast alerts via `sonner`.

### 1.3 Query Key Factory Standard (`src/lib/api/query-keys.ts`)

To avoid cache collision and make invalidation deterministic:

```typescript
export const queryKeys = {
  auth: {
    me: ['auth', 'me'] as const,
    permissions: ['auth', 'permissions'] as const,
  },
  customer: {
    dashboard: ['customer', 'dashboard'] as const,
    profile: ['customer', 'profile'] as const,
    subscription: ['customer', 'subscription'] as const,
    payments: (params?: unknown) => ['customer', 'payments', params] as const,
    support: {
      list: (filter?: unknown) => ['customer', 'support', 'list', filter] as const,
      detail: (id: string | number) => ['customer', 'support', 'detail', id] as const,
    },
    quota: ['customer', 'quota'] as const,
    devices: ['customer', 'devices'] as const,
    usage: (period: string) => ['customer', 'usage', period] as const,
  },
  admin: {
    dashboard: (resellerId: string | number) => ['admin', 'dashboard', resellerId] as const,
    customers: {
      list: (resellerId: string | number, filters?: unknown) => ['admin', 'customers', resellerId, filters] as const,
      detail: (resellerId: string | number, id: string | number) => ['admin', 'customers', resellerId, id] as const,
    },
    areas: (resellerId: string | number) => ['admin', 'areas', resellerId] as const,
    packages: (resellerId: string | number) => ['admin', 'packages', resellerId] as const,
    accounting: {
      balanceSheet: (resellerId: string | number) => ['admin', 'accounting', 'balanceSheet', resellerId] as const,
      chartOfAccounts: (resellerId: string | number) => ['admin', 'accounting', 'chartOfAccounts', resellerId] as const,
      transactions: (resellerId: string | number, filters?: unknown) => ['admin', 'accounting', 'transactions', resellerId, filters] as const,
    },
    hr: {
      employees: (resellerId: string | number) => ['admin', 'hr', 'employees', resellerId] as const,
      attendance: (resellerId: string | number, date?: string) => ['admin', 'hr', 'attendance', resellerId, date] as const,
      advances: (resellerId: string | number) => ['admin', 'hr', 'advances', resellerId] as const,
    },
    sms: {
      history: (resellerId: string | number, params?: unknown) => ['admin', 'sms', 'history', resellerId, params] as const,
      recipients: (resellerId: string | number) => ['admin', 'sms', 'recipients', resellerId] as const,
    },
    network: {
      routers: (resellerId: string | number) => ['admin', 'network', 'routers', resellerId] as const,
      ipPools: (resellerId: string | number) => ['admin', 'network', 'ipPools', resellerId] as const,
    }
  }
};
```

---

## 2. Execution Roadmap & Module Inventory

Each module follows the strict **6-Step Cycle**:
1. **Contract Validation**: Test backend endpoint using curl / swagger.
2. **Service & Adapter**: Create `*.service.ts` and `*.adapter.ts` with snake_case -> camelCase mapping.
3. **Query & Mutation Hooks**: Build TanStack Query hooks with typed keys and optimistic updates.
4. **UI Integration**: Replace `mockFetch` calls in feature pages/components.
5. **Quality Checks**: Run `pnpm lint && pnpm typecheck && pnpm test`.
6. **Manual Verification**: Browser test happy path, error toasts, and loading skeletons.

---

### Module 0: Foundation (Core Client, Auth & Session Management)

| Action | Target File | Purpose |
|---|---|---|
| [NEW] | `src/lib/api/client.ts` | Axios instance with JWT interceptor, 401 refresh queue, and envelope unwrapper |
| [NEW] | `src/lib/api/types.ts` | API types, error classes, pagination params |
| [NEW] | `src/lib/api/query-keys.ts` | Centralized Query Key Factory |
| [NEW] | `src/lib/api/endpoints.ts` | Endpoint constants map |
| [NEW] | `src/lib/api/services/auth.service.ts` | `login()`, `refresh()`, `getMe()`, `logout()` |
| [MODIFY] | `src/features/auth/shared/stores/auth-store.ts` | Zustand store with real tokens, user role, and permission hydration |
| [MODIFY] | `next.config.ts` | Configure `/api/backend/:path*` proxy rewrite |
| [MODIFY] | `.env.local` | Add `NEXT_PUBLIC_API_URL` and `NEXT_PUBLIC_USE_MOCK_API` |

**Gate 0 Verification:**
- [ ] Login returns access/refresh tokens and populates store
- [ ] Protected requests automatically include `Authorization: Bearer <token>`
- [ ] 401 token expiry triggers seamless `/api/v1/auth/refresh` without user interruption
- [ ] Typecheck and lint pass cleanly

---

### Module 1: Customer Portal Integration

| Feature | Backend Endpoint | Method | Key Data Adapter Requirements |
|---|---|---|---|
| **Dashboard** | `GET /api/customer/users/{id}` | GET | Adapt user profile, active speed, balance, due date |
| **Quota & Usage** | `GET /api/customer/quota` | GET | Total data, used data, expiry date, FUP limit |
| **Connected Devices** | `GET /api/customer/connected-devices` | GET | Device MAC, IP, hostname, signal strength |
| **Subscriptions** | `GET /api/customer/subscription/index` | GET | Package history, active subscription ID |
| **Package List** | `GET /api/customer/packages` | GET | Available packages, speed, price, validity |
| **Renew/Activate** | `POST /api/customer/subscription/renew`<br>`POST /api/customer/subscription/activate` | POST | Plan ID, payment method, auto-renew flag |
| **Payment History** | `GET /api/customer/payment-fetch` | GET | Paginated receipts, gateway refs, timestamps |
| **Initiate Payment** | `GET /api/customer/make-payment/{id}` | GET | Redirect URL to bKash / Nagad / SSLCommerz gateway |
| **Support Tickets** | `GET /api/customer/support/fetch`<br>`GET /api/customer/support/details?ticket_id={id}` | GET | Ticket list, conversation thread, attachments |
| **Create/Reply Ticket**| `POST /api/customer/support/create-ticket`<br>`POST /api/customer/support/send-message` | POST | Multipart message with optional image attachment |
| **Router Controls** | `GET /api/customer/router-control/targets`<br>`POST /api/customer/router-control/wifi` | GET/POST | SSID name, password update, restart router |
| **Quick Fix / Ping** | `POST /api/customer/autofix/quick-fix`<br>`POST /api/customer/ping` | POST | PPPoE status check, latency score |
| **Rewards & News** | `GET /api/customer/reward/wallet`<br>`GET /api/common/news/` | GET | Points balance, redemption options, news feed |

---

### Module 2: Admin Dashboard & Core Reseller Context

| Feature | Backend Endpoint | Method | Key Actions |
|---|---|---|---|
| **Reseller Dashboard** | `GET /api/reseller/dashboard/{resellerId}` | GET | Revenue metrics, online/offline count, expiry counts |
| **Reseller Profile** | `GET /api/reseller/profile/{resellerId}` | GET | Business details, balance, SMS credits |
| **Update Profile** | `PUT /api/reseller/profile/{resellerId}` | PUT | Contact info, address, company name |

---

### Module 3: Admin Customers & Lifecycle Management

| Feature | Backend Endpoint | Method | Key Actions |
|---|---|---|---|
| **Customer List** | `GET /api/reseller/customers/{resellerId}` | GET | Search, status filter, area filter, pagination |
| **Customer Detail** | `GET /api/reseller/customers/{resellerId}/{userId}` | GET | Full account profile, PPPoE credentials, logs |
| **Create Customer** | `POST /api/reseller/customers/create/{resellerId}` | POST | Form submission with validation binding |
| **Update Customer** | `POST /api/reseller/customers/{resellerId}/{userId}` | POST | Edit profile, package, billing date |
| **Delete Customer** | `DELETE /api/reseller/customers/{resellerId}/{userId}` | DELETE | Soft delete customer record |
| **Bulk Actions** | `POST /api/reseller/customers/bulk-recharge`<br>`POST /api/reseller/customers/bulk-delete` | POST | Batch operations with progress feedback |
| **Excel Import** | `POST /api/reseller/customers/import-excel` | POST (Form) | Multipart file upload with error summary report |
| **PPPoE & MAC Sync** | `POST .../sync-pppoe`<br>`POST .../mac-bind` | POST | Router sync and hardware MAC locking |

---

### Module 4: Admin Areas, Subareas & Packages

| Feature | Backend Endpoint | Method | Notes |
|---|---|---|---|
| **Area CRUD** | `GET/POST /api/reseller/areas/{resellerId}`<br>`PUT /api/reseller/areas/update/{id}`<br>`DELETE /api/reseller/areas/{id}/delete` | Full CRUD | Nested subarea management |
| **Subarea CRUD** | `POST/PUT/DELETE /api/reseller/subareas/*` | Full CRUD | Subarea assignment |
| **Package List** | `GET /api/reseller/packages/{resellerId}` | GET | Active package catalog |
| **Package Delete** | `DELETE /api/reseller/packages/{resellerId}/{pkgId}` | DELETE | Package archive |
| **Package Create/Edit** | ⚠️ *zapi gap: legacy `Packages.php`* | - | Fallback / New endpoint build required |

---

### Module 5: Admin Customer Billing & Subscriptions

| Feature | Backend Endpoint | Method | Notes |
|---|---|---|---|
| **Customer Payments** | `GET/POST/PUT/DELETE /api/reseller/customer-payments/{resellerId}/*` | Full CRUD | Invoice creation, manual cash/bKash entry |
| **Subscription Renewal**| `POST /api/reseller/subscription/{resellerId}/renew` | POST | Account renewal & extension |
| **Reseller Funding** | `GET/POST/DELETE /api/reseller/funding/{resellerId}` | Full CRUD | POP wallet balance funding & ledger |

---

### Module 6: Admin HR, Staff & Payroll

| Feature | Backend Endpoint | Method | Notes |
|---|---|---|---|
| **Employee Directory** | `GET/POST/PUT/DELETE /api/reseller/employees/{resellerId}/*` | Full CRUD | Staff roles, salary structure |
| **Attendance Records** | `GET/POST /api/reseller/employees/{resellerId}/attendance/*` | GET/POST | Check-in, check-out, monthly report |
| **Advance Salary** | `GET/POST/PUT /api/reseller/employees/{resellerId}/advance-salary/*` | Full CRUD | Requests, approval, balance deduction |
| **Salary Disbursement**| `GET/POST /api/reseller/employee-payments/{resellerId}/*` | GET/POST | Monthly payroll slips and salary summary |

---

### Module 7: Admin Support & Ticket Center

| Feature | Backend Endpoint | Method | Notes |
|---|---|---|---|
| **Support Queue** | `GET /api/reseller/support-tickets/{resellerId}` | GET | Priority filtering, SLA timers |
| **Ticket Details** | `GET /api/reseller/support-tickets/{resellerId}/{ticketId}` | GET | Thread history, internal staff notes |
| **Staff Replies** | `POST /api/reseller/support-tickets/{resellerId}/{ticketId}/message` | POST | Reply with attachments, change status |
| **Assignment & Status**| `PUT /api/reseller/support-tickets/{resellerId}/{ticketId}` | PUT | Assign to staff, mark Resolved/Closed |

---

### Module 8: Admin Comms (SMS & Voice SMS)

| Feature | Backend Endpoint | Method | Notes |
|---|---|---|---|
| **Send SMS & Logs** | `GET/POST/DELETE /api/reseller/sms/{resellerId}/*` | Full CRUD | Individual and bulk broadcast SMS |
| **Voice Campaigns** | `GET/POST /api/reseller/voice-sms/{resellerId}/send` | GET/POST | Automated voice calls with audio templates |
| **Voice Templates** | `GET/POST/PUT/DELETE /api/reseller/voice-sms/{resellerId}/templates/*` | Full CRUD | Audio template library |
| **Event Triggers** | `PUT /api/reseller/voice-sms/{resellerId}/event-config` | PUT | Auto-call on bill due / account expiry |

---

### Module 9: Admin Accounting, Ledger & Wallets

| Feature | Backend Endpoint | Method | Notes |
|---|---|---|---|
| **Balance Sheet** | `GET /api/reseller/accounting/{resellerId}/balance-sheet` | GET | Assets, liabilities, equity breakdown |
| **Chart of Accounts** | `GET /api/reseller/accounting/{resellerId}/chart-of-accounts` | GET | Tree of income, expense, asset accounts |
| **Journal Entries** | `GET /api/reseller/accounting/{resellerId}/journal-entries` | GET | Debit/credit vouchers |
| **Transactions** | `GET/DELETE /api/reseller/transactions/{resellerId}/*` | GET/DELETE | Filterable transaction stream |

---

### Module 10: Admin Network (Routers & IP Pools)

| Feature | Backend Endpoint | Method | Notes |
|---|---|---|---|
| **Router List & Users** | `GET /api/reseller/routers/{resellerId}`<br>`GET /api/reseller/router-users/{resellerId}/{routerId}` | GET | MikroTik status, active PPPoE sessions |
| **IP Pool CRUD** | `GET/POST/PUT/DELETE /api/reseller/ip-pools/{resellerId}/*` | Full CRUD | Subnet ranges, gateway, assigned pools |
| **Available IPs** | `GET /api/reseller/ip-pools/{resellerId}/{poolId}/available` | GET | Real-time unallocated IP lookup |
| **Router Traffic** | `GET /api/reseller/users-load-traffic/{routerId}` | GET | Live interface throughput metrics |

---

### Module 11: Admin Rewards & Referrals

| Feature | Backend Endpoint | Method | Notes |
|---|---|---|---|
| **Reward Config** | `GET/PUT /api/reseller/rewards/{resellerId}/config` | GET/PUT | Points per recharge, conversion rate |
| **Referrals** | `GET /api/reseller/referrals/{resellerId}` | GET | Customer referral tracking |
| **Approve/Reject** | `POST /api/reseller/referrals/{resellerId}/{id}/approve` | POST | Award reward points upon verification |

---

### Module 12: Employee Portal

| Feature | Backend Endpoint | Method | Notes |
|---|---|---|---|
| **My Salary Slips** | `GET /api/reseller/employee-payments/{resellerId}` | GET | Scoped to logged-in employee token |
| **Advance Requests** | `GET/POST /api/reseller/employees/{resellerId}/advance-salary` | GET/POST | Employee self-service advance request |
| **Attendance** | `GET/POST /api/reseller/employees/{resellerId}/attendance/*` | GET/POST | Staff self check-in / check-out |

---

### Module 13: Admin Settings & Reseller Billing

| Feature | Backend Endpoint | Method | Notes |
|---|---|---|---|
| **Reseller Billing** | `GET /api/reseller/payments/{resellerId}`<br>`GET /api/reseller/make-reseller-payment/{resellerId}` | GET | Reseller platform subscription payments |
| **Password Change** | `POST /api/reseller/profile/{resellerId}/change-password` | POST | Reseller admin password updates |

---

### Module 14: Platform Super-Admin & Gap Handling

| Module / Screen | Strategy |
|---|---|
| **Platform Management** (Tenants, Platform Admins, Revenue, Plugins) | Keep mock fallback active (`NEXT_PUBLIC_USE_MOCK_API=true` for platform routes) until dedicated `zapi/Modules/Platform` endpoints are implemented on backend. |
| **Advanced Network** (OLT, Hotspot, Bandwidth Shaping) | Preserve UI with mock adapter; wire real endpoints incrementally when available. |
| **Theme Studio & Captive Portal Engines** | Fully client-side state / mock storage. |

---

## 3. Verification & Done Criteria

For every module:
1. **Zero Type Errors**: `pnpm typecheck` must return 0 errors.
2. **Linting Compliance**: `pnpm lint` must pass without unhandled warnings.
3. **Automated Tests**: Unit & hook tests in `/tests` must pass.
4. **Error Boundary & Empty State**: Every view must gracefully handle network errors (`500`), validation errors (`422`), authorization errors (`401`/`403`), and empty datasets (`[]`).
5. **No Regressions**: Existing UI styling (shadcn tokens, ISP brand theme, animations) must remain pixel-perfect.
