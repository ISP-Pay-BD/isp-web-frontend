# Design brief: ISP ops catalog (§I + stretch shells)

1. Product and job: Bangladesh ISP admins/employees/platform ops running daily network, billing, and field work; the job is "find the record, act, confirm"
2. Design read: dense operational list/detail for daily professionals; calm exact language; leaning existing portal shadcn + ISP tokens
3. References: Customer Payments strip+table (this app); Support tickets list (this app); All Customers identity+status columns (this app); Stripe payouts density; Linear issues status column
4. Existing system to honor: Satoshi, PageHeader, DataTable, PageSkeleton, EmptyState, StatusBadge, Can, primary `#f75803` / sidebar `#1a0b38`, mockFetch via `useIspOps` / portal domains
5. Type: Satoshi display+body, ratio 1.25, body 14–16px; tabular-nums for ৳, Mbps, IPs, counts
6. Color: dominant muted surface; neutral ramp; accent primary orange only; semantic emerald/amber/rose for real status — nothing else
7. Shape: controls rounded-md, containers rounded-xl; elevation via border-border/60 + ring-foreground/5, not stacked shadows
8. Spacing and density: 8px grid, dense; strip then toolbar+table (or single composition for receipt/captive)
9. Motion: CSS hover/focus only (portals); one quiet header→content settle via existing skeleton; reduced motion = instant
10. Signature: count/money strip under title (`N open · ৳ due`) or thermal receipt mono block / captive pay card — never four equal KPI icon tiles
11. Platform conventions: URL for detail ids; keyboard-reachable rows; Sonner on mock mutations; marketing surfaces keep ISP dark `#0c0118`
12. Deliberately not doing: KPI tile grids, Framer in portals, decorative gradients/glows on admin, rainbow status hues, inventing APIs beyond mock; breaking one-accent only for MFS brand dots already used in payments
