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
import { useTranslations } from '@/i18n/locale-context';
import { WhatsAppNavLinks } from './WhatsAppInboxPage';
import { useDeleteOptIn, useSaveOptIn, useWhatsAppOptIns } from '../hooks/use-whatsapp';
import type { WaOptIn } from '../types';

export function WhatsAppOptInsPage() {
  const t = useTranslations();
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
      toast.error(t('admin.whatsapp.optIns.phoneRequired', 'WhatsApp phone number is required'));
      return;
    }
    saveOptIn.mutate(
      { phone: newOptIn.phone.trim(), optedIn: newOptIn.optedIn },
      {
        onSuccess: () => {
          toast.success(t('admin.whatsapp.optIns.saved', 'Consent record saved for {phone}', { phone: newOptIn.phone.trim() }));
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
        header: t('admin.whatsapp.optIns.colCustomer', 'Customer'),
        size: 180,
        enableHiding: false,
        cell: ({ row }) => {
          const name = row.original.customerName || t('admin.whatsapp.optIns.unknownContact', 'Unknown contact');
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
        header: t('admin.whatsapp.optIns.colPhone', 'Phone Number'),
        size: 150,
        cell: ({ row }) => <span className="font-mono text-xs font-medium text-foreground">{row.original.phone}</span>,
      },
      {
        accessorKey: 'source',
        header: t('admin.whatsapp.optIns.colChannel', 'Consent Channel'),
        size: 150,
        cell: ({ row }) => (
          <Badge variant="outline" className="text-xs font-mono capitalize">
            {row.original.source || '—'}
          </Badge>
        ),
      },
      {
        accessorKey: 'changedAt',
        header: t('admin.whatsapp.optIns.colTime', 'Consent Timestamp'),
        size: 160,
        cell: ({ row }) => <span className="text-xs font-mono text-muted-foreground">{row.original.changedAt ? formatDateTime(row.original.changedAt) : '—'}</span>,
      },
      {
        accessorKey: 'optedIn',
        header: t('admin.whatsapp.optIns.colStatus', 'Marketing Consent Status'),
        size: 190,
        cell: ({ row }) => {
          const opt = row.original;
          return (
            <div className="flex items-center gap-3">
              <Switch
                checked={opt.optedIn}
                aria-label={t('admin.whatsapp.optIns.toggleConsent', 'Marketing consent for {phone}', { phone: opt.phone })}
                onCheckedChange={() =>
                  saveOptIn.mutate(
                    { phone: opt.phone, optedIn: !opt.optedIn },
                    {
                      onSuccess: () =>
                        toast.success(
                          !opt.optedIn
                            ? t('admin.whatsapp.optIns.granted', 'Marketing consent granted for {phone}', { phone: opt.phone })
                            : t('admin.whatsapp.optIns.revoked', 'Marketing consent revoked for {phone}', { phone: opt.phone }),
                        ),
                    },
                  )
                }
              />
              <Badge
                variant={opt.optedIn ? 'default' : 'secondary'}
                tone={opt.optedIn ? 'success' : undefined} className="text-xs font-mono gap-1"
              >
                {opt.optedIn ? <CheckCircle2 className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
                {opt.optedIn ? t('admin.whatsapp.optIns.optedIn', 'Opted In') : t('admin.whatsapp.optIns.optedOut', 'Opted Out')}
              </Badge>
            </div>
          );
        },
      },
      {
        id: 'actions',
        header: () => <span className="sr-only">{t('admin.customers.list.colActions', 'Actions')}</span>,
        size: 80,
        enableSorting: false,
        enableHiding: false,
        cell: ({ row }) => (
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-destructive hover:bg-destructive/10"
            onClick={() => setDeleteId(row.original.id)}
            title={t('admin.whatsapp.optIns.deleteRecord', 'Delete Record')}
            aria-label={t('admin.whatsapp.optIns.deleteRecord', 'Delete Record')}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        ),
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [t],
  );

  if (optIns.isLoading) return <PageSkeleton variant="table" />;
  if (optIns.isError && !optIns.data) {
    return (
      <WhatsAppLoadError
        error={optIns.error}
        title={t('admin.whatsapp.optIns.loadFailed', 'Failed to load opt-ins')}
        fallback={t('admin.whatsapp.optIns.loadFailedHint', 'Could not fetch the WhatsApp consent registry.')}
        onRetry={() => optIns.refetch()}
      />
    );
  }

  const stats = optIns.data?.stats;
  const pct = stats && stats.total > 0 ? Math.round((stats.optedIn / stats.total) * 100) : 0;

  return (
    <div className="space-y-6">
      <PageHeader
        title={t('admin.whatsapp.optIns.title', 'WhatsApp Marketing Opt-ins')}
        subtitle={t('admin.whatsapp.optIns.subtitle', 'Customer marketing consent registry — campaigns only reach opted-in numbers')}
        breadcrumb={[
          { label: t('common.crumb.dashboard', 'Dashboard'), url: '/admin/dashboard' },
          { label: 'WhatsApp' },
          { label: t('nav.wa-optins', 'Opt-ins') },
        ]}
        actions={
          <Button size="sm" className="gap-1.5 bg-primary text-primary-foreground hover:bg-primary/90" onClick={() => setAddModalOpen(true)}>
            <Plus className="h-4 w-4" />
            {t('admin.whatsapp.optIns.add', 'Add Opt-in')}
          </Button>
        }
      />

      <WhatsAppNavLinks />

      <OpsSummaryStrip
        items={[
          { label: t('admin.whatsapp.optIns.kpiTotal', 'Registered Numbers'), value: stats?.total ?? 0 },
          { label: t('admin.whatsapp.optIns.kpiGranted', 'Marketing Consent Granted'), value: `${stats?.optedIn ?? 0} (${pct}%)` },
          { label: t('admin.whatsapp.optIns.kpiRevoked', 'Opted Out / Revoked'), value: stats?.optedOut ?? 0 },
        ]}
      />

      <Card className="border-border/60 shadow-sm">
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <CardTitle className="text-base flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-primary" />
                {t('admin.whatsapp.optIns.registryTitle', 'Subscriber Consent Registry')}
              </CardTitle>
              <CardDescription>{t('admin.whatsapp.optIns.registryDesc', 'Consent records checked before every marketing campaign dispatch')}</CardDescription>
            </div>
            <Select
              value={status}
              onValueChange={(v) => { if (v) { setStatus(v); setPage(1); } }}
              items={{
                all: t('admin.whatsapp.optIns.filterAll', 'All records'),
                opted_in: t('admin.whatsapp.optIns.filterIn', 'Opted in'),
                opted_out: t('admin.whatsapp.optIns.filterOut', 'Opted out'),
              }}
            >
              <SelectTrigger aria-label={t('admin.whatsapp.optIns.filterStatus', 'Filter by status')} className="h-9 w-[150px] text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('admin.whatsapp.optIns.filterAll', 'All records')}</SelectItem>
                <SelectItem value="opted_in">{t('admin.whatsapp.optIns.filterIn', 'Opted in')}</SelectItem>
                <SelectItem value="opted_out">{t('admin.whatsapp.optIns.filterOut', 'Opted out')}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <DataTable urlState
            columns={columns}
            data={optIns.data?.items ?? []}
            getRowId={(row) => row.id}
            searchKey="phone"
            searchPlaceholder={t('admin.whatsapp.optIns.searchPlaceholder', 'Search by phone number...')}
            emptyTitle={t('admin.whatsapp.optIns.emptyTitle', 'No opt-in records')}
            emptyDescription={t('admin.whatsapp.optIns.emptyDesc', 'Customer marketing consent entries will appear here.')}
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
                {t('admin.whatsapp.optIns.add', 'Add Opt-in')}
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
              {t('admin.whatsapp.optIns.dialogTitle', 'Register Customer Opt-In')}
            </DialogTitle>
            <DialogDescription>{t('admin.whatsapp.optIns.dialogDesc', "Record a number's marketing consent for promotional WhatsApp broadcasts.")}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2 text-xs">
            <div className="space-y-2">
              <Label htmlFor="whatsapp-phone-number" className="text-xs font-semibold">{t('admin.whatsapp.optIns.fieldPhone', 'WhatsApp Phone Number')}</Label>
              <Input id="whatsapp-phone-number"
                value={newOptIn.phone}
                onChange={(e) => setNewOptIn({ ...newOptIn, phone: e.target.value })}
                placeholder={t('admin.whatsapp.optIns.phonePlaceholder', '01XXXXXXXXX or 8801XXXXXXXXX')}
                className="font-mono text-xs"
              />
            </div>
            <div className="flex items-center justify-between p-3 bg-muted/20 border border-border/50 rounded-lg">
              <div>
                <span className="font-semibold text-xs block">{t('admin.whatsapp.optIns.kpiGranted', 'Marketing Consent Granted')}</span>
                <span className="text-xs text-muted-foreground">{t('admin.whatsapp.optIns.grantedDesc', 'Allows promotional template messages')}</span>
              </div>
              <Switch
                checked={newOptIn.optedIn}
                onCheckedChange={(c) => setNewOptIn({ ...newOptIn, optedIn: c })}
                aria-label={t('admin.whatsapp.optIns.kpiGranted', 'Marketing Consent Granted')}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddModalOpen(false)}>
              {t('common.cancel', 'Cancel')}
            </Button>
            <Button onClick={handleAddOptIn} disabled={saveOptIn.isPending} className="gap-1.5 bg-primary text-primary-foreground">
              <CheckCircle2 className="h-4 w-4" />
              {saveOptIn.isPending ? t('admin.whatsapp.optIns.saving', 'Saving…') : t('admin.whatsapp.optIns.saveRecord', 'Save Record')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={(open) => !open && setDeleteId(null)}
        title={t('admin.whatsapp.optIns.deleteTitle', 'Delete consent record')}
        description={t('admin.whatsapp.optIns.deleteDesc', 'The number will no longer be part of marketing campaigns unless it opts in again.')}
        confirmLabel={t('common.delete', 'Delete')}
        destructive
        onConfirm={() => {
          if (!deleteId) return;
          deleteOptIn.mutate(deleteId, {
            onSuccess: () => {
              toast.success(t('admin.whatsapp.optIns.removed', 'Consent record removed'));
              setDeleteId(null);
            },
          });
        }}
      />
    </div>
  );
}
