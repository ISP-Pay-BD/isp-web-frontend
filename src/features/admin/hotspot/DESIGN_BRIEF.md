# Design brief: Admin hotspot (dashboard, users, packages, reports)

1. Product and job: ISP admin running Wi-Fi hotspot; the job is "sell vouchers/packages, see active users, check take"
2. Design read: dense retail ops; hub then lists; language calm and exact; shadcn + ISP portal tokens
3. References: bandwidth hub/lists in this app; Areas strip; Stripe catalog + payouts overview
4. Existing system to honor: Satoshi, PageHero/PageContent, Card table shells, EmptyState, PageSkeleton, primary `#f75803`
5. Type: Satoshi, ratio 1.25, body 14–16px; tabular-nums for ৳, Mbps, and session counts
6. Color: muted ramp; semantic emerald/amber/rose only for active/expired/blocked — no rainbow KPI tiles
7. Shape: rounded-xl table cards; hub as destination list (not colorful quick-link tiles)
8. Spacing and density: 8px grid; summary strip then toolbar+table
9. Motion: CSS hover only (portals); no Framer
10. Signature: active users · vouchers sold · today ৳… strip above hub or roster
11. Platform conventions: single h1; keyboard-reachable rows; ConfirmDialog for deletes/revokes
12. Deliberately not doing: 4 equal KPI icon cards, scale-on-hover package tiles, rainbow status chips, Framer stagger
