'use client';

import { useState } from 'react';
import { PageHeader } from '@/features/shared/page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Check, Palette } from 'lucide-react';
import { cn } from '@/lib/utils';
import { themePresetsData, activeThemeId } from '@/data/admin/theme-studio.data';

export function ThemeStudioPage() {
  const [selectedId, setSelectedId] = useState(activeThemeId);

  const handleApply = () => {
    toast.success('Theme applied to admin portal (mock preview)');
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Theme Studio"
        subtitle="Customize portal colors and preview branding presets"
        breadcrumb={[{ label: 'Dashboard', url: '/admin/dashboard' }, { label: 'Theme Studio' }]}
        actions={<Button onClick={handleApply}>Apply Theme</Button>}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {themePresetsData.map((preset) => {
          const isSelected = selectedId === preset.id;
          return (
            <button
              key={preset.id}
              type="button"
              onClick={() => setSelectedId(preset.id)}
              className={cn(
                'text-left rounded-xl border-2 overflow-hidden transition-all hover:shadow-md',
                isSelected ? 'border-primary ring-2 ring-primary/20' : 'border-border'
              )}
            >
              <div className="h-24 flex">
                <div className="w-1/3" style={{ backgroundColor: preset.sidebar }} />
                <div className="flex-1 flex flex-col">
                  <div className="h-8" style={{ backgroundColor: preset.primary }} />
                  <div className="flex-1 bg-background flex items-center justify-center">
                    <Palette className="h-6 w-6 text-muted-foreground" />
                  </div>
                </div>
              </div>
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center justify-between">
                  {preset.name}
                  {isSelected && <Check className="h-4 w-4 text-primary" />}
                </CardTitle>
                <CardDescription className="text-xs">{preset.description}</CardDescription>
              </CardHeader>
              <CardContent className="pt-0 flex gap-2">
                {[preset.primary, preset.sidebar, preset.accent].map((color) => (
                  <div key={color} className="flex items-center gap-1.5">
                    <span className="h-4 w-4 rounded-full border" style={{ backgroundColor: color }} />
                    <span className="text-[10px] font-mono text-muted-foreground">{color}</span>
                  </div>
                ))}
              </CardContent>
            </button>
          );
        })}
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base">Live Preview</CardTitle></CardHeader>
        <CardContent>
          <div className="rounded-lg border overflow-hidden flex h-48">
            <div className="w-48 p-3 text-white text-sm space-y-2" style={{ backgroundColor: themePresetsData.find((p) => p.id === selectedId)?.sidebar }}>
              <p className="font-bold">ISP Pay BD</p>
              <p className="opacity-70 text-xs">Dashboard</p>
              <p className="opacity-70 text-xs">Customers</p>
              <p className="opacity-70 text-xs">SMS</p>
            </div>
            <div className="flex-1 bg-background p-4">
              <div className="h-8 w-32 rounded mb-3" style={{ backgroundColor: themePresetsData.find((p) => p.id === selectedId)?.primary }} />
              <Badge style={{ backgroundColor: themePresetsData.find((p) => p.id === selectedId)?.accent, color: '#fff' }}>Preview Badge</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
