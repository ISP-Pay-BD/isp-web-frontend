'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { Building2, Eye, EyeOff, Mail, Pencil, Phone, Plus, Trash2, UserRound } from 'lucide-react';
import { PlatformPageHeader, platformDate } from '@/features/platform/shared';
import { PageSkeleton } from '@/components/shared/LoadingSkeleton';
import { EmptyState } from '@/components/shared/EmptyState';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatCount } from '@/lib/format';
import { useTranslations } from '@/i18n/locale-context';
import { useDeleteReview, usePlatformReviews, useToggleReview } from '../hooks/use-content-cms';
import { ReviewDialog } from '../components/ReviewDialog';
import { StarRating } from '../components/StarRating';
import { CmsLoadError } from '../components/CmsLoadError';
import type { Review } from '../types';

const selectClass =
  'h-9 rounded-lg border border-border/70 bg-card px-3 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary';

export function ReviewsPage() {
  const t = useTranslations();
  const { data, isLoading, error, refetch } = usePlatformReviews();
  const toggle = useToggleReview();
  const remove = useDeleteReview();
  const [search, setSearch] = useState('');
  const [display, setDisplay] = useState<'' | '1' | '0'>('');
  const [rating, setRating] = useState('');
  const [source, setSource] = useState<'' | 'user' | 'admin'>('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Review | null>(null);
  const [deleting, setDeleting] = useState<Review | null>(null);

  const openNew = () => {
    setEditing(null);
    setDialogOpen(true);
  };

  const header = (
    <PlatformPageHeader
      title={t('platform.cms.reviews.title', 'Reviews & Testimonials')}
      subtitle={t(
        'platform.cms.reviews.subtitle',
        'Customer reviews shown on the website. Contact details stay private.',
      )}
      breadcrumb={[
        { label: 'Platform', href: '/platform/dashboard' },
        { label: t('platform.cms.reviews.crumb', 'Reviews') },
      ]}
      actions={
        <Button size="sm" onClick={openNew} disabled={Boolean(error)}>
          <Plus className="mr-1.5 h-4 w-4" /> {t('platform.cms.reviews.new', 'Add review')}
        </Button>
      }
    />
  );

  if (isLoading) return <PageSkeleton variant="table" rows={6} />;
  if (error || !data) {
    return (
      <div className="space-y-6">
        {header}
        <CmsLoadError
          error={error}
          title={t('platform.cms.reviews.loadFailed', 'Could not load reviews')}
          onRetry={() => refetch()}
        />
      </div>
    );
  }

  const q = search.trim().toLowerCase();
  const filtered = data.filter((r) => {
    if (display && r.isActive !== (display === '1')) return false;
    if (rating && r.rating !== Number(rating)) return false;
    if (source && (source === 'user') !== Boolean(r.userId)) return false;
    if (!q) return true;
    return [
      r.name,
      r.role,
      r.company,
      r.contactCompany,
      r.contactEmail,
      r.contactPhone,
      r.submitterName,
      r.quote,
    ]
      .join(' ')
      .toLowerCase()
      .includes(q);
  });
  const visibleCount = data.filter((r) => r.isActive).length;
  const avg = data.length ? data.reduce((s, r) => s + r.rating, 0) / data.length : 0;
  const filtersOn = Boolean(q || display || rating || source);

  return (
    <div className="space-y-6">
      {header}

      <div className="border-border/60 flex flex-wrap gap-x-6 gap-y-2 border-y py-3 text-sm">
        <p>
          <span className="text-foreground font-semibold tabular-nums">
            {formatCount(data.length)}
          </span>{' '}
          <span className="text-muted-foreground">
            {t('platform.cms.reviews.kpiTotal', 'reviews')}
          </span>
        </p>
        <p>
          <span className="font-semibold text-emerald-500 tabular-nums">
            {formatCount(visibleCount)}
          </span>{' '}
          <span className="text-muted-foreground">
            {t('platform.cms.reviews.kpiVisible', 'on website')}
          </span>
        </p>
        <p>
          <span className="font-semibold text-amber-500 tabular-nums">
            {formatCount(data.length - visibleCount)}
          </span>{' '}
          <span className="text-muted-foreground">
            {t('platform.cms.reviews.kpiHidden', 'hidden')}
          </span>
        </p>
        <p>
          <span className="text-primary font-semibold tabular-nums">{avg.toFixed(1)}</span>{' '}
          <span className="text-muted-foreground">
            {t('platform.cms.reviews.kpiAvg', 'average rating')}
          </span>
        </p>
      </div>

      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-[1fr_auto_auto_auto]">
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={t(
            'platform.cms.reviews.searchPlaceholder',
            'Search name, company, email, mobile, review…',
          )}
          aria-label={t('platform.cms.reviews.searchLabel', 'Search reviews')}
          className="border-border/70 bg-card text-foreground placeholder:text-muted-foreground focus:ring-primary h-9 w-full rounded-lg border px-3 text-sm focus:ring-1 focus:outline-none sm:col-span-2 lg:col-span-1"
        />
        <select
          aria-label={t('platform.cms.reviews.filterDisplay', 'Display')}
          className={selectClass}
          value={display}
          onChange={(e) => setDisplay(e.target.value as typeof display)}
        >
          <option value="">{t('platform.cms.reviews.allDisplay', 'All display')}</option>
          <option value="1">{t('platform.cms.reviews.statusVisible', 'Visible')}</option>
          <option value="0">{t('platform.cms.reviews.statusHidden', 'Hidden')}</option>
        </select>
        <select
          aria-label={t('platform.cms.reviews.fieldRating', 'Rating')}
          className={selectClass}
          value={rating}
          onChange={(e) => setRating(e.target.value)}
        >
          <option value="">{t('platform.cms.reviews.allRatings', 'All ratings')}</option>
          {[5, 4, 3, 2, 1].map((n) => (
            <option key={n} value={n}>
              {t('platform.cms.reviews.nStars', '{n} stars', { n })}
            </option>
          ))}
        </select>
        <select
          aria-label={t('platform.cms.reviews.filterSource', 'Source')}
          className={selectClass}
          value={source}
          onChange={(e) => setSource(e.target.value as typeof source)}
        >
          <option value="">{t('platform.cms.reviews.allSources', 'All sources')}</option>
          <option value="user">
            {t('platform.cms.reviews.sourceUser', 'Submitted by a user')}
          </option>
          <option value="admin">{t('platform.cms.reviews.sourceAdmin', 'Added by admin')}</option>
        </select>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          title={
            data.length === 0
              ? t('platform.cms.reviews.emptyNone', 'No reviews yet')
              : t('platform.cms.emptyFiltered', 'Nothing matches these filters')
          }
          description={
            data.length === 0
              ? t(
                  'platform.cms.reviews.emptyHint',
                  'ISP admins can submit reviews from their portal, or add one here.',
                )
              : undefined
          }
          actionLabel={
            data.length === 0
              ? t('platform.cms.reviews.new', 'Add review')
              : filtersOn
                ? t('platform.cms.clearFilters', 'Clear filters')
                : undefined
          }
          onAction={
            data.length === 0
              ? openNew
              : filtersOn
                ? () => {
                    setSearch('');
                    setDisplay('');
                    setRating('');
                    setSource('');
                  }
                : undefined
          }
        />
      ) : (
        <ul className="grid gap-4 lg:grid-cols-2">
          {filtered.map((r) => (
            <li
              key={r.id}
              className="border-border/60 bg-card hover:border-primary/40 flex flex-col gap-3 rounded-xl border p-4 transition duration-200 ease-out"
            >
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-sky-400 text-sm font-bold text-white">
                  {r.initials || r.name.slice(0, 2).toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-foreground truncate text-sm font-semibold">{r.name}</h3>
                    <Badge variant={r.isActive ? 'default' : 'secondary'} className="text-xs">
                      {r.isActive
                        ? t('platform.cms.reviews.statusVisible', 'Visible')
                        : t('platform.cms.reviews.statusHidden', 'Hidden')}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      {r.userId
                        ? t('platform.cms.reviews.sourceUserShort', 'User')
                        : t('platform.cms.reviews.sourceAdminShort', 'Admin')}
                    </Badge>
                  </div>
                  <p className="text-muted-foreground truncate text-xs">
                    {[r.role, r.company].filter(Boolean).join(' · ')}
                  </p>
                  <StarRating
                    value={r.rating}
                    label={t('platform.cms.reviews.ratingOf', '{n} out of 5', { n: r.rating })}
                  />
                </div>
              </div>
              <blockquote className="border-primary/40 text-foreground/90 line-clamp-4 border-l-2 pl-3 text-sm italic">
                {r.quote}
              </blockquote>
              <dl className="bg-muted/40 text-muted-foreground grid gap-1 rounded-lg p-3 text-xs sm:grid-cols-2">
                {r.submitterName ? (
                  <div className="flex min-w-0 items-center gap-1.5">
                    <UserRound className="h-3.5 w-3.5 shrink-0" aria-hidden />
                    <dt className="sr-only">
                      {t('platform.cms.reviews.submitter', 'Submitted by')}
                    </dt>
                    <dd className="truncate">
                      {r.submitterName}
                      {r.submitterRole ? ` (${r.submitterRole})` : ''}
                    </dd>
                  </div>
                ) : null}
                {r.contactCompany ? (
                  <div className="flex min-w-0 items-center gap-1.5">
                    <Building2 className="h-3.5 w-3.5 shrink-0" aria-hidden />
                    <dt className="sr-only">{t('platform.cms.reviews.fieldCompany', 'Company')}</dt>
                    <dd className="truncate">{r.contactCompany}</dd>
                  </div>
                ) : null}
                <div className="flex min-w-0 items-center gap-1.5">
                  <Mail className="h-3.5 w-3.5 shrink-0" aria-hidden />
                  <dt className="sr-only">
                    {t('platform.cms.reviews.fieldEmail', 'Email (private)')}
                  </dt>
                  <dd className="truncate">
                    {r.contactEmail ? (
                      <a href={`mailto:${r.contactEmail}`} className="hover:text-foreground">
                        {r.contactEmail}
                      </a>
                    ) : (
                      '—'
                    )}
                  </dd>
                </div>
                <div className="flex min-w-0 items-center gap-1.5">
                  <Phone className="h-3.5 w-3.5 shrink-0" aria-hidden />
                  <dt className="sr-only">
                    {t('platform.cms.reviews.fieldPhone', 'Phone (private)')}
                  </dt>
                  <dd className="truncate">
                    {r.contactPhone ? (
                      <a href={`tel:${r.contactPhone}`} className="hover:text-foreground">
                        {r.contactPhone}
                      </a>
                    ) : (
                      '—'
                    )}
                  </dd>
                </div>
              </dl>
              <div className="text-muted-foreground flex items-center justify-between text-xs">
                <span>{platformDate(r.createdAt)}</span>
                <span className="flex gap-1">
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-8 px-2"
                    disabled={toggle.isPending}
                    aria-label={
                      r.isActive
                        ? t('platform.cms.reviews.hide', 'Hide from website')
                        : t('platform.cms.reviews.show', 'Show on website')
                    }
                    title={
                      r.isActive
                        ? t('platform.cms.reviews.hide', 'Hide from website')
                        : t('platform.cms.reviews.show', 'Show on website')
                    }
                    onClick={() =>
                      toggle.mutate(r.id, {
                        onSuccess: (active) =>
                          toast.success(
                            active
                              ? t(
                                  'platform.cms.reviews.nowVisible',
                                  'Review is now visible on the website',
                                )
                              : t(
                                  'platform.cms.reviews.nowHidden',
                                  'Review hidden from the website',
                                ),
                          ),
                      })
                    }
                  >
                    {r.isActive ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-8 px-2"
                    aria-label={t('platform.cms.edit', 'Edit')}
                    onClick={() => {
                      setEditing(r);
                      setDialogOpen(true);
                    }}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-destructive hover:text-destructive h-8 px-2"
                    aria-label={t('platform.cms.delete', 'Delete')}
                    onClick={() => setDeleting(r)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </span>
              </div>
            </li>
          ))}
        </ul>
      )}

      <ReviewDialog open={dialogOpen} onOpenChange={setDialogOpen} editing={editing} />

      <ConfirmDialog
        open={Boolean(deleting)}
        onOpenChange={(open) => !open && setDeleting(null)}
        title={t('platform.cms.reviews.deleteTitle', 'Delete this review?')}
        description={
          deleting
            ? t('platform.cms.reviews.deleteDesc', "{name}'s review is removed permanently.", {
                name: deleting.name,
              })
            : undefined
        }
        confirmLabel={
          remove.isPending
            ? t('platform.cms.deleting', 'Deleting…')
            : t('platform.cms.delete', 'Delete')
        }
        destructive
        onConfirm={() =>
          deleting &&
          remove.mutate(deleting.id, {
            onSuccess: () => toast.success(t('platform.cms.reviews.deleted', 'Review deleted')),
            onSettled: () => setDeleting(null),
          })
        }
      />
    </div>
  );
}
