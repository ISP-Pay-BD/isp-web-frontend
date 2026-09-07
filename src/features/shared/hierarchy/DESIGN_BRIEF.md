# Design brief: Org hierarchy explorer

1. Product and job: Super admin / tenant admin / POP reseller seeing Super Admin → Admin → Reseller → Customer with counts
2. Design read: dense interactive hierarchy for ISP portals, calm ops language, shadcn + React Flow
3. References: React Flow Controls/MiniMap; Linear project graph (pan/zoom); existing POP list density
4. Existing system: Satoshi, PageHeader, Tabs, Badge, Input, primary `#f75803`
5. Type: Satoshi 14–16px; mono for counts
6. Color: role bars — platform `#1a0b38`, admin primary, reseller sky, customer muted
7. Shape: rounded-xl nodes; graph canvas bordered
8. Spacing: dense toolbar + tall canvas (min ~72vh)
9. Motion: React Flow pan/zoom only; no Framer
10. Signature: Graph|Table + search + TB/LR + expand/collapse + selection detail
11. Routes: `/platform/hierarchy`, `/admin/hierarchy`
12. Not doing: static dead graph, skill docs, stripping counts
