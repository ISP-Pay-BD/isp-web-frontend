'use client';

import { useMemo, useState, useRef } from 'react';
import type { LegacyColumnDef, LegacyRow } from '@tanstack/react-table/legacy';
import { PageHeader } from '@/features/admin/shared';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { PageSkeleton } from '@/components/shared/LoadingSkeleton';
import { EmptyState } from '@/components/shared/EmptyState';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { OpsSummaryStrip } from '@/components/shared/OpsSummaryStrip';
import { Can } from '@/components/shared/Can';
import { DataTable } from '@/features/shared/data-table';
import { toast } from 'sonner';
import {
  Plus,
  Bell,
  Edit,
  Trash2,
  FileText,
  Sparkles,
  Send,
  Eye,
  CheckCircle2,
  Zap,
} from 'lucide-react';
import type { SmsTemplate } from '@/data/admin/comms.data';
import { useSmsData } from '@/features/admin/sms/hooks/use-sms';

const templateSearchFilter = (
  row: LegacyRow<SmsTemplate>,
  _columnId: string,
  filterValue: unknown,
) => {
  const q = String(filterValue ?? '').toLowerCase().trim();
  if (!q) return true;
  const t = row.original;
  return (
    t.templateName.toLowerCase().includes(q) ||
    t.messageBody.toLowerCase().includes(q) ||
    t.templateType.toLowerCase().includes(q)
  );
};

const AVAILABLE_PLACEHOLDERS = [
  { tag: '{name}', desc: 'Full Name' },
  { tag: '{month}', desc: 'Current Month' },
  { tag: '{amount}', desc: 'Due / Paid BDT' },
  { tag: '{due_date}', desc: 'Payment Due Date' },
  { tag: '{package}', desc: 'Plan Name' },
  { tag: '{area}', desc: 'Coverage Area' },
  { tag: '{trx_id}', desc: 'bKash TrxID' },
];

