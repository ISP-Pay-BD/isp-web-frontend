'use client';

import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { MessageSquare } from 'lucide-react';
import { ApiError } from '@/lib/api/client';
import { errorMessage } from '@/lib/api/utils/error-handler';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useTranslations } from '@/i18n/locale-context';
import { SMS_GATEWAYS, systemSettingsApi } from '../api/system-settings.api';

export function SmsBalanceSection() {
  const t = useTranslations();
  const [gateway, setGateway] = useState<string>(SMS_GATEWAYS[0]);
  const check = useMutation({ mutationFn: systemSettingsApi.checkBalance });
  const items = Object.fromEntries(SMS_GATEWAYS.map((g) => [g, g]));
  const forbidden = check.error instanceof ApiError && check.error.status === 403;
  const result = check.data;

  return (
    <Card className="border-border/60">
      <CardHeader>
        <CardTitle className="text-base">
          {t('platform.systemSettings.sms.title', 'SMS gateway balance')}
        </CardTitle>
        <p className="text-muted-foreground text-xs">
          {t(
            'platform.systemSettings.sms.hint',
            'Asks the gateway for the remaining balance on the platform account.',
          )}
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <div className="space-y-2 sm:w-64">
            <Label htmlFor="sms-balance-gateway">
              {t('platform.systemSettings.sms.gateway', 'Gateway')}
            </Label>
            <Select
              value={gateway}
              items={items}
              onValueChange={(v) => {
                setGateway(String(v));
                check.reset();
              }}
            >
              <SelectTrigger id="sms-balance-gateway" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {SMS_GATEWAYS.map((g) => (
                  <SelectItem key={g} value={g}>
                    {g}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button type="button" onClick={() => check.mutate(gateway)} disabled={check.isPending}>
            <MessageSquare className="mr-1.5 h-4 w-4" />
            {check.isPending
              ? t('platform.systemSettings.sms.checking', 'Checking…')
              : t('platform.systemSettings.sms.check', 'Check balance')}
          </Button>
        </div>

        <div aria-live="polite">
          {check.isError ? (
            <p className="border-destructive/30 bg-destructive/5 text-destructive rounded-md border p-3 text-sm">
              {forbidden
                ? t('platform.ops.forbidden', 'Only platform super admins can open this page.')
                : errorMessage(
                    check.error,
                    t('platform.systemSettings.sms.failed', 'Could not check the balance.'),
                  )}
            </p>
          ) : check.isSuccess ? (
            // PHP answers with plain text: the balance, or why it could not be read.
            <p className="rounded-md border border-emerald-500/30 bg-emerald-500/5 p-3 text-sm">
              <span className="text-muted-foreground">
                {t('platform.systemSettings.sms.balanceOf', '{gateway} balance:', {
                  gateway: check.variables ?? gateway,
                })}
              </span>{' '}
              <span className="font-semibold tabular-nums">{result || '—'}</span>
            </p>
          ) : (
            <p className="text-muted-foreground text-xs">
              {t(
                'platform.systemSettings.sms.idle',
                'Pick a gateway and check — nothing is sent to customers.',
              )}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
