'use client';

import { useState, useMemo } from 'react';
import { PageHeader } from '@/features/shared/page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Send, RotateCcw, MessageSquare, Users, CheckCircle2 } from 'lucide-react';
import type { SmsLog } from '@/data/admin/comms.data';
import { areas } from '@/data/admin/areas.data';
import { customers } from '@/data/admin/customers.data';
import { getPackageById } from '@/data/admin/packages.data';
import { PageSkeleton } from '@/components/shared/LoadingSkeleton';
import { EmptyState } from '@/components/shared/EmptyState';
import { useSmsData } from '../hooks/use-sms';

export function SmsPage() {
  const { data, isLoading, isError, refetch } = useSmsData();
  const smsTemplatesData = data?.templates ?? [];
  const serverLogs = data?.logs ?? [];
  const [sentLogs, setSentLogs] = useState<SmsLog[]>([]);
  const logs = useMemo(() => [...sentLogs, ...serverLogs], [sentLogs, serverLogs]);
  const [selectedArea, setSelectedArea] = useState<string>('all');
  const [targetType, setTargetType] = useState<'all' | 'specific'>('all');
  const [selectedCustomerIds, setSelectedCustomerIds] = useState<string[]>([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('');
  const [smsContent, setSmsContent] = useState<string>('');
  const [customerSearch, setCustomerSearch] = useState<string>('');
  const [customPreviews, setCustomPreviews] = useState<Record<string, string>>({});
  const [isSending, setIsSending] = useState(false);

  // Filter customers by selected area
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
  }, [selectedArea, customerSearch]);

  // Selected recipients for preview and delivery
  const targetRecipients = useMemo(() => {
    if (targetType === 'all') {
      return selectedArea === 'all'
        ? customers
        : customers.filter((c) => c.areaId === selectedArea);
    }
    return customers.filter((c) => selectedCustomerIds.includes(c.id));
  }, [targetType, selectedArea, selectedCustomerIds]);

  // Handle template selection
  const handleTemplateChange = (tplId: string) => {
    setSelectedTemplateId(tplId);
    const tpl = smsTemplatesData.find((t) => t.id === tplId);
    if (tpl) {
      setSmsContent(tpl.messageBody);
      setCustomPreviews({});
    }
  };

  // Generate personalized text for a customer
  const renderMessageForCustomer = (cust: (typeof customers)[0]) => {
    if (customPreviews[cust.id]) return customPreviews[cust.id];
    let body = smsContent;
    body = body.replace(/{name}/g, cust.name);
    body = body.replace(/{month}/g, 'September');
    body = body.replace(/{amount}/g, `${getPackageById(cust.packageId)?.priceBdt ?? cust.balanceBdt}`);
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
      toast.success(`Successfully dispatched ${targetRecipients.length} SMS message(s)!`);
      setCustomPreviews({});
    }, 600);
  };

  const handleResetPreviews = () => {
    setCustomPreviews({});
    toast.info('Individual message previews reset to template defaults');
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
        title="Personalized SMS"
        subtitle="Compose and broadcast personalized SMS alerts to subscribers"
        breadcrumb={[
          { label: 'Dashboard', url: '/admin/dashboard' },
          { label: 'Communications' },
          { label: 'SMS' },
        ]}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Form & Previews */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="border-t-4 border-t-primary shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-primary" />
                Compose SMS Broadcast
              </CardTitle>
              <CardDescription>
                Select target area, recipients, and template variables
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              {/* Service Area */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Service Area</Label>
                  <Select value={selectedArea} onValueChange={(v) => v && setSelectedArea(v)}>
                    <SelectTrigger>
                      <SelectValue placeholder="All Areas" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Service Areas</SelectItem>
                      {areas.map((a) => (
                        <SelectItem key={a.id} value={a.id}>
                          {a.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Template picker */}
                <div className="space-y-2">
                  <Label>Predefined Template</Label>
                  <Select value={selectedTemplateId} onValueChange={(v) => v && handleTemplateChange(v)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a template..." />
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
              <div className="space-y-3">
                <Label>Target Audience</Label>
                <div className="flex gap-4 text-sm">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="targetType"
                      checked={targetType === 'all'}
                      onChange={() => setTargetType('all')}
                      className="accent-primary"
                    />
                    <span>All Customers in Selected Area ({targetRecipients.length})</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="targetType"
                      checked={targetType === 'specific'}
                      onChange={() => setTargetType('specific')}
                      className="accent-primary"
                    />
                    <span>Select Specific Customers</span>
                  </label>
                </div>

                {targetType === 'specific' && (
                  <div className="border rounded-lg p-3 space-y-3 bg-muted/20">
                    <Input
                      placeholder="Search customer by name or phone..."
                      value={customerSearch}
                      onChange={(e) => setCustomerSearch(e.target.value)}
                      className="bg-background text-sm"
                    />
                    <div className="max-h-40 overflow-y-auto space-y-1.5 pr-1">
                      {availableCustomers.map((cust) => {
                        const isChecked = selectedCustomerIds.includes(cust.id);
                        return (
                          <label
                            key={cust.id}
                            className="flex items-center justify-between p-2 rounded-md hover:bg-muted/50 cursor-pointer text-sm"
                          >
                            <div className="flex items-center gap-2.5">
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
                                className="accent-primary rounded"
                              />
                              <span className="font-medium">{cust.name}</span>
                              <span className="text-xs text-muted-foreground">({cust.phone})</span>
                            </div>
                            <Badge variant="outline" className="text-xs">
                              {cust.packageName}
                            </Badge>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* Message Content */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>SMS Content (Global Template)</Label>
                  <span className="text-xs text-muted-foreground font-mono">
                    {charCount} chars | {partsCount} part{partsCount > 1 ? 's' : ''} (Max 239)
                  </span>
                </div>
                <Textarea
                  value={smsContent}
                  onChange={(e) => setSmsContent(e.target.value)}
                  placeholder="Dear {name}, your monthly bill of {amount} is due on {due_date}..."
                  className="h-28 font-mono text-sm resize-y"
                  maxLength={239}
                />
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {['{name}', '{month}', '{amount}', '{due_date}', '{package}', '{area}'].map((v) => (
                    <button
                      key={v}
                      type="button"
                      onClick={() => setSmsContent((prev) => prev + ' ' + v)}
                      className="text-xs px-2 py-0.5 rounded bg-secondary text-secondary-foreground hover:bg-secondary/80 font-mono"
                    >
                      {v}
                    </button>
                  ))}
                </div>
              </div>

              {/* Live Preview List */}
              {targetRecipients.length > 0 && smsContent.trim() && (
                <div className="pt-3 border-t space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm font-semibold">
                      <span>Individual Message Preview</span>
                      <Badge variant="secondary" className="text-xs">
                        {targetRecipients.length} recipients
                      </Badge>
                    </div>
                    {Object.keys(customPreviews).length > 0 && (
                      <Button variant="ghost" size="sm" onClick={handleResetPreviews} className="h-7 text-xs">
                        <RotateCcw className="h-3.5 w-3.5 mr-1" />
                        Reset Custom Previews
                      </Button>
                    )}
                  </div>
                  <div className="max-h-64 overflow-y-auto space-y-2.5 p-3 rounded-lg border bg-muted/10">
                    {targetRecipients.slice(0, 10).map((cust) => (
                      <div key={cust.id} className="p-2.5 rounded-md border bg-card text-xs space-y-1.5">
                        <div className="flex items-center justify-between font-medium text-foreground">
                          <span>{cust.name} ({cust.phone})</span>
                          <span className="text-muted-foreground">{cust.areaName}</span>
                        </div>
                        <input
                          type="text"
                          value={renderMessageForCustomer(cust)}
                          onChange={(e) =>
                            setCustomPreviews({ ...customPreviews, [cust.id]: e.target.value })
                          }
                          className="w-full bg-muted/30 border rounded px-2 py-1 font-mono text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                        />
                      </div>
                    ))}
                    {targetRecipients.length > 10 && (
                      <p className="text-center text-xs text-muted-foreground pt-1">
                        + {targetRecipients.length - 10} more recipients will receive their personalized message
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="pt-3 flex items-center gap-3">
                <Button onClick={handleSend} disabled={isSending} className="gap-2">
                  <Send className="h-4 w-4" />
                  {isSending ? 'Dispatching...' : `Send to ${targetRecipients.length} Recipient(s)`}
                </Button>
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
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Col: Delivery Stats & Recent Logs */}
        <div className="space-y-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Users className="h-4 w-4 text-primary" />
                Gateway Status
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex justify-between items-center py-1 border-b">
                <span className="text-muted-foreground">Default Gateway</span>
                <Badge variant="outline" className="font-mono text-xs">MIM SMS</Badge>
              </div>
              <div className="flex justify-between items-center py-1 border-b">
                <span className="text-muted-foreground">Sender ID</span>
                <span className="font-mono font-medium">ISPPAYBD</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b">
                <span className="text-muted-foreground">Credits Balance</span>
                <span className="font-bold text-primary">৳4,250.75</span>
              </div>
              <div className="flex justify-between items-center py-1">
                <span className="text-muted-foreground">Delivery Route</span>
                <span className="text-emerald-600 font-medium flex items-center gap-1">
                  <CheckCircle2 className="h-3.5 w-3.5" /> High-Priority OTP/DLR
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Quick Recent Log */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Recent Dispatches</CardTitle>
              <CardDescription>Latest outbound SMS broadcast items</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y text-xs">
                {logs.slice(0, 5).map((log) => (
                  <div key={log.id} className="p-3 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-foreground">{log.customerName}</span>
                      <Badge
                        variant={log.status === 'delivered' ? 'default' : log.status === 'sent' ? 'secondary' : 'destructive'}
                        className="text-[10px] h-5"
                      >
                        {log.status}
                      </Badge>
                    </div>
                    <p className="text-muted-foreground line-clamp-1">{log.message}</p>
                    <div className="flex justify-between text-[11px] text-muted-foreground font-mono pt-0.5">
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
    </div>
  );
}
