# Design brief: Admin operations dashboard

1. Product and job: ISP admin on daily shift; the job is "triage collections/expiry/tickets, then scan full ISP ops overview"
2. Design read: dense operational dashboard for professional daily users, language calm and exact, leaning shadcn + ISP portal tokens + PHP `sAdmin.php` section parity
3. References: PHP `app/Views/dashboard/sAdmin.php` (KPI + payment + network + HR + charts + geo + tickets); prior full frontend dashboard (commit `5dcf14e`); Stripe Dashboard density
4. Existing system to honor: Satoshi, shadcn Card/Button/Badge/Progress, PageHeader, StatCard, EmptyState, PageSkeleton, primary `#f75803`
5. Type: Satoshi body/display, ratio 1.25, body 14–16px; mono for ৳ and IPs
6. Color: dominant card/background tokens, neutral muted ramp, accent primary orange; semantic success/warning/error/info only
7. Shape: controls rounded-lg, containers rounded-xl; cards earn their place as interaction containers
8. Spacing and density: 8px grid, dense — full overview, not a sparse three-row page
9. Motion: CSS hover only on portals; no Framer
10. Signature: triage row (payment due / expired / tickets) then full metric sections + charts + live POP sessions + geo + activity
11. Platform conventions: Group Metrics toggle; links to filtered lists; keyboard-reachable cards
12. Deliberately not doing: emptying the page into a single attention list; decorative Framer; inventing widgets not in PHP/mock data
