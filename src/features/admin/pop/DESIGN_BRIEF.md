# Design brief: Admin POP (funding, transactions, resellers + pop-packages)

1. Product and job: ISP admin funding POP/resellers; the job is "top up a POP, audit ledger, assign packages"
2. Design read: money-first ops density; calm language; shadcn + ISP portal tokens
3. References: wallet/customer-payments strips in this app; Stripe Connect balances; Linear payouts-style lists
4. Existing system to honor: Satoshi, PageHero/PageContent, Card table shells, EmptyState, PageSkeleton, primary `#f75803`
5. Type: Satoshi, ratio 1.25, body 14–16px; tabular-nums for ৳ and package counts
6. Color: muted ramp; semantic emerald/rose only for credit/debit or funded/failed — no rainbow KPI tiles
7. Shape: rounded-xl table cards; package assignment as table/dialog interaction, not colorful tiles
8. Spacing and density: 8px grid; balance strip then toolbar+table (pop-packages same rhythm)
9. Motion: CSS hover only (portals); no Framer
10. Signature: POP balance · today funded ৳… · open txns strip above the ledger
11. Platform conventions: single h1; keyboard-reachable rows; ConfirmDialog for funding voids; pop-packages inherit this brief
12. Deliberately not doing: 4 equal KPI icon cards, rainbow reseller chips, Framer stagger, decorative wallet chrome
