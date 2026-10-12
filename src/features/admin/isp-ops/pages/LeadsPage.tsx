'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Briefcase,
  CheckCircle2,
  DollarSign,
  Eye,
  MapPin,
  MoreVertical,
  Pencil,
  PhoneCall,
  Plus,
  RefreshCw,
  Search,
  Target,
  Trash2,
  UserPlus,
  X,
  XCircle,
  Zap,
} from 'lucide-react';
import { PageHeader } from '@/features/admin/shared/components/PageHeader';
import { PageSkeleton } from '@/components/shared/LoadingSkeleton';
import { EmptyState } from '@/components/shared/EmptyState';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { errorMessage } from '@/lib/api/utils/error-handler';
import { useDebouncedValue } from '@/features/admin/customers/hooks/use-debounced-value';
import { LEAD_STAGES, useDeleteLead, useLeads, useMoveLeadStage, useSaveLead, type Lead, type LeadStage } from '../hooks/use-leads';
import { useNetOpsOptions } from '../hooks/use-network-ops';
import { NetOpsPager, OptionSelect, fmtDateTime } from '../components/NetOpsControls';

const PAGE_SIZE = 20;
const taka = (v: number) => `৳ ${v.toLocaleString()}`;

const stageClass: Record<LeadStage, string> = {
  new: 'bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/20',
  contacted: 'bg-violet-500/10 text-violet-600 dark:text-violet-400 border-violet-500/20',
  survey: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
  negotiation: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',
  won: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 font-bold',
  lost: 'bg-zinc-500/10 text-zinc-500 border-zinc-500/20',
};

const stageLabel: Record<LeadStage, string> = {
  new: 'New',
  contacted: 'Contacted',
  survey: 'Line Survey',
  negotiation: 'Negotiation',
  won: 'Won',
  lost: 'Lost',
};

interface LeadForm {
  name: string;
  phone: string;
  email: string;
  company: string;
  area: string;
  address: string;
  packageId: string;
  ownerId: string;
  otcQuote: string;
  notes: string;
}

const emptyForm: LeadForm = { name: '', phone: '', email: '', company: '', area: '', address: '', packageId: '', ownerId: '', otcQuote: '', notes: '' };

const formFrom = (l: Lead): LeadForm => ({
  name: l.name,
  phone: l.phone ?? '',
  email: l.email ?? '',
  company: l.company ?? '',
  area: l.area ?? '',
  address: l.address ?? '',
  packageId: l.packageId ?? '',
  ownerId: l.ownerId ?? '',
  otcQuote: l.otcQuote === null ? '' : String(l.otcQuote),
  notes: l.notes ?? '',
});

