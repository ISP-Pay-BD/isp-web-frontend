/**
 * WT01 — Landing sections 1–14 content (hero through integrations).
 * Composed from base marketing data files for mock-api + landing page.
 */

import { landingData } from './landing.data';
import { landingSections } from './sections.data';
import { paygCalculator, pricingTiers } from './pricing.data';

const featureBullets: Record<string, string[]> = {
  f1: ['Business Dashboard', 'Accounting Dashboard', 'Real-time KPIs'],
  f2: ['OLT Port & Optical Power', 'ONU MAC Address', 'Online/Offline Status'],
  f3: ['Business Configuration', 'Location Configuration', 'Package Setup'],
  f4: ['Company Management', 'Branch Management', 'Centralized Control'],
  f5: ['Client Management', 'Billing Management', 'Support Tickets'],
  f6: ['Bandwidth Purchase', 'Product Purchase', 'Stock Tracking'],
  f7: ['MAC Reseller Portal', 'Bandwidth Reseller', 'Commission Tracking'],
  f8: ['Monthly Auto Bill Generation', 'Download & Print Invoice', 'Auto Bill Reminder SMS'],
  f9: ['Unlimited Router Sync', 'PPPoE & Hotspot', 'Online Monitoring'],
  f10: ['Client Self-Payment', 'bKash, Nagad, SSLCommerz', 'Secured Transactions'],
  f11: ['Bill Reminders', 'Expiry Alerts', 'Custom Templates'],
  f12: ['Revenue Reports', 'Subscriber Analytics', 'Export to Excel'],
};

const featureBadges: Record<string, string> = {
  f2: 'Advanced',
  f3: 'Popular',
  f6: 'Updated',
  f8: 'New',
  f9: 'Popular',
  f10: 'Core',
};

