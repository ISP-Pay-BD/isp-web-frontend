# Design brief: Admin bandwidth buy/sell

1. Product and job: procure upstream Mbps and bill sell clients
2. Design read: capacity + money strip, then hub links or tables
3. References: Areas strip; Stripe catalog
4. Existing system: Satoshi, PageHeader, zapi `/v1/bandwidth/*` via hooks/useBandwidth*.ts
5. Type: Satoshi; tabular-nums for Mbps and ৳
6. Color: muted; semantic pending bills only
7. Shape: summary strip + list of destinations (not rainbow quick-link cards)
8. Spacing: dense
9. Motion: CSS hover only
10. Signature: providers · this month's purchases · bills due · outstanding (all from API totals)
11. Conventions: hubs link to list pages
12. Not doing: 4 equal colorful link cards with scale icons
