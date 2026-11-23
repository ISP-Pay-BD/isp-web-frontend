'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { Quote, ShieldAlert, Star } from 'lucide-react';
import { PageHeader } from '@/features/admin/shared';
import { PageSkeleton } from '@/components/shared/LoadingSkeleton';
import { EmptyState } from '@/components/shared/EmptyState';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ApiError } from '@/lib/api/client';
import { handleApiError } from '@/lib/api/utils/error-handler';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/stores/auth-store';
import { useTranslations } from '@/i18n/locale-context';
import {
  useMyReview,
  useSaveMyReview,
  type MyReview,
  type MyReviewInput,
} from '../hooks/use-my-review';

/** First letter of the first two words, `I` / `P` for a missing word (same rule as the API). */
function initials(name: string): string {
  const [a, b] = name.trim().split(/\s+/);
  return `${a?.[0] ?? 'I'}${b?.[0] ?? 'P'}`.toUpperCase();
}

function toForm(review: MyReview | null | undefined, fallbackName: string): MyReviewInput {
  return {
    name: review?.name ?? fallbackName,
    role: review?.role ?? 'Managing Director',
    company: review?.company ?? '',
    quote: review?.quote ?? '',
    rating: review?.rating ?? 5,
  };
}

export function MyReviewPage() {
  const t = useTranslations();
  const userName = useAuthStore((s) => s.user?.name ?? '');
  const { data, isLoading, error, refetch } = useMyReview();
  const save = useSaveMyReview();
  const form = useForm<MyReviewInput>({ defaultValues: toForm(null, userName) });

  useEffect(() => {
    if (!isLoading && !error) form.reset(toForm(data, userName));
  }, [data, isLoading, error, userName, form]);

  const header = (
    <PageHeader
      title={t('admin.myReview.title', 'Review & Testimonial')}
      subtitle={t(
        'admin.myReview.subtitle',
        'Share your real feedback about ISP Pay BD for the official website',
      )}
      breadcrumb={[
        { label: 'Dashboard', href: '/admin/dashboard' },
        { label: t('admin.myReview.crumb', 'Give Review') },
      ]}
    />
  );

  if (isLoading) return <PageSkeleton variant="form" />;
  if (error) {
    const forbidden = error instanceof ApiError && error.status === 403;
    return (
      <div className="space-y-6">
        {header}
        {forbidden ? (
          <EmptyState
            icon={<ShieldAlert className="h-5 w-5" />}
            title={t('admin.myReview.forbiddenTitle', 'Reviews are for staff accounts')}
            description={t(
              'admin.myReview.forbiddenDesc',
              'Your account cannot submit a website review.',
            )}
          />
        ) : (
          <EmptyState
            variant="error"
            title={t('admin.myReview.loadFailed', 'Could not load your review')}
            description={error.message}
            actionLabel={t('common.retry', 'Retry')}
            onAction={() => refetch()}
          />
        )}
      </div>
    );
  }

  const v = form.watch();
  const err = form.formState.errors;

  const submit = form.handleSubmit((values) =>
    save.mutate(
      {
        ...values,
        name: values.name.trim(),
        role: values.role.trim(),
        company: values.company.trim(),
        quote: values.quote.trim(),
      },
      {
        onSuccess: () =>
          toast.success(t('admin.myReview.saved', 'Your review has been saved and published')),
        onError: (e) => handleApiError(e, form.setError),
      },
    ),
  );

  return (
    <div className="space-y-6">
      {header}

      <div className="grid gap-6 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)]">
        <Card className="border-border/60">
          <CardHeader>
            <div className="flex flex-wrap items-center gap-2">
              <CardTitle>
                {data
                  ? t('admin.myReview.updateTitle', 'Update your review')
                  : t('admin.myReview.writeTitle', 'Write a review for ISP Pay BD')}
              </CardTitle>
              {data ? (
                <Badge variant={data.isActive ? 'default' : 'secondary'}>
                  {data.isActive
                    ? t('admin.myReview.live', 'Live on website')
                    : t('admin.myReview.hidden', 'Hidden by platform')}
                </Badge>
              ) : null}
            </div>
            <CardDescription>
              {t(
                'admin.myReview.intro',
                'Tell other ISPs how ISP Pay BD helps with billing, MikroTik sync and daily operations. Your review is published on the website right away; your email and phone are never shown.',
              )}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={submit} className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2 sm:col-span-2">
                <span className="text-sm font-medium">
                  {t('admin.myReview.rating', 'Your rating')}
                </span>
                <div
                  className="flex items-center gap-1"
                  role="radiogroup"
                  aria-label={t('admin.myReview.rating', 'Your rating')}
                >
                  {[1, 2, 3, 4, 5].map((n) => (
                    <button
                      key={n}
                      type="button"
                      role="radio"
                      aria-checked={v.rating === n}
                      aria-label={`${n}/5`}
                      onClick={() => form.setValue('rating', n, { shouldDirty: true })}
                      className="focus-visible:ring-ring rounded-md p-1 transition duration-200 ease-out hover:scale-110 focus-visible:ring-2 focus-visible:outline-none"
                    >
                      <Star
                        className={cn(
                          'h-8 w-8',
                          n <= v.rating
                            ? 'fill-amber-400 text-amber-400'
                            : 'text-muted-foreground/40',
                        )}
                        aria-hidden
                      />
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-1.5 sm:col-span-2">
                <Label htmlFor="mr-name">{t('admin.myReview.name', 'Your full name')}</Label>
                <Input
                  id="mr-name"
                  aria-invalid={Boolean(err.name)}
                  placeholder={t('admin.myReview.namePlaceholder', 'e.g. Engr. Tanvir Ahmed')}
                  {...form.register('name', {
                    validate: (x) =>
                      x.trim() !== '' || t('admin.myReview.nameRequired', 'Name is required'),
                  })}
                />
                {err.name ? <p className="text-destructive text-xs">{err.name.message}</p> : null}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="mr-role">{t('admin.myReview.role', 'Designation / role')}</Label>
                <Input
                  id="mr-role"
                  placeholder={t('admin.myReview.rolePlaceholder', 'e.g. Managing Director, CEO')}
                  {...form.register('role')}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="mr-company">
                  {t('admin.myReview.company', 'ISP / company name')}
                </Label>
                <Input
                  id="mr-company"
                  placeholder={t(
                    'admin.myReview.companyPlaceholder',
                    'e.g. CyberNet Online, Chattogram',
                  )}
                  {...form.register('company')}
                />
              </div>
              <div className="space-y-1.5 sm:col-span-2">
                <Label htmlFor="mr-quote">{t('admin.myReview.quote', 'Your review')}</Label>
                <Textarea
                  id="mr-quote"
                  rows={5}
                  aria-invalid={Boolean(err.quote)}
                  placeholder={t(
                    'admin.myReview.quotePlaceholder',
                    'What changed for your ISP after switching to ISP Pay BD?',
                  )}
                  {...form.register('quote', {
                    validate: (x) =>
                      x.trim() !== '' ||
                      t('admin.myReview.quoteRequired', 'Review text is required'),
                  })}
                />
                {err.quote ? <p className="text-destructive text-xs">{err.quote.message}</p> : null}
              </div>
              <div className="sm:col-span-2">
                <Button type="submit" disabled={save.isPending} className="w-full sm:w-auto">
                  {save.isPending
                    ? t('admin.myReview.saving', 'Saving…')
                    : data
                      ? t('admin.myReview.update', 'Update review')
                      : t('admin.myReview.submit', 'Publish review')}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <div className="space-y-3">
          <p className="text-muted-foreground text-xs font-semibold tracking-wider uppercase">
            {t('admin.myReview.preview', 'Website preview')}
          </p>
          <figure className="bg-landing-bg rounded-2xl border border-white/10 p-6 text-white shadow-lg">
            <Quote className="h-6 w-6 text-orange-400" aria-hidden />
            <blockquote className="mt-3 text-base leading-relaxed text-white/90 italic">
              {v.quote.trim() ||
                t('admin.myReview.previewEmpty', 'Your review will appear here as you type.')}
            </blockquote>
            <div className="mt-4 flex gap-0.5" aria-hidden>
              {[1, 2, 3, 4, 5].map((n) => (
                <Star
                  key={n}
                  className={cn(
                    'h-4 w-4',
                    n <= v.rating ? 'fill-amber-400 text-amber-400' : 'text-white/25',
                  )}
                />
              ))}
            </div>
            <figcaption className="mt-5 flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-sky-400 text-sm font-bold">
                {initials(v.name || userName)}
              </span>
              <span className="min-w-0">
                <span className="block truncate font-semibold">
                  {v.name.trim() || userName || '—'}
                </span>
                <span className="block truncate text-xs text-white/60">
                  {[v.role.trim(), v.company.trim()].filter(Boolean).join(' · ')}
                </span>
              </span>
            </figcaption>
          </figure>
        </div>
      </div>
    </div>
  );
}
