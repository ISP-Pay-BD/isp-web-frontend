'use client';

import { useState, useMemo } from 'react';
import {
  Boxes,
  Search,
  Plus,
  Users,
  Building2,
  Home,
  Wifi,
  Network,
  GraduationCap,
  ArrowRight,
  TrendingUp,
  RefreshCw,
  X,
  Sliders,
  MoreVertical,
  CheckCircle2,
  ShieldCheck,
  Zap,
  Tag,
  Eye,
  FileCode,
} from 'lucide-react';
import { PageHeader } from '@/features/admin/shared/components/PageHeader';
import { PageSkeleton } from '@/components/shared/LoadingSkeleton';
import { EmptyState } from '@/components/shared/EmptyState';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { useIspOps } from '../hooks/use-isp-ops';
import type { ServiceType } from '@/data/admin/isp-ops.data';

const serviceIcons: Record<string, { icon: React.ComponentType<{ className?: string }>; color: string; bg: string; border: string }> = {
  HOME_FTTH: { icon: Home, color: 'text-purple-400', bg: 'bg-purple-500/10', border: 'border-purple-500/20' },
  SME_CORP: { icon: Building2, color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/20' },
  CORP_DIA: { icon: Network, color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' },
  HOTSPOT: { icon: Wifi, color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20' },
  RESELLER_L2: { icon: Boxes, color: 'text-rose-400', bg: 'bg-rose-500/10', border: 'border-rose-500/20' },
  CAMPUS_NET: { icon: GraduationCap, color: 'text-cyan-400', bg: 'bg-cyan-500/10', border: 'border-cyan-500/20' },
};

export function ServicesPage() {
  const { data, isLoading, isError, refetch } = useIspOps();

  const [search, setSearch] = useState('');
  const [selectedService, setSelectedService] = useState<ServiceType | null>(null);
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);

  // New Service Form State
  const [newServiceName, setNewServiceName] = useState('');
  const [newServiceCode, setNewServiceCode] = useState('');
  const [newDescription, setNewDescription] = useState('');

  const serviceList = useMemo(() => data?.serviceTypes ?? [], [data?.serviceTypes]);

  const filteredServices = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return serviceList;
    return serviceList.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.code.toLowerCase().includes(q) ||
        s.id.toLowerCase().includes(q) ||
        s.customers.toString().includes(q)
    );
  }, [serviceList, search]);

  const totalCustomers = useMemo(() => {
    return serviceList.reduce((sum, s) => sum + s.customers, 0);
  }, [serviceList]);

  const handleCreateService = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newServiceName.trim() || !newServiceCode.trim()) {
      toast.error('Service Name and Code are required');
      return;
    }
    toast.success(`Service category "${newServiceName}" (${newServiceCode.toUpperCase()}) registered!`);
    setIsNewModalOpen(false);
    setNewServiceName('');
    setNewServiceCode('');
    setNewDescription('');
  };

  if (isLoading) return <PageSkeleton variant="table" />;
  if (isError || !data) {
    return <EmptyState title="Failed to load service types" actionLabel="Retry" onAction={() => refetch()} />;
  }

  return (
    <div className="space-y-6 pb-12">
      {/* Page Header */}
      <PageHeader
        title="Service Categories & Line of Business"
        subtitle="Manage plan categories, line-of-business segregation, RADIUS profile routing, and subscriber segmentation."
        breadcrumb={[{ label: 'Dashboard', url: '/admin/dashboard' }, { label: 'Service Types' }]}
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => refetch()}
              className="text-xs border-border/80 hover:bg-accent gap-1.5"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              Refresh
            </Button>
            <Button
              size="sm"
              onClick={() => setIsNewModalOpen(true)}
              className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold shadow-sm text-xs h-9 gap-1.5"
            >
              <Plus className="h-4 w-4" />
              New Service Type
            </Button>
          </div>
        }
      />

      {/* KPI Stats Ribbon */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="border border-border/70 bg-card/60 backdrop-blur-md shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/5 rounded-full blur-xl pointer-events-none" />
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Service Types</span>
              <div className="p-2 rounded-lg bg-purple-500/10 text-purple-400 border border-purple-500/20">
                <Boxes className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-2 text-2xl font-black font-mono text-foreground">{serviceList.length}</div>
            <div className="mt-2 text-[11px] text-muted-foreground">Active lines of business</div>
          </CardContent>
        </Card>

        <Card className="border border-border/70 bg-card/60 backdrop-blur-md shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-xl pointer-events-none" />
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Subscribers Served</span>
              <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <Users className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-2 text-2xl font-black font-mono text-emerald-400">{totalCustomers.toLocaleString()}</div>
            <div className="mt-2 text-[11px] text-muted-foreground">Total connected user base</div>
          </CardContent>
        </Card>

        <Card className="border border-border/70 bg-card/60 backdrop-blur-md shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 rounded-full blur-xl pointer-events-none" />
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Retail Share</span>
              <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20">
                <Home className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-2 text-2xl font-black font-mono text-blue-400">
              {totalCustomers > 0 ? ((4200 / totalCustomers) * 100).toFixed(1) : 0}%
            </div>
            <div className="mt-2 text-[11px] text-muted-foreground">Home FTTH volume share</div>
          </CardContent>
        </Card>

        <Card className="border border-border/70 bg-card/60 backdrop-blur-md shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-full blur-xl pointer-events-none" />
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Corporate & Leased</span>
              <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
                <Building2 className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-2 text-2xl font-black font-mono text-amber-400">820 Lines</div>
            <div className="mt-2 text-[11px] text-muted-foreground">SME & DIA Dedicated Core</div>
          </CardContent>
        </Card>
      </div>

      {/* Search Bar */}
      <div className="p-3.5 rounded-xl border border-border/60 bg-card/60 backdrop-blur-sm shadow-sm">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search service categories by name, code, ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-9 text-xs bg-background/80"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Services Grid */}
      {filteredServices.length === 0 ? (
        <EmptyState
          icon={<Boxes className="h-10 w-10 text-muted-foreground" />}
          title="No service types match query"
          description="Try modifying your search or add a new line of business."
          actionLabel="Clear Search"
          onAction={() => setSearch('')}
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredServices.map((service) => {
            const iconConfig = serviceIcons[service.code] ?? {
              icon: Boxes,
              color: 'text-purple-400',
              bg: 'bg-purple-500/10',
              border: 'border-purple-500/20',
            };
            const Icon = iconConfig.icon;
            const pct = totalCustomers > 0 ? ((service.customers / totalCustomers) * 100).toFixed(1) : '0';

            return (
              <Card
                key={service.id}
                className="group relative border border-border/70 bg-card/60 hover:border-primary/50 hover:bg-card/90 transition-all duration-200 overflow-hidden cursor-pointer shadow-sm"
                onClick={() => setSelectedService(service)}
              >
                <div className="p-5 space-y-4">
                  <div className="flex items-start justify-between">
                    <div className={cn('p-2.5 rounded-xl border', iconConfig.bg, iconConfig.color, iconConfig.border)}>
                      <Icon className="h-5 w-5" />
                    </div>

                    <div className="flex items-center gap-1.5">
                      <Badge variant="outline" className="font-mono text-[10px] bg-muted/40 border-border/60 text-muted-foreground">
                        {service.code}
                      </Badge>
                      <DropdownMenu>
                        <DropdownMenuTrigger
                          onClick={(e) => e.stopPropagation()}
                          className="h-7 w-7 inline-flex items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-muted focus-visible:outline-none"
                        >
                          <MoreVertical className="h-4 w-4" />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="text-xs">
                          <DropdownMenuItem onClick={(e) => { e.stopPropagation(); setSelectedService(service); }}>
                            <Eye className="h-3.5 w-3.5 mr-2" /> Inspect Details
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={(e) => { e.stopPropagation(); toast.info(`Viewing packages under ${service.name}`); }}>
                            <FileCode className="h-3.5 w-3.5 mr-2" /> View Assigned Packages
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>

                  <div>
                    <span className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest">{service.id}</span>
                    <h4 className="text-base font-bold text-foreground group-hover:text-primary transition-colors line-clamp-1">
                      {service.name}
                    </h4>
                  </div>

                  {/* Customer count & Progress */}
                  <div className="space-y-2 pt-2 border-t border-border/50">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-muted-foreground">Active Subscriptions</span>
                      <span className="font-mono font-bold text-foreground">
                        {service.customers.toLocaleString()}{' '}
                        <span className="text-muted-foreground text-[10px] font-normal">({pct}%)</span>
                      </span>
                    </div>
                    <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary rounded-full transition-all duration-500"
                        style={{ width: `${Math.max(5, parseFloat(pct))}%` }}
                      />
                    </div>
                  </div>

                  <div className="pt-2 flex items-center justify-between">
                    <span className="text-[10px] text-emerald-400 flex items-center gap-1">
                      <CheckCircle2 className="h-3 w-3" /> RADIUS Profile Active
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-xs text-primary group-hover:translate-x-1 transition-transform p-0 h-auto font-medium"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedService(service);
                      }}
                    >
                      Inspect <ArrowRight className="h-3.5 w-3.5 ml-1" />
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Inspector Drawer */}
      <Sheet open={!!selectedService} onOpenChange={(open) => !open && setSelectedService(null)}>
        <SheetContent className="bg-card border-border text-foreground w-full sm:max-w-md overflow-y-auto">
          {selectedService && (
            <div className="space-y-6">
              <SheetHeader>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="font-mono text-[10px] bg-primary/10 text-primary border-primary/20">
                    {selectedService.code}
                  </Badge>
                  <Badge variant="outline" className="font-mono text-[10px] bg-muted/40 border-border/60 text-muted-foreground">
                    {selectedService.id}
                  </Badge>
                </div>
                <SheetTitle className="text-xl font-bold text-foreground">{selectedService.name}</SheetTitle>
                <SheetDescription className="text-xs text-muted-foreground">
                  Service division parameters, SLA thresholds, and subscriber breakdown.
                </SheetDescription>
              </SheetHeader>

              <div className="space-y-4">
                <Card className="border border-border/70 bg-muted/20 p-4 space-y-3">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-muted-foreground">Subscribers Attached</span>
                    <span className="font-mono font-bold text-emerald-400 text-sm">
                      {selectedService.customers.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-muted-foreground">Network Type</span>
                    <span className="font-medium text-foreground">GPON / EPON / Leased Core</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-muted-foreground">Authentication Hook</span>
                    <span className="font-mono text-primary">FreeRADIUS v3.2 / PPPoE / IPoE</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-muted-foreground">VLAN Trunk Tag</span>
                    <span className="font-mono text-foreground">VLAN 100 - 450</span>
                  </div>
                </Card>

                <div className="space-y-2">
                  <h5 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Operational Guarantees</h5>
                  <Card className="border border-border/70 bg-muted/20 p-3 space-y-2 text-xs">
                    <div className="flex items-center gap-2 text-emerald-400">
                      <ShieldCheck className="h-4 w-4" />
                      <span>99.9% Uptime Commitment</span>
                    </div>
                    <div className="flex items-center gap-2 text-blue-400">
                      <Zap className="h-4 w-4" />
                      <span>Dedicated CIR / MIR Bandwidth Shaping</span>
                    </div>
                  </Card>
                </div>

                <div className="pt-4 flex gap-2">
                  <Button
                    className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-xs"
                    onClick={() => {
                      toast.success(`Exporting subscriber roster for ${selectedService.name}...`);
                      setSelectedService(null);
                    }}
                  >
                    Export Subscribers CSV
                  </Button>
                  <Button
                    variant="outline"
                    className="border-border hover:bg-accent text-xs"
                    onClick={() => setSelectedService(null)}
                  >
                    Close
                  </Button>
                </div>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>

      {/* New Service Type Modal */}
      {isNewModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <Card className="border border-border bg-card text-foreground w-full max-w-md shadow-2xl animate-in fade-in-0 zoom-in-95">
            <div className="p-6 space-y-5">
              <div className="flex items-center justify-between border-b border-border/60 pb-4">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-primary/10 text-primary border border-primary/20">
                    <Plus className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-foreground">Add Service Category</h3>
                    <p className="text-xs text-muted-foreground">Create a new line of business or billing tier.</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsNewModalOpen(false)}
                  className="text-muted-foreground hover:text-foreground rounded-lg p-1"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleCreateService} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground">Service Name *</label>
                  <Input
                    placeholder="e.g. Dedicated Dark Fiber Leased Link"
                    value={newServiceName}
                    onChange={(e) => setNewServiceName(e.target.value)}
                    className="h-9 text-xs"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground">Unique Short Code *</label>
                  <Input
                    placeholder="e.g. DARK_FIBER"
                    value={newServiceCode}
                    onChange={(e) => setNewServiceCode(e.target.value.toUpperCase())}
                    className="h-9 text-xs font-mono uppercase"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground">Description & Notes</label>
                  <Input
                    placeholder="Optional details regarding routing, SLA, and RADIUS tags"
                    value={newDescription}
                    onChange={(e) => setNewDescription(e.target.value)}
                    className="h-9 text-xs"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-4 border-t border-border/60">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsNewModalOpen(false)}
                    className="border-border hover:bg-accent text-xs"
                  >
                    Cancel
                  </Button>
                  <Button type="submit" className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-xs">
                    Create Category
                  </Button>
                </div>
              </form>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
