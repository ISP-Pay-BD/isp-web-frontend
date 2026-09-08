'use client';

import { PageHeader } from '@/features/shared/page-header';
import { PageSkeleton } from '@/components/shared/LoadingSkeleton';
import { EmptyState } from '@/components/shared/EmptyState';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { useIspOps } from '../hooks/use-isp-ops';

export function BrandingPage() {
  const { data, isLoading, isError, refetch } = useIspOps();

  if (isLoading) return <PageSkeleton variant="dashboard" />;
  if (isError || !data) {
    return <EmptyState title="Failed to load branding" actionLabel="Retry" onAction={() => refetch()} />;
  }

  const b = data.brandingSettings;

  return (
    <div className="space-y-6">
      <PageHeader
        title="White-label branding"
        subtitle="Tenant portal colors, logo, and support contacts"
        breadcrumb={[{ label: 'Dashboard', url: '/admin/dashboard' }, { label: 'Branding' }]}
        actions={
          <Button size="sm" onClick={() => toast.success('Branding saved (mock)')}>
            Save
          </Button>
        }
      />

      <p className="text-sm text-muted-foreground">
        Domain · <span className="font-mono text-foreground">{b.customDomain}</span>
      </p>

      <div className="grid gap-6 lg:grid-cols-[1fr_280px]">
        <Card className="max-w-xl border-border/60 shadow-sm ring-1 ring-border/60 lg:max-w-none">
          <CardHeader>
            <CardTitle className="text-base">Portal identity</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Company name</Label>
              <Input defaultValue={b.companyName} />
            </div>
            <div className="space-y-2">
              <Label>Primary color</Label>
              <Input defaultValue={b.primaryColor} className="font-mono" />
            </div>
            <div className="space-y-2">
              <Label>Logo URL</Label>
              <Input defaultValue={b.logoUrl} className="font-mono text-xs" />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Support phone</Label>
                <Input defaultValue={b.supportPhone} />
              </div>
              <div className="space-y-2">
                <Label>Support email</Label>
                <Input defaultValue={b.supportEmail} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Custom domain</Label>
              <Input defaultValue={b.customDomain} className="font-mono text-xs" />
            </div>
          </CardContent>
        </Card>

        <Card className="h-fit border-border/60 shadow-sm ring-1 ring-border/60">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Preview</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div
              className="rounded-lg px-3 py-4 text-white"
              style={{ backgroundColor: b.primaryColor }}
            >
              <div className="text-sm font-semibold">{b.companyName}</div>
              <div className="mt-1 text-xs text-white/80">Customer portal</div>
            </div>
            <p className="text-xs text-muted-foreground">{b.supportPhone}</p>
            <p className="truncate text-xs text-muted-foreground">{b.supportEmail}</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
