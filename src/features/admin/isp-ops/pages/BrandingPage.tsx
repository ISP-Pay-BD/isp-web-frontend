'use client';

import { useRef, useState } from 'react';
import Link from 'next/link';
import { Palette, Mail, Phone, Building, Save, RefreshCw, Eye, Upload, Quote, MapPin, ImageIcon } from 'lucide-react';
import { PageHeader } from '@/features/admin/shared/components/PageHeader';
import { PageSkeleton } from '@/components/shared/LoadingSkeleton';
import { EmptyState } from '@/components/shared/EmptyState';
import { Can } from '@/components/shared/Can';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { errorMessage } from '@/lib/api/utils/error-handler';
import {
  sameGeneralText,
  useSoftwareSettings,
  useUpdateGeneralSettings,
  useUploadBrandingImage,
} from '@/features/admin/settings/hooks/use-settings';
import { useTenantTheme } from '@/features/admin/theme-studio/hooks/use-theme-studio';
import type { GeneralSettings } from '@/features/admin/settings/types';

export function BrandingPage() {
  const { data, isLoading, isError, error, refetch, isFetching } = useSoftwareSettings();

  if (isLoading) return <PageSkeleton variant="dashboard" />;
  if (isError || !data) {
    return <EmptyState title="Failed to load branding" description={errorMessage(error)} actionLabel="Retry" onAction={() => refetch()} />;
  }

  return <BrandingEditor initial={data} onRefresh={() => refetch()} refreshing={isFetching} />;
}

