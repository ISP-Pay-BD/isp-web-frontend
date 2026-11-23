'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useTranslations } from '@/i18n/locale-context';
import { SettingsSectionForm, type FieldGroup } from './SettingsSectionForm';

export function CronjobSection() {
  const t = useTranslations();
  const groups = useMemo<FieldGroup[]>(
    () => [
      {
        title: t('platform.systemSettings.cron.notifyTitle', 'Expiry reminders'),
        fields: [
          {
            key: 'notify_user_subscription_expire_before_days',
            label: t(
              'platform.systemSettings.cron.notifyDays',
              'Send expiry reminder before (days)',
            ),
            placeholder: '3, 7, 10',
            fallback: '3',
            wide: true,
            hint: t(
              'platform.systemSettings.cron.notifyHint',
              'Comma-separated days before expiry when customers get the SMS/email reminder.',
            ),
          },
        ],
      },
      {
        title: t('platform.systemSettings.cron.smsTitle', 'SMS log clean-up'),
        fields: [
          {
            key: 'sms_retention_days',
            label: t('platform.systemSettings.cron.retention', 'Keep SMS history for'),
            type: 'select',
            fallback: '15',
            options: {
              '7': t('platform.systemSettings.cron.days7', '7 days'),
              '15': t('platform.systemSettings.cron.days15', '15 days (recommended)'),
              '30': t('platform.systemSettings.cron.days30', '30 days'),
              '60': t('platform.systemSettings.cron.days60', '60 days'),
              '90': t('platform.systemSettings.cron.days90', '90 days'),
            },
            hint: t(
              'platform.systemSettings.cron.retentionHint',
              'Older SMS records are purged nightly.',
            ),
          },
        ],
      },
    ],
    [t],
  );

  return (
    <SettingsSectionForm
      section="cronjob"
      groups={groups}
      footer={() => (
        <Card className="border-border/60">
          <CardContent className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-muted-foreground text-sm">
              {t(
                'platform.systemSettings.cron.dashboardHint',
                'See when each background job last ran, run one now or clear stuck locks.',
              )}
            </p>
            <Button
              type="button"
              variant="outline"
              size="sm"
              render={<Link href="/platform/cron" />}
            >
              <Clock className="mr-1.5 h-4 w-4" />
              {t('platform.systemSettings.cron.openDashboard', 'Open cron dashboard')}
            </Button>
          </CardContent>
        </Card>
      )}
    />
  );
}
