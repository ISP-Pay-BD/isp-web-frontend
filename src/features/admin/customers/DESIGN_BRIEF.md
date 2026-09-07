# Design brief: Admin customer directory

1. Product and job: ISP admins find and act on subscribers; job is "find the right customer, then open or collect"
2. Design read: dense operational list for daily users, language calm and exact, leaning shadcn + ISP portal tokens
3. References: this app’s rebuilt admin dashboard summary strip; Linear Issues list (title + filters + rows); Stripe Customers table density
4. Existing system to honor: PageHeader, StatusBadge, Can, EmptyState, PageSkeleton, Satoshi, primary orange
5. Type: Satoshi, ratio 1.25, body 14px
6. Color: card/background tokens, accent primary; semantic success/warning/error/neutral only via StatusBadge
7. Shape: rounded-lg controls, rounded-xl containers; space/tint before borders
8. Spacing and density: 8px grid, dense
9. Motion: none beyond CSS hover; reduced motion N/A
10. Signature: summary strip (count · online · expired · due) above filters/table, not KPI tiles
11. Platform conventions: filters local for now; keyboard reachable row actions
12. Deliberately not doing: 4 equal StatCards, rainbow trend chips, Framer stagger
