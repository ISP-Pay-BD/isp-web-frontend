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
import { useTranslations } from '@/i18n/locale-context';
import {
  sameGeneralText,
  useSoftwareSettings,
  useUpdateGeneralSettings,
  useUploadBrandingImage,
} from '@/features/admin/settings/hooks/use-settings';
import { useTenantTheme } from '@/features/admin/theme-studio/hooks/use-theme-studio';
import type { GeneralSettings } from '@/features/admin/settings/types';

/** Black or white, whichever reads better on a tenant-chosen `#rrggbb` accent; the theme's own foreground for CSS variables. */
function readableOn(color: string): string {
  const m = /^#([0-9a-f]{6})$/i.exec(color);
  if (!m) return 'var(--primary-foreground)';
  const [r, g, b] = [0, 2, 4].map((i) => {
    const v = parseInt(m[1].slice(i, i + 2), 16) / 255;
    return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b > 0.179 ? '#111111' : '#ffffff';
}

export function BrandingPage() {
  const t = useTranslations();
  const { data, isLoading, isError, error, refetch, isFetching } = useSoftwareSettings();

  if (isLoading) return <PageSkeleton variant="dashboard" />;
  if (isError || !data) {
    return (
      <EmptyState
        variant="error"
        title={t('admin.ops.branding.loadFailed', 'Failed to load branding')}
        description={errorMessage(error)}
        actionLabel={t('admin.customers.list.retry', 'Retry')}
        onAction={() => refetch()}
      />
    );
  }

  return <BrandingEditor initial={data} onRefresh={() => refetch()} refreshing={isFetching} />;
}

function BrandingEditor({ initial, onRefresh, refreshing }: { initial: GeneralSettings; onRefresh: () => void; refreshing: boolean }) {
  const t = useTranslations();
  const [b, setB] = useState<GeneralSettings>(initial);
  const update = useUpdateGeneralSettings();
  const upload = useUploadBrandingImage();
  const theme = useTenantTheme();
  const logoInput = useRef<HTMLInputElement>(null);
  const iconInput = useRef<HTMLInputElement>(null);
  const accent = theme.data?.primary ?? 'var(--primary)';
  const onAccent = readableOn(accent);
  const dirty = !sameGeneralText(b, initial);

  const handleSave = () => {
    if (b.webmasterEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(b.webmasterEmail)) {
      toast.error(t('admin.ops.branding.invalidEmail', 'Enter a valid support email address'));
      return;
    }
    update.mutate(b, { onSuccess: () => toast.success(t('admin.ops.branding.saved', 'Branding saved')) });
  };

  const handleUpload = (file: File | undefined, kind: 'logo' | 'icon') => {
    if (!file) return;
    upload.mutate(
      { file, kind },
      {
        onSuccess: (res) => {
          setB((prev) => ({ ...prev, [kind === 'logo' ? 'logoUrl' : 'iconUrl']: res.url }));
          toast.success(kind === 'logo' ? t('admin.ops.branding.logoUpdated', 'Logo updated') : t('admin.ops.branding.iconUpdated', 'Icon updated'));
        },
      },
    );
    const input = kind === 'logo' ? logoInput.current : iconInput.current;
    if (input) input.value = '';
  };

  const text = (key: 'appName' | 'appSlogan' | 'companyCell' | 'webmasterEmail' | 'companyAddress', label: string, icon: React.ReactNode, mono = false) => (
    <div className="space-y-1.5">
      <Label htmlFor="icon-label" className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
        {icon} {label}
      </Label>
      <Input id="icon-label" value={b[key]} onChange={(e) => setB({ ...b, [key]: e.target.value })} className={cn('h-9 text-xs', mono && 'font-mono')} />
    </div>
  );

  return (
    <div className="space-y-6 w-full pb-12">
      <PageHeader
        title={t('admin.ops.branding.title', 'Branding')}
        subtitle={t('admin.ops.branding.subtitle', 'Company name, contacts and logo shown on subscriber bills, receipts and the customer portal.')}
        breadcrumb={[
          { label: t('common.crumb.dashboard', 'Dashboard'), url: '/admin/dashboard' },
          { label: t('common.crumb.branding', 'Branding') },
        ]}
        actions={
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={onRefresh} className="border-border/80 hover:bg-accent text-xs h-9 gap-1.5">
              <RefreshCw className={cn('h-3.5 w-3.5', refreshing && 'animate-spin')} />
              {t('admin.paymentGateways.list.refresh', 'Refresh')}
            </Button>
            <Can menu="software_settings" action="update">
              <Button
                size="sm"
                onClick={handleSave}
                disabled={!dirty || update.isPending}
                className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold shadow-sm text-xs h-9 gap-1.5"
              >
                <Save className="h-4 w-4" />
                {update.isPending ? t('admin.ops.branding.saving', 'Saving…') : t('admin.ops.branding.save', 'Save Branding')}
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
                <Palette className="h-4 w-4 text-primary" /> {t('admin.ops.branding.identity', 'Portal Identity')}
              </CardTitle>
              <CardDescription className="text-xs mt-0.5">{t('admin.ops.branding.identityDesc', 'Shown to your subscribers.')}</CardDescription>
            </CardHeader>
            <CardContent className="p-5 space-y-4">
              {text('appName', t('admin.ops.branding.appName', 'ISP / Organization Name'), <Building className="h-3.5 w-3.5" />)}
              {text('appSlogan', t('admin.ops.branding.slogan', 'Slogan'), <Quote className="h-3.5 w-3.5" />)}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {text('companyCell', t('admin.ops.branding.helpline', 'Helpline Phone'), <Phone className="h-3.5 w-3.5" />, true)}
                {text('webmasterEmail', t('admin.ops.branding.supportEmail', 'Support Email'), <Mail className="h-3.5 w-3.5" />, true)}
              </div>
              {text('companyAddress', t('admin.ops.branding.address', 'Office Address'), <MapPin className="h-3.5 w-3.5" />)}
              <p className="text-xs text-muted-foreground">
                {t('admin.ops.branding.colorsBefore', 'Brand colours are managed in')}{' '}
                <Link href="/admin/theme-studio" className="text-primary underline underline-offset-2">
                  {t('nav.theme-studio', 'Theme Studio')}
                </Link>
                {t('admin.ops.branding.colorsAfter', '.')}
              </p>
            </CardContent>
          </Card>

          <Card className="border border-border/70 bg-card/60 backdrop-blur-md shadow-sm">
            <CardHeader className="p-5 border-b border-border/60">
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <ImageIcon className="h-4 w-4 text-primary" /> {t('admin.ops.branding.logoIcon', 'Logo & Icon')}
              </CardTitle>
              <CardDescription className="text-xs mt-0.5">{t('admin.ops.branding.uploadHint', 'PNG, JPG, WEBP or SVG up to 2 MB.')}</CardDescription>
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
                        <img src={url} alt={kind === 'logo' ? t('admin.ops.branding.logo', 'Logo') : t('admin.ops.branding.icon', 'Icon')} className="max-h-full max-w-full object-contain" />
                      ) : (
                        <span className="text-xs text-muted-foreground">
                          {kind === 'logo' ? t('admin.ops.branding.noLogo', 'No logo uploaded') : t('admin.ops.branding.noIcon', 'No icon uploaded')}
                        </span>
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
                        <Upload className="mr-1.5 h-3.5 w-3.5" /> {kind === 'logo'
                          ? url
                            ? t('admin.ops.branding.replaceLogo', 'Replace logo')
                            : t('admin.ops.branding.uploadLogo', 'Upload logo')
                          : url
                            ? t('admin.ops.branding.replaceIcon', 'Replace icon')
                            : t('admin.ops.branding.uploadIcon', 'Upload icon')}
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
                <Eye className="h-4 w-4 text-primary" /> {t('admin.ops.branding.preview', 'Portal Preview')}
              </CardTitle>
              <CardDescription className="text-xs mt-0.5">{t('admin.ops.branding.previewDesc', 'Updates as you type.')}</CardDescription>
            </CardHeader>
            <CardContent className="p-5">
              <div className="rounded-xl border border-border/60 bg-background/90 p-5 space-y-4 shadow-inner">
                <div className="flex items-center gap-2 pb-3 border-b border-border/50">
                  {b.logoUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={b.logoUrl} alt="" className="h-7 w-7 rounded-lg object-contain" />
                  ) : (
                    <div className="h-7 w-7 rounded-lg flex items-center justify-center font-bold text-xs" style={{ backgroundColor: accent, color: onAccent }}>
                      {(b.appName || '··').slice(0, 2).toUpperCase()}
                    </div>
                  )}
                  <div className="min-w-0">
                    <h4 className="font-bold text-xs text-foreground leading-none truncate">{b.appName || t('admin.ops.branding.yourIspName', 'Your ISP name')}</h4>
                    {b.appSlogan && <span className="text-xs text-muted-foreground">{b.appSlogan}</span>}
                  </div>
                </div>
                <div className="p-4 rounded-xl space-y-1 shadow-sm" style={{ backgroundColor: accent, color: onAccent }}>
                  <p className="text-xs uppercase tracking-widest font-semibold">{t('admin.ops.branding.selfCare', 'Subscriber self-care')}</p>
                  <h3 className="text-base font-bold">{t('admin.ops.branding.welcome', 'Welcome to {name}', { name: b.appName || t('admin.ops.branding.yourIsp', 'your ISP') })}</h3>
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
