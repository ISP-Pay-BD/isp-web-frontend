'use client';

import { useMemo, useState } from 'react';
import type { LegacyColumnDef, LegacyRow } from '@tanstack/react-table/legacy';
import { PageHeader } from '@/features/admin/shared';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { PageSkeleton } from '@/components/shared/LoadingSkeleton';
import { EmptyState } from '@/components/shared/EmptyState';
import { OpsSummaryStrip } from '@/components/shared/OpsSummaryStrip';
import { DataTable } from '@/features/shared/data-table';
import { toast } from 'sonner';
import {
  Plus,
  FileCode,
  Send,
  Eye,
  CheckCircle2,
  Clock,
  AlertTriangle,
  RefreshCw,
  Sparkles,
} from 'lucide-react';
import { WhatsAppNavLinks } from './WhatsAppInboxPage';
import { useWhatsApp } from '../hooks/use-whatsapp';
import type { WhatsAppTemplate } from '@/data/admin/comms.data';

const templateSearchFilter = (
  row: LegacyRow<WhatsAppTemplate>,
  _columnId: string,
  filterValue: unknown,
) => {
  const q = String(filterValue ?? '').toLowerCase().trim();
  if (!q) return true;
  const t = row.original;
  return (
    t.name.toLowerCase().includes(q) ||
    t.body.toLowerCase().includes(q) ||
    t.category.toLowerCase().includes(q) ||
    t.language.toLowerCase().includes(q) ||
    t.status.toLowerCase().includes(q)
  );
};

