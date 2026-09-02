# UI References & Libraries — USE / DO NOT USE

> **For AI agents:** Default skill `.cursor/skills/isp-pay-bd/SKILL.md` loads this automatically in this repo.  
> Companion detail: `.cursor/skills/isp-pay-bd/ui-libraries.md`

---

## Quick rules

| Surface | USE | DO NOT USE |
|---------|-----|------------|
| **Marketing** | ISP dark theme, 21st.dev inspiration, Framer Motion, Plus Jakarta + Inter | MUI, white hero, Roboto, heavy shaders |
| **Portals** | shadcn/ui, Satoshi, TanStack Table, Lucide | 21st npm, DaisyUI, MUI, Chakra, Ant |
| **All** | PHP reference first (`REFERENCE-MAP.md`), mock-api, local fonts/images | CDN fonts/images, invent features |

---

## USE — libraries (locked stack)

See `docs/03-TECH-STACK.md` for versions. Key links:

| Library | Link |
|---------|------|
| Next.js | https://nextjs.org |
| shadcn/ui | https://ui.shadcn.com |
| Tailwind CSS | https://tailwindcss.com |
| Framer Motion (marketing) | https://motion.dev |
| TanStack Table / Query | https://tanstack.com |
| Lucide | https://lucide.dev |
| Recharts | https://recharts.org |
| next-intl | https://next-intl.dev |

---

## DO NOT USE — libraries

MUI · Chakra · Ant Design · DaisyUI · jQuery · Bootstrap · Redux · Axios (Phase 1) · Font Awesome CDN · Google Fonts CDN

See `docs/03-TECH-STACK.md` § Libraries explicitly NOT used.

---

## USE — UI inspiration (patterns only)

| Priority | Site | Link |
|----------|------|------|
| **1** | 21st.dev components | https://21st.dev/community/components |
| **2** | isppaybd_isp PHP views | `docs/REFERENCE-MAP.md` |
| 3 | shadcn examples | https://ui.shadcn.com/examples |
| 4 | Linear / Vercel / Stripe | https://linear.app · https://vercel.com · https://stripe.com |
| 5 | Magic UI / Tremor | https://magicui.design · https://www.tremor.so |

Full categorized list: `.cursor/skills/isp-pay-bd/ui-libraries.md`

---

## DO NOT USE — UI patterns

- Generic CRM 3-card dashboard
- White marketing sections on landing
- Roboto / Material Design look
- Multiple animation libraries
- Heavy 21st.dev shaders on every section
- Copy 21st.dev without ISP colors (`#0c0118`, `#f75803`, `#2E8BFF`)

---

## Related docs

| Doc | Purpose |
|-----|---------|
| `UI-FUSION-GUIDE.md` | How to fuse ISP + shadcn + 21st.dev |
| `FONTS.md` | Typography USE/DO NOT |
| `REFERENCE-MAP.md` | PHP reference paths |
| `03-TECH-STACK.md` | Full stack lock |
| `.cursor/skills/isp-pay-bd/SKILL.md` | **Default project skill** |
