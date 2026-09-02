# Project Structure Map — Helpers, Config, Tokens

> **For AI agents:** Where to put and find helpers, tools, colors, sizes, strings, and multi-tenant ISP SaaS config.

Default skill: `.cursor/skills/isp-pay-bd/SKILL.md`

---

## One-page map

| Need | Path |
|------|------|
| **Colors / radius / dark mode** | `src/app/globals.css` |
| **Tenant theme overrides** | `src/config/theme.ts` |
| **Fonts** | `src/config/fonts.ts`, `src/styles/fonts/`, `docs/FONTS.md` |
| **Site name / URL / mock flag** | `src/config/site.ts` |
| **Logos / image paths** | `src/config/assets.ts`, `public/images/` |
| **Menus (admin / customer / platform)** | `src/config/navigation/` |
| **Status enums / page size / storage keys** | `src/lib/constants/` |
| **Format ৳, date, BD phone, MAC, IP** | `src/lib/format/` |
| **`cn()` class helper** | `src/lib/utils.ts` |
| **Permissions `can()`** | `src/lib/permissions/can.ts` |
| **Mock API client** | `src/lib/mock-api/` |
| **EN / BN strings** | `src/i18n/messages/en.json`, `bn.json` |
| **Auth session** | `src/stores/auth-store.ts` |
| **Shared UI** | `src/components/shared/` |
| **shadcn primitives** | `src/components/ui/` |
| **Layouts** | `src/components/layout/` |
| **Feature screens** | `src/features/{portal}/{module}/` |
| **Static / mock data** | `src/data/` |
| **PHP reference** | `docs/REFERENCE-MAP.md` → `../isppaybd_isp` |

---

## Design tokens (colors & size)

**File:** `src/app/globals.css`

| Token | Value | Use |
|-------|-------|-----|
| `--landing-bg` | `#0c0118` | Marketing background |
| `--landing-cta` | `#f75803` | Primary CTA |
| `--landing-accent` | `#2e8bff` | Links / accents |
| `--radius` | `0.75rem` | Base radius (sm/md/lg derived) |
| `--primary` | orange oklch | Portal buttons |
| `.dark` | violet-tinted dark | Portal dark mode |

**Multi-tenant branding:** `src/config/theme.ts`

```ts
import { resolveTenantTheme, themeToCssVars } from '@/config/theme';

const theme = resolveTenantTheme({ primary: '#f75803', brandName: 'Acme ISP' });
const vars = themeToCssVars(theme); // set on wrapper style
```

---

## Formatters (`src/lib/format/`)

| Export | File | Example |
|--------|------|---------|
| `formatBdt`, `formatBdtWithSymbol` | `currency.ts` | `৳1,250` |
| `formatDate`, `formatDateTime`, `formatRelativeDays` | `date.ts` | `02 Sep 2026` |
| `formatBdPhone`, `isValidBdPhone`, `normalizeBdPhone` | `phone.ts` | `01712-345678` |
| `formatMac`, `isValidIpv4`, `maskSecret` | `network.ts` | `AA:BB:CC:…` |

```ts
import { formatBdt, formatBdPhone, formatDate, formatMac } from '@/lib/format';
```

UI wrapper for money: `CurrencyDisplay` → uses `@/lib/format`.

---

## Constants (`src/lib/constants/`)

| Export | Purpose |
|--------|---------|
| `CUSTOMER_STATUS` | active, expired, suspended… |
| `PAYMENT_STATUS` | paid, pending, failed… |
| `TICKET_STATUS` | open, closed… |
| `ROUTER_STATUS` | online, offline |
| `TENANT_STATUS` | trial, active, suspended |
| `PAGE_SIZE_OPTIONS`, `DEFAULT_PAGE_SIZE` | DataTable |
| `STORAGE_KEYS` | locale, theme localStorage |
| `MOCK_DELAY_MS` | mock-api timing |

```ts
import { CUSTOMER_STATUS, DEFAULT_PAGE_SIZE } from '@/lib/constants';
```

---

## i18n strings (`src/i18n/`)

| File | Role |
|------|------|
| `config.ts` | `en` / `bn` locales |
| `messages/en.json` | English UI copy |
| `messages/bn.json` | Bengali UI copy |
| `index.ts` | `getMessage(locale, 'marketing.hero.title')` |

Full next-intl App Router wiring = Phase 1 (see `docs/11-I18N.md`). Messages are ready to plug in.

---

## Config (`src/config/`)

| File | Role |
|------|------|
| `site.ts` | App name, URL, useMock |
| `assets.ts` | Logo / payment image paths |
| `fonts.ts` | Font registry |
| `theme.ts` | Tenant theme tokens |
| `navigation/` | Portal menus |

---

## Helpers & tools (`src/lib/`)

| Path | Role |
|------|------|
| `utils.ts` | `cn()` |
| `format/` | Display formatters |
| `constants/` | Enums & app constants |
| `permissions/can.ts` | Permission checks |
| `mock-api/` | Offline data access |
| `fonts.ts` | Font CSS import entry |

---

## Where new code goes

| Adding… | Put in… |
|---------|---------|
| New color token | `globals.css` (+ optional `theme.ts`) |
| New formatter | `src/lib/format/` |
| New status enum | `src/lib/constants/status.ts` |
| New UI string EN/BN | `src/i18n/messages/*.json` |
| New nav item | `src/config/navigation/*.ts` |
| New shared widget | `src/components/shared/` |
| New screen | `src/features/{portal}/{module}/` |
| New mock data | `src/data/` |

**Never** hardcode ৳ formatting, BD phones, or status labels inside feature components — use `@/lib/format`, `@/lib/constants`, `@/i18n`.

---

## Related docs

- `docs/04-DESIGN-SYSTEM.md` — design tokens detail
- `docs/FONTS.md` — typography
- `docs/11-I18N.md` — next-intl plan
- `docs/REFERENCE-MAP.md` — PHP reference
- `docs/UI-REFERENCES-LIBS.md` — USE / DO NOT USE libs
