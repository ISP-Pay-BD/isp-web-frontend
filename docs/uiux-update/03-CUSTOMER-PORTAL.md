# 03 — Customer portal (C1–C5) — ✅ implemented

**19 screens.** The users are home and business subscribers in Bangladesh, mostly on a phone and mostly reading Bangla. They have three jobs: **pay**, **check validity**, and **fix Wi-Fi / get support**. Everything here serves those three.

| ID | Fix | Effort |
|---|---|---|
| C1 | "Pay" leads to online checkout first; manual TrxID becomes the fallback | M |
| C2 | Bottom nav priorities (decision needed) | S |
| C3 | Touch targets + customer type scale | S |
| C4 | Validity ring on the dashboard | S |
| C5 | Payments, devices and tickets as cards on mobile | S (after T1) |

Bangla for this portal is [I2](06-BANGLA-I18N.md). Do it in the same phase.

---

## C1 — "Pay" leads to online checkout first

**Problem.** Every primary pay action opens the **manual** payment form:

- Dashboard header "Pay Bill ৳X" → `/customer/payments/pay` ([CustomerDashboardPage.tsx:114](../../src/features/customer/dashboard/pages/CustomerDashboardPage.tsx#L114))
- Dashboard card "Pay Now" → same ([:236](../../src/features/customer/dashboard/pages/CustomerDashboardPage.tsx#L236))
- Bottom nav "Pay" → same ([CustomerBottomNav.tsx:36](../../src/features/customer/shared/components/CustomerBottomNav.tsx#L36))

That screen asks for a **TrxID of a payment made outside the app**, and the payment then stays *pending until staff verify it* ([CustomerPayPage.tsx:26-29](../../src/features/customer/payments/pages/CustomerPayPage.tsx#L26-L29)). A customer who taps "Pay Bill" expects bKash to open. Instead they get a form asking for a code they don't have.

Real online payment already works, but it is hidden. On **My Subscription**, "Renew Plan" calls `useRenewSubscription` → gets `paymentUrl` → `openPaymentPage()` ([CustomerSubscriptionPage.tsx:61-75](../../src/features/customer/subscription/pages/CustomerSubscriptionPage.tsx#L61-L75)), and the gateway confirms and reconnects the line automatically. That is the product's main promise, and it sits two levels deep.

**Fix (frontend only, no new endpoint).** Turn `/customer/payments/pay` into a two-option screen, with online first:

```
┌──────────────────────────────────────┐
│ Pay your bill                         │
│ 20 Mbps Home · ৳1,200 · due 15 Nov    │
│                                       │
│ [ Pay ৳1,200 online ]  ← primary      │
│   bKash · Nagad · card                │
│                                       │
│ ── Already paid outside the app? ──   │
│ Submit your TrxID ›   (opens the      │
│                        existing form) │
└──────────────────────────────────────┘
```

1. The primary button calls the same `useRenewSubscription({ packageId: current })` → `openPaymentPage(paymentUrl)`.
2. If the response has no `paymentUrl` (the ISP has no gateway set up), show the manual form expanded, with one line saying why.
3. Keep the existing manual form exactly as it is, but behind the disclosure.
4. All the dashboard and nav links keep pointing at `/customer/payments/pay`. No route changes.
5. While the gateway opens, show a spinner on the button. When the customer comes back, refetch the subscription and show the new validity.

**Owner decision first (README §Decisions #3).** Confirm that the zapi renew endpoint **reuses an existing pending invoice**. If it creates a new invoice on every tap, a customer who taps twice gets two invoices. If it doesn't reuse, add a "pending invoice → pay it" path first.

**Done when:** from the dashboard, a customer reaches the bKash/Nagad page in **one tap**, and the TrxID form is still reachable in two.

---

## C2 — Bottom nav priorities (decision needed)

**Today** ([CustomerBottomNav.tsx:35-45](../../src/features/customer/shared/components/CustomerBottomNav.tsx#L35-L45)): Home · Pay · Support · **Rewards** · More. Inside More: Subscription, Packages, **Pay Now** (a duplicate of the Pay tab), Payments, Router & Wi-Fi, and others.

**Problem.** "My internet is slow / change Wi-Fi password" is the second most common job after paying, and it is two taps deep. Rewards is a nice extra but takes a main slot. "Pay Now" appears twice.

**Proposal:** Home · Pay · **Router** · Support · More (Subscription, Packages, Payments, **Rewards**, News, Profile, Password). Remove the duplicate "Pay Now" from More.

This changes the spec in `10-RESPONSIVE-AND-MOBILE.md` (which lists Rewards as a tab), so it needs the owner's yes. If Rewards must stay a tab, at least remove the duplicate "Pay Now".

---

## C3 — Touch targets + customer type scale

- **Type:** the dashboard plan card uses 10px labels ("Speed", "Fee", "Expires", [CustomerDashboardPage.tsx:198-208](../../src/features/customer/dashboard/pages/CustomerDashboardPage.tsx#L198-L208)), and the bottom nav labels are 11px. In the customer portal the minimum is **14px for body text and 12px for labels** (13px in Bangla, through S1's `:lang(bn)` rule).
- **Touch:** every tappable thing is at least **44×44px** (doc 10). Check the bottom nav tabs, the WhatsApp button, the router action buttons and the ticket list rows.
- **Thumb reach:** on phones, put the main action of each screen (Pay, Save Wi-Fi, Submit ticket) in a full-width button at the bottom of the content, not only in the page header.

---

## C4 — Validity ring on the dashboard

The dashboard shows days left as a number in a small grid cell ([CustomerDashboardPage.tsx:208-219](../../src/features/customer/dashboard/pages/CustomerDashboardPage.tsx#L208-L219)), and shows a banner when ≤7 days remain. "How long until my net stops?" is the first question customers have, so give it the strongest element on the screen.

- An SVG ring showing the share of the cycle left, with the day count in the middle and "Valid till 15 Nov" below.
- Colour by state: normal → primary, ≤3 days → amber, expired → rose. Always show the text as well, so colour is never the only signal.
- The **Pay** CTA (C1) sits right under the ring.
- Motion: the stroke fills once on load with a CSS `stroke-dashoffset` transition, about 600ms. No Framer (portal rule). Under reduced motion, show it static.

This is the one item from `15-ANIMATION-AND-UX-ROADMAP.md` §4.1 worth building ([07-MOTION.md](07-MOTION.md)).

---

## C5 — Payments, devices and tickets as cards on mobile

`/customer/payments` and `/customer/router/devices` use DataTable. Once [T1](02-DATA-TABLES.md#t1--mobile-card-view) lands, set `meta.mobile` on their columns:

- Payment: amount (title) · date · method · status badge · "Invoice" link
- Device: name or MAC (title) · IP · connected since
- Ticket: subject (title) · status · last reply time

`/customer/support` is a list, not a DataTable. Check it at 390px against the same card shape.


---

## What was built

- **C1** `CustomerPayPage` is now "Pay your bill": a summary of the plan and a full-width **Pay ৳X online** button that starts the same renewal call as My Subscription and opens the provider's payment page. A ref guards against a double tap (the backend creates an invoice on every renew call — the guard is client-side only; **backend idempotency is still recommended**). If the response has no `paymentUrl`, the TrxID form opens with an explanation. "Already paid outside the app?" is a disclosure that opens the unchanged manual form (`?manual=1` opens it directly). The dashboard header button, the plan-card button and the bottom nav "Pay" tab all lead here.
- **C2** Bottom nav: Home · Pay · Wi-Fi · Support · More (Rewards moved into More; duplicate "Pay Now" removed). Expired accounts keep their own set. `min-h-14` tabs, safe-area padding, `aria-current`.
- **C3** Customer screens use ≥14px body text, `h-11`/`h-12` controls, full-width primary actions on phones.
- **C4** `ValidityRing` (SVG, CSS transition ≈700ms, off under reduced motion): days left in the centre, amber ≤3 days, rose when ended, text label alongside; sits in the dashboard's plan card above the Pay button.
- **C5** Payment history, devices and ticket list use phone cards; the ticket thread is chat-style; the reply box sits above the bottom nav.
- **Extras:** confirmation before *Restart router*, *Reset connection* (router page and dashboard); language switch available on the profile screen (the header toggle is hidden on the smallest phones).
