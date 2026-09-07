# Design brief: Admin catch-all (areas, wallet, recycle-bin, settings, theme-studio, profile, user-access, subscription, payment, customer-payments, rewards, sms-templates, voice-sms, routers, ip-pools, purchase)

1. Product and job: ISP admin finishing remaining console chores; the job is "find the record, change it, confirm"
2. Design read: dense ops lists/forms for daily admins; calm exact language; shadcn + ISP portal tokens
3. References: Areas/HR/support strips in this app; Linear settings/people; Stripe payouts + customer payments overview
4. Existing system to honor: Satoshi, PageHero/PageContent, DataTable, StatusBadge, EmptyState, PageSkeleton, primary `#f75803`
5. Type: Satoshi, ratio 1.25, body 14–16px; tabular-nums for ৳, IPs, and counts
6. Color: muted ramp; semantic emerald/amber/rose only for real status — no rainbow KPI tiles
7. Shape: summary strip + rounded-xl table/form; theme-studio as controlled token panels, not decorative chaos
8. Spacing and density: 8px grid; strip then toolbar+table (or settings sections)
9. Motion: CSS hover only (portals); no Framer
10. Signature: counts/balance strip where lists exist (`N areas · wallet ৳…`); otherwise quiet header + form
11. Platform conventions: single h1; keyboard-reachable rows; ConfirmDialog for deletes; module-specific briefs override this catch-all
12. Deliberately not doing: 4 equal KPI icon cards, group-hover scale avatars/icons, rainbow role chips, Framer stagger
