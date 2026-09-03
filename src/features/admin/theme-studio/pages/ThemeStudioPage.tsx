'use client';

import { useState, useMemo } from 'react';
import { PageHeader } from '@/features/shared/page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import {
  Check,
  Palette,
  RotateCcw,
  Download,
  Upload,
  Copy,
  Info,
  Sparkles,
  Sliders,
  Eye,
  Layers,
  ArrowRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { themePresetsData, generateColorRamp, type ThemePreset } from '@/data/admin/theme-studio.data';
import { useTheme } from 'next-themes';

export function ThemeStudioPage() {
  const { theme, setTheme } = useTheme();

  // Selected preset or custom colors
  const [selectedPresetId, setSelectedPresetId] = useState<string>('isp_default');
  const [primaryColor, setPrimaryColor] = useState<string>('#f75803');
  const [secondaryColor, setSecondaryColor] = useState<string>('#1a0b38');
  const [radius, setRadius] = useState<number>(12);

  // Display Preferences
  const [uiDensity, setUiDensity] = useState<'comfortable' | 'compact'>('comfortable');
  const [tableDensity, setTableDensity] = useState<'comfortable' | 'compact'>('comfortable');
  const [fontScale, setFontScale] = useState<'sm' | 'md' | 'lg'>('md');
  const [colorfulCards, setColorfulCards] = useState<boolean>(true);
  const [compactSidebar, setCompactSidebar] = useState<boolean>(false);
  const [reduceMotion, setReduceMotion] = useState<boolean>(false);

  // Ramps
  const primaryRamp = useMemo(() => generateColorRamp(primaryColor), [primaryColor]);
  const secondaryRamp = useMemo(() => generateColorRamp(secondaryColor), [secondaryColor]);

  // Apply a preset
  const applyPreset = (preset: ThemePreset) => {
    setSelectedPresetId(preset.id);
    setPrimaryColor(preset.primary);
    setSecondaryColor(preset.sidebar);
    setRadius(preset.radius);
    toast.success(`Preset "${preset.name}" applied`);
  };

  // Reset to default
  const handleReset = () => {
    const defaultPreset = themePresetsData[0]!;
    applyPreset(defaultPreset);
    setUiDensity('comfortable');
    setTableDensity('comfortable');
    setFontScale('md');
    setColorfulCards(true);
    setCompactSidebar(false);
    setReduceMotion(false);
    toast.info('Theme reset to ISP Pay BD default settings');
  };

  // Save / Apply
  const handleApplyTheme = () => {
    toast.success('Theme preferences saved successfully');
  };

  // Export JSON
  const handleExport = () => {
    const config = {
      presetId: selectedPresetId,
      primaryColor,
      secondaryColor,
      radius,
      uiDensity,
      tableDensity,
      fontScale,
      darkMode: theme === 'dark',
      colorfulCards,
      compactSidebar,
      reduceMotion,
      exportedAt: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(config, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'ipb-brand-theme.json';
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Exported ipb-brand-theme.json');
  };

  // Copy JSON
  const handleCopyJson = () => {
    const config = {
      primaryColor,
      secondaryColor,
      radius,
      uiDensity,
      tableDensity,
      fontScale,
      colorfulCards,
    };
    navigator.clipboard.writeText(JSON.stringify(config, null, 2));
    toast.success('Theme JSON copied to clipboard');
  };

  // Import JSON
  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target?.result as string);
        if (data.primaryColor) setPrimaryColor(data.primaryColor);
        if (data.secondaryColor) setSecondaryColor(data.secondaryColor);
        if (data.radius) setRadius(data.radius);
        if (data.uiDensity) setUiDensity(data.uiDensity);
        if (data.tableDensity) setTableDensity(data.tableDensity);
        if (data.fontScale) setFontScale(data.fontScale);
        if (typeof data.colorfulCards === 'boolean') setColorfulCards(data.colorfulCards);
        toast.success('Theme imported successfully');
      } catch {
        toast.error('Invalid theme JSON file format');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      <PageHeader
        title="Theme Studio"
        subtitle="Brand colors, density, radius and presets — customized for your ISP organization"
        breadcrumb={[{ label: 'Dashboard', url: '/admin/dashboard' }, { label: 'Theme Studio' }]}
        actions={
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleReset} className="text-xs">
              <RotateCcw className="mr-1.5 h-3.5 w-3.5" /> Reset Default
            </Button>
            <Button size="sm" onClick={handleApplyTheme} className="text-xs font-semibold">
              <Sparkles className="mr-1.5 h-3.5 w-3.5" /> Apply Theme
            </Button>
          </div>
        }
      />

      {/* Row 1: Brand Colors & Live Preview */}
      <div className="grid gap-6 lg:grid-cols-12">
        {/* Brand Colors Controls */}
        <Card className="lg:col-span-6 border-border/70 shadow-2xs">
          <CardHeader className="pb-4">
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <Palette className="h-4 w-4 text-primary" /> Brand Colors & Geometry
            </CardTitle>
            <CardDescription className="text-xs">
              Pick any primary & secondary hex — a 50–900 luminance ramp generates automatically.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            {/* Primary Color */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-foreground flex items-center justify-between">
                <span>Primary Brand Color (Action CTAs & Highlights)</span>
                <span className="font-mono text-[11px] text-muted-foreground">{primaryColor}</span>
              </label>
              <div className="flex items-center gap-2.5">
                <input
                  type="color"
                  value={primaryColor}
                  onChange={(e) => setPrimaryColor(e.target.value)}
                  className="h-9 w-12 rounded-lg border border-border cursor-pointer bg-transparent p-0.5"
                  aria-label="Primary color picker"
                />
                <Input
                  value={primaryColor}
                  onChange={(e) => setPrimaryColor(e.target.value)}
                  className="font-mono text-xs h-9 uppercase"
                  placeholder="#f75803"
                />
              </div>
              {/* 10-step ramp */}
              <div className="flex h-3 w-full rounded-md overflow-hidden border border-border/60 mt-1">
                {primaryRamp.map((step, idx) => (
                  <div key={idx} className="flex-1" style={{ backgroundColor: step }} title={`Step ${idx + 1}: ${step}`} />
                ))}
              </div>
            </div>

            {/* Secondary Color */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-foreground flex items-center justify-between">
                <span>Secondary Color (Sidebar & Deep Panels)</span>
                <span className="font-mono text-[11px] text-muted-foreground">{secondaryColor}</span>
              </label>
              <div className="flex items-center gap-2.5">
                <input
                  type="color"
                  value={secondaryColor}
                  onChange={(e) => setSecondaryColor(e.target.value)}
                  className="h-9 w-12 rounded-lg border border-border cursor-pointer bg-transparent p-0.5"
                  aria-label="Secondary color picker"
                />
                <Input
                  value={secondaryColor}
                  onChange={(e) => setSecondaryColor(e.target.value)}
                  className="font-mono text-xs h-9 uppercase"
                  placeholder="#1a0b38"
                />
              </div>
              {/* 10-step ramp */}
              <div className="flex h-3 w-full rounded-md overflow-hidden border border-border/60 mt-1">
                {secondaryRamp.map((step, idx) => (
                  <div key={idx} className="flex-1" style={{ backgroundColor: step }} title={`Step ${idx + 1}: ${step}`} />
                ))}
              </div>
            </div>

            {/* Corner Radius Selector */}
            <div className="space-y-2 pt-1">
              <label className="text-xs font-semibold text-foreground">Corner Radius</label>
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
                    variant={radius === item.val ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setRadius(item.val)}
                    className="text-xs h-9 font-medium"
                  >
                    <span
                      className="inline-block h-2 w-2 border border-current mr-1.5"
                      style={{ borderRadius: `${item.val}px` }}
                    />
                    {item.label}
                  </Button>
                ))}
              </div>
            </div>

            {/* Safety note */}
            <div className="flex items-start gap-2 p-2.5 rounded-lg bg-muted/40 border border-border/50 text-[11px] text-muted-foreground">
              <Info className="h-4 w-4 shrink-0 text-primary mt-0.5" />
              <span>
                System safety rule: Success, warning, and error colors stay fixed — red always means overdue/trouble regardless of chosen brand theme.
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Live Preview Card */}
        <Card className="lg:col-span-6 border-border/70 shadow-2xs">
          <CardHeader className="pb-4">
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <Eye className="h-4 w-4 text-primary" /> Live Interactive Preview
            </CardTitle>
            <CardDescription className="text-xs">
              Updates in real-time — preview how buttons, badges, and stats appear to your staff.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Mock Mini-Portal Preview Box */}
            <div
              className="rounded-xl border border-border/70 overflow-hidden flex flex-col sm:flex-row min-h-[220px] shadow-xs"
              style={{ borderRadius: `${radius}px` }}
            >
              {/* Mini Sidebar */}
              <div
                className="w-full sm:w-44 p-3.5 text-white flex flex-col justify-between shrink-0"
                style={{ backgroundColor: secondaryColor }}
              >
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <div className="h-5 w-5 rounded bg-white/20 flex items-center justify-center font-bold text-[10px]">
                      IP
                    </div>
                    <span className="font-bold text-xs tracking-tight">ISP Pay BD</span>
                  </div>
                  <div className="space-y-1 text-[11px]">
                    <div
                      className="px-2 py-1 rounded font-semibold flex items-center justify-between text-white"
                      style={{ backgroundColor: primaryColor }}
                    >
                      <span>Dashboard</span>
                      <span className="h-1.5 w-1.5 rounded-full bg-white" />
                    </div>
                    <div className="px-2 py-1 opacity-70 hover:opacity-100 cursor-pointer">Customers</div>
                    <div className="px-2 py-1 opacity-70 hover:opacity-100 cursor-pointer">Billing</div>
                    <div className="px-2 py-1 opacity-70 hover:opacity-100 cursor-pointer">Routers</div>
                  </div>
                </div>
                <div className="pt-3 border-t border-white/10 text-[10px] opacity-60">
                  v3.2 SaaS Edition
                </div>
              </div>

              {/* Mini Body */}
              <div className="flex-1 bg-card p-4 space-y-4">
                {/* Buttons Showcase */}
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    style={{ backgroundColor: primaryColor, borderRadius: `${radius}px` }}
                    className="px-3 py-1.5 text-xs font-bold text-white shadow-2xs hover:opacity-90 active:scale-95 transition-all"
                  >
                    Primary Action
                  </button>
                  <button
                    type="button"
                    style={{ backgroundColor: secondaryColor, borderRadius: `${radius}px` }}
                    className="px-3 py-1.5 text-xs font-medium text-white shadow-2xs hover:opacity-90 active:scale-95 transition-all"
                  >
                    Secondary
                  </button>
                  <button
                    type="button"
                    style={{ borderRadius: `${radius}px` }}
                    className="px-3 py-1.5 text-xs font-medium border border-border/80 hover:bg-accent active:scale-95 transition-all"
                  >
                    Outline
                  </button>
                </div>

                {/* Status Badges Showcase */}
                <div className="flex flex-wrap items-center gap-2 text-xs">
                  <span
                    className="px-2 py-0.5 text-[11px] font-semibold text-white rounded-full"
                    style={{ backgroundColor: primaryColor }}
                  >
                    Brand Badge
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-2 py-0.5 text-[11px] font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 rounded-full">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" /> Online
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-2 py-0.5 text-[11px] font-semibold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 rounded-full">
                    <span className="h-1.5 w-1.5 rounded-full bg-amber-500" /> Payment Due
                  </span>
                </div>

                {/* Stat Preview Component */}
                <div
                  className="p-3 rounded-lg border border-border/60 bg-muted/20 flex items-center justify-between"
                  style={{ borderRadius: `${radius}px` }}
                >
                  <div>
                    <div className="text-[10px] uppercase font-bold text-muted-foreground">Payment Received</div>
                    <div className="text-lg font-black font-mono mt-0.5">৳30,820</div>
                  </div>
                  <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px]">
                    +8.4%
                  </Badge>
                </div>
              </div>
            </div>

            {/* Secondary Hero Panel */}
            <div
              className="p-3.5 text-white rounded-xl flex items-center justify-between shadow-2xs"
              style={{
                borderRadius: `${radius}px`,
                background: `linear-gradient(135deg, ${secondaryColor} 0%, #0c0118 100%)`,
                border: '1px solid rgba(255,255,255,0.1)',
              }}
            >
              <div>
                <span className="text-[10px] font-mono tracking-wider opacity-80 uppercase">Secondary Gradient</span>
                <div className="text-sm font-bold mt-0.5">Hero Panels & Invoices</div>
              </div>
              <div
                className="h-7 px-2.5 rounded text-xs font-bold flex items-center text-white"
                style={{ backgroundColor: primaryColor }}
              >
                Preview
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Row 2: Display Preferences */}
      <Card className="border-border/70 shadow-2xs">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-bold flex items-center gap-2">
            <Sliders className="h-4 w-4 text-primary" /> Display Preferences
          </CardTitle>
          <CardDescription className="text-xs">
            Density, type scale, sidebar and motion toggles — saved directly on this browser profile.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {/* UI Density */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-foreground">UI Density</label>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  type="button"
                  variant={uiDensity === 'comfortable' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setUiDensity('comfortable')}
                  className="text-xs"
                >
                  Comfortable
                </Button>
                <Button
                  type="button"
                  variant={uiDensity === 'compact' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setUiDensity('compact')}
                  className="text-xs"
                >
                  Compact
                </Button>
              </div>
            </div>

            {/* Table Density */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-foreground">Table Density</label>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  type="button"
                  variant={tableDensity === 'comfortable' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setTableDensity('comfortable')}
                  className="text-xs"
                >
                  Comfortable
                </Button>
                <Button
                  type="button"
                  variant={tableDensity === 'compact' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setTableDensity('compact')}
                  className="text-xs"
                >
                  Compact
                </Button>
              </div>
            </div>

            {/* Text Scale */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-foreground">Text Size</label>
              <div className="grid grid-cols-3 gap-2">
                {(['sm', 'md', 'lg'] as const).map((scale) => (
                  <Button
                    key={scale}
                    type="button"
                    variant={fontScale === scale ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setFontScale(scale)}
                    className="text-xs capitalize"
                  >
                    {scale === 'sm' ? 'Small' : scale === 'md' ? 'Default' : 'Large'}
                  </Button>
                ))}
              </div>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mt-6 pt-6 border-t border-border/60">
            {/* Dark Mode */}
            <label className="flex items-center gap-3 p-3 rounded-xl border border-border/50 bg-card hover:border-primary/30 cursor-pointer transition-colors">
              <input
                type="checkbox"
                checked={theme === 'dark'}
                onChange={(e) => setTheme(e.target.checked ? 'dark' : 'light')}
                className="h-4 w-4 rounded border-border text-primary focus:ring-primary/40 cursor-pointer"
              />
              <div className="text-xs">
                <div className="font-semibold text-foreground">Dark mode</div>
                <div className="text-[10px] text-muted-foreground">Deep obsidian theme</div>
              </div>
            </label>

            {/* Colorful Cards */}
            <label className="flex items-center gap-3 p-3 rounded-xl border border-border/50 bg-card hover:border-primary/30 cursor-pointer transition-colors">
              <input
                type="checkbox"
                checked={colorfulCards}
                onChange={(e) => setColorfulCards(e.target.checked)}
                className="h-4 w-4 rounded border-border text-primary focus:ring-primary/40 cursor-pointer"
              />
              <div className="text-xs">
                <div className="font-semibold text-foreground">Colorful cards</div>
                <div className="text-[10px] text-muted-foreground">Category tinted KPI cards</div>
              </div>
            </label>

            {/* Compact Sidebar */}
            <label className="flex items-center gap-3 p-3 rounded-xl border border-border/50 bg-card hover:border-primary/30 cursor-pointer transition-colors">
              <input
                type="checkbox"
                checked={compactSidebar}
                onChange={(e) => setCompactSidebar(e.target.checked)}
                className="h-4 w-4 rounded border-border text-primary focus:ring-primary/40 cursor-pointer"
              />
              <div className="text-xs">
                <div className="font-semibold text-foreground">Compact sidebar</div>
                <div className="text-[10px] text-muted-foreground">Icon-first collapsed mode</div>
              </div>
            </label>

            {/* Reduce Motion */}
            <label className="flex items-center gap-3 p-3 rounded-xl border border-border/50 bg-card hover:border-primary/30 cursor-pointer transition-colors">
              <input
                type="checkbox"
                checked={reduceMotion}
                onChange={(e) => setReduceMotion(e.target.checked)}
                className="h-4 w-4 rounded border-border text-primary focus:ring-primary/40 cursor-pointer"
              />
              <div className="text-xs">
                <div className="font-semibold text-foreground">Reduce motion</div>
                <div className="text-[10px] text-muted-foreground">Disable page transitions</div>
              </div>
            </label>
          </div>
        </CardContent>
      </Card>

      {/* Row 3: Official Theme Templates */}
      <Card className="border-border/70 shadow-2xs">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-bold flex items-center gap-2">
            <Layers className="h-4 w-4 text-primary" /> Theme Templates
          </CardTitle>
          <CardDescription className="text-xs">
            Professionally paired broadband presets — click to apply instantly.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {themePresetsData.map((preset) => {
              const isSelected = selectedPresetId === preset.id;
              return (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => applyPreset(preset)}
                  className={cn(
                    'text-left rounded-xl border overflow-hidden transition-all hover:shadow-md group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
                    isSelected
                      ? 'border-primary ring-2 ring-primary/30 bg-card'
                      : 'border-border/80 hover:border-primary/40 bg-card/60'
                  )}
                >
                  {/* Preset Banner */}
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
                      <span className="font-bold text-sm text-foreground group-hover:text-primary transition-colors">
                        {preset.name}
                      </span>
                      {isSelected && (
                        <Badge variant="secondary" className="text-[10px] bg-primary/10 text-primary border-primary/20">
                          Active
                        </Badge>
                      )}
                    </div>
                    <p className="text-[11px] text-muted-foreground leading-snug line-clamp-2">
                      {preset.description}
                    </p>

                    <div className="flex items-center gap-3 pt-1 border-t border-border/40">
                      <div className="flex items-center gap-1 text-[10px] font-mono text-muted-foreground">
                        <span className="h-3 w-3 rounded-full border border-border" style={{ backgroundColor: preset.primary }} />
                        {preset.primary}
                      </div>
                      <div className="flex items-center gap-1 text-[10px] font-mono text-muted-foreground">
                        <span className="h-3 w-3 rounded-full border border-border" style={{ backgroundColor: preset.sidebar }} />
                        {preset.sidebar}
                      </div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Row 4: Export / Import Tools */}
      <Card className="border-border/70 shadow-2xs">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-bold flex items-center gap-2">
            <Download className="h-4 w-4 text-primary" /> Export & Import Configuration
          </CardTitle>
          <CardDescription className="text-xs">
            Download a portable JSON profile or transfer settings between browser workstations.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap items-center gap-3">
            <Button size="sm" onClick={handleExport} className="text-xs">
              <Download className="mr-1.5 h-3.5 w-3.5" /> Export JSON File
            </Button>
            <label className="cursor-pointer">
              <input
                type="file"
                accept="application/json,.json"
                onChange={handleImportFile}
                className="hidden"
              />
              <Button size="sm" variant="outline" type="button" className="text-xs pointer-events-none">
                <Upload className="mr-1.5 h-3.5 w-3.5" /> Import JSON File
              </Button>
            </label>
            <Button size="sm" variant="outline" onClick={handleCopyJson} className="text-xs">
              <Copy className="mr-1.5 h-3.5 w-3.5" /> Copy JSON
            </Button>
            <Button size="sm" variant="ghost" onClick={handleReset} className="text-xs text-muted-foreground hover:text-foreground">
              <RotateCcw className="mr-1.5 h-3.5 w-3.5" /> Reset Default
            </Button>
          </div>
          <p className="text-[11px] text-muted-foreground mt-3">
            Export downloads <code className="font-mono text-foreground font-semibold">ipb-brand-theme.json</code>. Import accepts valid brand configuration files from any other device or browser.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
