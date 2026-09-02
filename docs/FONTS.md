# Fonts — ISP Pay BD Frontend

> **Rule:** All fonts self-hosted. No Google Fonts CDN.  
> **Structure:** One font family = one folder in `public/fonts/` + one CSS file in `src/styles/fonts/`.

---

## Folder map (complete)

```
public/fonts/
├── README.md                    ← index
├── satoshi/                     ← 4 woff2 files
│   ├── satoshi-400.woff2 … satoshi-900.woff2
├── inter/                       ← inter-latin.woff2 (variable)
├── plus-jakarta-sans/           ← plus-jakarta-sans-latin.woff2 (variable)
├── noto-sans-bengali/           ← 8 woff2 (bengali + latin, 400–700)
└── ibm-plex-mono/               ← 2 woff2 (400, 500)

src/styles/fonts/
├── index.css                    ← imports all 5 families
├── satoshi.css
├── inter.css
├── plus-jakarta-sans.css
├── noto-sans-bengali.css
├── ibm-plex-mono.css
└── README.md

src/config/fonts.ts              ← registry: where to use what
src/lib/fonts.ts                 ← import once in root layout
```

---

## The 5 fonts you need (locked)

| # | Font | Rating | Folder | CSS file | Class | CSS variable |
|---|------|--------|--------|----------|-------|--------------|
| 1 | **Plus Jakarta Sans** | 9.5/10 | `plus-jakarta-sans/` | `plus-jakarta-sans.css` | `font-landing-display` | `--font-landing-display` |
| 2 | **Inter** | 9/10 | `inter/` | `inter.css` | `font-landing-body` | `--font-landing-body` |
| 3 | **Satoshi** | 9/10 | `satoshi/` | `satoshi.css` | `font-portal` | `--font-portal-sans` |
| 4 | **Noto Sans Bengali** | 9.5/10 | `noto-sans-bengali/` | `noto-sans-bengali.css` | `font-bengali` | `--font-bengali` |
| 5 | **IBM Plex Mono** | 9/10 | `ibm-plex-mono/` | `ibm-plex-mono.css` | `font-mono` | `--font-portal-mono` |

**Do NOT install:** Roboto (4/10), Open Sans (5/10), Geist, DM Sans, Outfit, Manrope — alternates only add bloat.

---

## Where to use what (by route)

### Marketing — dark landing, 21st-style

| Element | Font | Class | Routes |
|---------|------|-------|--------|
| Hero `<h1>`, section titles | Plus Jakarta Sans | `font-landing-display` | `/`, `/pricing`, `/plugins`, `/about`, `/contact` |
| Paragraphs, nav, footer, FAQ body | Inter | `font-landing-body` | Same |
| Stat numbers (optional display) | Plus Jakarta Sans | `font-landing-display` | Landing stats section |
| Bengali marketing copy | Noto Sans Bengali | `font-bengali` | When locale = `bn` |

**Layout:** Wrap marketing pages in `MarketingLayout` — apply `font-landing-body` on main, `font-landing-display` on headings.

### Portals — shadcn, dense UI

| Element | Font | Class | Routes |
|---------|------|-------|--------|
| Everything (default) | Satoshi | `font-portal` / default `html` | `/admin/*`, `/customer/*`, `/platform/*`, `/employee/*` |
| Sidebar, tables, forms, buttons | Satoshi | (inherits) | All portal modules |
| Auth login/register | Satoshi | (inherits) | `/login`, `/register` |
| Bengali UI labels | Noto Sans Bengali | `font-bengali` | When locale = `bn` |

**Layout:** `AppShell` — no extra font class needed; `html` uses `--font-portal-sans`.

### Monospace — all surfaces

| Element | Font | Class | Examples |
|---------|------|-------|----------|
| Invoice # | IBM Plex Mono | `font-mono` | `INV-2024-0042` |
| Payment TrxID | `font-mono` | `TXN8F3K2M9` |
| Username / PPPoE | `font-mono` | `user_01723456789` |
| IP / MAC | `font-mono` | `192.168.1.1`, `AA:BB:CC:DD:EE:FF` |
| Currency in tables (optional) | `font-mono` | `৳1,250.00` via `CurrencyDisplay` |

---

## Where to use what (by component)

| Component / area | Font to use | Class |
|------------------|-------------|-------|
| `MarketingLayout` main content | Inter | `font-landing-body` |
| Landing hero, pricing titles | Plus Jakarta Sans | `font-landing-display` |
| `MarketingNav`, `MarketingFooter` | Inter | `font-landing-body` |
| `AppShell`, `PortalSidebar`, `PortalHeader` | Satoshi | default |
| `DataTable` cell text | Satoshi | default |
| `DataTable` ID / IP columns | IBM Plex Mono | `font-mono` |
| `StatCard` value (marketing) | Plus Jakarta Sans | `font-landing-display` |
| `StatCard` value (portal) | Satoshi | default |
| `CurrencyDisplay` | Satoshi or mono | default / `font-mono` |
| BN locale body | Noto Sans Bengali | `font-bengali` on `<body>` |

Registry in code: `src/config/fonts.ts`

---

## How to load (agents)

1. **Never** add new `<link>` or Google Fonts CDN.
2. Root layout imports `@/lib/fonts` once — do not import font CSS in components.
3. **Add a new font family?**
   - Create `public/fonts/{family-name}/` + README
   - Create `src/styles/fonts/{family-name}.css`
   - Add `@import` to `src/styles/fonts/index.css`
   - Register in `src/config/fonts.ts`
   - Update this doc

---

## Code examples

```tsx
// Marketing hero
<h1 className="font-landing-display text-5xl">ISP Pay BD</h1>
<p className="font-landing-body text-lg text-white/80">...</p>

// Portal — nothing extra (Satoshi default)
<Button>Create customer</Button>

// Technical ID
<span className="font-mono text-sm">INV-2024-0042</span>

// Bengali locale (root layout)
<body className={locale === 'bn' ? 'font-bengali' : undefined}>
```

---

## CSS variables (`globals.css`)

```css
--font-landing-display: 'Plus Jakarta Sans Variable', 'Plus Jakarta Sans', system-ui, sans-serif;
--font-landing-body: 'Inter Variable', 'Inter', system-ui, sans-serif;
--font-portal-sans: 'Satoshi', 'Inter Variable', 'Inter', system-ui, sans-serif;
--font-portal-mono: 'IBM Plex Mono', ui-monospace, monospace;
--font-bengali: 'Noto Sans Bengali', var(--font-landing-body);
```

---

## Sync fonts (after fresh clone)

```bash
pnpm install
pnpm fonts:sync   # copies woff2 from @fontsource → public/fonts/
```

All 5 families are **self-hosted in `public/fonts/`** — no runtime CDN.

---

## Verification

```bash
npx tsc --noEmit && npx next build
```

DevTools → Network → filter `font`:
- `/fonts/satoshi/satoshi-400.woff2` (portals)
- Bundled chunks for Inter, Jakarta, Noto, Plex (no CDN)

---

## Reference

- Backend tokens: `isppaybd_isp/public/assets/css/saas/tokens.css`
- Satoshi source: [Fontshare](https://www.fontshare.com/fonts/satoshi)
