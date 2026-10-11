# Design brief: Marketing landing (`/`)

Rewritten 2026-10-11 from `docs/uiux-suggestion.md` (audit against the sibling `Micro-Task-job` landing).

1. **Product and job:** Bangladesh ISP owners deciding whether to trial. They need to believe one thing fast: it matches every bKash/Nagad payment to the right customer and reconnects the MikroTik line. Then start a trial or open the demo.
2. **Design read:** dark B2B ops SaaS, product-first, calm. One story in eleven sections instead of 28.
3. **References:** Micro-Task landing (hero stage, scroll-driven `Reveal`, hairline proof grid, one `SectionTitle`, journey); 21st.dev hero/feature-tab/pricing layouts (patterns only); Stripe Billing (product-first hero).
4. **Existing system:** `--landing-bg` / `--landing-cta` tokens, Plus Jakarta display + Inter body + Noto Sans Bengali, shadcn `Button`, Lucide, Framer only for interactions (tabs, accordion, scroll progress).
5. **Type:** one `SectionTitle` for every section heading. One orange accent phrase in the h1 only. No eyebrow badge above headings.
6. **Color:** dark canvas, vermilion for actions and the accent phrase only. Emerald = done/reconnected, amber = needs review. No purple or azure washes, and no inline hex in components.
7. **Shape:** cards 16px, stage 32px, pills full; hairline grids instead of a box per number.
8. **Order:** Hero (promise → one CTA + demo link → 4 facts → product stage) → Proof strip → Follow one payment → Product tour → Hierarchy + permissions → Subscriber app → Integrations + plugins → Try the demo → Pricing + ROI → FAQ → Final CTA. The contact form lives on `/contact`.
9. **Motion:** hero entrance is CSS (`.lp-rise`), so it plays before hydration. Sections reveal with CSS scroll timelines (`.lp-reveal`), so content is visible without JS. The journey card lights its steps as chapters cross the viewport middle. No infinite loops, no `animate-ping`, no GSAP on this page. Reduced motion shows everything static.
10. **Signature:** the **Payment matched** card (`PaymentMatchedCard`): gateway, amount, TrxID → customer, and Received → Matched → Reconnected. It appears in the hero and the journey. Same customer (CUST-4091, ৳1,200) in the console, the phone and the card.
11. **Truth rules:** every number comes from `stats` (one source; a missing figure is hidden). Stage data is illustrative and labelled "Sample data". Testimonials, partner logos and case studies stay off the page until they are real and permissioned.
12. **Deliberately not doing:** light theme or theme toggle (marketing stays dark), three.js/WebGL, stock-photo hero, new fonts or dependencies, repeating stats/roles/features in several sections.
