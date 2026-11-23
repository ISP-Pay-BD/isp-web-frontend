'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Check, ExternalLink, LayoutTemplate } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Reveal } from '@/components/motion/Reveal';
import { useTranslations } from '@/features/marketing/shared';
import { formatBdtWithSymbol } from '@/lib/format';
import { usePublicTemplates, type PublicTemplate } from '../hooks/use-public-templates';

function TemplateCard({ tpl }: { tpl: PublicTemplate }) {
  const t = useTranslations();
  const free = tpl.priceType === 'Free' || tpl.price <= 0;
  return (
    <article className="group flex flex-col overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] transition-colors duration-200 ease-out hover:border-white/20">
      <div className="relative aspect-video overflow-hidden bg-white/[0.04]">
        {tpl.image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={tpl.image}
            alt=""
            loading="lazy"
            className="h-full w-full object-cover object-top transition-transform duration-500 ease-out group-hover:scale-[1.03]"
          />
        ) : (
          <div className="from-landing-cta/15 flex h-full w-full items-center justify-center bg-gradient-to-br to-transparent">
            <LayoutTemplate className="h-9 w-9 text-white/25" aria-hidden />
          </div>
        )}
        <span className="absolute top-3 left-3 rounded-full border border-white/15 bg-black/50 px-2.5 py-1 text-xs font-medium text-white backdrop-blur">
          {free
            ? t('marketing.templates.free', 'Free')
            : t(`marketing.templates.type${tpl.priceType}`, tpl.priceType)}
        </span>
      </div>
      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h2 className="font-landing-display text-lg leading-snug font-semibold text-white">
              {tpl.title}
            </h2>
            <p className="mt-0.5 text-xs text-white/50">
              {tpl.category}
              {tpl.technology ? ` · ${tpl.technology}` : ''}
            </p>
          </div>
          <span className="text-landing-accent shrink-0 font-mono text-sm font-semibold tabular-nums">
            {free ? t('marketing.templates.free', 'Free') : formatBdtWithSymbol(tpl.price)}
          </span>
        </div>
        {tpl.description ? (
          <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-white/60">
            {tpl.description}
          </p>
        ) : null}
        {tpl.features.length > 0 ? (
          <ul className="mt-4 space-y-1.5 text-sm text-white/70">
            {tpl.features.slice(0, 5).map((f) => (
              <li key={f} className="flex gap-2">
                <Check className="text-landing-accent mt-0.5 h-4 w-4 shrink-0" aria-hidden />
                <span>{f}</span>
              </li>
            ))}
          </ul>
        ) : null}
        <div className="mt-auto flex gap-2 pt-5">
          {tpl.demoUrl ? (
            <Button
              variant="outline"
              size="sm"
              className="h-9 flex-1 border-white/15 bg-transparent text-white duration-200 ease-out hover:bg-white/5"
              render={<a href={tpl.demoUrl} target="_blank" rel="noopener noreferrer" />}
            >
              <ExternalLink className="mr-1.5 h-3.5 w-3.5" aria-hidden />{' '}
              {t('marketing.templates.demo', 'Live demo')}
            </Button>
          ) : null}
          <Button
            size="sm"
            className="bg-landing-cta hover:bg-landing-cta-hover h-9 flex-1 font-semibold text-white duration-200 ease-out"
            render={<Link href="/register" />}
          >
            {t('marketing.templates.use', 'Use template')}
          </Button>
        </div>
      </div>
    </article>
  );
}

export function TemplatesCatalogPage() {
  const t = useTranslations();
  const [category, setCategory] = useState('');
  const { data, isLoading, isError, refetch } = usePublicTemplates();
  const items = data ?? [];
  const categories = [...new Set(items.map((i) => i.category).filter(Boolean))];
  const shown = category ? items.filter((i) => i.category === category) : items;

  return (
    <div className="pt-32 pb-16 md:py-24">
      <div className="mx-auto max-w-6xl px-4 md:px-6">
        <Reveal className="max-w-2xl">
          <p className="text-landing-accent text-xs font-medium tracking-[0.08em]">
            {t('marketing.templates.badge', 'Website templates')}
          </p>
          <h1 className="font-landing-display mt-3 text-4xl font-semibold tracking-tight text-white sm:text-5xl">
            {t('marketing.templates.title', 'Launch your ISP website in a day')}
          </h1>
          <p className="mt-4 text-base leading-relaxed text-white/60">
            {t(
              'marketing.templates.subtitle',
              'Ready-made ISP websites with package showcase, customer self-care login and online bill payment, wired to ISP Pay BD.',
            )}
          </p>
        </Reveal>

        {categories.length > 1 ? (
          <Reveal className="mt-10 flex flex-wrap gap-2" delay={0.05}>
            {['', ...categories].map((c) => (
              <button
                key={c || '__all'}
                type="button"
                onClick={() => setCategory(c)}
                className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors duration-200 ease-out ${
                  category === c
                    ? 'bg-landing-cta text-white'
                    : 'border border-white/10 text-white/60 hover:text-white'
                }`}
              >
                {c || t('marketing.templates.all', 'All')}
              </button>
            ))}
          </Reveal>
        ) : null}

        <Reveal className="mt-10" delay={0.08}>
          {isLoading ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3" aria-busy="true">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="h-96 animate-pulse rounded-2xl border border-white/10 bg-white/[0.03]"
                />
              ))}
            </div>
          ) : isError ? (
            <div className="border-y border-white/10 py-12 text-center">
              <p className="text-sm text-white/70">
                {t('marketing.templates.loadFailed', 'Failed to load templates.')}
              </p>
              <button
                type="button"
                onClick={() => refetch()}
                className="mt-4 rounded-lg border border-white/15 px-4 py-2 text-sm text-white/80 transition-colors hover:bg-white/5 hover:text-white"
              >
                {t('common.retry', 'Retry')}
              </button>
            </div>
          ) : shown.length === 0 ? (
            <div className="border-y border-white/10 py-12 text-center">
              <h2 className="text-base font-semibold text-white">
                {t('marketing.templates.noneYet', 'No templates published yet')}
              </h2>
              <p className="mt-1 text-sm text-white/50">
                {t(
                  'marketing.templates.noneYetHint',
                  'Check back soon, or ask us for a custom website.',
                )}
              </p>
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {shown.map((tpl) => (
                <TemplateCard key={tpl.id} tpl={tpl} />
              ))}
            </div>
          )}
        </Reveal>

        <Reveal className="mt-16 border-t border-white/10 pt-10" delay={0.04}>
          <h3 className="font-landing-display text-xl font-semibold text-white">
            {t('marketing.templates.customTitle', 'Need a custom design for your ISP?')}
          </h3>
          <p className="mt-2 max-w-xl text-sm text-white/55">
            {t(
              'marketing.templates.customDesc',
              'Tell us about your brand and coverage area and we will build a website around it.',
            )}
          </p>
          <Button
            variant="outline"
            className="mt-5 h-10 border-white/15 bg-transparent px-5 text-sm text-white duration-200 ease-out hover:bg-white/5"
            render={<Link href="/contact" />}
          >
            {t('marketing.templates.customCta', 'Talk to us')}
          </Button>
        </Reveal>
      </div>
    </div>
  );
}
