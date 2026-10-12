'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { LegacyColumnDef } from '@tanstack/react-table/legacy';
import { toast } from 'sonner';
import { Plus, Warehouse, Building2, Boxes, Coins, MoreHorizontal, Edit, Trash2, ExternalLink } from 'lucide-react';
import { PageHeader } from '@/features/admin/shared/components/PageHeader';
import { Can, ConfirmDialog } from '@/components/shared';
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
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Label } from '@/components/ui/label';
import { formatBdtWithSymbol } from '@/lib/format/currency';
import type { StoreLocation } from '../api';
import { useDeleteStoreLocation, useSaveStoreLocation, useStoreLocations } from '../hooks/use-store-locations';
import { useInventorySummary } from '../hooks/use-inventory-summary';
import { KpiTile } from '../shared/KpiTile';
import { ListState } from '../shared/ListState';
import { FieldError, fieldError, fmtDateTime } from '../shared/form-utils';
import { useServerTable } from '../shared/table-utils';

const MENU = 'inventory_purchess';

export function InventoryLocationsPage() {
  const router = useRouter();
  const table = useServerTable();
  const query = useStoreLocations({ page: table.page, pageSize: table.pageSize, search: table.search });
  const summary = useInventorySummary();
  const deleteLocation = useDeleteStoreLocation();

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<StoreLocation | null>(null);
  const [deleting, setDeleting] = useState<StoreLocation | null>(null);

  const page = query.data;
  const s = summary.data;

  const columns = useMemo<LegacyColumnDef<StoreLocation, unknown>[]>(
    () => [
      {
        accessorKey: 'locationName',
        header: 'Store / Warehouse',
        enableHiding: false,
        size: 280,
        cell: ({ row }) => (
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 border border-primary/20 text-primary shadow-xs">
              <Warehouse className="h-4 w-4" />
            </div>
            <span className="font-semibold text-foreground text-sm">{row.original.locationName}</span>
          </div>
        ),
      },
      {
        accessorKey: 'shortValue',
        header: 'Short Code',
        size: 140,
        cell: ({ row }) => (
          <Badge variant="outline" className="font-mono text-xs bg-background">
            {row.original.shortValue || '—'}
          </Badge>
        ),
      },
      {
        accessorKey: 'createdAt',
        header: 'Created',
        size: 170,
        cell: ({ row }) => (
          <span className="font-mono text-xs text-muted-foreground">{fmtDateTime(row.original.createdAt)}</span>
        ),
      },
      {
        id: 'actions',
        header: '',
        size: 60,
        cell: ({ row }) => {
          const loc = row.original;
          return (
            <DropdownMenu>
              <DropdownMenuTrigger className="inline-flex items-center justify-center h-8 w-8 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent/60 transition-colors">
                <MoreHorizontal className="h-4 w-4" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuLabel>Location Options</DropdownMenuLabel>
                <DropdownMenuItem onClick={() => router.push(`/admin/inventory/stock?location_id=${encodeURIComponent(loc.id)}`)}>
                  <ExternalLink className="h-3.5 w-3.5 mr-2" />
                  View On-Hand Stock
                </DropdownMenuItem>
                <Can menu={MENU} action="update">
                  <DropdownMenuItem
                    onClick={() => {
                      setEditing(loc);
                      setFormOpen(true);
                    }}
                  >
                    <Edit className="h-3.5 w-3.5 mr-2" />
                    Edit Location
                  </DropdownMenuItem>
                </Can>
                <Can menu={MENU} action="delete">
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="text-rose-500 focus:text-rose-500" onClick={() => setDeleting(loc)}>
                    <Trash2 className="h-3.5 w-3.5 mr-2" />
                    Delete Location
                  </DropdownMenuItem>
                </Can>
              </DropdownMenuContent>
            </DropdownMenu>
          );
        },
      },
    ],
    [router],
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Store & Warehouse Locations"
        subtitle="Physical storage points that hold stock (central depot, POP sub-stores…)."
        breadcrumb={[
          { label: 'Dashboard', href: '/admin/dashboard' },
          { label: 'Inventory', href: '/admin/inventory/items' },
          { label: 'Store Locations' },
        ]}
        actions={
          <Can menu={MENU} action="create">
            <Button
              size="sm"
              onClick={() => {
                setEditing(null);
                setFormOpen(true);
              }}
              className="h-9"
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Store Location
            </Button>
          </Can>
        }
      />

      {/* KPI Ribbon */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4">
        <KpiTile
          label="Store Locations"
          icon={<Building2 className="h-4 w-4 text-primary" />}
          value={s ? s.locationsCount.toLocaleString() : '—'}
          hint="Stock-holding points"
        />
        <KpiTile
          label="Units On Hand"
          icon={<Boxes className="h-4 w-4 text-emerald-500" />}
          value={s ? s.stockQuantity.toLocaleString() : '—'}
          hint="Across all locations"
          hintClassName="text-emerald-600 dark:text-emerald-400 font-medium"
        />
        <KpiTile
          label="Stock Value"
          icon={<Coins className="h-4 w-4 text-primary" />}
          value={s ? formatBdtWithSymbol(s.stockValue) : '—'}
          hint="On-hand quantity × unit price"
        />
      </div>

      <ListState
        isLoading={query.isLoading}
        isError={query.isError}
        error={query.error}
        onRetry={() => query.refetch()}
        isEmpty={!table.search && page?.meta.total === 0}
        errorTitle="Failed to load locations"
        emptyTitle="No store locations yet"
        emptyDescription="Add a warehouse or POP store to start recording stock."
        icon={<Warehouse className="h-5 w-5" />}
        rows={6}
      >
        <DataTable
          columns={columns}
          data={page?.items ?? []}
          getRowId={(r) => r.id}
          searchPlaceholder="Search locations..."
          emptyTitle="No locations match your search"
          server={{
            page: table.page,
            pageSize: table.pageSize,
            total: page?.meta.total ?? 0,
            onPageChange: table.setPage,
            onPageSizeChange: table.onPageSizeChange,
            search: table.search,
            onSearchChange: table.onSearchChange,
          }}
        />
      </ListState>

      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="sm:max-w-md">
          {formOpen ? <LocationForm location={editing} onDone={() => setFormOpen(false)} /> : null}
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={deleting !== null}
        onOpenChange={(o) => !o && setDeleting(null)}
        title="Delete store location?"
        description={deleting ? `"${deleting.locationName}" will be deleted.` : undefined}
        confirmLabel="Delete"
        destructive
        onConfirm={() => {
          if (!deleting) return;
          const target = deleting;
          deleteLocation.mutate(target.id, { onSuccess: () => toast.success(`"${target.locationName}" deleted`) });
          setDeleting(null);
        }}
      />
    </div>
  );
}

function LocationForm({ location, onDone }: { location: StoreLocation | null; onDone: () => void }) {
  const [locationName, setLocationName] = useState(location?.locationName ?? '');
  const [shortValue, setShortValue] = useState(location?.shortValue ?? '');
  const save = useSaveStoreLocation();
  const err = save.error;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!locationName.trim() || !shortValue.trim()) return;
    save.mutate(
      { id: location?.id, body: { location_name: locationName.trim(), short_value: shortValue.trim() } },
      {
        onSuccess: () => {
          toast.success(location ? `"${locationName.trim()}" updated` : `Store location "${locationName.trim()}" added`);
          onDone();
        },
      },
    );
  };

  return (
    <form onSubmit={handleSubmit}>
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2">
          <Warehouse className="h-5 w-5 text-primary" />
          {location ? 'Edit Store Location' : 'Add Store Location'}
        </DialogTitle>
        <DialogDescription>A warehouse or sub-store that holds inventory.</DialogDescription>
      </DialogHeader>

      <div className="grid gap-4 py-4">
        <div className="space-y-1.5">
          <Label htmlFor="loc-name">Location Name *</Label>
          <Input
            id="loc-name"
            value={locationName}
            onChange={(e) => setLocationName(e.target.value)}
            aria-invalid={Boolean(fieldError(err, 'location_name')) || undefined}
            required
          />
          <FieldError message={fieldError(err, 'location_name')} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="loc-short">Short Code *</Label>
          <Input
            id="loc-short"
            value={shortValue}
            onChange={(e) => setShortValue(e.target.value)}
            className="font-mono"
            aria-invalid={Boolean(fieldError(err, 'short_value')) || undefined}
            required
          />
          <FieldError message={fieldError(err, 'short_value')} />
        </div>
      </div>

      <DialogFooter>
        <Button type="button" variant="outline" onClick={onDone}>
          Cancel
        </Button>
        <Button type="submit" disabled={save.isPending}>
          {save.isPending ? 'Saving…' : location ? 'Save Changes' : 'Add Location'}
        </Button>
      </DialogFooter>
    </form>
  );
}
