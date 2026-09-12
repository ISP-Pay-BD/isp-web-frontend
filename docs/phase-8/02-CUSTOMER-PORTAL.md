# Phase 8 — Module 1: Customer Portal Integration

---

## 1. Overview
Full integration of all 12 Customer Portal views against live `zapi` customer endpoints (`v1_customer_routes.php`).

---

## 2. Endpoints & Feature Mapping

| Screen / Feature | Endpoint | Method | Purpose |
|---|---|---|---|
| **Dashboard** | `GET /api/customer/users/{id}` | GET | User account summary, bandwidth speed, balance |
| **Quota & FUP** | `GET /api/customer/quota` | GET | Total data allotted, consumed bytes, FUP status |
| **Connected Devices** | `GET /api/customer/connected-devices` | GET | List of active connected LAN/Wi-Fi devices |
| **Data Usage Graph** | `GET /api/customer/usage-history` | GET | Daily/monthly traffic history breakdown |
| **Subscription Info** | `GET /api/customer/subscription/index` | GET | Active subscription, validity expiry |
| **Package Catalog** | `GET /api/customer/packages` | GET | Available packages with pricing and speeds |
| **Renew Subscription**| `POST /api/customer/subscription/renew` | POST | Renew current package plan |
| **Activate Package** | `POST /api/customer/subscription/activate` | POST | Upgrade or switch package plan |
| **Payment History** | `GET /api/customer/payment-fetch` | GET | List past payment receipts and invoices |
| **Initiate Payment** | `GET /api/customer/make-payment/{id}` | GET | Launch online gateway payment (bKash/Nagad) |
| **Support Tickets** | `GET /api/customer/support/fetch` | GET | Fetch active/closed support tickets |
| **Ticket Details** | `GET /api/customer/support/details?ticket_id={id}` | GET | Ticket conversation thread & attachments |
| **Create Ticket** | `POST /api/customer/support/create-ticket` | POST | Submit new issue with optional file attachment |
| **Reply to Ticket** | `POST /api/customer/support/send-message` | POST | Send message reply in ticket thread |
| **Router Controls** | `GET /api/customer/router-control/targets` | GET | Fetch router hardware details and Wi-Fi SSID |
| **Update Wi-Fi** | `POST /api/customer/router-control/wifi` | POST | Change Wi-Fi SSID / Password |
| **Quick Fix / Autofix**| `POST /api/customer/autofix/quick-fix` | POST | Auto-reconnect PPPoE session |
| **Ping Diagnostic** | `POST /api/customer/ping` | POST | Live ping test to ISP gateway |
| **Rewards Wallet** | `GET /api/customer/reward/wallet` | GET | Points balance, redemption options |
| **News & Announcements**| `GET /api/common/news/` | GET | ISP broadcasts, maintenance news |

---

## 3. Implementation Steps

1. **Service Layer**: Create `src/lib/api/services/customer.service.ts`.
2. **Adapter Layer**: Create `src/lib/api/adapters/customer.adapter.ts` (`snake_case` -> `camelCase`).
3. **TanStack Hooks**:
   - `useCustomerDashboardQuery()`
   - `useCustomerQuotaQuery()`
   - `useCustomerSubscriptionQuery()`
   - `useCustomerPaymentsQuery()`
   - `useCustomerSupportQuery()`, `useCustomerCreateTicketMutation()`
   - `useCustomerRouterControlQuery()`, `useCustomerWifiMutation()`
4. **Replace Mock**: Remove `mockFetch()` across all `src/features/customer/*` components.

---

## 4. Test Gate 1
```bash
pnpm lint && pnpm typecheck && pnpm test
```
- [ ] Dashboard displays accurate live customer metrics.
- [ ] Wi-Fi password change mutates router backend.
- [ ] Ticket thread posts messages and refreshes conversation.
- [ ] Payment gateway redirect opens correctly.
