# Design brief: Platform dashboard

1. Product and job: Super-admins monitoring tenants/MRR/tickets; job is "see health, open the right tenant or ticket"
2. Design read: ops overview for platform operators, language exact and dense, leaning shadcn + ISP portal tokens
3. References: Admin dashboard action queue (this app); Linear Insights density; Stripe Atlas ops strip (summary before chart)
4. Existing system: Satoshi, `#f75803` primary, PlatformPageHeader, StatCard optional, Recharts
5. Type: Satoshi body 14px, page title ~24–28px
6. Color: dominant card/background, muted neutrals, one primary accent; emerald only for growth semantic
7. Shape: 12px cards/controls; separation by space/tint before heavy borders
8. Spacing: 8px rhythm; summary strip then chart
9. Motion: none required; CSS hover on links only; reduced motion N/A for portals
10. Signature: summary strip (tenants · MRR · tickets) then revenue trend — not 4 equal KPI tiles
11. Conventions: web table/chart density; keyboard-focusable Create Tenant
12. Deliberately not: 4 equal StatCards, rainbow status hues, Framer stagger, decorative glows
