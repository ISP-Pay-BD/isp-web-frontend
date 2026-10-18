'use client';

import { useMemo, useState } from 'react';
import type { LegacyColumnDef } from '@tanstack/react-table/legacy';
import { PageHeader } from '@/features/admin/shared';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { PageSkeleton } from '@/components/shared/LoadingSkeleton';
import { WhatsAppLoadError } from '../components/WhatsAppLoadError';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { OpsSummaryStrip } from '@/components/shared/OpsSummaryStrip';
import { DataTable } from '@/features/shared/data-table';
import { toast } from 'sonner';
import { Plus, FileCode, Send, CheckCircle2, Clock, AlertTriangle, RefreshCw, Edit, Trash2 } from 'lucide-react';
import { formatDate } from '@/lib/format';
import { WhatsAppNavLinks } from './WhatsAppInboxPage';
import {
  useDeleteWhatsAppTemplate,
  useSaveWhatsAppTemplate,
  useTestWhatsAppTemplate,
  useWhatsAppTemplates,
  type WaTemplateInput,
} from '../hooks/use-whatsapp';
import type { WaCategory, WaTemplate } from '../types';

const EMPTY: WaTemplateInput = { name: '', category: 'UTILITY', language: 'en', body: '', eventKey: '', metaTemplateId: '', enabled: true };

/** {{1}}, {{2}}… placeholders used by a Meta template body. */
const paramCount = (body: string) => {
  const nums = Array.from(body.matchAll(/\{\{(\d+)\}\}/g), (m) => Number(m[1]));
  return nums.length ? Math.max(...nums) : 0;
};

