# Design brief: Admin reports (BTRC, OTC, exportable ops reports)

1. Product and job: ISP admin producing compliance/ops reports; the job is "pick range, preview rows, export"
2. Design read: filter-first then dense table; calm exact language; shadcn + ISP portal tokens
3. References: accounting reports pages in this app; Stripe reporting exports; Linear CSV/export density
4. Existing system to honor: Satoshi, PageHero/PageContent, DataTable, EmptyState, PageSkeleton, primary `#f75803`
5. Type: Satoshi, ratio 1.25, body 14–16px; tabular-nums for ৳, counts, and ID columns
6. Color: muted ramp; primary only on export/run CTA — no rainbow KPI tiles
7. Shape: filter toolbar + rounded-xl result table; no decorative chart-first chrome unless report needs one chart
8. Spacing and density: 8px grid; period/meta strip then filters+table
9. Motion: CSS hover only (portals); no Framer
10. Signature: period · row count · totals ৳… strip above the result table
11. Platform conventions: single h1; loading/empty/error shaped like table; keyboard-reachable export actions
12. Deliberately not doing: 4 equal KPI icon cards, rainbow report-type tiles, Framer stagger, fake dashboard chrome
