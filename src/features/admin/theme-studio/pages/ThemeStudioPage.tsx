'use client';

import { useMemo, useState } from 'react';
import { PageHeader } from '@/features/shared/page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { Check, Palette, RotateCcw, Download, Upload, Copy, Info, Sliders, Eye, Layers } from 'lucide-react';
import { cn } from '@/lib/utils';
import { generateColorRamp } from '@/lib/theme/generate-color-ramp';
import { useTheme } from 'next-themes';
import { useThemeCustomizerStore } from '@/stores/theme-store';
import { PageSkeleton } from '@/components/shared/LoadingSkeleton';
import { EmptyState } from '@/components/shared/EmptyState';
import { Can } from '@/components/shared/Can';
import { errorMessage } from '@/lib/api/utils/error-handler';
import { useSoftwareSettings } from '@/features/admin/settings/hooks/use-settings';
import { useSaveTenantTheme, useTenantTheme, type TenantTheme } from '../hooks/use-theme-studio';
import { DEFAULT_PRESET, THEME_PRESETS, type ThemePreset } from '../presets';

const HEX = /^#[0-9a-fA-F]{6}$/;

function fromPreset(preset: ThemePreset): TenantTheme {
  return {
    presetId: preset.id,
    primary: preset.primary,
    secondary: preset.sidebar,
    radius: preset.radius,
    density: 'comfortable',
    fontScale: 'md',
    reduceMotion: false,
  };
}

export function ThemeStudioPage() {
  const { data, isLoading, isError, error, refetch, dataUpdatedAt } = useTenantTheme();

  if (isLoading) return <PageSkeleton variant="cards" rows={4} />;
  if (isError) {
    return (
      <EmptyState
        title="Failed to load your theme"
        description={errorMessage(error)}
        actionLabel="Retry"
        onAction={() => refetch()}
      />
    );
  }

  return <ThemeEditor key={dataUpdatedAt} saved={data ?? null} />;
}

