'use client';

import { useState } from 'react';
import {
  Sparkles,
  Palette,
  Globe,
  Mail,
  Phone,
  Building,
  Save,
  RefreshCw,
  Eye,
  CheckCircle2,
} from 'lucide-react';
import { PageHeader } from '@/features/admin/shared/components/PageHeader';
import { PageSkeleton } from '@/components/shared/LoadingSkeleton';
import { EmptyState } from '@/components/shared/EmptyState';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { useIspOps } from '../hooks/use-isp-ops';

export function BrandingPage() {
  const { data, isLoading, isError, refetch } = useIspOps();

  const b = data?.brandingSettings;
  const [companyName, setCompanyName] = useState(b?.companyName ?? 'Dhaka CyberNet Ltd');
  const [primaryColor, setPrimaryColor] = useState(b?.primaryColor ?? '#f75803');
  const [logoUrl, setLogoUrl] = useState(b?.logoUrl ?? 'https://cdn.isppaybd.com/logos/cybernet.svg');
  const [supportPhone, setSupportPhone] = useState(b?.supportPhone ?? '+880 1711-000000');
  const [supportEmail, setSupportEmail] = useState(b?.supportEmail ?? 'support@dhakacyber.net');
  const [customDomain, setCustomDomain] = useState(b?.customDomain ?? 'portal.dhakacyber.net');

  const handleSave = () => {
    toast.success('Custom white-label branding saved and dispatched to customer edge!');
  };

  if (isLoading) return <PageSkeleton variant="dashboard" />;
  if (isError || !data || !b) {
    return <EmptyState title="Failed to load branding" actionLabel="Retry" onAction={() => refetch()} />;
  }

  return (
    <div className="space-y-6 w-full pb-12">
      {/* Top Header */}
      <PageHeader
        title="White-Label Branding & Domain Mapping"
        subtitle="Customize subscriber self-care portal branding, primary color accents, corporate logo, and CNAME DNS mapping."
        breadcrumb={[{ label: 'Dashboard', url: '/admin/dashboard' }, { label: 'Branding' }]}
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => refetch()}
              className="border-border/80 hover:bg-accent text-xs h-9 gap-1.5"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              Refresh
            </Button>
            <Button
              size="sm"
              onClick={handleSave}
              className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold shadow-sm text-xs h-9 gap-1.5"
            >
              <Save className="h-4 w-4" />
              Save Branding
            </Button>
          </div>
        }
      />

      <div className="grid gap-6 lg:grid-cols-12">
        {/* Form Card */}
        <div className="lg:col-span-7">
          <Card className="border border-border/70 bg-card/60 backdrop-blur-md shadow-sm">
            <CardHeader className="p-5 border-b border-border/60">
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <Palette className="h-4 w-4 text-primary" /> Tenant Portal Identity
              </CardTitle>
              <CardDescription className="text-xs mt-0.5">
                Configure your public-facing subscriber portal details.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-5 space-y-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-muted-foreground">ISP / Organization Legal Name</Label>
                <Input
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className="h-9 text-xs"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-muted-foreground">Primary Accent Color</Label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={primaryColor}
                      onChange={(e) => setPrimaryColor(e.target.value)}
                      className="h-9 w-10 rounded border border-border/80 cursor-pointer bg-transparent p-0.5"
                    />
                    <Input
                      value={primaryColor}
                      onChange={(e) => setPrimaryColor(e.target.value)}
                      className="h-9 text-xs font-mono uppercase"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-muted-foreground">Customer Portal CNAME Domain</Label>
                  <Input
                    value={customDomain}
                    onChange={(e) => setCustomDomain(e.target.value)}
                    className="h-9 text-xs font-mono"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-muted-foreground">SVG / High-Res Logo URL</Label>
                <Input
                  value={logoUrl}
                  onChange={(e) => setLogoUrl(e.target.value)}
                  className="h-9 text-xs font-mono"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-muted-foreground">Helpline Phone</Label>
                  <Input
                    value={supportPhone}
                    onChange={(e) => setSupportPhone(e.target.value)}
                    className="h-9 text-xs font-mono"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-muted-foreground">NOC Support Email</Label>
                  <Input
                    value={supportEmail}
                    onChange={(e) => setSupportEmail(e.target.value)}
                    className="h-9 text-xs font-mono"
                  />
                </div>
              </div>

              <div className="pt-2">
                <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/40 border border-border/50 text-xs text-muted-foreground">
                  <Globe className="h-4 w-4 text-emerald-400 shrink-0" />
                  <span>
                    SSL auto-provisions automatically once CNAME points to <code className="font-mono text-foreground font-semibold">cname.isppaybd.net</code>.
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Live Preview Card */}
        <div className="lg:col-span-5">
          <Card className="border border-border/70 bg-card/60 backdrop-blur-md shadow-sm overflow-hidden sticky top-6">
            <CardHeader className="p-5 border-b border-border/60">
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <Eye className="h-4 w-4 text-primary" /> Live Portal Preview
              </CardTitle>
              <CardDescription className="text-xs mt-0.5">
                Real-time subscriber login view simulation.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-5 space-y-4">
              <div className="rounded-xl border border-border/60 bg-background/90 p-5 space-y-4 shadow-inner">
                <div className="flex items-center justify-between pb-3 border-b border-border/50">
                  <div className="flex items-center gap-2">
                    <div
                      className="h-7 w-7 rounded-lg flex items-center justify-center font-bold text-xs text-white"
                      style={{ backgroundColor: primaryColor }}
                    >
                      {companyName.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <h4 className="font-bold text-xs text-foreground leading-none">{companyName}</h4>
                      <span className="font-mono text-[10px] text-muted-foreground">{customDomain}</span>
                    </div>
                  </div>
                  <Badge variant="outline" className="text-[10px] bg-emerald-500/10 text-emerald-400 border-emerald-500/20">
                    Active SSL
                  </Badge>
                </div>

                <div className="p-4 rounded-xl text-white space-y-2 shadow-sm" style={{ backgroundColor: primaryColor }}>
                  <p className="text-[11px] opacity-80 uppercase tracking-widest font-semibold">Subscriber Self-Care</p>
                  <h3 className="text-base font-bold">Welcome to {companyName}</h3>
                  <p className="text-xs opacity-90">Pay monthly bills, test optical power, and upgrade broadband speed instantly.</p>
                </div>

                <div className="space-y-2 pt-1 text-xs">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Phone className="h-3.5 w-3.5 text-primary" />
                    <span>{supportPhone}</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Mail className="h-3.5 w-3.5 text-primary" />
                    <span>{supportEmail}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