export function SmsTemplatesPage() {
  const { data, isLoading, isError, refetch } = useSmsData();
  const serverTemplates = data?.templates ?? [];
  const serverEvents = data?.events ?? [];
  const [editedTemplates, setEditedTemplates] = useState<typeof serverTemplates | null>(null);
  const [editedEvents, setEditedEvents] = useState<typeof serverEvents | null>(null);
  const templates = editedTemplates ?? serverTemplates;
  const events = editedEvents ?? serverEvents;
  const [activeTab, setActiveTab] = useState<'templates' | 'events'>('templates');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<SmsTemplate | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [previewTemplate, setPreviewTemplate] = useState<SmsTemplate | null>(null);
  const [testPhoneNumber, setTestPhoneNumber] = useState('01712345678');

  const [formData, setFormData] = useState({
    name: '',
    type: 'custom' as 'custom' | 'system',
    body: '',
  });

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleOpenAddModal = () => {
    setEditingTemplate(null);
    setFormData({ name: '', type: 'custom', body: '' });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (tpl: SmsTemplate) => {
    setEditingTemplate(tpl);
    setFormData({ name: tpl.templateName, type: tpl.templateType, body: tpl.messageBody });
    setIsModalOpen(true);
  };

  const insertVariableToBody = (tag: string) => {
    const textarea = textareaRef.current;
    if (!textarea) {
      setFormData((prev) => ({ ...prev, body: prev.body + ' ' + tag }));
      return;
    }
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const current = formData.body;
    const updated = current.substring(0, start) + tag + current.substring(end);
    setFormData((prev) => ({ ...prev, body: updated }));
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + tag.length, start + tag.length);
    }, 0);
  };

  const handleSaveTemplate = () => {
    if (!formData.name.trim() || !formData.body.trim()) {
      toast.error('Template name and body are required');
      return;
    }
    if (editingTemplate) {
      setEditedTemplates(
        templates.map((t) =>
          t.id === editingTemplate.id
            ? {
                ...t,
                templateName: formData.name,
                templateType: formData.type,
                messageBody: formData.body,
              }
            : t,
        ),
      );
      toast.success('Template updated successfully');
    } else {
      setEditedTemplates([
        ...templates,
        {
          id: `tpl_${Date.now()}`,
          templateName: formData.name,
          templateType: formData.type,
          messageBody: formData.body,
          variables: ['name', 'amount'],
        },
      ]);
      toast.success('New template created successfully');
    }
    setIsModalOpen(false);
  };

  const handleDeleteTemplate = (id: string) => {
    setEditedTemplates(templates.filter((t) => t.id !== id));
    setDeleteId(null);
    toast.success('Template deleted successfully');
  };

  const handleToggleEvent = (eventId: string) => {
    setEditedEvents(
      events.map((e) => (e.id === eventId ? { ...e, enabled: !e.enabled } : e)),
    );
    toast.success('Event notification trigger updated');
  };

  const handleUpdateEventTemplate = (eventId: string, templateId: string) => {
    setEditedEvents(
      events.map((e) => (e.id === eventId ? { ...e, templateId } : e)),
    );
    toast.success('Event template mapping updated');
  };

  const handleTestDispatch = (template: SmsTemplate) => {
    let preview = template.messageBody;
    preview = preview.replace(/{name}/g, 'Rahim Uddin');
    preview = preview.replace(/{month}/g, 'September');
    preview = preview.replace(/{amount}/g, '1,200');
    preview = preview.replace(/{due_date}/g, '10 Sep 2026');
    preview = preview.replace(/{package}/g, 'Home 20 Mbps');
    preview = preview.replace(/{area}/g, 'Uttara Sector 3');
    preview = preview.replace(/{trx_id}/g, 'TX982341');

    toast.promise(
      new Promise((res) => setTimeout(res, 600)),
      {
        loading: `Dispatching test SMS to ${testPhoneNumber}...`,
        success: `Test message sent successfully to ${testPhoneNumber}!`,
        error: 'Failed to send test SMS',
      }
    );
    setPreviewTemplate(null);
  };

  const columns = useMemo<LegacyColumnDef<SmsTemplate, unknown>[]>(
    () => [
      {
        accessorKey: 'templateName',
        header: 'Template Name',
        size: 200,
        enableHiding: false,
        cell: ({ row }) => (
          <div>
            <span className="font-semibold text-foreground block">{row.original.templateName}</span>
            <span className="text-[11px] text-muted-foreground font-mono">ID: {row.original.id}</span>
          </div>
        ),
      },
      {
        accessorKey: 'templateType',
        header: 'Category',
        size: 110,
        cell: ({ row }) => (
          <Badge
            variant={row.original.templateType === 'system' ? 'default' : 'secondary'}
            className="capitalize text-[11px]"
          >
            {row.original.templateType}
          </Badge>
        ),
      },
      {
        accessorKey: 'messageBody',
        header: 'Message Body Preview',
        size: 380,
        cell: ({ row }) => (
          <div className="space-y-1 py-1 max-w-lg">
            <span className="font-mono text-xs text-foreground/90 line-clamp-2 leading-relaxed bg-muted/20 p-1.5 rounded border border-border/40">
              {row.original.messageBody}
            </span>
            <div className="flex flex-wrap gap-1">
              {row.original.variables?.map((v) => (
                <span key={v} className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-primary/10 text-primary border border-primary/20">
                  {`{${v}}`}
                </span>
              ))}
            </div>
          </div>
        ),
      },
      {
        id: 'actions',
        header: () => <span className="sr-only">Action</span>,
        size: 130,
        enableSorting: false,
        enableHiding: false,
        cell: ({ row }) => (
          <div className="flex justify-end items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground hover:text-foreground"
              onClick={() => setPreviewTemplate(row.original)}
              title="Test Preview & Dispatch"
            >
              <Eye className="h-4 w-4" />
            </Button>
            <Can menu="sms_template" action="update">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => handleOpenEditModal(row.original)}
                title="Edit Template"
              >
                <Edit className="h-4 w-4" />
              </Button>
            </Can>
            <Can menu="sms_template" action="delete">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-destructive hover:bg-destructive/10"
                onClick={() => setDeleteId(row.original.id)}
                title="Delete Template"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </Can>
          </div>
        ),
      },
    ],
    [templates],
  );

  if (isLoading) return <PageSkeleton variant="table" />;
  if (isError) {
    return (
      <EmptyState
        title="Failed to load templates"
        description="Could not fetch SMS templates."
        actionLabel="Retry"
        onAction={() => refetch()}
      />
    );
  }

  const activeEventsCount = events.filter((e) => e.enabled).length;

  return (
    <div className="space-y-6">
      <PageHeader
        title="SMS Templates & Triggers"
        subtitle="Manage reusable message templates and automatic system event notifications"
        breadcrumb={[
          { label: 'Dashboard', url: '/admin/dashboard' },
          { label: 'Communications' },
          { label: 'Templates & Triggers' },
        ]}
        actions={
          <Can menu="sms_template" action="create">
            <Button onClick={handleOpenAddModal} className="gap-1.5 bg-primary text-primary-foreground">
              <Plus className="h-4 w-4" />
              Add Template
            </Button>
          </Can>
        }
      />

      <OpsSummaryStrip
        items={[
          { label: 'Total Templates', value: templates.length },
          { label: 'System Templates', value: templates.filter((t) => t.templateType === 'system').length },
          { label: 'Custom Templates', value: templates.filter((t) => t.templateType === 'custom').length },
          { label: 'Active Automated Triggers', value: `${activeEventsCount} of ${events.length}` },
          { label: 'Default Gateway', value: 'MIM SMS' },
        ]}
      />

      <Tabs
        value={activeTab}
        onValueChange={(v) => setActiveTab(v as 'templates' | 'events')}
        className="space-y-4"
      >
        <TabsList className="bg-muted/40 p-1 border border-border/60">
          <TabsTrigger value="templates" className="gap-2">
            <FileText className="h-4 w-4" />
            Message Templates ({templates.length})
          </TabsTrigger>
          <TabsTrigger value="events" className="gap-2">
            <Bell className="h-4 w-4" />
            Event Triggers ({activeEventsCount}/{events.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="templates" className="space-y-4">
          <Card className="border-border/60 shadow-sm">
            <CardHeader className="pb-3">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                <div>
                  <CardTitle className="text-base">Registered SMS Templates</CardTitle>
                  <CardDescription>
                    Reusable message definitions with personalized tag substitution
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <DataTable
                columns={columns}
                data={templates}
                getRowId={(row) => row.id}
                searchKey="templateName"
                searchPlaceholder="Search templates by name or body..."
                searchFilterFn={templateSearchFilter}
                facetFilters={[{ columnId: 'templateType', title: 'Category' }]}
                emptyTitle="No templates found"
                emptyDescription="Create your first SMS template to get started."
                toolbarActions={
                  <Can menu="sms_template" action="create">
                    <Button size="sm" onClick={handleOpenAddModal} className="gap-1.5">
                      <Plus className="h-4 w-4" />
                      Add Template
                    </Button>
                  </Can>
                }
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="events" className="space-y-4">
          <Card className="border-border/60 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Zap className="h-4 w-4 text-primary" />
                Automatic System Event SMS Triggers
              </CardTitle>
              <CardDescription>
                System triggers that automatically dispatch real-time SMS notifications upon billing and subscriber events
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0 divide-y divide-border/50 border-t border-border/60">
              {events.map((evt) => {
                const assignedTpl = templates.find((t) => t.id === evt.templateId);
                return (
                  <div key={evt.id} className="p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 hover:bg-muted/20 transition-colors">
                    <div className="space-y-1.5 max-w-xl">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm text-foreground">{evt.eventName}</span>
                        <Badge
                          variant={evt.enabled ? 'default' : 'secondary'}
                          className={`text-[10px] ${evt.enabled ? 'bg-emerald-600 hover:bg-emerald-600 text-white' : ''}`}
                        >
                          {evt.enabled ? 'Active Trigger' : 'Disabled'}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">{evt.description}</p>
                      <div className="flex items-center gap-2 pt-1">
                        <span className="text-xs font-medium text-muted-foreground">Assigned Template:</span>
                        <Select
                          value={evt.templateId}
                          onValueChange={(val) => { if (val) handleUpdateEventTemplate(evt.id, val); }}
                        >
                          <SelectTrigger className="h-8 text-xs font-mono w-56">
                            <SelectValue placeholder="Select template..." />
                          </SelectTrigger>
                          <SelectContent>
                            {templates.map((t) => (
                              <SelectItem key={t.id} value={t.id} className="text-xs">
                                {t.templateName}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-xs h-8 gap-1.5"
                        onClick={() => {
                          toast.success(`Dispatched simulated event test for '${evt.eventName}'`);
                        }}
                      >
                        <Send className="h-3.5 w-3.5 text-primary" />
                        Test Trigger
                      </Button>
                      <Switch
                        checked={evt.enabled}
                        onCheckedChange={() => handleToggleEvent(evt.id)}
                      />
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Add / Edit Template Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              {editingTemplate ? 'Edit SMS Template' : 'Create New SMS Template'}
            </DialogTitle>
            <DialogDescription>
              Define your template details and insert personalized placeholders.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label className="text-xs font-semibold">Template Name</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Monthly Bill Reminder"
                  className="text-xs"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-semibold">Category Type</Label>
                <Select
                  value={formData.type}
                  onValueChange={(v) => { if (v) setFormData({ ...formData, type: v as 'custom' | 'system' }); }}
                >
                  <SelectTrigger className="text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="custom">Custom Marketing / Alert</SelectItem>
                    <SelectItem value="system">System Billing / Event</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-semibold">Template Message Body</Label>
                <span className="text-[11px] font-mono text-muted-foreground">
                  {formData.body.length} chars | {Math.ceil(formData.body.length / 160) || 1} part(s)
                </span>
              </div>
              <Textarea
                ref={textareaRef}
                value={formData.body}
                onChange={(e) => setFormData({ ...formData, body: e.target.value })}
                placeholder="Dear {name}, your monthly bill of {amount} is due on {due_date}..."
                className="h-32 font-mono text-xs leading-relaxed resize-y"
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Sparkles className="h-3.5 w-3.5 text-primary" />
                <span>Click placeholder to insert at cursor:</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {AVAILABLE_PLACEHOLDERS.map((p) => (
                  <button
                    key={p.tag}
                    type="button"
                    onClick={() => insertVariableToBody(p.tag)}
                    className="text-xs px-2 py-0.5 rounded bg-secondary hover:bg-secondary/80 text-secondary-foreground font-mono border border-border/40 transition-colors"
                  >
                    {p.tag}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveTemplate} className="gap-1.5 bg-primary text-primary-foreground">
              <CheckCircle2 className="h-4 w-4" />
              {editingTemplate ? 'Update Template' : 'Save Template'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Preview & Test Send Modal */}
      <Dialog open={!!previewTemplate} onOpenChange={(open) => !open && setPreviewTemplate(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5 text-primary" />
              Template Preview & Test Send
            </DialogTitle>
            <DialogDescription>
              Simulate dynamic parameter rendering and send a live test message
            </DialogDescription>
          </DialogHeader>
          {previewTemplate && (
            <div className="space-y-4 py-2 text-xs">
              <div className="space-y-1.5">
                <span className="text-muted-foreground font-semibold">Rendered Sample SMS:</span>
                <div className="p-3 rounded-lg bg-muted/40 font-mono text-xs border border-border/60 leading-relaxed">
                  {previewTemplate.messageBody
                    .replace(/{name}/g, 'Rahim Uddin')
                    .replace(/{month}/g, 'September')
                    .replace(/{amount}/g, '1,200')
                    .replace(/{due_date}/g, '10 Sep 2026')
                    .replace(/{package}/g, 'Home 20 Mbps')
                    .replace(/{area}/g, 'Uttara Sector 3')
                    .replace(/{trx_id}/g, 'TX982341')}
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-semibold">Test Recipient Phone</Label>
                <Input
                  value={testPhoneNumber}
                  onChange={(e) => setTestPhoneNumber(e.target.value)}
                  placeholder="017xxxxxxxx"
                  className="font-mono text-xs"
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setPreviewTemplate(null)}>
              Close
            </Button>
            {previewTemplate && (
              <Button
                onClick={() => handleTestDispatch(previewTemplate)}
                className="gap-1.5 bg-primary text-primary-foreground"
              >
                <Send className="h-4 w-4" />
                Send Test SMS
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={(open) => !open && setDeleteId(null)}
        title="Delete SMS Template"
        description="Are you sure you want to delete this SMS template? Active event triggers using this template will fallback to system defaults."
        confirmLabel="Delete"
        destructive
        onConfirm={() => deleteId && handleDeleteTemplate(deleteId)}
      />
    </div>
  );
}