function ThemeEditor({ saved }: { saved: TenantTheme | null }) {
  const { theme: colorMode, setTheme: setColorMode } = useTheme();
  const { tableLayout, setTableLayout } = useThemeCustomizerStore();
  const save = useSaveTenantTheme();
  const brand = useSoftwareSettings();
  const brandName = brand.data?.appName || 'Your ISP';

  const [draft, setDraft] = useState<TenantTheme>(saved ?? fromPreset(DEFAULT_PRESET));
  const set = <K extends keyof TenantTheme>(key: K, value: TenantTheme[K]) =>
    setDraft((prev) => ({ ...prev, [key]: value, ...(key === 'primary' || key === 'secondary' ? { presetId: null } : {}) }));

  const primaryRamp = useMemo(() => generateColorRamp(draft.primary), [draft.primary]);
  const secondaryRamp = useMemo(() => generateColorRamp(draft.secondary), [draft.secondary]);
  const dirty = JSON.stringify(draft) !== JSON.stringify(saved);
  const valid = HEX.test(draft.primary) && HEX.test(draft.secondary);

  const applyPreset = (preset: ThemePreset) => {
    setDraft((prev) => ({ ...prev, presetId: preset.id, primary: preset.primary, secondary: preset.sidebar, radius: preset.radius }));
  };

  const handleSave = () => {
    if (!valid) {
      toast.error('Colours must be #RRGGBB hex values');
      return;
    }
    save.mutate(draft, { onSuccess: () => toast.success('Theme saved for your whole team') });
  };

  const handleReset = () => {
    setDraft(fromPreset(DEFAULT_PRESET));
    toast.info('Default theme loaded — save to apply it');
  };

  const handleExport = () => {
    const blob = new Blob([JSON.stringify({ ...draft, exportedAt: new Date().toISOString() }, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'brand-theme.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleCopyJson = () => {
    void navigator.clipboard.writeText(JSON.stringify(draft, null, 2)).then(() => toast.success('Theme JSON copied to clipboard'));
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(String(event.target?.result ?? '')) as Partial<TenantTheme>;
        if (!HEX.test(String(parsed.primary)) || !HEX.test(String(parsed.secondary))) throw new Error('invalid');
        setDraft({
          presetId: typeof parsed.presetId === 'string' ? parsed.presetId : null,
          primary: String(parsed.primary),
          secondary: String(parsed.secondary),
          radius: Number.isFinite(Number(parsed.radius)) ? Math.min(24, Math.max(0, Number(parsed.radius))) : draft.radius,
          density: parsed.density === 'compact' ? 'compact' : 'comfortable',
          fontScale: parsed.fontScale === 'sm' || parsed.fontScale === 'lg' ? parsed.fontScale : 'md',
          reduceMotion: parsed.reduceMotion === true,
        });
        toast.success('Theme imported — save to apply it');
      } catch {
        toast.error('Invalid theme JSON file');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-6 w-full pb-12">
      <PageHeader
        title="Theme Studio"
        subtitle="Brand colours, radius, density and text size — saved for everyone on your team"
        breadcrumb={[{ label: 'Dashboard', url: '/admin/dashboard' }, { label: 'Theme Studio' }]}
        actions={
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleReset} className="text-xs">
              <RotateCcw className="mr-1.5 h-3.5 w-3.5" /> Reset Default
            </Button>
            <Can menu="software_settings" action="update">
              <Button size="sm" onClick={handleSave} disabled={!dirty || save.isPending} className="text-xs font-semibold">
                <Check className="mr-1.5 h-3.5 w-3.5" /> {save.isPending ? 'Saving…' : 'Save & apply'}
              </Button>
            </Can>
          </div>
        }
      />

      {!saved && (
        <div className="flex items-center gap-2 rounded-lg border border-border/60 bg-muted/30 px-3 py-2 text-xs text-muted-foreground">
          <Info className="h-4 w-4 text-primary shrink-0" />
          No custom theme saved yet — your team sees the default theme.
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-12">
        <Card className="lg:col-span-6 border-border/70 shadow-2xs">
          <CardHeader className="pb-4">
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <Palette className="h-4 w-4 text-primary" /> Brand Colours & Geometry
            </CardTitle>
            <CardDescription className="text-xs">Pick a primary and a secondary colour — a 10-step ramp is generated for preview.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            {(['primary', 'secondary'] as const).map((key) => {
              const ramp = key === 'primary' ? primaryRamp : secondaryRamp;
              return (
                <div key={key} className="space-y-2">
                  <label className="text-xs font-semibold text-foreground flex items-center justify-between">
                    <span>{key === 'primary' ? 'Primary colour (actions & highlights)' : 'Secondary colour (sidebar & deep panels)'}</span>
                    <span className="font-mono text-[11px] text-muted-foreground">{draft[key]}</span>
                  </label>
                  <div className="flex items-center gap-2.5">
                    <input
                      type="color"
                      value={HEX.test(draft[key]) ? draft[key] : '#000000'}
                      onChange={(e) => set(key, e.target.value)}
                      className="h-9 w-12 rounded-lg border border-border cursor-pointer bg-transparent p-0.5"
                      aria-label={`${key} colour picker`}
                    />
                    <Input value={draft[key]} onChange={(e) => set(key, e.target.value)} className="font-mono text-xs h-9 uppercase" />
                  </div>
                  <div className="flex h-3 w-full rounded-md overflow-hidden border border-border/60 mt-1">
                    {ramp.map((step, idx) => (
                      <div key={idx} className="flex-1" style={{ backgroundColor: step }} title={step} />
                    ))}
                  </div>
                </div>
              );
            })}

            <div className="space-y-2 pt-1">
              <label className="text-xs font-semibold text-foreground">Corner radius</label>
              <div className="grid grid-cols-4 gap-2">
                {[
                  { label: 'Sharp', val: 4 },
                  { label: 'Soft', val: 8 },
                  { label: 'Rounded', val: 12 },
                  { label: 'Pill', val: 20 },
                ].map((item) => (
                  <Button
                    key={item.val}
                    type="button"
                    variant={draft.radius === item.val ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => set('radius', item.val)}
                    className="text-xs h-9 font-medium"
                  >
                    <span className="inline-block h-2 w-2 border border-current mr-1.5" style={{ borderRadius: `${item.val}px` }} />
                    {item.label}
                  </Button>
                ))}
              </div>
            </div>

            <div className="flex items-start gap-2 p-2.5 rounded-lg bg-muted/40 border border-border/50 text-[11px] text-muted-foreground">
              <Info className="h-4 w-4 shrink-0 text-primary mt-0.5" />
              <span>Success, warning and error colours stay fixed — red always means overdue or trouble.</span>
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-6 border-border/70 shadow-2xs">
          <CardHeader className="pb-4">
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <Eye className="h-4 w-4 text-primary" /> Live Preview
            </CardTitle>
            <CardDescription className="text-xs">How buttons, badges and panels look with these colours.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-xl border border-border/70 overflow-hidden flex flex-col sm:flex-row min-h-[200px]" style={{ borderRadius: `${draft.radius}px` }}>
              <div className="w-full sm:w-44 p-3.5 text-white flex flex-col gap-3 shrink-0" style={{ backgroundColor: draft.secondary }}>
                <div className="flex items-center gap-2">
                  <div className="h-5 w-5 rounded bg-white/20 flex items-center justify-center font-bold text-[10px]">
                    {brandName.slice(0, 2).toUpperCase()}
                  </div>
                  <span className="font-bold text-xs tracking-tight truncate">{brandName}</span>
                </div>
                <div className="space-y-1 text-[11px]">
                  <div className="px-2 py-1 rounded font-semibold text-white" style={{ backgroundColor: draft.primary }}>
                    Dashboard
                  </div>
                  <div className="px-2 py-1 opacity-70">Customers</div>
                  <div className="px-2 py-1 opacity-70">Billing</div>
                  <div className="px-2 py-1 opacity-70">Routers</div>
                </div>
              </div>
              <div className="flex-1 bg-card p-4 space-y-4">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="px-3 py-1.5 text-xs font-bold text-white" style={{ backgroundColor: draft.primary, borderRadius: `${draft.radius}px` }}>
                    Primary Action
                  </span>
                  <span className="px-3 py-1.5 text-xs font-medium text-white" style={{ backgroundColor: draft.secondary, borderRadius: `${draft.radius}px` }}>
                    Secondary
                  </span>
                  <span className="px-3 py-1.5 text-xs font-medium border border-border/80" style={{ borderRadius: `${draft.radius}px` }}>
                    Outline
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-2 text-xs">
                  <span className="px-2 py-0.5 text-[11px] font-semibold text-white rounded-full" style={{ backgroundColor: draft.primary }}>
                    Brand Badge
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-2 py-0.5 text-[11px] font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 rounded-full">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> Online
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-2 py-0.5 text-[11px] font-semibold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 rounded-full">
                    <span className="h-1.5 w-1.5 rounded-full bg-amber-500" /> Payment Due
                  </span>
                </div>
                <div className="p-3 border border-border/60 bg-muted/20" style={{ borderRadius: `${draft.radius}px` }}>
                  <div className="text-[10px] uppercase font-bold text-muted-foreground">Stat card</div>
                  <div className="mt-1 h-2 w-24 rounded-full" style={{ backgroundColor: draft.primary }} />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-border/70 shadow-2xs">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-bold flex items-center gap-2">
            <Sliders className="h-4 w-4 text-primary" /> Display Preferences
          </CardTitle>
          <CardDescription className="text-xs">
            Density, text size and motion are saved with the team theme; colour mode and table layout are kept on this browser.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <div className="space-y-2">
              <label className="text-xs font-semibold text-foreground">UI density</label>
              <div className="grid grid-cols-2 gap-2">
                {(['comfortable', 'compact'] as const).map((d) => (
                  <Button key={d} type="button" size="sm" variant={draft.density === d ? 'default' : 'outline'} onClick={() => set('density', d)} className="text-xs capitalize">
                    {d}
                  </Button>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-semibold text-foreground">Text size</label>
              <div className="grid grid-cols-3 gap-2">
                {(['sm', 'md', 'lg'] as const).map((scale) => (
                  <Button key={scale} type="button" size="sm" variant={draft.fontScale === scale ? 'default' : 'outline'} onClick={() => set('fontScale', scale)} className="text-xs">
                    {scale === 'sm' ? 'Small' : scale === 'md' ? 'Default' : 'Large'}
                  </Button>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-semibold text-foreground">Default table layout (this browser)</label>
              <div className="grid grid-cols-2 gap-2">
                <Button type="button" size="sm" variant={tableLayout !== 'centered' ? 'default' : 'outline'} onClick={() => setTableLayout('full')} className="text-xs">
                  Full Width
                </Button>
                <Button type="button" size="sm" variant={tableLayout === 'centered' ? 'default' : 'outline'} onClick={() => setTableLayout('centered')} className="text-xs">
                  Centered
                </Button>
              </div>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 mt-6 pt-6 border-t border-border/60">
            <label className="flex items-center gap-3 p-3 rounded-xl border border-border/50 bg-card hover:border-primary/30 cursor-pointer transition-colors">
              <input
                type="checkbox"
                checked={colorMode === 'dark'}
                onChange={(e) => setColorMode(e.target.checked ? 'dark' : 'light')}
                className="h-4 w-4 rounded border-border text-primary cursor-pointer"
              />
              <div className="text-xs">
                <div className="font-semibold text-foreground">Dark mode</div>
                <div className="text-[10px] text-muted-foreground">This browser only</div>
              </div>
            </label>
            <label className="flex items-center gap-3 p-3 rounded-xl border border-border/50 bg-card hover:border-primary/30 cursor-pointer transition-colors">
              <input
                type="checkbox"
                checked={draft.reduceMotion}
                onChange={(e) => set('reduceMotion', e.target.checked)}
                className="h-4 w-4 rounded border-border text-primary cursor-pointer"
              />
              <div className="text-xs">
                <div className="font-semibold text-foreground">Reduce motion</div>
                <div className="text-[10px] text-muted-foreground">Disable page transitions</div>
              </div>
            </label>
          </div>
        </CardContent>
      </Card>

      <Card className="border-border/70 shadow-2xs">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-bold flex items-center gap-2">
            <Layers className="h-4 w-4 text-primary" /> Theme Templates
          </CardTitle>
          <CardDescription className="text-xs">Paired presets — pick one, then save to apply it.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {THEME_PRESETS.map((preset) => {
              const isSelected = draft.presetId === preset.id;
              const isSaved = saved?.presetId === preset.id;
              return (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => applyPreset(preset)}
                  className={cn(
                    'text-left rounded-xl border overflow-hidden transition hover:shadow-md group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
                    isSelected ? 'border-primary ring-2 ring-primary/30 bg-card' : 'border-border/80 hover:border-primary/40 bg-card/60',
                  )}
                >
                  <div className="h-16 flex relative overflow-hidden border-b border-border/60">
                    <div className="w-1/3" style={{ backgroundColor: preset.sidebar }} />
                    <div className="flex-1" style={{ backgroundColor: preset.primary }} />
                    <div className="w-1/6" style={{ backgroundColor: preset.accent }} />
                    {isSelected && (
                      <div className="absolute top-2 right-2 bg-primary text-primary-foreground rounded-full p-1 shadow-md">
                        <Check className="h-3 w-3" />
                      </div>
                    )}
                  </div>
                  <div className="p-3.5 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-sm text-foreground group-hover:text-primary transition-colors">{preset.name}</span>
                      {isSaved && (
                        <Badge variant="secondary" className="text-[10px] bg-primary/10 text-primary border-primary/20">
                          Saved
                        </Badge>
                      )}
                    </div>
                    <p className="text-[11px] text-muted-foreground leading-snug line-clamp-2">{preset.description}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <Card className="border-border/70 shadow-2xs">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-bold flex items-center gap-2">
            <Download className="h-4 w-4 text-primary" /> Export & Import
          </CardTitle>
          <CardDescription className="text-xs">Download the current draft as JSON or load one from another account.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap items-center gap-3">
            <Button size="sm" onClick={handleExport} className="text-xs">
              <Download className="mr-1.5 h-3.5 w-3.5" /> Export JSON
            </Button>
            <label className="cursor-pointer">
              <input type="file" accept="application/json,.json" onChange={handleImportFile} className="hidden" />
              <Button size="sm" variant="outline" type="button" className="text-xs pointer-events-none">
                <Upload className="mr-1.5 h-3.5 w-3.5" /> Import JSON
              </Button>
            </label>
            <Button size="sm" variant="outline" onClick={handleCopyJson} className="text-xs">
              <Copy className="mr-1.5 h-3.5 w-3.5" /> Copy JSON
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
