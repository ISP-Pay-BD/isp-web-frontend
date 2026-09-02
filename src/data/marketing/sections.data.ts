/** All 28 landing section content — EN + BN where applicable */

export const landingSections = {
  benefits: [
    { title: 'Zero manual reconciliation', desc: 'bKash & Nagad auto-match to customer accounts.' },
    { title: 'MikroTik-native', desc: 'PPPoE, hotspot, and static IP — synced in seconds.' },
    { title: 'Multi-POP ready', desc: 'Fund resellers, track ledger, scoped permissions.' },
    { title: 'Bangla-first', desc: 'Customer portal and SMS in English + Bengali.' },
  ],
  whyChoose: [
    { title: 'Built for Bangladesh ISPs', desc: 'bKash, Nagad, BTRC reports, local support.' },
    { title: 'No per-seat pricing traps', desc: 'Pay for your subscriber count — not admin seats.' },
    { title: 'White-label ready', desc: 'Your logo, domain, and customer app.' },
  ],
  howItWorks: [
    { step: 1, title: 'Connect MikroTik', desc: 'Add your routers — we sync PPPoE users automatically.' },
    { step: 2, title: 'Import customers', desc: 'Migrate from Excel or add manually with areas & packages.' },
    { step: 3, title: 'Enable payments', desc: 'bKash/Nagad webhooks reconcile every transaction.' },
    { step: 4, title: 'Go live', desc: 'Customers self-recharge; expired users disconnect instantly.' },
  ],
  comparison: {
    headers: ['Feature', 'ISP Pay BD', 'Legacy billing', 'Generic CRM'],
    rows: [
      ['MikroTik sync', true, false, false],
      ['bKash auto-reconcile', true, false, false],
      ['Multi-POP ledger', true, true, false],
      ['Bangla customer app', true, false, false],
      ['OLT management', true, false, false],
      ['BTRC reports', true, true, false],
    ],
  },
  integrations: [
    { name: 'MikroTik', category: 'Network' },
    { name: 'bKash', category: 'Payment' },
    { name: 'Nagad', category: 'Payment' },
    { name: 'SSLCommerz', category: 'Payment' },
    { name: 'WhatsApp Business', category: 'Comms' },
    { name: 'Bulk SMS', category: 'Comms' },
    { name: 'Huawei OLT', category: 'Fiber' },
    { name: 'ZTE OLT', category: 'Fiber' },
  ],
  partners: [
    'FastNet BD', 'NetLink CTG', 'SkyConnect', 'CityNet Sylhet', 'LinkWave', 'FiberOne BD',
    'SpeedNet Khulna', 'WaveISP', 'ConnectBD', 'NetZone', 'DhakaNet', 'GreenLink',
  ],
  trustBadges: [
    { label: '120+ ISPs', sub: 'Across Bangladesh' },
    { label: '85K+ users', sub: 'Managed daily' },
    { label: '2M+ payments', sub: 'Reconciled' },
    { label: '99.9% uptime', sub: 'Platform SLA' },
  ],
  caseStudy: {
    company: 'FastNet BD',
    location: 'Dhaka & Gazipur',
    customers: 4200,
    quote: 'We cut reconciliation from 3 hours to 15 minutes per day. MikroTik sync just works.',
    results: [
      { metric: '3× faster', label: 'Payment processing' },
      { metric: '40% less', label: 'Support tickets' },
      { metric: '৳2.1M', label: 'Monthly collections tracked' },
    ],
  },
  mobileApp: {
    title: 'Branded customer app',
    features: ['Check balance & expiry', 'Pay via bKash/Nagad', 'Open support tickets', 'Bangla interface'],
    stores: { android: '#', ios: '#' },
  },
  resellerHierarchy: {
    levels: ['Platform (SaaS)', 'Tenant ISP', 'POP Reseller', 'Sub-POP', 'Customer'],
    description: 'Fund POPs, set packages, and scope permissions per level.',
  },
  rolesAccess: [
    { role: 'Super Admin', access: 'All tenants, revenue, platform settings' },
    { role: 'Tenant Admin', access: 'Full ISP operations for one tenant' },
    { role: 'POP Reseller', access: 'Scoped customers, packages, funding' },
    { role: 'Employee', access: 'Salary, attendance, assigned tasks' },
    { role: 'Customer', access: 'Subscription, payments, support' },
  ],
  roi: {
    hoursSavedPerDay: 2.5,
    reconciliationMinutes: 15,
    manualMinutes: 180,
    monthlySavingsBdt: 45000,
  },
  connects: [
    { name: 'API access', desc: 'REST API for custom integrations' },
    { name: 'Webhooks', desc: 'Payment and expiry events' },
    { name: 'Mobile SDK', desc: 'Embed in your customer app' },
  ],
};