export function WhatsAppTemplatesPage() {
  const { data, isLoading, isError, refetch } = useWhatsApp();
  const [templates, setTemplates] = useState<WhatsAppTemplate[]>([]);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [testModalOpen, setTestModalOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<WhatsAppTemplate | null>(null);
  const [testPhone, setTestPhone] = useState('+8801712345678');
  const [testParams, setTestParams] = useState({
    p1: 'Rahim Uddin',
    p2: 'September 2026',
    p3: '1,200',
    p4: '10 Sep 2026',
  });

  const [newTemplate, setNewTemplate] = useState({
    name: '',
    category: 'UTILITY' as 'UTILITY' | 'AUTHENTICATION' | 'MARKETING',
    language: 'en',
    body: '',
  });

  useMemo(() => {
    if (data?.templates && templates.length === 0) {
      setTemplates(data.templates);
    }
  }, [data?.templates, templates.length]);

  const list = templates.length > 0 ? templates : (data?.templates ?? []);

  const handleCreateTemplate = () => {
    if (!newTemplate.name.trim() || !newTemplate.body.trim()) {
      toast.error('Template name and body are required');
      return;
    }
    const created: WhatsAppTemplate = {
      id: `wat_${Date.now()}`,
      name: newTemplate.name.toLowerCase().replace(/\s+/g, '_'),
      category: newTemplate.category,
      language: newTemplate.language,
      status: 'PENDING',
      body: newTemplate.body,
      lastUpdated: new Date().toISOString().split('T')[0] ?? '2026-09-10',
    };

    setTemplates((prev) => [created, ...prev]);
    toast.success(`Template "${created.name}" submitted to Meta for approval (Status: PENDING)`);
    setCreateModalOpen(false);
    setNewTemplate({ name: '', category: 'UTILITY', language: 'en', body: '' });
  };

  const handleSendTestMessage = () => {
    if (!selectedTemplate) return;
    toast.promise(
      new Promise((res) => setTimeout(res, 600)),
      {
        loading: `Transmitting WhatsApp HSM template to ${testPhone}...`,
        success: `Message delivered to ${testPhone} via Meta Cloud API!`,
        error: 'Delivery failed',
      }
    );
    setTestModalOpen(false);
  };

  const columns = useMemo<LegacyColumnDef<WhatsAppTemplate, unknown>[]>(
    () => [
      {
        accessorKey: 'name',
        header: 'Template Name',
        size: 200,
        enableHiding: false,
        cell: ({ row }) => (
          <div>
            <span className="font-mono font-semibold text-xs text-foreground block">{row.original.name}</span>
            <span className="text-[10px] text-muted-foreground font-mono">ID: {row.original.id}</span>
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
              variant={
                status === 'APPROVED'
                  ? 'default'
                  : status === 'REJECTED'
                    ? 'destructive'
                    : 'secondary'
              }
              className={`text-[10px] font-mono gap-1 ${
                status === 'APPROVED' ? 'bg-emerald-600 hover:bg-emerald-600 text-white' : ''
              }`}
            >
              {status === 'APPROVED' ? (
                <CheckCircle2 className="h-3 w-3" />
              ) : status === 'PENDING' ? (
                <Clock className="h-3 w-3" />
              ) : (
                <AlertTriangle className="h-3 w-3" />
              )}
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
          <div className="py-1">
            <span className="text-xs text-foreground/90 font-mono line-clamp-2 leading-relaxed bg-muted/20 p-2 rounded-lg border border-border/40">
              {row.original.body}
            </span>
          </div>
        ),
      },
      {
        accessorKey: 'lastUpdated',
        header: 'Updated',
        size: 110,
        cell: ({ row }) => (
          <span className="text-xs font-mono text-muted-foreground">{row.original.lastUpdated}</span>
        ),
      },
      {
        id: 'actions',
        header: () => <span className="sr-only">Actions</span>,
        size: 100,
        enableSorting: false,
        enableHiding: false,
        cell: ({ row }) => (
          <div className="flex items-center justify-end gap-1">
            <Button
              variant="ghost"
              size="sm"
              className="h-8 text-xs gap-1 text-primary hover:bg-primary/10"
              onClick={() => {
                setSelectedTemplate(row.original);
                setTestModalOpen(true);
              }}
              title="Test WhatsApp Delivery"
            >
              <Send className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Test</span>
            </Button>
          </div>
        ),
      },
    ],
    [],
  );

  if (isLoading) return <PageSkeleton variant="table" />;
  if (isError || !data) {
    return (
      <EmptyState
        title="Failed to load templates"
        description="Could not fetch WhatsApp templates from Meta registry."
        actionLabel="Retry"
        onAction={() => refetch()}
      />
    );
  }

  const approvedCount = list.filter((t) => t.status === 'APPROVED').length;
  const pendingCount = list.filter((t) => t.status === 'PENDING').length;

  return (
    <div className="space-y-6">
      <PageHeader
        title="WhatsApp Message Templates"
        subtitle="Meta-approved HSM message templates for utility alerts, OTPs, and promotional broadcasts"
        breadcrumb={[
          { label: 'Dashboard', url: '/admin/dashboard' },
          { label: 'WhatsApp' },
          { label: 'Templates' },
        ]}
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5 text-xs"
              onClick={() => {
                refetch();
                toast.success('Templates synced from Meta Cloud API Graph endpoint');
              }}
            >
              <RefreshCw className="h-3.5 w-3.5 text-muted-foreground" />
              Sync with Meta
            </Button>
            <Button
              size="sm"
              className="gap-1.5 bg-primary text-primary-foreground hover:bg-primary/90"
              onClick={() => setCreateModalOpen(true)}
            >
              <Plus className="h-4 w-4" />
              Create Template
            </Button>
          </div>
        }
      />

      <WhatsAppNavLinks />

      <OpsSummaryStrip
        items={[
          { label: 'Total Templates', value: list.length },
          { label: 'Meta Approved', value: `${approvedCount} Templates` },
          { label: 'Pending Review', value: `${pendingCount} Templates` },
          { label: 'Utility Category', value: list.filter((t) => t.category === 'UTILITY').length },
          { label: 'Marketing Category', value: list.filter((t) => t.category === 'MARKETING').length },
          { label: 'WABA ID', value: '8827364519283' },
        ]}
      />

      <Card className="border-border/60 shadow-sm">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base flex items-center gap-2">
                <FileCode className="h-4 w-4 text-primary" />
                Meta Approved Template Registry
              </CardTitle>
              <CardDescription>
                Synchronized with WhatsApp Business Account (WABA) Cloud Graph API
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={columns}
            data={list}
            getRowId={(row) => row.id}
            searchKey="name"
            searchPlaceholder="Search templates by name, body or category..."
            searchFilterFn={templateSearchFilter}
            facetFilters={[
              { columnId: 'category', title: 'Category' },
              { columnId: 'status', title: 'Status' },
              { columnId: 'language', title: 'Language' },
            ]}
            emptyTitle="No WhatsApp templates found"
            emptyDescription="Create your first Meta HSM template to begin broadcasting."
            toolbarActions={
              <Button size="sm" onClick={() => setCreateModalOpen(true)} className="gap-1.5">
                <Plus className="h-4 w-4" />
                Create Template
              </Button>
            }
          />
        </CardContent>
      </Card>

      {/* Create Meta Template Modal */}
      <Dialog open={createModalOpen} onOpenChange={setCreateModalOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5 text-primary" />
              Create WhatsApp Template
            </DialogTitle>
            <DialogDescription>
              Submit a new HSM message template to Meta for Business Account approval.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label className="text-xs font-semibold">Template Name (Snake Case)</Label>
                <Input
                  value={newTemplate.name}
                  onChange={(e) => setNewTemplate({ ...newTemplate, name: e.target.value })}
                  placeholder="e.g. invoice_bill_reminder"
                  className="font-mono text-xs"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-semibold">Category</Label>
                <Select
                  value={newTemplate.category}
                  onValueChange={(v) => { if (v) setNewTemplate({ ...newTemplate, category: v as any }); }}
                >
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

            <div className="space-y-2">
              <Label className="text-xs font-semibold">Language</Label>
              <Select
                value={newTemplate.language}
                onValueChange={(v) => { if (v) setNewTemplate({ ...newTemplate, language: v }); }}
              >
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
              <Label className="text-xs font-semibold">Template Body Text</Label>
              <Textarea
                value={newTemplate.body}
                onChange={(e) => setNewTemplate({ ...newTemplate, body: e.target.value })}
                placeholder="Hello {{1}}, your monthly ISP invoice for {{2}} is ready. Total: ৳{{3}}."
                className="h-28 font-mono text-xs leading-relaxed"
              />
              <p className="text-[11px] text-muted-foreground">
                Use double braces like <code className="font-mono bg-muted px-1 py-0.5 rounded text-primary">&#123;&#123;1&#125;&#125;</code> for dynamic parameters.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateTemplate} className="gap-1.5 bg-primary text-primary-foreground">
              <CheckCircle2 className="h-4 w-4" />
              Submit to Meta
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Test Send Modal */}
      <Dialog open={testModalOpen} onOpenChange={setTestModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Send className="h-5 w-5 text-primary" />
              Test Template Delivery
            </DialogTitle>
            <DialogDescription>
              Send an instant WhatsApp message with substituted parameters.
            </DialogDescription>
          </DialogHeader>
          {selectedTemplate && (
            <div className="space-y-4 py-2 text-xs">
              <div className="space-y-1.5">
                <span className="text-muted-foreground font-semibold">Rendered Preview:</span>
                <div className="p-3 rounded-lg bg-emerald-950/20 border border-emerald-500/30 text-emerald-300 font-mono text-xs leading-relaxed">
                  {selectedTemplate.body
                    .replace(/\{\{1\}\}/g, testParams.p1)
                    .replace(/\{\{2\}\}/g, testParams.p2)
                    .replace(/\{\{3\}\}/g, testParams.p3)
                    .replace(/\{\{4\}\}/g, testParams.p4)}
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-semibold">Target Phone Number</Label>
                <Input
                  value={testPhone}
                  onChange={(e) => setTestPhone(e.target.value)}
                  placeholder="+88017xxxxxxxx"
                  className="font-mono text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <Label className="text-[11px] font-mono">&#123;&#123;1&#125;&#125; (Name)</Label>
                  <Input
                    value={testParams.p1}
                    onChange={(e) => setTestParams({ ...testParams, p1: e.target.value })}
                    className="h-8 text-xs font-mono"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-[11px] font-mono">&#123;&#123;2&#125;&#125; (Month / Package)</Label>
                  <Input
                    value={testParams.p2}
                    onChange={(e) => setTestParams({ ...testParams, p2: e.target.value })}
                    className="h-8 text-xs font-mono"
                  />
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setTestModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSendTestMessage} className="gap-1.5 bg-primary text-primary-foreground">
              <Send className="h-4 w-4" />
              Transmit Test Message
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
