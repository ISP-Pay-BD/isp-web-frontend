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
import { formatDate } from '@/lib/format';
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

const PREF_GROUPS: { title: string; items: { key: NotificationPrefKey; label: string; hint: string }[] }[] = [
  {
    title: 'Channels',
    items: [
      { key: 'sms', label: 'SMS', hint: 'Text messages to your mobile number' },
      { key: 'whatsapp', label: 'WhatsApp', hint: 'Messages on WhatsApp' },
      { key: 'email', label: 'Email', hint: 'Messages to your email address' },
      { key: 'push', label: 'App notifications', hint: 'Alerts in the app and this portal' },
    ],
  },
  {
    title: 'Topics',
    items: [
      { key: 'billingReminders', label: 'Billing reminders', hint: 'Upcoming expiry and due-payment reminders' },
      { key: 'outageAlerts', label: 'Outage alerts', hint: 'Service interruptions and maintenance' },
      { key: 'promotions', label: 'Offers & promotions', hint: 'New packages and special offers' },
    ],
  },
];

/**
 * Customer "My Experience": the in-app notification inbox
 * (GET /v1/customer/notifications + POST /v1/customer/notifications/read),
 * notification preferences (GET/PUT /v1/customer/notification-prefs) and
 * CSAT feedback (GET/POST /v1/customer/feedback).
 */