const fullFeatureList = [
  {
    id: 'f1',
    title: 'Business & Accounting Dashboards',
    titleBn: 'বিজনেস ও অ্যাকাউন্টিং ড্যাশবোর্ড',
    desc: 'Real-time executive summaries, daily cash collections, expenses, and subscriber KPIs.',
    descBn: 'রিয়েল-টাইম আয়-ব্যয় এবং গ্রাহক বৃদ্ধির সারাংশ।',
    icon: 'PieChart',
  },
  {
    id: 'f2',
    title: 'OLT Management',
    titleBn: 'OLT ও অপটিক্যাল পাওয়ার',
    desc: 'Monitor Huawei & ZTE OLT ports, ONU optical Rx/Tx power dBm, and detect fiber degradation.',
    descBn: 'Huawei ও ZTE OLT পোর্ট এবং ONU সিগন্যাল পাওয়ার মনিটরিং।',
    icon: 'Radio',
  },
  {
    id: 'f3',
    title: 'Business & Location Config',
    titleBn: 'বিজনেস ও লোকেশন কনফিগ',
    desc: 'Configure coverage areas, sub-zones, POP nodes, and package speed profile tiers.',
    descBn: 'এরিয়া, সাব-জোন, এবং প্যাকেজ স্পিড প্রোফাইল সেটআপ।',
    icon: 'Settings',
  },
  {
    id: 'f4',
    title: 'Multi-Branch Management',
    titleBn: 'মাল্টি-ব্রাঞ্চ ম্যানেজমেন্ট',
    desc: 'Operate multiple branches or sister networks from one master tenant account.',
    descBn: 'একাধিক শাখা এবং নেটওয়ার্ক এক প্ল্যাটফর্ম থেকে পরিচালনা করুন।',
    icon: 'Network',
  },
  {
    id: 'f5',
    title: 'Subscriber CRM & Support',
    titleBn: 'গ্রাহক সিআরএম ও সাপোর্ট',
    desc: 'Track full customer lifecycle, billing history, and support tickets with SLA timers.',
    descBn: 'গ্রাহক তথ্য, বিলিং ইতিহাস এবং সাপোর্ট টিকেট ম্যানেজমেন্ট।',
    icon: 'Users',
  },
  {
    id: 'f6',
    title: 'Purchase & Inventory',
    titleBn: 'ক্রয় ও ইনভেন্টরি স্টক',
    desc: 'Track upstream bandwidth purchase, router/ONU hardware stock, and equipment requisitions.',
    descBn: 'ব্যান্ডউইথ ক্রয়, ডিভাইস স্টক এবং রিকুইজিশন ট্র্যাকিং।',
    icon: 'Boxes',
  },
  {
    id: 'f7',
    title: 'Reseller & POP Management',
    titleBn: 'রিসেলার ও POP ম্যানেজমেন্ট',
    desc: 'Dedicated MAC reseller portal, bandwidth reselling, and automatic commission settlements.',
    descBn: 'ম্যাক রিসেলার পোর্টাল, ব্যান্ডউইথ বিক্রি ও অটো কমিশন হিসাব।',
    icon: 'Handshake',
  },
  {
    id: 'f8',
    title: 'Billing Management & Invoicing',
    titleBn: 'বিলিং অটোমেশন ও ইনভয়েস',
    desc: 'Monthly auto bill generation, PDF invoice printing, and automated overdue reminder SMS.',
    descBn: 'স্বয়ংক্রিয় মাসিক বিল তৈরি, ইনভয়েস প্রিন্ট এবং বকেয়া এসএমএস রিমাইন্ডার।',
    icon: 'FileText',
  },
  {
    id: 'f9',
    title: 'MikroTik RouterOS Integration',
    titleBn: 'মাইক্রোটিক রাউটার সিঙ্ক',
    desc: 'Unlimited router sync, real-time PPPoE and hotspot user disconnect on expiry and reconnect on payment.',
    descBn: 'আনলিমিটেড রাউটার কানেক্ট, পেমেন্টে রিকানেক্ট এবং মেয়াদে ডিসকানেক্ট।',
    icon: 'Server',
  },
  {
    id: 'f10',
    title: 'Automated Payment Gateways',
    titleBn: 'পেমেন্ট গেটওয়ে অটোমেশন',
    desc: 'Direct integration with bKash, Nagad, Rocket, SSLCommerz, and manual cashier collections.',
    descBn: 'বিকাশ, নগদ, রকেট ও এসএসএলকমার্জ স্বয়ংক্রিয় পেমেন্ট ম্যাচিং।',
    icon: 'CreditCard',
  },
  {
    id: 'f11',
    title: 'SMS & WhatsApp Automation',
    titleBn: 'এসএমএস ও হোয়াটসঅ্যাপ এলার্ট',
    desc: 'Bangla SMS templates, invoice links, payment receipt confirmations, and promotional broadcasts.',
    descBn: 'বাংলা এসএমএস এবং হোয়াটসঅ্যাপে ইনভয়েস লিংক ও পেমেন্ট রিসিট।',
    icon: 'MessageSquare',
  },
  {
    id: 'f12',
    title: 'Reports & BTRC Analytics',
    titleBn: 'রিপোর্টস ও বিটিআরসি অ্যানালিটিক্স',
    desc: 'Detailed revenue collections, unpaid aging, subscriber bandwidth charts, and BTRC-ready exports.',
    descBn: 'আদায় বিবরণী, বকেয়া তালিকা এবং বিটিআরসি প্রস্তুত রিপোর্ট।',
    icon: 'BarChart',
  },
];

