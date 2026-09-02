# ISP Pay BD — Frontend Documentation Index

> **Purpose:** Complete specification for building the Next.js frontend (`isp-web-frontend`) as a **fully offline, static-data UI** that mirrors the legacy PHP app (`isppaybd_isp`). Backend API integration comes later.

## How AI agents should use these docs

1. Read **`PROJECT-MEMORY.md`** — instant context (every session).
2. Read **`13-STRICT-AGENT-MANDATE.md`** — non-negotiable rules.
3. Read **`QUALITY-STANDARDS.md`** — premium ISP quality bar (NOT generic CRM).
4. Read **`UI-FUSION-GUIDE.md`** — ISP + shadcn + 21st.dev UI rules.
5. Read **`MASTER-BUILD-PLAN.md`** — complete plan + current phase gate.
6. Read **`DEFINITION-OF-DONE.md`** — per-screen checklist before marking done.
7. Read **`12-AI-CODING-RULES.md`** — mandatory coding rules.
8. Check **`PRE-PHASE-AUDIT.md`** — readiness gaps.
9. Follow **`08-IMPLEMENTATION-PHASES.md`** in order.
10. For each screen: **`07-SCREEN-INVENTORY.md`** + PHP reference in `isppaybd_isp`.

## Document map

| Doc | Title | Use when |
|-----|-------|----------|
| [**PROJECT-MEMORY.md**](./PROJECT-MEMORY.md) | **AI quick context** | **Every session start** |
| [**13-STRICT-AGENT-MANDATE.md**](./13-STRICT-AGENT-MANDATE.md) | **Non-negotiable rules** | **Every session start** |
| [**QUALITY-STANDARDS.md**](./QUALITY-STANDARDS.md) | **Premium quality bar** | **Before any UI work** |
| [**MASTER-BUILD-PLAN.md**](./MASTER-BUILD-PLAN.md) | **Complete build plan** | **Phase planning + coding** |
| [**DEFINITION-OF-DONE.md**](./DEFINITION-OF-DONE.md) | **Per-screen checklist** | **Before marking done** |
| [**UI-FUSION-GUIDE.md**](./UI-FUSION-GUIDE.md) | ISP + shadcn + 21st.dev | Before any UI work |
| [**P0-READY.md**](./P0-READY.md) | **P0 complete — start Phase 1** | **Before landing code** |
| [**FOLDER-STRUCTURE-COMPLETE.md**](./FOLDER-STRUCTURE-COMPLETE.md) | Rating + full tree | Before coding any module |
| [00-OVERVIEW.md](./00-OVERVIEW.md) | Project overview | Starting the project |
| [01-ARCHITECTURE.md](./01-ARCHITECTURE.md) | System architecture | Structuring code |
| [02-FOLDER-STRUCTURE.md](./02-FOLDER-STRUCTURE.md) | Folder layout | Creating files |
| [03-TECH-STACK.md](./03-TECH-STACK.md) | Libraries & tools | Installing deps |
| [04-DESIGN-SYSTEM.md](./04-DESIGN-SYSTEM.md) | Brand & UI tokens | Styling |
| [05-PERMISSIONS-AND-ROLES.md](./05-PERMISSIONS-AND-ROLES.md) | Roles & permissions | Auth & nav |
| [06-MOCK-DATA-SPEC.md](./06-MOCK-DATA-SPEC.md) | Static data spec | Mock layer |
| [07-SCREEN-INVENTORY.md](./07-SCREEN-INVENTORY.md) | Every screen & route | Building pages |
| [08-IMPLEMENTATION-PHASES.md](./08-IMPLEMENTATION-PHASES.md) | Build order & checklist | Sprint planning |
| [09-COMPONENTS-AND-PATTERNS.md](./09-COMPONENTS-AND-PATTERNS.md) | Shared components | Reuse patterns |
| [10-RESPONSIVE-AND-MOBILE.md](./10-RESPONSIVE-AND-MOBILE.md) | Responsive UX | Mobile layouts |
| [11-I18N.md](./11-I18N.md) | English + Bengali | Copy & locale |
| [12-AI-CODING-RULES.md](./12-AI-CODING-RULES.md) | AI agent rules | Every coding session |
| [13-STRICT-AGENT-MANDATE.md](./13-STRICT-AGENT-MANDATE.md) | Non-negotiable mandate | Every session |

## Reference backend (read-only)

| Resource | Path in `isppaybd_isp` |
|----------|------------------------|
| Sidebar / menu map | `app/Views/layout/sidebar.php` |
| Platform sidebar | `app/Views/layout/_sidebar_platform.php` |
| Permission matrix | `app/Views/access/partial/default-access-fields.php` |
| Landing sections | `app/Views/landing/partials/*.php` |
| Landing CSS | `public/assets/css/landing/landing.css` |
| Landing JS | `public/assets/js/landing/landing.js` |
| Portal tokens | `public/assets/css/saas/tokens.css` |
| API catalog (future) | `zapi/Documentation/ENDPOINT_CATALOG.md` |

## Root files

- **`AGENTS.md`** — session start + stack + UI fusion for all contributors and AI
- **`.cursor/rules/isp-frontend.mdc`** — Cursor rule loaded automatically

## Current phase

**P0 ✅ complete. Ready for Phase 1 — 28 landing sections.**

Run `pnpm dev` and open `/` to see dark marketing shell with hero preview.

### Done ✅

- [x] Next.js 16 + shadcn + deps via CLI
- [x] 84 feature modules scaffolded
- [x] `src/data/` + mock-api + auth + permissions foundation
- [x] Vitest + architecture tests
- [x] UI fusion docs + project memory updated
- [x] `pnpm build` passes

### P0 — before Phase 1 landing ⏳

- [ ] Port landing CSS tokens to Tailwind/globals
- [ ] Self-host fonts (Plus Jakarta Sans, Inter, Satoshi, Noto Bengali)
- [ ] Full marketing data (pricing tiers + PAYG calculator)
- [ ] `MarketingLayout` (nav + footer)
- [ ] `next-intl` EN/BN setup

### P0.5 — parallel ⏳

- [ ] Full sidebar navigation + permission filter
- [ ] User Access Management UI (static)
- [ ] Expired user limited nav

**Next:** Phase 1 — marketing landing (see `08-IMPLEMENTATION-PHASES.md`)
