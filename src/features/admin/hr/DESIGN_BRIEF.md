# Design brief: Admin HR (staff, attendance, payroll)

1. Product and job: ISP admin managing field + office staff; the job is "find a person, adjust roster/pay, move on"
2. Design read: dense HR ops lists for daily payroll users; language calm and exact; shadcn + ISP portal tokens
3. References: Areas/COA summary strips in this app; Linear people lists; Stripe payouts overview (one strip + table)
4. Existing system to honor: Satoshi, PageHero/PageContent, Card table shells, EmptyState, PageSkeleton, primary `#f75803`
5. Type: Satoshi, ratio 1.25, body 14–16px; tabular-nums for ৳ and counts
6. Color: muted ramp for avatars/roles; semantic emerald/amber/rose only for attendance/advance status — no rainbow KPI tiles
7. Shape: rounded-xl table cards; muted avatars (no scale-on-hover)
8. Spacing and density: 8px grid; summary strip then toolbar+table
9. Motion: CSS hover only (portals); no Framer
10. Signature: border-y summary strip (`N staff · payroll ৳…`) above the roster table
11. Platform conventions: single h1; keyboard-reachable rows; ConfirmDialog for deletes
12. Deliberately not doing: 4 equal KPI icon cards, group-hover scale avatars, rainbow role chips, Framer stagger
