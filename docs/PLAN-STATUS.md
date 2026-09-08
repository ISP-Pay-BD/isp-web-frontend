# Plan Documentation Status

> **Single index:** Is the `.md` plan complete? What phase is next?

Last synced: **2026-09-07**

---

## Plan docs — ✅ COMPLETE

All specification documents are written. No missing plan MD for P0–Phase 8.

| Category | Docs | Status |
|----------|------|--------|
| **Master plan** | `MASTER-BUILD-PLAN.md`, `08-IMPLEMENTATION-PHASES.md`, `07-SCREEN-INVENTORY.md` | ✅ |
| **Quality & rules** | `QUALITY-STANDARDS.md`, `DEFINITION-OF-DONE.md`, `13-STRICT-AGENT-MANDATE.md`, `12-AI-CODING-RULES.md` | ✅ |
| **Design** | `UI-FUSION-GUIDE.md`, `04-DESIGN-SYSTEM.md`, **`FONTS.md`** | ✅ |
| **Reference (old ISP website)** | **`REFERENCE-MAP.md`**, **`UI-REFERENCES-LIBS.md`** | ✅ |
| **Parallel 10 worktrees** | **`PARALLEL-WORKTREE-PLAN.md`** + `.worktrees/*/AGENT-TASK.md` | ✅ |
| **Architecture** | `01-ARCHITECTURE.md`, `02-FOLDER-STRUCTURE.md`, `FOLDER-STRUCTURE-COMPLETE.md`, `03-TECH-STACK.md` | ✅ |
| **Data & permissions** | `06-MOCK-DATA-SPEC.md`, `05-PERMISSIONS-AND-ROLES.md` | ✅ |
| **UX** | `09-COMPONENTS-AND-PATTERNS.md`, `10-RESPONSIVE-AND-MOBILE.md`, `11-I18N.md` | ✅ |
| **Session start** | `PROJECT-MEMORY.md`, `P0-READY.md`, `PRE-PHASE-AUDIT.md`, `docs/README.md`, `AGENTS.md` | ✅ |

**34 files** in `docs/` + root `AGENTS.md` + `.cursor/rules/isp-frontend.mdc`.

---

## Execution status (what the plan says to build next)

| Phase | Plan written? | Built? | Next action |
|-------|---------------|--------|-------------|
| **P0** Foundation | ✅ | ✅ | Done — see `P0-READY.md` |
| **Phase 1** Marketing (28 sections) | ✅ | ✅ mock UI | Done — includes `/contact` |
| **Phase 2** Auth + permissions UI | ✅ | ✅ mock UI | Done |
| **Phase 3** Customer portal | ✅ | ✅ mock UI | Done |
| **Phase 4** Reseller admin | ✅ | ✅ mock UI | Done |
| **Phase 5** Full tenant admin | ✅ | ✅ mock UI | Done |
| **Phase 6** Platform super-admin | ✅ | ✅ mock UI | Done |
| **Phase 7** Employee + polish | ✅ | ✅ mock UI | Done |
| **Phase 8** API integration | ✅ spec only | ❌ out of scope | **Next when ready** |

---

## P0 checklist (plan + implementation aligned)

| Item | Plan doc | Status |
|------|----------|--------|
| Landing tokens | `04-DESIGN-SYSTEM.md` | ✅ |
| Fonts (5 families, folders) | **`FONTS.md`** | ✅ |
| MarketingLayout | `UI-FUSION-GUIDE.md` | ✅ |
| Full navigation | `MASTER-BUILD-PLAN.md` P0-D | ✅ |
| Shared components (P0 set) | `09-COMPONENTS-AND-PATTERNS.md` | ✅ |
| Marketing mock data | `06-MOCK-DATA-SPEC.md` | ✅ |
| `next-intl` EN/BN | `11-I18N.md` | ⏳ optional polish (custom i18n present) |
| 403 / User Access UI | `05-PERMISSIONS-AND-ROLES.md` | ✅ mock UI present |

---

## Optional / deferred (not blocking mock UI complete)

| Item | When |
|------|------|
| H-audit stretch screens (AI chat, movie servers, gateway UIs…) | ✅ mock UI in sidebar — inventory §H all `[x]` |
| **ISP Feature Catalog** (`docs/14-ISP-FEATURE-CATALOG.md`) | ✅ mock UI — inventory §I all `[x]` · data `isp-ops.data.ts` |
| Playwright E2E | Phase 7+ polish |
| OpenAPI / Phase 8 | When API work starts |
| Screenshot visual gate per screen | Continuous craft |

---

## Reading order (every session)

1. `PROJECT-MEMORY.md`
2. `13-STRICT-AGENT-MANDATE.md`
3. `QUALITY-STANDARDS.md` + `UI-FUSION-GUIDE.md`
4. `MASTER-BUILD-PLAN.md` → current phase section
5. `07-SCREEN-INVENTORY.md` → screens for this phase
6. **`REFERENCE-MAP.md`** → where to read old PHP code in `isppaybd_isp`
7. `FONTS.md` → if touching typography
8. `DEFINITION-OF-DONE.md` → before marking any screen done

---

## Trigger / current focus

**Phases 1–7 mock UI + inventory sync: COMPLETE** (dummy data only).
§H stretch + §I ISP Feature Catalog: COMPLETE.
§J ISP Engines suite (~300 features, 20 groups): COMPLETE static mock UI.
Active remaining: **Phase 8 API** (when you say go).
Premium craft tracker: `docs/PONYTAIL-TRACKER.md`.
