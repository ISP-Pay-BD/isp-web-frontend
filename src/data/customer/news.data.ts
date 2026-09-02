import type { NewsItem } from '../shared/types';

export const newsItems: NewsItem[] = [
  {
    id: 'news_1',
    title: 'Scheduled maintenance — Sept 5, 2–4 AM',
    titleBn: 'নির্ধারিত রক্ষণাবেক্ষণ — ৫ সেপ্টেম্বর, রাত ২–৪টা',
    body: 'Core routers in Uttara POP will undergo firmware update. Expect brief disconnections.',
    publishedAt: '2026-09-01T10:00:00',
    pinned: true,
  },
  {
    id: 'news_2',
    title: 'New Home 100 Mbps package available',
    titleBn: 'নতুন Home 100 Mbps প্যাকেজ',
    body: 'Upgrade to 100 Mbps for ৳3,500/month. Contact support or self-upgrade in portal.',
    publishedAt: '2026-08-28T09:00:00',
    pinned: false,
  },
  {
    id: 'news_3',
    title: 'bKash payment now instant activation',
    titleBn: 'bKash পেমেন্টে তাৎক্ষণিক অ্যাক্টিভেশন',
    body: 'Payments via bKash are now reconciled within 2 minutes. No manual approval needed.',
    publishedAt: '2026-08-25T11:00:00',
    pinned: false,
  },
  {
    id: 'news_4',
    title: 'Refer a friend — earn 200 reward points',
    titleBn: 'বন্ধুকে রেফার করুন — ২০০ পয়েন্ট পান',
    body: 'Share your referral code. Both you and your friend get bonus points on activation.',
    publishedAt: '2026-08-20T08:00:00',
    pinned: false,
  },
  {
    id: 'news_5',
    title: 'Office hours during Eid holidays',
    titleBn: 'ঈদের ছুটিতে অফিস সময়',
    body: 'Support available 10 AM–4 PM. Emergency line: 01700-000000.',
    publishedAt: '2026-08-15T12:00:00',
    pinned: false,
  },
  {
    id: 'news_6',
    title: 'Fiber expansion — Bashundhara Block R',
    titleBn: 'ফাইবার সম্প্রসারণ — বসুন্ধরা ব্লক R',
    body: 'New GPON coverage in Bashundhara Block R. Register interest via support ticket.',
    publishedAt: '2026-08-10T09:30:00',
    pinned: false,
  },
  {
    id: 'news_7',
    title: 'Security advisory — change router password',
    titleBn: 'নিরাপত্তা পরামর্শ — রাউটার পাসওয়ার্ড পরিবর্তন',
    body: 'We recommend changing default WiFi passwords. Guide available in customer portal.',
    publishedAt: '2026-08-05T14:00:00',
    pinned: false,
  },
  {
    id: 'news_8',
    title: 'Customer app v2.0 released',
    titleBn: 'কাস্টমার অ্যাপ v2.0 রিলিজ',
    body: 'New Bangla interface, faster payments, and router quick-fix tools.',
    publishedAt: '2026-08-01T10:00:00',
    pinned: false,
  },
];

export function getNewsById(id: string): NewsItem | undefined {
  return newsItems.find((n) => n.id === id);
}
