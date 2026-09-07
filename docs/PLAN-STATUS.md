# Plan Documentation Status

> **Single index:** Is the `.md` plan complete? What phase is next?

Last synced: **Sep 2026**

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
| **Phase 1** Marketing (28 sections) | ✅ | ✅ mock UI | Premium craft — `PONYTAIL-TRACKER.md` |
| **Phase 2** Auth + permissions UI | ✅ | ✅ mock UI | Premium craft ongoing |
| **Phase 3** Customer portal | ✅ | ✅ mock UI | Premium craft ongoing |
| **Phase 4** Reseller admin | ✅ | ✅ mock UI (admin POP) | Premium craft ongoing |
| **Phase 5** Full tenant admin | ✅ | ✅ mock UI | Premium craft ongoing |
| **Phase 6** Platform super-admin | ✅ | ✅ mock UI | Premium craft ongoing |
| **Phase 7** Employee + polish | ✅ | ✅ mock UI | Premium craft ongoing |
| **Phase 8** API integration | ✅ spec only | ❌ out of scope | Future |

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
| `next-intl` EN/BN | `11-I18N.md` | ⏳ parallel (not blocking mock UI) |
| 403 / User Access UI | `05-PERMISSIONS-AND-ROLES.md` | ✅ mock UI present |

---

## Optional plan items (not blocking Phase 1)

| Item | When |
|------|------|
| OG image spec | Phase 1 |
| PHP-only features in inventory | Phases 3–7 (listed in `PRE-PHASE-AUDIT.md`) |
| Playwright E2E plan | Phase 7 |
| OpenAPI / Phase 8 detail | When API work starts |

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

**Phases 1–7 mock UI exist.** Active work is **premium-ui craft** across all surfaces — track in `docs/PONYTAIL-TRACKER.md`. Do not claim phase “done” for inventory DoD until visual gates pass.
