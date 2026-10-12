'use client';

import { useMemo, useState } from 'react';
import type { LegacyColumnDef } from '@tanstack/react-table/legacy';
import { Plus, Truck, MapPin, Phone, Mail, Pencil, Trash2, Globe } from 'lucide-react';
import { toast } from 'sonner';
import { PageHeader } from '@/features/admin/shared/components/PageHeader';
import { PageSkeleton } from '@/components/shared/LoadingSkeleton';
import { EmptyState } from '@/components/shared/EmptyState';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { DataTable } from '@/features/shared/data-table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import {
  useBandwidthProviders,
  useCreateBandwidthProvider,
  useDeleteBandwidthProviders,
  useUpdateBandwidthProvider,
  type ProviderInput,
} from '../hooks/useBandwidthCatalog';
import type { BandwidthProvider } from '../types';
import { FieldError } from '../components/OptionSelect';
import { RefreshState } from '../components/RefreshState';
import { useServerTable } from '@/features/admin/routers/hooks/useServerTable';
import { fieldErrorsOf } from '../utils';

type DialogState = { mode: 'create' } | { mode: 'edit'; provider: BandwidthProvider } | null;

/** http(s) link for a stored website; bare domains get https://, other schemes are not linked. */
const safeHref = (url: string): string | null => {
  if (!url) return null;
  if (/^https?:\/\//i.test(url)) return url;
  return /^[a-z][a-z0-9+.-]*:/i.test(url) ? null : `https://${url}`;
};

const initials = (name: string) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('');

export function BandwidthProvidersPage() {
  const table = useServerTable();
  const { page, pageSize, search } = table;
  const { data, isLoading, isError, error, refetch, isFetching } = useBandwidthProviders({ page, pageSize, search });
  const remove = useDeleteBandwidthProviders();
  const [dialog, setDialog] = useState<DialogState>(null);
  const [toDelete, setToDelete] = useState<BandwidthProvider[] | null>(null);

  const providers = useMemo(() => data?.items ?? [], [data]);
  const total = data?.meta.total ?? 0;

  const confirmDelete = () => {
    if (!toDelete?.length) return;
    const ids = toDelete.map((p) => p.id);
    remove.mutate(ids, { onSuccess: () => toast.success(ids.length === 1 ? 'Provider deleted' : `${ids.length} providers deleted`) });
    setToDelete(null);
  };

  const columns = useMemo<LegacyColumnDef<BandwidthProvider, unknown>[]>(
    () => [
      {
        accessorKey: 'companyName',
        header: 'Provider',
        enableHiding: false,
        size: 260,
        cell: ({ row }) => (
          <div className="flex items-center gap-2.5">
            {row.original.imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={row.original.imageUrl} alt="" className="h-9 w-9 rounded-xl object-cover border border-border/60 shrink-0" />
            ) : (
              <div className="h-9 w-9 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 font-bold text-xs flex items-center justify-center border border-blue-500/20 shrink-0">
                {initials(row.original.companyName)}
              </div>
            )}
            <div>
              <div className="font-bold text-sm text-foreground">{row.original.companyName}</div>
              {row.original.address ? (
                <div className="text-[11px] text-muted-foreground flex items-center gap-1 mt-0.5">
                  <MapPin className="h-3 w-3 text-primary/70 shrink-0" />
                  <span className="truncate max-w-[200px]">{row.original.address}</span>
                </div>
              ) : null}
            </div>
          </div>
        ),
      },
      {
        accessorKey: 'contactPerson',
        header: 'Contact Person',
        size: 170,
        cell: ({ row }) => <span className="font-semibold text-xs text-foreground">{row.original.contactPerson || '—'}</span>,
      },
      {
        accessorKey: 'mobileNumber',
        header: 'Mobile & Email',
        size: 200,
        cell: ({ row }) => (
          <div className="space-y-0.5">
            <div className="font-mono text-xs font-semibold text-foreground flex items-center gap-1">
              <Phone className="h-3 w-3 text-muted-foreground" /> {row.original.mobileNumber || '—'}
              {row.original.phoneNumber ? <span className="text-muted-foreground font-normal">· {row.original.phoneNumber}</span> : null}
            </div>
            {row.original.email ? (
              <div className="text-[10px] text-muted-foreground font-mono flex items-center gap-1">
                <Mail className="h-3 w-3 text-muted-foreground" /> {row.original.email}
              </div>
            ) : null}
          </div>
        ),
      },
      {
        accessorKey: 'website',
        header: 'Website',
        size: 170,
        cell: ({ row }) => {
          const href = safeHref(row.original.website);
          if (!row.original.website) return <span className="text-xs text-muted-foreground">—</span>;
          const label = <span className="truncate max-w-[140px]">{row.original.website.replace(/^https?:\/\//i, '')}</span>;
          return href ? (
            <a href={href} target="_blank" rel="noreferrer" className="text-xs text-primary hover:underline inline-flex items-center gap-1">
              <Globe className="h-3 w-3" />
              {label}
            </a>
          ) : (
            <span className="text-xs text-muted-foreground">{label}</span>
          );
        },
      },
      {
        id: 'actions',
        header: '',
        size: 90,
        cell: ({ row }) => (
          <div className="flex justify-end gap-1">
            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary" aria-label="Edit" onClick={() => setDialog({ mode: 'edit', provider: row.original })}>
              <Pencil className="h-3.5 w-3.5" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10" aria-label="Delete" onClick={() => setToDelete([row.original])}>
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        ),
      },
    ],
    [],
  );

  if (isLoading) return <PageSkeleton variant="table" rows={4} />;
  if (isError && !data) {
    return (
      <div className="p-6">
        <EmptyState title="Failed to load providers" description="Could not fetch bandwidth providers." actionLabel="Retry" onAction={() => refetch()} />
      </div>
    );
  }

  return (
    <div className="space-y-6 w-full pb-12">
      <PageHeader
        title="Bandwidth Upstream Providers"
        subtitle="Upstream carriers that bandwidth purchase bills are recorded against"
        breadcrumb={[
          { label: 'Admin', url: '/admin/dashboard' },
          { label: 'Bandwidth Buy', url: '/admin/bandwidth/buy' },
          { label: 'Providers' },
        ]}
        actions={
          <Button size="sm" onClick={() => setDialog({ mode: 'create' })} className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-xs shadow-2xs gap-1.5">
            <Plus className="h-3.5 w-3.5" /> Add Provider
          </Button>
        }
      />

      <div className="flex flex-wrap gap-x-6 gap-y-2 border-y border-border/60 py-3 text-sm">
        <p>
          <span className="font-semibold tabular-nums text-foreground">{total}</span>{' '}
          <span className="text-muted-foreground">{search ? 'matching providers' : 'providers'}</span>
        </p>
        <RefreshState fetching={isFetching} error={isError ? error : null} onRetry={() => refetch()} />
      </div>

      <DataTable
        columns={columns}
        data={providers}
        getRowId={(row) => String(row.id)}
        searchPlaceholder="Search provider by name, contact person, mobile, email..."
        enableRowSelection
        onDeleteSelected={(rows) => setToDelete(rows)}
        server={table.server(total)}
        emptyTitle={search ? 'No providers match your search' : 'No providers yet'}
        emptyDescription={search ? undefined : 'Add an upstream provider to start recording purchase bills.'}
      />

      <Dialog open={dialog !== null} onOpenChange={(open) => !open && setDialog(null)}>
        <DialogContent className="sm:max-w-lg p-6 border-border/80 shadow-[var(--shadow-md)]">
          {dialog ? (
            <ProviderForm key={dialog.mode === 'edit' ? dialog.provider.id : 'new'} editing={dialog.mode === 'edit' ? dialog.provider : null} onDone={() => setDialog(null)} />
          ) : null}
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={toDelete !== null}
        onOpenChange={(open) => !open && setToDelete(null)}
        title={toDelete?.length === 1 ? `Delete "${toDelete[0]?.companyName ?? ''}"?` : `Delete ${toDelete?.length ?? 0} providers?`}
        description="This cannot be undone."
        confirmLabel="Delete"
        destructive
        onConfirm={confirmDelete}
      />
    </div>
  );
}

const FIELDS: { key: keyof ProviderInput; api: string; label: string; type?: string; required?: boolean; wide?: boolean }[] = [
  { key: 'companyName', api: 'company_name', label: 'Company name', required: true, wide: true },
  { key: 'contactPerson', api: 'contact_person', label: 'Contact person', required: true },
  { key: 'email', api: 'email', label: 'Email', type: 'email', required: true },
  { key: 'mobileNumber', api: 'mobile_number', label: 'Mobile number', required: true },
  { key: 'phoneNumber', api: 'phone_number', label: 'Phone number' },
  { key: 'website', api: 'website', label: 'Website' },
  { key: 'facebookUrl', api: 'facebook_url', label: 'Facebook URL' },
  { key: 'skypeId', api: 'skype_id', label: 'Skype ID' },
  { key: 'address', api: 'address', label: 'Address', wide: true },
];

function ProviderForm({ editing, onDone }: { editing: BandwidthProvider | null; onDone: () => void }) {
  const create = useCreateBandwidthProvider();
  const update = useUpdateBandwidthProvider();
  const [form, setForm] = useState<ProviderInput>({
    companyName: editing?.companyName ?? '',
    contactPerson: editing?.contactPerson ?? '',
    email: editing?.email ?? '',
    mobileNumber: editing?.mobileNumber ?? '',
    phoneNumber: editing?.phoneNumber ?? '',
    website: editing?.website ?? '',
    facebookUrl: editing?.facebookUrl ?? '',
    skypeId: editing?.skypeId ?? '',
    address: editing?.address ?? '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const pending = create.isPending || update.isPending;

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    const callbacks = {
      onSuccess: () => {
        toast.success(editing ? 'Provider updated' : 'Provider added');
        onDone();
      },
      onError: (err: unknown) => setErrors(fieldErrorsOf(err)),
    };
    if (editing) update.mutate({ ...form, id: editing.id }, callbacks);
    else create.mutate(form, callbacks);
  };

  return (
    <>
      <DialogHeader>
        <DialogTitle className="text-base font-bold flex items-center gap-2">
          <Truck className="h-4 w-4 text-primary" /> {editing ? 'Edit provider' : 'Add provider'}
        </DialogTitle>
        <DialogDescription className="text-xs">Upstream bandwidth carrier contact details.</DialogDescription>
      </DialogHeader>

      <form onSubmit={submit} className="grid grid-cols-2 gap-3 pt-2">
        {FIELDS.map((f) => (
          <div key={f.key} className={f.wide ? 'col-span-2 space-y-1.5' : 'col-span-2 sm:col-span-1 space-y-1.5'}>
            <Label htmlFor={`prov-${f.key}`} className="text-xs font-semibold">
              {f.label}
              {f.required ? ' *' : ''}
            </Label>
            <Input
              id={`prov-${f.key}`}
              type={f.type ?? 'text'}
              value={form[f.key]}
              onChange={(e) => setForm({ ...form, [f.key]: e.target.value })}
              required={f.required}
              className="text-xs h-9"
              aria-invalid={Boolean(errors[f.api]) || undefined}
            />
            <FieldError message={errors[f.api]} />
          </div>
        ))}

        <div className="col-span-2 flex justify-end gap-2 pt-3 border-t">
          <Button type="button" variant="outline" size="sm" onClick={onDone} className="text-xs">Cancel</Button>
          <Button type="submit" size="sm" disabled={pending} className="text-xs font-semibold">
            {pending ? 'Saving…' : editing ? 'Save provider' : 'Add provider'}
          </Button>
        </div>
      </form>
    </>
  );
}
