'use client';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { mockFetch } from '@/lib/mock-api/client';
import { PageSkeleton } from '@/components/shared/LoadingSkeleton';
import { EmptyState } from '@/components/shared/EmptyState';
import { Reveal } from '@/components/motion/Reveal';

type Article = { id: string; title: string; category: string; minutes: number };

const fallbackArticles = [
  { id: 'h1', title: 'How to pay with bKash', category: 'Billing', minutes: 2 },
  { id: 'h2', title: 'Reset Wi-Fi password', category: 'Router', minutes: 3 },
  { id: 'h3', title: 'Why is my speed slow?', category: 'Network', minutes: 4 },
];

export function HelpPage({ portal = false }: { portal?: boolean }) {
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['customer', 'domain', 'help'],
    queryFn: async () => {
      const res = (await mockFetch('customer.domain', 'help')) as { articles: Article[] };
      return res.articles;
    },
    enabled: portal,
  });

  const articles = portal ? data ?? fallbackArticles : fallbackArticles;

  if (portal && isLoading) return <PageSkeleton variant="table" />;
  if (portal && isError) {
    return <EmptyState title="Failed to load help" actionLabel="Retry" onAction={() => refetch()} />;
  }

  const body = (
    <div className={portal ? '' : 'mx-auto max-w-2xl'}>
      {!portal && <p className="text-sm font-medium text-[#f75803]">ISP Pay BD</p>}
      <h1 className={`font-semibold tracking-tight ${portal ? 'sr-only' : 'mt-2 text-3xl'}`}>Help center</h1>
      {!portal && (
        <p className="mt-2 text-white/60">Common answers for billing, reconnect, and support</p>
      )}
      <p className={portal ? 'text-sm tabular-nums text-muted-foreground' : 'sr-only'}>
        {articles.length} guides
      </p>
      <ul className="mt-8 space-y-3">
        {articles.map((a) => (
          <li
            key={a.id}
            className={
              portal
                ? 'rounded-xl border border-border/60 bg-card p-4 shadow-sm ring-1 ring-foreground/5'
                : 'rounded-xl border border-white/10 bg-white/5 p-4'
            }
          >
            <div className="flex items-start justify-between gap-3">
              <h2 className="font-medium">{a.title}</h2>
              <span className={`shrink-0 text-xs ${portal ? 'text-muted-foreground' : 'text-white/40'}`}>
                {a.minutes} min
              </span>
            </div>
            <p className={`mt-1 text-sm ${portal ? 'text-muted-foreground' : 'text-white/60'}`}>{a.category}</p>
          </li>
        ))}
      </ul>
      {!portal && (
        <p className="mt-10 text-center text-sm text-white/40">
          <Link href="/" className="underline">
            Home
          </Link>
        </p>
      )}
    </div>
  );

  return (
    <div className={portal ? 'space-y-6' : 'min-h-screen bg-[#0c0118] px-4 py-16 text-white'}>
      {portal ? body : <Reveal>{body}</Reveal>}
    </div>
  );
}
