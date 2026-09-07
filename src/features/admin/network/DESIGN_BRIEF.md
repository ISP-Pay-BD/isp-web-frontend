# Design brief: Admin network map/diagram (routers & IP pools reference)

1. Product and job: NOC/admin seeing topology and reachability; the job is "find a node, check status, drill to router/pool"
2. Design read: ops density with map/diagram as the visual plane; calm portal language; shadcn + ISP tokens
3. References: OLT diagnostics/list in this app; Areas strip; Linear issue graph density; Stripe Atlas-style calm maps
4. Existing system to honor: Satoshi, PageHero/PageContent, StatusBadge, DataTable on list siblings, primary `#f75803`
5. Type: Satoshi, ratio 1.25, body 14–16px; tabular-nums for IP counts and latencies
6. Color: muted canvas; semantic emerald/amber/rose only for online/degraded/offline — no rainbow KPI tiles
7. Shape: full-bleed map/diagram surface; side detail as sheet/panel, not floating promo cards
8. Spacing and density: 8px grid; legend + counts strip above canvas; list pages stay table-dense
9. Motion: CSS hover/focus only (portals); no Framer; no ping spam on markers
10. Signature: online · offline · pools-in-use strip near the canvas/toolbar
11. Platform conventions: single h1; keyboard-focusable nodes/rows; routers & ip-pools inherit this brief when linked
12. Deliberately not doing: 4 equal KPI icon cards, group-hover scale markers, decorative gradient fills, Framer stagger
