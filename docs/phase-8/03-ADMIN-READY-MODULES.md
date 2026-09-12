# Phase 8 — Module 2 to 11: Admin Ready Modules

---

## 1. Overview
Integration of all Admin / Reseller features that have fully operational backend endpoints in `isppaybd_isp/zapi/Modules/Reseller/`.

---

## 2. Module Specifications

### Module 2: Reseller Dashboard & Core Context
* `GET /api/reseller/dashboard/{resellerId}` — KPI stats, revenue, customer states.
* `GET /api/reseller/profile/{resellerId}` — Reseller company and balance info.
* `PUT /api/reseller/profile/{resellerId}` — Profile updates.

### Module 3: Customer Management & Provisioning
* `GET /api/reseller/customers/{resellerId}` — Paginated, filterable customer list.
* `GET /api/reseller/customers/{resellerId}/{userId}` — Customer 360 profile.
* `POST /api/reseller/customers/create/{resellerId}` — Create new customer.
* `POST /api/reseller/customers/{resellerId}/{userId}` — Update customer.
* `DELETE /api/reseller/customers/{resellerId}/{userId}` — Soft delete.
* `POST /api/reseller/customers/bulk-recharge` — Bulk package renew.
* `POST /api/reseller/customers/bulk-delete` — Batch deletion.
* `POST /api/reseller/customers/import-excel` — Multipart Excel customer import.
* `POST /api/reseller/customers/sync-pppoe` — Push credentials to MikroTik.
* `POST /api/reseller/customers/mac-bind` — Lock MAC address.

### Module 4: Areas & Subareas
* Area CRUD: `GET/POST /api/reseller/areas/{resellerId}`, `PUT /api/reseller/areas/update/{id}`, `DELETE /api/reseller/areas/{id}/delete`.
* Subarea CRUD: `POST/PUT/DELETE /api/reseller/subareas/*`.

### Module 5: Customer Billing & Subscriptions
* `GET/POST/PUT/DELETE /api/reseller/customer-payments/{resellerId}/*` — Cash, bKash, and bank payment invoices.
* `POST /api/reseller/subscription/{resellerId}/renew` — Account recharge.
* `GET/POST/DELETE /api/reseller/funding/{resellerId}/*` — Reseller POP balance funding.

### Module 6: HR, Staff & Attendance
* `GET/POST/PUT/DELETE /api/reseller/employees/{resellerId}/*` — Employee management.
* `GET/POST /api/reseller/employees/{resellerId}/attendance/*` — Daily attendance and check-in/out.
* `GET/POST/PUT /api/reseller/employees/{resellerId}/advance-salary/*` — Advance loans.
* `GET/POST /api/reseller/employee-payments/{resellerId}/*` — Payroll distribution.

### Module 7: Admin Support Desk
* `GET /api/reseller/support-tickets/{resellerId}` — Ticket queue with SLA filters.
* `GET /api/reseller/support-tickets/{resellerId}/{ticketId}` — Full thread.
* `POST /api/reseller/support-tickets/{resellerId}/{ticketId}/message` — Staff reply.
* `PUT /api/reseller/support-tickets/{resellerId}/{ticketId}` — Status & assignment.

### Module 8: SMS & Voice Communications
* `GET/POST/DELETE /api/reseller/sms/{resellerId}/*` — Bulk SMS sending and logs.
* `GET/POST /api/reseller/voice-sms/{resellerId}/send` — Voice broadcast.
* `GET/POST/PUT/DELETE /api/reseller/voice-sms/{resellerId}/templates/*` — Voice templates.
* `PUT /api/reseller/voice-sms/{resellerId}/event-config` — Automated event voice calls.

### Module 9: Accounting & Financial Ledger
* `GET /api/reseller/accounting/{resellerId}/balance-sheet` — Financial balance sheet.
* `GET /api/reseller/accounting/{resellerId}/chart-of-accounts` — COA tree.
* `GET /api/reseller/accounting/{resellerId}/journal-entries` — Journal voucher stream.
* `GET/DELETE /api/reseller/transactions/{resellerId}/*` — General ledger transactions.

### Module 10: Network Infrastructure
* `GET /api/reseller/routers/{resellerId}` — MikroTik router statuses.
* `GET /api/reseller/router-users/{resellerId}/{routerId}` — Router active sessions.
* `GET/POST/PUT/DELETE /api/reseller/ip-pools/{resellerId}/*` — IPv4 Pool allocation.
* `GET /api/reseller/ip-pools/{resellerId}/{poolId}/available` — Free IP query.
* `GET /api/reseller/users-load-traffic/{routerId}` — Live interface bandwidth monitor.

### Module 11: Rewards & Referrals
* `GET/PUT /api/reseller/rewards/{resellerId}/config` — Reward points configuration.
* `GET /api/reseller/referrals/{resellerId}` — Customer referral list.
* `POST /api/reseller/referrals/{resellerId}/{id}/approve` — Approve referral & issue bonus.
