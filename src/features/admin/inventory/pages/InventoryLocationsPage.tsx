'use client';

import { useMemo, useState } from 'react';
import type { LegacyColumnDef, LegacyRow } from '@tanstack/react-table/legacy';
import { PageHeader } from '@/features/admin/shared/components/PageHeader';
import { useInventory, type InventoryLocation } from '../hooks/use-inventory';
import { PageSkeleton } from '@/components/shared/LoadingSkeleton';
import { EmptyState } from '@/components/shared/EmptyState';
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
import {
  Plus,
  Warehouse,
  Building2,
  MapPin,
  Phone,
  User,
  MoreHorizontal,
  Edit,
  Trash2,
  ExternalLink,
} from 'lucide-react';
import { toast } from 'sonner';

const locationSearchFilter = (
  row: LegacyRow<InventoryLocation>,
  _columnId: string,
  filterValue: unknown,
) => {
  const q = String(filterValue ?? '').toLowerCase().trim();
  if (!q) return true;
  const loc = row.original;
  return (
    loc.name.toLowerCase().includes(q) ||
    loc.code.toLowerCase().includes(q) ||
    loc.managerName.toLowerCase().includes(q) ||
    loc.address.toLowerCase().includes(q) ||
    loc.phone.includes(q)
  );
};

