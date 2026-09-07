# Design brief: Admin inventory (items, stock, locations, categories — purchase sibling)

1. Product and job: ISP admin tracking CPE/stock and vendors; the job is "find an item, adjust qty/location, record a purchase"
2. Design read: dense warehouse ops; language calm and exact; shadcn + ISP portal tokens
3. References: Areas/HR strips in this app; Stripe catalog inventory; Linear project lists
4. Existing system to honor: Satoshi, PageHero/PageContent, Card table shells, EmptyState, PageSkeleton, primary `#f75803`
5. Type: Satoshi, ratio 1.25, body 14–16px; tabular-nums for SKU qty and ৳ cost
6. Color: muted ramp; semantic amber/rose only for low/out-of-stock — no rainbow KPI tiles
7. Shape: rounded-xl table cards; purchase/vendors pages inherit this strip+table pattern
8. Spacing and density: 8px grid; summary strip then toolbar+table
9. Motion: CSS hover only (portals); no Framer
10. Signature: SKUs · low stock · locations strip (`N items · low · on-hand`) above the roster
11. Platform conventions: single h1; keyboard-reachable rows; ConfirmDialog for deletes; purchase under `admin/purchase` follows this brief
12. Deliberately not doing: 4 equal KPI icon cards, scale-on-hover product tiles, rainbow category chips, Framer stagger
