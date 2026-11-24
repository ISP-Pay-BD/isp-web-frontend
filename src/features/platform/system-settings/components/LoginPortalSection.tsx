'use client';

import { useEffect } from 'react';
import { Controller, useFieldArray, useForm } from 'react-hook-form';
import { Plus, Save, Trash2 } from 'lucide-react';
import { handleApiError } from '@/lib/api/utils/error-handler';
import { PageSkeleton } from '@/components/shared/LoadingSkeleton';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { LoadErrorState } from '@/features/platform/shared/components/LoadErrorState';
import { useTranslations } from '@/i18n/locale-context';
import type { SettingValues } from '../api/system-settings.api';
import { useSaveSettingsSection, useSettingsSection } from '../hooks/use-system-settings';

/** Mirrors PHP `sanitizePortalConfigInput` (limits included). */
interface PortalConfig {
  artwork_style: 'globe' | 'topology' | 'minimal';
  headline: string;
  highlight_word: string;
  subtitle: string;
  features: { icon: string; text: string }[];
  trust_items: { value: string; label: string }[];
  login_heading: string;
  login_subheading: string;
}

const MAX_FEATURES = 5;
const MAX_TRUST = 4;

function parse(values: SettingValues): PortalConfig {
  let src: Record<string, unknown> = values;
  try {
    if (values.portal_login_config)
      src = JSON.parse(values.portal_login_config) as Record<string, unknown>;
  } catch {
    // stored value is not JSON — fall back to flat keys
  }
  const s = (k: string) => (typeof src[k] === 'string' ? (src[k] as string) : '');
  const list = <T,>(k: string): T[] => {
    const v = src[k];
    if (Array.isArray(v)) return v as T[];
    if (typeof v === 'string') {
      try {
        const parsed: unknown = JSON.parse(v);
        return Array.isArray(parsed) ? (parsed as T[]) : [];
      } catch {
        return [];
      }
    }
    return [];
  };
  const art = s('artwork_style');
  return {
    artwork_style: art === 'topology' || art === 'minimal' ? art : 'globe',
    headline: s('headline'),
    highlight_word: s('highlight_word'),
    subtitle: s('subtitle'),
    features: list<{ icon: string; text: string }>('features').slice(0, MAX_FEATURES),
    trust_items: list<{ value: string; label: string }>('trust_items').slice(0, MAX_TRUST),
    login_heading: s('login_heading'),
    login_subheading: s('login_subheading'),
  };
}

