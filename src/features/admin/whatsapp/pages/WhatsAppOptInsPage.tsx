'use client';

import { useMemo, useState } from 'react';
import type { LegacyColumnDef } from '@tanstack/react-table/legacy';
import { PageHeader } from '@/features/admin/shared';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
import { Plus, UserCheck, ShieldCheck, CheckCircle2, XCircle, Trash2 } from 'lucide-react';
import { formatDateTime } from '@/lib/format';
import { WhatsAppNavLinks } from './WhatsAppInboxPage';
import { useDeleteOptIn, useSaveOptIn, useWhatsAppOptIns } from '../hooks/use-whatsapp';
import type { WaOptIn } from '../types';

export function WhatsAppOptInsPage() {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('all');
  const optIns = useWhatsAppOptIns({ page, pageSize, search, status });
  const saveOptIn = useSaveOptIn();
  const deleteOptIn = useDeleteOptIn();

  const [addModalOpen, setAddModalOpen] = useState(false);
  const [newOptIn, setNewOptIn] = useState({ phone: '', optedIn: true });
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const handleAddOptIn = () => {
    if (!newOptIn.phone.trim()) {
      toast.error('WhatsApp phone number is required');
      return;
    }
    saveOptIn.mutate(
      { phone: newOptIn.phone.trim(), optedIn: newOptIn.optedIn },
      {
        onSuccess: () => {
          toast.success(`Consent record saved for ${newOptIn.phone.trim()}`);
          setAddModalOpen(false);
          setNewOptIn({ phone: '', optedIn: true });
        },
      },
    );
  };

  const columns = useMemo<LegacyColumnDef<WaOptIn, unknown>[]>(
    () => [
      {
        accessorKey: 'customerName',
        header: 'Customer',
        size: 180,
        enableHiding: false,
        cell: ({ row }) => {
          const name = row.original.customerName || 'Unknown contact';
          return (
            <div className="flex items-center gap-2">
              <div className="h-7 w-7 rounded-full bg-primary/10 border border-primary/20 text-primary flex items-center justify-center font-bold text-xs">
                {name.charAt(0)}
              </div>
              <span className="font-semibold text-xs text-foreground">{name}</span>
            </div>
          );
        },
      },
      {
        accessorKey: 'phone',
        header: 'Phone Number',
        size: 150,
        cell: ({ row }) => <span className="font-mono text-xs font-medium text-foreground">{row.original.phone}</span>,
      },
      {
        accessorKey: 'source',
        header: 'Consent Channel',
        size: 150,
        cell: ({ row }) => (
          <Badge variant="outline" className="text-[10px] font-mono capitalize">
            {row.original.source || '—'}
          </Badge>
        ),
      },
      {
        accessorKey: 'changedAt',
        header: 'Consent Timestamp',
        size: 160,
        cell: ({ row }) => <span className="text-xs font-mono text-muted-foreground">{row.original.changedAt ? formatDateTime(row.original.changedAt) : '—'}</span>,
      },
      {
        accessorKey: 'optedIn',
        header: 'Marketing Consent Status',
        size: 190,
        cell: ({ row }) => {
          const opt = row.original;
          return (
            <div className="flex items-center gap-3">
              <Switch
                checked={opt.optedIn}
                onCheckedChange={() =>
                  saveOptIn.mutate(
                    { phone: opt.phone, optedIn: !opt.optedIn },
                    { onSuccess: () => toast.success(`Marketing consent ${!opt.optedIn ? 'granted' : 'revoked'} for ${opt.phone}`) },
                  )
                }
              />
              <Badge
                variant={opt.optedIn ? 'default' : 'secondary'}
                className={`text-[10px] font-mono gap-1 ${opt.optedIn ? 'bg-emerald-600 hover:bg-emerald-600 text-white' : ''}`}
              >
                {opt.optedIn ? <CheckCircle2 className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
                {opt.optedIn ? 'Opted In' : 'Opted Out'}
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
            onClick={() => setDeleteId(row.original.id)}
            title="Delete Record"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        ),
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  if (optIns.isLoading) return <PageSkeleton variant="table" />;
  if (optIns.isError && !optIns.data) {
    return (
      <WhatsAppLoadError error={optIns.error} title="Failed to load opt-ins" fallback="Could not fetch the WhatsApp consent registry." onRetry={() => optIns.refetch()} />
    );
  }

  const stats = optIns.data?.stats;
  const pct = stats && stats.total > 0 ? Math.round((stats.optedIn / stats.total) * 100) : 0;

  return (
    <div className="space-y-6">
      <PageHeader
        title="WhatsApp Marketing Opt-ins"
        subtitle="Customer marketing consent registry — campaigns only reach opted-in numbers"
        breadcrumb={[
          { label: 'Dashboard', url: '/admin/dashboard' },
          { label: 'WhatsApp' },
          { label: 'Opt-ins' },
        ]}
        actions={
          <Button size="sm" className="gap-1.5 bg-primary text-primary-foreground hover:bg-primary/90" onClick={() => setAddModalOpen(true)}>
            <Plus className="h-4 w-4" />
            Add Opt-in
          </Button>
        }
      />

      <WhatsAppNavLinks />

      <OpsSummaryStrip
        items={[
          { label: 'Registered Numbers', value: stats?.total ?? 0 },
          { label: 'Marketing Consent Granted', value: `${stats?.optedIn ?? 0} (${pct}%)` },
          { label: 'Opted Out / Revoked', value: stats?.optedOut ?? 0 },
        ]}
      />

      <Card className="border-border/60 shadow-sm">
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <CardTitle className="text-base flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-primary" />
                Subscriber Consent Registry
              </CardTitle>
              <CardDescription>Consent records checked before every marketing campaign dispatch</CardDescription>
            </div>
            <Select value={status} onValueChange={(v) => { if (v) { setStatus(v); setPage(1); } }}>
              <SelectTrigger className="h-9 w-[150px] text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All records</SelectItem>
                <SelectItem value="opted_in">Opted in</SelectItem>
                <SelectItem value="opted_out">Opted out</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={columns}
            data={optIns.data?.items ?? []}
            getRowId={(row) => row.id}
            searchKey="phone"
            searchPlaceholder="Search by phone number..."
            emptyTitle="No opt-in records"
            emptyDescription="Customer marketing consent entries will appear here."
            server={{
              page,
              pageSize,
              total: optIns.data?.meta.total ?? 0,
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
              <Button size="sm" onClick={() => setAddModalOpen(true)} className="gap-1.5">
                <Plus className="h-4 w-4" />
                Add Opt-in
              </Button>
            }
          />
        </CardContent>
      </Card>

      <Dialog open={addModalOpen} onOpenChange={setAddModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <UserCheck className="h-5 w-5 text-primary" />
              Register Customer Opt-In
            </DialogTitle>
            <DialogDescription>Record a number&apos;s marketing consent for promotional WhatsApp broadcasts.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2 text-xs">
            <div className="space-y-2">
              <Label className="text-xs font-semibold">WhatsApp Phone Number</Label>
              <Input
                value={newOptIn.phone}
                onChange={(e) => setNewOptIn({ ...newOptIn, phone: e.target.value })}
                placeholder="01XXXXXXXXX or 8801XXXXXXXXX"
                className="font-mono text-xs"
              />
            </div>
            <div className="flex items-center justify-between p-3 bg-muted/20 border border-border/50 rounded-lg">
              <div>
                <span className="font-semibold text-xs block">Marketing Consent Granted</span>
                <span className="text-[11px] text-muted-foreground">Allows promotional template messages</span>
              </div>
              <Switch checked={newOptIn.optedIn} onCheckedChange={(c) => setNewOptIn({ ...newOptIn, optedIn: c })} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddOptIn} disabled={saveOptIn.isPending} className="gap-1.5 bg-primary text-primary-foreground">
              <CheckCircle2 className="h-4 w-4" />
              {saveOptIn.isPending ? 'Saving…' : 'Save Record'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={(open) => !open && setDeleteId(null)}
        title="Delete consent record"
        description="The number will no longer be part of marketing campaigns unless it opts in again."
        confirmLabel="Delete"
        destructive
        onConfirm={() => {
          if (!deleteId) return;
          deleteOptIn.mutate(deleteId, {
            onSuccess: () => {
              toast.success('Consent record removed');
              setDeleteId(null);
            },
          });
        }}
      />
    </div>
  );
}
