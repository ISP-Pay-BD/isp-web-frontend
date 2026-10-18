# 06 — Bangla in the portals (I1–I4)

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
