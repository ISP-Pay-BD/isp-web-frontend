# 15 — Animation & UX Motion Roadmap

> **Target:** Complete UI/UX animation blueprint for **ISP Pay BD** (`isp-web-frontend`).
> **Goal:** Transform the platform into a high-end, responsive, delightful, and ultra-fast application (Linear / Stripe / 21st.dev standard) without any UI sluggishness or frame drops.

---

## 1. Core Principles & Performance Rules

To ensure animations delight the user **without slowing down their workflow**, all implementations must adhere to these strict rules:

| Rule | Directive | Technical Constraint |
| :--- | :--- | :--- |
| **GPU Acceleration Only** | Never animate layout properties (`width`, `height`, `top`, `left`, `margin`, `padding`). | Animate **strictly** with `transform`, `opacity`, `filter`, and `clip-path`. |
| **Snappy Durations** | Administrative actions must feel instant, not cinematic. | **Portals:** `150ms – 250ms` (cubic-bezier `0.2, 0, 0, 1`).<br>**Marketing / Landing:** `400ms – 700ms` (spring / ease-out). |
| **Separation of Concerns** | Heavy libraries must stay on the landing page. | **Marketing:** Framer Motion + Three.js (`FiberScene`).<br>**Portals:** CSS-only transitions & keyframes (`globals.css`) for instant data interactions. |
| **Accessibility Gate** | Respect user motion preferences automatically. | Wrap with `prefers-reduced-motion: reduce` (`@media (prefers-reduced-motion: reduce)` in CSS or `useMotionSafe` in JS). |
| **Zero Layout Shift (CLS)** | Never cause page elements to jump during entrance. | Pre-reserve DOM heights and sizes using CSS aspect-ratios or fixed skeletons. |

---

## 2. Marketing & Landing Page (`/`)

The marketing site is designed to convert visitors and give a "WOW" first impression.

### 2.1 Hero Section
* **3D Fiber & Currency Particles (`FiberScene`)**:
  * Canvas-rendered fiber optic strands and floating currency coins with subtle cursor-driven parallax depth.
* **Interactive Perspective Mockup Shift**:
  * Hovering over the `OperatorConsole` or `SubscriberPhone` applies a subtle 3D tilt (`rotateX`, `rotateY`) with dynamic specular border reflection.
* **Live Simulated Payment Beam (21st.dev style)**:
  * An animated glowing beam connecting: `Subscriber Mobile Phone` ➔ `bKash Payment Gateway` ➔ `MikroTik API Engine` ➔ `Active PPPoE Session`.
* **Animated Number Ticker**:
  * Live stats (`100K+ Subscribers`, `99.99% Uptime`, `500+ ISPs`) count up smoothly from zero on initial viewport entrance.
* **Border Beam on Hero Badge**:
  * A continuous subtle light beam cycling around the "Live gateway" badge.
* **Magnetic CTA Buttons**:
  * Primary "Get Started Free" button pulls gently toward the cursor on hover with a spring reset.

### 2.2 Proof Strip & Partners
* **Smooth Infinite Marquee**:
  * ISP partner logos and technology badges scroll infinitely across the horizontal track, pausing gracefully on mouse hover.

### 2.3 Payment Reconciliation Journey
* **Animated SVG Path Tracing**:
  * As the user scrolls, a glowing SVG circuit path lights up step-by-step:
    1. *Customer sends payment via bKash/Nagad app*
    2. *Webhook receives transaction & parses TrxID in < 2.5s*
    3. *Database auto-matches invoice balance*
    4. *MikroTik router unlocks PPPoE / hotspot instantly*

### 2.4 ROI & Pricing Sliders
* **Elastic Spring Counters**:
  * Dragging the customer count slider (e.g. from 200 to 2,000 customers) updates the monthly collection and saved hours with real-time spring physics.

### 2.5 Integrations Planetary Orbit
* **Orbital Node Hover**:
  * MikroTik, Cisco, Huawei, bKash, and Nagad icons rotate around a central ISP Pay BD core with magnetic tooltip snap.

---

## 3. Admin Portal (`/admin`)

The Admin Portal is the core operations center. Animations here must prioritize tactile feedback and high density.

### 3.1 Operations Dashboard (`/admin/dashboard`)
* **Rolling Odometer KPI Counters**:
  * Today's Collection (`৳ ৪,৮২,৫০০`), Active Subscribers, and Expired Users count up on page load with formatted currency separators.
* **Dual-Ring Server Status Ping**:
  * Live MikroTik and OLT connection indicators display an emerald pulsing beacon ring (`animate-ping`) indicating 100% heartbeat sync.
* **Bandwidth & Traffic Graph Entry**:
  * Real-time MRTG / traffic charts render with an animated stroke-dashoffset reveal from left to right.
* **Live Feed Insertions**:
  * When a new transaction arrives via WebSocket, the row slides down into the feed with a subtle golden glow before settling.

### 3.2 Customer Management (`/admin/customers` & `/admin/customers/[id]`)
* **Staggered Table Rows**:
  * Customer tables load with a rapid 15ms staggered fade-up per row, creating a crisp cascading feel.
* **Optical RX Power Meter**:
  * Fiber signal gauge (`-19.5 dBm`) animates a needle from zero to the exact calibrated signal health (Green: Good, Yellow: Warning, Red: High Loss).
* **Speed Test Sweep**:
  * Bandwidth verification test sweeps the dial smoothly to the customer's provisioned package rate.
