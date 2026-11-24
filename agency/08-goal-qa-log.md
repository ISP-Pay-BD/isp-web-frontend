# Comprehensive QA Audit Log (238 Tests)

**Date:** 2026-11-24T11:16:04.971Z
**Target URL:** http://127.0.0.1:3000
**Viewport Mode:** desktop
**Total Pages Audited:** 238
**Passed:** 216
**Failed:** 22
**Pass Rate:** 90.8%

## Group Breakdown

| Persona | Viewport | Total | Passed | Failed | Pass Rate |
| :--- | :---: | :---: | :---: | :---: | :---: |
| **PUBLIC** | desktop | 23 | 23 | 0 | 100.0% |
| **ADMIN** | desktop | 151 | 147 | 4 | 97.4% |
| **CUSTOMER** | desktop | 20 | 2 | 18 | 10.0% |
| **EMPLOYEE** | desktop | 11 | 11 | 0 | 100.0% |
| **PLATFORM** | desktop | 33 | 33 | 0 | 100.0% |

## Detailed Test Log

| # | Persona | VP | Route | Test URL | HTTP | Status | Issues & Warnings |
| :---: | :--- | :---: | :--- | :--- | :---: | :---: | :--- |
| 1 | public | desktop | `/forgot-password` | `/forgot-password` | 200 | **PASS** | None |
| 2 | public | desktop | `/login` | `/login` | 200 | **PASS** | None |
| 3 | public | desktop | `/reset-password` | `/reset-password` | 200 | **PASS** | None |
| 4 | public | desktop | `/blog/[slug]` | `/blog/getting-started-with-isppaybd` | 200 | **PASS** | None |
| 5 | public | desktop | `/blog` | `/blog` | 200 | **PASS** | None |
| 6 | public | desktop | `/contact` | `/contact` | 200 | **PASS** | None |
| 7 | public | desktop | `/` | `/` | 200 | **PASS** | ImgBroken: http://127.0.0.1:3000/_next/image?url=%2Fimages%2Fapp_images%2Fclient%2FWhatsApp%20Image%202026-04-23%20at%2011.40.35%20PM.jpeg&w=3840&q=75<br/>ImgBroken: http://127.0.0.1:3000/images/landing/logos/mikrotik.svg<br/>ImgBroken: http://127.0.0.1:3000/images/landing/logos/bkash.svg<br/>ImgBroken: http://127.0.0.1:3000/images/landing/logos/nagad.svg |
| 8 | public | desktop | `/payment/cancel` | `/payment/cancel` | 200 | **PASS** | None |
| 9 | public | desktop | `/payment/failed` | `/payment/failed` | 200 | **PASS** | None |
| 10 | public | desktop | `/payment/make-payment/[id]` | `/payment/make-payment/1099?sig=vf7_ohtL9mx7XqwkINDapl` | 200 | **PASS** | None |
| 11 | public | desktop | `/payment/success` | `/payment/success` | 200 | **PASS** | None |
| 12 | public | desktop | `/plugins/[slug]` | `/plugins/mobile-app-white-label` | 200 | **PASS** | None |
| 13 | public | desktop | `/plugins` | `/plugins` | 200 | **PASS** | None |
| 14 | public | desktop | `/pricing` | `/pricing` | 200 | **PASS** | None |
| 15 | public | desktop | `/privacy` | `/privacy` | 200 | **PASS** | None |
| 16 | public | desktop | `/register` | `/register` | 200 | **PASS** | None |
| 17 | public | desktop | `/register/referral` | `/register/referral` | 200 | **PASS** | None |
| 18 | public | desktop | `/templates` | `/templates` | 200 | **PASS** | None |
| 19 | public | desktop | `/terms` | `/terms` | 200 | **PASS** | None |
| 20 | public | desktop | `/403` | `/403` | 200 | **PASS** | None |
| 21 | public | desktop | `/captive` | `/captive` | 200 | **PASS** | None |
| 22 | public | desktop | `/help` | `/help` | 200 | **PASS** | None |
| 23 | public | desktop | `/status` | `/status` | 200 | **PASS** | None |
| 24 | admin | desktop | `/admin/accounting/balance-sheet` | `/admin/accounting/balance-sheet` | 200 | **PASS** | None |
| 25 | admin | desktop | `/admin/accounting/chart-of-accounts` | `/admin/accounting/chart-of-accounts` | 200 | **PASS** | None |
| 26 | admin | desktop | `/admin/accounting/expenses` | `/admin/accounting/expenses` | 200 | **PASS** | None |
| 27 | admin | desktop | `/admin/accounting/incomes` | `/admin/accounting/incomes` | 200 | **PASS** | None |
| 28 | admin | desktop | `/admin/accounting/journal-entries` | `/admin/accounting/journal-entries` | 200 | **PASS** | None |
| 29 | admin | desktop | `/admin/accounting/reports` | `/admin/accounting/reports` | 200 | **PASS** | None |
| 30 | admin | desktop | `/admin/acs` | `/admin/acs` | 200 | **PASS** | None |
| 31 | admin | desktop | `/admin/addons` | `/admin/addons` | 200 | **PASS** | None |
| 32 | admin | desktop | `/admin/ai-chat` | `/admin/ai-chat` | 200 | **PASS** | None |
| 33 | admin | desktop | `/admin/announcements` | `/admin/announcements` | 200 | **PASS** | None |
| 34 | admin | desktop | `/admin/areas` | `/admin/areas` | 200 | **PASS** | None |
| 35 | admin | desktop | `/admin/audit-logs` | `/admin/audit-logs` | 200 | **PASS** | None |
| 36 | admin | desktop | `/admin/backup` | `/admin/backup` | 200 | **PASS** | None |
| 37 | admin | desktop | `/admin/bandwidth/buy/bills` | `/admin/bandwidth/buy/bills` | 200 | **PASS** | None |
| 38 | admin | desktop | `/admin/bandwidth/buy/categories` | `/admin/bandwidth/buy/categories` | 200 | **PASS** | None |
| 39 | admin | desktop | `/admin/bandwidth/buy/items` | `/admin/bandwidth/buy/items` | 200 | **PASS** | None |
| 40 | admin | desktop | `/admin/bandwidth/buy` | `/admin/bandwidth/buy` | 200 | **PASS** | None |
| 41 | admin | desktop | `/admin/bandwidth/buy/providers` | `/admin/bandwidth/buy/providers` | 200 | **PASS** | None |
| 42 | admin | desktop | `/admin/bandwidth/daily-bill` | `/admin/bandwidth/daily-bill` | 200 | **PASS** | None |
| 43 | admin | desktop | `/admin/bandwidth/sell/clients` | `/admin/bandwidth/sell/clients` | 200 | **PASS** | None |
| 44 | admin | desktop | `/admin/bandwidth/sell/invoices` | `/admin/bandwidth/sell/invoices` | 200 | **PASS** | None |
| 45 | admin | desktop | `/admin/bandwidth/sell` | `/admin/bandwidth/sell` | 200 | **PASS** | None |
| 46 | admin | desktop | `/admin/bandwidth/sla` | `/admin/bandwidth/sla` | 200 | **PASS** | None |
| 47 | admin | desktop | `/admin/billing/deposits` | `/admin/billing/deposits` | 200 | **PASS** | None |
| 48 | admin | desktop | `/admin/billing/dunning` | `/admin/billing/dunning` | 200 | **PASS** | None |
| 49 | admin | desktop | `/admin/billing/policies` | `/admin/billing/policies` | 200 | **PASS** | None |
| 50 | admin | desktop | `/admin/billing/proration` | `/admin/billing/proration` | 200 | **PASS** | None |
| 51 | admin | desktop | `/admin/billing/tax` | `/admin/billing/tax` | 200 | **PASS** | None |
| 52 | admin | desktop | `/admin/branding` | `/admin/branding` | 200 | **PASS** | None |
| 53 | admin | desktop | `/admin/collections/cashbook` | `/admin/collections/cashbook` | 200 | **FAIL** | Err: Failed to load resource: the server responded with a status of 501 (Not Implemen<br/>501: http://127.0.0.1:8080/api/v1/reseller/reports/export?type=cashbook&from=2026-11-01&to=2026-11-24 |
| 54 | admin | desktop | `/admin/collections/reminders` | `/admin/collections/reminders` | 200 | **PASS** | None |
| 55 | admin | desktop | `/admin/compliance/ip-logs` | `/admin/compliance/ip-logs` | 200 | **PASS** | None |
| 56 | admin | desktop | `/admin/contracts` | `/admin/contracts` | 200 | **PASS** | None |
| 57 | admin | desktop | `/admin/corporate/queues` | `/admin/corporate/queues` | 200 | **PASS** | None |
| 58 | admin | desktop | `/admin/customer-payments/[id]/pos` | `/admin/customer-payments/1051/pos` | 200 | **PASS** | None |
| 59 | admin | desktop | `/admin/customer-payments/new` | `/admin/customer-payments/new` | 200 | **PASS** | None |
| 60 | admin | desktop | `/admin/customer-payments` | `/admin/customer-payments` | 200 | **FAIL** | Err: Failed to load resource: the server responded with a status of 501 (Not Implemen<br/>501: http://127.0.0.1:8080/api/v1/reseller/reports/export?type=payments |
| 61 | admin | desktop | `/admin/customers/[id]/audit` | `/admin/customers/1041/audit` | 200 | **PASS** | None |
| 62 | admin | desktop | `/admin/customers/[id]/edit` | `/admin/customers/1041/edit` | 200 | **PASS** | None |
| 63 | admin | desktop | `/admin/customers/[id]/kyc` | `/admin/customers/1041/kyc` | 200 | **PASS** | None |
| 64 | admin | desktop | `/admin/customers/[id]/mac-bind` | `/admin/customers/1041/mac-bind` | 200 | **PASS** | None |
| 65 | admin | desktop | `/admin/customers/[id]` | `/admin/customers/1041` | 200 | **PASS** | None |
| 66 | admin | desktop | `/admin/customers/[id]/subscription` | `/admin/customers/1041/subscription` | 200 | **PASS** | None |
| 67 | admin | desktop | `/admin/customers/expired` | `/admin/customers/expired` | 200 | **PASS** | None |
| 68 | admin | desktop | `/admin/customers/free-requests` | `/admin/customers/free-requests` | 200 | **PASS** | None |
| 69 | admin | desktop | `/admin/customers/groups` | `/admin/customers/groups` | 200 | **PASS** | None |
| 70 | admin | desktop | `/admin/customers/import` | `/admin/customers/import` | 200 | **PASS** | None |
| 71 | admin | desktop | `/admin/customers/inactive` | `/admin/customers/inactive` | 200 | **PASS** | None |
| 72 | admin | desktop | `/admin/customers/new` | `/admin/customers/new` | 200 | **PASS** | None |
| 73 | admin | desktop | `/admin/customers` | `/admin/customers` | 200 | **PASS** | None |
| 74 | admin | desktop | `/admin/dashboard` | `/admin/dashboard` | 200 | **PASS** | None |
| 75 | admin | desktop | `/admin/dealers` | `/admin/dealers` | 200 | **PASS** | None |
| 76 | admin | desktop | `/admin/developers` | `/admin/developers` | 200 | **PASS** | None |
| 77 | admin | desktop | `/admin/engines/[slug]` | `/admin/engines/mobile-app-white-label` | 200 | **PASS** | None |
| 78 | admin | desktop | `/admin/engines` | `/admin/engines` | 200 | **PASS** | None |
| 79 | admin | desktop | `/admin/fraud` | `/admin/fraud` | 200 | **PASS** | None |
| 80 | admin | desktop | `/admin/hierarchy` | `/admin/hierarchy` | 200 | **PASS** | None |
| 81 | admin | desktop | `/admin/hotspot/dashboard` | `/admin/hotspot/dashboard` | 200 | **PASS** | None |
| 82 | admin | desktop | `/admin/hotspot/packages` | `/admin/hotspot/packages` | 200 | **PASS** | None |
| 83 | admin | desktop | `/admin/hotspot` | `/admin/hotspot` | 200 | **PASS** | None |
| 84 | admin | desktop | `/admin/hotspot/reports` | `/admin/hotspot/reports` | 200 | **PASS** | None |
| 85 | admin | desktop | `/admin/hotspot/users` | `/admin/hotspot/users` | 200 | **PASS** | None |
| 86 | admin | desktop | `/admin/hotspot/vouchers` | `/admin/hotspot/vouchers` | 200 | **PASS** | None |
| 87 | admin | desktop | `/admin/hotspot/walled-garden` | `/admin/hotspot/walled-garden` | 200 | **PASS** | None |
| 88 | admin | desktop | `/admin/hr/accounts` | `/admin/hr/accounts` | 200 | **PASS** | None |
| 89 | admin | desktop | `/admin/hr/advance-salary` | `/admin/hr/advance-salary` | 200 | **PASS** | None |
| 90 | admin | desktop | `/admin/hr/attendance` | `/admin/hr/attendance` | 200 | **PASS** | None |
| 91 | admin | desktop | `/admin/hr/employees/[id]` | `/admin/hr/employees/1070` | 200 | **PASS** | None |
| 92 | admin | desktop | `/admin/hr/employees` | `/admin/hr/employees` | 200 | **PASS** | None |
| 93 | admin | desktop | `/admin/hr/salaries` | `/admin/hr/salaries` | 200 | **PASS** | None |
| 94 | admin | desktop | `/admin/inventory/assign` | `/admin/inventory/assign` | 200 | **PASS** | None |
| 95 | admin | desktop | `/admin/inventory/categories` | `/admin/inventory/categories` | 200 | **PASS** | None |
| 96 | admin | desktop | `/admin/inventory/items` | `/admin/inventory/items` | 200 | **PASS** | None |
| 97 | admin | desktop | `/admin/inventory/locations` | `/admin/inventory/locations` | 200 | **PASS** | None |
| 98 | admin | desktop | `/admin/inventory/stock` | `/admin/inventory/stock` | 200 | **PASS** | None |
| 99 | admin | desktop | `/admin/inventory/transfers` | `/admin/inventory/transfers` | 200 | **PASS** | None |
| 100 | admin | desktop | `/admin/inventory/units` | `/admin/inventory/units` | 200 | **PASS** | None |
| 101 | admin | desktop | `/admin/invoices/[id]` | `/admin/invoices/1051` | 200 | **PASS** | None |
| 102 | admin | desktop | `/admin/invoices` | `/admin/invoices` | 200 | **FAIL** | Err: Failed to load resource: the server responded with a status of 501 (Not Implemen<br/>501: http://127.0.0.1:8080/api/v1/reseller/reports/export?type=payments&status=pending |
| 103 | admin | desktop | `/admin/ip-pools` | `/admin/ip-pools` | 200 | **PASS** | None |
| 104 | admin | desktop | `/admin/ipam` | `/admin/ipam` | 200 | **PASS** | None |
| 105 | admin | desktop | `/admin/jobs` | `/admin/jobs` | 200 | **PASS** | None |
| 106 | admin | desktop | `/admin/leads` | `/admin/leads` | 200 | **PASS** | None |
| 107 | admin | desktop | `/admin/movie-servers` | `/admin/movie-servers` | 200 | **PASS** | None |
| 108 | admin | desktop | `/admin/my-review` | `/admin/my-review` | 200 | **PASS** | None |
| 109 | admin | desktop | `/admin/network/cgnat` | `/admin/network/cgnat` | 200 | **PASS** | None |
| 110 | admin | desktop | `/admin/network/diagram` | `/admin/network/diagram` | 200 | **PASS** | None |
| 111 | admin | desktop | `/admin/network/ipoe` | `/admin/network/ipoe` | 200 | **PASS** | None |
| 112 | admin | desktop | `/admin/network/map` | `/admin/network/map` | 200 | **PASS** | None |
| 113 | admin | desktop | `/admin/network/netflow` | `/admin/network/netflow` | 200 | **PASS** | None |
| 114 | admin | desktop | `/admin/network/outages` | `/admin/network/outages` | 200 | **PASS** | None |
| 115 | admin | desktop | `/admin/network/pon` | `/admin/network/pon` | 200 | **PASS** | None |
| 116 | admin | desktop | `/admin/news` | `/admin/news` | 200 | **PASS** | None |
| 117 | admin | desktop | `/admin/noc` | `/admin/noc` | 200 | **PASS** | None |
| 118 | admin | desktop | `/admin/notifications/usage-alerts` | `/admin/notifications/usage-alerts` | 200 | **PASS** | None |
| 119 | admin | desktop | `/admin/olt/[id]/onus` | `/admin/olt/1/onus` | 200 | **PASS** | None |
| 120 | admin | desktop | `/admin/olt` | `/admin/olt` | 200 | **PASS** | None |
| 121 | admin | desktop | `/admin/olt/vendors` | `/admin/olt/vendors` | 200 | **PASS** | None |
| 122 | admin | desktop | `/admin/packages` | `/admin/packages` | 200 | **PASS** | None |
| 123 | admin | desktop | `/admin` | `/admin` | 200 | **PASS** | None |
| 124 | admin | desktop | `/admin/payment` | `/admin/payment` | 200 | **PASS** | None |
| 125 | admin | desktop | `/admin/payment-gateways/[id]` | `/admin/payment-gateways/bkash` | 200 | **PASS** | None |
| 126 | admin | desktop | `/admin/payment-gateways` | `/admin/payment-gateways` | 200 | **PASS** | None |
| 127 | admin | desktop | `/admin/payments/credits` | `/admin/payments/credits` | 200 | **PASS** | None |
| 128 | admin | desktop | `/admin/payments/reconcile` | `/admin/payments/reconcile` | 200 | **PASS** | None |
| 129 | admin | desktop | `/admin/pop/commissions` | `/admin/pop/commissions` | 200 | **PASS** | None |
| 130 | admin | desktop | `/admin/pop/funding` | `/admin/pop/funding` | 200 | **PASS** | None |
| 131 | admin | desktop | `/admin/pop/package-profit` | `/admin/pop/package-profit` | 200 | **PASS** | None |
| 132 | admin | desktop | `/admin/pop/resellers` | `/admin/pop/resellers` | 200 | **PASS** | None |
| 133 | admin | desktop | `/admin/pop/transactions` | `/admin/pop/transactions` | 200 | **PASS** | None |
| 134 | admin | desktop | `/admin/pop-packages` | `/admin/pop-packages` | 200 | **PASS** | None |
| 135 | admin | desktop | `/admin/product-showcase` | `/admin/product-showcase` | 200 | **PASS** | None |
| 136 | admin | desktop | `/admin/profile` | `/admin/profile` | 200 | **PASS** | None |
| 137 | admin | desktop | `/admin/purchase/bills` | `/admin/purchase/bills` | 200 | **PASS** | None |
| 138 | admin | desktop | `/admin/purchase/requisitions` | `/admin/purchase/requisitions` | 200 | **PASS** | None |
| 139 | admin | desktop | `/admin/purchase/vendors` | `/admin/purchase/vendors` | 200 | **PASS** | None |
| 140 | admin | desktop | `/admin/push` | `/admin/push` | 200 | **PASS** | None |
| 141 | admin | desktop | `/admin/radius` | `/admin/radius` | 200 | **PASS** | None |
| 142 | admin | desktop | `/admin/recycle-bin` | `/admin/recycle-bin` | 200 | **PASS** | None |
| 143 | admin | desktop | `/admin/reports/btrc` | `/admin/reports/btrc` | 200 | **PASS** | None |
| 144 | admin | desktop | `/admin/reports/collections-map` | `/admin/reports/collections-map` | 200 | **PASS** | None |
| 145 | admin | desktop | `/admin/reports/otc` | `/admin/reports/otc` | 200 | **PASS** | None |
| 146 | admin | desktop | `/admin/reports/usage` | `/admin/reports/usage` | 200 | **PASS** | None |
| 147 | admin | desktop | `/admin/rewards/analytics` | `/admin/rewards/analytics` | 200 | **PASS** | None |
| 148 | admin | desktop | `/admin/rewards` | `/admin/rewards` | 200 | **PASS** | None |
| 149 | admin | desktop | `/admin/routers/[id]` | `/admin/routers/1060` | 200 | **PASS** | None |
| 150 | admin | desktop | `/admin/routers/[id]/users` | `/admin/routers/1060/users` | 200 | **PASS** | None |
| 151 | admin | desktop | `/admin/routers` | `/admin/routers` | 200 | **PASS** | None |
| 152 | admin | desktop | `/admin/routers/uplinks` | `/admin/routers/uplinks` | 200 | **PASS** | None |
| 153 | admin | desktop | `/admin/services/mobile` | `/admin/services/mobile` | 200 | **PASS** | None |
| 154 | admin | desktop | `/admin/services` | `/admin/services` | 200 | **PASS** | None |
| 155 | admin | desktop | `/admin/settings` | `/admin/settings` | 200 | **PASS** | None |
| 156 | admin | desktop | `/admin/shop` | `/admin/shop` | 200 | **PASS** | None |
| 157 | admin | desktop | `/admin/sidebar-pins` | `/admin/sidebar-pins` | 200 | **PASS** | None |
| 158 | admin | desktop | `/admin/sms` | `/admin/sms` | 200 | **PASS** | None |
| 159 | admin | desktop | `/admin/sms-templates` | `/admin/sms-templates` | 200 | **PASS** | Warn: EmptyDropdown: "base-ui-_r_57_" has 0 selectable items<br/>Warn: EmptyDropdown: "base-ui-_r_5d_" has 0 selectable items<br/>Warn: EmptyDropdown: "base-ui-_r_5j_" has 0 selectable items<br/>Warn: EmptyDropdown: "base-ui-_r_5p_" has 0 selectable items |
| 160 | admin | desktop | `/admin/subscription` | `/admin/subscription` | 200 | **PASS** | None |
| 161 | admin | desktop | `/admin/support/[id]` | `/admin/support/1080` | 200 | **FAIL** | Err: Failed to load resource: the server responded with a status of 400 (Bad Request) |
| 162 | admin | desktop | `/admin/support/feedback` | `/admin/support/feedback` | 200 | **PASS** | None |
| 163 | admin | desktop | `/admin/support` | `/admin/support` | 200 | **PASS** | None |
| 164 | admin | desktop | `/admin/theme-studio` | `/admin/theme-studio` | 200 | **PASS** | None |
| 165 | admin | desktop | `/admin/user-access` | `/admin/user-access` | 200 | **PASS** | None |
| 166 | admin | desktop | `/admin/voice-sms` | `/admin/voice-sms` | 200 | **PASS** | None |
| 167 | admin | desktop | `/admin/vpn` | `/admin/vpn` | 200 | **PASS** | None |
| 168 | admin | desktop | `/admin/wallet` | `/admin/wallet` | 200 | **PASS** | None |
| 169 | admin | desktop | `/admin/whatsapp/campaigns` | `/admin/whatsapp/campaigns` | 200 | **PASS** | None |
| 170 | admin | desktop | `/admin/whatsapp/inbox` | `/admin/whatsapp/inbox` | 200 | **PASS** | None |
| 171 | admin | desktop | `/admin/whatsapp/message-log` | `/admin/whatsapp/message-log` | 200 | **PASS** | None |
| 172 | admin | desktop | `/admin/whatsapp/opt-ins` | `/admin/whatsapp/opt-ins` | 200 | **PASS** | None |
| 173 | admin | desktop | `/admin/whatsapp/settings` | `/admin/whatsapp/settings` | 200 | **PASS** | None |
| 174 | admin | desktop | `/admin/whatsapp/templates` | `/admin/whatsapp/templates` | 200 | **PASS** | None |
| 175 | customer | desktop | `/customer/change-password` | `/customer/change-password` | 200 | **FAIL** | Err: %o

%s TypeError: notificationsList.map is not a function
    at PortalHeader (h<br/>Err: TypeError: notificationsList.map is not a function
    at PortalHeader (http://1<br/>Err: TypeError: notificationsList.map is not a function
    at PortalHeader (http://1 |
| 176 | customer | desktop | `/customer/dashboard` | `/customer/dashboard` | 200 | **FAIL** | Err: %o

%s TypeError: notificationsList.map is not a function
    at PortalHeader (h<br/>Err: TypeError: notificationsList.map is not a function
    at PortalHeader (http://1<br/>Err: TypeError: notificationsList.map is not a function
    at PortalHeader (http://1 |
| 177 | customer | desktop | `/customer/experience` | `/customer/experience` | 200 | **PASS** | None |
| 178 | customer | desktop | `/customer/help` | `/customer/help` | 200 | **FAIL** | Err: %o

%s TypeError: notificationsList.map is not a function
    at PortalHeader (h<br/>Err: TypeError: notificationsList.map is not a function
    at PortalHeader (http://1<br/>Err: TypeError: notificationsList.map is not a function
    at PortalHeader (http://1 |
| 179 | customer | desktop | `/customer/news` | `/customer/news` | 200 | **FAIL** | Err: %o

%s TypeError: notificationsList.map is not a function
    at PortalHeader (h<br/>Err: TypeError: notificationsList.map is not a function
    at PortalHeader (http://1<br/>Err: TypeError: notificationsList.map is not a function
    at PortalHeader (http://1 |
| 180 | customer | desktop | `/customer/packages` | `/customer/packages` | 200 | **FAIL** | Err: %o

%s TypeError: notificationsList.map is not a function
    at PortalHeader (h<br/>Err: TypeError: notificationsList.map is not a function
    at PortalHeader (http://1<br/>Err: TypeError: notificationsList.map is not a function
    at PortalHeader (http://1 |
| 181 | customer | desktop | `/customer/payments/[id]/invoice` | `/customer/payments/1051/invoice` | 200 | **FAIL** | Err: %o

%s TypeError: notificationsList.map is not a function
    at PortalHeader (h<br/>Err: TypeError: notificationsList.map is not a function
    at PortalHeader (http://1<br/>Err: TypeError: notificationsList.map is not a function
    at PortalHeader (http://1 |
| 182 | customer | desktop | `/customer/payments/auto-pay` | `/customer/payments/auto-pay` | 200 | **FAIL** | Err: %o

%s TypeError: notificationsList.map is not a function
    at PortalHeader (h<br/>Err: TypeError: notificationsList.map is not a function
    at PortalHeader (http://1<br/>Err: TypeError: notificationsList.map is not a function
    at PortalHeader (http://1 |
| 183 | customer | desktop | `/customer/payments` | `/customer/payments` | 200 | **FAIL** | Err: %o

%s TypeError: notificationsList.map is not a function
    at PortalHeader (h<br/>Err: TypeError: notificationsList.map is not a function
    at PortalHeader (http://1<br/>Err: TypeError: notificationsList.map is not a function
    at PortalHeader (http://1 |
| 184 | customer | desktop | `/customer/payments/pay` | `/customer/payments/pay` | 200 | **FAIL** | Err: %o

%s TypeError: notificationsList.map is not a function
    at PortalHeader (h<br/>Err: TypeError: notificationsList.map is not a function
    at PortalHeader (http://1<br/>Err: TypeError: notificationsList.map is not a function
    at PortalHeader (http://1 |
| 185 | customer | desktop | `/customer/profile` | `/customer/profile` | 200 | **FAIL** | Err: %o

%s TypeError: notificationsList.map is not a function
    at PortalHeader (h<br/>Err: TypeError: notificationsList.map is not a function
    at PortalHeader (http://1<br/>Err: TypeError: notificationsList.map is not a function
    at PortalHeader (http://1 |
| 186 | customer | desktop | `/customer/rewards` | `/customer/rewards` | 200 | **FAIL** | Err: %o

%s TypeError: notificationsList.map is not a function
    at PortalHeader (h<br/>Err: TypeError: notificationsList.map is not a function
    at PortalHeader (http://1<br/>Err: TypeError: notificationsList.map is not a function
    at PortalHeader (http://1 |
| 187 | customer | desktop | `/customer/router/devices` | `/customer/router/devices` | 200 | **FAIL** | Err: %o

%s TypeError: notificationsList.map is not a function
    at PortalHeader (h<br/>Err: TypeError: notificationsList.map is not a function
    at PortalHeader (http://1<br/>Err: TypeError: notificationsList.map is not a function
    at PortalHeader (http://1 |
| 188 | customer | desktop | `/customer/router` | `/customer/router` | 200 | **FAIL** | Err: %o

%s TypeError: notificationsList.map is not a function
    at PortalHeader (h<br/>Err: TypeError: notificationsList.map is not a function
    at PortalHeader (http://1<br/>Err: TypeError: notificationsList.map is not a function
    at PortalHeader (http://1 |
| 189 | customer | desktop | `/customer/router/wifi` | `/customer/router/wifi` | 200 | **FAIL** | Err: %o

%s TypeError: notificationsList.map is not a function
    at PortalHeader (h<br/>Err: TypeError: notificationsList.map is not a function
    at PortalHeader (http://1<br/>Err: TypeError: notificationsList.map is not a function
    at PortalHeader (http://1 |
| 190 | customer | desktop | `/customer/shop` | `/customer/shop` | 200 | **FAIL** | Err: %o

%s TypeError: notificationsList.map is not a function
    at PortalHeader (h<br/>Err: TypeError: notificationsList.map is not a function
    at PortalHeader (http://1<br/>Err: TypeError: notificationsList.map is not a function
    at PortalHeader (http://1 |
| 191 | customer | desktop | `/customer/subscription` | `/customer/subscription` | 200 | **PASS** | None |
| 192 | customer | desktop | `/customer/support/[id]` | `/customer/support/1080` | 200 | **FAIL** | Err: %o

%s TypeError: notificationsList.map is not a function
    at PortalHeader (h<br/>Err: TypeError: notificationsList.map is not a function
    at PortalHeader (http://1<br/>Err: TypeError: notificationsList.map is not a function
    at PortalHeader (http://1 |
| 193 | customer | desktop | `/customer/support/new` | `/customer/support/new` | 200 | **FAIL** | Err: %o

%s TypeError: notificationsList.map is not a function
    at PortalHeader (h<br/>Err: TypeError: notificationsList.map is not a function
    at PortalHeader (http://1<br/>Err: TypeError: notificationsList.map is not a function
    at PortalHeader (http://1 |
| 194 | customer | desktop | `/customer/support` | `/customer/support` | 200 | **FAIL** | Err: %o

%s TypeError: notificationsList.map is not a function
    at PortalHeader (h<br/>Err: TypeError: notificationsList.map is not a function
    at PortalHeader (http://1<br/>Err: TypeError: notificationsList.map is not a function
    at PortalHeader (http://1 |
| 195 | employee | desktop | `/employee/advance-salary` | `/employee/advance-salary` | 200 | **PASS** | None |
| 196 | employee | desktop | `/employee/attendance` | `/employee/attendance` | 200 | **PASS** | None |
| 197 | employee | desktop | `/employee/collect-payment` | `/employee/collect-payment` | 200 | **PASS** | None |
| 198 | employee | desktop | `/employee/customers/new` | `/employee/customers/new` | 200 | **PASS** | None |
| 199 | employee | desktop | `/employee/dashboard` | `/employee/dashboard` | 200 | **PASS** | None |
| 200 | employee | desktop | `/employee/installations` | `/employee/installations` | 200 | **PASS** | None |
| 201 | employee | desktop | `/employee/jobs` | `/employee/jobs` | 200 | **PASS** | None |
| 202 | employee | desktop | `/employee/profile` | `/employee/profile` | 200 | **PASS** | None |
| 203 | employee | desktop | `/employee/salaries` | `/employee/salaries` | 200 | **PASS** | None |
| 204 | employee | desktop | `/employee/tickets/[id]` | `/employee/tickets/1080` | 200 | **PASS** | None |
| 205 | employee | desktop | `/employee/tickets` | `/employee/tickets` | 200 | **PASS** | None |
| 206 | platform | desktop | `/platform/admins/[id]/billing` | `/platform/admins/1001/billing` | 200 | **PASS** | None |
| 207 | platform | desktop | `/platform/admins/packages` | `/platform/admins/packages` | 200 | **PASS** | None |
| 208 | platform | desktop | `/platform/admins` | `/platform/admins` | 200 | **PASS** | None |
| 209 | platform | desktop | `/platform/ai-knowledge` | `/platform/ai-knowledge` | 200 | **PASS** | None |
| 210 | platform | desktop | `/platform/blogs` | `/platform/blogs` | 200 | **PASS** | None |
| 211 | platform | desktop | `/platform/contacts` | `/platform/contacts` | 200 | **PASS** | None |
| 212 | platform | desktop | `/platform/cron` | `/platform/cron` | 200 | **PASS** | None |
| 213 | platform | desktop | `/platform/dashboard` | `/platform/dashboard` | 200 | **PASS** | None |
| 214 | platform | desktop | `/platform/engines/[slug]` | `/platform/engines/mobile-app-white-label` | 200 | **PASS** | None |
| 215 | platform | desktop | `/platform/engines` | `/platform/engines` | 200 | **PASS** | None |
| 216 | platform | desktop | `/platform/file-manager` | `/platform/file-manager` | 200 | **PASS** | None |
| 217 | platform | desktop | `/platform/hierarchy` | `/platform/hierarchy` | 200 | **PASS** | None |
| 218 | platform | desktop | `/platform/maintenance` | `/platform/maintenance` | 200 | **PASS** | None |
| 219 | platform | desktop | `/platform/metering` | `/platform/metering` | 200 | **PASS** | None |
| 220 | platform | desktop | `/platform` | `/platform` | 200 | **PASS** | None |
| 221 | platform | desktop | `/platform/plugins` | `/platform/plugins` | 200 | **PASS** | None |
| 222 | platform | desktop | `/platform/redis-logs` | `/platform/redis-logs` | 200 | **PASS** | None |
| 223 | platform | desktop | `/platform/revenue` | `/platform/revenue` | 200 | **PASS** | None |
| 224 | platform | desktop | `/platform/reviews` | `/platform/reviews` | 200 | **PASS** | None |
| 225 | platform | desktop | `/platform/settings` | `/platform/settings` | 200 | **PASS** | None |
| 226 | platform | desktop | `/platform/settings/software` | `/platform/settings/software` | 200 | **PASS** | None |
| 227 | platform | desktop | `/platform/settings/system` | `/platform/settings/system` | 200 | **PASS** | None |
| 228 | platform | desktop | `/platform/showcase` | `/platform/showcase` | 200 | **PASS** | None |
| 229 | platform | desktop | `/platform/sla` | `/platform/sla` | 200 | **PASS** | None |
| 230 | platform | desktop | `/platform/support` | `/platform/support` | 200 | **PASS** | None |
| 231 | platform | desktop | `/platform/support-tickets` | `/platform/support-tickets` | 200 | **PASS** | None |
| 232 | platform | desktop | `/platform/templates` | `/platform/templates` | 200 | **PASS** | None |
| 233 | platform | desktop | `/platform/tenants/[id]/edit` | `/platform/tenants/1/edit` | 200 | **PASS** | None |
| 234 | platform | desktop | `/platform/tenants/[id]/health` | `/platform/tenants/1/health` | 200 | **PASS** | None |
| 235 | platform | desktop | `/platform/tenants/[id]` | `/platform/tenants/1` | 200 | **PASS** | None |
| 236 | platform | desktop | `/platform/tenants/new` | `/platform/tenants/new` | 200 | **PASS** | None |
| 237 | platform | desktop | `/platform/tenants` | `/platform/tenants` | 200 | **PASS** | None |
| 238 | platform | desktop | `/platform/user-access` | `/platform/user-access` | 200 | **PASS** | None |