export function WhatsAppTemplatesPage() {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const templates = useWhatsAppTemplates({ page, pageSize, search, category });
  const saveTemplate = useSaveWhatsAppTemplate();
  const deleteTemplate = useDeleteWhatsAppTemplate();
  const testTemplate = useTestWhatsAppTemplate();

  const [editorOpen, setEditorOpen] = useState(false);
  const [form, setForm] = useState<WaTemplateInput>(EMPTY);
  const [testTarget, setTestTarget] = useState<WaTemplate | null>(null);
  const [testPhone, setTestPhone] = useState('');
  const [testParams, setTestParams] = useState<string[]>([]);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const openEditor = (tpl: WaTemplate | null) => {
    setForm(
      tpl
        ? {
            id: tpl.id,
            name: tpl.name,
            category: tpl.category,
            language: tpl.language,
            body: tpl.body,
            eventKey: tpl.eventKey,
            metaTemplateId: tpl.metaTemplateId,
            enabled: tpl.enabled,
          }
        : EMPTY,
    );
    setEditorOpen(true);
  };

  const openTest = (tpl: WaTemplate) => {
    setTestTarget(tpl);
    setTestParams(Array.from({ length: paramCount(tpl.body) }, () => ''));
  };

  const handleSave = () => {
    if (!form.name.trim()) {
      toast.error('Template name is required');
      return;
    }
    saveTemplate.mutate(
      { ...form, name: form.name.trim().toLowerCase().replace(/\s+/g, '_') },
      {
        onSuccess: () => {
          toast.success(form.id ? 'Template updated' : 'Template saved (status PENDING until approved by Meta)');
          setEditorOpen(false);
        },
      },
    );
  };

  const handleTest = () => {
    if (!testTarget) return;
    if (!testPhone.trim()) {
      toast.error('Enter a WhatsApp number');
      return;
    }
    testTemplate.mutate(
      { id: testTarget.id, to: testPhone.trim(), params: testParams },
      {
        onSuccess: () => {
          toast.success(`Template sent to ${testPhone.trim()}`);
          setTestTarget(null);
        },
      },
    );
  };

  const columns = useMemo<LegacyColumnDef<WaTemplate, unknown>[]>(
    () => [
      {
        accessorKey: 'name',
        header: 'Template Name',
        size: 200,
        enableHiding: false,
        cell: ({ row }) => (
          <div>
            <span className="font-mono font-semibold text-xs text-foreground block">{row.original.name}</span>
            <span className="text-[10px] text-muted-foreground font-mono">
              {row.original.eventKey ? `Event: ${row.original.eventKey}` : `ID: ${row.original.id}`}
            </span>
          </div>
        ),
      },
      {
        accessorKey: 'category',
        header: 'Category',
        size: 130,
        cell: ({ row }) => {
          const cat = row.original.category;
          return (
            <Badge
              variant="outline"
              className={`text-[10px] font-mono ${
                cat === 'UTILITY'
                  ? 'border-blue-300 text-blue-500 bg-blue-50/10'
                  : cat === 'AUTHENTICATION'
                    ? 'border-purple-300 text-purple-500 bg-purple-50/10'
                    : 'border-amber-300 text-amber-500 bg-amber-50/10'
              }`}
            >
              {cat}
            </Badge>
          );
        },
      },
      {
        accessorKey: 'language',
        header: 'Language',
        size: 90,
        cell: ({ row }) => (
          <Badge variant="secondary" className="uppercase font-mono text-[10px]">
            {row.original.language}
          </Badge>
        ),
      },
      {
        accessorKey: 'status',
        header: 'Meta Status',
        size: 120,
        cell: ({ row }) => {
          const status = row.original.status;
          return (
            <Badge
              variant={status === 'APPROVED' ? 'default' : status === 'REJECTED' ? 'destructive' : 'secondary'}
              className={`text-[10px] font-mono gap-1 ${status === 'APPROVED' ? 'bg-emerald-600 hover:bg-emerald-600 text-white' : ''}`}
            >
              {status === 'APPROVED' ? <CheckCircle2 className="h-3 w-3" /> : status === 'PENDING' ? <Clock className="h-3 w-3" /> : <AlertTriangle className="h-3 w-3" />}
              {status}
            </Badge>
          );
        },
      },
      {
        accessorKey: 'body',
        header: 'Message Body & Dynamic Variables',
        size: 360,
        cell: ({ row }) => (
          <span className="text-xs text-foreground/90 font-mono line-clamp-2 leading-relaxed bg-muted/20 p-2 rounded-lg border border-border/40">
            {row.original.body || '—'}
          </span>
        ),
      },
      {
        accessorKey: 'updatedAt',
        header: 'Updated',
        size: 110,
        cell: ({ row }) => <span className="text-xs font-mono text-muted-foreground">{row.original.updatedAt ? formatDate(row.original.updatedAt) : '—'}</span>,
      },
      {
        id: 'actions',
        header: () => <span className="sr-only">Actions</span>,
        size: 140,
        enableSorting: false,
        enableHiding: false,
        cell: ({ row }) => (
          <div className="flex items-center justify-end gap-1">
            {row.original.status === 'APPROVED' && (
              <Button
                variant="ghost"
                size="sm"
                className="h-8 text-xs gap-1 text-primary hover:bg-primary/10"
                onClick={() => openTest(row.original)}
                title="Send a test message"
              >
                <Send className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Test</span>
              </Button>
            )}
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEditor(row.original)} title="Edit">
              <Edit className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-destructive hover:bg-destructive/10"
              onClick={() => setDeleteId(row.original.id)}
              title="Delete"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        ),
      },
    ],
    [],
  );

  if (templates.isLoading) return <PageSkeleton variant="table" />;
  if (templates.isError && !templates.data) {
    return (
      <WhatsAppLoadError error={templates.error} title="Failed to load templates" fallback="Could not fetch WhatsApp templates." onRetry={() => templates.refetch()} />
    );
  }

  const stats = templates.data?.stats;

  return (
    <div className="space-y-6">
      <PageHeader
        title="WhatsApp Message Templates"
        subtitle="Meta message templates for utility alerts, OTPs, and promotional broadcasts"
        breadcrumb={[
          { label: 'Dashboard', url: '/admin/dashboard' },
          { label: 'WhatsApp' },
          { label: 'Templates' },
        ]}
        actions={
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="gap-1.5 text-xs" disabled={templates.isFetching} onClick={() => templates.refetch()}>
              <RefreshCw className="h-3.5 w-3.5 text-muted-foreground" />
              Refresh
            </Button>
            <Button size="sm" className="gap-1.5 bg-primary text-primary-foreground hover:bg-primary/90" onClick={() => openEditor(null)}>
              <Plus className="h-4 w-4" />
              Create Template
            </Button>
          </div>
        }
      />

      <WhatsAppNavLinks />

      <OpsSummaryStrip
        items={[
          { label: 'Total Templates', value: stats?.total ?? 0 },
          { label: 'Meta Approved', value: `${stats?.approved ?? 0} Templates` },
          { label: 'Pending Review', value: `${stats?.pending ?? 0} Templates` },
          { label: 'Utility Category', value: stats?.utility ?? 0 },
          { label: 'Marketing Category', value: stats?.marketing ?? 0 },
          { label: 'WABA ID', value: templates.data?.wabaId || '—' },
        ]}
      />

      <Card className="border-border/60 shadow-sm">
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <CardTitle className="text-base flex items-center gap-2">
                <FileCode className="h-4 w-4 text-primary" />
                Template Registry
              </CardTitle>
              <CardDescription>Approval status is set by Meta; only APPROVED templates can be sent</CardDescription>
            </div>
            <Select
              value={category}
              onValueChange={(v) => {
                if (v) {
                  setCategory(v);
                  setPage(1);
                }
              }}
            >
              <SelectTrigger className="h-9 w-[170px] text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All categories</SelectItem>
                <SelectItem value="UTILITY">Utility</SelectItem>
                <SelectItem value="AUTHENTICATION">Authentication</SelectItem>
                <SelectItem value="MARKETING">Marketing</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={columns}
            data={templates.data?.items ?? []}
            getRowId={(row) => row.id}
            searchKey="name"
            searchPlaceholder="Search templates by name or body..."
            emptyTitle="No WhatsApp templates found"
            emptyDescription="Register your Meta-approved templates to use them in alerts and campaigns."
            server={{
              page,
              pageSize,
              total: templates.data?.meta.total ?? 0,
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
              <Button size="sm" onClick={() => openEditor(null)} className="gap-1.5">
                <Plus className="h-4 w-4" />
                Create Template
              </Button>
            }
          />
        </CardContent>
      </Card>

      <Dialog open={editorOpen} onOpenChange={setEditorOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5 text-primary" />
              {form.id ? 'Edit WhatsApp Template' : 'Register WhatsApp Template'}
            </DialogTitle>
            <DialogDescription>
              Use the exact template name approved in your WhatsApp Business Manager. New templates start as PENDING.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label className="text-xs font-semibold">Template Name (Snake Case)</Label>
                <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. invoice_bill_reminder" className="font-mono text-xs" />
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-semibold">Category</Label>
                <Select value={form.category} onValueChange={(v) => { if (v) setForm({ ...form, category: v as WaCategory }); }}>
                  <SelectTrigger className="text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="UTILITY">UTILITY (Bills, Receipts)</SelectItem>
                    <SelectItem value="AUTHENTICATION">AUTHENTICATION (OTPs)</SelectItem>
                    <SelectItem value="MARKETING">MARKETING (Offers, Upgrades)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label className="text-xs font-semibold">Language</Label>
                <Select value={form.language} onValueChange={(v) => { if (v) setForm({ ...form, language: v }); }}>
                  <SelectTrigger className="text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en">English (en)</SelectItem>
                    <SelectItem value="bn">Bengali (bn)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-semibold">Event Key (optional)</Label>
                <Input value={form.eventKey} onChange={(e) => setForm({ ...form, eventKey: e.target.value })} placeholder="e.g. payment_done" className="font-mono text-xs" />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-semibold">Template Body Text (preview)</Label>
              <Textarea
                value={form.body}
                onChange={(e) => setForm({ ...form, body: e.target.value })}
                placeholder="Hello {{1}}, your monthly invoice for {{2}} is ready."
                className="h-28 font-mono text-xs leading-relaxed"
              />
              <p className="text-[11px] text-muted-foreground">
                Use <code className="font-mono bg-muted px-1 py-0.5 rounded text-primary">&#123;&#123;1&#125;&#125;</code> style parameters exactly as approved by Meta.
              </p>
            </div>
            <div className="flex items-center justify-between rounded-lg border border-border/60 p-3">
              <span className="font-semibold">Enabled for automatic event sends</span>
              <Switch checked={form.enabled} onCheckedChange={(c) => setForm({ ...form, enabled: c })} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditorOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={saveTemplate.isPending} className="gap-1.5 bg-primary text-primary-foreground">
              <CheckCircle2 className="h-4 w-4" />
              {saveTemplate.isPending ? 'Saving…' : 'Save Template'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!testTarget} onOpenChange={(open) => !open && setTestTarget(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Send className="h-5 w-5 text-primary" />
              Test Template Delivery
            </DialogTitle>
            <DialogDescription>Sends the approved template through your Meta Cloud API number.</DialogDescription>
          </DialogHeader>
          {testTarget && (
            <div className="space-y-4 py-2 text-xs">
              <div className="space-y-1.5">
                <span className="text-muted-foreground font-semibold">Rendered Preview:</span>
                <div className="p-3 rounded-lg bg-emerald-950/20 border border-emerald-500/30 text-emerald-300 font-mono text-xs leading-relaxed whitespace-pre-wrap">
                  {testParams.reduce((body, value, i) => body.split(`{{${i + 1}}}`).join(value || `{{${i + 1}}}`), testTarget.body) || testTarget.name}
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-semibold">Target WhatsApp Number</Label>
                <Input value={testPhone} onChange={(e) => setTestPhone(e.target.value)} placeholder="8801XXXXXXXXX" className="font-mono text-xs" />
              </div>
              {testParams.length > 0 && (
                <div className="grid grid-cols-2 gap-2">
                  {testParams.map((value, i) => (
                    <div key={i} className="space-y-1">
                      <Label className="text-[11px] font-mono">{`{{${i + 1}}}`}</Label>
                      <Input
                        value={value}
                        onChange={(e) => setTestParams(testParams.map((p, j) => (j === i ? e.target.value : p)))}
                        className="h-8 text-xs font-mono"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setTestTarget(null)}>
              Cancel
            </Button>
            <Button onClick={handleTest} disabled={testTemplate.isPending} className="gap-1.5 bg-primary text-primary-foreground">
              <Send className="h-4 w-4" />
              {testTemplate.isPending ? 'Sending…' : 'Send Test Message'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={(open) => !open && setDeleteId(null)}
        title="Delete WhatsApp template"
        description="The template is removed from this account (it stays in your Meta Business Manager)."
        confirmLabel="Delete"
        destructive
        onConfirm={() => {
          if (!deleteId) return;
          deleteTemplate.mutate(deleteId, {
            onSuccess: () => {
              toast.success('Template deleted');
              setDeleteId(null);
            },
          });
        }}
      />
    </div>
  );
}
