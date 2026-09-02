# Parallel Worktree Plan — 10 Agents

> **Purpose:** Run **10 isolated git worktrees** so 10 agents can complete the full ISP Pay BD frontend in parallel without colliding.

**Created:** Sep 2026  
**Base:** `main` @ current HEAD  
**Root:** `.worktrees/` (gitignored)

---

## How to use

1. Open Cursor on **one worktree folder** (not the main repo).
2. Read that worktree’s **`AGENT-TASK.md`** first.
3. Follow skill **`isp-pay-bd`** + `docs/REFERENCE-MAP.md` + PHP views.
4. Stay inside your **OWN paths** listed below — do not edit other agents’ folders.
5. When done: `pnpm lint && pnpm typecheck && pnpm test && pnpm build` in your worktree.
6. Open a PR from your branch → `test` (never push force to `main`).

---

## Worktree map (10 agents)

| # | Folder | Branch | Focus | Screens ~ |
|---|--------|--------|-------|-----------|
| 01 | `.worktrees/wt01-marketing-landing-a` | `wt/01-marketing-landing-a` | Landing sections 1–14 | 14 sections |
| 02 | `.worktrees/wt02-marketing-landing-b` | `wt/02-marketing-landing-b` | Landing 15–28 + marketing routes | 14 + 5 routes |
| 03 | `.worktrees/wt03-auth-permissions` | `wt/03-auth-permissions` | Login, forgot, 403, guards, user-access UI | Phase 2 |
| 04 | `.worktrees/wt04-customer-portal` | `wt/04-customer-portal` | Full customer portal | ~15 |
| 05 | `.worktrees/wt05-admin-ops` | `wt/05-admin-ops` | Dashboard, customers, packages, areas, payments | ~20 |
| 06 | `.worktrees/wt06-admin-hr-finance` | `wt/06-admin-hr-finance` | HR, accounting, wallet, reports, purchase | ~20 |
| 07 | `.worktrees/wt07-admin-network` | `wt/07-admin-network` | Routers, OLT, bandwidth, hotspot, network, IP | ~15 |
| 08 | `.worktrees/wt08-admin-comms` | `wt/08-admin-comms` | SMS, WhatsApp, support, rewards, settings, recycle | ~15 |
| 09 | `.worktrees/wt09-platform` | `wt/09-platform` | Platform super-admin (all) | ~13 |
| 10 | `.worktrees/wt10-employee-polish` | `wt/10-employee-polish` | Employee portal + global polish + inventory | ~8 + polish |

**Absolute path prefix:**

```
C:\Users\SHOHAN\Documents\GitHub\isp-web-frontend\.worktrees\
```

---

## Can all 10 agents code at once?

**Almost — but use 2 waves.** Foundation is already shared in every worktree (`format`, `constants`, `theme`, `i18n`, structure map). Agents do **not** wait for each other to invent helpers.

### Wave A — start immediately (parallel, no wait)

| Agents | Why independent |
|--------|-----------------|
| **WT01 + WT02** | Marketing only — shared layout already exists |
| **WT03** | Auth/403 — can start with existing AppShell + nav |
| **WT05–WT09** | Admin/platform **screens** — can build feature UI now using mock data |

### Wave B — start after WT03 login works (or in parallel with stubs)

| Agents | Why slight dependency |
|--------|------------------------|
| **WT04** Customer | Needs login redirect / session — can stub with auth-store demo user until WT03 merges |
| **WT10** Polish | **Last** — merges after others; fills shared gaps |

### Practical rule

```
YES — 01, 02, 03, 05, 06, 07, 08, 09  can code NOW in parallel
YES — 04 can code NOW if it uses existing auth-store demo login
NO  — 10 should wait until most PRs exist (polish last)
```

They are **independent for coding** as long as each stays in **owned paths**.  
They are **dependent for merge order** (see below) so `main`/`test` stays green.

---

## Conflict zones (DO NOT edit in parallel)

Only **wt10** may touch these at the end, OR coordinate serial merges:

| Path | Owner |
|------|-------|
| `src/components/shared/` | wt10 (or serial) — others **use** existing shared only |
| `src/lib/format/`, `src/lib/constants/`, `src/i18n/` | **Frozen foundation** — do not rewrite; ask if missing helper |
| `src/app/globals.css` | Prefer wt01/wt02 for landing tokens only |
| `src/config/navigation/` | wt03 owns filters; others only document new hrefs |
| `package.json` | One agent at a time — prefer wt10 |
| `src/lib/mock-api/handlers/data.handler.ts` | Each agent adds **own keys only**; merge carefully |

---

## Merge order (recommended)

```
wt01 + wt02  →  marketing PR
wt03         →  auth PR
wt04         →  customer PR (after wt03 preferred)
wt05–wt08    →  admin PRs (parallel merges OK after wt03)
wt09         →  platform PR
wt10         →  employee + polish LAST
```

---

## Foundation already in every worktree

Do **not** reinvent these — import them:

| Need | Import |
|------|--------|
| ৳ / date / phone / MAC | `@/lib/format` |
| Status enums | `@/lib/constants` |
| Tenant colors | `@/config/theme` |
| EN/BN strings | `@/i18n` |
| Where is X? | `docs/PROJECT-STRUCTURE-MAP.md` |

---

## Per-agent checklist (all)

- [ ] Read `AGENT-TASK.md` in worktree root
- [ ] Read `docs/PROJECT-STRUCTURE-MAP.md` + `docs/REFERENCE-MAP.md`
- [ ] Build UI in `src/features/...` only (owned modules)
- [ ] Add/extend `src/data/` for owned modules
- [ ] Wire mock-api handlers for owned keys
- [ ] Thin `src/app/.../page.tsx` routes
- [ ] Pass `docs/DEFINITION-OF-DONE.md`
- [ ] Update `docs/07-SCREEN-INVENTORY.md` for owned screens only
- [ ] Verify: `pnpm lint && pnpm typecheck && pnpm test && pnpm build`

---

## List worktrees

```bash
git worktree list
```

## Remove a worktree (when done)

```bash
git worktree remove .worktrees/wt01-marketing-landing-a
git branch -d wt/01-marketing-landing-a
```
