'use client';

import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Star } from 'lucide-react';
import { PageHeader } from '@/features/shared/page-header';
import { EmptyState } from '@/components/shared/EmptyState';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { customerService } from '@/lib/api/services/customer.service';
import { errorMessage } from '@/lib/api/utils/error-handler';
import { formatCount, formatDate } from '@/lib/format';
import { useTranslations } from '@/i18n/locale-context';
import { cn } from '@/lib/utils';
import {
  useCustomerFeedback,
  useNotificationPrefs,
  useSubmitFeedback,
  useUpdateNotificationPrefs,
  type FeedbackCategory,
  type NotificationPrefFlags,
  type NotificationPrefKey,
  type NotificationPrefs,
} from '../hooks/use-customer-cx';

const NOTIFICATIONS_KEY = ['customer', 'notifications'] as const;
const COMMENT_MAX = 2000;

type Translate = ReturnType<typeof useTranslations>;

function prefGroups(t: Translate): { id: string; title: string; items: { key: NotificationPrefKey; label: string; hint: string }[] }[] {
  return [
    {
      id: 'channels',
      title: t('customer.experience.channels', 'Channels'),
      items: [
        { key: 'sms', label: 'SMS', hint: t('customer.experience.smsHint', 'Text messages to your mobile number') },
        { key: 'whatsapp', label: 'WhatsApp', hint: t('customer.experience.whatsappHint', 'Messages on WhatsApp') },
        {
          key: 'email',
          label: t('customer.experience.email', 'Email'),
          hint: t('customer.experience.emailHint', 'Messages to your email address'),
        },
        {
          key: 'push',
          label: t('customer.experience.push', 'App notifications'),
          hint: t('customer.experience.pushHint', 'Alerts in the app and this portal'),
        },
      ],
    },
    {
      id: 'topics',
      title: t('customer.experience.topics', 'Topics'),
      items: [
        {
          key: 'billingReminders',
          label: t('customer.experience.billing', 'Billing reminders'),
          hint: t('customer.experience.billingHint', 'Upcoming expiry and due-payment reminders'),
        },
        {
          key: 'outageAlerts',
          label: t('customer.experience.outage', 'Outage alerts'),
          hint: t('customer.experience.outageHint', 'Service interruptions and maintenance'),
        },
        {
          key: 'promotions',
          label: t('customer.experience.promotions', 'Offers & promotions'),
          hint: t('customer.experience.promotionsHint', 'New packages and special offers'),
        },
      ],
    },
  ];
}

/** The feedback category in the active language; categories the server adds later keep the label it sends. */
function feedbackCategoryLabel(t: Translate, category: { value: string; label: string }): string {
  switch (category.value) {
    case 'service':
      return t('customer.experience.catService', 'Internet service');
    case 'speed':
      return t('customer.experience.catSpeed', 'Speed');
    case 'billing':
      return t('customer.experience.catBilling', 'Billing & payments');
    case 'support':
      return t('customer.experience.catSupport', 'Customer support');
    case 'installation':
      return t('customer.experience.catInstallation', 'Installation');
    case 'other':
      return t('customer.experience.catOther', 'Other');
    default:
      return category.label;
  }
}

/**
 * Customer "My Experience": the in-app notification inbox
 * (GET /v1/customer/notifications + POST /v1/customer/notifications/read),
 * notification preferences (GET/PUT /v1/customer/notification-prefs) and
 * CSAT feedback (GET/POST /v1/customer/feedback).
 */
export function CustomerCxPage() {
  const t = useTranslations();

  return (
    <div className="space-y-6">
      <PageHeader
        title={t('customer.experience.title', 'My Experience')}
        subtitle={t('customer.experience.subtitle', 'Notifications, alert preferences and feedback for your provider')}
        breadcrumb={[
          { label: t('customer.experience.dashboard', 'Dashboard'), url: '/customer/dashboard' },
          { label: t('customer.experience.crumb', 'Experience') },
        ]}
      />
      <NotificationInbox />
      <div className="grid gap-6 lg:grid-cols-2">
        <NotificationPrefsCard />
        <FeedbackCard />
      </div>
    </div>
  );
}

function CardLoading({ rows = 3 }: { rows?: number }) {
  return (
    <div className="space-y-2.5">
      {Array.from({ length: rows }).map((_, i) => (
        <Skeleton key={i} className="h-10 w-full rounded-lg" />
      ))}
    </div>
  );
}

