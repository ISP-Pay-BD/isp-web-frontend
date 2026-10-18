'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { useTheme } from 'next-themes';
import {
  Palette,
  Sun,
  Moon,
  Laptop,
  Check,
  RotateCcw,
  ExternalLink,
  AlignJustify,
  AlignCenter,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toggleThemeWithTransition } from './ThemeToggle';
import { THEME_PRESETS as themePresetsData } from '@/features/admin/theme-studio/presets';
import { useThemeCustomizerStore } from '@/stores/theme-store';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { useTranslations } from '@/i18n/locale-context';

interface ThemeCustomizerModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ThemeCustomizerModal({ open, onOpenChange }: ThemeCustomizerModalProps) {
  const t = useTranslations();
  const { theme, setTheme } = useTheme();
  const {
    presetId,
    radius,
    density,
    tableLayout,
    setPreset,
    setRadius,
    setDensity,
    setTableLayout,
    resetToDefault,
    applyDomStyles,
  } = useThemeCustomizerStore();

  // Apply saved styles on mount
  useEffect(() => {
    applyDomStyles();
  }, [applyDomStyles]);

  const handleSelectPreset = (id: string, name: string) => {
    setPreset(id);
    toast.success(t('common.theme.presetApplied', 'Preset "{name}" applied', { name }));
  };

  const handleSelectRadius = (r: number, label: string) => {
    setRadius(r);
    toast.success(t('common.theme.radiusUpdated', 'Corner radius updated to {label}', { label }));
  };

