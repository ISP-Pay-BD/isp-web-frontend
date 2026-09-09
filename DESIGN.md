---
name: ISP Pay BD
description: Premium Bangladesh ISP billing & operations — dual-surface marketing + portals
colors:
  landing-bg: "#0c0118"
  landing-panel: "#180a30"
  cta: "#f75803"
  cta-hover: "#e04f00"
  accent-azure: "#2E8BFF"
  sidebar-violet: "#1a0b38"
  success: "#22c55e"
  warning: "#f59e0b"
  destructive: "#ef4444"
  muted: "#64748b"
  white: "#ffffff"
typography:
  display:
    fontFamily: "Plus Jakarta Sans Variable, Plus Jakarta Sans, system-ui, sans-serif"
    fontSize: "clamp(2rem, 5vw, 3.5rem)"
    fontWeight: 700
    lineHeight: 1.1
    letterSpacing: "-0.02em"
  headline:
    fontFamily: "Plus Jakarta Sans Variable, Plus Jakarta Sans, system-ui, sans-serif"
    fontSize: "1.75rem"
    fontWeight: 650
    lineHeight: 1.2
  title:
    fontFamily: "Satoshi, Inter Variable, Inter, system-ui, sans-serif"
    fontSize: "1.125rem"
    fontWeight: 600
    lineHeight: 1.35
  body:
    fontFamily: "Inter Variable, Inter, system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.6
  body-portal:
    fontFamily: "Satoshi, Inter Variable, Inter, system-ui, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 400
    lineHeight: 1.5
  label:
    fontFamily: "Satoshi, Inter Variable, Inter, system-ui, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 500
    lineHeight: 1.4
    letterSpacing: "0.02em"
  mono:
    fontFamily: "IBM Plex Mono, ui-monospace, monospace"
    fontSize: "0.8125rem"
    fontWeight: 500
    lineHeight: 1.4
  bengali:
    fontFamily: "Noto Sans Bengali, Inter Variable, Inter, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.6
rounded:
  sm: "6px"
  md: "8px"
  lg: "12px"
  xl: "14px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "16px"
  lg: "24px"
  xl: "32px"
  section: "80px"
components:
  button-primary:
    backgroundColor: "{colors.cta}"
    textColor: "{colors.white}"
    rounded: "{rounded.md}"
    padding: "10px 20px"
  button-primary-hover:
    backgroundColor: "{colors.cta-hover}"
    textColor: "{colors.white}"
  button-marketing-cta:
    backgroundColor: "{colors.cta}"
    textColor: "{colors.white}"
    rounded: "{rounded.lg}"
    padding: "12px 28px"
  card-portal:
    backgroundColor: "{colors.white}"
    rounded: "{rounded.lg}"
    padding: "16px"
  card-landing:
    backgroundColor: "{colors.landing-panel}"
    textColor: "{colors.white}"
    rounded: "{rounded.xl}"
    padding: "24px"
  sidebar-active:
    backgroundColor: "rgba(247, 88, 3, 0.12)"
    textColor: "{colors.cta}"
    rounded: "{rounded.md}"
---

# Design System: ISP Pay BD

## Overview

**Creative North Star: "Midnight Vermilion Ops"**

ISP Pay BD is a dual-surface product: a dark marketing night sky (`#0c0118`) lit by vermilion CTAs and azure accents, and denser shadcn portals where Satoshi type and orange/violet tokens keep Bangladesh ISP operators moving fast. Depth comes from layered panels, subtle borders, and restrained glow — never flat grey boxes or scrap AI CRM chrome.

The system rejects generic SaaS templates, MUI/Chakra/Ant/DaisyUI, Roboto-led UIs, and heavy 21st.dev shaders that tank LCP. Marketing may borrow 21st.dev *composition* ideas; portals stay on shadcn + ISP tokens.

**Key Characteristics:**
- Two surfaces, one brand (marketing dark vs portal light/dark toggle)
- Vermilion primary used sparingly for action and active state
- Self-hosted fonts only (Plus Jakarta / Inter / Satoshi / Noto Bengali / IBM Plex Mono)
- Anti-flat: tonal cards, soft elevation, purposeful micro-motion on marketing only

## Colors

Palette character: deep violet-black canvas, hot vermilion action, cool azure highlights — Bangladesh ISP brand fidelity.

### Primary
- **Vermilion CTA** (`#f75803`): Primary buttons, active nav, focus rings, chart accents. Rarity is the point — not decoration wallpaper.
- **Vermilion Hover** (`#e04f00`): Primary button hover / pressed deepen.

### Secondary
- **Sidebar Violet** (`#1a0b38`): Portal sidebar / dark shell identity.
- **Landing Panel** (`#180a30`): Lifted cards on marketing dark.

### Tertiary
- **Azure Accent** (`#2E8BFF`): Links, eyebrows, marketing highlights — secondary voice to vermilion.

### Neutral
- **Midnight Canvas** (`#0c0118`): Marketing page background; portal dark-mode page root.
- **Muted Slate** (`#64748b`): Secondary text.
- **Success / Warning / Destructive** (`#22c55e` / `#f59e0b` / `#ef4444`): Status semantics (paid, expiring, error).

