# 06 — Bangla in the portals (I1–I4) — ✅ implemented (customer, employee, admin and platform)

**Today:** Bangla works on the marketing site only. `src/i18n/messages/bn.json` exists (325 lines), but **no portal screen imports `@/i18n` or the locale context**. The customer portal is fully English, though [`11-I18N.md`](../11-I18N.md) plans "Phase 3 Customer: Full EN + BN". [`PRODUCT.md`](../../PRODUCT.md) calls Bengali "a first-class inclusion requirement".

Some groundwork is already in place:
- `bn.json` has `common.*`, `status.*` (active, expired, pending, paid, online, offline, open, closed…) and a few `customer.*` keys.
- `LocaleProvider` / `useTranslations` / `LocaleToggle` work, but they live in `features/marketing/shared/`.
- `--font-bengali` (Noto Sans Bengali) is loaded, and `.font-bengali` exists in `globals.css`.

| ID | Fix | Effort |
|---|---|---|
| I1 | Make the locale layer usable by portals | S |
| I2 | Customer portal fully EN + BN (19 screens) | L |
| I3 | Employee portal EN + BN (6 screens) | M |
| I4 | Admin Bangla (scope decision needed) | L |

---

## I1 — Make the locale layer usable by portals

1. **Move** `LocaleContext.tsx` (provider + `useLocale` + `useTranslations`) and `LocaleToggle.tsx` from `src/features/marketing/shared/` to `src/i18n/` (or `src/components/providers/`). Portals must not import from the marketing feature. Update the marketing imports.
2. **Mount** `LocaleProvider` once in the root layout, so marketing and every portal share one choice (`localStorage` key `ipb_locale`, as today).
3. **Interpolation:** `bn.json` already has `"{date}"` placeholders, but `getMessage` doesn't fill them. Add `t(key, vars?)` that replaces `{name}` tokens. Keep it to a few lines.
4. **No English flash:** the provider starts on `en` and switches after mount. Write the choice to a cookie as well, and read it in the root layout, so the server renders `<html lang>` and the first paint in the right language.
5. **Formatters** (from [S3](01-SHARED-FIXES.md#s3--bd-money-format-lakhcrore--one-date-path)): `formatBdt`, `formatCount` and `formatDate` take the active locale (`bn-BD` → Bengali digits and `১৮ অক্টো, ২০২৬`).
6. **Type:** the `html:lang(bn)` size bump from [S1](01-SHARED-FIXES.md#s1--text-size-floor-12px).
7. **Library:** `11-I18N.md` names next-intl, but the code uses a small custom `getMessage`. Keep the custom one; it is enough for labels and simple placeholders, and adds no dependency. Switch to next-intl only if plurals or ICU messages become necessary. Update `11-I18N.md` to say so.

---

## I2 — Customer portal, EN + BN

All 19 screens: dashboard, subscription, packages, payments (+ pay, auto-pay, invoice), router (+ wifi, devices), support (+ new, thread), rewards, news, profile, change-password, help, experience. Also the customer header and bottom nav.

**Process for each screen:** move every user-facing string to `customer.<screen>.*` in both JSON files. That includes:
- headings, labels, buttons, empty/error text
- **Zod error messages** in `schemas/`
- **toast text** in hooks and the global mutation handler
- `aria-label`s (S5)
- `StatusBadge` labels, using the existing `status.*` keys

Put the `LocaleToggle` in the customer header and on the profile screen.

**Keep in English or Latin script:** brand and protocol names (bKash, Nagad, Rocket, PPPoE, MikroTik, ONU, Wi-Fi, SSID, MAC, IP), TrxID values, and anything the customer has to type into another app.

**Core terms** (keep them consistent across all screens; check with the owner before shipping):

| English | বাংলা |
|---|---|
| Pay bill / Pay now | বিল পরিশোধ / এখনই পরিশোধ করুন |
| Due | বকেয়া |
| Valid till | মেয়াদ শেষ |
| Days left | দিন বাকি |
| Renew | নবায়ন |
| Package | প্যাকেজ |
| Payment history | পেমেন্ট ইতিহাস |
| Invoice | ইনভয়েস |
| Transaction ID (TrxID) | ট্রানজেকশন আইডি (TrxID) |
| Submit for verification | যাচাইয়ের জন্য জমা দিন |
| Support ticket | সাপোর্ট টিকেট |
| Connected devices | সংযুক্ত ডিভাইস |
| Restart router | রাউটার রিস্টার্ট |
| Change Wi-Fi password | ওয়াই-ফাই পাসওয়ার্ড পরিবর্তন |

**Done when:** with Bangla selected, a walk through dashboard → pay → payments → router → support shows no English UI text except the "keep" list, and nothing overflows at 390px. Bangla strings run about 20–30% longer than English.

---

## I3 — Employee portal, EN + BN

Same process for the 6 employee screens (`employee.*` namespace). Field staff are the users least likely to read English comfortably, so do this right after I2.

---

## I4 — Admin Bangla (decision needed)

`11-I18N.md` marks admin Bangla as optional. A useful middle path is to translate only the screens resellers and collectors use daily, and leave the network and engineering screens (OLT, RADIUS, IPAM, ACS, VPN) in English, where the technical terms are English anyway:

1. Customers (list, detail, add/edit), collect payment, customer payments, collections, expired customers
2. Support tickets
3. The dashboard triage row

Get a yes from the owner before starting, because it is the largest piece in this plan (145 screens, even if only some are translated).


---

## What was built

- **I1** `src/i18n/locale-context.tsx` (provider mounted once in `AppProviders`), `src/components/shared/LocaleToggle.tsx` (`variant="marketing" | "portal"`), `t(key, englishFallback, vars?)` and `te(zodMessage)`. The language sets `<html lang>` and the `font-bengali` class on `<html>`, and `setFormatLocale()` so money/dates follow it. Messages: `src/i18n/messages/{en.json, bn.json}` plus one Bangla file per area in `messages/bn/` (merged in `src/i18n/index.ts`). English lives at the call site, so a missing Bangla key simply shows English.
- **I2** 19 customer screens, the bottom nav, header and shared states are bilingual; **I3** 6 employee screens.
- **I4** Every admin and platform screen is bilingual (144 of 145 admin page components call `t()` directly; the 145th, user access, wraps a translated page) — the first pass covered the daily-use screens (customers, customer payments, dashboard, staff support, shared table/dialog chrome, sidebar, command palette) and a second pass covered the rest (`admin-more-1…19.json`: billing, HR, accounting, inventory, purchase, hotspot, bandwidth, OLT/IPAM/RADIUS/VPN, WhatsApp, settings, tenants, SLA…). The earlier plan to leave network/engineering screens in English was dropped; protocol and product names (PPPoE, MikroTik, RouterOS, OLT/ONU/PON, RADIUS, dBm) stay in Latin script inside Bangla sentences.
- **Guard rails:** `tests/unit/i18n/coverage.test.ts` fails when a literal `t('key', …)` has no Bangla message or when the `{placeholders}` differ between the Bangla and the English fallback.
- **Select triggers:** Selects that used to show the raw value (`all`, `published`, `range`) now pass an `items` map so the closed trigger shows the translated label. Fixed-width triggers that clipped longer Bangla became `min-w-*`.
- **Numbers and dates:** counts go through `formatCount`, dates through `formatDate`/`dateLocale()`, so they follow the active language.

### Deliberately left in English

- API error messages, provider-entered text (names, memos, plan names, router log lines) and server-supplied labels (settings group/field labels, plugin/webhook event labels).
- CSV / Excel export column headers: `downloadCsv` writes no BOM in some exports, and column headers are data-interchange, not UI.
- The SMS body sent *to a customer* from the invoice "send receipt/reminder" action (outgoing customer content; the receipt SMS in customer-payments *is* locale-aware).
- Route `metadata` titles (server-side) and the marketing `HelpPage` body shown inside the customer help screen.
- AI chat: the backend classifier matches English keywords only, so the quick prompts are shown in Bangla but the English text is what gets sent.

### Needs a native-speaker pass (before calling the Bangla final)

The wording was written by the implementers and has **not** been reviewed by a native speaker. Terms the writers flagged as least sure:

| Area | Terms |
|---|---|
| Billing / HR / accounting | "বরাদ্দকৃত" (assigned), "কর্তিত" / "কর্তন" (deducted), "পেরোল" (payroll), "মূলধন" (equity), "দায়" (liabilities), "রাজস্ব" (revenue), "মওকুফ" (waive), "তাগাদা" (dunning), "সেটেলমেন্ট", "পেমেন্ট নিন" |
| Network | "ডিসকানেক্ট", "পোল", "ড্রপ", "ওয়ালড গার্ডেন" (walled garden), "ভেন্ডর", "ওয়্যার ডাউন", "প্রোভিশন", "কভারেজ জোন", "নাগালের বাইরে" |
| Support / NOC | "জরুরি / গুরুতর / সামান্য" (critical / major / minor), "ইনসিডেন্ট", "এসকেলেশন", "কিউ" vs "সারিতে" |
| CRM / loyalty | "রেফারকারী" (referrer), "লয়্যালটি পয়েন্ট", lead stages "নেগোশিয়েশন / সফল / হারানো", "প্রত্যাখ্যান" (rejected) |
| Settings / theme | "লঞ্চ করুন", "নিশ্চিত গতি" (CIR), transliterated theme names, "ঠিক আছে / নজরে রাখুন / জরুরি" (posture) |
| Security | 2FA / TOTP phrasing, "সম্পাদনকারী" (actor), "এন্টিটি" (entity) |

A ready-to-use checklist (term → every message that uses it, with a column for the preferred wording) is in [10-BANGLA-REVIEW-SHEET.md](10-BANGLA-REVIEW-SHEET.md).

### Known gaps

- The public marketing site (landing, pricing, register, referral, plugins, contact, help, status, captive, footer, nav) is translated as well; only the decorative product mock-ups on the landing page (`OperatorConsole`, `SubscriberPhone`, …) keep their English sample data.
- Privacy and Terms (`/privacy`, `/terms`) are legal text and stay English until the owner supplies approved Bangla wording.
- The captive page shows `expiresAt` as the server sends it (a timezone-less `Y-m-d H:i:s`); formatting it client-side could shift the date for visitors outside Bangladesh.
- DataTable facet-filter *option* text shows the raw column value; only the filter titles are translated. Facet filters on translated text (`f_status=…`) are stored in the URL as the translated string, so a saved link does not carry over if the language is switched.
- Route `metadata` titles (e.g. `/403`) are static English server-side strings.
