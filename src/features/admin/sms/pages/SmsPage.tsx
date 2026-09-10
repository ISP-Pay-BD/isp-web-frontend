'use client';

import { useState, useMemo, useRef } from 'react';
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
  RotateCcw,
  MessageSquare,
  Users,
  CheckCircle2,
  Sparkles,
  CreditCard,
  Radio,
  Clock,
  Search,
  Check,
  Zap,
} from 'lucide-react';
import type { SmsLog } from '@/data/admin/comms.data';
import type { Customer } from '@/data/shared/types';
import { PageSkeleton } from '@/components/shared/LoadingSkeleton';
import { EmptyState } from '@/components/shared/EmptyState';
import { OpsSummaryStrip } from '@/components/shared/OpsSummaryStrip';
import { useSmsData } from '../hooks/use-sms';

const VARIABLE_TAGS = [
  { tag: '{name}', desc: 'Customer Name' },
  { tag: '{month}', desc: 'Current Month' },
  { tag: '{amount}', desc: 'Bill Amount' },
  { tag: '{due_date}', desc: 'Due Date' },
  { tag: '{package}', desc: 'Package Name' },
  { tag: '{area}', desc: 'Service Area' },
  { tag: '{trx_id}', desc: 'Transaction ID' },
];

export function SmsPage() {
  const { data, isLoading, isError, refetch } = useSmsData();
  const smsTemplatesData = data?.templates ?? [];
  const serverLogs = data?.logs ?? [];
  const areas = data?.areas ?? [];
  const customers = data?.customers ?? [];
  const packages = data?.packages ?? [];
  const getPackageById = (id: string) => packages.find((p) => p.id === id);

  const [sentLogs, setSentLogs] = useState<SmsLog[]>([]);
  const logs = useMemo(() => [...sentLogs, ...serverLogs], [sentLogs, serverLogs]);
  const [selectedArea, setSelectedArea] = useState<string>('all');
  const [targetType, setTargetType] = useState<'all' | 'specific'>('all');
  const [selectedCustomerIds, setSelectedCustomerIds] = useState<string[]>([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('');
  const [smsContent, setSmsContent] = useState<string>(
    'Dear {name}, your monthly internet bill for {month} of BDT {amount} is due by {due_date}. Please pay via bKash to avoid disconnection. ISP Pay BD.'
  );
  const [customerSearch, setCustomerSearch] = useState<string>('');
  const [customPreviews, setCustomPreviews] = useState<Record<string, string>>({});
  const [isSending, setIsSending] = useState(false);
  const [topUpModalOpen, setTopUpModalOpen] = useState(false);
  const [topUpAmount, setTopUpAmount] = useState('1000');
  const [selectedLog, setSelectedLog] = useState<SmsLog | null>(null);

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const availableCustomers = useMemo(() => {
    let list = customers;
    if (selectedArea !== 'all') {
      list = list.filter((c) => c.areaId === selectedArea);
    }
    if (customerSearch.trim()) {
      const q = customerSearch.toLowerCase();
      list = list.filter(
        (c) => c.name.toLowerCase().includes(q) || c.phone.includes(q) || c.username.toLowerCase().includes(q)
      );
    }
    return list;
  }, [customers, selectedArea, customerSearch]);

  // Selected recipients for preview and delivery
  const targetRecipients = useMemo(() => {
    if (targetType === 'all') {
      return selectedArea === 'all'
        ? customers
        : customers.filter((c) => c.areaId === selectedArea);
    }
    return customers.filter((c) => selectedCustomerIds.includes(c.id));
  }, [customers, targetType, selectedArea, selectedCustomerIds]);

  // Handle template selection
  const handleTemplateChange = (tplId: string) => {
    setSelectedTemplateId(tplId);
    const tpl = smsTemplatesData.find((t) => t.id === tplId);
    if (tpl) {
      setSmsContent(tpl.messageBody);
      setCustomPreviews({});
    }
  };

  const insertVariable = (tag: string) => {
    const textarea = textareaRef.current;
    if (!textarea) {
      setSmsContent((prev) => prev + ' ' + tag);
      return;
    }
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const current = smsContent;
    const updated = current.substring(0, start) + tag + current.substring(end);
    setSmsContent(updated);
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + tag.length, start + tag.length);
    }, 0);
  };

  // Generate personalized text for a customer
  const renderMessageForCustomer = (cust: Customer) => {
    if (customPreviews[cust.id]) return customPreviews[cust.id];
    let body = smsContent;
    body = body.replace(/{name}/g, cust.name);
    body = body.replace(/{month}/g, 'September');
    body = body.replace(/{amount}/g, `${getPackageById(cust.packageId)?.priceBdt ?? cust.balanceBdt ?? 1200}`);
    body = body.replace(/{due_date}/g, '10 Sep 2026');
    body = body.replace(/{package}/g, cust.packageName);
    body = body.replace(/{area}/g, cust.areaName);
    body = body.replace(/{trx_id}/g, `TX${cust.id.replace(/\D/g, '').slice(-6).padStart(6, '0')}`);
    return body;
  };

  const charCount = smsContent.length;
  const partsCount = Math.ceil(charCount / 160) || 1;

  const handleSend = () => {
    if (!smsContent.trim()) {
      toast.error('SMS Content cannot be empty');
      return;
    }
    if (targetRecipients.length === 0) {
      toast.error('Please select at least one recipient customer');
      return;
    }

    setIsSending(true);
    setTimeout(() => {
      setIsSending(false);
      const newLog: SmsLog = {
        id: `sms_${Date.now()}`,
        recipient: targetRecipients.length === 1 ? targetRecipients[0]!.phone : `${targetRecipients.length} recipients`,
        customerName: targetRecipients.length === 1 ? targetRecipients[0]!.name : `Bulk (${targetRecipients.length} users)`,
        message: smsContent,
        sentAt: new Date().toISOString(),
        status: 'delivered',
        parts: partsCount,
      };
      setSentLogs((prev) => [newLog, ...prev]);
      toast.success(`Dispatched ${targetRecipients.length} SMS broadcast(s) successfully via MIM SMS!`);
      setCustomPreviews({});
    }, 600);
  };

  const handleResetPreviews = () => {
    setCustomPreviews({});
    toast.info('Individual message previews reset to template defaults');
  };

  const handleSelectAllFiltered = () => {
    setSelectedCustomerIds(availableCustomers.map((c) => c.id));
  };

  const handleClearSelectedCustomers = () => {
    setSelectedCustomerIds([]);
  };

  if (isLoading) return <PageSkeleton variant="form" />;
  if (isError) {
    return (
      <EmptyState
        title="Failed to load SMS data"
        description="Could not fetch templates and delivery logs."
        actionLabel="Retry"
        onAction={() => refetch()}
      />
    );
  }

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
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5"
              onClick={() => {
                toast.promise(
                  new Promise((res) => setTimeout(res, 500)),
                  {
                    loading: 'Pinging SMS gateway...',
                    success: 'MIM SMS Gateway is online (Latency: 42ms)',
                    error: 'Gateway error',
                  }
                );
              }}
            >
              <Zap className="h-4 w-4 text-emerald-500" />
              Gateway Ping
            </Button>
            <Button
              size="sm"
              className="gap-1.5 bg-primary text-primary-foreground hover:bg-primary/90"
              onClick={() => setTopUpModalOpen(true)}
            >
              <CreditCard className="h-4 w-4" />
              Top Up Balance
            </Button>
          </div>
        }
      />

      <OpsSummaryStrip
        items={[
          { label: 'Gateway Route', value: 'MIM SMS (Primary DLR)' },
          { label: 'Sender ID', value: 'ISPPAYBD' },
          { label: 'Credit Balance', value: '৳4,250.75' },
          { label: 'Today Dispatched', value: `${logs.length * 18 + 120} SMS` },
          { label: 'Delivery Rate', value: '99.4%' },
          { label: 'Target Audience', value: `${targetRecipients.length} Subscribers` },
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
              {/* Service Area & Template Picker */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Target Service Area
                  </Label>
                  <Select value={selectedArea} onValueChange={(v) => { if (v) setSelectedArea(v); }}>
                    <SelectTrigger className="h-10">
                      <SelectValue placeholder="All Areas" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Service Areas ({customers.length} total)</SelectItem>
                      {areas.map((a) => {
                        const count = customers.filter((c) => c.areaId === a.id).length;
                        return (
                          <SelectItem key={a.id} value={a.id}>
                            {a.name} ({count} users)
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                </div>

                {/* Template picker */}
                <div className="space-y-2">
                  <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Load Predefined Template
                  </Label>
                  <Select value={selectedTemplateId} onValueChange={(v) => { if (v) handleTemplateChange(v); }}>
                    <SelectTrigger className="h-10">
                      <SelectValue placeholder="Select template..." />
                    </SelectTrigger>
                    <SelectContent>
                      {smsTemplatesData.map((t) => (
                        <SelectItem key={t.id} value={t.id}>
                          {t.templateName} ({t.templateType})
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
                    className={`flex items-start gap-3 p-3.5 rounded-lg border text-left transition-all ${
                      targetType === 'all'
                        ? 'border-primary/80 bg-primary/5 ring-1 ring-primary/40'
                        : 'border-border/60 hover:bg-muted/40'
                    }`}
                  >
                    <div className="mt-0.5">
                      <Radio className={`h-4 w-4 ${targetType === 'all' ? 'text-primary' : 'text-muted-foreground'}`} />
                    </div>
                    <div>
                      <div className="font-semibold text-sm">All Area Subscribers</div>
                      <div className="text-xs text-muted-foreground mt-0.5">
                        Broadcasts to {targetRecipients.length} subscriber(s) currently filtered
                      </div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setTargetType('specific')}
                    className={`flex items-start gap-3 p-3.5 rounded-lg border text-left transition-all ${
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
                        Select specific customers manually ({selectedCustomerIds.length} chosen)
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
                          placeholder="Search customer by name, phone or username..."
                          value={customerSearch}
                          onChange={(e) => setCustomerSearch(e.target.value)}
                          className="pl-9 h-9 text-xs bg-background"
                        />
                      </div>
                      <div className="flex items-center gap-2 text-xs">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={handleSelectAllFiltered}
                          className="h-8 text-xs"
                        >
                          Select All ({availableCustomers.length})
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={handleClearSelectedCustomers}
                          className="h-8 text-xs text-muted-foreground"
                        >
                          Clear
                        </Button>
                      </div>
                    </div>

                    <div className="max-h-48 overflow-y-auto space-y-1.5 pr-1 divide-y divide-border/40">
                      {availableCustomers.length === 0 ? (
                        <div className="text-center py-4 text-xs text-muted-foreground">
                          No matching subscribers found in selected scope.
                        </div>
                      ) : (
                        availableCustomers.map((cust) => {
                          const isChecked = selectedCustomerIds.includes(cust.id);
                          return (
                            <label
                              key={cust.id}
                              className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50 cursor-pointer text-xs transition-colors"
                            >
                              <div className="flex items-center gap-3">
                                <input
                                  type="checkbox"
                                  checked={isChecked}
                                  onChange={(e) => {
                                    if (e.target.checked) {
                                      setSelectedCustomerIds([...selectedCustomerIds, cust.id]);
                                    } else {
                                      setSelectedCustomerIds(selectedCustomerIds.filter((id) => id !== cust.id));
                                    }
                                  }}
                                  className="accent-primary rounded h-4 w-4"
                                />
                                <div>
                                  <span className="font-semibold text-foreground">{cust.name}</span>
                                  <span className="text-muted-foreground font-mono ml-2">({cust.phone})</span>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <Badge variant="secondary" className="text-[10px] font-mono">
                                  {cust.packageName}
                                </Badge>
                                <span className="text-muted-foreground text-[11px] hidden sm:inline">
                                  {cust.areaName}
                                </span>
                              </div>
                            </label>
                          );
                        })
                      )}
                    </div>
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
                    <span className={charCount > 160 ? 'text-amber-500 font-semibold' : 'text-muted-foreground'}>
                      {charCount} chars
                    </span>
                    <span className="text-muted-foreground">·</span>
                    <Badge variant={partsCount > 1 ? 'outline' : 'secondary'} className="text-[10px] h-5">
                      {partsCount} part{partsCount > 1 ? 's' : ''} (160 ch/part)
                    </Badge>
                  </div>
                </div>

                <Textarea
                  ref={textareaRef}
                  value={smsContent}
                  onChange={(e) => setSmsContent(e.target.value)}
                  placeholder="Dear {name}, your monthly bill of {amount} is due on {due_date}..."
                  className="min-h-[110px] font-mono text-xs leading-relaxed resize-y bg-background/80"
                  maxLength={480}
                />

                <div className="space-y-1.5 pt-1">
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Sparkles className="h-3.5 w-3.5 text-primary" />
                    <span>Click variable chip to insert at cursor position:</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {VARIABLE_TAGS.map((v) => (
                      <button
                        key={v.tag}
                        type="button"
                        onClick={() => insertVariable(v.tag)}
                        className="text-xs px-2.5 py-1 rounded-md bg-secondary/80 hover:bg-secondary text-secondary-foreground font-mono border border-border/40 transition-colors flex items-center gap-1"
                        title={v.desc}
                      >
                        <span>{v.tag}</span>
                        <span className="text-[10px] opacity-60 font-sans">({v.desc})</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Live Preview List */}
              {targetRecipients.length > 0 && smsContent.trim() && (
                <div className="pt-3 border-t border-border/60 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm font-semibold">
                      <span>Personalized Live Preview</span>
                      <Badge variant="outline" className="text-xs">
                        {targetRecipients.length} Recipient{targetRecipients.length > 1 ? 's' : ''}
                      </Badge>
                    </div>
                    {Object.keys(customPreviews).length > 0 && (
                      <Button variant="ghost" size="sm" onClick={handleResetPreviews} className="h-7 text-xs">
                        <RotateCcw className="h-3.5 w-3.5 mr-1" />
                        Reset Custom Previews
                      </Button>
                    )}
                  </div>
                  <div className="max-h-60 overflow-y-auto space-y-2 p-3 rounded-xl border border-border/60 bg-muted/10">
                    {targetRecipients.slice(0, 6).map((cust) => (
                      <div key={cust.id} className="p-3 rounded-lg border border-border/60 bg-card text-xs space-y-1.5 shadow-sm">
                        <div className="flex items-center justify-between font-medium">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-foreground">{cust.name}</span>
                            <span className="text-muted-foreground font-mono">({cust.phone})</span>
                          </div>
                          <span className="text-[11px] text-muted-foreground">{cust.areaName}</span>
                        </div>
                        <input
                          type="text"
                          value={renderMessageForCustomer(cust)}
                          onChange={(e) =>
                            setCustomPreviews({ ...customPreviews, [cust.id]: e.target.value })
                          }
                          className="w-full bg-muted/40 border border-border/60 rounded px-2.5 py-1.5 font-mono text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                        />
                      </div>
                    ))}
                    {targetRecipients.length > 6 && (
                      <p className="text-center text-xs text-muted-foreground pt-1">
                        + {targetRecipients.length - 6} more subscribers will receive their dynamic personalized SMS
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="pt-3 flex items-center justify-between border-t border-border/60">
                <div className="text-xs text-muted-foreground">
                  Estimated cost: <span className="font-semibold text-foreground font-mono">৳{(targetRecipients.length * partsCount * 0.35).toFixed(2)}</span> (৳0.35/SMS)
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSmsContent('');
                      setSelectedTemplateId('');
                      setCustomPreviews({});
                    }}
                    disabled={isSending}
                  >
                    Clear Form
                  </Button>
                  <Button onClick={handleSend} disabled={isSending} className="gap-2 bg-primary text-primary-foreground">
                    <Send className="h-4 w-4" />
                    {isSending ? 'Dispatching...' : `Broadcast to ${targetRecipients.length} Recipient(s)`}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Col: Gateway Status & Recent Logs */}
        <div className="space-y-6">
          <Card className="border-border/60 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Users className="h-4 w-4 text-primary" />
                Gateway Health & Credits
              </CardTitle>
              <CardDescription>MIM SMS Route 1 (DLR & High Priority)</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-xs">
              <div className="flex justify-between items-center py-1.5 border-b border-border/40">
                <span className="text-muted-foreground">Default Gateway</span>
                <Badge variant="outline" className="font-mono text-xs">MIM SMS</Badge>
              </div>
              <div className="flex justify-between items-center py-1.5 border-b border-border/40">
                <span className="text-muted-foreground">Sender Masking ID</span>
                <span className="font-mono font-semibold text-foreground">ISPPAYBD</span>
              </div>
              <div className="flex justify-between items-center py-1.5 border-b border-border/40">
                <span className="text-muted-foreground">Account Balance</span>
                <span className="font-bold text-primary text-sm font-mono">৳4,250.75</span>
              </div>
              <div className="flex justify-between items-center py-1.5 border-b border-border/40">
                <span className="text-muted-foreground">Approx. SMS Balance</span>
                <span className="font-mono font-semibold text-foreground">~12,145 SMS</span>
              </div>
              <div className="flex justify-between items-center py-1.5">
                <span className="text-muted-foreground">Gateway Status</span>
                <span className="text-emerald-500 font-medium flex items-center gap-1">
                  <CheckCircle2 className="h-3.5 w-3.5" /> Active & Operational
                </span>
              </div>
              <Button
                variant="outline"
                className="w-full mt-2 text-xs h-9 gap-1.5"
                onClick={() => setTopUpModalOpen(true)}
              >
                <CreditCard className="h-3.5 w-3.5 text-primary" />
                Recharge Credits
              </Button>
            </CardContent>
          </Card>

          {/* Quick Recent Log */}
          <Card className="border-border/60 shadow-sm">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Clock className="h-4 w-4 text-primary" />
                    Recent Outbound Dispatches
                  </CardTitle>
                  <CardDescription className="text-xs">Latest broadcast transmission telemetry</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-border/50 text-xs">
                {logs.slice(0, 5).map((log) => (
                  <div
                    key={log.id}
                    className="p-3.5 space-y-1.5 hover:bg-muted/30 transition-colors cursor-pointer"
                    onClick={() => setSelectedLog(log)}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-foreground">{log.customerName}</span>
                      <Badge
                        variant={
                          log.status === 'delivered'
                            ? 'default'
                            : log.status === 'sent'
                              ? 'secondary'
                              : 'destructive'
                        }
                        className="text-[10px] h-5"
                      >
                        {log.status}
                      </Badge>
                    </div>
                    <p className="text-muted-foreground line-clamp-2 text-xs font-mono">{log.message}</p>
                    <div className="flex justify-between text-[11px] text-muted-foreground font-mono pt-1">
                      <span>{log.recipient}</span>
                      <span>{new Date(log.sentAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Top Up Modal */}
      <Dialog open={topUpModalOpen} onOpenChange={setTopUpModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-primary" />
              Recharge SMS Credits
            </DialogTitle>
            <DialogDescription>
              Purchase bulk SMS balance for your gateway account via bKash / Nagad or Bank.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-3">
            <div className="space-y-2">
              <Label className="text-xs font-semibold">Select Top-Up Amount (BDT)</Label>
              <div className="grid grid-cols-3 gap-2">
                {['500', '1000', '2500', '5000', '10000', '20000'].map((amt) => (
                  <Button
                    key={amt}
                    type="button"
                    variant={topUpAmount === amt ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setTopUpAmount(amt)}
                    className="text-xs font-mono"
                  >
                    ৳{Number(amt).toLocaleString()}
                  </Button>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-semibold">Custom Amount</Label>
              <Input
                type="number"
                value={topUpAmount}
                onChange={(e) => setTopUpAmount(e.target.value)}
                placeholder="Enter amount..."
                className="font-mono text-sm"
              />
              <p className="text-[11px] text-muted-foreground font-mono">
                Estimated SMS count: ~{Math.floor(Number(topUpAmount || '0') / 0.35).toLocaleString()} SMS
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setTopUpModalOpen(false)}>
              Cancel
            </Button>
            <Button
              className="gap-1.5"
              onClick={() => {
                toast.success(`Top-up request for ৳${Number(topUpAmount).toLocaleString()} submitted successfully!`);
                setTopUpModalOpen(false);
              }}
            >
              <Check className="h-4 w-4" />
              Proceed to Gateway Payment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Log Detail Modal */}
      <Dialog open={!!selectedLog} onOpenChange={(open) => !open && setSelectedLog(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>SMS Transmission Detail</DialogTitle>
            <DialogDescription>Telemetry audit record from SMS gateway</DialogDescription>
          </DialogHeader>
          {selectedLog && (
            <div className="space-y-3 py-2 text-xs">
              <div className="flex justify-between py-1 border-b">
                <span className="text-muted-foreground">Recipient</span>
                <span className="font-semibold">{selectedLog.customerName} ({selectedLog.recipient})</span>
              </div>
              <div className="flex justify-between py-1 border-b">
                <span className="text-muted-foreground">Status</span>
                <Badge variant={selectedLog.status === 'delivered' ? 'default' : 'secondary'}>
                  {selectedLog.status}
                </Badge>
              </div>
              <div className="flex justify-between py-1 border-b">
                <span className="text-muted-foreground">Sent Timestamp</span>
                <span className="font-mono">{new Date(selectedLog.sentAt).toLocaleString()}</span>
              </div>
              <div className="flex justify-between py-1 border-b">
                <span className="text-muted-foreground">Segments / Parts</span>
                <span className="font-mono">{selectedLog.parts ?? 1} part(s)</span>
              </div>
              <div className="space-y-1 pt-1">
                <span className="text-muted-foreground font-semibold">Message Body:</span>
                <div className="p-2.5 rounded-lg bg-muted/40 font-mono text-xs border border-border/50">
                  {selectedLog.message}
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
