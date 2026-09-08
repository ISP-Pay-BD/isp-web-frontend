# Design brief: ISP Engines suite

1. Product and job: ISP admin/platform operators configure and run automation, provisioning, NOC, billing, and SaaS engines; the job is "open a group, pick a feature, run or toggle it, see records and logs"
2. Design read: dense operational hub for professional daily users, language exact ISP ops, leaning existing shadcn portal + ISP tokens (not marketing dark)
3. References: this app's Work Orders (`/admin/jobs`) for table + PageHeader density; Backup (`/admin/backup`) for status badges + toast actions; Developers (`/admin/developers`) for multi-section ops shells
4. Existing system to honor: Satoshi portal font, shadcn Card/Badge/Button/Tabs/Switch, PageHeader, StatCard, EmptyState, PageSkeleton, Sonner toasts, mockFetch domain `engines`
5. Type: Satoshi (portal) body 14px table / 16px titles, ratio ~1.25; no second display face on portals
6. Color: dominant card surface, neutral muted ramp, accent brand orange via primary token, semantic success/warn/destructive only via Badge variants
7. Shape: controls rounded-md, containers rounded-lg / StatCard rounded-xl only; elevation via border + muted tint, one soft shadow max on stats
8. Spacing and density: 8px grid, dense — operators scan many features via horizontal tabs
9. Motion: one moment = tab content swap (instant); feedback = button press + toast (duration-200); reduced motion = no extra motion added
10. Signature: feature tab strip + action chip row + live local execution log in mono
11. Platform conventions: web URLs per group hub, keyboard focus on controls, hover on cards/index links; customer/employee get thinner slices not full builder
12. Deliberately not doing: no KPI glow, no Framer Motion on portals, no per-feature route explosion, no second UI library; breaking "no cards" only where interaction containers need them (records + builders)