export function LeadsPage() {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState('');
  const search = useDebouncedValue(searchInput.trim(), 350);
  const [stageFilter, setStageFilter] = useState<LeadStage | ''>('');
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [editing, setEditing] = useState<Lead | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [form, setForm] = useState<LeadForm>(emptyForm);
  const [deleteTarget, setDeleteTarget] = useState<Lead | null>(null);

  const { data, isLoading, isError, error, refetch, isFetching } = useLeads({ page, pageSize: PAGE_SIZE, search, stage: stageFilter });
  const options = useNetOpsOptions(formOpen);
  const saveLead = useSaveLead();
  const moveStage = useMoveLeadStage();
  const deleteLead = useDeleteLead();

  const leads = data?.items ?? [];
  const summary = data?.summary;
  const winRate = summary && summary.total > 0 ? Math.round((summary.byStage.won / summary.total) * 100) : 0;
  const areaOptions = (options.data?.areas ?? []).map((a) => ({ value: a.label, label: a.label }));
  const packageOptions = (options.data?.packages ?? []).map((p) => ({
    value: p.value,
    label: p.price === null ? p.label : `${p.label} (${taka(p.price)})`,
  }));

  const set = (patch: Partial<LeadForm>) => setForm((f) => ({ ...f, ...patch }));

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setFormOpen(true);
  };

  const openEdit = (lead: Lead) => {
    setEditing(lead);
    setForm(formFrom(lead));
    setFormOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    saveLead.mutate(
      {
        id: editing?.id,
        body: {
          name: form.name,
          phone: form.phone,
          email: form.email || null,
          company: form.company || null,
          area: form.area || null,
          address: form.address || null,
          package_id: form.packageId || null,
          owner_id: form.ownerId || null,
          otc_quote: form.otcQuote === '' ? null : form.otcQuote,
          notes: form.notes || null,
        },
      },
      {
        onSuccess: (lead) => {
          setFormOpen(false);
          if (selectedLead?.id === lead.id) setSelectedLead(lead);
        },
      },
    );
  };

  const handleStage = (lead: Lead, stage: LeadStage, surveyFeasible?: boolean) =>
    moveStage.mutate({ id: lead.id, stage, surveyFeasible }, { onSuccess: (l) => selectedLead?.id === l.id && setSelectedLead(l) });

  /** Opens the new-customer form prefilled with the lead's contact details. */
  const handleConvert = (lead: Lead) => {
    const params = new URLSearchParams({ lead_id: lead.id, name: lead.name });
    if (lead.phone) params.set('phone', lead.phone);
    if (lead.email) params.set('email', lead.email);
    if (lead.address ?? lead.area) params.set('address', (lead.address ?? lead.area) as string);
    if (lead.packageId) params.set('package_id', lead.packageId);
    router.push(`/admin/customers/new?${params.toString()}`);
  };

  if (isLoading && !data) return <PageSkeleton variant="table" rows={6} />;
  if (isError && !data) {
    return <EmptyState title="Failed to load sales leads" description={errorMessage(error)} actionLabel="Retry" onAction={() => refetch()} />;
  }

  return (
    <div className="space-y-6 w-full pb-20">
      <PageHeader
        title="Sales Leads CRM & Conversion Pipeline"
        subtitle="Track broadband sales inquiries, line surveys and conversions to subscribers."
        breadcrumb={[{ label: 'Admin', url: '/admin/dashboard' }, { label: 'CRM' }, { label: 'Leads' }]}
        actions={
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => refetch()} disabled={isFetching} className="text-xs h-8 border-border/80 hover:bg-accent">
              <RefreshCw className={cn('mr-1.5 h-3.5 w-3.5 text-muted-foreground', isFetching && 'animate-spin')} /> Refresh
            </Button>
            <Button size="sm" onClick={openCreate} className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-xs h-8 gap-1.5 shadow-sm">
              <Plus className="h-3.5 w-3.5" /> Add Sales Lead
            </Button>
          </div>
        }
      />

      {/* KPI Ribbon */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4 border-border/60 bg-card/80 backdrop-blur-sm shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Pipeline Monthly Value</span>
            <div className="p-2 rounded-lg bg-primary/10 text-primary">
              <DollarSign className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-2xl font-bold tracking-tight text-foreground tabular-nums">{taka(summary?.pipelineMonthlyValue ?? 0)}</span>
            <span className="text-xs text-muted-foreground">/ month</span>
          </div>
          <div className="mt-2 text-[11px] text-muted-foreground">Open leads with a package selected</div>
        </Card>

        <Card className="p-4 border-border/60 bg-card/80 backdrop-blur-sm shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Converted (Won)</span>
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-500">
              <CheckCircle2 className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-2xl font-bold tracking-tight text-emerald-600 dark:text-emerald-400 tabular-nums">{summary?.byStage.won ?? 0}</span>
            <span className="text-xs text-muted-foreground">leads</span>
          </div>
          <div className="mt-2 text-[11px] text-emerald-500 font-semibold">{winRate}% win rate</div>
        </Card>

        <Card className="p-4 border-border/60 bg-card/80 backdrop-blur-sm shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Surveys in Progress</span>
            <div className="p-2 rounded-lg bg-amber-500/10 text-amber-500">
              <Zap className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-2xl font-bold tracking-tight text-amber-500 tabular-nums">{summary?.byStage.survey ?? 0}</span>
            <span className="text-xs text-muted-foreground">line surveys</span>
          </div>
        </Card>

        <Card className="p-4 border-border/60 bg-card/80 backdrop-blur-sm shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Total Inquiries</span>
            <div className="p-2 rounded-lg bg-sky-500/10 text-sky-500">
              <Target className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-2xl font-bold tracking-tight text-sky-600 dark:text-sky-400 tabular-nums">{summary?.total ?? 0}</span>
            <span className="text-xs text-muted-foreground">leads logged</span>
          </div>
        </Card>
      </div>

      {/* Toolbar */}
      <Card className="border-border/70 shadow-2xs bg-card">
        <CardContent className="p-4 space-y-3">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            <Input
              placeholder="Search leads by name, organization, phone, email, area..."
              value={searchInput}
              onChange={(e) => {
                setSearchInput(e.target.value);
                setPage(1);
              }}
              className="pl-9 pr-8 h-9 text-xs bg-background border-border/60 shadow-inner"
            />
            {searchInput && (
              <button
                type="button"
                onClick={() => {
                  setSearchInput('');
                  setPage(1);
                }}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 pt-1 no-scrollbar text-xs">
            <span className="text-muted-foreground text-[11px] font-semibold uppercase tracking-wider mr-1">Stage:</span>
            {(['', ...LEAD_STAGES] as const).map((s) => (
              <Button
                key={s || 'all'}
                variant={stageFilter === s ? 'default' : 'outline'}
                size="sm"
                onClick={() => {
                  setStageFilter(s);
                  setPage(1);
                }}
                className={cn(
                  'h-7 text-xs px-2.5 rounded-full font-medium',
                  stageFilter === s ? 'bg-primary text-primary-foreground shadow-2xs' : 'border-border/70 hover:bg-accent',
                )}
              >
                {s ? `${stageLabel[s]} (${summary?.byStage[s] ?? 0})` : `All Leads (${summary?.total ?? 0})`}
              </Button>
            ))}
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
              {leads.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-muted-foreground">
                    <p className="text-sm font-medium">{search || stageFilter ? 'No leads match these filters' : 'No leads yet'}</p>
                  </td>
                </tr>
              ) : (
                leads.map((lead) => (
                  <tr
                    key={lead.id}
                    onClick={() => setSelectedLead(lead)}
                    className={cn('hover:bg-muted/30 cursor-pointer transition-colors group', lead.stage === 'won' && 'bg-emerald-500/5')}
                  >
                    <td className="py-3.5 px-4">
                      <div className="flex items-start gap-3">
                        <div className="h-8 w-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                          {lead.name.slice(0, 2).toUpperCase()}
                        </div>
                        <div className="flex flex-col min-w-0">
                          <span className="font-bold text-foreground text-sm truncate">{lead.name}</span>
                          {lead.company && <span className="text-[11px] text-muted-foreground truncate">{lead.company}</span>}
                          <span className="font-mono text-[10px] text-muted-foreground/70 mt-0.5">{lead.leadNo}</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="flex flex-col">
                        <span className="font-mono text-xs font-semibold text-foreground">{lead.phone ?? '—'}</span>
                        {lead.email && <span className="text-[11px] text-muted-foreground mt-0.5 truncate max-w-[160px]">{lead.email}</span>}
                      </div>
                    </td>
                    <td className="py-3.5 px-3 whitespace-nowrap">
                      <div className="flex items-center gap-1.5 text-xs text-foreground font-medium">
                        <MapPin className="h-3 w-3 text-muted-foreground shrink-0" />
                        <span>{lead.area ?? '—'}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex flex-col">
                        <span className="font-semibold text-foreground text-xs truncate max-w-[200px]">{lead.packageName ?? '—'}</span>
                        <div className="flex items-center gap-2 text-[11px] text-muted-foreground mt-0.5">
                          {lead.monthlyValue !== null && <span className="font-mono font-bold text-primary">{taka(lead.monthlyValue)} / mo</span>}
                          {lead.otcQuote !== null && <span>OTC: {taka(lead.otcQuote)}</span>}
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-3 whitespace-nowrap">
                      {lead.surveyFeasible === null ? (
                        <Badge variant="outline" className="bg-muted/60 text-muted-foreground border-border/80 text-[10px]">
                          Survey Pending
                        </Badge>
                      ) : lead.surveyFeasible ? (
                        <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 text-[10px]">
                          Feasible
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20 text-[10px]">
                          Not Feasible
                        </Badge>
                      )}
                    </td>
                    <td className="py-3.5 px-3 whitespace-nowrap">
                      <Badge variant="outline" className={cn('capitalize text-[10px] font-semibold px-2 py-0.5', stageClass[lead.stage])}>
                        {stageLabel[lead.stage]}
                      </Badge>
                    </td>
                    <td className="py-3.5 px-3 whitespace-nowrap text-xs text-muted-foreground">{lead.ownerName ?? 'Unassigned'}</td>
                    <td className="py-3.5 px-3 text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1">
                        <Button variant="ghost" size="sm" onClick={() => setSelectedLead(lead)} className="h-8 px-2 text-xs font-medium text-primary hover:bg-primary/10 gap-1">
                          <Eye className="h-3.5 w-3.5" /> View
                        </Button>
                        <DropdownMenu>
                          <DropdownMenuTrigger className="h-8 w-8 inline-flex items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-accent focus-visible:outline-none">
                            <MoreVertical className="h-4 w-4" />
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-52 text-xs">
                            <DropdownMenuLabel>Move to stage</DropdownMenuLabel>
                            {LEAD_STAGES.filter((s) => s !== lead.stage).map((s) => (
                              <DropdownMenuItem key={s} disabled={moveStage.isPending} onClick={() => handleStage(lead, s)}>
                                {stageLabel[s]}
                              </DropdownMenuItem>
                            ))}
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => openEdit(lead)}>
                              <Pencil className="mr-2 h-3.5 w-3.5" /> Edit lead
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setDeleteTarget(lead)} className="text-destructive">
                              <Trash2 className="mr-2 h-3.5 w-3.5" /> Delete lead
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <NetOpsPager page={page} totalPages={data?.meta.totalPages ?? 1} total={data?.meta.total ?? 0} onPageChange={setPage} label="leads" />
      </Card>

      {/* Lead detail drawer */}
      <Sheet open={!!selectedLead} onOpenChange={(open) => !open && setSelectedLead(null)}>
        <SheetContent className="w-full sm:max-w-lg overflow-y-auto p-6 space-y-6">
          {selectedLead && (
            <>
              <SheetHeader>
                <div className="flex items-center justify-between">
                  <Badge variant="outline" className={cn('text-[10px] font-semibold uppercase px-2 py-0.5', stageClass[selectedLead.stage])}>
                    Stage: {stageLabel[selectedLead.stage]}
                  </Badge>
                  <span className="text-xs text-muted-foreground font-mono">Last contact: {fmtDateTime(selectedLead.lastContactedAt)}</span>
                </div>
                <SheetTitle className="text-xl font-bold text-foreground mt-2">{selectedLead.name}</SheetTitle>
                <SheetDescription className="text-xs text-muted-foreground font-mono">
                  {selectedLead.leadNo} · Owner: {selectedLead.ownerName ?? 'Unassigned'} · Source: {selectedLead.source ?? '—'}
                </SheetDescription>
              </SheetHeader>

              <Card className="p-4 border-border/80 bg-muted/20 space-y-2">
                <span className="text-[10px] font-bold uppercase text-muted-foreground tracking-wider">Prospect Details</span>
                <div className="text-xs text-muted-foreground space-y-1">
                  <p>Organization: <strong className="text-foreground">{selectedLead.company ?? '—'}</strong></p>
                  <p>Phone: <strong className="font-mono text-foreground">{selectedLead.phone ?? '—'}</strong></p>
                  <p>Email: <strong className="text-foreground">{selectedLead.email ?? '—'}</strong></p>
                  <p>Area / Location: <strong className="text-foreground">{selectedLead.address ?? selectedLead.area ?? '—'}</strong></p>
                  <p>Created: <strong className="text-foreground">{fmtDateTime(selectedLead.createdAt)}</strong></p>
                </div>
              </Card>

              <Card className="p-4 border-border/80 bg-card space-y-2">
                <span className="text-[10px] font-bold uppercase text-muted-foreground tracking-wider">Commercial Proposal</span>
                <p className="text-sm font-bold text-foreground">{selectedLead.packageName ?? 'No package selected'}</p>
                {selectedLead.monthlyValue !== null && (
                  <div className="flex justify-between text-xs pt-1 border-t border-border/60">
                    <span>Monthly fee:</span>
                    <span className="font-bold font-mono text-primary">{taka(selectedLead.monthlyValue)}</span>
                  </div>
                )}
                {selectedLead.otcQuote !== null && (
                  <div className="flex justify-between text-xs">
                    <span>One-time connection (OTC):</span>
                    <span className="font-bold font-mono text-foreground">{taka(selectedLead.otcQuote)}</span>
                  </div>
                )}
              </Card>

              {(selectedLead.notes || selectedLead.message) && (
                <Card className="p-4 border-border/80 bg-card space-y-2">
                  <span className="text-[10px] font-bold uppercase text-muted-foreground tracking-wider">Notes</span>
                  {selectedLead.message && <p className="text-xs text-muted-foreground leading-relaxed">Inquiry: {selectedLead.message}</p>}
                  {selectedLead.notes && <p className="text-xs text-foreground leading-relaxed">{selectedLead.notes}</p>}
                </Card>
              )}

              <div className="space-y-2 pt-2">
                {selectedLead.stage !== 'won' && (
                  <Button onClick={() => handleConvert(selectedLead)} className="w-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs h-9 font-semibold gap-1.5 shadow-sm">
                    <UserPlus className="h-3.5 w-3.5" /> Convert — open new customer form
                  </Button>
                )}
                <div className="grid grid-cols-2 gap-2">
                  <Button variant="outline" disabled={moveStage.isPending} onClick={() => handleStage(selectedLead, 'survey', true)} className="text-xs h-9 border-border/80 hover:bg-accent gap-1.5">
                    <Zap className="h-3.5 w-3.5 text-amber-500" /> Survey: feasible
                  </Button>
                  <Button variant="outline" disabled={moveStage.isPending} onClick={() => handleStage(selectedLead, 'negotiation')} className="text-xs h-9 border-border/80 hover:bg-accent gap-1.5">
                    <Briefcase className="h-3.5 w-3.5 text-sky-500" /> Move to Negotiation
                  </Button>
                  <Button variant="outline" disabled={moveStage.isPending} onClick={() => handleStage(selectedLead, 'won')} className="text-xs h-9 border-border/80 hover:bg-accent gap-1.5">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" /> Mark Won
                  </Button>
                  <Button variant="outline" disabled={moveStage.isPending} onClick={() => handleStage(selectedLead, 'lost')} className="text-xs h-9 border-border/80 hover:bg-accent gap-1.5">
                    <XCircle className="h-3.5 w-3.5 text-zinc-500" /> Mark Lost
                  </Button>
                </div>
                {selectedLead.phone && (
                  <a
                    href={`tel:${selectedLead.phone}`}
                    className="flex h-9 w-full items-center justify-center gap-1.5 rounded-lg border border-border/80 text-xs font-medium hover:bg-accent"
                  >
                    <PhoneCall className="h-3.5 w-3.5 text-sky-500" /> Call {selectedLead.phone}
                  </a>
                )}
                <Button variant="ghost" onClick={() => openEdit(selectedLead)} className="w-full text-xs h-9 gap-1.5">
                  <Pencil className="h-3.5 w-3.5" /> Edit lead
                </Button>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>

      {/* Add / edit lead */}
      <Sheet open={formOpen} onOpenChange={setFormOpen}>
        <SheetContent className="w-full sm:max-w-md overflow-y-auto p-6 space-y-6">
          <SheetHeader>
            <SheetTitle className="text-xl font-bold text-foreground">{editing ? 'Edit Sales Lead' : 'Add New Sales Lead'}</SheetTitle>
            <SheetDescription className="text-xs text-muted-foreground">Capture a prospective subscriber into the sales pipeline.</SheetDescription>
          </SheetHeader>

          <form onSubmit={handleSave} className="space-y-4 text-xs">
            <div className="space-y-1">
              <label className="font-semibold text-foreground" htmlFor="lead-name">Lead / Contact Person Name *</label>
              <Input id="lead-name" value={form.name} onChange={(e) => set({ name: e.target.value })} className="h-9 text-xs" required />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="font-semibold text-foreground" htmlFor="lead-phone">Phone *</label>
                <Input id="lead-phone" value={form.phone} onChange={(e) => set({ phone: e.target.value })} className="h-9 text-xs font-mono" required />
              </div>
              <div className="space-y-1">
                <label className="font-semibold text-foreground" htmlFor="lead-email">Email</label>
                <Input id="lead-email" type="email" value={form.email} onChange={(e) => set({ email: e.target.value })} className="h-9 text-xs" />
              </div>
            </div>
            <div className="space-y-1">
              <label className="font-semibold text-foreground" htmlFor="lead-company">Organization</label>
              <Input id="lead-company" value={form.company} onChange={(e) => set({ company: e.target.value })} className="h-9 text-xs" />
            </div>
            <div className="space-y-1">
              <label className="font-semibold text-foreground" htmlFor="lead-area">Area</label>
              <OptionSelect id="lead-area" value={form.area} onChange={(v) => set({ area: v })} options={areaOptions} placeholder="Select area" noneLabel="No area" />
            </div>
            <div className="space-y-1">
              <label className="font-semibold text-foreground" htmlFor="lead-address">Address</label>
              <Input id="lead-address" value={form.address} onChange={(e) => set({ address: e.target.value })} className="h-9 text-xs" />
            </div>
            <div className="space-y-1">
              <label className="font-semibold text-foreground" htmlFor="lead-package">Interested Package</label>
              <OptionSelect id="lead-package" value={form.packageId} onChange={(v) => set({ packageId: v })} options={packageOptions} placeholder="Select package" noneLabel="Not decided" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="font-semibold text-foreground" htmlFor="lead-owner">Sales Owner</label>
                <OptionSelect id="lead-owner" value={form.ownerId} onChange={(v) => set({ ownerId: v })} options={options.data?.employees ?? []} placeholder="Select employee" noneLabel="Unassigned" />
              </div>
              <div className="space-y-1">
                <label className="font-semibold text-foreground" htmlFor="lead-otc">OTC Quote (৳)</label>
                <Input id="lead-otc" type="number" min={0} step="0.01" value={form.otcQuote} onChange={(e) => set({ otcQuote: e.target.value })} className="h-9 text-xs" />
              </div>
            </div>
            <div className="space-y-1">
              <label className="font-semibold text-foreground" htmlFor="lead-notes">Notes</label>
              <Textarea id="lead-notes" value={form.notes} onChange={(e) => set({ notes: e.target.value })} className="text-xs" rows={3} />
            </div>
            <div className="pt-4 space-y-2">
              <Button type="submit" disabled={saveLead.isPending} className="w-full bg-primary hover:bg-primary/90 text-primary-foreground text-xs h-9 font-semibold">
                {saveLead.isPending ? 'Saving…' : editing ? 'Save Changes' : 'Add to Pipeline'}
              </Button>
              <Button type="button" variant="outline" onClick={() => setFormOpen(false)} className="w-full text-xs h-9 border-border/80 hover:bg-accent">
                Cancel
              </Button>
            </div>
          </form>
        </SheetContent>
      </Sheet>

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Delete lead"
        description={`Delete "${deleteTarget?.name ?? ''}" from the pipeline? This cannot be undone.`}
        confirmLabel="Delete"
        destructive
        onConfirm={() => {
          if (deleteTarget) {
            deleteLead.mutate(deleteTarget.id, { onSuccess: () => selectedLead?.id === deleteTarget.id && setSelectedLead(null) });
          }
          setDeleteTarget(null);
        }}
      />
    </div>
  );
}