  const handleReset = () => {
    resetToDefault();
    setTheme('system');
    toast.info(t('common.theme.resetDone', 'Theme reset to ISP Pay BD default'));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg p-6 border-border/80 shadow-[var(--shadow-md)] backdrop-blur-md">
        <DialogHeader className="border-b border-border/60 pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="h-9 w-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center border border-primary/20">
                <Palette className="h-4 w-4" />
              </div>
              <div>
                <DialogTitle className="flex items-center gap-1.5 text-base font-semibold">
                  {t('common.theme.title', 'Theme & appearance')}
                </DialogTitle>
                <DialogDescription className="text-xs">
                  {t('common.theme.description', 'Color scheme, mode, radius, and density')}
                </DialogDescription>
              </div>
            </div>

            <Button
              size="sm"
              variant="ghost"
              onClick={handleReset}
              className="h-8 text-xs text-muted-foreground hover:text-foreground"
              title={t('common.theme.resetTitle', 'Reset theme to defaults')}
            >
              <RotateCcw className="mr-1 h-3 w-3" /> {t('common.theme.reset', 'Reset')}
            </Button>
          </div>
        </DialogHeader>

        <div className="space-y-5 pt-2 text-xs">
          {/* Section 1: Color Scheme Mode */}
          <div className="space-y-2">
            <div className="font-medium text-foreground tracking-wide text-xs flex items-center justify-between">
              <span>{t('common.theme.appearance', 'Appearance')}</span>
              <span className="text-muted-foreground text-xs font-normal capitalize">
                {theme ? t(`common.theme.${theme}`, theme) : ''}
              </span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={(e) => toggleThemeWithTransition('light', setTheme, e)}
                className={cn(
                  'flex items-center justify-center gap-2 p-2.5 rounded-xl border transition text-xs font-semibold',
                  theme === 'light'
                    ? 'border-primary bg-primary/10 text-primary ring-2 ring-primary/20'
                    : 'border-border/70 hover:bg-muted/40 text-muted-foreground'
                )}
              >
                <Sun className="h-4 w-4 text-amber-500" />
                <span>{t('common.theme.light', 'Light')}</span>
              </button>
              <button
                type="button"
                onClick={(e) => toggleThemeWithTransition('dark', setTheme, e)}
                className={cn(
                  'flex items-center justify-center gap-2 p-2.5 rounded-xl border transition text-xs font-semibold',
                  theme === 'dark'
                    ? 'border-primary bg-primary/10 text-primary ring-2 ring-primary/20'
                    : 'border-border/70 hover:bg-muted/40 text-muted-foreground'
                )}
              >
                <Moon className="h-4 w-4 text-blue-400" />
                <span>{t('common.theme.dark', 'Dark')}</span>
              </button>
              <button
                type="button"
                onClick={() => setTheme('system')}
                className={cn(
                  'flex items-center justify-center gap-2 p-2.5 rounded-xl border transition text-xs font-semibold',
                  theme === 'system'
                    ? 'border-primary bg-primary/10 text-primary ring-2 ring-primary/20'
                    : 'border-border/70 hover:bg-muted/40 text-muted-foreground'
                )}
              >
                <Laptop className="h-4 w-4 text-emerald-500" />
                <span>{t('common.theme.system', 'System')}</span>
              </button>
            </div>
          </div>

          {/* Section 2: Preset Brand Color Palette */}
          <div className="space-y-2">
            <div className="font-medium text-foreground tracking-wide text-xs">
              {t('common.theme.palette', 'Brand Color Palette')}
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {themePresetsData.map((preset) => {
                const isSelected = presetId === preset.id;
                return (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => handleSelectPreset(preset.id, preset.name)}
                    className={cn(
                      'p-2.5 rounded-xl border text-left transition relative flex flex-col justify-between group',
                      isSelected
                        ? 'border-primary bg-primary/10 ring-2 ring-primary/20'
                        : 'border-border/70 hover:border-primary/40 bg-card'
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span
                          className="h-3 w-3 rounded-full border border-black/20 shrink-0"
                          style={{ backgroundColor: preset.primary }}
                        />
                        <span className="font-bold text-xs truncate text-foreground">{preset.name.split(' ')[0]}</span>
                      </div>
                      {isSelected && <Check className="h-3.5 w-3.5 text-primary shrink-0" />}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1 truncate">
                      {preset.name}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section 3: Corner Radius Geometry */}
          <div className="space-y-2">
            <div className="font-medium text-foreground tracking-wide text-xs flex items-center justify-between">
              <span>{t('common.theme.radius', 'Component Corner Radius')}</span>
              <span className="text-muted-foreground font-normal normal-case font-mono">{radius}px</span>
            </div>
            <div className="grid grid-cols-4 gap-2">
              {[
                { r: 4, label: t('common.theme.radiusSharp', 'Sharp') },
                { r: 8, label: t('common.theme.radiusSoft', 'Soft') },
                { r: 12, label: t('common.theme.radiusDefault', 'Default') },
                { r: 20, label: t('common.theme.radiusPill', 'Pill') },
              ].map((item) => (
                <button
                  key={item.r}
                  type="button"
                  onClick={() => handleSelectRadius(item.r, `${item.label} ${item.r}px`)}
                  className={cn(
                    'p-2 rounded-xl border text-center transition text-xs font-semibold',
                    radius === item.r
                      ? 'border-primary bg-primary/10 text-primary ring-1 ring-primary/20'
                      : 'border-border/70 hover:bg-muted/40 text-muted-foreground'
                  )}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* Section 4: UI Density */}
          <div className="space-y-2">
            <div className="font-medium text-foreground tracking-wide text-xs">
              {t('common.theme.density', 'Interface Density')}
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setDensity('comfortable')}
                className={cn(
                  'p-2 rounded-xl border text-center transition text-xs font-semibold',
                  density === 'comfortable'
                    ? 'border-primary bg-primary/10 text-primary ring-1 ring-primary/20'
                    : 'border-border/70 hover:bg-muted/40 text-muted-foreground'
                )}
              >
                {t('common.theme.densityComfortable', 'Comfortable (Default)')}
              </button>
              <button
                type="button"
                onClick={() => setDensity('compact')}
                className={cn(
                  'p-2 rounded-xl border text-center transition text-xs font-semibold',
                  density === 'compact'
                    ? 'border-primary bg-primary/10 text-primary ring-1 ring-primary/20'
                    : 'border-border/70 hover:bg-muted/40 text-muted-foreground'
                )}
              >
                {t('common.theme.densityCompact', 'Compact (High Information)')}
              </button>
            </div>
          </div>

          {/* Section 5: Table & Data Layout (Global Full vs Centered default) */}
          <div className="space-y-2">
            <div className="font-medium text-foreground tracking-wide text-xs flex items-center justify-between">
              <span>{t('common.theme.tableLayout', 'Table & Data Presentation Layout')}</span>
              <span className="text-muted-foreground font-normal normal-case capitalize">
                {tableLayout === 'centered'
                  ? t('common.theme.tableCenteredBoxed', 'Centered Boxed')
                  : t('common.theme.tableFullDefault', 'Full Width (Default)')}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => {
                  setTableLayout('full');
                  toast.success(t('common.theme.tableFullSet', 'Default table presentation set to Full Width'));
                }}
                className={cn(
                  'flex items-center justify-center gap-2 p-2.5 rounded-xl border text-center transition text-xs font-semibold',
                  tableLayout === 'full' || !tableLayout
                    ? 'border-primary bg-primary/10 text-primary ring-1 ring-primary/20'
                    : 'border-border/70 hover:bg-muted/40 text-muted-foreground'
                )}
              >
                <AlignJustify className="h-4 w-4 shrink-0" />
                <span>{t('common.theme.tableFullDefault', 'Full Width (Default)')}</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setTableLayout('centered');
                  toast.success(t('common.theme.tableCenteredSet', 'Default table presentation set to Centered'));
                }}
                className={cn(
                  'flex items-center justify-center gap-2 p-2.5 rounded-xl border text-center transition text-xs font-semibold',
                  tableLayout === 'centered'
                    ? 'border-primary bg-primary/10 text-primary ring-1 ring-primary/20'
                    : 'border-border/70 hover:bg-muted/40 text-muted-foreground'
                )}
              >
                <AlignCenter className="h-4 w-4 shrink-0" />
                <span>{t('common.theme.tableCentered', 'Centered Container')}</span>
              </button>
            </div>
          </div>

          {/* Live Preview Strip */}
          <div className="p-3 rounded-xl border border-border/60 bg-muted/20 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Badge variant="default" className="text-xs">
                {t('common.theme.activePrimary', 'Active Primary')}
              </Badge>
              <span className="text-muted-foreground text-xs">{t('common.theme.previewHint', 'Preview components reflect selections live')}</span>
            </div>
            <Button size="sm" className="h-7 text-xs font-bold">
              {t('common.theme.previewButton', 'Button')}
            </Button>
          </div>

          {/* Footer Action to Full Studio */}
          <div className="pt-2 border-t border-border/60 flex items-center justify-between">
            <Link
              href="/admin/theme-studio"
              onClick={() => onOpenChange(false)}
              className="text-xs text-primary hover:underline font-semibold flex items-center gap-1.5"
            >
              <ExternalLink className="h-3.5 w-3.5" /> {t('common.theme.openStudio', 'Open Full Theme Studio & Ramps')}
            </Link>

            <Button size="sm" onClick={() => onOpenChange(false)} className="text-xs font-semibold px-4">
              {t('common.theme.done', 'Done')}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
