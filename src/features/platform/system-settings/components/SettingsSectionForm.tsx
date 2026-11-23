'use client';

import { useEffect, type ReactNode } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Save } from 'lucide-react';
import { handleApiError } from '@/lib/api/utils/error-handler';
import { PageSkeleton } from '@/components/shared/LoadingSkeleton';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
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
import { cn } from '@/lib/utils';
import type { SettingValues, SettingsSection } from '../api/system-settings.api';
import { useSaveSettingsSection, useSettingsSection } from '../hooks/use-system-settings';

export interface FieldDef {
  key: string;
  label: string;
  type?: 'text' | 'number' | 'url' | 'textarea' | 'select' | 'secret';
  options?: Record<string, string>;
  hint?: string;
  placeholder?: string;
  /** Used when the server has no value yet (PHP `getSetting(key, default)`). */
  fallback?: string;
  wide?: boolean;
  required?: boolean;
}

export interface FieldGroup {
  title: string;
  description?: string;
  fields: FieldDef[];
}

interface Props {
  section: SettingsSection;
  groups: FieldGroup[];
  /** Extra controls rendered under the form (e.g. the APK sync button). */
  footer?: (values: SettingValues) => ReactNode;
}

function initial(groups: FieldGroup[], data: SettingValues): SettingValues {
  const out: SettingValues = {};
  for (const f of groups.flatMap((g) => g.fields)) {
    // Secrets are write-only: never put the stored value back into the page.
    out[f.key] = f.type === 'secret' ? '' : (data[f.key] ?? '') || (f.fallback ?? '');
  }
  return out;
}

export function SettingsSectionForm({ section, groups, footer }: Props) {
  const t = useTranslations();
  const { data, isLoading, error, refetch } = useSettingsSection(section);
  const save = useSaveSettingsSection(section);
  const form = useForm<SettingValues>();

  useEffect(() => {
    if (data) form.reset(initial(groups, data));
  }, [data, form, groups]);

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

  const fields = groups.flatMap((g) => g.fields);
  const onSubmit = form.handleSubmit((values) => {
    const dirty = form.formState.dirtyFields;
    const payload: Record<string, string> = {};
    for (const f of fields) {
      if (!dirty[f.key]) continue;
      const v = (values[f.key] ?? '').trim();
      if (f.type === 'secret' && v === '') continue;
      payload[f.key] = v;
    }
    if (Object.keys(payload).length === 0) return;
    save.mutate(payload, { onError: (err) => handleApiError(err, form.setError) });
  });

  // The API never returns a secret, only `has_<key>`.
  const secretSet = (key: string) => data[`has_${key}`] === 'true';

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      {groups.map((g) => (
        <Card key={g.title} className="border-border/60">
          <CardHeader>
            <CardTitle className="text-base">{g.title}</CardTitle>
            {g.description ? (
              <p className="text-muted-foreground text-xs">{g.description}</p>
            ) : null}
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            {g.fields.map((f) => {
              const id = `${section}-${f.key}`;
              const err = form.formState.errors[f.key]?.message;
              const rules = f.required
                ? { required: t('platform.systemSettings.required', 'This field is required') }
                : undefined;
              return (
                <div
                  key={f.key}
                  className={cn('space-y-2', (f.wide || f.type === 'textarea') && 'sm:col-span-2')}
                >
                  <Label htmlFor={id}>{f.label}</Label>
                  {f.type === 'textarea' ? (
                    <Textarea
                      id={id}
                      rows={4}
                      placeholder={f.placeholder}
                      {...form.register(f.key, rules)}
                    />
                  ) : f.type === 'select' && f.options ? (
                    <Controller
                      name={f.key}
                      control={form.control}
                      render={({ field }) => (
                        <Select
                          value={field.value}
                          items={f.options}
                          onValueChange={(v) => field.onChange(v)}
                        >
                          <SelectTrigger id={id} className="w-full">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {Object.entries(f.options ?? {}).map(([value, label]) => (
                              <SelectItem key={value} value={value}>
                                {label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    />
                  ) : (
                    <Input
                      id={id}
                      type={
                        f.type === 'secret'
                          ? 'password'
                          : f.type === 'number'
                            ? 'number'
                            : f.type === 'url'
                              ? 'url'
                              : 'text'
                      }
                      autoComplete={f.type === 'secret' ? 'new-password' : undefined}
                      placeholder={
                        f.type === 'secret'
                          ? secretSet(f.key)
                            ? t('platform.systemSettings.secretKeep', 'Saved — leave blank to keep')
                            : t('platform.systemSettings.secretEmpty', 'Not set')
                          : f.placeholder
                      }
                      className={
                        f.type === 'url' || f.type === 'secret' ? 'font-mono text-xs' : undefined
                      }
                      {...form.register(f.key, rules)}
                    />
                  )}
                  {f.hint ? <p className="text-muted-foreground text-xs">{f.hint}</p> : null}
                  {err ? <p className="text-destructive text-xs">{err}</p> : null}
                </div>
              );
            })}
          </CardContent>
        </Card>
      ))}

      {footer ? footer(data) : null}

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
