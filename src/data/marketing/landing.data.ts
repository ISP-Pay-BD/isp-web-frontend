export const landingData = {
  stats: {
    trustedIsps: 120,
    activeUsers: 85000,
    activeAdmins: 450,
    paymentsReconciled: '2M+',
  },
  hero: {
    badge: 'Trusted by 120+ ISPs across Bangladesh',
    titleEn: "Run your whole ISP from one operator's console",
    titleBn: 'পুরো ISP চালান একটি অপারেটর কনসোল থেকে',
    subtitleEn: 'Billing, MikroTik sync, and every bKash & Nagad payment — reconciled automatically.',
    subtitleBn: 'বিলিং, মাইক্রোটিক সিঙ্ক, এবং প্রতিটি বিকাশ ও নগদ পেমেন্ট — স্বয়ংক্রিয়ভাবে মিলিয়ে নেওয়া।',
    ctaPrimary: 'Start Free Trial — no card required',
    ctaSecondary: 'See it reconcile',
  },
  features: [
    { id: 'f1', title: 'Auto-Reconciliation', titleBn: 'স্বয়ংক্রিয় মিল', desc: 'bKash & Nagad payments matched to customers automatically.', descBn: 'bKash ও Nagad পেমেন্ট স্বয়ংক্রিয়ভাবে গ্রাহকের সাথে মিলে যায়।', icon: 'CreditCard' },
    { id: 'f2', title: 'MikroTik Sync', titleBn: 'MikroTik সিঙ্ক', desc: 'Real-time PPPoE/hotspot sync, disconnect on expiry.', descBn: 'রিয়েল-টাইম PPPoE/হটস্পট সিঙ্ক, মেয়াদ শেষে disconnect।', icon: 'Server' },
    { id: 'f3', title: 'Multi-POP Resellers', titleBn: 'মাল্টি-POP রিসেলার', desc: 'Fund POPs, track ledger, scoped permissions.', descBn: 'POP ফান্ড, লেজার ট্র্যাক, স্কোপড পারমিশন।', icon: 'Building' },
    { id: 'f4', title: 'Bangla Customer App', titleBn: 'বাংলা কাস্টমার অ্যাপ', desc: 'Branded mobile app for every subscriber.', descBn: 'প্রতিটি গ্রাহকের জন্য ব্র্যান্ডেড মোবাইল অ্যাপ।', icon: 'Smartphone' },
    { id: 'f5', title: 'SMS & WhatsApp', titleBn: 'SMS ও WhatsApp', desc: 'Bulk SMS, WhatsApp Business, expiry alerts.', descBn: 'বাল্ক SMS, WhatsApp Business, মেয়াদ শেষের সতর্কতা।', icon: 'MessageSquare' },
    { id: 'f6', title: 'Pay-As-You-Go', titleBn: 'পে-অ্যাজ-ইউ-গো', desc: 'Fixed plan or per-customer billing — no tier caps.', descBn: 'ফিক্সড প্ল্যান বা প্রতি গ্রাহক বিলিং — কোনো সীমা নেই।', icon: 'Wallet' },
    { id: 'f7', title: 'OLT & Fiber', titleBn: 'OLT ও ফাইবার', desc: 'Huawei & ZTE ONU provisioning from one panel.', descBn: 'এক প্যানেল থেকে Huawei ও ZTE ONU।', icon: 'Network' },
    { id: 'f8', title: 'HR & Payroll', titleBn: 'HR ও পে-রোল', desc: 'Staff, attendance, salary — built in.', descBn: 'স্টাফ, উপস্থিতি, বেতন — বিল্ট-ইন।', icon: 'Users' },
  ],
  faq: [
    { q: 'Does it work with my existing MikroTik routers?', a: 'Yes. ISP Pay BD syncs PPPoE and hotspot users in real time.' },
    { q: 'Which payment gateways are supported?', a: 'bKash, Nagad, SSLCommerz, and manual cash/bank entry.' },
    { q: 'Can I use my own domain?', a: 'Yes. Each tenant gets a branded portal and optional custom domain.' },
    { q: 'Is there a free trial?', a: 'Yes — start free, no credit card required.' },
  ],
  testimonials: [
    { name: 'FastNet BD', role: 'ISP Owner, Dhaka', quote: 'Payment reconciliation alone saved us 3 hours every day.' },
    { name: 'NetLink CTG', role: 'Operations Manager', quote: 'MikroTik sync is rock solid. Expired users disconnect instantly.' },
    { name: 'SkyConnect', role: 'POP Reseller', quote: 'Our POP ledger and funding workflow is finally clean.' },
  ],
  contact: {
    office: 'House 12, Road 5, Sector 11, Uttara, Dhaka 1230',
    phone: '+880 1700-000000',
    email: 'hello@isppaybd.com',
    hours: 'Sat–Thu, 9 AM – 6 PM (BST)',
  },
};

export const pricingPlans = [
  {
    id: 'plan_starter',
    name: 'Starter',
    priceBdt: 2999,
    period: 'month',
    customers: 'Up to 500',
    features: ['MikroTik sync', 'bKash/Nagad', 'Customer portal', 'SMS alerts'],
    highlighted: false,
  },
  {
    id: 'plan_growth',
    name: 'Growth',
    priceBdt: 5999,
    period: 'month',
    customers: 'Up to 2,000',
    features: ['Everything in Starter', 'Multi-POP', 'WhatsApp Business', 'HR module'],
    highlighted: true,
  },
  {
    id: 'plan_scale',
    name: 'Scale',
    priceBdt: 9999,
    period: 'month',
    customers: 'Unlimited',
    features: ['Everything in Growth', 'OLT tools', 'Accounting', 'Priority support'],
    highlighted: false,
  },
];

export const pluginsMarketplace = [
  { id: 'plg_whatsapp', name: 'WhatsApp Business', category: 'Communication', priceBdt: 500, installed: false },
  { id: 'plg_olt', name: 'OLT Manager', category: 'Network', priceBdt: 800, installed: true },
  { id: 'plg_accounting', name: 'Advanced Accounting', category: 'Finance', priceBdt: 600, installed: false },
  { id: 'plg_rewards', name: 'Referral & Rewards', category: 'Marketing', priceBdt: 0, installed: true },
];
