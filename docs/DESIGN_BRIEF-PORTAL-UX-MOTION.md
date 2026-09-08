# Portal UX motion — DESIGN BRIEF (premium-ui)

1. Screen: Portal list hubs + marketing landing — ISP Pay BD operators & prospects.
2. Job: Navigate any portal route with one clear enter moment; scan lists without KPI-tile noise; marketing sections reveal once on scroll.
3. Audience: ISP admins (dense tables), customers/employees (simple tasks), landing visitors (brand-led).
4. Language: Quiet, intentional, Satoshi portals / Plus Jakarta landing — not decorative CRM.
5. Lean: Existing shadcn + ISP tokens (#f75803, #1a0b38, #0c0118). Portals CSS-only; marketing Framer + useMotionSafe.
6. Structure adapted from: AllCustomersPage summary strip, JobsPage strip+table, Linear list density, Stripe dashboard restraint, HeroSection motion.
7. States: Loading = PageSkeleton shaped like tables; empty = EmptyState + one action; error = retry; success = toast; route change = ui-page-enter once.
8. Motion: One page-enter (280ms fade-up) per pathname via PortalPageMotion; button/table row duration-200; marketing Reveal whileInView once; prefers-reduced-motion kills both.
9. Forbidden: Framer on portals; 4 equal StatCards; stagger row animations; ambient glows; motion spam.
10. Type: Satoshi (portals) / Plus Jakarta + Inter landing — docs/FONTS.md.
11. Radius: rounded-lg strip, rounded-xl cards — match globals.
12. Out of scope: Phase 8 API; redesigning every form field; new dependencies.
