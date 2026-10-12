'use client';

import { useMemo, useState } from 'react';
import type { LegacyColumnDef } from '@tanstack/react-table/legacy';
import { toast } from 'sonner';
import {
  Plus,
  Download,
  Router,
  CheckCircle2,
  UserCheck,
  MoreHorizontal,
  RotateCcw,
  User,
  MapPin,
  Search,
  X,
  Boxes,
} from 'lucide-react';
import { PageHeader } from '@/features/admin/shared/components/PageHeader';
import { Can } from '@/components/shared';
import { DataTable } from '@/features/shared/data-table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Label } from '@/components/ui/label';
import {
  INVENTORY_URL,
  idParam,
  mapCpeAssignment,
  type CpeAssignment,
  type CustomerOption,
} from '@/features/admin/inventory/api';
import {
  useAssignCpe,
  useCpeAssignments,
  useCustomerOptions,
  useReturnCpe,
} from '@/features/admin/inventory/hooks/use-cpe-assignments';
import { useInventoryItemOptions } from '@/features/admin/inventory/hooks/use-inventory-items';
import { useStoreLocationOptions } from '@/features/admin/inventory/hooks/use-store-locations';
import { useInventorySummary } from '@/features/admin/inventory/hooks/use-inventory-summary';
import { KpiTile } from '@/features/admin/inventory/shared/KpiTile';
import { ListState } from '@/features/admin/inventory/shared/ListState';
import { OptionSelect } from '@/features/admin/inventory/shared/OptionSelect';
import { FieldError, fieldError, fmtDateTime } from '@/features/admin/inventory/shared/form-utils';
import { useDebouncedValue } from '@/features/admin/inventory/shared/hooks';
import { downloadCsv, fetchAllPages, todayYmd, useServerTable } from '@/features/admin/inventory/shared/table-utils';

const MENU = 'inventory_purchess';

const STATUS_OPTIONS = [
  { value: 'assigned', label: 'Assigned' },
  { value: 'returned', label: 'Returned' },
];

