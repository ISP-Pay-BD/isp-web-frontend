# 14 — ISP Feature Catalog (Complete Mock UI)

> Industry + BD competitor research (Splynx, Sonar, iBilling, ISPPoint, ISPBills, NowaCRM, ISPChamp)  
> mapped onto ISP Pay BD. **Status: mock UI complete** (dummy data). Phase 8 = real API.

## Baseline already shipped
Phases 1–7 + inventory §H (AI, audit, news, gateways, movie servers, corporate queues, MAC bind…).

---

## MUST — Bangladesh daily ops

| # | Feature | Route | Status |
|---|---------|-------|--------|
| 1 | Live PPPoE users per router | `/admin/routers/[id]/users` | [x] |
| 2 | Disconnect / reconnect on pay | customer detail actions | [x] |
| 3 | RADIUS / CoA / PoD panel | `/admin/radius` | [x] |
| 4 | Invoice generate + PDF | `/admin/invoices` · `/admin/invoices/[id]` | [x] |
| 5 | Thermal POS receipt | `/admin/customer-payments/[id]/pos` | [x] |
| 6 | Payment reconcile log | `/admin/payments/reconcile` | [x] |
| 7 | Captive expired paywall | `/captive` | [x] |
| 8 | Inactive customers | `/admin/customers/inactive` | [x] |
| 9 | BTRC Excel/PDF export | deepen `/admin/reports/btrc` | [x] |
| 10 | BTRC IP/NAT session logs | `/admin/compliance/ip-logs` | [x] |
| 11 | Grace + FUP policy | `/admin/billing/policies` | [x] |
| 12 | Prepaid / postpaid / hybrid | deepen packages + policies | [x] |
| 13 | VAT / tax on invoices | `/admin/billing/tax` | [x] |
| 14 | Due reminders | `/admin/collections/reminders` | [x] |
| 15 | Collector cash book | `/admin/collections/cashbook` | [x] |

## HIGH — Network & FTTH

| # | Feature | Route | Status |
|---|---------|-------|--------|
| 16 | ONU optical power | `/admin/olt/[id]/onus` | [x] |
| 17 | ONU discovery / provision | same | [x] |
| 18 | Multi-vendor OLT profiles | `/admin/olt/vendors` | [x] |
| 19 | Splitter / PON map | `/admin/network/pon` | [x] |
| 20 | CPE assign to customer | `/admin/inventory/assign` | [x] |
| 21 | Stock transfer | `/admin/inventory/transfers` | [x] |
| 22 | IPAM IPv4 + IPv6 | deepen `/admin/ip-pools` + `/admin/ipam` | [x] |
| 23 | CGNAT map | `/admin/network/cgnat` | [x] |
| 24 | Hotspot vouchers | `/admin/hotspot/vouchers` | [x] |
| 25 | Walled garden | `/admin/hotspot/walled-garden` | [x] |
| 26 | Bandwidth usage graphs | customer detail + `/admin/reports/usage` | [x] |
| 27 | Router health | `/admin/routers/[id]` | [x] |
| 28 | Outage board | `/admin/network/outages` | [x] |
| 29 | Public status page | `/status` | [x] |
| 30 | Topology GIS deepen | `/admin/network/map` (linked) | [x] |

## HIGH — Money, POP, field

| # | Feature | Route | Status |
|---|---------|-------|--------|
| 31 | Dunning schedule | `/admin/billing/dunning` | [x] |
| 32 | Proration wizard | `/admin/billing/proration` | [x] |
| 33 | Credit notes / refunds | `/admin/payments/credits` | [x] |
| 34 | Deposit / OTC ledger | `/admin/billing/deposits` | [x] |
| 35 | POP commissions | `/admin/pop/commissions` | [x] |
| 36 | Package profit by POP | `/admin/pop/package-profit` | [x] |
| 37 | Impersonate POP | `/admin/pop/resellers` actions | [x] |
| 38 | Employee GPS attendance | `/employee/attendance` | [x] |
| 39 | Work orders / install jobs | `/admin/jobs` · `/employee/jobs` | [x] |
| 40 | Collections route map | `/admin/reports/collections-map` | [x] |
| 41 | Leads / sales pipeline | `/admin/leads` | [x] |
| 42 | KYC vault | `/admin/customers/[id]/kyc` | [x] |
| 43 | Parent–child accounts | `/admin/customers/groups` | [x] |

## USEFUL — Portal & growth

| # | Feature | Route | Status |
|---|---------|-------|--------|
| 44 | Customer invoice PDF | `/customer/payments/[id]/invoice` | [x] |
| 45 | Auto-pay settings | `/customer/payments/auto-pay` | [x] |
| 46 | Usage alert rules | `/admin/notifications/usage-alerts` | [x] |
| 47 | Knowledge base | `/help` · `/customer/help` | [x] |
| 48 | Announcement banners | `/admin/announcements` | [x] |
| 49 | PWA / mobile shell note | docs + portal meta | [x] |
| 50 | Referral analytics | `/admin/rewards/analytics` | [x] |
| 51 | OTT / IPTV addons | `/admin/addons` | [x] |
| 52 | Multi-service plans | `/admin/services` | [x] |
| 53 | Plugin detail | `/plugins/[slug]` | [x] |
| 54 | Reset password | `/reset-password` | [x] |
| 55 | EN/BN note | `docs/FONTS.md` + catalog | [x] |

## PLATFORM / SaaS

| # | Feature | Route | Status |
|---|---------|-------|--------|
| 56 | Login-as tenant | `/platform/admins` action UI | [x] |
| 57 | Tenant billing mode | `/platform/admins/[id]/billing` | [x] |
| 58 | Usage metering | `/platform/metering` | [x] |
| 59 | Tenant health score | `/platform/tenants/[id]/health` | [x] |
| 60 | API keys / webhooks | `/admin/developers` | [x] |
| 61 | White-label branding | `/admin/branding` | [x] |
| 62 | Tenant SLA report | `/platform/sla` | [x] |

## NICE / advanced (mock shells)

| # | Feature | Route | Status |
|---|---------|-------|--------|
| 63 | TR-069 / ACS | `/admin/acs` | [x] |
| 64 | NetFlow analytics | `/admin/network/netflow` | [x] |
| 65 | SNMP / NOC hooks | `/admin/noc` | [x] |
| 66 | VPN tunnels | `/admin/vpn` | [x] |
| 67 | IPoE dual-stack | `/admin/network/ipoe` | [x] |
| 68 | Mobile broadband | `/admin/services/mobile` | [x] |
| 69 | AI ticket assist | deepen support + `/admin/ai-chat` | [x] |
| 70 | Fraud score | `/admin/fraud` | [x] |
| 71 | Contract e-sign | `/admin/contracts` | [x] |
| 72 | Dealer 6-tier | `/admin/dealers` | [x] |
| 73 | Bandwidth SLA dashboard | `/admin/bandwidth/sla` | [x] |
| 74 | Backup / restore UI | `/admin/backup` | [x] |
| 75 | Extra gateways (ShurjoPay…) | `/admin/payment-gateways` | [x] |

---

## Related
- Screen inventory: `docs/07-SCREEN-INVENTORY.md` §I  
- Plan status: `docs/PLAN-STATUS.md`  
- Next real work: **Phase 8 API**
