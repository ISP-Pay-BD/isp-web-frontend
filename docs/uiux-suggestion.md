# UI/UX Suggestion: ISP Pay BD landing (`/`)

_Generated: 2026-10-11 · Mode: audit · Scope: `isp-web-frontend` marketing landing only (portals, pricing/plugins/register pages excluded). Reference: `../Micro-Task-job` landing._

## Decide

**Direction:** Keep ISP's dark brand (`#0c0118` canvas, one vermilion CTA). Change the page's structure and discipline to match Micro-Task's landing: fewer sections, one story, real numbers only, CSS reveals, and the product as the hero.

**Do now**
1. Cut the page from 28 sections to about 10. Merge the repeated stats, roles, features and proof blocks.
2. Swap the Framer `Reveal` for Micro-Task's CSS scroll-driven reveal, so sections are visible before JS loads.
3. Give every number one source. Remove contradictions and placeholder testimonials until there is real proof.

**Do not**
- Copy Micro-Task's light editorial theme or its theme toggle. `DESIGN.md` says marketing stays on `#0c0118` end-to-end.
- Copy its three.js scenes (coins, journey, glass card). The ISP brief rules out heavy 3D, and ISP owners often browse on low-end Android.
- Add Instrument Serif or any other new font or dependency. Make the accent phrase with colour in the existing Plus Jakarta.

**Why:** ISP owners decide on trust: "will it match my bKash payments and reconnect my MikroTik users?" Micro-Task wins because every section has one job and shows the real product with real numbers. ISP repeats itself 3–5 times and shows stock photos and invented figures.

## Product

| | |
|---|---|
| What | Multi-tenant ISP billing + MikroTik/OLT ops SaaS for Bangladesh |
| Users (landing) | ISP owners / operators evaluating, then trial or register |
| Platform | web (marketing) · web portals (out of scope) |
| Stack | Next.js 16, Tailwind v4, shadcn, Framer Motion, GSAP, NumberFlow, Lucide |
| Existing system | `DESIGN.md` tokens, `landing-*` CSS vars, Plus Jakarta + Inter, `MarketingLayout` |
| Already good | Strong ISP-native copy (৳, PPPoE, TrxID, POP) · mobile sticky CTA · skip link + reduced-motion hook |

**Critical workflow:** `Land → understand "auto-matched bKash + MikroTik sync" → trust (proof, price) → Start free trial / Try demo → /register`

## Findings

| # | Problem | Evidence | Impact | Action |
|---|---------|----------|--------|--------|
| 1 | **28 sections, heavy repetition.** Stats appear 3×, roles/permissions 3×, "what it does" 5×, social proof 5×. Users never reach Pricing (section 21). | `src/features/marketing/landing/pages/LandingPage.tsx:51-189` (StatsBand, ProofBand, hero stats; ResellerHierarchy, RolesAccess, PermissionsMatrix; Benefits, WhyChoose, ProductPreview, FeaturesGrid, DesirePin) | High | Replace (merge) |
| 2 | **Sections are invisible until hydration.** 17 sections are wrapped in a Framer `Reveal` with `initial="hidden"`, plus 13 more `initial` hides inside components, and the whole page is `'use client'`. On a slow 4G phone, whole sections stay blank. Micro-Task hit this exact bug and fixed it in v14. | `src/components/motion/Reveal.tsx:33-35`, `LandingPage.tsx:1` | High | Replace |
| 3 | **Numbers contradict each other or are invented.** Uptime shows 99.98% in one place and 99.9% SLA in another. "2M+" is hard-coded. Testimonials use `pravatar.cc` stock faces. Hero "live" rows are a fixed array. | `StatsBand.tsx:13`, `ProofBand.tsx:27-28`, `src/data/marketing/landing.data.ts:105-109`, `HeroSection.tsx:22-27` | High (trust) | Replace |
| 4 | **Cluttered hero that shows a stock photo instead of the product.** Two eyebrows sit above the h1, then 2 CTAs, 3 trust chips and 4 pills. The right column is a decorative "NOC 10Gbps" photo, and the real console is pushed below the fold. | `HeroSection.tsx:111-120`, `:168-192`, `:195-226`, `:230-289` | High | Modify |
| 5 | **Bangla toggle mostly does nothing.** The hero h1 is hard-coded English and `titleBn`/`subtitleBn` are never read. Only 10 of ~30 landing components use translations. | `HeroSection.tsx:126-137`, `landing.data.ts:11-15` | Medium-High | Modify |
| 6 | **Token and brief drift, plus banned effects.** CSS vars are `#0a0c10`/`#e85a1a`, while the binding docs say `#0c0118`/`#f75803`. The page has a purple-500 glow, `animate-ping`, 3 infinite bob loops, GSAP and Framer side by side, and 3 fixed `blur-3xl` washes. | `src/app/globals.css:57-62` vs `DESIGN.md:5-7`; `HeroSection.tsx:197,247,135,202`; `LandingAtmosphere.tsx:9-27` | Medium | Modify |
| 7 | **Nested `<main>` landmarks.** The layout's `<main>` wraps the page's `<main>`, so screen readers get two "main" regions. | `src/features/marketing/shared/components/MarketingLayout.tsx:23`, `LandingPage.tsx:47` | Medium (a11y) | Modify |

## Backlog

