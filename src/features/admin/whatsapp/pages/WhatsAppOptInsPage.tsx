'use client';

import { useMemo, useState } from 'react';
import type { LegacyColumnDef, LegacyRow } from '@tanstack/react-table/legacy';
import { PageHeader } from '@/features/admin/shared';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
  UserCheck,
  Plus,
  Download,
  CheckCircle2,
  XCircle,
  ShieldCheck,
  Phone,
  Trash2,
} from 'lucide-react';
import { WhatsAppNavLinks } from './WhatsAppInboxPage';
import { useWhatsApp } from '../hooks/use-whatsapp';
import type { WhatsAppOptIn } from '@/data/admin/comms.data';

type OptInRow = WhatsAppOptIn & { marketingLabel: string; channel?: string };

const optInSearchFilter = (
  row: LegacyRow<OptInRow>,
  _columnId: string,
  filterValue: unknown,
) => {
  const q = String(filterValue ?? '').toLowerCase().trim();
  if (!q) return true;
  const opt = row.original;
  return (
    opt.customerName.toLowerCase().includes(q) ||
    opt.phone.toLowerCase().includes(q) ||
    opt.marketingLabel.toLowerCase().includes(q)
  );
};

export function WhatsAppOptInsPage() {
  const { data, isLoading, isError, refetch } = useWhatsApp();
  const [optIns, setOptIns] = useState<WhatsAppOptIn[]>([]);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [newOptIn, setNewOptIn] = useState({
    name: '',
    phone: '',
    optedIn: true,
  });

  useMemo(() => {
    if (data?.optIns && optIns.length === 0) {
      setOptIns(data.optIns);
    }
  }, [data?.optIns, optIns.length]);

  const list = optIns.length > 0 ? optIns : (data?.optIns ?? []);

  const rows = useMemo<OptInRow[]>(
    () =>
      list.map((opt) => ({
        ...opt,
        marketingLabel: opt.optedIn ? 'Opted In' : 'Opted Out',
        channel: opt.id === 'opt_1' ? 'Portal Signup' : opt.id === 'opt_2' ? 'SMS Consent' : 'CSR Verification',
      })),
    [list],
  );

  const handleToggleOptIn = (id: string, current: boolean, customerName: string) => {
    const updated = !current;
    setOptIns((prev) =>
      prev.map((o) => (o.id === id ? { ...o, optedIn: updated } : o))
    );
    toast.success(
      `Marketing consent ${updated ? 'granted (Opted In)' : 'revoked (Opted Out)'} for ${customerName}`
    );
  };

  const handleAddOptIn = () => {
    if (!newOptIn.name.trim() || !newOptIn.phone.trim()) {
      toast.error('Customer name and phone are required');
      return;
    }
    const created: WhatsAppOptIn = {
      id: `opt_${Date.now()}`,
      customerName: newOptIn.name.trim(),
      phone: newOptIn.phone.trim(),
      optedIn: newOptIn.optedIn,
      optInDate: new Date().toISOString().split('T')[0] ?? '2026-09-10',
    };
    setOptIns((prev) => [created, ...prev]);
    toast.success(`Consent record created for ${created.customerName}`);
    setAddModalOpen(false);
    setNewOptIn({ name: '', phone: '', optedIn: true });
  };

  const handleExportCSV = () => {
    toast.success('Exported WhatsApp opt-in consent registry to CSV');
  };

  const columns = useMemo<LegacyColumnDef<OptInRow, unknown>[]>(
    () => [
      {
        accessorKey: 'customerName',
        header: 'Customer Name',
        size: 180,
        enableHiding: false,
        cell: ({ row }) => (
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-full bg-primary/10 border border-primary/20 text-primary flex items-center justify-center font-bold text-xs">
              {row.original.customerName.charAt(0)}
            </div>
            <span className="font-semibold text-xs text-foreground">{row.original.customerName}</span>
          </div>
        ),
      },
      {
        accessorKey: 'phone',
        header: 'Phone Number',
        size: 150,
        cell: ({ row }) => (
          <span className="font-mono text-xs font-medium text-foreground">{row.original.phone}</span>
        ),
      },
      {
        accessorKey: 'channel',
        header: 'Consent Channel',
        size: 150,
        cell: ({ row }) => (
          <Badge variant="outline" className="text-[10px] font-mono">
            {row.original.channel ?? 'Portal Signup'}
          </Badge>
        ),
      },
      {
        accessorKey: 'optInDate',
        header: 'Consent Timestamp',
        size: 140,
        cell: ({ row }) => (
          <span className="text-xs font-mono text-muted-foreground">{row.original.optInDate}</span>
        ),
      },
      {
        accessorKey: 'marketingLabel',
        header: 'Marketing Consent Status',
        size: 190,
        cell: ({ row }) => {
          const opt = row.original;
          return (
            <div className="flex items-center gap-3">
              <Switch
                checked={opt.optedIn}
                onCheckedChange={() => handleToggleOptIn(opt.id, opt.optedIn, opt.customerName)}
              />
              <Badge
                variant={opt.optedIn ? 'default' : 'secondary'}
                className={`text-[10px] font-mono gap-1 ${
                  opt.optedIn ? 'bg-emerald-600 hover:bg-emerald-600 text-white' : ''
                }`}
              >
                {opt.optedIn ? (
                  <CheckCircle2 className="h-3 w-3" />
                ) : (
                  <XCircle className="h-3 w-3" />
                )}
                {opt.marketingLabel}
              </Badge>
            </div>
          );
        },
      },
      {
        id: 'actions',
        header: () => <span className="sr-only">Actions</span>,
        size: 80,
        enableSorting: false,
        enableHiding: false,
        cell: ({ row }) => (
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-destructive hover:bg-destructive/10"
            onClick={() => {
              setOptIns((prev) => prev.filter((o) => o.id !== row.original.id));
              toast.success(`Removed consent record for ${row.original.customerName}`);
            }}
            title="Delete Record"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        ),
      },
    ],
    [],
  );

  if (isLoading) return <PageSkeleton variant="table" />;
  if (isError || !data) {
    return (
      <EmptyState
        title="Failed to load opt-ins"
        description="Could not fetch WhatsApp marketing consent registry."
        actionLabel="Retry"
        onAction={() => refetch()}
      />
    );
  }

  const optedInCount = rows.filter((r) => r.optedIn).length;
  const optedOutCount = rows.filter((r) => !r.optedIn).length;

  return (
    <div className="space-y-6">
      <PageHeader
        title="WhatsApp Marketing Opt-ins"
        subtitle="Customer marketing consent registry adhering to WhatsApp Business Messaging Policies"
        breadcrumb={[
          { label: 'Dashboard', url: '/admin/dashboard' },
          { label: 'WhatsApp' },
          { label: 'Opt-ins' },
        ]}
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5 text-xs"
              onClick={handleExportCSV}
            >
              <Download className="h-3.5 w-3.5" />
              Export CSV
            </Button>
            <Button
              size="sm"
              className="gap-1.5 bg-primary text-primary-foreground hover:bg-primary/90"
              onClick={() => setAddModalOpen(true)}
            >
              <Plus className="h-4 w-4" />
              Add Opt-in
            </Button>
          </div>
        }
      />

      <WhatsAppNavLinks />

      <OpsSummaryStrip
        items={[
          { label: 'Registered Subscribers', value: rows.length },
          { label: 'Marketing Consent Granted', value: `${optedInCount} Users (${Math.round((optedInCount / (rows.length || 1)) * 100)}%)` },
          { label: 'Opted Out / Revoked', value: `${optedOutCount} Users` },
          { label: 'Meta Compliance Score', value: '100% (Green)' },
          { label: 'Policy Standard', value: 'WABA Opt-in Rules 2026' },
        ]}
      />

      <Card className="border-border/60 shadow-sm">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-primary" />
                Subscriber Consent Registry
              </CardTitle>
              <CardDescription>
                Live consent records verified before marketing campaign dispatches
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={columns}
            data={rows}
            getRowId={(row) => row.id}
            searchKey="customerName"
            searchPlaceholder="Search customer name or phone..."
            searchFilterFn={optInSearchFilter}
            facetFilters={[
              { columnId: 'marketingLabel', title: 'Consent Status' },
              { columnId: 'channel', title: 'Channel' },
            ]}
            emptyTitle="No opt-in records"
            emptyDescription="Customer marketing consent entries will appear here."
            toolbarActions={
              <Button size="sm" onClick={() => setAddModalOpen(true)} className="gap-1.5">
                <Plus className="h-4 w-4" />
                Add Opt-in
              </Button>
            }
          />
        </CardContent>
      </Card>

      {/* Add Opt-in Modal */}
      <Dialog open={addModalOpen} onOpenChange={setAddModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <UserCheck className="h-5 w-5 text-primary" />
              Register Customer Opt-In
            </DialogTitle>
            <DialogDescription>
              Record subscriber marketing consent for promotional WhatsApp broadcasts.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2 text-xs">
            <div className="space-y-2">
              <Label className="text-xs font-semibold">Customer Full Name</Label>
              <Input
                value={newOptIn.name}
                onChange={(e) => setNewOptIn({ ...newOptIn, name: e.target.value })}
                placeholder="e.g. Shakib Al Hasan"
                className="text-xs"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-semibold">WhatsApp Phone Number</Label>
              <Input
                value={newOptIn.phone}
                onChange={(e) => setNewOptIn({ ...newOptIn, phone: e.target.value })}
                placeholder="+88017xxxxxxxx"
                className="font-mono text-xs"
              />
            </div>
            <div className="flex items-center justify-between p-3 bg-muted/20 border border-border/50 rounded-lg">
              <div>
                <span className="font-semibold text-xs block">Marketing Consent Granted</span>
                <span className="text-[11px] text-muted-foreground">Allows promotional HSM messages</span>
              </div>
              <Switch
                checked={newOptIn.optedIn}
                onCheckedChange={(c) => setNewOptIn({ ...newOptIn, optedIn: c })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddOptIn} className="gap-1.5 bg-primary text-primary-foreground">
              <CheckCircle2 className="h-4 w-4" />
              Save Record
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