export const landingFaqExtended = [
  { q: 'Does it work with my existing MikroTik routers?', a: 'Yes. ISP Pay BD syncs PPPoE, hotspot, and static users in real time via RouterOS API.', qBn: 'আমার MikroTik রাউটারের সাথে কি কাজ করবে?', aBn: 'হ্যাঁ। PPPoE, হটস্পট ও স্ট্যাটিক ইউজার রিয়েল-টাইমে সিঙ্ক হয়।' },
  { q: 'Which payment gateways are supported?', a: 'bKash, Nagad, SSLCommerz, PayStation, ShurjoPay, and manual cash/bank entry.', qBn: 'কোন পেমেন্ট গেটওয়ে সাপোর্ট করে?', aBn: 'bKash, Nagad, SSLCommerz এবং ম্যানুয়াল ক্যাশ/ব্যাংক।' },
  { q: 'Can I use my own domain?', a: 'Yes. Each tenant gets a branded portal and optional custom domain with SSL.', qBn: 'নিজের ডোমেইন ব্যবহার করতে পারব?', aBn: 'হ্যাঁ। প্রতিটি টেন্যান্ট ব্র্যান্ডেড পোর্টাল ও কাস্টম ডোমেইন পায়।' },
  { q: 'Is there a free trial?', a: 'Yes — start free for 14 days, no credit card required.', qBn: 'ফ্রি ট্রায়াল আছে?', aBn: 'হ্যাঁ — ১৪ দিন ফ্রি, কোনো কার্ড লাগবে না।' },
  { q: 'How does POP reseller billing work?', a: 'Fund POP wallets, resellers sell packages, and ledger tracks every transaction.', qBn: 'POP রিসেলার বিলিং কিভাবে?', aBn: 'POP ওয়ালেট ফান্ড করুন, রিসেলার প্যাকেজ বিক্রি করে, লেজারে সব ট্র্যাক হয়।' },
  { q: 'Do you support fiber OLT?', a: 'Yes — Huawei and ZTE OLT modules for ONU provisioning and monitoring.', qBn: 'ফাইবার OLT সাপোর্ট?', aBn: 'হ্যাঁ — Huawei ও ZTE OLT মডিউল।' },
  { q: 'Can customers pay in Bangla?', a: 'Customer portal, SMS, and mobile app support full Bengali interface.', qBn: 'গ্রাহক বাংলায় পেমেন্ট করতে পারবে?', aBn: 'হ্যাঁ — পোর্টাল, SMS ও অ্যাপে বাংলা।' },
  { q: 'What about BTRC compliance?', a: 'Built-in BTRC subscriber reports export ready for regulatory filing.', qBn: 'BTRC রিপোর্ট?', aBn: 'বিল্ট-ইন BTRC সাবস্ক্রাইবার রিপোর্ট।' },
];

export const landingTestimonialsExtended = [
  { name: 'FastNet BD', role: 'ISP Owner, Dhaka', quote: 'Payment reconciliation alone saved us 3 hours every day.', rating: 5 },
  { name: 'NetLink CTG', role: 'Operations Manager, Chittagong', quote: 'MikroTik sync is rock solid. Expired users disconnect instantly.', rating: 5 },
  { name: 'SkyConnect', role: 'POP Reseller, Uttara', quote: 'Our POP ledger and funding workflow is finally clean.', rating: 5 },
  { name: 'CityNet Sylhet', role: 'Technical Director', quote: 'OLT module reduced our fiber provisioning time by half.', rating: 4 },
  { name: 'LinkWave Rajshahi', role: 'Founder', quote: 'Best decision we made switching from spreadsheet billing.', rating: 5 },
  { name: 'FiberOne BD', role: 'Accounts Head', quote: 'bKash auto-match eliminated 95% of payment disputes.', rating: 5 },
];
