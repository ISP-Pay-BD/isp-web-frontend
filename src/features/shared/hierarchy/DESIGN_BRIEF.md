# Design brief: Org hierarchy explorer

1. Product and job: Super admin / tenant admin / POP reseller seeing who sits under whom; job is "see Super Admin → Admin → Reseller → Customer with counts"
2. Design read: ops hierarchy for ISP portals, language exact, leaning shadcn + React Flow graph
3. References: PHP reseller hierarchy marketing partial (structure only); React Flow org examples; Linear project graph (pan/zoom); existing admin POP list density
4. Existing system to honor: Satoshi, PageHeader, Card, Tabs, Badge, primary `#f75803`, mockFetch only
5. Type: Satoshi 14–16px; mono for counts/IDs
6. Color: card surface + muted; accent primary; role tints: platform violet `#1a0b38`, admin primary, reseller sky, customer muted
7. Shape: rounded-xl nodes, lg controls; graph canvas bordered card
8. Spacing and density: dense table + airy graph canvas (min-h 520)
9. Motion: React Flow pan/zoom only (library); no Framer in portals
10. Signature: Graph | Table toggle + role-colored hierarchy nodes with descendant counts
11. Platform conventions: `/platform/hierarchy`, `/admin/hierarchy`; scoped by role; keyboard zoom via Controls
12. Deliberately not doing: 3D globes, force-directed chaos, inventing nodes outside mock tenants/POPs/customers
