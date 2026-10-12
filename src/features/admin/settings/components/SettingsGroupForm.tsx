'use client';

import { useMemo, useState } from 'react';
import { Save, Lock, RotateCcw } from 'lucide-react';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Can } from '@/components/shared/Can';
import { cn } from '@/lib/utils';
import type { SettingsField, SettingsGroup } from '../types';
import { useSaveSettingsGroup } from '../hooks/use-settings';

type Draft = Record<string, string | boolean>;

/**
 * Schema-driven form for one backend settings group. Only changed fields are
 * sent; a secret field left blank keeps the stored secret (the backend never
 * returns secrets, only whether one is set).
 */
export function SettingsGroupForm({ data }: { data: SettingsGroup }) {
  const save = useSaveSettingsGroup(data.group);
  const initial = useMemo(() => {
    const out: Draft = {};
    for (const section of data.sections) for (const f of section.fields) out[f.key] = f.value;
    return out;
  }, [data]);
  const [draft, setDraft] = useState<Draft>(initial);

  const changed = useMemo(() => {
    const out: Draft = {};
    for (const [key, value] of Object.entries(draft)) {
      if (value !== initial[key]) out[key] = value;
    }
    return out;
  }, [draft, initial]);
  const dirty = Object.keys(changed).length > 0;

  const set = (key: string, value: string | boolean) => setDraft((prev) => ({ ...prev, [key]: value }));

  const handleSave = () => {
    save.mutate(changed, {
      onSuccess: (next) => {
        const reset: Draft = {};
        for (const section of next.sections) for (const f of section.fields) reset[f.key] = f.value;
        setDraft(reset);
        toast.success(`${data.label} saved`);
      },
    });
  };

  return (
    <div className="space-y-4">
      <div className={cn('grid gap-4', data.sections.length > 1 && 'lg:grid-cols-2')}>
        {data.sections.map((section) => {
          const enabled = section.enableKey ? draft[section.enableKey] === true : null;
          return (
            <Card key={section.id} className="border-border/70 bg-card/60 backdrop-blur-md">
              <CardHeader className="border-b border-border/50 pb-3 flex flex-row items-center justify-between space-y-0">
                <CardTitle className="text-sm font-semibold text-foreground">{section.label}</CardTitle>
                {section.enableKey && (
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">{enabled ? 'Enabled' : 'Disabled'}</span>
                    <Switch checked={enabled === true} onCheckedChange={(v) => set(section.enableKey as string, v === true)} />
                  </div>
                )}
              </CardHeader>
              <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-4">
                {section.fields
                  .filter((f) => f.key !== section.enableKey)
                  .map((field) => (
                    <FieldInput key={field.key} field={field} value={draft[field.key]} onChange={(v) => set(field.key, v)} />
                  ))}
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-1">
        <span className="text-xs text-muted-foreground flex items-center gap-1.5">
          <Lock className="h-3.5 w-3.5" /> Secrets are write-only — leave a secret blank to keep the saved one.
        </span>
        <Can menu="software_settings" action="update">
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" disabled={!dirty || save.isPending} onClick={() => setDraft(initial)} className="text-xs">
              <RotateCcw className="mr-1.5 h-3.5 w-3.5" /> Discard
            </Button>
            <Button size="sm" disabled={!dirty || save.isPending} onClick={handleSave} className="text-xs">
              <Save className="mr-1.5 h-3.5 w-3.5" /> {save.isPending ? 'Saving…' : 'Save changes'}
            </Button>
          </div>
        </Can>
      </div>
    </div>
  );
}

function FieldInput({
  field,
  value,
  onChange,
}: {
  field: SettingsField;
  value: string | boolean | undefined;
  onChange: (value: string | boolean) => void;
}) {
  const id = `setting-${field.key}`;
  const text = typeof value === 'string' ? value : '';

  if (field.type === 'toggle') {
    return (
      <div className="flex items-center justify-between gap-3 rounded-lg border border-border/60 bg-background/60 px-3 py-2 sm:col-span-1">
        <Label htmlFor={id} className="text-xs font-medium text-foreground">
          {field.label}
        </Label>
        <Switch id={id} checked={value === true} onCheckedChange={(v) => onChange(v === true)} />
      </div>
    );
  }

  return (
    <div className={cn('space-y-1.5', field.type === 'textarea' && 'sm:col-span-2')}>
      <Label htmlFor={id} className="text-xs font-medium text-foreground flex items-center gap-1.5">
        {field.label}
        {field.type === 'secret' && field.isSet && (
          <Badge variant="outline" className="text-[10px] font-mono border-emerald-500/30 text-emerald-500">
            set {field.hint}
          </Badge>
        )}
      </Label>
      {field.type === 'select' ? (
        <select
          id={id}
          value={text}
          onChange={(e) => onChange(e.target.value)}
          className="h-9 w-full rounded-md border border-border/70 bg-background/80 px-2 text-xs"
        >
          {(field.options ?? []).map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      ) : field.type === 'textarea' ? (
        <Textarea id={id} value={text} onChange={(e) => onChange(e.target.value)} className="text-xs font-mono h-20" />
      ) : (
        <Input
          id={id}
          type={field.type === 'secret' ? 'password' : field.type === 'number' ? 'number' : 'text'}
          autoComplete={field.type === 'secret' ? 'new-password' : 'off'}
          placeholder={field.type === 'secret' && field.isSet ? 'Leave blank to keep the saved value' : undefined}
          value={text}
          onChange={(e) => onChange(e.target.value)}
          className="bg-background/80 border-border/70 text-xs font-mono"
        />
      )}
    </div>
  );
}
