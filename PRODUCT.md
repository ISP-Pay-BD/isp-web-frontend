# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

**Design priority (equal):** marketing conversion and portal daily ops both receive premium craft — do not sacrifice one surface for the other.

| Audience | Situation | Job |
|----------|-----------|-----|
| **Tenant ISP admin** | Running a Bangladesh ISP day-to-day | Bill customers, manage packages/PPPoE, POP/resellers, payments, network ops |
| **Reseller / POP** | Scoped under a tenant | Collect dues, onboard users, limited ops in their area |
| **End customer** | Paying for home/business internet | See package, pay (bKash/Nagad/etc.), open support |
| **Platform super-admin** | SaaS operator | Tenants, billing mode, platform health |
| **Employee** | ISP staff | Self-service salary / advance |
| **Marketing visitor** | Evaluating ISP Pay BD | Understand product, pricing, plugins; register / contact |

## Product Purpose

ISP Pay BD is a **multi-tenant ISP billing and operations SaaS for Bangladesh**. This repo is the **Next.js 16 web frontend** that replaces the legacy server-rendered UI in `isppaybd_isp`.

**Success means:** every portal screen feels like a premium ISP operations platform (not a generic CRM), permissions are enforced in nav/routes/actions, and (later) real `zapi/` APIs replace mock data without rewriting the UI architecture.

## Positioning

Bangladesh-native ISP ops: **৳**, **bKash/Nagad**, **PPPoE**, **MikroTik**, **POP/reseller hierarchy**, areas/OLT terminology — workflows and copy a generic global billing SaaS could not truthfully claim.

## Operating Context

- **Surfaces:** public marketing; auth; customer; admin (tenant + reseller); platform; employee; system error pages.
- **Current stage:** Phases 1–7 mock UI complete (static data via `src/data/` → mock-api). Phase 8 = real API when requested.
- **Reference backend (read-only during frontend work):** `../isppaybd_isp` — path map in `docs/REFERENCE-MAP.md`.
- **Demo auth:** `src/data/users/users.data.ts` (password `demo1234`).
- **Locales:** English + Bengali (Noto Sans Bengali); i18n polish optional.
- **Dev:** `pnpm dev` (Next.js Turbopack). Verify: `pnpm lint && pnpm typecheck && pnpm test && pnpm build`.

## Capabilities and Constraints

**Capabilities (mock UI):** ~132 screens across portals; permission-filtered nav; loading/empty/error/success states; forms with toast + local update; offline-capable static build.

**Constraints:**
- Features must not import `@/data` directly — only `mockFetch` / mock-api.
- Do not edit `isppaybd_isp` during frontend-only work.
- Forbidden UI kits: MUI, Chakra, Ant Design, DaisyUI; no Font Awesome / Google Fonts CDN; no Roboto as primary.
- Marketing ≠ portals: dark landing (`#0c0118` + 21st.dev inspiration + Framer Motion) vs shadcn portals (Satoshi + ISP tokens).
- Commit only when the user asks.

**Open / next:** Phase 8 API integration — undecided until user says go.

## Brand Commitments

- **Name:** ISP Pay BD (isppaybd.com / test.isppaybd.com).
- **Voice:** ISP domain terminology (customers, packages, POP, PPPoE, due/expiry) — never CRM jargon (“contacts”, “deals”).
- **Identity tokens (binding):** CTA/primary `#f75803`, sidebar/secondary `#1a0b38`, marketing canvas `#0c0118`, accent `#2E8BFF`.
- **Fonts (binding):** Plus Jakarta + Inter (marketing); Satoshi + Noto Sans Bengali (portals); IBM Plex Mono for IDs/trx — see `docs/FONTS.md`.
- **Authority docs:** `docs/UI-FUSION-GUIDE.md`, `docs/QUALITY-STANDARDS.md`, `.cursor/skills/isp-pay-bd/SKILL.md`.

## Evidence on Hand

- Legacy PHP product UI and tokens in `../isppaybd_isp` (read-only reference).
- Mock datasets under `src/data/`; screen inventory in `docs/07-SCREEN-INVENTORY.md`.
- Design/plan docs under `docs/` (fusion, fonts, design system, quality).
- **Do not fabricate:** customer logos, testimonials, revenue figures, or live payment claims not present in repo copy.

## Product Principles

1. **ISP domain fidelity first** — Bangladesh ops realism over generic SaaS patterns.
2. **Two surfaces, one brand** — marketing and portals share tokens/identity but never mix component languages wrongly.
3. **Complete states** — every screen ships loading, empty, error, and success.
4. **Permission-aware UI** — hide what the role cannot do; never show dead admin chrome.
5. **Mock → API without rewrites** — architecture stays thin routes + features + mock-api boundary.

## Accessibility & Inclusion

Practical a11y bar for now: keyboard reachability, visible focus, usable contrast, and `prefers-reduced-motion` on marketing motion. **No formal WCAG claim yet** (open upgrade path to WCAG 2.2 AA later). Bengali locale support is a first-class inclusion requirement.
