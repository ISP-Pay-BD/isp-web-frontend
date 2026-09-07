# Design brief: Customer portal shared (profile, packages, subscription, support, news, router, rewards, password)

1. Product and job: residential/business subscriber self-serving account; the job is "see plan, change Wi-Fi, open a ticket, update profile"
2. Design read: calm self-service; plan/status first; ISP portal tokens; CustomerPageShell density
3. References: customer dashboard & payments briefs (override when present); Stripe customer portal; Linear settings density
4. Existing system to honor: CustomerPageShell, Satoshi, shadcn Card/forms/tables, StatusBadge, primary `#f75803`
5. Type: Satoshi, ratio 1.25, body 14–16px; tabular-nums for ৳ and device counts; avoid font-black shouting
6. Color: primary for pay/upgrade CTAs; emerald only for online/healthy; muted secondary — no rainbow KPI borders
7. Shape: one composition or strip then forms/lists; tickets as conversation thread; no decorative lift tiles
8. Spacing and density: readable on mobile; 8px grid; strip then content
9. Motion: CSS only; no Framer; no icon scale on hover
10. Signature: plan/status or next-bill strip where money/connection applies; otherwise quiet page header
11. Platform conventions: single h1; clear pay/support paths; dashboard + payments module briefs override this catch-all
12. Deliberately not doing: 4 equal KPI cards with accent bars, purple plan glow, Framer stagger, ping decorations