* **MAC Bind Switch**:
  * Toggling MAC lock triggers a micro lock-snap icon morph.

### 3.3 Customer Billing & Payments (`/admin/customer-payments`)
* **Payment Gateway Card Selection**:
  * Selecting bKash, Nagad, or Cash scales the active card with an illuminated brand border (`#E2136E` for bKash, `#F7941D` for Nagad).
* **Instant Thermal POS Slip Preview**:
  * Clicking "Print Receipt" slides up a thermal POS receipt voucher with an accordion slip reveal.
* **Success Checkmark Morph**:
  * Submitting a bill payment transitions the button icon from spinner to a checkmark with a subtle green pulse.

### 3.4 MikroTik & Network Topology (`/admin/routers` & `/admin/network/map`)
* **CPU & Memory Wave Gauges**:
  * Circular progress rings fill smoothly according to the live router load (transitions to red above 80%).
* **Sync Button Spin**:
  * Clicking "Sync MikroTik" spins the sync icon 360° continuously until response returns, snapping to a green checkmark.
* **FTTH Map Light Pulses**:
  * On the network topology canvas, light pulses travel along fiber routes between OLT ports and client splitters. Broken paths pulse red.

---

## 4. Customer Self-Care Portal (`/customer`)

End-users require clean, reassuring, and intuitive interactions.

### 4.1 Customer Dashboard (`/customer/dashboard`)
* **Circular Remaining Days Ring**:
  * An animated circular progress bar showing remaining package validity (e.g., "7 Days Left") that fills on entrance and glows amber under 3 days.
* **Wi-Fi Password Update & Router Reboot**:
  * Clicking "Reboot Router" launches a circular 60-second animated radial countdown timer.
* **Interactive Loyalty Rewards (`/customer/rewards`)**:
  * Digital scratch-card with interactive canvas cursor revealing loyalty points upon completing bill payments.
* **Mobile Floating Navigation Pill**:
  * Switching tabs between Dashboard, Pay Bill, and Router smoothly slides an elastic indicator pill across bottom icons.

---

## 5. Global & Architectural Motion Components

### 5.1 Circular View Transition Theme Switch (Implemented)
* **Location:** [ThemeToggle.tsx](file:///Users/bluebayit/Documents/GitHub/isp-web-frontend/src/components/layout/ThemeToggle.tsx)
* **Technique:** `document.startViewTransition` with dynamic `circle(0px at x y)` ➔ `circle(radius at x y)` clip-path reveal.
* **Features:**
  * 550ms `cubic-bezier(0.22, 1, 0.36, 1)` easing from click coordinates.
  * 500ms rotating icon transition (`Sun` ↔ `Moon`).
  * Works across header button, ⌘K command palette, and Theme Studio modal.

### 5.2 Command Palette (`⌘K`)
* **Action:** Pressing `⌘K` or `Ctrl+K`.
* **Motion:** `scale-95` ➔ `scale-100` with `backdrop-blur-md` and instant auto-focus.

### 5.3 Notification Bell
* **Motion:** Subtle bell shake/ring keyframe animation on new unread network alerts.

### 5.4 Loading Skeletons
* **Pattern:** Textured shimmer (`@keyframes shimmer`) sweeping across placeholder boxes during fetch, avoiding blank white screens.

### 5.5 Form Validation Feedback
* **Action:** Submitting invalid inputs or credentials.
* **Motion:** 3-cycle horizontal micro-shake (`@keyframes field-shake`) mimicking native OS authentication feedback.

---

## 6. Implementation Roadmap & Phases

```
Phase 1: Foundation & Global Motion (COMPLETED)
├── [x] Circular View Transition Theme Switch
├── [x] Global View Transition CSS rules in globals.css
└── [x] Command Palette & Theme Studio integration

Phase 2: Admin Dashboard & Metrics (NEXT)
├── [ ] Odometer / Ticker count-up component for KPI cards
├── [ ] Live dual-ring ping pulse for RouterOS / OLT status
├── [ ] Stroke-draw animation on MRTG traffic charts
└── [ ] Staggered table row entrance helper

Phase 3: Customer Portal Delight
├── [ ] Circular validity days progress ring
├── [ ] Router reboot cooldown timer animation
├── [ ] Payment gateway card radio transition
└── [ ] Elastic floating navigation pill for mobile

Phase 4: Marketing Hero & Visual Polish
├── [ ] Interactive 3D tilt on console & phone mockups
├── [ ] Live simulated payment beam flow
├── [ ] Infinite partner logo marquee
└── [ ] SVG circuit path draw for payment journey
```

---

## 7. Code References & Existing Components

* **Theme Switcher:** [ThemeToggle.tsx](file:///Users/bluebayit/Documents/GitHub/isp-web-frontend/src/components/layout/ThemeToggle.tsx)
* **Global Styles & Keyframes:** [globals.css](file:///Users/bluebayit/Documents/GitHub/isp-web-frontend/src/app/globals.css#L697-L711)
* **Page Motion Wrapper:** [PortalPageMotion.tsx](file:///Users/bluebayit/Documents/GitHub/isp-web-frontend/src/components/layout/PortalPageMotion.tsx)
* **Command Palette:** [CommandPalette.tsx](file:///Users/bluebayit/Documents/GitHub/isp-web-frontend/src/features/shared/command-palette/CommandPalette.tsx)
* **Marketing Motion Utilities:** [motion-kit.tsx](file:///Users/bluebayit/Documents/GitHub/isp-web-frontend/src/features/marketing/landing/components/motion-kit.tsx)