export function LoginPortalSection() {
  const t = useTranslations();
  const { data, isLoading, error, refetch } = useSettingsSection('login_portal');
  const save = useSaveSettingsSection('login_portal');
  const form = useForm<PortalConfig>();
  const features = useFieldArray({ control: form.control, name: 'features' });
  const trust = useFieldArray({ control: form.control, name: 'trust_items' });

  useEffect(() => {
    if (data) form.reset(parse(data));
  }, [data, form]);

  if (isLoading) return <PageSkeleton variant="form" rows={4} />;
  if (error || !data) {
    return (
      <LoadErrorState
        error={error}
        title={t('platform.systemSettings.loadFailed', 'Failed to load these settings')}
        onRetry={() => refetch()}
      />
    );
  }

  const onSubmit = form.handleSubmit((v) => {
    const config: PortalConfig = {
      ...v,
      features: v.features
        .filter((f) => f.text.trim())
        .map((f) => ({ icon: f.icon || 'fa-check', text: f.text.trim() })),
      trust_items: v.trust_items.filter((i) => i.value.trim() || i.label.trim()),
    };
    save.mutate({ config }, { onError: (err) => handleApiError(err) });
  });

  const text = (name: keyof PortalConfig, label: string, max: number, area = false) => (
    <div className={area ? 'space-y-2 sm:col-span-2' : 'space-y-2'}>
      <Label htmlFor={`lp-${name}`}>{label}</Label>
      {area ? (
        <Textarea id={`lp-${name}`} rows={3} maxLength={max} {...form.register(name)} />
      ) : (
        <Input id={`lp-${name}`} maxLength={max} {...form.register(name)} />
      )}
    </div>
  );

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <Card className="border-border/60">
        <CardHeader>
          <CardTitle className="text-base">
            {t('platform.systemSettings.login.title', 'Platform login page')}
          </CardTitle>
          <p className="text-muted-foreground text-xs">
            {t(
              'platform.systemSettings.login.hint',
              'Default copy for every tenant subdomain that uses the default login layout.',
            )}
          </p>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="lp-artwork">
              {t('platform.systemSettings.login.artwork', 'Artwork')}
            </Label>
            <Controller
              name="artwork_style"
              control={form.control}
              render={({ field }) => {
                const items = {
                  globe: t('platform.systemSettings.login.artGlobe', 'Globe'),
                  topology: t('platform.systemSettings.login.artTopology', 'Network topology'),
                  minimal: t('platform.systemSettings.login.artMinimal', 'Minimal'),
                };
                return (
                  <Select
                    value={field.value ?? ''}
                    items={items}
                    onValueChange={(v) => field.onChange(v)}
                  >
                    <SelectTrigger id="lp-artwork" className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(items).map(([k, label]) => (
                        <SelectItem key={k} value={k}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                );
              }}
            />
          </div>
          {text(
            'highlight_word',
            t('platform.systemSettings.login.highlight', 'Highlighted word'),
            60,
          )}
          {text('headline', t('platform.systemSettings.login.headline', 'Headline'), 120, true)}
          {text('subtitle', t('platform.systemSettings.login.subtitle', 'Subtitle'), 320, true)}
          {text('login_heading', t('platform.systemSettings.login.heading', 'Form heading'), 80)}
          {text(
            'login_subheading',
            t('platform.systemSettings.login.subheading', 'Form sub-heading'),
            140,
          )}
        </CardContent>
      </Card>

      <Card className="border-border/60">
        <CardHeader>
          <CardTitle className="text-base">
            {t('platform.systemSettings.login.features', 'Feature list (max {n})', {
              n: MAX_FEATURES,
            })}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {features.fields.length === 0 ? (
            <p className="text-muted-foreground text-xs">
              {t(
                'platform.systemSettings.login.noFeatures',
                'No features — the default list is shown.',
              )}
            </p>
          ) : null}
          {features.fields.map((f, i) => (
            <div key={f.id} className="flex gap-2">
              <Input
                aria-label={t('platform.systemSettings.login.featureText', 'Feature {n}', {
                  n: i + 1,
                })}
                maxLength={140}
                {...form.register(`features.${i}.text`)}
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => features.remove(i)}
                aria-label={t('platform.systemSettings.login.remove', 'Remove')}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={features.fields.length >= MAX_FEATURES}
            onClick={() => features.append({ icon: 'fa-check', text: '' })}
          >
            <Plus className="mr-1 h-4 w-4" />
            {t('platform.systemSettings.login.addFeature', 'Add feature')}
          </Button>
        </CardContent>
      </Card>

      <Card className="border-border/60">
        <CardHeader>
          <CardTitle className="text-base">
            {t('platform.systemSettings.login.trust', 'Trust figures (max {n})', { n: MAX_TRUST })}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {trust.fields.map((f, i) => (
            <div key={f.id} className="grid grid-cols-[1fr_2fr_auto] gap-2">
              <Input
                aria-label={t('platform.systemSettings.login.trustValue', 'Value')}
                placeholder="500+"
                maxLength={40}
                {...form.register(`trust_items.${i}.value`)}
              />
              <Input
                aria-label={t('platform.systemSettings.login.trustLabel', 'Label')}
                placeholder={t('platform.systemSettings.login.trustLabel', 'Label')}
                maxLength={40}
                {...form.register(`trust_items.${i}.label`)}
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => trust.remove(i)}
                aria-label={t('platform.systemSettings.login.remove', 'Remove')}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={trust.fields.length >= MAX_TRUST}
            onClick={() => trust.append({ value: '', label: '' })}
          >
            <Plus className="mr-1 h-4 w-4" />
            {t('platform.systemSettings.login.addTrust', 'Add figure')}
          </Button>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button type="submit" disabled={save.isPending || !form.formState.isDirty}>
          <Save className="mr-1.5 h-4 w-4" />
          {save.isPending
            ? t('platform.systemSettings.saving', 'Saving…')
            : t('platform.systemSettings.save', 'Save changes')}
        </Button>
      </div>
    </form>
  );
}
