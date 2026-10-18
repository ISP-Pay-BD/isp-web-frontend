# 07 — Motion (M1–M7) — ✅ implemented

Two parts: (1) a review of [`15-ANIMATION-AND-UX-ROADMAP.md`](../15-ANIMATION-AND-UX-ROADMAP.md) against the code and the project's own briefs, and (2) fixes to the motion that ships today.

**Summary.** The roadmap's §1 rules are right, and the motion that's built is mostly good: CSS scroll-driven reveals, WebGL that loads only on capable desktops, a global reduced-motion rule, and a theme switch with a fallback. The roadmap document itself is out of date, and in several places it contradicts the landing brief ([`marketing/landing/DESIGN_BRIEF.md`](../../src/features/marketing/landing/DESIGN_BRIEF.md)) and the portal motion brief ([`DESIGN_BRIEF-PORTAL-UX-MOTION.md`](../DESIGN_BRIEF-PORTAL-UX-MOTION.md)). The briefs are newer and more specific, so they win.

---

## Part 1 — Roadmap review, section by section

| Roadmap item | Verdict | Reason |
|---|---|---|
| §1 Rules | ✅ Keep, with 2 corrections | `filter` is listed as GPU-safe ([line 14](../15-ANIMATION-AND-UX-ROADMAP.md#L14)), but `blur()` costs a lot of paint, so list only `transform` and `opacity`. The portal rule says 150–250ms, but `.ui-page-enter` runs 280ms (M5) |
| §2.1 Floating currency coins | ❌ Drop | Landing brief: "ISP hardware, not money… no coins or money imagery" |
| §2.1 Ticker "100K+ / 99.99% / 500+ ISPs" | ❌ Drop | Invented numbers. `PRODUCT.md` and the brief's truth rules forbid them. The page already reads real totals from `/v1/public/stats` and hides missing ones |
| §2.1 Border beam on "Live gateway" badge | ❌ Drop | Brief: "No eyebrow badge above headings" |
| §2.1 3D tilt, magnetic CTA, FiberScene | ✅ Done | `TiltCard`, `Magnetic`, `FiberScene` (desktop, fine pointer, 4+ cores, WebGL2, motion allowed) |
| §2.1 Payment beam / §2.3 SVG circuit path | ✅ Done differently | `PaymentJourney` + `PaymentMatchedCard` + `.lp-circuit` motif |
| §2.2 Partner logo marquee | ❌ Drop | Brief: partner logos stay off until they are real and permissioned |
| §2.4 ROI spring counters | ⚠️ Optional | `RoiSection` exists. A spring is fine; the numbers must stay honest |
| §2.5 Integrations orbit | ✅ Done | `IntegrationsOrbit` |
| §3.1 KPI count-up | ✅ Done | `NumberFlow` on admin and customer dashboards. Fix its format (S3), not its motion |
| §3.1 Dual-ring ping on every router/OLT | ❌ Drop | Infinite motion on a dense ops screen is noise, and the briefs forbid ping decorations. A status dot plus text is enough. "100% heartbeat sync" needs real data |
| §3.1 Chart stroke-draw on load | ⚠️ Optional | Only if it plays once. Never on refetch |
| §3.1 WebSocket live feed row | ⏸ Blocked | There is no WebSocket or SSE anywhere in the app. Needs backend first. Until then, poll with React Query `refetchInterval` |
| §3.2 Staggered table rows (15ms/row) | ❌ Drop | Forbidden by the portal brief. 50 rows × 15ms ≈ 750ms before the last row shows, and it replays on every page, sort and filter |
| §3.2 RX power needle | ❌ Replace | A bar plus the number and a colour band reads faster than a needle |
| §3.2 Speed-test sweep | ⏸ Blocked | No speed-test feature exists |
| §3.2 MAC-bind lock morph | ⚠️ Optional | Small; fine as a CSS icon swap |
| §3.3 Gateway card select | ✅ Keep | Use tokens, not inline brand hex |
| §3.3 POS slip slide-up | ⚠️ Optional | The print preview must open instantly. Keep the motion ≤200ms |
| §3.3 Spinner → ✓ on payment submit | ✅ Do | Real feedback on a money action |
| §3.4 CPU/RAM rings, red above 80% | ✅ Do | Real state. Always show the number too |
| §3.4 Sync spins until the response, then ✓ | ✅ Do | Real feedback |
| §3.4 FTTH map light pulses | ⚠️ Only for faults | Pulse only broken paths, and also mark them with a dash pattern or label (colour must not be the only signal) |
| §4.1 Validity ring | ✅ Do | See [C4](03-CUSTOMER-PORTAL.md#c4--validity-ring-on-the-dashboard) |
| §4.1 Router reboot 60s countdown | ⚠️ Only with real status | A fake timer misleads. Poll the router state and show "Back online" when it really is |
| §4.1 Scratch-card rewards | ❌ Drop | A gimmick on a billing portal, unusable by keyboard or screen reader, and the customer brief rules out decoration |
| §4.1 Bottom-nav sliding pill | ⚠️ Optional | Small. The nav order matters more ([C2](03-CUSTOMER-PORTAL.md#c2--bottom-nav-priorities-decision-needed)) |
| §5.1 Circular theme switch | ✅ Done, good | View Transition from the click point, with a reduced-motion fallback |
| §5.2 ⌘K scale-in | ✅ Keep | |
| §5.3 Bell shake | ✅ Keep, once | One shake per new alert, never looped |
| §5.4 Shimmer skeletons | ✅ Keep | |
| §5.5 Field shake | ✅ Exists | `.animate-field-shake`, disabled under reduced motion |
| §6 Phase status | ❌ Out of date | Phase 2 "KPI count-up" and most of Phase 4 are done but still unchecked. See M7 |

**Missing from the roadmap:** shared timing tokens (M5), rules for exits and interruptions (what happens when the user clicks again mid-animation), a touch equivalent for every hover effect, and a performance budget for low-end Android.

---

## Part 2 — Fixes to the motion that ships today

| ID | Fix | Effort |
|---|---|---|
| M1 | `.lp-glow` animates `left`/`top` → move it with `transform` | S |
| M2 | Hero words animate `blur(10px)` → drop the blur on small screens | S |
| M3 | `transition-all` in 17 files → list the properties | S |
| M4 | Delete unused motion components | S |
| M5 | Shared timing tokens; portal page-enter 280ms → 200ms | S |
| M6 | `animate-ping` on the customer online dot → static | S |
| M7 | Update `15-ANIMATION-AND-UX-ROADMAP.md` to match Part 1 | S |

### M1 — `.lp-glow` follows the pointer with layout properties

`PointerGlow` (in [`motion-kit.tsx`](../../src/features/marketing/landing/components/motion-kit.tsx)) sets `--gx`/`--gy` on every pointer move, and [`.lp-glow`](../../src/app/globals.css#L337-L353) uses them as `left`/`top` with a 600ms `transition` on `left` and `top`. That causes layout work on every frame, which breaks the roadmap's own rule #1. Fix: keep `left: 50%; top: 50%`, and move it with `transform: translate(calc(-50% + var(--dx)), calc(-50% + var(--dy)))` plus `transition: transform`. Set `--dx`/`--dy` in px from the handler.

### M2 — Blur on every hero word

[`.lp-rise-word`](../../src/app/globals.css#L229-L239) animates `filter: blur(10px)` on each headline word during the first paint. On low-end Android that is the most expensive moment of the page. Fix: keep the translate and opacity rise, but wrap the blur in `@media (min-width: 768px)`, or remove it.

### M3 — `transition-all`

Commit `015f045` removed most of these, but 17 files still use it, including shared primitives that every screen inherits:
`components/ui/{tabs,badge,accordion,switch,sidebar}.tsx`, `features/shared/data-table/components/DataTable.tsx`, and the pages `AllCustomersPage`, `ExpiredCustomersPage`, `NetflowPage` (2), `SmsPage`, `EmployeesPage`, `WhatsAppCampaignsPage`, `BtrcReportPage`, `OtcReportPage`, `OltPage`, `OltDiagnosticsModal`, plus `radial-orbital-timeline.tsx` (deleted by M4). Replace each with the properties that actually change, for example `transition-[color,background-color,border-color]`.

### M4 — Unused motion components

Nothing imports these:
- `src/components/motion/GlareSurface.tsx`
- `src/components/motion/MagneticTabs.tsx`
- ~~`src/components/motion/Magnetic.tsx`~~ — **kept**: `MorphArrowButton` (the mobile sticky CTA) imports it.
- `src/components/ui/radial-orbital-timeline.tsx`
- `src/components/motion/index.ts` (a barrel nobody imports; call sites import files directly)

Delete them. They pull Framer-based code into the portal component folder that the "no Framer on portals" rule says shouldn't be there.

### M5 — Shared timing tokens

The same curves are typed by hand everywhere (`cubic-bezier(0.16, 1, 0.3, 1)` and `cubic-bezier(0.22, 1, 0.36, 1)`). Add tokens in `globals.css` and use them in the `.ui-*`, `.ipb-sidebar-*` and `.lp-*` rules:

```css
:root {
  --ease-out-ui: cubic-bezier(0.16, 1, 0.3, 1);
  --ease-out-marketing: cubic-bezier(0.22, 1, 0.36, 1);
  --dur-press: 160ms;   /* buttons, toggles */
  --dur-ui: 200ms;      /* panels, menus, page enter */
  --dur-marketing: 700ms;
}
```

Set `.ui-page-enter` to `--dur-ui` (200ms, inside the roadmap's 150–250ms rule).

### M6 — Ping on the customer online dot

[`CustomerDetailPage.tsx:152`](../../src/features/admin/customers/pages/CustomerDetailPage.tsx#L152) pings forever when the subscriber is online, and the only text is a `title`. The customers brief allows no motion beyond CSS hover. Replace it with a static dot plus a visible "Online" / "Offline" label (`StatusBadge` with `online` / `offline`).

### M7 — Update the roadmap document

Edit `15-ANIMATION-AND-UX-ROADMAP.md`:
1. Remove the ❌ rows from Part 1 (coins, invented ticker, badge beam, marquee, staggered rows, ping rings, scratch card).
2. Mark the ⏸ rows as blocked, with the reason.
3. Tick the items that are done (§6 Phase 2 count-up; Phase 4 tilt, journey, orbit).
4. Fix §1: only `transform` and `opacity` are cheap; portal timings follow the M5 tokens.
5. Add one line at the top: "Where this conflicts with a `DESIGN_BRIEF.md`, the brief wins."


---

## What was built

| Fix | Result |
|---|---|
| M1 | `.lp-glow` rests at 50%/70% and is moved with the individual `translate` property (`--dx`/`--dy`, set by `PointerGlow`); `left`/`top` are no longer animated. |
| M2 | `.lp-rise-word` uses opacity+translate on phones; the 10px blur keyframes apply from 768px up. |
| M3 | `transition-all` removed everywhere (progress bars use `transition-[width]`; UI primitives list their properties). A ratchet test forbids it. |
| M4 | Deleted `GlareSurface`, `MagneticTabs`, `radial-orbital-timeline` and the unused `components/motion/index.ts` barrel. `Magnetic.tsx` stays (used by `MorphArrowButton`). |
| M5 | Timing tokens in `:root` (`--ease-out-ui`, `--ease-out-marketing`, `--dur-press`, `--dur-ui` = 200ms, `--dur-marketing`); `.ui-page-enter` now 200ms. |
| M6 | The infinite ping on the customer online dot and the pulsing "Online" badge dot are gone (text label stays). |
| M7 | `15-ANIMATION-AND-UX-ROADMAP.md` carries a status banner and the review verdicts (see that file). |
| + | New motion that earns its place: the customer **validity ring** (CSS transition, once), collapsible sidebar groups (CSS), confirmation dialogs. |
