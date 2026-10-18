'use client';

import { useCallback, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { LegacyColumnDef } from '@tanstack/react-table/legacy';
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
  Target,
  Trash2,
  UserPlus,
  XCircle,
  Zap,
} from 'lucide-react';
import { PageHeader } from '@/features/admin/shared/components/PageHeader';
import { PageSkeleton } from '@/components/shared/LoadingSkeleton';
import { EmptyState } from '@/components/shared/EmptyState';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { DataTable } from '@/features/shared/data-table';
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
import { useUrlParam } from '@/hooks/use-url-state';
import type { Tone } from '@/components/shared/status-tones';
import { LEAD_STAGES, leadStageLabel, useDeleteLead, useLeads, useMoveLeadStage, useSaveLead, type Lead, type LeadStage } from '../hooks/use-leads';
import { useNetOpsOptions } from '../hooks/use-network-ops';
import { useServerTable } from '../hooks/use-server-table';
import { OptionSelect, fmtDateTime } from '../components/NetOpsControls';

import { formatCount } from '@/lib/format';
import { useTranslations } from '@/i18n/locale-context';
const taka = (v: number) => `৳ ${formatCount(v)}`;

const stageTone: Record<LeadStage, Tone> = {
  new: 'info',
  contacted: 'info',
  survey: 'warning',
  negotiation: 'info',
  won: 'success',
  lost: 'neutral',
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
  const t = useTranslations();
  const router = useRouter();
  const table = useServerTable();
  const { search } = table;
  const [stageParam, setStageParam] = useUrlParam('stage');
  const stageFilter: LeadStage | '' = LEAD_STAGES.find((s) => s === stageParam) ?? '';
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [editing, setEditing] = useState<Lead | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [form, setForm] = useState<LeadForm>(emptyForm);
  const [deleteTarget, setDeleteTarget] = useState<Lead | null>(null);

  const { data, isLoading, isError, error, refetch, isFetching } = useLeads({ page: table.page, pageSize: table.pageSize, search, stage: stageFilter });
  const options = useNetOpsOptions(formOpen);
  const saveLead = useSaveLead();
  const moveStage = useMoveLeadStage();
  const deleteLead = useDeleteLead();

  const leads = useMemo(() => data?.items ?? [], [data?.items]);
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

  const openEdit = useCallback((lead: Lead) => {
    setEditing(lead);
    setForm(formFrom(lead));
    setFormOpen(true);
  }, []);

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

  const moveStageMutate = moveStage.mutate;
  const moveStagePending = moveStage.isPending;
  const selectedLeadId = selectedLead?.id;
  const handleStage = useCallback(
    (lead: Lead, stage: LeadStage, surveyFeasible?: boolean) =>
      moveStageMutate({ id: lead.id, stage, surveyFeasible }, { onSuccess: (l) => selectedLeadId === l.id && setSelectedLead(l) }),
    [moveStageMutate, selectedLeadId],
  );

  /** Opens the new-customer form prefilled with the lead's contact details. */
  const handleConvert = (lead: Lead) => {
    const params = new URLSearchParams({ lead_id: lead.id, name: lead.name });
    if (lead.phone) params.set('phone', lead.phone);
    if (lead.email) params.set('email', lead.email);
    if (lead.address ?? lead.area) params.set('address', (lead.address ?? lead.area) as string);
    if (lead.packageId) params.set('package_id', lead.packageId);
    router.push(`/admin/customers/new?${params.toString()}`);
  };

  const columns = useMemo<LegacyColumnDef<Lead, unknown>[]>(
    () => [
      {
        accessorKey: 'name',
        header: t('admin.ops.leads.colLead', 'Lead & Organization'),
        enableHiding: false,
        meta: { mobile: 'title' },
        cell: ({ row }) => {
          const lead = row.original;
          return (
            <div className="flex items-start gap-3">
              <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-xs font-bold text-primary">
                {lead.name.slice(0, 2).toUpperCase()}
              </div>
              <div className="flex min-w-0 flex-col">
                <button
                  type="button"
                  onClick={() => setSelectedLead(lead)}
                  className="truncate text-left text-sm font-bold text-foreground hover:text-primary hover:underline"
                >
                  {lead.name}
                </button>
                {lead.company && <span className="truncate text-xs font-normal text-muted-foreground">{lead.company}</span>}
                <span className="mt-0.5 font-mono text-xs font-normal text-muted-foreground/70">{lead.leadNo}</span>
              </div>
            </div>
          );
        },
      },
      {
        id: 'contact',
        header: t('admin.ops.leads.colContact', 'Contact Info'),
        accessorFn: (l) => l.phone ?? '',
        cell: ({ row }) => (
          <div className="flex flex-col">
            <span className="font-mono text-xs font-semibold text-foreground">{row.original.phone ?? '—'}</span>
            {row.original.email && <span className="mt-0.5 max-w-[160px] truncate text-xs text-muted-foreground">{row.original.email}</span>}
          </div>
        ),
      },
      {
        id: 'location',
        header: t('admin.ops.leads.colLocation', 'Location'),
        accessorFn: (l) => l.area ?? '',
        cell: ({ row }) => (
          <div className="flex items-center gap-1.5 text-xs font-medium text-foreground">
            <MapPin className="h-3 w-3 shrink-0 text-muted-foreground" aria-hidden />
            <span>{row.original.area ?? '—'}</span>
          </div>
        ),
      },
      {
        id: 'package',
        header: t('admin.ops.leads.colPackage', 'Package Interest & Value'),
        accessorFn: (l) => l.packageName ?? '',
        cell: ({ row }) => {
          const lead = row.original;
          return (
            <div className="flex flex-col">
              <span className="max-w-[200px] truncate text-xs font-semibold text-foreground">{lead.packageName ?? '—'}</span>
              <div className="mt-0.5 flex flex-wrap items-center gap-x-2 text-xs text-muted-foreground">
                {lead.monthlyValue !== null && <span className="font-mono font-bold text-primary">{taka(lead.monthlyValue)} {t('admin.ops.leads.perMonthShort', '/ mo')}</span>}
                {lead.otcQuote !== null && <span>OTC: {taka(lead.otcQuote)}</span>}
              </div>
            </div>
          );
        },
      },
      {
        id: 'feasibility',
        header: t('admin.ops.leads.colFeasibility', 'Feasibility'),
        enableSorting: false,
        cell: ({ row }) =>
          row.original.surveyFeasible === null ? (
            <Badge variant="outline" tone="neutral">
              {t('admin.ops.leads.surveyPending', 'Survey Pending')}
            </Badge>
          ) : row.original.surveyFeasible ? (
            <Badge variant="outline" tone="success">
              {t('admin.ops.leads.feasible', 'Feasible')}
            </Badge>
          ) : (
            <Badge variant="outline" tone="danger">
              {t('admin.ops.leads.notFeasible', 'Not Feasible')}
            </Badge>
          ),
      },
      {
        accessorKey: 'stage',
        header: t('admin.ops.leads.colStage', 'Stage'),
        meta: { mobile: 'status' },
        cell: ({ row }) => <StatusBadge status={row.original.stage} tone={stageTone[row.original.stage]} label={leadStageLabel(t, row.original.stage)} />,
      },
      {
        id: 'owner',
        header: t('admin.ops.leads.colOwner', 'Sales Owner'),
        accessorFn: (l) => l.ownerName ?? '',
        cell: ({ row }) => <span className="text-xs text-muted-foreground">{row.original.ownerName ?? t('admin.ops.leads.unassigned', 'Unassigned')}</span>,
      },
      {
        id: 'actions',
        header: () => <span className="sr-only">{t('common.actions', 'Actions')}</span>,
        enableSorting: false,
        enableHiding: false,
        cell: ({ row }) => {
          const lead = row.original;
          return (
            <div className="flex items-center justify-end gap-1">
              <Button variant="ghost" size="sm" onClick={() => setSelectedLead(lead)} className="h-8 gap-1 px-2 text-xs font-medium text-primary hover:bg-primary/10">
                <Eye className="h-3.5 w-3.5" /> {t('admin.ops.leads.view', 'View')}
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger
                  aria-label={t('admin.ops.leads.moreActions', 'More actions')}
                  className="inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:bg-accent hover:text-foreground focus-visible:outline-none"
                >
                  <MoreVertical className="h-4 w-4" />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-52 text-xs">
                  <DropdownMenuLabel>{t('admin.ops.leads.moveToStage', 'Move to stage')}</DropdownMenuLabel>
                  {LEAD_STAGES.filter((s) => s !== lead.stage).map((s) => (
                    <DropdownMenuItem key={s} disabled={moveStagePending} onClick={() => handleStage(lead, s)}>
                      {leadStageLabel(t, s)}
                    </DropdownMenuItem>
                  ))}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => openEdit(lead)}>
                    <Pencil className="mr-2 h-3.5 w-3.5" /> {t('admin.ops.leads.editLead', 'Edit lead')}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setDeleteTarget(lead)} className="text-destructive">
                    <Trash2 className="mr-2 h-3.5 w-3.5" /> {t('admin.ops.leads.deleteLead', 'Delete lead')}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          );
        },
      },
    ],
    [handleStage, openEdit, moveStagePending, t],
  );

  if (isLoading && !data) return <PageSkeleton variant="table" rows={6} />;
  if (isError && !data) {
    return (
      <EmptyState
        variant="error"
        title={t('admin.ops.leads.loadFailed', 'Failed to load sales leads')}
        description={errorMessage(error)}
        actionLabel={t('admin.customers.list.retry', 'Retry')}
        onAction={() => refetch()}
      />
    );
  }

  return (
    <div className="space-y-6 w-full pb-20">
      <PageHeader
        title={t('admin.ops.leads.title', 'Sales Leads CRM & Conversion Pipeline')}
        subtitle={t('admin.ops.leads.subtitle', 'Track broadband sales inquiries, line surveys and conversions to subscribers.')}
        breadcrumb={[
          { label: t('common.crumb.admin', 'Admin'), url: '/admin/dashboard' },
          { label: t('admin.ops.leads.crumbCrm', 'CRM') },
          { label: t('common.crumb.leads', 'Leads') },
        ]}
        actions={
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => refetch()} disabled={isFetching} className="text-xs h-8 border-border/80 hover:bg-accent">
              <RefreshCw className={cn('mr-1.5 h-3.5 w-3.5 text-muted-foreground', isFetching && 'animate-spin')} /> {t('admin.ops.leads.refresh', 'Refresh')}
            </Button>
            <Button size="sm" onClick={openCreate} className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-xs h-8 gap-1.5 shadow-sm">
              <Plus className="h-3.5 w-3.5" /> {t('admin.ops.leads.addLead', 'Add Sales Lead')}
            </Button>
          </div>
        }
      />

      {/* KPI Ribbon */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4 border-border/60 bg-card/80 backdrop-blur-sm shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{t('admin.ops.leads.kpiPipeline', 'Pipeline Monthly Value')}</span>
            <div className="p-2 rounded-lg bg-primary/10 text-primary">
              <DollarSign className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-2xl font-bold tracking-tight text-foreground tabular-nums">{taka(summary?.pipelineMonthlyValue ?? 0)}</span>
            <span className="text-xs text-muted-foreground">{t('admin.ops.leads.perMonth', '/ month')}</span>
          </div>
          <div className="mt-2 text-xs text-muted-foreground">{t('admin.ops.leads.kpiPipelineHint', 'Open leads with a package selected')}</div>
        </Card>

        <Card className="p-4 border-border/60 bg-card/80 backdrop-blur-sm shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{t('admin.ops.leads.kpiWon', 'Converted (Won)')}</span>
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-500">
              <CheckCircle2 className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-2xl font-bold tracking-tight text-emerald-600 dark:text-emerald-400 tabular-nums">{summary?.byStage.won ?? 0}</span>
            <span className="text-xs text-muted-foreground">{t('admin.ops.leads.leadsUnit', 'leads')}</span>
          </div>
          <div className="mt-2 text-xs text-emerald-500 font-semibold">{t('admin.ops.leads.winRate', '{n}% win rate', { n: winRate })}</div>
        </Card>

        <Card className="p-4 border-border/60 bg-card/80 backdrop-blur-sm shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{t('admin.ops.leads.kpiSurveys', 'Surveys in Progress')}</span>
            <div className="p-2 rounded-lg bg-amber-500/10 text-amber-500">
              <Zap className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-2xl font-bold tracking-tight text-amber-500 tabular-nums">{summary?.byStage.survey ?? 0}</span>
            <span className="text-xs text-muted-foreground">{t('admin.ops.leads.lineSurveys', 'line surveys')}</span>
          </div>
        </Card>

        <Card className="p-4 border-border/60 bg-card/80 backdrop-blur-sm shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{t('admin.ops.leads.kpiInquiries', 'Total Inquiries')}</span>
            <div className="p-2 rounded-lg bg-sky-500/10 text-sky-500">
              <Target className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-2xl font-bold tracking-tight text-sky-600 dark:text-sky-400 tabular-nums">{summary?.total ?? 0}</span>
            <span className="text-xs text-muted-foreground">{t('admin.ops.leads.leadsLogged', 'leads logged')}</span>
          </div>
        </Card>
      </div>

      <Card className="border-border/70 bg-card shadow-2xs">
        <CardContent className="p-3">
          <div className="no-scrollbar flex items-center gap-1.5 overflow-x-auto py-1 text-xs">
            <span className="mr-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">{t('admin.ops.leads.stageLabel', 'Stage:')}</span>
            {(['', ...LEAD_STAGES] as const).map((s) => (
              <Button
                key={s || 'all'}
                variant={stageFilter === s ? 'default' : 'outline'}
                size="sm"
                onClick={() => {
                  setStageParam(s);
                  table.setPage(1);
                }}
                className={cn(
                  'h-7 shrink-0 rounded-full px-2.5 text-xs font-medium',
                  stageFilter === s ? 'bg-primary text-primary-foreground shadow-2xs' : 'border-border/70 hover:bg-accent',
                )}
              >
                {s
                  ? `${leadStageLabel(t, s)} (${summary?.byStage[s] ?? 0})`
                  : t('admin.ops.leads.allLeads', 'All Leads ({n})', { n: summary?.total ?? 0 })}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      <DataTable
        urlState
        className={cn(isFetching && 'opacity-80')}
        columns={columns}
        data={leads}
        getRowId={(r) => r.id}
        searchPlaceholder={t('admin.ops.leads.search', 'Search leads by name, organization, phone, email, area...')}
        emptyTitle={search || stageFilter ? t('admin.ops.leads.emptyFiltered', 'No leads match these filters') : t('admin.ops.leads.emptyNone', 'No leads yet')}
        server={table.server(data?.meta.total ?? 0)}
      />

      {/* Lead detail drawer */}
      <Sheet open={!!selectedLead} onOpenChange={(open) => !open && setSelectedLead(null)}>
        <SheetContent className="w-full sm:max-w-lg overflow-y-auto p-6 space-y-6">
          {selectedLead && (
            <>
              <SheetHeader>
                <div className="flex items-center justify-between">
                  <Badge variant="outline" tone={stageTone[selectedLead.stage]} className="text-xs font-semibold uppercase px-2 py-0.5">
                    {t('admin.ops.leads.stageValue', 'Stage: {stage}', { stage: leadStageLabel(t, selectedLead.stage) })}
                  </Badge>
                  <span className="text-xs text-muted-foreground font-mono">{t('admin.ops.leads.lastContact', 'Last contact: {when}', { when: fmtDateTime(selectedLead.lastContactedAt) })}</span>
                </div>
                <SheetTitle className="text-xl font-bold text-foreground mt-2">{selectedLead.name}</SheetTitle>
                <SheetDescription className="text-xs text-muted-foreground font-mono">
                  {selectedLead.leadNo} · {t('admin.ops.leads.owner', 'Owner:')} {selectedLead.ownerName ?? t('admin.ops.leads.unassigned', 'Unassigned')} · {t('admin.ops.leads.source', 'Source:')} {selectedLead.source ?? '—'}
                </SheetDescription>
              </SheetHeader>

              <Card className="p-4 border-border/80 bg-muted/20 space-y-2">
                <span className="text-xs font-bold uppercase text-muted-foreground tracking-wider">{t('admin.ops.leads.prospect', 'Prospect Details')}</span>
                <div className="text-xs text-muted-foreground space-y-1">
                  <p>{t('admin.ops.leads.organization', 'Organization:')} <strong className="text-foreground">{selectedLead.company ?? '—'}</strong></p>
                  <p>{t('admin.ops.leads.phone', 'Phone:')} <strong className="font-mono text-foreground">{selectedLead.phone ?? '—'}</strong></p>
                  <p>{t('admin.ops.leads.email', 'Email:')} <strong className="text-foreground">{selectedLead.email ?? '—'}</strong></p>
                  <p>{t('admin.ops.leads.areaLocation', 'Area / Location:')} <strong className="text-foreground">{selectedLead.address ?? selectedLead.area ?? '—'}</strong></p>
                  <p>{t('admin.ops.leads.created', 'Created:')} <strong className="text-foreground">{fmtDateTime(selectedLead.createdAt)}</strong></p>
                </div>
              </Card>

              <Card className="p-4 border-border/80 bg-card space-y-2">
                <span className="text-xs font-bold uppercase text-muted-foreground tracking-wider">{t('admin.ops.leads.proposal', 'Commercial Proposal')}</span>
                <p className="text-sm font-bold text-foreground">{selectedLead.packageName ?? t('admin.ops.leads.noPackage', 'No package selected')}</p>
                {selectedLead.monthlyValue !== null && (
                  <div className="flex justify-between text-xs pt-1 border-t border-border/60">
                    <span>{t('admin.ops.leads.monthlyFee', 'Monthly fee:')}</span>
                    <span className="font-bold font-mono text-primary">{taka(selectedLead.monthlyValue)}</span>
                  </div>
                )}
                {selectedLead.otcQuote !== null && (
                  <div className="flex justify-between text-xs">
                    <span>{t('admin.ops.leads.otcFee', 'One-time connection (OTC):')}</span>
                    <span className="font-bold font-mono text-foreground">{taka(selectedLead.otcQuote)}</span>
                  </div>
                )}
              </Card>

              {(selectedLead.notes || selectedLead.message) && (
                <Card className="p-4 border-border/80 bg-card space-y-2">
                  <span className="text-xs font-bold uppercase text-muted-foreground tracking-wider">{t('admin.ops.leads.notes', 'Notes')}</span>
                  {selectedLead.message && <p className="text-xs text-muted-foreground leading-relaxed">{t('admin.ops.leads.inquiry', 'Inquiry:')} {selectedLead.message}</p>}
                  {selectedLead.notes && <p className="text-xs text-foreground leading-relaxed">{selectedLead.notes}</p>}
                </Card>
              )}

              <div className="space-y-2 pt-2">
                {selectedLead.stage !== 'won' && (
                  <Button onClick={() => handleConvert(selectedLead)} className="w-full bg-emerald-700 hover:bg-emerald-800 text-white text-xs h-9 font-semibold gap-1.5 shadow-sm">
                    <UserPlus className="h-3.5 w-3.5" /> {t('admin.ops.leads.convert', 'Convert — open new customer form')}
                  </Button>
                )}
                <div className="grid grid-cols-2 gap-2">
                  <Button variant="outline" disabled={moveStage.isPending} onClick={() => handleStage(selectedLead, 'survey', true)} className="text-xs h-9 border-border/80 hover:bg-accent gap-1.5">
                    <Zap className="h-3.5 w-3.5 text-amber-500" /> {t('admin.ops.leads.surveyFeasible', 'Survey: feasible')}
                  </Button>
                  <Button variant="outline" disabled={moveStage.isPending} onClick={() => handleStage(selectedLead, 'negotiation')} className="text-xs h-9 border-border/80 hover:bg-accent gap-1.5">
                    <Briefcase className="h-3.5 w-3.5 text-sky-500" /> {t('admin.ops.leads.moveNegotiation', 'Move to Negotiation')}
                  </Button>
                  <Button variant="outline" disabled={moveStage.isPending} onClick={() => handleStage(selectedLead, 'won')} className="text-xs h-9 border-border/80 hover:bg-accent gap-1.5">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" /> {t('admin.ops.leads.markWon', 'Mark Won')}
                  </Button>
                  <Button variant="outline" disabled={moveStage.isPending} onClick={() => handleStage(selectedLead, 'lost')} className="text-xs h-9 border-border/80 hover:bg-accent gap-1.5">
                    <XCircle className="h-3.5 w-3.5 text-zinc-500" /> {t('admin.ops.leads.markLost', 'Mark Lost')}
                  </Button>
                </div>
                {selectedLead.phone && (
                  <a
                    href={`tel:${selectedLead.phone}`}
                    className="flex h-9 w-full items-center justify-center gap-1.5 rounded-lg border border-border/80 text-xs font-medium hover:bg-accent"
                  >
                    <PhoneCall className="h-3.5 w-3.5 text-sky-500" /> {t('admin.ops.leads.call', 'Call {phone}', { phone: selectedLead.phone })}
                  </a>
                )}
                <Button variant="ghost" onClick={() => openEdit(selectedLead)} className="w-full text-xs h-9 gap-1.5">
                  <Pencil className="h-3.5 w-3.5" /> {t('admin.ops.leads.editLead', 'Edit lead')}
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
            <SheetTitle className="text-xl font-bold text-foreground">{editing ? t('admin.ops.leads.formEditTitle', 'Edit Sales Lead') : t('admin.ops.leads.formNewTitle', 'Add New Sales Lead')}</SheetTitle>
            <SheetDescription className="text-xs text-muted-foreground">
              {t('admin.ops.leads.formDesc', 'Capture a prospective subscriber into the sales pipeline.')}
            </SheetDescription>
          </SheetHeader>

          <form onSubmit={handleSave} className="space-y-4 text-xs">
            <div className="space-y-1">
              <label className="font-semibold text-foreground" htmlFor="lead-name">{t('admin.ops.leads.fieldName', 'Lead / Contact Person Name *')}</label>
              <Input id="lead-name" value={form.name} onChange={(e) => set({ name: e.target.value })} className="h-9 text-xs" required />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="font-semibold text-foreground" htmlFor="lead-phone">{t('admin.ops.leads.fieldPhone', 'Phone *')}</label>
                <Input id="lead-phone" value={form.phone} onChange={(e) => set({ phone: e.target.value })} className="h-9 text-xs font-mono" required />
              </div>
              <div className="space-y-1">
                <label className="font-semibold text-foreground" htmlFor="lead-email">{t('admin.ops.leads.fieldEmail', 'Email')}</label>
                <Input id="lead-email" type="email" value={form.email} onChange={(e) => set({ email: e.target.value })} className="h-9 text-xs" />
              </div>
            </div>
            <div className="space-y-1">
              <label className="font-semibold text-foreground" htmlFor="lead-company">{t('admin.ops.leads.fieldOrganization', 'Organization')}</label>
              <Input id="lead-company" value={form.company} onChange={(e) => set({ company: e.target.value })} className="h-9 text-xs" />
            </div>
            <div className="space-y-1">
              <label className="font-semibold text-foreground" htmlFor="lead-area">{t('admin.ops.leads.fieldArea', 'Area')}</label>
              <OptionSelect id="lead-area" value={form.area} onChange={(v) => set({ area: v })} options={areaOptions} placeholder={t('admin.ops.leads.selectArea', 'Select area')} noneLabel={t('admin.ops.leads.noArea', 'No area')} />
            </div>
            <div className="space-y-1">
              <label className="font-semibold text-foreground" htmlFor="lead-address">{t('admin.ops.leads.fieldAddress', 'Address')}</label>
              <Input id="lead-address" value={form.address} onChange={(e) => set({ address: e.target.value })} className="h-9 text-xs" />
            </div>
            <div className="space-y-1">
              <label className="font-semibold text-foreground" htmlFor="lead-package">{t('admin.ops.leads.fieldPackage', 'Interested Package')}</label>
              <OptionSelect id="lead-package" value={form.packageId} onChange={(v) => set({ packageId: v })} options={packageOptions} placeholder={t('admin.ops.leads.selectPackage', 'Select package')} noneLabel={t('admin.ops.leads.notDecided', 'Not decided')} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="font-semibold text-foreground" htmlFor="lead-owner">{t('admin.ops.leads.colOwner', 'Sales Owner')}</label>
                <OptionSelect id="lead-owner" value={form.ownerId} onChange={(v) => set({ ownerId: v })} options={options.data?.employees ?? []} placeholder={t('admin.ops.leads.selectEmployee', 'Select employee')} noneLabel={t('admin.ops.leads.unassigned', 'Unassigned')} />
              </div>
              <div className="space-y-1">
                <label className="font-semibold text-foreground" htmlFor="lead-otc">{t('admin.ops.leads.fieldOtc', 'OTC Quote (৳)')}</label>
                <Input id="lead-otc" type="number" min={0} step="0.01" value={form.otcQuote} onChange={(e) => set({ otcQuote: e.target.value })} className="h-9 text-xs" />
              </div>
            </div>
            <div className="space-y-1">
              <label className="font-semibold text-foreground" htmlFor="lead-notes">{t('admin.ops.leads.notes', 'Notes')}</label>
              <Textarea id="lead-notes" value={form.notes} onChange={(e) => set({ notes: e.target.value })} className="text-xs" rows={3} />
            </div>
            <div className="pt-4 space-y-2">
              <Button type="submit" disabled={saveLead.isPending} className="w-full bg-primary hover:bg-primary/90 text-primary-foreground text-xs h-9 font-semibold">
                {saveLead.isPending
                  ? t('admin.ops.leads.saving', 'Saving…')
                  : editing
                    ? t('admin.ops.leads.saveChanges', 'Save Changes')
                    : t('admin.ops.leads.addToPipeline', 'Add to Pipeline')}
              </Button>
              <Button type="button" variant="outline" onClick={() => setFormOpen(false)} className="w-full text-xs h-9 border-border/80 hover:bg-accent">
                {t('common.cancel', 'Cancel')}
              </Button>
            </div>
          </form>
        </SheetContent>
      </Sheet>

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title={t('admin.ops.leads.deleteTitle', 'Delete lead')}
        description={t('admin.ops.leads.deleteDesc', 'Delete "{name}" from the pipeline? This cannot be undone.', { name: deleteTarget?.name ?? '' })}
        confirmLabel={t('common.delete', 'Delete')}
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