export function InventoryLocationsPage() {
  const { locations: initialLocations, isLoading, isError, refetch } = useInventory();
  const [locations, setLocations] = useState<InventoryLocation[]>([]);
  const [modalOpen, setModalOpen] = useState(false);

  // Form State
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [managerName, setManagerName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');

  const list = locations.length > 0 ? locations : initialLocations;

  const totalLocations = list.length;
  const centralHubs = list.filter((l) => l.name.toLowerCase().includes('central') || l.name.toLowerCase().includes('noc')).length;
  const popStores = totalLocations - centralHubs;

  const handleAddLocation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !code.trim()) {
      toast.error('Please provide location name and code');
      return;
    }

    const newLoc: InventoryLocation = {
      id: `loc_${Date.now()}`,
      name,
      code: code.toUpperCase(),
      managerName: managerName || 'NOC Storekeeper',
      phone: phone || '+880 1700-000000',
      address: address || 'Dhaka, Bangladesh',
    };

    setLocations((prev) => [newLoc, ...(prev.length > 0 ? prev : initialLocations)]);
    toast.success(`Store location "${newLoc.name}" registered.`);
    setModalOpen(false);
    setName('');
    setCode('');
    setManagerName('');
    setPhone('');
    setAddress('');
  };

  const columns = useMemo<LegacyColumnDef<InventoryLocation, unknown>[]>(
    () => [
      {
        accessorKey: 'name',
        header: 'Store / Warehouse',
        enableHiding: false,
        size: 260,
        cell: ({ row }) => {
          const loc = row.original;
          return (
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 border border-primary/20 text-primary shadow-xs">
                <Warehouse className="h-4 w-4" />
              </div>
              <div>
                <span className="font-semibold text-foreground text-sm">{loc.name}</span>
                <span className="text-xs text-muted-foreground block font-mono">Code: {loc.code}</span>
              </div>
            </div>
          );
        },
      },
      {
        accessorKey: 'code',
        header: 'Location Code',
        size: 130,
        cell: ({ row }) => (
          <Badge variant="outline" className="font-mono text-xs bg-background">
            {row.original.code}
          </Badge>
        ),
      },
      {
        accessorKey: 'managerName',
        header: 'Store In-Charge',
        size: 180,
        cell: ({ row }) => {
          const loc = row.original;
          return (
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground text-xs font-semibold">
                <User className="h-3.5 w-3.5" />
              </div>
              <span className="text-sm font-medium text-foreground">{loc.managerName}</span>
            </div>
          );
        },
      },
      {
        accessorKey: 'phone',
        header: 'Contact Hotline',
        size: 160,
        cell: ({ row }) => (
          <div className="flex items-center gap-1.5 font-mono text-xs text-muted-foreground">
            <Phone className="h-3 w-3 text-primary" />
            <span>{row.original.phone}</span>
          </div>
        ),
      },
      {
        accessorKey: 'address',
        header: 'Physical Address',
        size: 280,
        cell: ({ row }) => (
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground line-clamp-1">
            <MapPin className="h-3.5 w-3.5 shrink-0 text-muted-foreground/80" />
            <span className="truncate">{row.original.address}</span>
          </div>
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
                <DropdownMenuItem onClick={() => toast.info(`Viewing stock at ${loc.name}`)}>
                  <ExternalLink className="h-3.5 w-3.5 mr-2" />
                  View On-Hand Stock
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => toast.info(`Editing ${loc.name}`)}>
                  <Edit className="h-3.5 w-3.5 mr-2" />
                  Edit Location
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-rose-500 focus:text-rose-500"
                  onClick={() => toast.warning(`Location ${loc.name} decommissioned`)}
                >
                  <Trash2 className="h-3.5 w-3.5 mr-2" />
                  Decommission Store
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          );
        },
      },
    ],
    [],
  );

  if (isLoading) return <PageSkeleton variant="table" rows={6} />;
  if (isError) {
    return <EmptyState title="Failed to load locations" actionLabel="Retry" onAction={() => refetch()} />;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Store & Warehouse Locations"
        subtitle="Physical storage facilities, central NOC depot, and regional POP sub-stores."
        breadcrumb={[
          { label: 'Dashboard', href: '/admin/dashboard' },
          { label: 'Inventory', href: '/admin/inventory/items' },
          { label: 'Store Locations' },
        ]}
        actions={
          <Button size="sm" onClick={() => setModalOpen(true)} className="h-9">
            <Plus className="mr-2 h-4 w-4" />
            Add Store Location
          </Button>
        }
      />

      {/* KPI Ribbon */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4">
        <div className="rounded-xl border border-border/60 bg-card/60 p-4 backdrop-blur-sm shadow-xs">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-medium uppercase tracking-wider">Total Warehouses</span>
            <Building2 className="h-4 w-4 text-primary" />
          </div>
          <div className="mt-2 text-2xl font-bold tracking-tight text-foreground tabular-nums">
            {totalLocations}
          </div>
          <p className="mt-1 text-xs text-muted-foreground">Active inventory points</p>
        </div>

        <div className="rounded-xl border border-border/60 bg-card/60 p-4 backdrop-blur-sm shadow-xs">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-medium uppercase tracking-wider">Central NOC Depots</span>
            <Warehouse className="h-4 w-4 text-emerald-500" />
          </div>
          <div className="mt-2 text-2xl font-bold tracking-tight text-foreground tabular-nums">
            {centralHubs}
          </div>
          <p className="mt-1 text-xs text-emerald-600 dark:text-emerald-400 font-medium">Primary receiving hub</p>
        </div>

        <div className="rounded-xl border border-border/60 bg-card/60 p-4 backdrop-blur-sm shadow-xs">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-medium uppercase tracking-wider">POP Sub-Stores</span>
            <MapPin className="h-4 w-4 text-primary" />
          </div>
          <div className="mt-2 text-2xl font-bold tracking-tight text-foreground tabular-nums">
            {popStores}
          </div>
          <p className="mt-1 text-xs text-muted-foreground">Field deployment depots</p>
        </div>
      </div>

      {/* Main Data Table */}
      <DataTable
        columns={columns}
        data={list}
        searchKey="name"
        searchFilterFn={locationSearchFilter}
        searchPlaceholder="Search store by name, manager, or address..."
      />

      {/* Add Location Modal */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="sm:max-w-lg">
          <form onSubmit={handleAddLocation}>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Warehouse className="h-5 w-5 text-primary" />
                Register Store / Warehouse
              </DialogTitle>
              <DialogDescription>
                Add a new physical distribution warehouse or POP sub-store for inventory tracking.
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="loc-name">Store Name *</Label>
                  <Input
                    id="loc-name"
                    placeholder="e.g. Uttara POP Sub-store"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="loc-code">Location Code *</Label>
                  <Input
                    id="loc-code"
                    placeholder="e.g. LOC-UTT-01"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    className="font-mono uppercase"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="loc-manager">Store Manager / In-Charge</Label>
                  <Input
                    id="loc-manager"
                    placeholder="e.g. Tariqul Islam"
                    value={managerName}
                    onChange={(e) => setManagerName(e.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="loc-phone">Manager Contact Phone</Label>
                  <Input
                    id="loc-phone"
                    placeholder="e.g. +880 1711-223344"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="loc-address">Physical Street Address</Label>
                <Input
                  id="loc-address"
                  placeholder="e.g. House 14, Road 7, Sector 3, Uttara, Dhaka"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                />
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">Register Location</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
