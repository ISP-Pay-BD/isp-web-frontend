# Design brief: Marketing landing hero

1. Product and job: ISP owners evaluating ISP Pay BD; the job is "understand we run billing + MikroTik + bKash in one console, then start trial"
2. Design read: marketing hero for Bangladesh ISP operators, language calm and exact, leaning ISP landing tokens + PHP hero parity
3. References: PHP `isppaybd_isp/app/Views/landing/partials/hero.php` (badge, title, accent line, CTAs, trust); Stripe homepage hero (first-viewport budget); Linear marketing (type hierarchy, one accent)
4. Existing system to honor: `#0c0118` / `#f75803` / `#2E8BFF`, Plus Jakarta display + Inter body, MarketingNav, landing tokens in globals.css
5. Type: Plus Jakarta Sans display + Inter body, ratio ~1.333, body 16–18px
6. Color: dominant `#0c0118`, neutral white/opacity ramp, accent `#f75803` only; semantic emerald for trust checks only
7. Shape: controls 12px, containers 12–16px, pills full; separation by space/tint, one soft panel border
8. Spacing and density: 8px grid, balanced; first viewport must breathe
9. Motion: one hero text fade-up (200–350ms easeOutExpo); no ambient orbs, dots, or ping; reduced motion = static
10. Signature: brand-level title "ISP Pay BD" is not required in H1 if product name is in nav; console product panel is the visual signature
11. Platform conventions: web anchor `#auto-reconcile` for secondary CTA; keyboard-focusable CTAs
12. Deliberately not doing: rainbow orbital timeline, floating dots, hero KPI strip, multi-gradient headline, MorphArrow magnetic CTA, purple glow beams; breaking "no fake product UI" once with a restrained console panel because PHP parity and ProductPreview already use this pattern
