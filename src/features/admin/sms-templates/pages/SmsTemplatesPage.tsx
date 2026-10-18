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
import { useTranslations } from '@/i18n/locale-context';

export function SmsTemplatesPage() {
  const t = useTranslations();
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
      toast.error(t('admin.smsTemplates.page.required', 'Template name and body are required'));
      return;
    }
    saveTemplate.mutate(
      { id: editingTemplate?.id, name: formData.name.trim(), body: formData.body },
      {
        onSuccess: () => {
          toast.success(editingTemplate ? t('admin.smsTemplates.page.updated', 'Template updated successfully') : t('admin.smsTemplates.page.created', 'New template created successfully'));
          setIsModalOpen(false);
        },
      },
    );
  };

  const handleTestDispatch = () => {
    if (!previewTemplate) return;
    if (!testPhoneNumber.trim()) {
      toast.error(t('admin.smsTemplates.page.phoneRequired', 'Enter a test phone number'));
      return;
    }
    testSms.mutate(
      { mobile: testPhoneNumber.trim(), content: previewTemplate.messageBody, customerId: sample?.customerId },
      {
        onSuccess: () => {
          toast.success(t('admin.smsTemplates.page.testSent', 'Test message sent to {phone}', { phone: testPhoneNumber.trim() }));
          setPreviewTemplate(null);
        },
      },
    );
  };

  const columns = useMemo<LegacyColumnDef<SmsTemplateRow, unknown>[]>(
    () => [
      {
        accessorKey: 'templateName',
        header: t('admin.smsTemplates.page.colName', 'Template Name'),
        size: 200,
        enableHiding: false,
        cell: ({ row }) => (
          <div>
            <span className="font-semibold text-foreground block">{row.original.templateName}</span>
            <span className="text-xs text-muted-foreground font-mono">ID: {row.original.id}</span>
          </div>
        ),
      },
      {
        accessorKey: 'templateType',
        header: t('admin.smsTemplates.page.colCategory', 'Category'),
        size: 110,
        cell: ({ row }) => (
          <Badge
            variant={row.original.templateType === 'default' ? 'default' : 'secondary'}
            className="capitalize text-xs gap-1"
          >
            {row.original.templateType === 'default' && <Lock className="h-3 w-3" />}
            {row.original.templateType === 'default' ? t('admin.smsTemplates.page.system', 'system') : t('admin.smsTemplates.page.custom', 'custom')}
          </Badge>
        ),
      },
      {
        accessorKey: 'messageBody',
        header: t('admin.smsTemplates.page.colBody', 'Message Body Preview'),
        size: 380,
        cell: ({ row }) => (
          <div className="space-y-1 py-1 max-w-lg">
            <span className="font-mono text-xs text-foreground/90 line-clamp-2 leading-relaxed bg-muted/20 p-1.5 rounded border border-border/40">
              {row.original.messageBody}
            </span>
            <div className="flex flex-wrap gap-1">
              {row.original.variables.map((v) => (
                <span key={v} className="text-xs font-mono px-1.5 py-0.5 rounded bg-primary/10 text-primary border border-primary/20">
                  {`{${v}}`}
                </span>
              ))}
            </div>
          </div>
        ),
      },
      {
        id: 'actions',
        header: () => <span className="sr-only">{t('common.actions', 'Actions')}</span>,
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
              title={t('admin.smsTemplates.page.previewTitle', 'Test Preview & Dispatch')}
              aria-label={t('admin.smsTemplates.page.previewTitle', 'Test Preview & Dispatch')}
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
                    title={t('admin.smsTemplates.page.editTemplate', 'Edit Template')}
                    aria-label={t('admin.smsTemplates.page.editTemplate', 'Edit Template')}
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
                    title={t('admin.smsTemplates.page.deleteTemplate', 'Delete Template')}
                    aria-label={t('admin.smsTemplates.page.deleteTemplate', 'Delete Template')}
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
    [t],
  );

  if (templatesQuery.isLoading) return <PageSkeleton variant="table" />;
  if (templatesQuery.isError && !templatesQuery.data) {
    return (
      <EmptyState variant="error"
        title={t('admin.smsTemplates.page.loadFailed', 'Failed to load templates')}
        description={t('admin.smsTemplates.page.loadFailedHint', 'Could not fetch SMS templates.')}
        actionLabel={t('common.retry', 'Retry')}
        onAction={() => templatesQuery.refetch()}
      />
    );
  }

  const activeEventsCount = eventRows.filter((e) => e.enabled).length;
  const canEditEvents = events.data?.canEdit ?? false;

  return (
    <div className="space-y-6">
      <PageHeader
        title={t('admin.smsTemplates.page.title', 'SMS Templates & Triggers')}
        subtitle={t('admin.smsTemplates.page.subtitle', 'Manage reusable message templates and automatic system event notifications')}
        breadcrumb={[
          { label: 'Dashboard', url: '/admin/dashboard' },
          { label: t('admin.smsTemplates.page.crumbComms', 'Communications') },
          { label: t('admin.smsTemplates.page.crumbTemplates', 'Templates & Triggers') },
        ]}
        actions={
          <Can menu="sms_template" action="create">
            <Button onClick={handleOpenAddModal} className="gap-1.5 bg-primary text-primary-foreground">
              <Plus className="h-4 w-4" />
              {t('admin.smsTemplates.page.addTemplate', 'Add Template')}
            </Button>
          </Can>
        }
      />

      <OpsSummaryStrip
        items={[
          { label: t('admin.smsTemplates.page.kpiTotal', 'Total Templates'), value: options.data ? allTemplates.length : (templatesQuery.data?.meta.total ?? 0) },
          { label: t('admin.smsTemplates.page.kpiSystem', 'System Templates'), value: options.data ? allTemplates.filter((tpl) => tpl.templateType === 'default').length : '—' },
          { label: t('admin.smsTemplates.page.kpiCustom', 'Custom Templates'), value: options.data ? allTemplates.filter((tpl) => tpl.templateType === 'custom').length : '—' },
          { label: t('admin.smsTemplates.page.kpiTriggers', 'Active Automated Triggers'), value: events.data ? t('admin.smsTemplates.page.activeOf', '{active} of {total}', { active: activeEventsCount, total: eventRows.length }) : '—' },
          { label: t('admin.smsTemplates.page.kpiGateway', 'Default Gateway'), value: overview.data?.gateway.name ?? t('admin.smsTemplates.page.notConfigured', 'Not configured') },
        ]}
      />

      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'templates' | 'events')} className="space-y-4">
        <TabsList className="bg-muted/40 p-1 border border-border/60">
          <TabsTrigger value="templates" className="gap-2">
            <FileText className="h-4 w-4" />
            {t('admin.smsTemplates.page.tabTemplates', 'Message Templates ({n})', { n: templatesQuery.data?.meta.total ?? 0 })}
          </TabsTrigger>
          <TabsTrigger value="events" className="gap-2">
            <Bell className="h-4 w-4" />
            {t('admin.smsTemplates.page.tabEvents', 'Event Triggers ({active}/{total})', { active: activeEventsCount, total: eventRows.length })}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="templates" className="space-y-4">
          <Card className="border-border/60 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">{t('admin.smsTemplates.page.registered', 'Registered SMS Templates')}</CardTitle>
              <CardDescription>
                {t('admin.smsTemplates.page.registeredHint', 'System templates are shared by every account and read-only; custom templates are yours to edit.')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <DataTable urlState
                columns={columns}
                data={templates}
                isLoading={templatesQuery.isFetching && !templatesQuery.data}
                getRowId={(row) => row.id}
                searchKey="templateName"
                searchPlaceholder={t('admin.smsTemplates.page.searchPlaceholder', 'Search templates by name or body...')}
                emptyTitle={t('admin.smsTemplates.page.emptyTitle', 'No templates found')}
                emptyDescription={t('admin.smsTemplates.page.emptyHint', 'Create your first SMS template to get started.')}
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
                      {t('admin.smsTemplates.page.addTemplate', 'Add Template')}
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
                {t('admin.smsTemplates.page.eventsTitle', 'Automatic System Event SMS Triggers')}
              </CardTitle>
              <CardDescription>
                {t('admin.smsTemplates.page.eventsHint', 'Which template is sent automatically on each billing and subscriber event')}
                {!canEditEvents && events.data ? ` ${t('admin.smsTemplates.page.eventsReadOnly', '— managed by your ISP admin (read-only)')}` : ''}
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0 divide-y divide-border/50 border-t border-border/60">
              {events.isLoading ? (
                <p className="p-4 text-xs text-muted-foreground">{t('admin.smsTemplates.page.loadingEvents', 'Loading event triggers…')}</p>
              ) : events.isError ? (
                <div className="p-4">
                  <EmptyState variant="error" title={t('admin.smsTemplates.page.eventsFailed', 'Could not load event triggers')} actionLabel={t('common.retry', 'Retry')} onAction={() => events.refetch()} />
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
                          tone={evt.enabled ? 'success' : undefined} className="text-xs"
                        >
                          {evt.enabled ? t('admin.smsTemplates.page.triggerActive', 'Active Trigger') : t('admin.smsTemplates.page.triggerDisabled', 'Disabled')}
                        </Badge>
                        {!evt.configured && (
                          <Badge variant="outline" className="text-xs">
                            {t('admin.smsTemplates.page.triggerDefault', 'Default')}
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">{evt.description}</p>
                      <div className="flex items-center gap-2 pt-1">
                        <span className="text-xs font-medium text-muted-foreground">{t('admin.smsTemplates.page.assigned', 'Assigned Template:')}</span>
                        <Select
                          value={evt.templateId}
                          disabled={!canEditEvents || updateEvent.isPending}
                          onValueChange={(val) => {
                            if (val)
                              updateEvent.mutate(
                                { event: evt.event, templateId: val, enabled: evt.enabled },
                                { onSuccess: () => toast.success(t('admin.smsTemplates.page.mappingUpdated', 'Event template mapping updated')) },
                              );
                          }}
                        >
                          <SelectTrigger className="h-8 text-xs font-mono w-56">
                            <SelectValue placeholder={t('admin.smsTemplates.page.selectTemplate', 'Select template...')} />
                          </SelectTrigger>
                          <SelectContent>
                            {allTemplates.map((tpl) => (
                              <SelectItem key={tpl.id} value={tpl.id} className="text-xs">
                                {tpl.templateName}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <Switch aria-label={evt.label}
                      checked={evt.enabled}
                      disabled={!canEditEvents || updateEvent.isPending}
                      onCheckedChange={(checked) =>
                        updateEvent.mutate(
                          { event: evt.event, templateId: evt.templateId, enabled: checked },
                          { onSuccess: () => toast.success(checked ? t('admin.smsTemplates.page.triggerEnabledToast', "'{label}' trigger enabled", { label: evt.label }) : t('admin.smsTemplates.page.triggerDisabledToast', "'{label}' trigger disabled", { label: evt.label })) },
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
              {editingTemplate ? t('admin.smsTemplates.page.editTitle', 'Edit SMS Template') : t('admin.smsTemplates.page.createTitle', 'Create New SMS Template')}
            </DialogTitle>
            <DialogDescription>{t('admin.smsTemplates.page.formDesc', 'Define your template and insert personalized placeholders.')}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="template-name" className="text-xs font-semibold">{t('admin.smsTemplates.page.colName', 'Template Name')}</Label>
              <Input id="template-name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder={t('admin.smsTemplates.page.namePlaceholder', 'e.g. Monthly Bill Reminder')}
                className="text-xs"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-semibold">{t('admin.smsTemplates.page.bodyLabel', 'Template Message Body')}</Label>
                <span className="text-xs font-mono text-muted-foreground">
                  {t('admin.smsTemplates.page.counter', '{chars} chars | {parts} part(s)', { chars: formData.body.length, parts: smsParts(formData.body) })}
                </span>
              </div>
              <Textarea
                ref={textareaRef}
                value={formData.body}
                onChange={(e) => setFormData({ ...formData, body: e.target.value })}
                placeholder={t('admin.smsTemplates.page.bodyPlaceholder', 'Dear {name}, your monthly bill of {amount} is due on {expire_date}...')}
                className="h-32 font-mono text-xs leading-relaxed resize-y"
              />
            </div>

            {variables.length > 0 && (
              <div className="space-y-1.5">
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Sparkles className="h-3.5 w-3.5 text-primary" />
                  <span>{t('admin.smsTemplates.page.insertHint', 'Click placeholder to insert at cursor:')}</span>
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
              {t('common.cancel', 'Cancel')}
            </Button>
            <Button onClick={handleSaveTemplate} disabled={saveTemplate.isPending} className="gap-1.5 bg-primary text-primary-foreground">
              <CheckCircle2 className="h-4 w-4" />
              {saveTemplate.isPending ? t('admin.smsTemplates.page.saving', 'Saving…') : editingTemplate ? t('admin.smsTemplates.page.update', 'Update Template') : t('admin.smsTemplates.page.save', 'Save Template')}
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
              {t('admin.smsTemplates.page.previewHeading', 'Template Preview & Test Send')}
            </DialogTitle>
            <DialogDescription>{t('admin.smsTemplates.page.previewDesc', 'Rendered by the server against one of your active customers')}</DialogDescription>
          </DialogHeader>
          {previewTemplate && (
            <div className="space-y-4 py-2 text-xs">
              <div className="space-y-1.5">
                <span className="text-muted-foreground font-semibold">
                  {sample ? t('admin.smsTemplates.page.sampleFor', 'Rendered Sample SMS (for {name}):', { name: sample.name }) : t('admin.smsTemplates.page.sample', 'Rendered Sample SMS:')}
                </span>
                <div className="p-3 rounded-lg bg-muted/40 font-mono text-xs border border-border/60 leading-relaxed whitespace-pre-wrap">
                  {preview.isFetching && !sample
                    ? t('admin.smsTemplates.page.rendering', 'Rendering…')
                    : (sample?.message ?? previewTemplate.messageBody)}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="test-recipient-phone" className="text-xs font-semibold">{t('admin.smsTemplates.page.testPhone', 'Test Recipient Phone')}</Label>
                <Input id="test-recipient-phone"
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
              {t('common.close', 'Close')}
            </Button>
            {previewTemplate && (
              <Button onClick={handleTestDispatch} disabled={testSms.isPending} className="gap-1.5 bg-primary text-primary-foreground">
                <Send className="h-4 w-4" />
                {testSms.isPending ? t('admin.smsTemplates.page.sending', 'Sending…') : t('admin.smsTemplates.page.sendTest', 'Send Test SMS')}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={(open) => !open && setDeleteId(null)}
        title={t('admin.smsTemplates.page.deleteTitle', 'Delete SMS Template')}
        description={t('admin.smsTemplates.page.deleteDesc', 'Are you sure you want to delete this SMS template? Event triggers using it fall back to the system default.')}
        confirmLabel={t('common.delete', 'Delete')}
        destructive
        onConfirm={() => {
          if (!deleteId) return;
          deleteTemplate.mutate(deleteId, {
            onSuccess: () => {
              toast.success(t('admin.smsTemplates.page.deleted', 'Template deleted successfully'));
              setDeleteId(null);
            },
          });
        }}
      />
    </div>
  );
}
