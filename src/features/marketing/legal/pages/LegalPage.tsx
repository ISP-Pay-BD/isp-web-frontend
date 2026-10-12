import Link from 'next/link';
import { notFound } from 'next/navigation';
import { API_BASE_URL } from '@/lib/api/client';
import { LegalText } from '../components/LegalText';

export type LegalSlug = 'privacy' | 'terms';

interface LegalDocument {
  title: string;
  body: string;
  updatedAt: string | null;
}

/** null = not published (404); 'unavailable' = the API could not be reached. */
async function loadDocument(slug: LegalSlug): Promise<LegalDocument | null | 'unavailable'> {
  try {
    const res = await fetch(`${API_BASE_URL}/v1/public/legal/${slug}`, {
      next: { revalidate: 60 },
      signal: AbortSignal.timeout(4000),
    });
    if (res.status === 404) return null;
    if (!res.ok) return 'unavailable';
    const d = ((await res.json()) as { data?: { title?: string; body?: string; updated_at?: string | null } }).data;
    if (!d?.body) return null;
    return { title: d.title ?? '', body: d.body, updatedAt: d.updated_at ?? null };
  } catch {
    return 'unavailable';
  }
}

/**
 * `/privacy` and `/terms`: the text comes from the platform owner's software settings
 * (GET /api/v1/public/legal/{slug}), so there is no legal copy in the codebase. A document
 * that has not been written is a 404, and the footer does not link it.
 */
export async function LegalPage({ slug }: { slug: LegalSlug }) {
  const doc = await loadDocument(slug);
  if (doc === null) notFound();

  return (
    <div className="bg-landing-bg min-h-[70vh]">
      <article className="mx-auto max-w-3xl px-4 pt-32 pb-20 md:px-6">
        {doc === 'unavailable' ? (
          <div className="space-y-3 text-center">
            <h1 className="font-landing-display text-3xl font-semibold text-white">Temporarily unavailable</h1>
            <p className="text-white/70">This page could not be loaded right now. Please try again in a moment.</p>
            <Link href="/" className="text-landing-accent text-sm hover:underline">
              Back to home
            </Link>
          </div>
        ) : (
          <>
            <header className="mb-10 border-b border-white/10 pb-6">
              <h1 className="font-landing-display text-4xl font-semibold tracking-tight text-white">{doc.title}</h1>
              {doc.updatedAt ? (
                <p className="mt-2 text-sm text-white/50">
                  Last updated {new Date(doc.updatedAt.replace(' ', 'T')).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
                </p>
              ) : null}
            </header>
            <LegalText body={doc.body} />
          </>
        )}
      </article>
    </div>
  );
}
