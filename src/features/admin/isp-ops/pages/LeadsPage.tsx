'use client';

import { useState, useMemo } from 'react';
import {
  Target,
  Search,
  Plus,
  Filter,
  CheckCircle2,
  TrendingUp,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Building2,
  User,
  Sliders,
  RefreshCw,
  X,
  Check,
  Zap,
  ArrowRight,
  MoreVertical,
  Eye,
  SlidersHorizontal,
  DollarSign,
  Briefcase,
  Layers,
  Sparkles,
  PhoneCall,
  UserPlus,
} from 'lucide-react';
import { PageHeader } from '@/features/admin/shared/components/PageHeader';
import { PageSkeleton } from '@/components/shared/LoadingSkeleton';
import { EmptyState } from '@/components/shared/EmptyState';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
import type { LeadRow } from '@/data/admin/isp-ops.data';

type StageFilter = 'all' | 'new' | 'contacted' | 'survey' | 'negotiation' | 'won' | 'lost';

export function LeadsPage() {
  const { data, isLoading, isError, refetch } = useIspOps();

  const [search, setSearch] = useState('');
  const [stageFilter, setStageFilter] = useState<StageFilter>('all');
  const [selectedLead, setSelectedLead] = useState<LeadRow | null>(null);
  const [isAddLeadOpen, setIsAddLeadOpen] = useState(false);

  // New Lead Form State
  const [newName, setNewName] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newArea, setNewArea] = useState('');
  const [newPackage, setNewPackage] = useState('Home Ultra 40 Mbps');
  const [newOwner, setNewOwner] = useState('Tariq Sales (Direct)');

  const rawLeads = useMemo(() => data?.leads ?? [], [data?.leads]);

  // Aggregate Sales CRM Metrics
  const totalPipelineBdt = useMemo(
    () => rawLeads.reduce((s, l) => s + (l.estimatedMonthlyBdt ?? 1000), 0),
    [rawLeads]
  );
  const wonCount = useMemo(() => rawLeads.filter((l) => l.stage === 'won').length, [rawLeads]);
  const activePipelineCount = useMemo(
    () => rawLeads.filter((l) => l.stage !== 'won' && l.stage !== 'lost').length,
    [rawLeads]
  );
  const conversionRate = rawLeads.length ? Math.round((wonCount / rawLeads.length) * 100) : 0;

  const filteredLeads = useMemo(() => {
    return rawLeads.filter((lead) => {
      if (search) {
        const q = search.toLowerCase().trim();
        const match =
          lead.name.toLowerCase().includes(q) ||
          (lead.organization && lead.organization.toLowerCase().includes(q)) ||
          lead.phone.toLowerCase().includes(q) ||
          lead.area.toLowerCase().includes(q) ||
          lead.packageInterest.toLowerCase().includes(q) ||
          lead.owner.toLowerCase().includes(q);
        if (!match) return false;
      }

      if (stageFilter !== 'all' && lead.stage !== stageFilter) {
        return false;
      }

      return true;
    });
  }, [rawLeads, search, stageFilter]);

  const handleStageChange = (leadId: string, newStage: LeadRow['stage']) => {
    toast.success(`Lead moved to ${newStage.toUpperCase()} stage!`);
    if (selectedLead && selectedLead.id === leadId) {
      setSelectedLead({ ...selectedLead, stage: newStage });
    }
  };

  const handleCreateLead = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newPhone.trim()) {
      toast.error('Please enter name and phone number');
      return;
    }
    toast.success(`Sales lead "${newName}" added to CRM pipeline!`);
    setIsAddLeadOpen(false);
    setNewName('');
    setNewPhone('');
    setNewArea('');
  };

  const handleConvertToSubscriber = (lead: LeadRow) => {
    toast.success(`Converted ${lead.name} to active subscriber! Work order dispatched.`);
    setSelectedLead(null);
  };

  if (isLoading) return <PageSkeleton variant="table" rows={6} />;
  if (isError || !data) {
    return (
      <EmptyState
        title="Failed to load sales leads"
        description="Could not query CRM pipeline database."
        actionLabel="Retry"
        onAction={() => refetch()}
      />
    );
  }

  return (
    <div className="space-y-6 w-full pb-20">
      {/* Header */}
      <PageHeader
        title="Sales Leads CRM & Conversion Pipeline"
        subtitle="Track broadband sales inquiries, schedule physical fiber line surveys, and convert prospects to active subscribers."
        breadcrumb={[
          { label: 'Admin', url: '/admin/dashboard' },
          { label: 'CRM' },
          { label: 'Leads' },
        ]}
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                refetch();
                toast.success('Leads CRM pipeline refreshed');
              }}
              className="text-xs h-8 border-border/80 hover:bg-accent"
            >
              <RefreshCw className="mr-1.5 h-3.5 w-3.5 text-muted-foreground" /> Sync Pipeline
            </Button>

            <Button
              size="sm"
              onClick={() => setIsAddLeadOpen(true)}
              className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-xs h-8 gap-1.5 shadow-sm"
            >
              <Plus className="h-3.5 w-3.5" /> Add Sales Lead
            </Button>
          </div>
        }
      />

      {/* KPI Ribbon */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Active Pipeline MRR */}
        <Card className="p-4 border-border/60 bg-card/80 backdrop-blur-sm shadow-sm relative overflow-hidden group hover:border-primary/40 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Pipeline MRR Value
            </span>
            <div className="p-2 rounded-lg bg-primary/10 text-primary">
              <DollarSign className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-2xl font-bold tracking-tight text-foreground tabular-nums">
              ৳ {totalPipelineBdt.toLocaleString()}
            </span>
            <span className="text-xs text-muted-foreground">/ month</span>
          </div>
          <div className="mt-2 flex items-center justify-between text-[11px] text-muted-foreground">
            <span>{activePipelineCount} active opportunities</span>
          </div>
        </Card>

        {/* Won Conversions */}
        <Card className="p-4 border-border/60 bg-card/80 backdrop-blur-sm shadow-sm relative overflow-hidden group hover:border-emerald-500/40 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Converted (Won)
            </span>
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-500">
              <CheckCircle2 className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-2xl font-bold tracking-tight text-emerald-600 dark:text-emerald-400 tabular-nums">
              {wonCount}
            </span>
            <span className="text-xs text-muted-foreground">subscribers</span>
          </div>
          <div className="mt-2 flex items-center justify-between text-[11px] text-muted-foreground">
            <span className="text-emerald-500 font-semibold">{conversionRate}% win rate</span>
          </div>
        </Card>

        {/* Feasibility Survey */}
        <Card className="p-4 border-border/60 bg-card/80 backdrop-blur-sm shadow-sm relative overflow-hidden group hover:border-amber-500/40 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Surveys in Progress
            </span>
            <div className="p-2 rounded-lg bg-amber-500/10 text-amber-500">
              <Zap className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-2xl font-bold tracking-tight text-amber-500 tabular-nums">
              {rawLeads.filter((l) => l.stage === 'survey').length}
            </span>
            <span className="text-xs text-muted-foreground">line surveys</span>
          </div>
          <div className="mt-2 flex items-center justify-between text-[11px] text-muted-foreground">
            <span>Checking DP optical ports</span>
          </div>
        </Card>

        {/* Total Inbound Leads */}
        <Card className="p-4 border-border/60 bg-card/80 backdrop-blur-sm shadow-sm relative overflow-hidden group hover:border-sky-500/40 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Total Inquiries
            </span>
            <div className="p-2 rounded-lg bg-sky-500/10 text-sky-500">
              <Target className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-2xl font-bold tracking-tight text-sky-600 dark:text-sky-400 tabular-nums">
              {rawLeads.length}
            </span>
            <span className="text-xs text-muted-foreground">leads logged</span>
          </div>
          <div className="mt-2 flex items-center justify-between text-[11px] text-muted-foreground">
            <span>Web, Field & Direct Calls</span>
          </div>
        </Card>
      </div>

      {/* Toolbar & Filter Card */}
      <Card className="border-border/70 shadow-2xs bg-card">
        <CardContent className="p-4 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
              <Input
                placeholder="Search leads by name, organization, phone, area, plan..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 pr-8 h-9 text-xs bg-background border-border/60 shadow-inner"
              />
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Stage Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 pt-1 no-scrollbar text-xs">
            <span className="text-muted-foreground text-[11px] font-semibold uppercase tracking-wider mr-1">
              Stage:
            </span>

            <Button
              variant={stageFilter === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setStageFilter('all')}
              className={cn(
                'h-7 text-xs px-2.5 rounded-full font-medium',
                stageFilter === 'all' ? 'bg-primary text-primary-foreground shadow-2xs' : 'border-border/70 hover:bg-accent'
              )}
            >
              All Leads ({rawLeads.length})
            </Button>

            <Button
              variant={stageFilter === 'new' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setStageFilter('new')}
              className={cn(
                'h-7 text-xs px-2.5 rounded-full font-medium',
                stageFilter === 'new' ? 'bg-primary text-primary-foreground shadow-2xs' : 'border-border/70 hover:bg-accent'
              )}
            >
              ✨ New Inquiries
            </Button>

            <Button
              variant={stageFilter === 'contacted' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setStageFilter('contacted')}
              className={cn(
                'h-7 text-xs px-2.5 rounded-full font-medium',
                stageFilter === 'contacted' ? 'bg-primary text-primary-foreground shadow-2xs' : 'border-border/70 hover:bg-accent'
              )}
            >
              📞 Contacted
            </Button>

            <Button
              variant={stageFilter === 'survey' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setStageFilter('survey')}
              className={cn(
                'h-7 text-xs px-2.5 rounded-full font-medium gap-1',
                stageFilter === 'survey'
                  ? 'bg-amber-600 text-white'
                  : 'text-amber-600 dark:text-amber-400 border-amber-500/30 hover:bg-amber-500/10'
              )}
            >
              <Zap className="h-3 w-3" /> Line Survey
            </Button>

            <Button
              variant={stageFilter === 'negotiation' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setStageFilter('negotiation')}
              className={cn(
                'h-7 text-xs px-2.5 rounded-full font-medium',
                stageFilter === 'negotiation' ? 'bg-primary text-primary-foreground shadow-2xs' : 'border-border/70 hover:bg-accent'
              )}
            >
              💼 Negotiation / SLA
            </Button>

            <Button
              variant={stageFilter === 'won' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setStageFilter('won')}
              className={cn(
                'h-7 text-xs px-2.5 rounded-full font-medium gap-1',
                stageFilter === 'won'
                  ? 'bg-emerald-600 text-white'
                  : 'text-emerald-600 dark:text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/10'
              )}
            >
              <CheckCircle2 className="h-3 w-3" /> Won ({wonCount})
            </Button>

            <Button
              variant={stageFilter === 'lost' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setStageFilter('lost')}
              className={cn(
                'h-7 text-xs px-2.5 rounded-full font-medium',
                stageFilter === 'lost' ? 'bg-primary text-primary-foreground shadow-2xs' : 'border-border/70 hover:bg-accent'
              )}
            >
              Lost
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Leads Table */}
      <Card className="border-border/70 shadow-sm bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-border/80 bg-muted/40 text-muted-foreground font-semibold text-[11px] uppercase tracking-wider">
                <th className="py-3 px-4">Lead & Organization</th>
                <th className="py-3 px-4">Contact Info</th>
                <th className="py-3 px-3">Location</th>
                <th className="py-3 px-4">Package Interest & Value</th>
                <th className="py-3 px-3">Feasibility</th>
                <th className="py-3 px-3">Stage</th>
                <th className="py-3 px-3">Sales Owner</th>
                <th className="py-3 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {filteredLeads.map((lead) => {
                const isWon = lead.stage === 'won';
                const isLost = lead.stage === 'lost';

                return (
                  <tr
                    key={lead.id}
                    onClick={() => setSelectedLead(lead)}
                    className={cn(
                      'hover:bg-muted/30 cursor-pointer transition-colors group',
                      isWon && 'bg-emerald-500/5'
                    )}
                  >
                    {/* Lead & Org */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-start gap-3">
                        <div className="h-8 w-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                          {lead.name.slice(0, 2).toUpperCase()}
                        </div>
                        <div className="flex flex-col min-w-0">
                          <span className="font-bold text-foreground text-sm truncate">
                            {lead.name}
                          </span>
                          {lead.organization && (
                            <span className="text-[11px] text-muted-foreground truncate">
                              {lead.organization}
                            </span>
                          )}
                          <span className="font-mono text-[10px] text-muted-foreground/70 mt-0.5">
                            {lead.leadNo ?? 'LD-2026-0400'}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Contact */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="flex flex-col">
                        <span className="font-mono text-xs font-semibold text-foreground">
                          {lead.phone}
                        </span>
                        {lead.email && (
                          <span className="text-[11px] text-muted-foreground mt-0.5 truncate max-w-[160px]">
                            {lead.email}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Location */}
                    <td className="py-3.5 px-3 whitespace-nowrap">
                      <div className="flex items-center gap-1.5 text-xs text-foreground font-medium">
                        <MapPin className="h-3 w-3 text-muted-foreground shrink-0" />
                        <span>{lead.area}</span>
                      </div>
                    </td>

                    {/* Package & Value */}
                    <td className="py-3.5 px-4">
                      <div className="flex flex-col">
                        <span className="font-semibold text-foreground text-xs truncate max-w-[200px]">
                          {lead.packageInterest}
                        </span>
                        <div className="flex items-center gap-2 text-[11px] text-muted-foreground mt-0.5">
                          <span className="font-mono font-bold text-primary">
                            ৳ {(lead.estimatedMonthlyBdt ?? 1000).toLocaleString()} / mo
                          </span>
                          {lead.otcQuoteBdt && (
                            <>
                              <span>·</span>
                              <span>OTC: ৳{lead.otcQuoteBdt.toLocaleString()}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Feasibility */}
                    <td className="py-3.5 px-3 whitespace-nowrap">
                      {lead.surveyFeasible ? (
                        <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 text-[10px]">
                          Fiber Feasible
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="bg-muted/60 text-muted-foreground border-border/80 text-[10px]">
                          Survey Pending
                        </Badge>
                      )}
                    </td>

                    {/* Stage */}
                    <td className="py-3.5 px-3 whitespace-nowrap">
                      <Badge
                        variant="outline"
                        className={cn(
                          'capitalize text-[10px] font-semibold px-2 py-0.5',
                          lead.stage === 'new' && 'bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/20',
                          lead.stage === 'contacted' && 'bg-violet-500/10 text-violet-600 dark:text-violet-400 border-violet-500/20',
                          lead.stage === 'survey' && 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
                          lead.stage === 'negotiation' && 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',
                          lead.stage === 'won' && 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 font-bold',
                          lead.stage === 'lost' && 'bg-zinc-500/10 text-zinc-500 border-zinc-500/20'
                        )}
                      >
                        {lead.stage}
                      </Badge>
                    </td>

                    {/* Sales Owner */}
                    <td className="py-3.5 px-3 whitespace-nowrap text-xs text-muted-foreground">
                      {lead.owner}
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-3 text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedLead(lead)}
                          className="h-8 px-2 text-xs font-medium text-primary hover:bg-primary/10 gap-1"
                        >
                          <Eye className="h-3.5 w-3.5" /> View
                        </Button>

                        <DropdownMenu>
                          <DropdownMenuTrigger className="h-8 w-8 inline-flex items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-accent focus-visible:outline-none">
                            <MoreVertical className="h-4 w-4" />
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-52 text-xs">
                            <DropdownMenuLabel>Sales Actions</DropdownMenuLabel>
                            <DropdownMenuItem onClick={() => handleStageChange(lead.id, 'survey')}>
                              <Zap className="mr-2 h-3.5 w-3.5 text-amber-500" />
                              Schedule Line Survey
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleStageChange(lead.id, 'won')}>
                              <CheckCircle2 className="mr-2 h-3.5 w-3.5 text-emerald-500" />
                              Mark as Won (Convert)
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => toast.info(`Initiating call to ${lead.phone}`)}>
                              <PhoneCall className="mr-2 h-3.5 w-3.5 text-sky-500" />
                              Call Prospect
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Lead Detail / Stage Mover Drawer */}
      <Sheet open={!!selectedLead} onOpenChange={(open) => !open && setSelectedLead(null)}>
        <SheetContent className="w-full sm:max-w-lg overflow-y-auto p-6 space-y-6">
          {selectedLead && (
            <>
              <SheetHeader>
                <div className="flex items-center justify-between">
                  <Badge
                    variant="outline"
                    className="text-[10px] font-semibold uppercase px-2 py-0.5 border-primary/30 text-primary"
                  >
                    Stage: {selectedLead.stage.toUpperCase()}
                  </Badge>
                  <span className="text-xs text-muted-foreground font-mono">
                    Last Contact: {selectedLead.lastContactedAt ?? 'Today'}
                  </span>
                </div>

                <SheetTitle className="text-xl font-bold text-foreground mt-2">
                  {selectedLead.name}
                </SheetTitle>
                <SheetDescription className="text-xs text-muted-foreground font-mono">
                  Lead No: {selectedLead.leadNo ?? 'LD-2026-0412'} · Owner: {selectedLead.owner}
                </SheetDescription>
              </SheetHeader>

              {/* Prospect Overview Card */}
              <Card className="p-4 border-border/80 bg-muted/20 space-y-2">
                <span className="text-[10px] font-bold uppercase text-muted-foreground tracking-wider">
                  Prospect Details
                </span>
                <div className="text-xs text-muted-foreground space-y-1">
                  <p>Organization: <strong className="text-foreground">{selectedLead.organization ?? 'Individual'}</strong></p>
                  <p>Phone: <strong className="font-mono text-foreground">{selectedLead.phone}</strong></p>
                  <p>Email: <strong className="text-foreground">{selectedLead.email ?? 'N/A'}</strong></p>
                  <p>Area / Location: <strong className="text-foreground">{selectedLead.address ?? selectedLead.area}</strong></p>
                </div>
              </Card>

              {/* Package & Quote Card */}
              <Card className="p-4 border-border/80 bg-card space-y-2">
                <span className="text-[10px] font-bold uppercase text-muted-foreground tracking-wider">
                  Commercial Proposal
                </span>
                <p className="text-sm font-bold text-foreground">{selectedLead.packageInterest}</p>
                <div className="flex justify-between text-xs pt-1 border-t border-border/60">
                  <span>Monthly Subscription Fee:</span>
                  <span className="font-bold font-mono text-primary">৳ {(selectedLead.estimatedMonthlyBdt ?? 1000).toLocaleString()} BDT</span>
                </div>
                {selectedLead.otcQuoteBdt && (
                  <div className="flex justify-between text-xs">
                    <span>One-Time Connection (OTC):</span>
                    <span className="font-bold font-mono text-foreground">৳ {selectedLead.otcQuoteBdt.toLocaleString()} BDT</span>
                  </div>
                )}
              </Card>

              {/* Notes */}
              {selectedLead.notes && (
                <Card className="p-4 border-border/80 bg-card space-y-1">
                  <span className="text-[10px] font-bold uppercase text-muted-foreground tracking-wider">
                    Sales Notes & Survey Report
                  </span>
                  <p className="text-xs text-foreground leading-relaxed">{selectedLead.notes}</p>
                </Card>
              )}

              {/* Move Stage / Convert Action Buttons */}
              <div className="space-y-2 pt-2">
                {selectedLead.stage !== 'won' && (
                  <Button
                    onClick={() => handleConvertToSubscriber(selectedLead)}
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs h-9 font-semibold gap-1.5 shadow-sm"
                  >
                    <UserPlus className="h-3.5 w-3.5" /> Convert to Active Subscriber & Dispatch Install
                  </Button>
                )}

                <div className="grid grid-cols-2 gap-2">
                  <Button
                    variant="outline"
                    onClick={() => handleStageChange(selectedLead.id, 'survey')}
                    className="text-xs h-9 border-border/80 hover:bg-accent gap-1.5"
                  >
                    <Zap className="h-3.5 w-3.5 text-amber-500" /> Move to Survey
                  </Button>

                  <Button
                    variant="outline"
                    onClick={() => handleStageChange(selectedLead.id, 'negotiation')}
                    className="text-xs h-9 border-border/80 hover:bg-accent gap-1.5"
                  >
                    <Briefcase className="h-3.5 w-3.5 text-sky-500" /> Move to Negotiation
                  </Button>
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>

      {/* Add Lead Modal / Sheet */}
      <Sheet open={isAddLeadOpen} onOpenChange={setIsAddLeadOpen}>
        <SheetContent className="w-full sm:max-w-md overflow-y-auto p-6 space-y-6">
          <SheetHeader>
            <SheetTitle className="text-xl font-bold text-foreground">Add New Sales Lead</SheetTitle>
            <SheetDescription className="text-xs text-muted-foreground">
              Capture a new prospective subscriber into the sales CRM pipeline.
            </SheetDescription>
          </SheetHeader>

          <form onSubmit={handleCreateLead} className="space-y-4 text-xs">
            <div className="space-y-1">
              <label className="font-semibold text-foreground">Lead / Contact Person Name *</label>
              <Input
                placeholder="e.g. Mahfuzur Rahman"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="h-9 text-xs"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-foreground">Contact Phone Number *</label>
              <Input
                placeholder="+880 1711-000000"
                value={newPhone}
                onChange={(e) => setNewPhone(e.target.value)}
                className="h-9 text-xs font-mono"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-foreground">Area / Coverage Location</label>
              <Input
                placeholder="e.g. Gulshan-2, Dhaka"
                value={newArea}
                onChange={(e) => setNewArea(e.target.value)}
                className="h-9 text-xs"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-foreground">Interested Package Plan</label>
              <Select value={newPackage} onValueChange={(v) => v && setNewPackage(v)}>
                <SelectTrigger className="h-9 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Home Basic 20 Mbps">Home Basic 20 Mbps (৳ 800)</SelectItem>
                  <SelectItem value="Home Ultra 40 Mbps">Home Ultra 40 Mbps (৳ 1,200)</SelectItem>
                  <SelectItem value="Home Turbo 50 Mbps">Home Turbo 50 Mbps (৳ 1,500)</SelectItem>
                  <SelectItem value="Corporate 100 Mbps">Corporate 100 Mbps (৳ 8,500)</SelectItem>
                  <SelectItem value="Corporate Dedicated 200 Mbps">Corporate Dedicated 200 Mbps (৳ 18,500)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-foreground">Assigned Sales Executive</label>
              <Select value={newOwner} onValueChange={(v) => v && setNewOwner(v)}>
                <SelectTrigger className="h-9 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Tariq Sales (Direct)">Tariq Sales (Direct)</SelectItem>
                  <SelectItem value="Nawaz Corporate Lead">Nawaz Corporate Lead</SelectItem>
                  <SelectItem value="Salma Sales Unit">Salma Sales Unit</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="pt-4 space-y-2">
              <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground text-xs h-9 font-semibold">
                Save & Add to CRM Pipeline
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsAddLeadOpen(false)}
                className="w-full text-xs h-9 border-border/80 hover:bg-accent"
              >
                Cancel
              </Button>
            </div>
          </form>
        </SheetContent>
      </Sheet>
    </div>
  );
}