### Named Rules
**The One Flame Rule.** Vermilion (`#f75803`) is for action and selection only — ≤~10% of any viewport. Decorative orange washes are out of brand.

**The Dual Surface Rule.** Never apply marketing full-bleed `#0c0118` section language inside portal CRUD screens, and never drop light shadcn “dashboard grey” onto the landing hero.

## Typography

**Display Font:** Plus Jakarta Sans (marketing headings)  
**Body Font:** Inter (marketing body) · **Portal UI:** Satoshi  
**Label/Mono Font:** IBM Plex Mono · **Bengali:** Noto Sans Bengali  

**Character:** Marketing is expressive and wide; portals are compact, operational, and bilingual-ready. Mono reserves trust for ৳, invoice IDs, TrxIDs, PPPoE usernames.

### Hierarchy
- **Display** (700, clamp ~2–3.5rem, ~1.1): Marketing hero and major section titles (`font-landing-display`).
- **Headline** (650, ~1.75rem): Marketing section heads.
- **Title** (600, ~1.125rem, Satoshi): Portal page titles and card headers.
- **Body** (400, 1rem Inter / 0.875rem Satoshi): Marketing paragraphs vs dense portal copy.
- **Label** (500, 0.75rem): Form labels, table headers, badges.
- **Mono** (500, ~0.8125rem): IDs, amounts, network identifiers.

### Named Rules
**The Route Font Rule.** Marketing routes use Plus Jakarta + Inter; portal/auth shells use Satoshi by default — do not swap stacks for “variety.”

## Layout

8px spacing grid via Tailwind. Marketing sections typically `py-20 md:py-28` with full-bleed dark bands and `border-t border-white/10` separators. Portals use AppShell + Sidebar: content max-width per page pattern, dense tables, sticky headers. Breakpoints of record for QA: 320, 375, 768, 1024, 1440.

## Elevation & Depth

Hybrid: portals lean on subtle borders (`border/50`), soft card lift, and tonal layering (especially dark mode oklch surfaces). Marketing uses panel color lifts (`#180a30` on `#0c0118`), faint glows, and glass-adjacent blur sparingly. Flat monotone CRM boxes are a defect.

### Shadow Vocabulary
- **Card rest** (Tailwind `shadow-xs` / soft border): Default portal containers.
- **Hover lift** (short `duration-200 ease-out` + slight elevation): Interactive cards/rows.
- **Marketing glow** (orange/azure low-opacity bloom): Hero/CTA emphasis only — never full-page neon.

### Named Rules
**The Flat-By-Default Rule.** Surfaces stay quiet at rest; depth responds to hierarchy or interaction — not every box gets a drop shadow.

## Shapes

Radius scale from `--radius` (~0.85rem): buttons ~`rounded-lg` (8px), inputs ~`rounded-md` (6px), cards ~`rounded-xl` (~12–14px). Active sidebar items use rounded wash + a **thin left rail** (not a thick side-tab border). Prefer soft rectangles over pill-heavy chrome except for small badges.

## Components

### Buttons
- **Shape:** `rounded-lg` / marketing CTA slightly larger padding.
- **Primary:** Vermilion bg, white text; marketing may add shimmer.
- **Hover / Focus:** Deepen to `#e04f00`; ring uses primary at reduced alpha.
- **Secondary / Ghost:** Outline or violet-tinted; never compete with primary orange.

### Cards / Containers
- **Corner Style:** `rounded-xl`
- **Background:** White/oklch card (portal light); `#180a30` (marketing); elevated oklch card (portal dark)
- **Shadow Strategy:** Soft border + optional `shadow-xs`
- **Internal Padding:** 16–24px

### Inputs / Fields
- **Style:** Border + muted fill; `rounded-md`
- **Focus:** Primary ring (~40–50% alpha)
- **Error / Disabled:** Destructive text/border; muted disabled opacity

### Navigation
- **Portal sidebar:** Violet identity in dark; active = primary text + soft primary wash + thin left rail indicator.
- **Marketing nav:** Sticky dark bar; azure/white links; vermilion CTA.

### Tables
- Sticky header, row hover, optional zebra; mono for IDs; semantic status badges.

## Do's and Don'ts

### Do:
- **Do** keep marketing on `#0c0118` end-to-end (no white marketing bands).
- **Do** use Satoshi in portals and Plus Jakarta/Inter on marketing per `docs/FONTS.md`.
- **Do** ship loading / empty / error / success for every screen.
- **Do** self-host fonts; use Lucide icons.
- **Do** read `docs/REFERENCE-MAP.md` + PHP reference before inventing ISP workflows.

### Don't:
- **Don't** build a generic CRM look or import MUI / Chakra / Ant / DaisyUI.
- **Don't** use Font Awesome CDN, Google Fonts CDN, or Roboto as primary.
- **Don't** paste heavy 21st.dev shaders/3D into production marketing.
- **Don't** use thick `border-l-*` “side-tab” accents as the primary active pattern.
- **Don't** mix three UI libraries on one page or import `@/data` from features.