export const landingSectionsAData = {
  hero: landingData.hero,
  stats: landingData.stats,
  features: fullFeatureList.map((feature) => ({
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
      title: 'Connect your MikroTik',
      desc: 'Add RouterOS IP and API credentials. Active PPPoE and hotspot users sync within seconds.',
    },
    {
      step: 2,
      title: 'Import your subscribers',
      desc: 'Upload Excel or migrate from your current panel. Packages, areas, and dues stay intact with zero downtime.',
    },
    {
      step: 3,
      title: 'Enable bKash & Nagad',
      desc: 'Connect merchant or personal numbers. Invoices generate automatically with Bangla SMS reminders.',
    },
    {
      step: 4,
      title: 'Go live on autopilot',
      desc: 'Paid customers reconnect instantly. Expired lines disconnect at midnight without manual SSH.',
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
      step: 'Step 1',
      title: 'Payment notification received',
      desc: 'A subscriber pays via bKash, Nagad, or the customer app. The SMS or gateway callback reaches ISP Pay BD immediately.',
      metric: 'Real-time',
      metricHighlight: 'Instant ingest',
    },
    {
      step: 'Step 2',
      title: 'Matched to the open invoice',
      desc: 'TrxID, sender mobile number, and amount are checked against open invoices so the payment lands on the correct subscriber.',
      metric: '98%+',
      metricHighlight: 'Matched first try',
    },
    {
      step: 'Step 3',
      title: 'Line extended and reconnected',
      desc: 'The invoice closes, expiry moves forward, and RouterOS API restores the PPPoE or hotspot session in under a second.',
      metric: '~0.8s',
      metricHighlight: 'End-to-end latency',
    },
  ],
  desire: {
    scrubLine:
      'Match every payment. Sync every session. Keep every reseller wallet accurate before midnight.',
    title: 'Built for Bangladesh ISP operations',
    subtitle:
      'Collections, MikroTik sync, POP ledgers, and subscriber self-care stay on one operator desk while your network stays online.',
    items: [
      {
        title: 'Live network visibility',
        copy: 'Monitor PPPoE sessions, expiry windows, and optical power alerts from one NOC-friendly surface for night operations.',
      },
      {
        title: 'Automatic payment matching',
        copy: 'bKash and Nagad payments attach to the correct invoice before your accounts team opens a spreadsheet.',
      },
      {
        title: 'Reseller and POP ledgers',
        copy: 'Fund POP wallets, track commissions, and keep every reseller scoped to their customers and cash.',
      },
      {
        title: 'Subscriber self-care',
        copy: 'Offer a branded Bangla app for balance checks, renewals, and tickets so midnight support calls drop.',
      },
    ],
  },
  sectionCopy: {
    featuresTitle: 'One platform, from the ONU port to the ৳ in your account',
    featuresSubtitle:
      'OLT and MikroTik on one side; billing, resellers, and BTRC-ready reports on the other.',
    partnersTitle: 'Trusted on the ground by ISPs in 30+ districts',
    partnersSubtitle: 'Neighborhood networks to multi-branch fiber operators run billing on ISP Pay BD.',
    pricingTitle: 'Priced per subscriber, not per promise',
    pricingSubtitle:
      'Lock a fixed monthly plan for predictable billing, or go pay-as-you-go: base fee plus a low per-customer rate, wallet-funded, no tier ceiling to outgrow.',
    testimonialsTitle: 'What Bangladesh ISP operators say',
    testimonialsSubtitle:
      'Feedback from owners, NOC leads, and accounts teams managing hundreds to thousands of lines.',
    faqTitle: 'Answers before you ask sales',
    faqSubtitle:
      'How billing, MikroTik sync, bKash/Nagad reconciliation, and reseller payouts work on ISP Pay BD.',
  },
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
  testimonials: landingData.testimonials,
  faq: [
    ...landingData.faq,
    {
      q: 'How does POP reseller billing work?',
      a: 'You fund POP wallets. Resellers sell packages to their customers. The ledger tracks funding, sales, and commissions automatically.',
    },
    {
      q: 'Do you support fiber OLT hardware?',
      a: 'Yes. Huawei and ZTE OLT modules cover ONU provisioning, optical power monitoring, and MAC bind controls.',
    },
    {
      q: 'Can customers use Bangla in the portal and app?',
      a: 'Yes. The customer portal, SMS templates, and mobile app support a full Bangla interface alongside English.',
    },
    {
      q: 'What about BTRC compliance reports?',
      a: 'ISP Pay BD includes BTRC-ready subscriber and bandwidth report exports for regulatory filing.',
    },
  ],
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
  pluginsList: [
    { id: 'whatsapp', name: 'WhatsApp Business', category: 'Communications', priceBdt: 500, installed: true, rating: 4.8, installs: 85, desc: 'Expiry alerts, payment confirmations, and bulk campaign broadcasts via WhatsApp Business API.' },
    { id: 'olt-huawei', name: 'Huawei OLT Manager', category: 'Fiber', priceBdt: 1200, installed: false, rating: 4.6, installs: 42, desc: 'GPON/EPON ONU provisioning, signal diagnostics, and MAC bind controls for Huawei OLT hardware.' },
    { id: 'hr-payroll', name: 'HR & Payroll', category: 'Operations', priceBdt: 800, installed: true, rating: 4.5, installs: 63, desc: 'Staff attendance, salary disbursement, advance salary requests, and employee ledger tracking.' },
    { id: 'merchant-webhook', name: 'Merchant Webhooks', category: 'Payment', priceBdt: 300, installed: false, rating: 4.7, installs: 91, desc: 'Real-time HTTP callbacks for payment, expiry, and subscriber events to your internal systems.' },
  ],
  mobileApp: {
    title: 'ISP Pay BD Customer App',
    features: ['Check balance & expiry date instantly', 'Pay via bKash or Nagad in-app', 'Open and track support tickets', 'Full Bangla + English interface'],
    stores: { android: '#', ios: '#' },
  },
  resellerHierarchy: {
    levels: ['Platform (SaaS)', 'Tenant ISP', 'POP Reseller', 'Sub-POP', 'Customer'],
    description: 'Fund POPs, set packages, and scope permissions per level — commission splits automatically on every payment.',
  },
  rolesAccess: [
    { role: 'Super Admin', access: 'All tenants, revenue, platform settings' },
    { role: 'Tenant Admin', access: 'Full ISP operations for one tenant' },
    { role: 'POP Reseller', access: 'Scoped customers, packages, funding' },
    { role: 'Employee', access: 'Salary, attendance, assigned tasks' },
    { role: 'Customer', access: 'Subscription, payments, support' },
  ],
  caseStudy: {
    company: 'FastNet BD',
    location: 'Dhaka & Gazipur',
    customers: 4200,
    quote: 'We cut reconciliation from 3 hours to 15 minutes per day. MikroTik sync just works.',
    results: [
      { metric: '3x faster', label: 'Payment processing' },
      { metric: '40% less', label: 'Support tickets' },
      { metric: '2.1M BDT', label: 'Monthly collections tracked' },
    ],
  },
  partners: [
    'FastNet BD', 'NetLink CTG', 'SkyConnect', 'CityNet Sylhet', 'LinkWave', 'FiberOne BD',
    'SpeedNet Khulna', 'WaveISP', 'ConnectBD', 'NetZone', 'DhakaNet', 'GreenLink',
  ],
  trustBadges: [
    { label: '149+ ISPs', sub: 'Across Bangladesh' },
    { label: '85K+ users', sub: 'Managed daily' },
    { label: '2M+ payments', sub: 'Reconciled' },
    { label: '99.9% uptime', sub: 'Platform SLA' },
  ],
  connects: [
    { name: 'API Access', desc: 'REST API for custom integrations' },
    { name: 'Webhooks', desc: 'Payment and expiry event callbacks' },
    { name: 'Mobile SDK', desc: 'Embed recharge widgets in your app' },
  ],
  permissionsMatrix: [
    { module: 'Customers & Subscribers', read: true, create: true, update: true, delete: true },
    { module: 'Billing & Payments', read: true, create: true, update: true, delete: false },
    { module: 'MikroTik RouterOS API', read: true, create: true, update: true, delete: true },
    { module: 'OLT & Fiber ONUs', read: true, create: true, update: true, delete: false },
    { module: 'Accounting & Ledger', read: true, create: false, update: false, delete: false },
    { module: 'Support Tickets', read: true, create: true, update: true, delete: false },
    { module: 'HR & Payroll Staff', read: false, create: false, update: false, delete: false },
    { module: 'Settings & Gateways', read: false, create: false, update: false, delete: false },
  ],
};
