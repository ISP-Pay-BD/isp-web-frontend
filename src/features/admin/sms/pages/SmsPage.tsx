'use client';

import { useMemo, useRef, useState } from 'react';
import type { LegacyColumnDef } from '@tanstack/react-table/legacy';
import { PageHeader } from '@/features/admin/shared';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import {
  Send,
  MessageSquare,
  Users,
  CheckCircle2,
  Sparkles,
  Radio,
  Clock,
  Search,
  RefreshCw,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  Layers,
} from 'lucide-react';
import { PageSkeleton } from '@/components/shared/LoadingSkeleton';
import { EmptyState } from '@/components/shared/EmptyState';
import { OpsSummaryStrip } from '@/components/shared/OpsSummaryStrip';
import { DataTable } from '@/features/shared/data-table';
import { formatDateTime } from '@/lib/format';
import {
  useMessageBatches,
  useRefreshGateway,
  useSendSms,
  useSmsLogs,
  useSmsOverview,
  useSmsPreview,
  useSmsRecipients,
} from '../hooks/use-sms';
import { useDebouncedValue } from '../hooks/use-debounced-value';
import { smsParts, type SmsLogRow, type SmsRecipient } from '../types';

const RECIPIENT_PAGE_SIZE = 20;

const statusBadge = (status: SmsLogRow['status']) =>
  status === 'sent' ? ('default' as const) : status === 'pending' ? ('secondary' as const) : ('destructive' as const);

