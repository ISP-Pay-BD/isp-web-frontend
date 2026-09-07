# Design brief: Admin accounting (COA, journals, incomes/expenses, reports)

1. Product and job: ISP admin reconciling books; the job is "post entries, see cash position, export a report"
2. Design read: dense ledger ops for daily bookkeepers; language calm and exact; shadcn + ISP portal tokens
3. References: Areas/HR summary strips in this app; Stripe balance overview; Linear finance-adjacent tables
4. Existing system to honor: Satoshi, PageHero/PageContent, Card table shells, EmptyState, PageSkeleton, primary `#f75803`
5. Type: Satoshi, ratio 1.25, body 14–16px; tabular-nums for ৳ and account codes
6. Color: muted ramp; semantic emerald/rose only for credit/debit or income/expense — no rainbow KPI tiles
7. Shape: rounded-xl table cards; report filters as toolbar, not decorative tiles
8. Spacing and density: 8px grid; summary strip then toolbar+table (or statement layout)
9. Motion: CSS hover only (portals); no Framer
10. Signature: period totals strip (`incomes ৳… · expenses ৳… · net ৳…`) above the ledger
11. Platform conventions: single h1; keyboard-reachable rows; ConfirmDialog for voids/deletes
12. Deliberately not doing: 4 equal KPI icon cards, rainbow account-type chips, Framer stagger, fake chart chrome
