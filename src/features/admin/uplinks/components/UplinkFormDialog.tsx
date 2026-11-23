'use client';

import { useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { Wand2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { handleApiError } from '@/lib/api/utils/error-handler';
import { useLocale } from '@/i18n/locale-context';
import { uplinkSchema, type UplinkFormValues } from '../schemas/uplink.schema';
import { useSaveUplink, useUplinkCandidates } from '../hooks/useUplinks';
import type { UplinkCandidates, UplinkRouterOption, UplinkRow, UplinkType } from '../types';

const selectCls = 'h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  uplink: UplinkRow | null;
  routers: UplinkRouterOption[];
  defaultRouterId?: string;
  /** Account numbers alerts go to when no override is set. */
  defaultMobile: string;
  defaultWhatsapp: string;
}

function toForm(u: UplinkRow | null, routerId?: string): UplinkFormValues {
  return {
    routerId: u?.routerId ?? routerId ?? '',
    name: u?.name ?? '',
    uplinkType: u?.uplinkType ?? 'interface',
    target: u?.target ?? '',
    alertChannels: u?.alertChannels ?? 'both',
    notifyMobile: u?.notifyMobile ?? '',
    notifyWhatsapp: u?.notifyWhatsapp ?? '',
    failThreshold: u?.failThreshold ?? 1,
  };
}

function candidateOptions(c: UplinkCandidates | undefined, type: UplinkType) {
  if (!c) return [];
  if (type === 'interface')
    return c.interfaces.map((i) => ({
      value: i.name,
      label: `${i.name} (${i.type}${i.comment ? ` · ${i.comment}` : ''}) ${i.running ? '● up' : '○ down'}`,
    }));
  if (type === 'bgp')
    return c.bgp.map((b) => ({
      value: b.name || b.remote,
      label: `${b.name || b.remote} · AS${b.as} · ${b.state}`,
    }));
  if (type === 'netwatch')
    return c.netwatch.map((n) => ({
      value: n.host,
      label: `${n.host}${n.comment ? ` · ${n.comment}` : ''} (${n.status})`,
    }));
  return [];
}

export function UplinkFormDialog({
  open,
  onOpenChange,
  uplink,
  routers,
  defaultRouterId,
  defaultMobile,
  defaultWhatsapp,
}: Props) {
  const { t, te } = useLocale();
  const save = useSaveUplink();
  const [detectFor, setDetectFor] = useState('');
  const [showRecipients, setShowRecipients] = useState(
    Boolean(uplink?.notifyMobile || uplink?.notifyWhatsapp),
  );
  const {
    register,
    handleSubmit,
    setValue,
    setError,
    control,
    formState: { errors, isSubmitting },
  } = useForm<UplinkFormValues>({
    resolver: zodResolver(uplinkSchema),
    values: toForm(uplink, defaultRouterId),
  });

  const routerId = useWatch({ control, name: 'routerId' });
  const uplinkType = useWatch({ control, name: 'uplinkType' });
  const candidates = useUplinkCandidates(detectFor && detectFor === routerId ? detectFor : '');
  const options = candidateOptions(candidates.data, uplinkType);

  const onSubmit = async (values: UplinkFormValues) => {
    try {
      await save.mutateAsync({ id: uplink?.id, values });
      toast.success(
        uplink
          ? t('admin.uplinks.form.updated', 'Uplink updated')
          : t('admin.uplinks.form.created', 'Uplink added and checked'),
      );
      onOpenChange(false);
    } catch (err) {
      handleApiError(err, setError);
    }
  };

  const detectState =
    !detectFor || detectFor !== routerId
      ? null
      : candidates.isFetching
        ? t('admin.uplinks.form.detecting', 'Reading the router...')
        : candidates.isError
          ? candidates.error.message
          : candidates.data && !candidates.data.ok
            ? candidates.data.error ||
              t('admin.uplinks.form.detectFailed', 'Could not read the router.')
            : uplinkType === 'ping'
              ? t('admin.uplinks.form.pingHint', 'Ping targets are IP addresses; type one below.')
              : options.length === 0
                ? t(
                    'admin.uplinks.form.noCandidates',
                    'Nothing of this type was found on the router.',
                  )
                : null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92dvh] overflow-y-auto sm:max-w-[560px]">
        <DialogHeader>
          <DialogTitle>
            {uplink
              ? t('admin.uplinks.form.editTitle', 'Edit monitored uplink')
              : t('admin.uplinks.form.newTitle', 'Monitor a new uplink')}
          </DialogTitle>
          <DialogDescription>
            {t(
              'admin.uplinks.form.desc',
              'When this link goes down the ISP admin gets a WhatsApp and/or SMS alert.',
            )}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-2">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="uplink-router">{t('admin.uplinks.form.router', 'Router *')}</Label>
              <select id="uplink-router" className={selectCls} {...register('routerId')}>
                <option value="">{t('admin.uplinks.form.pickRouter', 'Select a router')}</option>
                {routers.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name} ({r.host})
                  </option>
                ))}
              </select>
              {errors.routerId && (
                <p className="text-destructive text-xs">{te(errors.routerId.message ?? '')}</p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="uplink-name">{t('admin.uplinks.form.name', 'Uplink name *')}</Label>
              <Input
                id="uplink-name"
                placeholder={t(
                  'admin.uplinks.form.namePlaceholder',
                  'e.g. YouTube Cache, FB CDN, BDIX',
                )}
                {...register('name')}
              />
              {errors.name && (
                <p className="text-destructive text-xs">{te(errors.name.message ?? '')}</p>
              )}
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="uplink-type">
              {t('admin.uplinks.form.type', 'Monitoring method *')}
            </Label>
            <select id="uplink-type" className={selectCls} {...register('uplinkType')}>
              <option value="interface">
                {t('admin.uplinks.type.interfaceLong', 'Interface / VLAN / port (link state)')}
              </option>
              <option value="bgp">
                {t('admin.uplinks.type.bgpLong', 'BGP peer / session (established)')}
              </option>
              <option value="ping">
                {t('admin.uplinks.type.pingLong', 'Gateway ping (ICMP from the MikroTik)')}
              </option>
              <option value="netwatch">
                {t('admin.uplinks.type.netwatchLong', 'MikroTik Netwatch target')}
              </option>
            </select>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between gap-2">
              <Label htmlFor="uplink-target">
                {t('admin.uplinks.form.target', 'Target (interface / peer / IP) *')}
              </Label>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="text-primary h-7 px-2 text-xs"
                disabled={!routerId || candidates.isFetching}
                onClick={() =>
                  detectFor === routerId ? candidates.refetch() : setDetectFor(routerId)
                }
              >
                <Wand2
                  className={cn('mr-1 h-3.5 w-3.5', candidates.isFetching && 'animate-pulse')}
                />
                {t('admin.uplinks.form.detect', 'Detect from router')}
              </Button>
            </div>
            {options.length > 0 && (
              <select
                aria-label={t('admin.uplinks.form.detected', 'Detected targets')}
                className={cn(selectCls, 'border-primary/40 bg-primary/5 text-xs')}
                value=""
                onChange={(e) =>
                  e.target.value && setValue('target', e.target.value, { shouldValidate: true })
                }
              >
                <option value="">
                  {t('admin.uplinks.form.chooseDetected', '— or choose a detected target —')}
                </option>
                {options.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            )}
            {detectState && <p className="text-muted-foreground text-xs">{detectState}</p>}
            <Input
              id="uplink-target"
              className="font-mono text-sm"
              placeholder="sfp-sfpplus1, vlan20-FB, 103.x.x.x"
              {...register('target')}
            />
            {errors.target && (
              <p className="text-destructive text-xs">{te(errors.target.message ?? '')}</p>
            )}
          </div>

          <div className="border-border/60 grid gap-4 border-t pt-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="uplink-channels">
                {t('admin.uplinks.form.channels', 'Alert channels *')}
              </Label>
              <select id="uplink-channels" className={selectCls} {...register('alertChannels')}>
                <option value="both">{t('admin.uplinks.channel.both', 'WhatsApp & SMS')}</option>
                <option value="whatsapp">
                  {t('admin.uplinks.channel.whatsapp', 'WhatsApp only')}
                </option>
                <option value="sms">{t('admin.uplinks.channel.sms', 'SMS only')}</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="uplink-threshold">
                {t('admin.uplinks.form.sensitivity', 'Alert sensitivity')}
              </Label>
              <select
                id="uplink-threshold"
                className={selectCls}
                {...register('failThreshold', { valueAsNumber: true })}
              >
                <option value={1}>
                  {t('admin.uplinks.form.th1', 'Immediate (1 failed check)')}
                </option>
                <option value={2}>
                  {t('admin.uplinks.form.th2', 'Balanced (2 failed checks in a row)')}
                </option>
                <option value={3}>
                  {t('admin.uplinks.form.th3', 'Conservative (3 failed checks in a row)')}
                </option>
              </select>
            </div>
          </div>

          <div className="border-border/60 bg-muted/30 rounded-lg border p-3">
            <button
              type="button"
              className="flex w-full items-center justify-between text-left text-xs font-semibold"
              onClick={() => setShowRecipients((v) => !v)}
            >
              <span>{t('admin.uplinks.form.recipients', 'Custom alert recipient (optional)')}</span>
              <span className="text-primary">
                {showRecipients
                  ? t('admin.uplinks.form.hide', 'Hide')
                  : t('admin.uplinks.form.configure', 'Configure')}
              </span>
            </button>
            {showRecipients && (
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="uplink-mobile" className="text-xs">
                    {t('admin.uplinks.form.smsNumber', 'SMS number')}
                  </Label>
                  <Input
                    id="uplink-mobile"
                    inputMode="tel"
                    placeholder={
                      defaultMobile
                        ? t('admin.uplinks.form.defaultIs', 'Default: {n}', { n: defaultMobile })
                        : t('admin.uplinks.form.defaultNumber', 'Default: your account number')
                    }
                    {...register('notifyMobile')}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="uplink-wa" className="text-xs">
                    {t('admin.uplinks.form.waNumber', 'WhatsApp number')}
                  </Label>
                  <Input
                    id="uplink-wa"
                    inputMode="tel"
                    placeholder={
                      defaultWhatsapp
                        ? t('admin.uplinks.form.defaultIs', 'Default: {n}', { n: defaultWhatsapp })
                        : t('admin.uplinks.form.defaultNumber', 'Default: your account number')
                    }
                    {...register('notifyWhatsapp')}
                  />
                </div>
              </div>
            )}
          </div>

          <DialogFooter className="pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              {t('common.cancel', 'Cancel')}
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting
                ? t('admin.uplinks.form.saving', 'Saving...')
                : uplink
                  ? t('admin.uplinks.form.save', 'Save changes')
                  : t('admin.uplinks.form.add', 'Add & check')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
