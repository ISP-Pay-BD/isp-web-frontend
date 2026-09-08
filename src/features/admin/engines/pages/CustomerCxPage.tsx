'use client';

import { useMemo, useState } from 'react';
import { toast } from 'sonner';
import { PageHeader } from '@/features/shared/page-header';
import { PageSkeleton } from '@/components/shared/LoadingSkeleton';
import { EmptyState } from '@/components/shared/EmptyState';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { getEngineGroup } from '@/data/admin/engines.catalog';
import { useEngines } from '../hooks/use-engines';

/** Customer portal slice of CX engine — prefs, history, feedback, CSAT */
export function CustomerCxPage() {
  const { data, isLoading, isError, refetch } = useEngines('admin');
  const group = getEngineGroup('cx');
  const [sms, setSms] = useState(true);
  const [wa, setWa] = useState(true);
  const [email, setEmail] = useState(false);
  const [feedback, setFeedback] = useState('');

  const prefs = useMemo(
    () =>
      data?.records
        .filter((r) => r.featureId === 'notify-prefs' || r.featureId === 'notify-history')
        .slice(0, 8) ?? [],
    [data],
  );

  if (isLoading) return <PageSkeleton variant="cards" />;
  if (isError || !data || !group) {
    return <EmptyState title="Failed to load experience" actionLabel="Retry" onAction={() => refetch()} />;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="My Experience"
        subtitle="Notifications, feedback, and service requests"
        breadcrumb={[
          { label: 'Dashboard', url: '/customer/dashboard' },
          { label: 'Experience' },
        ]}
      />

      <Card className="border-border/60">
        <CardHeader>
          <CardTitle className="text-base">Notification preferences</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <PrefRow label="SMS" checked={sms} onChange={setSms} />
          <PrefRow label="WhatsApp" checked={wa} onChange={setWa} />
          <PrefRow label="Email" checked={email} onChange={setEmail} />
          <Button size="sm" className="duration-200 ease-out" onClick={() => toast.success('Preferences saved (static)')}>
            Save preferences
          </Button>
        </CardContent>
      </Card>

      <Card className="border-border/60">
        <CardHeader>
          <CardTitle className="text-base">Recent notifications</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {prefs.length === 0 ? (
            <EmptyState title="No notifications yet" />
          ) : (
            prefs.map((p) => (
              <div
                key={p.id}
                className="flex items-center justify-between gap-2 rounded-lg border border-border/50 px-3 py-2 text-sm transition-colors duration-200 ease-out"
              >
                <span>{p.title}</span>
                <Badge variant="outline">{p.status}</Badge>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      <Card className="border-border/60">
        <CardHeader>
          <CardTitle className="text-base">Feedback / CSAT</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Textarea
            placeholder="Tell us about your experience…"
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
          />
          <div className="flex flex-wrap gap-2">
            {[1, 2, 3, 4, 5].map((n) => (
              <Button
                key={n}
                size="sm"
                variant="outline"
                className="duration-200 ease-out"
                onClick={() => toast.success(`CSAT ${n}/5 saved (static)`)}
              >
                {n}★
              </Button>
            ))}
            <Button
              size="sm"
              className="duration-200 ease-out"
              onClick={() => {
                toast.success('Feedback submitted (static)');
                setFeedback('');
              }}
            >
              Submit feedback
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function PrefRow({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm">{label}</span>
      <Switch checked={checked} onCheckedChange={onChange} />
    </div>
  );
}