/* ─── Inbox ─────────────────────────────────────────────────────────── */

function NotificationInbox() {
  const t = useTranslations();
  const queryClient = useQueryClient();
  const { data, isLoading, isError, error, refetch, isFetching } = useQuery({
    queryKey: NOTIFICATIONS_KEY,
    queryFn: () => customerService.getNotifications(),
  });

  const markRead = useMutation({
    mutationFn: (id?: number) => customerService.markNotificationsRead(id),
    onSuccess: (_res, id) => {
      queryClient.invalidateQueries({ queryKey: NOTIFICATIONS_KEY });
      if (id === undefined) toast.success(t('customer.experience.allRead', 'All notifications marked as read'));
    },
  });

  return (
    <Card className="border-border/60">
      <CardHeader className="flex flex-col gap-3 space-y-0 sm:flex-row sm:items-center sm:justify-between">
        <CardTitle className="flex flex-wrap items-center gap-2 text-base">
          {t('customer.experience.notifications', 'Notifications')}
          {data && data.unreadCount > 0 && (
            <Badge variant="secondary" className="text-xs">
              {t('customer.experience.unread', '{n} unread', { n: formatCount(data.unreadCount) })}
            </Badge>
          )}
        </CardTitle>
        <div className="flex gap-2">
          <Button variant="ghost" className="h-11 flex-1 sm:flex-none" disabled={isFetching} onClick={() => refetch()}>
            {t('customer.experience.refresh', 'Refresh')}
          </Button>
          <Button
            variant="outline"
            className="h-11 flex-1 sm:flex-none"
            disabled={!data || data.unreadCount === 0 || markRead.isPending}
            onClick={() => markRead.mutate(undefined)}
          >
            {t('customer.experience.markAllRead', 'Mark all read')}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        {isLoading ? (
          <CardLoading />
        ) : isError || !data ? (
          <EmptyState
            variant="error"
            title={t('customer.experience.loadFailed', 'Failed to load notifications')}
            description={error?.message}
            actionLabel={t('customer.common.retry', 'Retry')}
            onAction={() => refetch()}
          />
        ) : data.notifications.length === 0 ? (
          <EmptyState
            title={t('customer.experience.empty', 'No notifications yet')}
            description={t('customer.experience.emptyHint', 'Billing, reward and support alerts will appear here.')}
            actionLabel={t('customer.experience.refresh', 'Refresh')}
            onAction={() => refetch()}
          />
        ) : (
          data.notifications.map((n) => (
            <div
              key={n.id}
              className={cn(
                'border-border/50 flex flex-col gap-2 rounded-lg border px-3 py-3 text-sm transition-colors duration-200 ease-out sm:flex-row sm:items-start sm:justify-between sm:gap-3',
                !n.read && 'bg-primary/5 border-primary/20',
              )}
            >
              <div className="min-w-0 space-y-0.5">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-medium">{n.title || t('customer.experience.notification', 'Notification')}</span>
                  {n.type && (
                    <Badge variant="outline" className="text-xs capitalize">
                      {n.type}
                    </Badge>
                  )}
                </div>
                {n.message && <p className="text-muted-foreground text-sm">{n.message}</p>}
                <p className="text-muted-foreground/70 font-mono text-sm">{formatDate(n.time)}</p>
              </div>
              {!n.read && (
                <Button
                  variant="ghost"
                  className="h-11 shrink-0 self-start"
                  disabled={markRead.isPending}
                  onClick={() => markRead.mutate(n.id)}
                >
                  {t('customer.experience.markRead', 'Mark read')}
                </Button>
              )}
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}

/* ─── Notification preferences ──────────────────────────────────────── */

function NotificationPrefsCard() {
  const t = useTranslations();
  const prefs = useNotificationPrefs();

  return (
    <Card className="border-border/60">
      <CardHeader>
        <CardTitle className="text-base">{t('customer.experience.prefsTitle', 'Notification preferences')}</CardTitle>
        <CardDescription>
          {t('customer.experience.prefsHint', 'Choose how and about what your provider contacts you.')}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {prefs.isLoading ? (
          <CardLoading rows={5} />
        ) : prefs.isError || !prefs.data ? (
          <EmptyState
            title={t('customer.experience.prefsUnavailable', 'Preferences unavailable')}
            description={errorMessage(
              prefs.error,
              t('customer.experience.prefsFailed', 'Could not load your notification preferences.'),
            )}
            actionLabel={t('customer.common.retry', 'Retry')}
            onAction={() => prefs.refetch()}
          />
        ) : (
          <NotificationPrefsForm prefs={prefs.data} />
        )}
      </CardContent>
    </Card>
  );
}

function NotificationPrefsForm({ prefs }: { prefs: NotificationPrefs }) {
  const t = useTranslations();
  const save = useUpdateNotificationPrefs();
  // Unsaved toggles; null = show the stored preferences.
  const [draft, setDraft] = useState<NotificationPrefFlags | null>(null);
  const value: NotificationPrefFlags = draft ?? prefs;

  const submit = () => {
    if (!draft) return;
    save.mutate(draft, {
      onSuccess: () => {
        setDraft(null);
        toast.success(t('customer.experience.prefsSaved', 'Notification preferences saved'));
      },
    });
  };

  return (
    <div className="space-y-5 text-sm">
      {prefGroups(t).map((group) => (
        <div key={group.id} className="space-y-2">
          <p className="text-muted-foreground text-sm font-semibold">{group.title}</p>
          <div className="divide-border/50 border-border/50 divide-y rounded-lg border">
            {group.items.map((item) => (
              <div key={item.key} className="flex items-center justify-between gap-4 px-3">
                <Label
                  htmlFor={`pref-${item.key}`}
                  className="min-h-14 min-w-0 flex-1 cursor-pointer flex-col items-start justify-center gap-0.5 py-2 leading-snug"
                >
                  <span className="text-sm font-medium">{item.label}</span>
                  <span className="text-muted-foreground text-sm font-normal">{item.hint}</span>
                </Label>
                <Switch
                  id={`pref-${item.key}`}
                  checked={value[item.key]}
                  disabled={save.isPending}
                  onCheckedChange={(checked) => setDraft({ ...value, [item.key]: checked })}
                />
              </div>
            ))}
          </div>
        </div>
      ))}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <span className="text-muted-foreground text-sm">
          {prefs.updatedAt
            ? t('customer.experience.lastSaved', 'Last saved {date}', { date: formatDate(prefs.updatedAt) })
            : t('customer.experience.defaults', 'Using default preferences')}
        </span>
        <div className="flex flex-col-reverse gap-2 sm:flex-row">
          {draft !== null && (
            <Button variant="ghost" className="h-11 w-full sm:w-auto" disabled={save.isPending} onClick={() => setDraft(null)}>
              {t('customer.experience.discard', 'Discard')}
            </Button>
          )}
          <Button className="h-11 w-full sm:w-auto" disabled={draft === null || save.isPending} onClick={submit}>
            {save.isPending ? t('customer.experience.saving', 'Saving…') : t('customer.experience.savePrefs', 'Save preferences')}
          </Button>
        </div>
      </div>
    </div>
  );
}

/* ─── Feedback (CSAT) ───────────────────────────────────────────────── */

function FeedbackCard() {
  const t = useTranslations();
  const feedback = useCustomerFeedback();

  return (
    <Card className="border-border/60">
      <CardHeader>
        <CardTitle className="text-base">{t('customer.experience.rateTitle', 'Rate your experience')}</CardTitle>
        <CardDescription>
          {t('customer.experience.rateHint', 'Your rating and comments go straight to your provider.')}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        {feedback.isLoading ? (
          <CardLoading rows={4} />
        ) : feedback.isError || !feedback.data ? (
          <EmptyState
            title={t('customer.experience.feedbackUnavailable', 'Feedback unavailable')}
            description={errorMessage(feedback.error, t('customer.experience.feedbackFailed', 'Could not load the feedback form.'))}
            actionLabel={t('customer.common.retry', 'Retry')}
            onAction={() => feedback.refetch()}
          />
        ) : (
          <>
            <FeedbackForm categories={feedback.data.categories} />
            {feedback.data.items.length > 0 && (
              <div className="space-y-2">
                <p className="text-muted-foreground text-sm font-semibold">
                  {t('customer.experience.recent', 'Your recent feedback')}
                </p>
                {feedback.data.items.map((f) => (
                  <div key={f.id} className="border-border/50 rounded-lg border px-3 py-2 text-sm">
                    <div className="flex items-center justify-between gap-2">
                      <Stars value={f.rating} />
                      <Badge variant="outline" className="text-xs">
                        {feedbackCategoryLabel(t, { value: f.category, label: f.categoryLabel })}
                      </Badge>
                    </div>
                    {f.comment && <p className="text-muted-foreground mt-1 text-sm">{f.comment}</p>}
                    {f.createdAt && <p className="text-muted-foreground/70 mt-1 font-mono text-sm">{formatDate(f.createdAt)}</p>}
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}

function Stars({ value }: { value: number }) {
  const t = useTranslations();

  return (
    <span className="flex items-center gap-0.5" role="img" aria-label={t('customer.experience.outOf5', '{n} out of 5', { n: formatCount(value) })}>
      {[1, 2, 3, 4, 5].map((n) => (
        <Star key={n} className={cn('h-4 w-4', n <= value ? 'fill-amber-400 text-amber-400' : 'text-muted-foreground/40')} />
      ))}
    </span>
  );
}

function FeedbackForm({ categories }: { categories: FeedbackCategory[] }) {
  const t = useTranslations();
  const submit = useSubmitFeedback();
  const [rating, setRating] = useState(0);
  const [category, setCategory] = useState('');
  const [comment, setComment] = useState('');
  const categoryItems = Object.fromEntries(categories.map((c) => [c.value, feedbackCategoryLabel(t, c)]));
  const canSubmit = rating >= 1 && rating <= 5 && Boolean(category) && comment.length <= COMMENT_MAX;

  const send = () =>
    submit.mutate(
      { rating, category, comment },
      {
        onSuccess: () => {
          setRating(0);
          setCategory('');
          setComment('');
          toast.success(t('customer.experience.thanks', 'Thank you for your feedback'));
        },
      },
    );

  return (
    <form
      className="space-y-4 text-sm"
      onSubmit={(e) => {
        e.preventDefault();
        if (canSubmit) send();
      }}
    >
      <div className="space-y-1.5">
        <Label className="text-sm font-semibold">{t('customer.experience.rating', 'Rating')}</Label>
        <div className="flex items-center gap-1" role="radiogroup" aria-label={t('customer.experience.rating', 'Rating')}>
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              type="button"
              role="radio"
              aria-checked={rating === n}
              aria-label={n === 1 ? t('customer.experience.starOne', '1 star') : t('customer.experience.starMany', '{n} stars', { n: formatCount(n) })}
              onClick={() => setRating(n)}
              className="focus-visible:ring-ring/50 flex h-11 w-11 items-center justify-center rounded-md transition-transform duration-150 ease-out hover:scale-110 focus-visible:ring-2 focus-visible:outline-none"
            >
              <Star className={cn('h-7 w-7', n <= rating ? 'fill-amber-400 text-amber-400' : 'text-muted-foreground/50')} />
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="category" className="text-sm font-semibold">{t('customer.experience.category', 'Category')}</Label>
        <Select value={category || null} items={categoryItems} onValueChange={(v) => setCategory(v ? String(v) : '')}>
          <SelectTrigger id="category" className="w-full data-[size=default]:h-11">
            <SelectValue placeholder={t('customer.experience.categoryPlaceholder', 'What is your feedback about?')} />
          </SelectTrigger>
          <SelectContent>
            {categories.map((c) => (
              <SelectItem key={c.value} value={c.value} className="min-h-11">
                {feedbackCategoryLabel(t, c)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="feedback-comment" className="text-sm font-semibold">
          {t('customer.experience.comment', 'Comment (optional)')}
        </Label>
        <Textarea
          id="feedback-comment"
          value={comment}
          maxLength={COMMENT_MAX}
          onChange={(e) => setComment(e.target.value)}
          placeholder={t('customer.experience.commentPlaceholder', 'Tell us what went well or what we can improve')}
          className="min-h-24 resize-y text-sm"
        />
      </div>

      <div className="flex justify-end">
        <Button type="submit" className="h-11 w-full sm:w-auto" disabled={!canSubmit || submit.isPending}>
          {submit.isPending ? t('customer.experience.sending', 'Sending…') : t('customer.experience.send', 'Send feedback')}
        </Button>
      </div>
    </form>
  );
}
