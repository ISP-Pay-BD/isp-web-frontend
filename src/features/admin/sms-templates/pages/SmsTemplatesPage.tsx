'use client';

import { useMemo, useState } from 'react';
import type { LegacyColumnDef, LegacyRow } from '@tanstack/react-table/legacy';
import { PageHeader } from '@/features/shared/page-header';
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
import { Switch } from '@/components/ui/switch';
import { PageSkeleton } from '@/components/shared/LoadingSkeleton';
import { EmptyState } from '@/components/shared/EmptyState';
import { Can } from '@/components/shared/Can';
import { DataTable } from '@/features/shared/data-table';
import { toast } from 'sonner';
import { Plus, Bell, Edit, Trash2, FileText } from 'lucide-react';
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
    t.messageBody.toLowerCase().includes(q)
  );
};

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
  const [formData, setFormData] = useState({
    name: '',
    type: 'custom' as 'custom' | 'system',
    body: '',
  });

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
    toast.success('Template deleted');
  };

  const handleToggleEvent = (eventId: string) => {
    setEditedEvents(
      events.map((e) => (e.id === eventId ? { ...e, enabled: !e.enabled } : e)),
    );
    toast.success('Event notification setting updated');
  };

  const columns = useMemo<LegacyColumnDef<SmsTemplate, unknown>[]>(
    () => [
      {
        accessorKey: 'templateName',
        header: 'Name',
        size: 180,
        enableHiding: false,
        cell: ({ row }) => (
          <span className="font-medium">{row.original.templateName}</span>
        ),
      },
      {
        accessorKey: 'templateType',
        header: 'Type',
        size: 100,
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
        header: 'Body',
        size: 320,
        cell: ({ row }) => (
          <span className="font-mono text-xs text-muted-foreground max-w-md line-clamp-2">
            {row.original.messageBody}
          </span>
        ),
      },
      {
        id: 'actions',
        header: () => <span className="sr-only">Action</span>,
        size: 100,
        enableSorting: false,
        enableHiding: false,
        cell: ({ row }) => (
          <div className="flex justify-end gap-1">
            <Can menu="sms_template" action="update">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => handleOpenEditModal(row.original)}
              >
                <Edit className="h-4 w-4" />
              </Button>
            </Can>
            <Can menu="sms_template" action="delete">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-destructive"
                onClick={() => handleDeleteTemplate(row.original.id)}
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

  return (
    <div className="space-y-6">
      <PageHeader
        title="SMS Templates"
        subtitle="Manage SMS messaging templates and automatic system event triggers"
        breadcrumb={[
          { label: 'Dashboard', url: '/admin/dashboard' },
          { label: 'Communications' },
          { label: 'Templates' },
        ]}
        actions={
          <Can menu="sms_template" action="create">
            <Button onClick={handleOpenAddModal} className="gap-1.5">
              <Plus className="h-4 w-4" />
              Add Template
            </Button>
          </Can>
        }
      />

      <Tabs
        value={activeTab}
        onValueChange={(v) => setActiveTab(v as 'templates' | 'events')}
        className="space-y-4"
      >
        <TabsList>
          <TabsTrigger value="templates" className="gap-2">
            <FileText className="h-4 w-4" />
            Templates ({templates.length})
          </TabsTrigger>
          <TabsTrigger value="events" className="gap-2">
            <Bell className="h-4 w-4" />
            Event Notifications ({events.filter((e) => e.enabled).length}/{events.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="templates">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Message Templates</CardTitle>
              <CardDescription>
                Reusable SMS messages with customer personalization tags
              </CardDescription>
            </CardHeader>
            <CardContent>
              <DataTable
                columns={columns}
                data={templates}
                getRowId={(row) => row.id}
                searchKey="templateName"
                searchPlaceholder="Search templates..."
                searchFilterFn={templateSearchFilter}
                facetFilters={[{ columnId: 'templateType', title: 'Type' }]}
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

        <TabsContent value="events">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Automatic Event SMS Triggers</CardTitle>
              <CardDescription>
                System triggers that automatically dispatch SMS when actions occur
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0 divide-y border-t">
              {events.map((evt) => {
                const assignedTpl = templates.find((t) => t.id === evt.templateId);
                return (
                  <div key={evt.id} className="p-4 flex items-center justify-between gap-4">
                    <div className="space-y-1 max-w-xl">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm">{evt.eventName}</span>
                        <Badge
                          variant="outline"
                          className={evt.enabled ? 'text-emerald-600 border-emerald-300' : ''}
                        >
                          {evt.enabled ? 'Active' : 'Disabled'}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">{evt.description}</p>
                      <p className="text-xs text-muted-foreground">
                        Template:{' '}
                        <span className="font-mono">
                          {assignedTpl?.templateName ?? 'Default System'}
                        </span>
                      </p>
                    </div>
                    <Switch
                      checked={evt.enabled}
                      onCheckedChange={() => handleToggleEvent(evt.id)}
                    />
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editingTemplate ? 'Edit SMS Template' : 'Add New SMS Template'}
            </DialogTitle>
            <DialogDescription>
              Define your template name and insert personalized placeholders.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Template Name</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Template Body</Label>
              <Textarea
                value={formData.body}
                onChange={(e) => setFormData({ ...formData, body: e.target.value })}
                className="h-28 font-mono text-xs"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveTemplate}>
              {editingTemplate ? 'Update' : 'Create'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
