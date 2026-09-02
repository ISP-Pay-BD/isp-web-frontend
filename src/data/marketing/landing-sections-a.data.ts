/**
 * WT01 — Landing sections 1–14 content (hero through integrations).
 * Composed from base marketing data files for mock-api + landing page.
 */

import { landingData } from './landing.data';
import { landingSections, landingFaqExtended, landingTestimonialsExtended } from './sections.data';
import { paygCalculator, pricingTiers } from './pricing.data';

const featureBullets: Record<string, string[]> = {
  f1: ['Auto SMS reconciliation', 'bKash & Nagad instant match', 'Zero disputes'],
  f2: ['Real-time PPPoE sync', 'Hotspot user management', 'Bandwidth queues'],
  f3: ['POP ledger tracking', 'Sub-reseller quotas', 'Automated commissions'],
};

const featureBadges: Record<string, string> = {
  f2: 'Advanced',
  f3: 'Popular',
};

export const landingSectionsAData = {
  hero: landingData.hero,
  stats: landingData.stats,
  features: landingData.features.map((feature) => ({
    ...feature,
    badge: featureBadges[feature.id],
    bullets: featureBullets[feature.id],
  })),
  benefits: [
    {
      title: 'Control your whole network from one screen',
      desc: 'Unlimited MikroTik routers, PPPoE + hotspot sync, and live OLT optical-power per ONU. Expiry cuts the line, payment brings it back — no one SSHes into a router by hand.',
      stats: [
        { label: 'PPPoE', value: 'online' },
        { label: 'routers', value: 'unlimited' },
        { label: 'sync', value: 'real-time' },
      ],
    },
    {
      title: 'Run a branded reseller network',
      desc: 'Their logo, their customers, their MikroTik — commission split automatically the moment a bKash or Nagad payment settles.',
    },
    {
      title: 'Priced like an ISP, not a startup',
      desc: 'Flat monthly for predictability, or pay-as-you-go per active subscriber. No seat limits, no per-router fees, no surprise tier wall at 1,000 customers.',
    },
  ],
  whyChoose: [
    {
      title: 'Built to Save You Time',
      desc: 'Automate billing, reminders & collections so your team can focus on network expansion.',
      icon: 'Clock',
    },
    {
      title: 'Built for Uptime',
      desc: 'Cloud-hosted with daily auto backups, failover redundancy, and 99.9% uptime SLA.',
      icon: 'ShieldCheck',
    },
    {
      title: 'Local Support Team',
      desc: 'Bangladesh-based, ISP-expert technical support available 24/7 in Bangla and English.',
      icon: 'Headset',
    },
    {
      title: 'Pay-As-You-Go Wallet',
      desc: 'Prepay balance · Auto-deduct monthly · Low per-customer rates without tier limits.',
      icon: 'Wallet',
    },
  ],
  howItWorks: [
    {
      step: 1,
      title: 'Connect MikroTik',
      desc: 'Add your RouterOS IP and API credentials. We sync active PPPoE and hotspot queues in seconds.',
    },
    {
      step: 2,
      title: 'Import customers',
      desc: 'Upload an Excel list or let us migrate your existing subscriber profiles and package dues.',
    },
    {
      step: 3,
      title: 'Enable payments',
      desc: 'Connect your bKash merchant or personal number. Invoices auto-generate with SMS reminders.',
    },
    {
      step: 4,
      title: 'Go live on autopilot',
      desc: 'Customers pay and reconnect instantly; expired lines disconnect automatically at 12:00 AM.',
    },
  ],
  productPreview: [
    {
      id: 'billing',
      label: 'Billing & Invoicing',
      bullets: [
        'Auto invoices, SMS reminders, and bKash/Nagad collection',
        'Payment reconciliation matched to the right subscriber',
        'Expiry disconnect and paid reconnect on autopilot',
      ],
      metrics: [
        { label: 'Collection Rate', val: '98.4%' },
        { label: 'Average Reconcile Time', val: '0.8s' },
        { label: 'Unpaid Invoices Auto-SMS', val: 'Active' },
      ],
    },
    {
      id: 'mikrotik',
      label: 'MikroTik Sync',
      bullets: [
        'PPPoE and hotspot user sync in real time',
        'Online/offline live ping and uptime status per customer',
        'Unlimited routers connected on every plan',
      ],
      metrics: [
        { label: 'Active PPPoE Sessions', val: '1,420' },
        { label: 'Routers Connected', val: '8 / 8' },
        { label: 'Sync Latency', val: '< 250ms' },
      ],
    },
    {
      id: 'olt',
      label: 'OLT / Optical Fiber',
      bullets: [
        'Huawei and ZTE GPON/EPON port optical power monitoring',
        'Live ONU signal Rx/Tx dBm diagnostics to identify fiber cuts',
        'Batch MAC bind and ONU reboot controls from panel',
      ],
      metrics: [
        { label: 'Online ONUs', val: '942' },
        { label: 'Low Signal Alerts (< -27 dBm)', val: '14' },
        { label: 'OLT Frame Uptime', val: '99.98%' },
      ],
    },
    {
      id: 'reports',
      label: 'BTRC & Accounting',
      bullets: [
        'Revenue, collection, and subscriber growth dashboards',
        'BTRC-ready subscriber demographic and bandwidth reports',
        'Area, package, and reseller performance audit trails',
      ],
      metrics: [
        { label: 'Monthly Gross Billing', val: '৳1,485,000' },
        { label: 'BTRC Report Status', val: 'Compliant' },
        { label: 'Reseller Commission Split', val: 'Automated' },
      ],
    },
  ],
  reconciliation: [
    {
      step: '01 · ingest',
      title: 'Payment SMS arrives',
      desc: 'Subscriber pays via bKash or Nagad merchant/personal number, or initiates payment via customer app.',
      metric: 'real-time',
      metricHighlight: 'read instantaneously',
    },
    {
      step: '02 · match',
      title: 'Fingerprinted to subscriber',
      desc: 'System cross-references TrxID, sender phone, and invoice balance against database records.',
      metric: '98%+',
      metricHighlight: 'matched first try',
    },
    {
      step: '03 · reconnect',
      title: 'Paid, extended, online',
      desc: 'Invoice closes, expiry rolls forward, and RouterOS API triggers line unblock in under a second.',
      metric: '~0.8s',
      metricHighlight: 'end-to-end speed',
    },
  ],
  roi: landingSections.roi,
  pricing: {
    plans: pricingTiers.map((tier) => ({
      id: tier.id,
      name: tier.name,
      priceBdt: tier.priceBdt,
      period: tier.period,
      customers: tier.customers ? `Up to ${tier.customers.toLocaleString()}` : 'Unlimited',
      features: [...tier.features],
      highlighted: tier.highlight,
    })),
    payg: { ...paygCalculator },
  },
  comparison: {
    headers: ['Capability', 'ISP Pay BD', 'The panel you have now'],
    rows: [
      { capability: 'Auto bKash/Nagad reconciliation', us: true, legacy: 'Manual SMS matching' },
      { capability: 'Scoped staff & reseller roles, 24 permission modules', us: true, legacy: 'One shared admin login' },
      { capability: 'Branded customer app included', us: true, legacy: 'Not available' },
      { capability: 'Unlimited MikroTik routers', us: true, legacy: 'Per-router license fees' },
      { capability: 'No-cap Pay-As-You-Go billing', us: true, legacy: 'Rigid tier limits' },
      { capability: 'Local Bangla support & training', us: true, legacy: 'English-only docs' },
      { capability: 'Free migration from current panel', us: true, legacy: 'DIY manual import' },
      { capability: 'Auto disconnect/reconnect on billing', us: true, legacy: 'Semi-manual SSH scripting' },
    ],
  },
  testimonials: landingTestimonialsExtended.slice(0, 3).map((t) => ({
    name: t.name,
    role: t.role,
    quote: t.quote,
    rating: t.rating ?? 5,
  })),
  faq: landingFaqExtended,
  integrations: [
    { name: 'MikroTik RouterOS', category: 'Network', icon: 'Server' },
    { name: 'bKash Merchant & Personal', category: 'Payment', icon: 'CreditCard' },
    { name: 'Nagad Gateway', category: 'Payment', icon: 'CreditCard' },
    { name: 'SSLCommerz', category: 'Payment', icon: 'CreditCard' },
    { name: 'WhatsApp Business API', category: 'Comms', icon: 'MessageSquare' },
    { name: 'Local Bulk SMS Gateways', category: 'Comms', icon: 'MessageCircle' },
    { name: 'Huawei OLT GPON/EPON', category: 'Fiber', icon: 'Radio' },
    { name: 'ZTE OLT Platform', category: 'Fiber', icon: 'Radio' },
    { name: 'Cisco & Juniper Routers', category: 'Network', icon: 'Cpu' },
    { name: 'RADIUS AAA & vBNG', category: 'Auth', icon: 'ShieldCheck' },
  ],
};
