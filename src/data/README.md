# src/data

Only **marketing site copy** lives here (`marketing/`): landing-page headlines,
section text, testimonials, FAQ and illustrative demo visuals.

Everything else — every admin, customer, employee and super-admin screen, plan
prices, the plugin catalogue, system status — is loaded from the zapi backend
(`src/lib/api`, feature hooks). The old mock API layer and dummy datasets were
removed; `tests/architecture/folder-structure.test.ts` fails if a portal file
imports from `@/data` or anything reintroduces `mock-api` / `mockFetch`.
