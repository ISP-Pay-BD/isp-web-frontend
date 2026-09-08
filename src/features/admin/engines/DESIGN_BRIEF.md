# Design brief: ISP Engines suite

1. Product and job: ISP admin/platform operators open an engine hub, pick a feature, run/toggle it, scan records and logs
2. Design read: dense operational directory + hub for professional daily users, language exact ISP ops, leaning shadcn portal + ISP tokens
3. References: this app’s All Customers list (summary strip + dense table); Work Orders; Backup status table — adapted structure, not cloned look
4. Existing system to honor: Satoshi, PageHeader, Badge/Button/Tabs/Switch, EmptyState, PageSkeleton, Sonner, mockFetch `engines`
5. Type: Satoshi body 14 / titles 16, ratio ~1.25
6. Color: card surface, muted neutral, primary orange accent, Badge semantic only
7. Shape: controls md, containers lg; separation by border + muted tint (no KPI cards)
8. Spacing and density: 8px grid, dense — customers-list model
9. Motion: page enter `ui-page-enter` (280ms); panel `ui-panel-enter`; press `ui-press`; reduced-motion disables; no Framer on portals
10. Signature: summary strip + feature tab strip + human action verbs + mono execution log
11. Platform conventions: URL per group hub; keyboard/focus rings; customer/employee keep thin slices
12. Deliberately not doing: 4 StatCard KPI openers, icon hub card grids, snake_case action labels, luxury/glow utilities, Framer on portals