| Pri | Change | Why it matters | Platform | Effort | Impact |
|-----|--------|----------------|----------|--------|--------|
| P0 | **New order, ~10 sections:** Hero → Proof strip → "Follow one payment" journey → Modules tour (tabs) → Your hierarchy (POP/reseller + roles + permissions in one) → Subscriber Bangla app → Integrations + plugins → Pricing (+ ROI calc inside) → FAQ → Final CTA. Move the contact form to `/contact`. Drop Comparison, DesirePin, WhyChoose and TrustBadges, or fold them into the sections above. | One job per section, and Pricing becomes reachable | web | M | High |
| P0 | Port Micro-Task's `Reveal` + `.mk-reveal`/`.mk-word` CSS (`animation-timeline: view()`). Content shows by default and animates only where supported. | Nothing is blank on slow phones, and less JS | web | S | High |
| P0 | One stats source and Micro-Task's "show only if real" rule (`proof-strip.tsx`: hide a fact below its threshold). Hide Testimonials, Partners and CaseStudy until you have real, permissioned quotes and logos. | Contradictory or invented numbers kill B2B trust | web | S | High |
| P1 | **Hero rebuild in Micro-Task's shape:** one live chip ("৳ matched today" only if real) → h1 with one orange accent phrase → one CTA + text link "Try the live demo" → 4 facts → a wide **product stage** with the operator console in a browser frame, the subscriber app in a phone, and a payment-matched card. | The first screen shows the actual product | web | M | High |
| P1 | **Signature card "Payment matched":** bKash ৳800 · TrxID → CUST-4091 → PPPoE re-enabled → SMS sent, with timestamps. Reuse it in the hero, the journey and the portal payments page, like Micro-Task's payout receipt. | One recurring visual that answers "will it really auto-reconcile?" | web | S | High |
| P1 | **"Follow one payment" journey:** turn `AutoReconcile` + `HowItWorks` into 5 sticky scroll chapters (customer pays → TrxID arrives → matched → MikroTik reconnects → ledger + SMS). Use CSS `position: sticky` and static cards, with no WebGL. | Turns the core feature into a story, like Micro-Task's `journey.tsx` | web | M | High |
| P1 | Wire the hero and every kept section to `LocaleContext`. Use `titleBn` and `subtitleBn`, and render Bangla in Noto Sans Bengali. | BD ISP owners read Bangla, and the toggle currently fails them | web | M | Med-High |
| P2 | Resolve the token drift: pick `#0c0118`/`#f75803` (the binding docs) or update `DESIGN.md`. Add one `SectionTitle` (Micro-Task `section-title.tsx`) so every heading shares one type rhythm. | One brand, one rhythm | web | S | Med |
| P2 | Motion budget: remove GSAP from the landing (hero + DesirePin), plus `animate-ping`, the infinite bobs, the purple glow and 2 of the 3 blur washes. Keep one loop, a live-payments ticker shown only with ≥3 real rows. Make `LandingPage` a server component with client islands. | Smoother on low-end Android, smaller bundle | web | S | Med |
| P2 | Use a single `<main>` (change the page's root to `<div>`). Add `aria-label` on the ticker. Give every hover action a keyboard path. | Correct landmarks for screen readers | web | S | Med |

## Design language

```text
Foundation: existing shadcn + Tailwind v4 + landing-* tokens (no new kit)
Look: dark B2B ops SaaS, product-first, calm. One vermilion action per viewport
Type: Plus Jakarta (display) + Inter (body) + Noto Sans Bengali; one coloured accent phrase per h1/h2
Icons: Lucide
Motion: CSS scroll-driven reveals + one hero entrance + one live ticker; Framer only for tabs/layoutId
UX reference: Micro-Task landing structure; 21st.dev hero/feature-tab/pricing layouts
UI reference: WCAG 2.2, NN/g heuristics, DESIGN.md tokens
```

## Keep / change

| Element | Keep / Modify / Remove | Reason |
|---------|------------------------|--------|
| Dark `#0c0118` canvas + vermilion CTA | Keep | Binding brand rule, and it already reads well |
| `MarketingNav` pill + `MobileStickyCta` | Keep | Same pattern as Micro-Task; works on mobile |
| ISP-native copy (TrxID, PPPoE, POP, ৳) | Keep | The strongest differentiator |
| Hero stock photo card + feature pills | Remove | Decoration, not product |
| `ProductPreview` tabs | Modify → modules tour | One place for "what it does" |
| `RoiSection` | Modify → inside Pricing | It's a pricing argument |
| `ContactSection` form on landing | Remove → `/contact` | That route already exists |
| `Testimonials` / `PartnersLogos` / `CaseStudy` | Hide until real | Placeholder proof is worse than none |
| `DesirePinSection` (GSAP pin) | Remove | Duplicates features and costs a whole library |

## References

| Source | Means (plain language) | Use here | Link |
|--------|------------------------|----------|------|
| Micro-Task landing (sibling repo) | Your own shipped reference | Hero stage, `Reveal`, `ProofStrip` thresholds, `SectionTitle`, journey, brief rules (`docs/DESIGN_BRIEF.md` v4/v14) | `../Micro-Task-job/src/features/landing/` |
| 21st.dev | Modern web UI/UX components | Hero-with-product-shot, feature tabs, pricing table layouts. Rebuild with existing tokens, don't install | https://21st.dev/ |
| Stripe Billing | Same job (billing SaaS) | Product-first hero, one CTA, calm proof | https://stripe.com/billing |
| WCAG 2.2 quickref | Accessibility checklist | Landmarks, contrast on `white/40` text, keyboard | https://www.w3.org/WAI/WCAG22/quickref/ |
| NN/g heuristics | Usability sanity pass | Consistency (contradicting numbers), minimalist design (28 sections) | https://www.nngroup.com/articles/ten-usability-heuristics/ |

## Terms

- **Scroll-driven animation:** CSS animation tied to scroll position (`animation-timeline: view()`). It runs without JS and content is visible if unsupported.
- **Hydration:** the moment React's JS takes over server HTML. Anything hidden until then is blank on slow devices.
- **Signature element:** one recurring visual that carries the brand's main promise.
- **Landmark:** a page region (`main`, `nav`) that screen readers jump between.
