# Design brief: Admin WhatsApp (inbox, templates, campaigns, opt-ins, log)

1. Product and job: ops messaging subscribers on WhatsApp; the job is "triage inbox, send template/campaign, check delivery"
2. Design read: compose + log density; calm portal language; shadcn + ISP tokens
3. References: admin SMS brief/pages in this app; Stripe messaging logs; Intercom inbox; Linear Issues queue
4. Existing system to honor: Satoshi, PageHero/PageContent, shadcn forms/tables, StatusBadge, primary `#f75803`
5. Type: Satoshi, ratio 1.25, body 14–16px; mono/tabular for phone numbers and message IDs
6. Color: muted + primary send CTA; semantic emerald/amber/rose only for delivered/pending/failed — no rainbow KPI tiles
7. Shape: inbox thread or form + recipient list + log table — no decorative gateway tiles
8. Spacing and density: 8px grid; strip/counts then compose or table
9. Motion: CSS hover only (portals); no Framer
10. Signature: opt-ins · queued · failed strip (or recipient count + parts estimate near send)
11. Platform conventions: single h1; loading/empty/error for logs; preview before send; ConfirmDialog for campaign delete
12. Deliberately not doing: equal icon KPI cards, rainbow channel tiles, Framer stagger, decorative chat bubbles chrome