export function CustomerCxPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="My Experience"
        subtitle="Notifications, alert preferences and feedback for your provider"
        breadcrumb={[
          { label: 'Dashboard', url: '/customer/dashboard' },
          { label: 'Experience' },
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
  const queryClient = useQueryClient();
  const { data, isLoading, isError, error, refetch, isFetching } = useQuery({
    queryKey: NOTIFICATIONS_KEY,
    queryFn: () => customerService.getNotifications(),
  });

  const markRead = useMutation({
    mutationFn: (id?: number) => customerService.markNotificationsRead(id),
    onSuccess: (_res, id) => {
      queryClient.invalidateQueries({ queryKey: NOTIFICATIONS_KEY });
      if (id === undefined) toast.success('All notifications marked as read');
    },
  });

  return (
    <Card className="border-border/60">
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <CardTitle className="text-base">
          Notifications
          {data && data.unreadCount > 0 && (
            <Badge variant="secondary" className="ml-2 text-xs">
              {data.unreadCount} unread
            </Badge>
          )}
        </CardTitle>
        <div className="flex gap-2">
          <Button size="sm" variant="ghost" disabled={isFetching} onClick={() => refetch()}>
            Refresh
          </Button>
          <Button
            size="sm"
            variant="outline"
            disabled={!data || data.unreadCount === 0 || markRead.isPending}
            onClick={() => markRead.mutate(undefined)}
          >
            Mark all read
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        {isLoading ? (
          <CardLoading />
        ) : isError || !data ? (
          <EmptyState
            title="Failed to load notifications"
            description={error?.message}
            actionLabel="Retry"
            onAction={() => refetch()}
          />
        ) : data.notifications.length === 0 ? (
          <EmptyState
            title="No notifications yet"
            description="Billing, reward and support alerts will appear here."
            actionLabel="Refresh"
            onAction={() => refetch()}
          />
        ) : (
          data.notifications.map((n) => (
            <div
              key={n.id}
              className={cn(
                'flex items-start justify-between gap-3 rounded-lg border border-border/50 px-3 py-2 text-sm transition-colors duration-200 ease-out',
                !n.read && 'bg-primary/5 border-primary/20',
              )}
            >
              <div className="min-w-0 space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className="font-medium">{n.title || 'Notification'}</span>
                  {n.type && (
                    <Badge variant="outline" className="text-[10px] capitalize">
                      {n.type}
                    </Badge>
                  )}
                </div>
                {n.message && <p className="text-muted-foreground text-xs">{n.message}</p>}
                <p className="text-muted-foreground/70 font-mono text-[10px]">{formatDate(n.time)}</p>
              </div>
              {!n.read && (
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-7 shrink-0 text-xs"
                  disabled={markRead.isPending}
                  onClick={() => markRead.mutate(n.id)}
                >
                  Mark read
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
  const prefs = useNotificationPrefs();

  return (
    <Card className="border-border/60">
      <CardHeader>
        <CardTitle className="text-base">Notification preferences</CardTitle>
        <CardDescription>Choose how and about what your provider contacts you.</CardDescription>
      </CardHeader>
      <CardContent>
        {prefs.isLoading ? (
          <CardLoading rows={5} />
        ) : prefs.isError || !prefs.data ? (
          <EmptyState
            title="Preferences unavailable"
            description={errorMessage(prefs.error, 'Could not load your notification preferences.')}
            actionLabel="Retry"
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
  const save = useUpdateNotificationPrefs();
  // Unsaved toggles; null = show the stored preferences.
  const [draft, setDraft] = useState<NotificationPrefFlags | null>(null);
  const value: NotificationPrefFlags = draft ?? prefs;

  const submit = () => {
    if (!draft) return;
    save.mutate(draft, {
      onSuccess: () => {
        setDraft(null);
        toast.success('Notification preferences saved');
      },
    });
  };

  return (
    <div className="space-y-5 text-sm">
      {PREF_GROUPS.map((group) => (
        <div key={group.title} className="space-y-2">
          <p className="text-muted-foreground text-[11px] font-semibold tracking-wide uppercase">{group.title}</p>
          <div className="divide-border/50 divide-y rounded-lg border border-border/50">
            {group.items.map((item) => (
              <div key={item.key} className="flex items-center justify-between gap-4 px-3 py-2">
                <div className="min-w-0">
                  <Label htmlFor={`pref-${item.key}`} className="text-sm font-medium">
                    {item.label}
                  </Label>
                  <p className="text-muted-foreground text-xs">{item.hint}</p>
                </div>
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
      <div className="flex items-center justify-between gap-3">
        <span className="text-muted-foreground text-xs">
          {prefs.updatedAt ? `Last saved ${formatDate(prefs.updatedAt)}` : 'Using default preferences'}
        </span>
        <div className="flex gap-2">
          {draft !== null && (
            <Button size="sm" variant="ghost" disabled={save.isPending} onClick={() => setDraft(null)}>
              Discard
            </Button>
          )}
          <Button size="sm" disabled={draft === null || save.isPending} onClick={submit}>
            {save.isPending ? 'Saving…' : 'Save preferences'}
          </Button>
        </div>
      </div>
    </div>
  );
}

/* ─── Feedback (CSAT) ───────────────────────────────────────────────── */

function FeedbackCard() {
  const feedback = useCustomerFeedback();

  return (
    <Card className="border-border/60">
      <CardHeader>
        <CardTitle className="text-base">Rate your experience</CardTitle>
        <CardDescription>Your rating and comments go straight to your provider.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        {feedback.isLoading ? (
          <CardLoading rows={4} />
        ) : feedback.isError || !feedback.data ? (
          <EmptyState
            title="Feedback unavailable"
            description={errorMessage(feedback.error, 'Could not load the feedback form.')}
            actionLabel="Retry"
            onAction={() => feedback.refetch()}
          />
        ) : (
          <>
            <FeedbackForm categories={feedback.data.categories} />
            {feedback.data.items.length > 0 && (
              <div className="space-y-2">
                <p className="text-muted-foreground text-[11px] font-semibold tracking-wide uppercase">
                  Your recent feedback
                </p>
                {feedback.data.items.map((f) => (
                  <div key={f.id} className="rounded-lg border border-border/50 px-3 py-2 text-sm">
                    <div className="flex items-center justify-between gap-2">
                      <Stars value={f.rating} />
                      <Badge variant="outline" className="text-[10px]">
                        {f.categoryLabel}
                      </Badge>
                    </div>
                    {f.comment && <p className="text-muted-foreground mt-1 text-xs">{f.comment}</p>}
                    {f.createdAt && (
                      <p className="text-muted-foreground/70 mt-1 font-mono text-[10px]">{formatDate(f.createdAt)}</p>
                    )}
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
  return (
    <span className="flex items-center gap-0.5" aria-label={`${value} out of 5`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <Star key={n} className={cn('h-3.5 w-3.5', n <= value ? 'fill-amber-400 text-amber-400' : 'text-muted-foreground/40')} />
      ))}
    </span>
  );
}

function FeedbackForm({ categories }: { categories: FeedbackCategory[] }) {
  const submit = useSubmitFeedback();
  const [rating, setRating] = useState(0);
  const [category, setCategory] = useState('');
  const [comment, setComment] = useState('');
  const categoryItems = Object.fromEntries(categories.map((c) => [c.value, c.label]));
  const canSubmit = rating >= 1 && rating <= 5 && Boolean(category) && comment.length <= COMMENT_MAX;

  const send = () =>
    submit.mutate(
      { rating, category, comment },
      {
        onSuccess: () => {
          setRating(0);
          setCategory('');
          setComment('');
          toast.success('Thank you for your feedback');
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
        <Label className="text-xs font-semibold">Rating</Label>
        <div className="flex items-center gap-1" role="radiogroup" aria-label="Rating">
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              type="button"
              role="radio"
              aria-checked={rating === n}
              aria-label={`${n} star${n > 1 ? 's' : ''}`}
              onClick={() => setRating(n)}
              className="rounded-md p-1 transition-transform duration-150 ease-out hover:scale-110 focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:outline-none"
            >
              <Star className={cn('h-6 w-6', n <= rating ? 'fill-amber-400 text-amber-400' : 'text-muted-foreground/50')} />
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-1.5">
        <Label className="text-xs font-semibold">Category</Label>
        <Select value={category || null} items={categoryItems} onValueChange={(v) => setCategory(v ? String(v) : '')}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="What is your feedback about?" />
          </SelectTrigger>
          <SelectContent>
            {categories.map((c) => (
              <SelectItem key={c.value} value={c.value}>
                {c.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="feedback-comment" className="text-xs font-semibold">
          Comment (optional)
        </Label>
        <Textarea
          id="feedback-comment"
          value={comment}
          maxLength={COMMENT_MAX}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Tell us what went well or what we can improve"
          className="h-20 resize-y text-sm"
        />
      </div>

      <div className="flex justify-end">
        <Button type="submit" size="sm" disabled={!canSubmit || submit.isPending}>
          {submit.isPending ? 'Sending…' : 'Send feedback'}
        </Button>
      </div>
    </form>
  );
}
