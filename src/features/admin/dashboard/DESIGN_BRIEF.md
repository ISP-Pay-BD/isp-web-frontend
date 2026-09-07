# Design brief: Admin operations dashboard

1. Product and job: ISP admin on daily shift; the job is "see what needs me now, then open it"
2. Design read: dense operational dashboard for professional daily users, language calm and exact, leaning shadcn + ISP portal tokens
3. References: existing Admin Customers list density in this app; Linear Issues home (action-first queue); Stripe Dashboard overview (one primary metric + supporting lists)
4. Existing system to honor: Satoshi, shadcn Card/Button/Badge, PageHeader, EmptyState, PageSkeleton, primary `#f75803`, sidebar `#1a0b38`
5. Type: Satoshi body/display, ratio 1.25, body 14–16px
6. Color: dominant card/background tokens, neutral muted ramp, accent primary orange; semantic set success/warning/error/info only
7. Shape: controls rounded-lg, containers rounded-xl, pills full; separation by muted tint before borders
8. Spacing and density: 8px grid, dense; operators scan, they do not read essays
9. Motion: none on this page (portals CSS hover only); reduced motion N/A beyond that
10. Signature: "Needs attention" queue with ৳ amounts and expired counts as the first content block
11. Platform conventions: links carry intent to filtered lists; keyboard-reachable rows; single h1 via PageHeader
12. Deliberately not doing: 4 equal KPI tiles, grouped/sections toggle, SpotlightCard decoration, rainbow status hues, staggered Framer entrance, geo search widget unless asked
