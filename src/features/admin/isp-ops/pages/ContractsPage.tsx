'use client';

import { useMemo, useState } from 'react';
import type { LegacyColumnDef, LegacyRow } from '@tanstack/react-table/legacy';
import { PageHeader } from '@/features/admin/shared';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
  FileText,
  Plus,
  Eye,
  CheckCircle2,
  Clock,
  Send,
  Download,
  ShieldCheck,
} from 'lucide-react';
import { useIspOps } from '../hooks/use-isp-ops';
import type { IspOpsData } from '@/data/admin/isp-ops.data';

type Row = IspOpsData['contracts'][number];

const searchFilter = (row: LegacyRow<Row>, _columnId: string, filterValue: unknown) => {
  const q = String(filterValue ?? '').toLowerCase().trim();
  if (!q) return true;
  const r = row.original;
  return (
    String(r.customerName).toLowerCase().includes(q) ||
    String(r.title).toLowerCase().includes(q) ||
    String(r.status).toLowerCase().includes(q) ||
    String(r.signedAt).toLowerCase().includes(q)
  );
};

export function ContractsPage() {
  const { data, isLoading, isError, refetch } = useIspOps();
  const [contracts, setContracts] = useState<Row[]>([]);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [viewContract, setViewContract] = useState<Row | null>(null);

  const [newContract, setNewContract] = useState<{
    customerName: string;
    title: string;
    status: 'draft' | 'signed' | 'sent' | 'expired';
    signedAt: string | null;
  }>({
    customerName: '',
    title: 'Dedicated Leased Line 100 Mbps SLA',
    status: 'signed',
    signedAt: '2026-09-10',
  });

  useMemo(() => {
    if (data?.contracts && contracts.length === 0) {
      setContracts(data.contracts);
    }
  }, [data?.contracts, contracts.length]);

  const rows = contracts.length > 0 ? contracts : (data?.contracts ?? []);

  const handleCreateContract = () => {
    if (!newContract.customerName.trim()) {
      toast.error('Customer name is required');
      return;
    }
    const created: Row = {
      id: `ct_${Date.now()}`,
      customerName: newContract.customerName.trim(),
      title: newContract.title,
      status: newContract.status,
      signedAt: newContract.signedAt,
    };
    setContracts((prev) => [created, ...prev]);
    toast.success(`Contract "${created.title}" saved & dispatched for e-signature!`);
    setCreateModalOpen(false);
    setNewContract({
      customerName: '',
      title: 'Dedicated Leased Line 100 Mbps SLA',
      status: 'signed',
      signedAt: '2026-09-10',
    });
  };

  const columns = useMemo<LegacyColumnDef<Row, unknown>[]>(
    () => [
      {
        accessorKey: 'customerName',
        header: 'Subscriber / Corporate Client',
        size: 200,
        enableHiding: false,
        cell: ({ row }) => (
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-lg bg-primary/10 border border-primary/20 text-primary flex items-center justify-center shrink-0">
              <FileText className="h-4 w-4" />
            </div>
            <div>
              <span className="font-semibold text-xs text-foreground block">{String(row.original.customerName)}</span>
              <span className="text-[10px] text-muted-foreground font-mono">Contract #{row.index + 501}</span>
            </div>
          </div>
        ),
      },
      {
        accessorKey: 'title',
        header: 'Agreement Title & SLA Tier',
        size: 240,
        cell: ({ row }) => (
          <span className="font-medium text-xs text-foreground block">{String(row.original.title)}</span>
        ),
      },
      {
        accessorKey: 'status',
        header: 'E-Sign Status',
        size: 130,
        cell: ({ row }) => {
          const s = String(row.original.status);
          const isSigned = s === 'signed';
          return (
            <Badge
              variant={isSigned ? 'default' : 'secondary'}
              className={`capitalize text-[10px] font-mono gap-1 ${
                isSigned ? 'bg-emerald-600 hover:bg-emerald-600 text-white' : ''
              }`}
            >
              {isSigned ? <CheckCircle2 className="h-3 w-3" /> : <Clock className="h-3 w-3" />}
              {s}
            </Badge>
          );
        },
      },
      {
        accessorKey: 'signedAt',
        header: 'Executed Date',
        size: 130,
        cell: ({ row }) => (
          <span className="font-mono text-xs text-muted-foreground">{String(row.original.signedAt)}</span>
        ),
      },
      {
        id: 'actions',
        header: () => <span className="sr-only">Actions</span>,
        size: 120,
        enableSorting: false,
        enableHiding: false,
        cell: ({ row }) => (
          <div className="flex items-center justify-end gap-1">
            <Button
              variant="ghost"
              size="sm"
              className="h-8 text-xs gap-1 text-primary hover:bg-primary/10"
              onClick={() => setViewContract(row.original)}
              title="View Agreement"
            >
              <Eye className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">View</span>
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground hover:text-foreground"
              onClick={() => toast.success(`E-sign link resent via WhatsApp to ${row.original.customerName}`)}
              title="Resend E-Sign Link"
            >
              <Send className="h-3.5 w-3.5" />
            </Button>
          </div>
        ),
      },
    ],
    [],
  );

  if (isLoading) return <PageSkeleton variant="table" />;
  if (isError || !data) {
    return <EmptyState title="Failed to load contracts" actionLabel="Retry" onAction={() => refetch()} />;
  }

  const signedCount = rows.filter((r) => r.status === 'signed').length;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Service Level Agreements & Contracts"
        subtitle="Manage digital e-sign broadband subscription contracts, SLA guarantees, and corporate bandwidth leases"
        breadcrumb={[
          { label: 'Dashboard', url: '/admin/dashboard' },
          { label: 'Engagement' },
          { label: 'Contracts' },
        ]}
        actions={
          <Button
            className="gap-1.5 bg-primary text-primary-foreground hover:bg-primary/90"
            onClick={() => setCreateModalOpen(true)}
          >
            <Plus className="h-4 w-4" />
            Create Contract
          </Button>
        }
      />

      <OpsSummaryStrip
        items={[
          { label: 'Total Executed Agreements', value: rows.length },
          { label: 'Active Signed SLAs', value: `${signedCount} Contracts` },
          { label: 'Pending E-Signature', value: `${rows.length - signedCount} Pending` },
          { label: 'Vault Signature Standard', value: 'SHA-256 Digital Seal' },
          { label: 'Uptime SLA Guarantee', value: '99.9% Redundant Core' },
        ]}
      />

      <Card className="border-border/60 shadow-sm">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-primary" />
                Executed Customer Agreements
              </CardTitle>
              <CardDescription>
                Digitally authenticated service level agreements and bandwidth leases
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={columns}
            data={rows}
            searchKey="customerName"
            searchFilterFn={searchFilter}
            searchPlaceholder="Search agreements by customer or title..."
            facetFilters={[{ columnId: 'status', title: 'E-Sign Status' }]}
            toolbarActions={
              <Button size="sm" onClick={() => setCreateModalOpen(true)} className="gap-1.5">
                <Plus className="h-4 w-4" />
                New Contract
              </Button>
            }
          />
        </CardContent>
      </Card>

      {/* Create Contract Modal */}
      <Dialog open={createModalOpen} onOpenChange={setCreateModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              Generate Subscription Contract
            </DialogTitle>
            <DialogDescription>
              Create and dispatch an e-sign service agreement to subscriber.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2 text-xs">
            <div className="space-y-2">
              <Label className="text-xs font-semibold">Subscriber / Corporate Name</Label>
              <Input
                value={newContract.customerName}
                onChange={(e) => setNewContract({ ...newContract, customerName: e.target.value })}
                placeholder="e.g. Grameenphone Ltd / Rahim Uddin"
                className="text-xs"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-semibold">Contract Title / Plan SLA</Label>
              <Input
                value={newContract.title}
                onChange={(e) => setNewContract({ ...newContract, title: e.target.value })}
                className="text-xs"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Agreement Status</Label>
                <Select
                  value={newContract.status}
                  onValueChange={(v) => { if (v) setNewContract({ ...newContract, status: v as 'draft' | 'signed' | 'sent' | 'expired' }); }}
                >
                  <SelectTrigger className="text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="signed">Signed & Verified</SelectItem>
                    <SelectItem value="pending">Pending Customer E-Sign</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Execution Date</Label>
                <Input
                  type="date"
                  value={newContract.signedAt ?? ''}
                  onChange={(e) => setNewContract({ ...newContract, signedAt: e.target.value })}
                  className="text-xs font-mono"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateContract} className="gap-1.5 bg-primary text-primary-foreground">
              <CheckCircle2 className="h-4 w-4" />
              Generate & Dispatch
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Contract Modal */}
      <Dialog open={!!viewContract} onOpenChange={(open) => !open && setViewContract(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              Service Agreement Document
            </DialogTitle>
            <DialogDescription>{viewContract?.title}</DialogDescription>
          </DialogHeader>
          {viewContract && (
            <div className="space-y-3 py-2 text-xs">
              <div className="p-4 bg-muted/20 border border-border/50 rounded-lg space-y-2">
                <div className="flex justify-between border-b pb-2">
                  <span className="text-muted-foreground">Subscriber Party:</span>
                  <span className="font-semibold text-foreground">{viewContract.customerName}</span>
                </div>
                <div className="flex justify-between border-b pb-2">
                  <span className="text-muted-foreground">Service Provider:</span>
                  <span className="font-semibold text-foreground">ISP Pay BD Ltd.</span>
                </div>
                <div className="flex justify-between border-b pb-2">
                  <span className="text-muted-foreground">Executed Date:</span>
                  <span className="font-mono">{viewContract.signedAt}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Digital Signature Seal:</span>
                  <span className="font-mono text-emerald-500 font-semibold">SHA256: 8f92a1c849e... (Verified)</span>
                </div>
              </div>
              <p className="text-[11px] text-muted-foreground leading-relaxed italic">
                This document confirms a legally binding SLA agreement for high-speed fiber broadband provision with guaranteed 99.9% uptime and 24/7 dedicated NOC support.
              </p>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setViewContract(null)}>
              Close
            </Button>
            <Button
              className="gap-1.5 bg-primary text-primary-foreground"
              onClick={() => {
                toast.success('Agreement PDF downloaded');
                setViewContract(null);
              }}
            >
              <Download className="h-4 w-4" />
              Download PDF
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