export function SmsPage() {
  const overview = useSmsOverview();
  const refreshGateway = useRefreshGateway();
  const sendSms = useSendSms();

  const [selectedArea, setSelectedArea] = useState<string>('all');
  const [targetType, setTargetType] = useState<'all' | 'specific'>('all');
  const [selected, setSelected] = useState<Record<string, SmsRecipient>>({});
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('');
  const [smsContent, setSmsContent] = useState<string>('');
  const [customerSearch, setCustomerSearch] = useState<string>('');
  const [recipientPage, setRecipientPage] = useState(1);
  const [selectedLog, setSelectedLog] = useState<SmsLogRow | null>(null);
  const [historyPage, setHistoryPage] = useState(1);
  const [historyPageSize, setHistoryPageSize] = useState(10);
  const [historySearch, setHistorySearch] = useState('');
  const [historyStatus, setHistoryStatus] = useState('all');

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const debouncedSearch = useDebouncedValue(customerSearch);
  const debouncedContent = useDebouncedValue(smsContent);

  const recipients = useSmsRecipients({
    page: recipientPage,
    pageSize: RECIPIENT_PAGE_SIZE,
    search: debouncedSearch,
    areaId: selectedArea,
  });
  const batches = useMessageBatches('sms');
  const logs = useSmsLogs({ page: historyPage, pageSize: historyPageSize, search: historySearch, status: historyStatus });

  const selectedIds = useMemo(() => Object.keys(selected), [selected]);
  const previewIds = targetType === 'specific' ? selectedIds.slice(0, 6) : [];
  const previewEnabled = targetType === 'all' || previewIds.length > 0;
  const preview = useSmsPreview(previewEnabled ? debouncedContent : '', previewIds, selectedArea);

  const areas = recipients.data?.areas ?? [];
  const templates = recipients.data?.templates ?? [];
  const pageCustomers = recipients.data?.items ?? [];
  const recipientMeta = recipients.data?.meta;
  const audienceTotal = recipients.data?.audienceTotal ?? 0;
  const variables = overview.data?.variables ?? [];
  const gateway = overview.data?.gateway;

  const targetCount = targetType === 'all' ? audienceTotal : selectedIds.length;
  const partsCount = smsParts(smsContent);

  const handleTemplateChange = (tplId: string) => {
    setSelectedTemplateId(tplId);
    const tpl = templates.find((t) => t.id === tplId);
    if (tpl) setSmsContent(tpl.content);
  };

  const insertVariable = (tag: string) => {
    const textarea = textareaRef.current;
    if (!textarea) {
      setSmsContent((prev) => `${prev}${prev ? ' ' : ''}${tag}`);
      return;
    }
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    setSmsContent((current) => current.substring(0, start) + tag + current.substring(end));
    requestAnimationFrame(() => {
      textarea.focus();
      textarea.setSelectionRange(start + tag.length, start + tag.length);
    });
  };

  const toggleCustomer = (cust: SmsRecipient, checked: boolean) => {
    setSelected((prev) => {
      const next = { ...prev };
      if (checked) next[cust.id] = cust;
      else delete next[cust.id];
      return next;
    });
  };

  const selectPage = () =>
    setSelected((prev) => {
      const next = { ...prev };
      pageCustomers.forEach((c) => {
        next[c.id] = c;
      });
      return next;
    });

  const handleSend = () => {
    if (!smsContent.trim()) {
      toast.error('SMS content cannot be empty');
      return;
    }
    if (targetCount === 0) {
      toast.error('Please select at least one recipient customer');
      return;
    }
    sendSms.mutate(
      { content: smsContent, sendTo: targetType === 'all' ? ['all'] : selectedIds, areaId: selectedArea },
      {
        onSuccess: (res) => {
          toast.success(
            res.queued
              ? `${res.count} SMS queued for delivery — progress is shown under Delivery Batches`
              : 'SMS sent successfully',
          );
          setSelected({});
        },
      },
    );
  };

  const historyColumns = useMemo<LegacyColumnDef<SmsLogRow, unknown>[]>(
    () => [
      {
        accessorKey: 'sentTo',
        header: 'Recipient',
        size: 200,
        enableHiding: false,
        cell: ({ row }) => <span className="font-semibold text-xs text-foreground">{row.original.sentTo || '—'}</span>,
      },
      {
        accessorKey: 'content',
        header: 'Message',
        size: 360,
        cell: ({ row }) => (
          <span className="text-xs text-muted-foreground font-mono line-clamp-2 max-w-md">{row.original.content}</span>
        ),
      },
      {
        accessorKey: 'status',
        header: 'Status',
        size: 100,
        cell: ({ row }) => (
          <Badge variant={statusBadge(row.original.status)} className="text-[10px] h-5 capitalize">
            {row.original.status}
          </Badge>
        ),
      },
      {
        accessorKey: 'sentAt',
        header: 'Sent',
        size: 160,
        cell: ({ row }) => (
          <span className="text-xs font-mono text-muted-foreground">
            {row.original.sentAt ? formatDateTime(row.original.sentAt) : '—'}
          </span>
        ),
      },
      {
        id: 'actions',
        header: () => <span className="sr-only">Details</span>,
        size: 80,
        enableSorting: false,
        enableHiding: false,
        cell: ({ row }) => (
          <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => setSelectedLog(row.original)}>
            Details
          </Button>
        ),
      },
    ],
    [],
  );

  if (recipients.isLoading && overview.isLoading) return <PageSkeleton variant="form" />;
  if (recipients.isError && !recipients.data) {
    return (
      <EmptyState
        title="Failed to load SMS data"
        description="Could not fetch customers, areas and templates."
        actionLabel="Retry"
        onAction={() => recipients.refetch()}
      />
    );
  }

  const deliveryRate = overview.data?.last30.deliveryRate;
  const gatewayOnline = gateway?.status === 'online';

  return (
    <div className="space-y-6">
      <PageHeader
        title="Personalized SMS Broadcast"
        subtitle="Compose and broadcast personalized SMS alerts to broadband subscribers via SMS gateway"
        breadcrumb={[
          { label: 'Dashboard', url: '/admin/dashboard' },
          { label: 'Communications' },
          { label: 'SMS Broadcast' },
        ]}
        actions={
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5"
            disabled={refreshGateway.isPending}
            onClick={() =>
              refreshGateway.mutate(undefined, {
                onSuccess: (data) =>
                  data.gateway.status === 'online'
                    ? toast.success(`${data.gateway.name ?? 'Gateway'} is online`)
                    : toast.error(data.gateway.message ?? 'Gateway is not reachable'),
              })
            }
          >
            <RefreshCw className={`h-4 w-4 ${refreshGateway.isPending ? 'animate-spin' : 'text-emerald-500'}`} />
            Check Gateway
          </Button>
        }
      />

      <OpsSummaryStrip
        items={[
          { label: 'Gateway', value: gateway?.name ?? 'Not configured' },
          { label: 'Credit Balance', value: gateway?.balance ?? '—' },
          { label: 'Sent Today', value: overview.data ? `${overview.data.today.sent} SMS` : '—' },
          { label: 'Failed Today', value: overview.data ? overview.data.today.failed : '—' },
          { label: 'Delivery Rate (30d)', value: deliveryRate === null || deliveryRate === undefined ? '—' : `${deliveryRate}%` },
          { label: 'Target Audience', value: `${targetCount} Subscribers` },
        ]}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Form & Previews */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="border-border/60 shadow-sm">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <MessageSquare className="h-5 w-5 text-primary" />
                    Compose SMS Broadcast
                  </CardTitle>
                  <CardDescription className="mt-1">
                    Select target service area, audience segment, and dynamic template placeholders
                  </CardDescription>
                </div>
                <Badge variant="outline" className="font-mono text-xs px-2.5 py-1">
                  GSM 03.38 / Unicode
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Target Service Area
                  </Label>
                  <Select
                    value={selectedArea}
                    onValueChange={(v) => {
                      if (v) {
                        setSelectedArea(v);
                        setRecipientPage(1);
                      }
                    }}
                  >
                    <SelectTrigger className="h-10">
                      <SelectValue placeholder="All Areas" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">
                        All Service Areas ({areas.reduce((s, a) => s + a.activeCustomers, 0)} active)
                      </SelectItem>
                      {areas.map((a) => (
                        <SelectItem key={a.id} value={a.id}>
                          {a.name} ({a.activeCustomers} active)
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Load Predefined Template
                  </Label>
                  <Select value={selectedTemplateId} onValueChange={(v) => { if (v) handleTemplateChange(v); }}>
                    <SelectTrigger className="h-10">
                      <SelectValue placeholder={templates.length ? 'Select template...' : 'No templates yet'} />
                    </SelectTrigger>
                    <SelectContent>
                      {templates.map((t) => (
                        <SelectItem key={t.id} value={t.id}>
                          {t.title} ({t.templateType === 'default' ? 'system' : 'custom'})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Recipient Target Mode */}
              <div className="space-y-3 pt-1">
                <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Audience Scope
                </Label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setTargetType('all')}
                    className={`flex items-start gap-3 p-3.5 rounded-lg border text-left transition ${
                      targetType === 'all'
                        ? 'border-primary/80 bg-primary/5 ring-1 ring-primary/40'
                        : 'border-border/60 hover:bg-muted/40'
                    }`}
                  >
                    <div className="mt-0.5">
                      <Radio className={`h-4 w-4 ${targetType === 'all' ? 'text-primary' : 'text-muted-foreground'}`} />
                    </div>
                    <div>
                      <div className="font-semibold text-sm">All Active Subscribers</div>
                      <div className="text-xs text-muted-foreground mt-0.5">
                        Broadcasts to {audienceTotal} active subscriber(s) in the selected area
                      </div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setTargetType('specific')}
                    className={`flex items-start gap-3 p-3.5 rounded-lg border text-left transition ${
                      targetType === 'specific'
                        ? 'border-primary/80 bg-primary/5 ring-1 ring-primary/40'
                        : 'border-border/60 hover:bg-muted/40'
                    }`}
                  >
                    <div className="mt-0.5">
                      <Users className={`h-4 w-4 ${targetType === 'specific' ? 'text-primary' : 'text-muted-foreground'}`} />
                    </div>
                    <div>
                      <div className="font-semibold text-sm">Specific Customer List</div>
                      <div className="text-xs text-muted-foreground mt-0.5">
                        Select specific customers manually ({selectedIds.length} chosen)
                      </div>
                    </div>
                  </button>
                </div>

                {targetType === 'specific' && (
                  <div className="border border-border/70 rounded-xl p-4 space-y-3 bg-muted/20">
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2">
                      <div className="relative flex-1">
                        <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                          placeholder="Search customer by name or phone..."
                          value={customerSearch}
                          onChange={(e) => {
                            setCustomerSearch(e.target.value);
                            setRecipientPage(1);
                          }}
                          className="pl-9 h-9 text-xs bg-background"
                        />
                      </div>
                      <div className="flex items-center gap-2 text-xs">
                        <Button type="button" variant="outline" size="sm" onClick={selectPage} className="h-8 text-xs">
                          Select Page ({pageCustomers.length})
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelected({})}
                          className="h-8 text-xs text-muted-foreground"
                        >
                          Clear
                        </Button>
                      </div>
                    </div>

                    <div className="max-h-48 overflow-y-auto space-y-1.5 pr-1 divide-y divide-border/40">
                      {recipients.isFetching && pageCustomers.length === 0 ? (
                        <div className="text-center py-4 text-xs text-muted-foreground">Loading subscribers…</div>
                      ) : pageCustomers.length === 0 ? (
                        <div className="text-center py-4 text-xs text-muted-foreground">
                          No matching subscribers found in selected scope.
                        </div>
                      ) : (
                        pageCustomers.map((cust) => (
                          <label
                            key={cust.id}
                            className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50 cursor-pointer text-xs transition-colors"
                          >
                            <div className="flex items-center gap-3">
                              <input
                                type="checkbox"
                                checked={Boolean(selected[cust.id])}
                                onChange={(e) => toggleCustomer(cust, e.target.checked)}
                                className="accent-primary rounded h-4 w-4"
                              />
                              <div>
                                <span className="font-semibold text-foreground">{cust.name}</span>
                                <span className="text-muted-foreground font-mono ml-2">({cust.mobile || 'no mobile'})</span>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              {cust.packageName && (
                                <Badge variant="secondary" className="text-[10px] font-mono">
                                  {cust.packageName}
                                </Badge>
                              )}
                              <span className="text-muted-foreground text-[11px] hidden sm:inline">{cust.areaName}</span>
                            </div>
                          </label>
                        ))
                      )}
                    </div>
                    {recipientMeta && recipientMeta.totalPages > 1 && (
                      <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                        <span>
                          Page {recipientMeta.page} of {recipientMeta.totalPages} · {recipientMeta.total} customers
                        </span>
                        <div className="flex gap-1">
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7"
                            disabled={recipientPage <= 1}
                            onClick={() => setRecipientPage((p) => Math.max(1, p - 1))}
                          >
                            <ChevronLeft className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7"
                            disabled={recipientPage >= recipientMeta.totalPages}
                            onClick={() => setRecipientPage((p) => p + 1)}
                          >
                            <ChevronRight className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Message Content */}
              <div className="space-y-2 pt-1">
                <div className="flex items-center justify-between">
                  <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    SMS Message Template
                  </Label>
                  <div className="flex items-center gap-2 text-xs font-mono">
                    <span className={partsCount > 1 ? 'text-amber-500 font-semibold' : 'text-muted-foreground'}>
                      {smsContent.length} chars
                    </span>
                    <span className="text-muted-foreground">·</span>
                    <Badge variant={partsCount > 1 ? 'outline' : 'secondary'} className="text-[10px] h-5">
                      {partsCount} part{partsCount === 1 ? '' : 's'}
                    </Badge>
                  </div>
                </div>

                <Textarea
                  ref={textareaRef}
                  value={smsContent}
                  onChange={(e) => setSmsContent(e.target.value)}
                  placeholder="Dear {name}, your monthly bill of {amount} is due on {expire_date}..."
                  className="min-h-[110px] font-mono text-xs leading-relaxed resize-y bg-background/80"
                  maxLength={1000}
                />

                {variables.length > 0 && (
                  <div className="space-y-1.5 pt-1">
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Sparkles className="h-3.5 w-3.5 text-primary" />
                      <span>Click variable chip to insert — resolved per customer on the server:</span>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {variables.map((v) => (
                        <button
                          key={v.tag}
                          type="button"
                          onClick={() => insertVariable(v.tag)}
                          className="text-xs px-2.5 py-1 rounded-md bg-secondary/80 hover:bg-secondary text-secondary-foreground font-mono border border-border/40 transition-colors flex items-center gap-1"
                          title={v.label}
                        >
                          <span>{v.tag}</span>
                          <span className="text-[10px] opacity-60 font-sans">({v.label})</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Server-rendered preview */}
              {smsContent.trim() && previewEnabled && (
                <div className="pt-3 border-t border-border/60 space-y-3">
                  <div className="flex items-center gap-2 text-sm font-semibold">
                    <span>Personalized Live Preview</span>
                    <Badge variant="outline" className="text-xs">
                      {targetCount} Recipient{targetCount === 1 ? '' : 's'}
                    </Badge>
                    {preview.isFetching && <RefreshCw className="h-3.5 w-3.5 animate-spin text-muted-foreground" />}
                  </div>
                  <div className="max-h-60 overflow-y-auto space-y-2 p-3 rounded-xl border border-border/60 bg-muted/10">
                    {preview.isError ? (
                      <p className="text-xs text-destructive">Preview could not be rendered.</p>
                    ) : (preview.data ?? []).length === 0 ? (
                      <p className="text-xs text-muted-foreground">
                        {preview.isFetching ? 'Rendering preview…' : 'No active subscribers to preview in this scope.'}
                      </p>
                    ) : (
                      (preview.data ?? []).slice(0, 6).map((p) => (
                        <div key={p.customerId} className="p-3 rounded-lg border border-border/60 bg-card text-xs space-y-1.5 shadow-sm">
                          <div className="flex items-center gap-2 font-medium">
                            <span className="font-semibold text-foreground">{p.name}</span>
                            <span className="text-muted-foreground font-mono">({p.mobile})</span>
                          </div>
                          <p className="w-full bg-muted/40 border border-border/60 rounded px-2.5 py-1.5 font-mono text-xs text-foreground whitespace-pre-wrap">
                            {p.message}
                          </p>
                        </div>
                      ))
                    )}
                    {targetCount > 6 && (
                      <p className="text-center text-xs text-muted-foreground pt-1">
                        + {targetCount - 6} more subscribers will receive their own personalized SMS
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="pt-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-t border-border/60">
                <div className="text-xs text-muted-foreground">
                  Estimated usage:{' '}
                  <span className="font-semibold text-foreground font-mono">{targetCount * partsCount} SMS units</span>{' '}
                  ({targetCount} × {partsCount} part{partsCount === 1 ? '' : 's'})
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSmsContent('');
                      setSelectedTemplateId('');
                    }}
                    disabled={sendSms.isPending}
                  >
                    Clear Form
                  </Button>
                  <Button onClick={handleSend} disabled={sendSms.isPending} className="gap-2 bg-primary text-primary-foreground">
                    <Send className="h-4 w-4" />
                    {sendSms.isPending ? 'Dispatching...' : `Broadcast to ${targetCount} Recipient(s)`}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Col: Gateway Status & Batches */}
        <div className="space-y-6">
          <Card className="border-border/60 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Users className="h-4 w-4 text-primary" />
                Gateway Health & Credits
              </CardTitle>
              <CardDescription>Configured SMS gateway for this account</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-xs">
              {overview.isError ? (
                <EmptyState
                  title="Gateway status unavailable"
                  actionLabel="Retry"
                  onAction={() => overview.refetch()}
                  className="py-6"
                />
              ) : (
                <>
                  <div className="flex justify-between items-center py-1.5 border-b border-border/40">
                    <span className="text-muted-foreground">Default Gateway</span>
                    <Badge variant="outline" className="font-mono text-xs">
                      {gateway?.name ?? 'Not configured'}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center py-1.5 border-b border-border/40">
                    <span className="text-muted-foreground">Account Balance</span>
                    <span className="font-bold text-primary text-sm font-mono">{gateway?.balance ?? '—'}</span>
                  </div>
                  <div className="flex justify-between items-center py-1.5 border-b border-border/40">
                    <span className="text-muted-foreground">Queued Messages</span>
                    <span className="font-mono font-semibold text-foreground">{overview.data?.queuePending ?? 0}</span>
                  </div>
                  <div className="flex justify-between items-center py-1.5">
                    <span className="text-muted-foreground">Gateway Status</span>
                    {gatewayOnline ? (
                      <span className="text-emerald-500 font-medium flex items-center gap-1">
                        <CheckCircle2 className="h-3.5 w-3.5" /> Online
                      </span>
                    ) : (
                      <span className="text-amber-500 font-medium flex items-center gap-1 capitalize">
                        <AlertTriangle className="h-3.5 w-3.5" /> {(gateway?.status ?? 'unknown').replace('_', ' ')}
                      </span>
                    )}
                  </div>
                  {gateway?.message && !gatewayOnline && (
                    <p className="text-[11px] text-muted-foreground bg-muted/40 rounded-md p-2">{gateway.message}</p>
                  )}
                  {gateway?.checkedAt && (
                    <p className="text-[10px] text-muted-foreground">Checked {formatDateTime(gateway.checkedAt)}</p>
                  )}
                </>
              )}
            </CardContent>
          </Card>

          <Card className="border-border/60 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Layers className="h-4 w-4 text-primary" />
                Delivery Batches
              </CardTitle>
              <CardDescription className="text-xs">Bulk sends are queued and delivered in the background</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              {batches.isError ? (
                <div className="p-4">
                  <EmptyState title="Could not load batches" actionLabel="Retry" onAction={() => batches.refetch()} className="py-6" />
                </div>
              ) : (batches.data?.items ?? []).length === 0 ? (
                <p className="p-4 text-xs text-muted-foreground">No bulk sends yet.</p>
              ) : (
                <div className="divide-y divide-border/50 text-xs">
                  {(batches.data?.items ?? []).map((b) => (
                    <div key={b.id} className="p-3.5 space-y-1.5">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-semibold text-foreground truncate">{b.title || `Batch #${b.id}`}</span>
                        <Badge variant={b.status === 'completed' ? 'default' : 'secondary'} className="text-[10px] h-5 capitalize">
                          {b.status}
                        </Badge>
                      </div>
                      <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
                        <div className="h-full bg-primary transition-all" style={{ width: `${b.progressPct}%` }} />
                      </div>
                      <div className="flex justify-between text-[11px] text-muted-foreground font-mono">
                        <span>
                          {b.sent} sent · {b.failed} failed · {b.pending} pending
                        </span>
                        <span>{b.createdAt ? formatDateTime(b.createdAt) : ''}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* SMS history */}
      <Card className="border-border/60 shadow-sm">
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <CardTitle className="text-base flex items-center gap-2">
                <Clock className="h-4 w-4 text-primary" />
                Outbound SMS History
              </CardTitle>
              <CardDescription className="text-xs">Every SMS sent from this account with the gateway result</CardDescription>
            </div>
            <Select
              value={historyStatus}
              onValueChange={(v) => {
                if (v) {
                  setHistoryStatus(v);
                  setHistoryPage(1);
                }
              }}
            >
              <SelectTrigger className="h-9 w-[140px] text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                <SelectItem value="sent">Sent</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {logs.isError ? (
            <EmptyState title="Could not load SMS history" actionLabel="Retry" onAction={() => logs.refetch()} />
          ) : (
            <DataTable
              columns={historyColumns}
              data={logs.data?.items ?? []}
              isLoading={logs.isLoading}
              getRowId={(row) => row.id}
              searchKey="sentTo"
              searchPlaceholder="Search by recipient or message..."
              emptyTitle="No SMS sent yet"
              emptyDescription="Messages you send will appear here with their delivery result."
              enableColumnVisibility={false}
              server={{
                page: historyPage,
                pageSize: historyPageSize,
                total: logs.data?.meta.total ?? 0,
                onPageChange: setHistoryPage,
                onPageSizeChange: (size) => {
                  setHistoryPageSize(size);
                  setHistoryPage(1);
                },
                search: historySearch,
                onSearchChange: (q) => {
                  setHistorySearch(q);
                  setHistoryPage(1);
                },
              }}
            />
          )}
        </CardContent>
      </Card>

      {/* Log Detail Modal */}
      <Dialog open={!!selectedLog} onOpenChange={(open) => !open && setSelectedLog(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>SMS Transmission Detail</DialogTitle>
            <DialogDescription>Gateway response recorded for this message</DialogDescription>
          </DialogHeader>
          {selectedLog && (
            <div className="space-y-3 py-2 text-xs">
              <div className="flex justify-between py-1 border-b">
                <span className="text-muted-foreground">Recipient</span>
                <span className="font-semibold">{selectedLog.sentTo || '—'}</span>
              </div>
              <div className="flex justify-between py-1 border-b">
                <span className="text-muted-foreground">Status</span>
                <Badge variant={statusBadge(selectedLog.status)}>{selectedLog.rawStatus || selectedLog.status}</Badge>
              </div>
              <div className="flex justify-between py-1 border-b">
                <span className="text-muted-foreground">Sent Timestamp</span>
                <span className="font-mono">{selectedLog.sentAt ? formatDateTime(selectedLog.sentAt) : '—'}</span>
              </div>
              <div className="flex justify-between py-1 border-b">
                <span className="text-muted-foreground">Gateway</span>
                <span className="font-mono">{selectedLog.gateway || '—'}</span>
              </div>
              <div className="flex justify-between py-1 border-b">
                <span className="text-muted-foreground">Segments / Parts</span>
                <span className="font-mono">{smsParts(selectedLog.content)} part(s)</span>
              </div>
              {selectedLog.logs && (
                <div className="space-y-1">
                  <span className="text-muted-foreground font-semibold">Gateway Response:</span>
                  <div className="p-2 rounded-lg bg-muted/40 font-mono text-[11px] border border-border/50 break-words">
                    {selectedLog.logs}
                  </div>
                </div>
              )}
              <div className="space-y-1 pt-1">
                <span className="text-muted-foreground font-semibold">Message Body:</span>
                <div className="p-2.5 rounded-lg bg-muted/40 font-mono text-xs border border-border/50 whitespace-pre-wrap">
                  {selectedLog.content}
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button onClick={() => setSelectedLog(null)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
