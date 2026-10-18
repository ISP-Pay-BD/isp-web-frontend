'use client';

import { useMemo, useState, useRef } from 'react';
import type { LegacyColumnDef } from '@tanstack/react-table/legacy';
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { PageSkeleton } from '@/components/shared/LoadingSkeleton';
import { EmptyState } from '@/components/shared/EmptyState';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { OpsSummaryStrip } from '@/components/shared/OpsSummaryStrip';
import { Can } from '@/components/shared/Can';
import { DataTable } from '@/features/shared/data-table';
import { toast } from 'sonner';
import { Plus, Bell, Edit, Trash2, FileText, Sparkles, Send, Eye, CheckCircle2, Zap, Lock } from 'lucide-react';
import {
  useDeleteSmsTemplate,
  useSaveSmsTemplate,
  useSmsEvents,
  useSmsOverview,
  useSmsPreview,
  useSmsTemplateOptions,
  useSmsTemplates,
  useTestSms,
  useUpdateSmsEvent,
} from '@/features/admin/sms/hooks/use-sms';
import { smsParts, type SmsTemplateRow } from '@/features/admin/sms/types';

export function SmsTemplatesPage() {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState('');
  const templatesQuery = useSmsTemplates({ page, pageSize, search });
  const options = useSmsTemplateOptions();
  const events = useSmsEvents();
  const overview = useSmsOverview();
  const saveTemplate = useSaveSmsTemplate();
  const deleteTemplate = useDeleteSmsTemplate();
  const updateEvent = useUpdateSmsEvent();
  const testSms = useTestSms();

  const [activeTab, setActiveTab] = useState<'templates' | 'events'>('templates');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<SmsTemplateRow | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [previewTemplate, setPreviewTemplate] = useState<SmsTemplateRow | null>(null);
  const [testPhoneNumber, setTestPhoneNumber] = useState('');
  const [formData, setFormData] = useState({ name: '', body: '' });

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const preview = useSmsPreview(previewTemplate?.messageBody ?? '', []);
  const sample = preview.data?.[0];

  const templates = templatesQuery.data?.items ?? [];
  const allTemplates = options.data ?? [];
  const eventRows = events.data?.items ?? [];
  const variables = overview.data?.variables ?? [];

  const handleOpenAddModal = () => {
    setEditingTemplate(null);
    setFormData({ name: '', body: '' });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (tpl: SmsTemplateRow) => {
    setEditingTemplate(tpl);
    setFormData({ name: tpl.templateName, body: tpl.messageBody });
    setIsModalOpen(true);
  };

  const insertVariableToBody = (tag: string) => {
    const textarea = textareaRef.current;
    if (!textarea) {
      setFormData((prev) => ({ ...prev, body: `${prev.body}${prev.body ? ' ' : ''}${tag}` }));
      return;
    }
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    setFormData((prev) => ({ ...prev, body: prev.body.substring(0, start) + tag + prev.body.substring(end) }));
    requestAnimationFrame(() => {
      textarea.focus();
      textarea.setSelectionRange(start + tag.length, start + tag.length);
    });
  };

  const handleSaveTemplate = () => {
    if (!formData.name.trim() || !formData.body.trim()) {
      toast.error('Template name and body are required');
      return;
    }
    saveTemplate.mutate(
      { id: editingTemplate?.id, name: formData.name.trim(), body: formData.body },
      {
        onSuccess: () => {
          toast.success(editingTemplate ? 'Template updated successfully' : 'New template created successfully');
          setIsModalOpen(false);
        },
      },
    );
  };

  const handleTestDispatch = () => {
    if (!previewTemplate) return;
    if (!testPhoneNumber.trim()) {
      toast.error('Enter a test phone number');
      return;
    }
    testSms.mutate(
      { mobile: testPhoneNumber.trim(), content: previewTemplate.messageBody, customerId: sample?.customerId },
      {
        onSuccess: () => {
          toast.success(`Test message sent to ${testPhoneNumber.trim()}`);
          setPreviewTemplate(null);
        },
      },
    );
  };

  const columns = useMemo<LegacyColumnDef<SmsTemplateRow, unknown>[]>(
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
            variant={row.original.templateType === 'default' ? 'default' : 'secondary'}
            className="capitalize text-[11px] gap-1"
          >
            {row.original.templateType === 'default' && <Lock className="h-3 w-3" />}
            {row.original.templateType === 'default' ? 'system' : 'custom'}
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
              {row.original.variables.map((v) => (
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
            {row.original.editable && (
              <>
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
              </>
            )}
          </div>
        ),
      },
    ],
    [],
  );

  if (templatesQuery.isLoading) return <PageSkeleton variant="table" />;
  if (templatesQuery.isError && !templatesQuery.data) {
    return (
      <EmptyState
        title="Failed to load templates"
        description="Could not fetch SMS templates."
        actionLabel="Retry"
        onAction={() => templatesQuery.refetch()}
      />
    );
  }

  const activeEventsCount = eventRows.filter((e) => e.enabled).length;
  const canEditEvents = events.data?.canEdit ?? false;

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
          { label: 'Total Templates', value: options.data ? allTemplates.length : (templatesQuery.data?.meta.total ?? 0) },
          { label: 'System Templates', value: options.data ? allTemplates.filter((t) => t.templateType === 'default').length : '—' },
          { label: 'Custom Templates', value: options.data ? allTemplates.filter((t) => t.templateType === 'custom').length : '—' },
          { label: 'Active Automated Triggers', value: events.data ? `${activeEventsCount} of ${eventRows.length}` : '—' },
          { label: 'Default Gateway', value: overview.data?.gateway.name ?? 'Not configured' },
        ]}
      />

      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'templates' | 'events')} className="space-y-4">
        <TabsList className="bg-muted/40 p-1 border border-border/60">
          <TabsTrigger value="templates" className="gap-2">
            <FileText className="h-4 w-4" />
            Message Templates ({templatesQuery.data?.meta.total ?? 0})
          </TabsTrigger>
          <TabsTrigger value="events" className="gap-2">
            <Bell className="h-4 w-4" />
            Event Triggers ({activeEventsCount}/{eventRows.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="templates" className="space-y-4">
          <Card className="border-border/60 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Registered SMS Templates</CardTitle>
              <CardDescription>
                System templates are shared by every account and read-only; custom templates are yours to edit.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <DataTable
                columns={columns}
                data={templates}
                isLoading={templatesQuery.isFetching && !templatesQuery.data}
                getRowId={(row) => row.id}
                searchKey="templateName"
                searchPlaceholder="Search templates by name or body..."
                emptyTitle="No templates found"
                emptyDescription="Create your first SMS template to get started."
                server={{
                  page,
                  pageSize,
                  total: templatesQuery.data?.meta.total ?? 0,
                  onPageChange: setPage,
                  onPageSizeChange: (size) => {
                    setPageSize(size);
                    setPage(1);
                  },
                  search,
                  onSearchChange: (q) => {
                    setSearch(q);
                    setPage(1);
                  },
                }}
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
                Which template is sent automatically on each billing and subscriber event
                {!canEditEvents && events.data ? ' — managed by your ISP admin (read-only)' : ''}
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0 divide-y divide-border/50 border-t border-border/60">
              {events.isLoading ? (
                <p className="p-4 text-xs text-muted-foreground">Loading event triggers…</p>
              ) : events.isError ? (
                <div className="p-4">
                  <EmptyState title="Could not load event triggers" actionLabel="Retry" onAction={() => events.refetch()} />
                </div>
              ) : (
                eventRows.map((evt) => (
                  <div
                    key={evt.event}
                    className="p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 hover:bg-muted/20 transition-colors"
                  >
                    <div className="space-y-1.5 max-w-xl">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm text-foreground">{evt.label}</span>
                        <Badge
                          variant={evt.enabled ? 'default' : 'secondary'}
                          className={`text-[10px] ${evt.enabled ? 'bg-emerald-600 hover:bg-emerald-600 text-white' : ''}`}
                        >
                          {evt.enabled ? 'Active Trigger' : 'Disabled'}
                        </Badge>
                        {!evt.configured && (
                          <Badge variant="outline" className="text-[10px]">
                            Default
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">{evt.description}</p>
                      <div className="flex items-center gap-2 pt-1">
                        <span className="text-xs font-medium text-muted-foreground">Assigned Template:</span>
                        <Select
                          value={evt.templateId}
                          disabled={!canEditEvents || updateEvent.isPending}
                          onValueChange={(val) => {
                            if (val)
                              updateEvent.mutate(
                                { event: evt.event, templateId: val, enabled: evt.enabled },
                                { onSuccess: () => toast.success('Event template mapping updated') },
                              );
                          }}
                        >
                          <SelectTrigger className="h-8 text-xs font-mono w-56">
                            <SelectValue placeholder="Select template..." />
                          </SelectTrigger>
                          <SelectContent>
                            {allTemplates.map((t) => (
                              <SelectItem key={t.id} value={t.id} className="text-xs">
                                {t.templateName}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <Switch
                      checked={evt.enabled}
                      disabled={!canEditEvents || updateEvent.isPending}
                      onCheckedChange={(checked) =>
                        updateEvent.mutate(
                          { event: evt.event, templateId: evt.templateId, enabled: checked },
                          { onSuccess: () => toast.success(`'${evt.label}' trigger ${checked ? 'enabled' : 'disabled'}`) },
                        )
                      }
                    />
                  </div>
                ))
              )}
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
            <DialogDescription>Define your template and insert personalized placeholders.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
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
              <div className="flex items-center justify-between">
                <Label className="text-xs font-semibold">Template Message Body</Label>
                <span className="text-[11px] font-mono text-muted-foreground">
                  {formData.body.length} chars | {smsParts(formData.body)} part(s)
                </span>
              </div>
              <Textarea
                ref={textareaRef}
                value={formData.body}
                onChange={(e) => setFormData({ ...formData, body: e.target.value })}
                placeholder="Dear {name}, your monthly bill of {amount} is due on {expire_date}..."
                className="h-32 font-mono text-xs leading-relaxed resize-y"
              />
            </div>

            {variables.length > 0 && (
              <div className="space-y-1.5">
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Sparkles className="h-3.5 w-3.5 text-primary" />
                  <span>Click placeholder to insert at cursor:</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {variables.map((p) => (
                    <button
                      key={p.tag}
                      type="button"
                      onClick={() => insertVariableToBody(p.tag)}
                      title={p.label}
                      className="text-xs px-2 py-0.5 rounded bg-secondary hover:bg-secondary/80 text-secondary-foreground font-mono border border-border/40 transition-colors"
                    >
                      {p.tag}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveTemplate} disabled={saveTemplate.isPending} className="gap-1.5 bg-primary text-primary-foreground">
              <CheckCircle2 className="h-4 w-4" />
              {saveTemplate.isPending ? 'Saving…' : editingTemplate ? 'Update Template' : 'Save Template'}
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
            <DialogDescription>Rendered by the server against one of your active customers</DialogDescription>
          </DialogHeader>
          {previewTemplate && (
            <div className="space-y-4 py-2 text-xs">
              <div className="space-y-1.5">
                <span className="text-muted-foreground font-semibold">
                  Rendered Sample SMS{sample ? ` (for ${sample.name})` : ''}:
                </span>
                <div className="p-3 rounded-lg bg-muted/40 font-mono text-xs border border-border/60 leading-relaxed whitespace-pre-wrap">
                  {preview.isFetching && !sample
                    ? 'Rendering…'
                    : (sample?.message ?? previewTemplate.messageBody)}
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
              <Button onClick={handleTestDispatch} disabled={testSms.isPending} className="gap-1.5 bg-primary text-primary-foreground">
                <Send className="h-4 w-4" />
                {testSms.isPending ? 'Sending…' : 'Send Test SMS'}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={(open) => !open && setDeleteId(null)}
        title="Delete SMS Template"
        description="Are you sure you want to delete this SMS template? Event triggers using it fall back to the system default."
        confirmLabel="Delete"
        destructive
        onConfirm={() => {
          if (!deleteId) return;
          deleteTemplate.mutate(deleteId, {
            onSuccess: () => {
              toast.success('Template deleted successfully');
              setDeleteId(null);
            },
          });
        }}
      />
    </div>
  );
}