/** CPE / ONU assignment registry = GET /v1/inventory/cpe-assignments (issue from stock, return to stock). */
export function CpeAssignPage() {
  const table = useServerTable();
  const [status, setStatus] = useState<'' | 'assigned' | 'returned'>('');
  const query = useCpeAssignments({ page: table.page, pageSize: table.pageSize, search: table.search, status });
  const summary = useInventorySummary();
  const [assignOpen, setAssignOpen] = useState(false);
  const [returning, setReturning] = useState<CpeAssignment | null>(null);
  const [exporting, setExporting] = useState(false);

  const page = query.data;
  const s = summary.data;
  const issued = s ? s.cpeAssigned + s.cpeReturned : 0;

  const handleExportCsv = async () => {
    setExporting(true);
    try {
      const rows = (
        await fetchAllPages<unknown>(`${INVENTORY_URL}/cpe-assignments`, {
          status: status || undefined,
          search: table.search || undefined,
        })
      ).map(mapCpeAssignment);
      downloadCsv(
        `cpe_assignments_${todayYmd()}.csv`,
        ['Serial No', 'MAC Address', 'Item', 'Customer', 'Customer Mobile', 'Location', 'Assigned At', 'Status', 'Returned At', 'Assigned By', 'Note'],
        rows.map((r) => [
          r.serialNo,
          r.macAddress,
          r.itemName,
          r.customerName,
          r.customerMobile,
          r.locationName,
          r.assignedAt,
          r.status,
          r.returnedAt ?? '',
          r.assignedByName,
          r.note,
        ]),
      );
      toast.success(`Exported ${rows.length} CPE records`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Export failed');
    } finally {
      setExporting(false);
    }
  };

  const columns = useMemo<LegacyColumnDef<CpeAssignment, unknown>[]>(
    () => [
      {
        accessorKey: 'serialNo',
        header: 'CPE Serial Number',
        enableHiding: false,
        size: 200,
        cell: ({ row }) => (
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 border border-primary/20 text-primary">
              <Router className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded bg-muted text-foreground border border-border/70">
                {row.original.serialNo}
              </span>
              {row.original.macAddress ? (
                <p className="mt-0.5 font-mono text-[11px] text-muted-foreground">{row.original.macAddress}</p>
              ) : null}
            </div>
          </div>
        ),
      },
      {
        accessorKey: 'itemName',
        header: 'Device Model',
        size: 200,
        cell: ({ row }) => <span className="text-sm font-medium text-foreground">{row.original.itemName}</span>,
      },
      {
        accessorKey: 'customerName',
        header: 'Assigned Subscriber',
        size: 200,
        cell: ({ row }) => (
          <div className="flex items-center gap-2">
            <User className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
            <div className="min-w-0">
              <span className="text-sm font-medium text-foreground">{row.original.customerName || '—'}</span>
              {row.original.customerMobile ? (
                <p className="font-mono text-[11px] text-muted-foreground">{row.original.customerMobile}</p>
              ) : null}
            </div>
          </div>
        ),
      },
      {
        accessorKey: 'locationName',
        header: 'Source Location',
        size: 160,
        cell: ({ row }) => (
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <MapPin className="h-3.5 w-3.5 text-primary shrink-0" />
            <span className="truncate">{row.original.locationName || '—'}</span>
          </div>
        ),
      },
      {
        accessorKey: 'assignedAt',
        header: 'Assigned',
        size: 140,
        cell: ({ row }) => (
          <span className="font-mono text-xs text-muted-foreground">{fmtDateTime(row.original.assignedAt)}</span>
        ),
      },
      {
        accessorKey: 'status',
        header: 'Status',
        size: 110,
        cell: ({ row }) =>
          row.original.status === 'assigned' ? (
            <Badge variant="outline" className="bg-emerald-500/10 text-emerald-500 border-emerald-500/30">
              Assigned
            </Badge>
          ) : (
            <Badge variant="outline" className="bg-sky-500/10 text-sky-500 border-sky-500/30">
              Returned
            </Badge>
          ),
      },
      {
        accessorKey: 'returnedAt',
        header: 'Returned',
        size: 140,
        cell: ({ row }) => (
          <span className="font-mono text-xs text-muted-foreground">{fmtDateTime(row.original.returnedAt)}</span>
        ),
      },
      {
        id: 'actions',
        header: '',
        size: 60,
        cell: ({ row }) => {
          const r = row.original;
          if (r.status !== 'assigned') return null;
          return (
            <Can menu={MENU} action="update">
              <DropdownMenu>
                <DropdownMenuTrigger className="inline-flex items-center justify-center h-8 w-8 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent/60 transition-colors">
                  <MoreHorizontal className="h-4 w-4" />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuLabel>Device Actions</DropdownMenuLabel>
                  <DropdownMenuItem onClick={() => setReturning(r)}>
                    <RotateCcw className="h-3.5 w-3.5 mr-2" />
                    Return to Stock
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </Can>
          );
        },
      },
    ],
    [],
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="CPE & Device Assignment"
        subtitle="Issue ONUs / routers from stock to subscribers and take them back into stock."
        breadcrumb={[
          { label: 'Dashboard', href: '/admin/dashboard' },
          { label: 'Inventory', href: '/admin/inventory/items' },
          { label: 'CPE Assignment' },
        ]}
        actions={
          <div className="flex items-center gap-2.5">
            <Button variant="outline" size="sm" onClick={handleExportCsv} disabled={exporting} className="h-9">
              <Download className="mr-2 h-4 w-4" />
              {exporting ? 'Exporting…' : 'Export Registry'}
            </Button>
            <Can menu={MENU} action="create">
              <Button size="sm" onClick={() => setAssignOpen(true)} className="h-9">
                <Plus className="mr-2 h-4 w-4" />
                Assign CPE
              </Button>
            </Can>
          </div>
        }
      />

      {/* KPI Ribbon */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
        <KpiTile
          label="Total Issued"
          icon={<Router className="h-4 w-4 text-primary" />}
          value={s ? issued.toLocaleString() : '—'}
          hint="Assigned + returned"
        />
        <KpiTile
          label="Currently Assigned"
          icon={<CheckCircle2 className="h-4 w-4 text-emerald-500" />}
          value={s ? s.cpeAssigned.toLocaleString() : '—'}
          hint="With subscribers"
          hintClassName="text-emerald-600 dark:text-emerald-400 font-medium"
        />
        <KpiTile
          label="Returned"
          icon={<Boxes className="h-4 w-4 text-sky-500" />}
          value={s ? s.cpeReturned.toLocaleString() : '—'}
          hint="Back in stock"
          hintClassName="text-sky-600 dark:text-sky-400 font-medium"
        />
        <KpiTile
          label="Deployment Rate"
          icon={<UserCheck className="h-4 w-4 text-primary" />}
          value={s && issued > 0 ? `${Math.round((s.cpeAssigned / issued) * 100)}%` : '—'}
          hint="Assigned ÷ issued"
        />
      </div>

      <ListState
        isLoading={query.isLoading}
        isError={query.isError}
        error={query.error}
        onRetry={() => query.refetch()}
        isEmpty={!table.search && !status && page?.meta.total === 0}
        errorTitle="Failed to load CPE records"
        emptyTitle="No CPE assigned yet"
        emptyDescription="Use Assign CPE to issue a device from stock to a subscriber."
        icon={<Router className="h-5 w-5" />}
      >
        <DataTable
          columns={columns}
          data={page?.items ?? []}
          getRowId={(r) => r.id}
          searchPlaceholder="Search by serial, MAC, model or customer..."
          emptyTitle="No CPE records match your filters"
          server={{
            page: table.page,
            pageSize: table.pageSize,
            total: page?.meta.total ?? 0,
            onPageChange: table.setPage,
            onPageSizeChange: table.onPageSizeChange,
            search: table.search,
            onSearchChange: table.onSearchChange,
          }}
          toolbarActions={
            <OptionSelect
              value={status}
              onChange={(v) => {
                setStatus(v === 'assigned' || v === 'returned' ? v : '');
                table.resetPage();
              }}
              options={STATUS_OPTIONS}
              noneLabel="All statuses"
              className="h-9 w-36 text-xs"
            />
          }
        />
      </ListState>

      <Dialog open={assignOpen} onOpenChange={setAssignOpen}>
        <DialogContent className="sm:max-w-lg">
          {assignOpen ? <AssignForm onDone={() => setAssignOpen(false)} /> : null}
        </DialogContent>
      </Dialog>

      <Dialog open={returning !== null} onOpenChange={(o) => !o && setReturning(null)}>
        <DialogContent className="sm:max-w-md">
          {returning ? <ReturnForm assignment={returning} onDone={() => setReturning(null)} /> : null}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function CustomerPicker({
  value,
  onChange,
  invalid,
}: {
  value: CustomerOption | null;
  onChange: (c: CustomerOption | null) => void;
  invalid?: boolean;
}) {
  const [search, setSearch] = useState('');
  const debounced = useDebouncedValue(search.trim(), 350);
  const options = useCustomerOptions(debounced, value === null);

  if (value) {
    return (
      <div className="flex items-center justify-between gap-2 rounded-lg border border-border/70 bg-muted/30 px-3 py-2">
        <div className="min-w-0 text-sm">
          <span className="font-medium text-foreground">{value.name}</span>
          <span className="text-xs text-muted-foreground">
            {[value.mobile, value.pppoeId].filter(Boolean).map((v) => ` · ${v}`).join('')}
          </span>
        </div>
        <Button type="button" variant="ghost" size="sm" className="h-7 w-7 p-0" aria-label="Clear customer" onClick={() => onChange(null)}>
          <X className="h-3.5 w-3.5" />
        </Button>
      </div>
    );
  }

  const results = options.data ?? [];
  return (
    <div className="space-y-1.5">
      <div className="relative">
        <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
        <Input
          id="cpe-cust"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search name, mobile or PPPoE ID…"
          className="pl-8"
          aria-invalid={invalid || undefined}
          autoComplete="off"
        />
      </div>
      <div className="max-h-44 overflow-y-auto rounded-lg border border-border/60">
        {options.isLoading ? (
          <p className="px-3 py-2 text-xs text-muted-foreground">Searching…</p>
        ) : options.isError ? (
          <p className="px-3 py-2 text-xs text-destructive">{options.error.message}</p>
        ) : results.length === 0 ? (
          <p className="px-3 py-2 text-xs text-muted-foreground">No customers found.</p>
        ) : (
          results.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => onChange(c)}
              className="flex w-full items-center justify-between gap-2 px-3 py-1.5 text-left text-sm hover:bg-accent/60"
            >
              <span className="font-medium text-foreground">{c.name}</span>
              <span className="font-mono text-[11px] text-muted-foreground">{[c.mobile, c.pppoeId].filter(Boolean).join(' · ')}</span>
            </button>
          ))
        )}
      </div>
    </div>
  );
}

function AssignForm({ onDone }: { onDone: () => void }) {
  const [itemId, setItemId] = useState('');
  const [locationId, setLocationId] = useState('');
  const [customer, setCustomer] = useState<CustomerOption | null>(null);
  const [serialNo, setSerialNo] = useState('');
  const [macAddress, setMacAddress] = useState('');
  const [note, setNote] = useState('');
  const [localError, setLocalError] = useState<Record<string, string>>({});

  const items = useInventoryItemOptions();
  const locations = useStoreLocationOptions();
  const assign = useAssignCpe();
  const err = assign.error;
  const errorFor = (key: string) => localError[key] ?? fieldError(err, key);

  const itemOptions = useMemo(
    () => (items.data ?? []).map((i) => ({ value: i.id, label: [i.itemName, i.subcategory || i.category].filter(Boolean).join(' · ') })),
    [items.data],
  );
  const locationOptions = useMemo(
    () => (locations.data ?? []).map((l) => ({ value: l.id, label: l.locationName })),
    [locations.data],
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errors: Record<string, string> = {};
    if (!itemId) errors.item_id = 'Select the device item';
    if (!locationId) errors.location_id = 'Select the source location';
    if (!customer) errors.customer_id = 'Select a customer';
    if (!serialNo.trim()) errors.serial_no = 'Serial number is required';
    setLocalError(errors);
    if (Object.keys(errors).length > 0 || !customer) return;

    assign.mutate(
      {
        item_id: idParam(itemId),
        location_id: idParam(locationId),
        customer_id: idParam(customer.id),
        serial_no: serialNo.trim(),
        mac_address: macAddress.trim() || undefined,
        note: note.trim() || undefined,
      },
      {
        onSuccess: () => {
          toast.success(`CPE ${serialNo.trim()} assigned to ${customer.name}`);
          onDone();
        },
      },
    );
  };

  return (
    <form onSubmit={handleSubmit}>
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2">
          <Router className="h-5 w-5 text-primary" />
          Assign CPE Device
        </DialogTitle>
        <DialogDescription>Issues one unit from the selected location&apos;s stock to the subscriber.</DialogDescription>
      </DialogHeader>

      <div className="grid gap-4 py-4">
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="cpe-item">Device Item *</Label>
            <OptionSelect
              id="cpe-item"
              value={itemId}
              onChange={setItemId}
              options={itemOptions}
              placeholder={items.isLoading ? 'Loading…' : 'Select item'}
              disabled={items.isLoading}
              invalid={Boolean(errorFor('item_id'))}
            />
            <FieldError message={errorFor('item_id')} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="cpe-loc">Source Location *</Label>
            <OptionSelect
              id="cpe-loc"
              value={locationId}
              onChange={setLocationId}
              options={locationOptions}
              placeholder={locations.isLoading ? 'Loading…' : 'Select location'}
              disabled={locations.isLoading}
              invalid={Boolean(errorFor('location_id'))}
            />
            <FieldError message={errorFor('location_id') ?? fieldError(err, 'quantity')} />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="cpe-cust">Customer *</Label>
          <CustomerPicker value={customer} onChange={setCustomer} invalid={Boolean(errorFor('customer_id'))} />
          <FieldError message={errorFor('customer_id')} />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="cpe-serial">Serial Number (PON SN) *</Label>
            <Input
              id="cpe-serial"
              value={serialNo}
              onChange={(e) => setSerialNo(e.target.value)}
              className="font-mono uppercase"
              aria-invalid={Boolean(errorFor('serial_no')) || undefined}
              required
            />
            <FieldError message={errorFor('serial_no')} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="cpe-mac">MAC Address</Label>
            <Input id="cpe-mac" value={macAddress} onChange={(e) => setMacAddress(e.target.value)} className="font-mono" />
            <FieldError message={fieldError(err, 'mac_address')} />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="cpe-note">Note</Label>
          <Input id="cpe-note" value={note} onChange={(e) => setNote(e.target.value)} />
          <FieldError message={fieldError(err, 'note')} />
        </div>
      </div>

      <DialogFooter>
        <Button type="button" variant="outline" onClick={onDone}>
          Cancel
        </Button>
        <Button type="submit" disabled={assign.isPending}>
          {assign.isPending ? 'Assigning…' : 'Assign CPE'}
        </Button>
      </DialogFooter>
    </form>
  );
}

function ReturnForm({ assignment, onDone }: { assignment: CpeAssignment; onDone: () => void }) {
  const [locationId, setLocationId] = useState(assignment.locationId);
  const [note, setNote] = useState('');
  const locations = useStoreLocationOptions();
  const returnCpe = useReturnCpe();
  const locationOptions = useMemo(
    () => (locations.data ?? []).map((l) => ({ value: l.id, label: l.locationName })),
    [locations.data],
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    returnCpe.mutate(
      {
        id: assignment.id,
        body: {
          location_id: locationId && locationId !== assignment.locationId ? idParam(locationId) : undefined,
          note: note.trim() || undefined,
        },
      },
      {
        onSuccess: () => {
          toast.success(`CPE ${assignment.serialNo} returned to stock`);
          onDone();
        },
      },
    );
  };

  return (
    <form onSubmit={handleSubmit}>
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2">
          <RotateCcw className="h-5 w-5 text-primary" />
          Return CPE to Stock?
        </DialogTitle>
        <DialogDescription>
          {assignment.itemName} · SN {assignment.serialNo} from {assignment.customerName || 'customer'} goes back into stock (+1).
        </DialogDescription>
      </DialogHeader>

      <div className="grid gap-4 py-4">
        <div className="space-y-1.5">
          <Label htmlFor="ret-loc">Return to Location</Label>
          <OptionSelect
            id="ret-loc"
            value={locationId}
            onChange={(v) => setLocationId(v || assignment.locationId)}
            options={locationOptions}
            placeholder={assignment.locationName || 'Original location'}
            disabled={locations.isLoading}
          />
          <FieldError message={fieldError(returnCpe.error, 'location_id')} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="ret-note">Note</Label>
          <Input id="ret-note" value={note} onChange={(e) => setNote(e.target.value)} />
        </div>
      </div>

      <DialogFooter>
        <Button type="button" variant="outline" onClick={onDone}>
          Cancel
        </Button>
        <Button type="submit" disabled={returnCpe.isPending}>
          {returnCpe.isPending ? 'Returning…' : 'Return to Stock'}
        </Button>
      </DialogFooter>
    </form>
  );
}
