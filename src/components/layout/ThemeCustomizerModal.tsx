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
import { themePresetsData } from '@/data/admin/theme-studio.data';
import { useThemeCustomizerStore } from '@/stores/theme-store';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface ThemeCustomizerModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ThemeCustomizerModal({ open, onOpenChange }: ThemeCustomizerModalProps) {
  const { theme, setTheme } = useTheme();
  const {
    presetId,
    radius,
    density,
    setPreset,
    setRadius,
    setDensity,
    resetToDefault,
    applyDomStyles,
  } = useThemeCustomizerStore();

  // Apply saved styles on mount
  useEffect(() => {
    applyDomStyles();
  }, [applyDomStyles]);

  const handleSelectPreset = (id: string, name: string) => {
    setPreset(id);
    toast.success(`Preset "${name}" applied`);
  };

  const handleSelectRadius = (r: number, label: string) => {
    setRadius(r);
    toast.success(`Corner radius updated to ${label}`);
  };

  const handleReset = () => {
    resetToDefault();
    setTheme('system');
    toast.info('Theme reset to ISP Pay BD default');
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
                  Theme & appearance
                </DialogTitle>
                <DialogDescription className="text-xs">
                  Color scheme, mode, radius, and density
                </DialogDescription>
              </div>
            </div>

            <Button
              size="sm"
              variant="ghost"
              onClick={handleReset}
              className="h-8 text-xs text-muted-foreground hover:text-foreground"
              title="Reset theme to defaults"
            >
              <RotateCcw className="mr-1 h-3 w-3" /> Reset
            </Button>
          </div>
        </DialogHeader>

        <div className="space-y-5 pt-2 text-xs">
          {/* Section 1: Color Scheme Mode */}
          <div className="space-y-2">
            <div className="font-medium text-foreground tracking-wide text-[11px] flex items-center justify-between">
              <span>Appearance</span>
              <span className="text-muted-foreground text-xs font-normal capitalize">
                {theme}
              </span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setTheme('light')}
                className={cn(
                  'flex items-center justify-center gap-2 p-2.5 rounded-xl border transition-all text-xs font-semibold',
                  theme === 'light'
                    ? 'border-primary bg-primary/10 text-primary ring-2 ring-primary/20'
                    : 'border-border/70 hover:bg-muted/40 text-muted-foreground'
                )}
              >
                <Sun className="h-4 w-4 text-amber-500" />
                <span>Light</span>
              </button>
              <button
                type="button"
                onClick={() => setTheme('system')}
                className={cn(
                  'flex items-center justify-center gap-2 p-2.5 rounded-xl border transition-all text-xs font-semibold',
                  theme === 'dark'
                    ? 'border-primary bg-primary/10 text-primary ring-2 ring-primary/20'
                    : 'border-border/70 hover:bg-muted/40 text-muted-foreground'
                )}
              >
                <Moon className="h-4 w-4 text-blue-400" />
                <span>Dark</span>
              </button>
              <button
                type="button"
                onClick={() => setTheme('system')}
                className={cn(
                  'flex items-center justify-center gap-2 p-2.5 rounded-xl border transition-all text-xs font-semibold',
                  theme === 'system'
                    ? 'border-primary bg-primary/10 text-primary ring-2 ring-primary/20'
                    : 'border-border/70 hover:bg-muted/40 text-muted-foreground'
                )}
              >
                <Laptop className="h-4 w-4 text-emerald-500" />
                <span>System</span>
              </button>
            </div>
          </div>

          {/* Section 2: Preset Brand Color Palette */}
          <div className="space-y-2">
            <div className="font-medium text-foreground tracking-wide text-[11px]">
              Brand Color Palette
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
                      'p-2.5 rounded-xl border text-left transition-all relative flex flex-col justify-between group',
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
                    <div className="text-[10px] text-muted-foreground mt-1 truncate">
                      {preset.name}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section 3: Corner Radius Geometry */}
          <div className="space-y-2">
            <div className="font-medium text-foreground tracking-wide text-[11px] flex items-center justify-between">
              <span>Component Corner Radius</span>
              <span className="text-muted-foreground font-normal normal-case font-mono">{radius}px</span>
            </div>
            <div className="grid grid-cols-4 gap-2">
              {[
                { r: 4, label: 'Sharp 4px' },
                { r: 8, label: 'Soft 8px' },
                { r: 12, label: 'Default 12px' },
                { r: 20, label: 'Pill 20px' },
              ].map((item) => (
                <button
                  key={item.r}
                  type="button"
                  onClick={() => handleSelectRadius(item.r, item.label)}
                  className={cn(
                    'p-2 rounded-xl border text-center transition-all text-xs font-semibold',
                    radius === item.r
                      ? 'border-primary bg-primary/10 text-primary ring-1 ring-primary/20'
                      : 'border-border/70 hover:bg-muted/40 text-muted-foreground'
                  )}
                >
                  {item.label.split(' ')[0]}
                </button>
              ))}
            </div>
          </div>

          {/* Section 4: UI Density */}
          <div className="space-y-2">
            <div className="font-medium text-foreground tracking-wide text-[11px]">
              Interface Density
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setDensity('comfortable')}
                className={cn(
                  'p-2 rounded-xl border text-center transition-all text-xs font-semibold',
                  density === 'comfortable'
                    ? 'border-primary bg-primary/10 text-primary ring-1 ring-primary/20'
                    : 'border-border/70 hover:bg-muted/40 text-muted-foreground'
                )}
              >
                Comfortable (Default)
              </button>
              <button
                type="button"
                onClick={() => setDensity('compact')}
                className={cn(
                  'p-2 rounded-xl border text-center transition-all text-xs font-semibold',
                  density === 'compact'
                    ? 'border-primary bg-primary/10 text-primary ring-1 ring-primary/20'
                    : 'border-border/70 hover:bg-muted/40 text-muted-foreground'
                )}
              >
                Compact (High Information)
              </button>
            </div>
          </div>

          {/* Live Preview Strip */}
          <div className="p-3 rounded-xl border border-border/60 bg-muted/20 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Badge variant="default" className="text-[10px]">
                Active Primary
              </Badge>
              <span className="text-muted-foreground text-[11px]">Preview components reflect selections live</span>
            </div>
            <Button size="sm" className="h-7 text-xs font-bold">
              Button
            </Button>
          </div>

          {/* Footer Action to Full Studio */}
          <div className="pt-2 border-t border-border/60 flex items-center justify-between">
            <Link
              href="/admin/theme-studio"
              onClick={() => onOpenChange(false)}
              className="text-xs text-primary hover:underline font-semibold flex items-center gap-1.5"
            >
              <ExternalLink className="h-3.5 w-3.5" /> Open Full Theme Studio & Ramps
            </Link>

            <Button size="sm" onClick={() => onOpenChange(false)} className="text-xs font-semibold px-4">
              Done
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
