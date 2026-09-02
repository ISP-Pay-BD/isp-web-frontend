# ISP Pay BD — Web Frontend

Modern Next.js frontend for the ISP Pay BD platform — **premium ISP operations UI**, not a generic CRM.

## Quick start

```bash
pnpm install
cp .env.example .env.local
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000)

## Documentation (read before coding)

| Doc | Purpose |
|-----|---------|
| [**PROJECT-MEMORY.md**](./docs/PROJECT-MEMORY.md) | AI context — every session |
| [**13-STRICT-AGENT-MANDATE.md**](./docs/13-STRICT-AGENT-MANDATE.md) | Non-negotiable rules |
| [**QUALITY-STANDARDS.md**](./docs/QUALITY-STANDARDS.md) | Premium ISP quality bar |
| [**MASTER-BUILD-PLAN.md**](./docs/MASTER-BUILD-PLAN.md) | Complete plan — all 84 modules |
| [**DEFINITION-OF-DONE.md**](./docs/DEFINITION-OF-DONE.md) | Per-screen checklist |
| [**UI-FUSION-GUIDE.md**](./docs/UI-FUSION-GUIDE.md) | ISP + shadcn + 21st.dev |
| [docs/README.md](./docs/README.md) | Full index |

## User goal

High-quality, professional, modern **ISP Pay BD website** — complete in every module, every screen, every state. Reference: `../isppaybd_isp`.

## Status

| Item | State |
|------|-------|
| P0 foundation | ✅ Complete |
| Phase 1 landing (28 sections) | ⏳ Ready — say **"start Phase 1"** |

**Preview:** `pnpm dev` → open `/` (dark marketing shell + hero).

See [P0-READY.md](./docs/P0-READY.md).

## Verify

```bash
pnpm lint && pnpm typecheck && pnpm test && pnpm build
```