function BrandingEditor({ initial, onRefresh, refreshing }: { initial: GeneralSettings; onRefresh: () => void; refreshing: boolean }) {
  const [b, setB] = useState<GeneralSettings>(initial);
  const update = useUpdateGeneralSettings();
  const upload = useUploadBrandingImage();
  const theme = useTenantTheme();
  const logoInput = useRef<HTMLInputElement>(null);
  const iconInput = useRef<HTMLInputElement>(null);
  const accent = theme.data?.primary ?? 'var(--primary)';
  const dirty = !sameGeneralText(b, initial);

  const handleSave = () => {
    if (b.webmasterEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(b.webmasterEmail)) {
      toast.error('Enter a valid support email address');
      return;
    }
    update.mutate(b, { onSuccess: () => toast.success('Branding saved') });
  };

  const handleUpload = (file: File | undefined, kind: 'logo' | 'icon') => {
    if (!file) return;
    upload.mutate(
      { file, kind },
      {
        onSuccess: (res) => {
          setB((prev) => ({ ...prev, [kind === 'logo' ? 'logoUrl' : 'iconUrl']: res.url }));
          toast.success(kind === 'logo' ? 'Logo updated' : 'Icon updated');
        },
      },
    );
    const input = kind === 'logo' ? logoInput.current : iconInput.current;
    if (input) input.value = '';
  };

  const text = (key: 'appName' | 'appSlogan' | 'companyCell' | 'webmasterEmail' | 'companyAddress', label: string, icon: React.ReactNode, mono = false) => (
    <div className="space-y-1.5">
      <Label className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
        {icon} {label}
      </Label>
      <Input value={b[key]} onChange={(e) => setB({ ...b, [key]: e.target.value })} className={cn('h-9 text-xs', mono && 'font-mono')} />
    </div>
  );

  return (
    <div className="space-y-6 w-full pb-12">
      <PageHeader
        title="Branding"
        subtitle="Company name, contacts and logo shown on subscriber bills, receipts and the customer portal."
        breadcrumb={[{ label: 'Dashboard', url: '/admin/dashboard' }, { label: 'Branding' }]}
        actions={
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={onRefresh} className="border-border/80 hover:bg-accent text-xs h-9 gap-1.5">
              <RefreshCw className={cn('h-3.5 w-3.5', refreshing && 'animate-spin')} />
              Refresh
            </Button>
            <Can menu="software_settings" action="update">
              <Button
                size="sm"
                onClick={handleSave}
                disabled={!dirty || update.isPending}
                className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold shadow-sm text-xs h-9 gap-1.5"
              >
                <Save className="h-4 w-4" />
                {update.isPending ? 'Saving…' : 'Save Branding'}
              </Button>
            </Can>
          </div>
        }
      />

      <div className="grid gap-6 lg:grid-cols-12">
        <div className="lg:col-span-7 space-y-6">
          <Card className="border border-border/70 bg-card/60 backdrop-blur-md shadow-sm">
            <CardHeader className="p-5 border-b border-border/60">
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <Palette className="h-4 w-4 text-primary" /> Portal Identity
              </CardTitle>
              <CardDescription className="text-xs mt-0.5">Shown to your subscribers.</CardDescription>
            </CardHeader>
            <CardContent className="p-5 space-y-4">
              {text('appName', 'ISP / Organization Name', <Building className="h-3.5 w-3.5" />)}
              {text('appSlogan', 'Slogan', <Quote className="h-3.5 w-3.5" />)}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {text('companyCell', 'Helpline Phone', <Phone className="h-3.5 w-3.5" />, true)}
                {text('webmasterEmail', 'Support Email', <Mail className="h-3.5 w-3.5" />, true)}
              </div>
              {text('companyAddress', 'Office Address', <MapPin className="h-3.5 w-3.5" />)}
              <p className="text-[11px] text-muted-foreground">
                Brand colours are managed in{' '}
                <Link href="/admin/theme-studio" className="text-primary hover:underline">
                  Theme Studio
                </Link>
                .
              </p>
            </CardContent>
          </Card>

          <Card className="border border-border/70 bg-card/60 backdrop-blur-md shadow-sm">
            <CardHeader className="p-5 border-b border-border/60">
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <ImageIcon className="h-4 w-4 text-primary" /> Logo & Icon
              </CardTitle>
              <CardDescription className="text-xs mt-0.5">PNG, JPG, WEBP or SVG up to 2 MB.</CardDescription>
            </CardHeader>
            <CardContent className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
              {(['logo', 'icon'] as const).map((kind) => {
                const url = kind === 'logo' ? b.logoUrl : b.iconUrl;
                const ref = kind === 'logo' ? logoInput : iconInput;
                return (
                  <div key={kind} className="rounded-lg border border-border/60 bg-background/60 p-3 space-y-3">
                    <div className="h-20 rounded-md bg-muted/40 flex items-center justify-center overflow-hidden">
                      {url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={url} alt={kind} className="max-h-full max-w-full object-contain" />
                      ) : (
                        <span className="text-[11px] text-muted-foreground">No {kind} uploaded</span>
                      )}
                    </div>
                    <Can menu="software_settings" action="update">
                      <input
                        ref={ref}
                        type="file"
                        accept=".png,.jpg,.jpeg,.webp,.svg"
                        className="hidden"
                        onChange={(e) => handleUpload(e.target.files?.[0], kind)}
                      />
                      <Button size="sm" variant="outline" className="w-full text-xs" disabled={upload.isPending} onClick={() => ref.current?.click()}>
                        <Upload className="mr-1.5 h-3.5 w-3.5" /> {url ? `Replace ${kind}` : `Upload ${kind}`}
                      </Button>
                    </Can>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-5">
          <Card className="border border-border/70 bg-card/60 backdrop-blur-md shadow-sm overflow-hidden sticky top-6">
            <CardHeader className="p-5 border-b border-border/60">
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <Eye className="h-4 w-4 text-primary" /> Portal Preview
              </CardTitle>
              <CardDescription className="text-xs mt-0.5">Updates as you type.</CardDescription>
            </CardHeader>
            <CardContent className="p-5">
              <div className="rounded-xl border border-border/60 bg-background/90 p-5 space-y-4 shadow-inner">
                <div className="flex items-center gap-2 pb-3 border-b border-border/50">
                  {b.logoUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={b.logoUrl} alt="" className="h-7 w-7 rounded-lg object-contain" />
                  ) : (
                    <div className="h-7 w-7 rounded-lg flex items-center justify-center font-bold text-xs text-white" style={{ backgroundColor: accent }}>
                      {(b.appName || '··').slice(0, 2).toUpperCase()}
                    </div>
                  )}
                  <div className="min-w-0">
                    <h4 className="font-bold text-xs text-foreground leading-none truncate">{b.appName || 'Your ISP name'}</h4>
                    {b.appSlogan && <span className="text-[10px] text-muted-foreground">{b.appSlogan}</span>}
                  </div>
                </div>
                <div className="p-4 rounded-xl text-white space-y-1 shadow-sm" style={{ backgroundColor: accent }}>
                  <p className="text-[11px] opacity-80 uppercase tracking-widest font-semibold">Subscriber self-care</p>
                  <h3 className="text-base font-bold">Welcome to {b.appName || 'your ISP'}</h3>
                </div>
                <div className="space-y-2 pt-1 text-xs">
                  {b.companyCell && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Phone className="h-3.5 w-3.5 text-primary" />
                      <span>{b.companyCell}</span>
                    </div>
                  )}
                  {b.webmasterEmail && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Mail className="h-3.5 w-3.5 text-primary" />
                      <span>{b.webmasterEmail}</span>
                    </div>
                  )}
                  {b.companyAddress && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <MapPin className="h-3.5 w-3.5 text-primary" />
                      <span>{b.companyAddress}</span>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
