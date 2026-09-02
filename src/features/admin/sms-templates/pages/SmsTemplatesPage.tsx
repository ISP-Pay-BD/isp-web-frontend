'use client';

import { useState } from 'react';
import { PageHeader } from '@/features/shared/page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { PageSkeleton } from '@/components/shared/LoadingSkeleton';
import { EmptyState } from '@/components/shared/EmptyState';
import { Can } from '@/components/shared/Can';
import { toast } from 'sonner';
import { Plus, Bell, Edit, Trash2, Search, FileText } from 'lucide-react';
import type { SmsEventConfig, SmsTemplate } from '@/data/admin/comms.data';
import { useSmsData } from '@/features/admin/sms/hooks/use-sms';

export function SmsTemplatesPage() {
  const { data, isLoading, isError, refetch } = useSmsData();
  const serverTemplates = data?.templates ?? [];
  const serverEvents = data?.events ?? [];
  const [editedTemplates, setEditedTemplates] = useState<typeof serverTemplates | null>(null);
  const [editedEvents, setEditedEvents] = useState<typeof serverEvents | null>(null);
  const templates = editedTemplates ?? serverTemplates;
  const events = editedEvents ?? serverEvents;
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'templates' | 'events'>('templates');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<SmsTemplate | null>(null);
  const [formData, setFormData] = useState({ name: '', type: 'custom' as 'custom' | 'system', body: '' });

  if (isLoading) return <PageSkeleton />;
  if (isError) {
    return (
      <EmptyState title="Failed to load templates" description="Could not fetch SMS templates." actionLabel="Retry" onAction={() => refetch()} />
    );
  }

  const filteredTemplates = templates.filter(
    (t) =>
      t.templateName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.messageBody.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
            ? { ...t, templateName: formData.name, templateType: formData.type, messageBody: formData.body }
            : t
        )
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
    setEditedEvents(events.map((e) => (e.id === eventId ? { ...e, enabled: !e.enabled } : e)));
    toast.success('Event notification setting updated');
  };

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

      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'templates' | 'events')} className="space-y-4">
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
            <CardHeader className="pb-3 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-base">Message Templates</CardTitle>
                <CardDescription>Reusable SMS messages with customer personalization tags</CardDescription>
              </div>
              <div className="relative w-64">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search templates..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-8 text-sm h-9" />
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {filteredTemplates.length === 0 ? (
                <EmptyState title="No templates found" description="Create your first SMS template to get started." />
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">#</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Body</TableHead>
                      <TableHead className="text-right">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredTemplates.map((tpl, index) => (
                      <TableRow key={tpl.id}>
                        <TableCell className="font-mono text-xs">{index + 1}</TableCell>
                        <TableCell className="font-medium">{tpl.templateName}</TableCell>
                        <TableCell>
                          <Badge variant={tpl.templateType === 'system' ? 'default' : 'secondary'} className="capitalize text-[11px]">
                            {tpl.templateType}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-mono text-xs text-muted-foreground max-w-md line-clamp-2">{tpl.messageBody}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1">
                            <Can menu="sms_template" action="update">
                              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleOpenEditModal(tpl)}>
                                <Edit className="h-4 w-4" />
                              </Button>
                            </Can>
                            <Can menu="sms_template" action="delete">
                              <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => handleDeleteTemplate(tpl.id)}>
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </Can>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="events">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Automatic Event SMS Triggers</CardTitle>
              <CardDescription>System triggers that automatically dispatch SMS when actions occur</CardDescription>
            </CardHeader>
            <CardContent className="p-0 divide-y border-t">
              {events.map((evt) => {
                const assignedTpl = templates.find((t) => t.id === evt.templateId);
                return (
                  <div key={evt.id} className="p-4 flex items-center justify-between gap-4">
                    <div className="space-y-1 max-w-xl">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm">{evt.eventName}</span>
                        <Badge variant="outline" className={evt.enabled ? 'text-emerald-600 border-emerald-300' : ''}>
                          {evt.enabled ? 'Active' : 'Disabled'}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">{evt.description}</p>
                      <p className="text-xs text-muted-foreground">
                        Template: <span className="font-mono">{assignedTpl?.templateName ?? 'Default System'}</span>
                      </p>
                    </div>
                    <Switch checked={evt.enabled} onCheckedChange={() => handleToggleEvent(evt.id)} />
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
            <DialogTitle>{editingTemplate ? 'Edit SMS Template' : 'Add New SMS Template'}</DialogTitle>
            <DialogDescription>Define your template name and insert personalized placeholders.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Template Name</Label>
              <Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Template Body</Label>
              <Textarea value={formData.body} onChange={(e) => setFormData({ ...formData, body: e.target.value })} className="h-28 font-mono text-xs" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button onClick={handleSaveTemplate}>{editingTemplate ? 'Update' : 'Create'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
