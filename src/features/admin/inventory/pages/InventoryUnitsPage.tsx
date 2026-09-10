'use client';

import { useMemo, useState } from 'react';
import type { LegacyColumnDef, LegacyRow } from '@tanstack/react-table/legacy';
import { PageHeader } from '@/features/admin/shared/components/PageHeader';
import { useInventory, type InventoryUnit } from '../hooks/use-inventory';
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
  Ruler,
  Boxes,
  Scale,
  MoreHorizontal,
  Edit,
  Trash2,
} from 'lucide-react';
import { toast } from 'sonner';

const unitSearchFilter = (
  row: LegacyRow<InventoryUnit>,
  _columnId: string,
  filterValue: unknown,
) => {
  const q = String(filterValue ?? '').toLowerCase().trim();
  if (!q) return true;
  const u = row.original;
  return (
    u.name.toLowerCase().includes(q) ||
    u.shortCode.toLowerCase().includes(q) ||
    (u.description ?? '').toLowerCase().includes(q)
  );
};

export function InventoryUnitsPage() {
  const { units: initialUnits, isLoading, isError, refetch } = useInventory();
  const [units, setUnits] = useState<InventoryUnit[]>([]);
  const [modalOpen, setModalOpen] = useState(false);

  // Form State
  const [name, setName] = useState('');
  const [shortCode, setShortCode] = useState('');
  const [description, setDescription] = useState('');

  const list = units.length > 0 ? units : initialUnits;

  const totalUnits = list.length;
  const discreteUnits = list.filter((u) => ['pcs', 'box', 'set', 'pkt'].includes(u.shortCode.toLowerCase())).length;
  const continuousUnits = list.filter((u) => ['mtr', 'm', 'drum', 'km', 'roll'].includes(u.shortCode.toLowerCase())).length;

  const handleAddUnit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !shortCode.trim()) {
      toast.error('Please enter unit name and short code');
      return;
    }

    const newUnit: InventoryUnit = {
      id: `unit_${Date.now()}`,
      name,
      shortCode: shortCode.toLowerCase(),
      description,
    };

    setUnits((prev) => [newUnit, ...(prev.length > 0 ? prev : initialUnits)]);
    toast.success(`Unit "${newUnit.name} (${newUnit.shortCode})" created.`);
    setModalOpen(false);
    setName('');
    setShortCode('');
    setDescription('');
  };

  const columns = useMemo<LegacyColumnDef<InventoryUnit, unknown>[]>(
    () => [
      {
        accessorKey: 'name',
        header: 'Unit Name',
        enableHiding: false,
        size: 240,
        cell: ({ row }) => {
          const u = row.original;
          return (
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 border border-primary/20 text-primary shadow-xs">
                <Scale className="h-4 w-4" />
              </div>
              <span className="font-semibold text-foreground text-sm">{u.name}</span>
            </div>
          );
        },
      },
      {
        accessorKey: 'shortCode',
        header: 'Short Code / Symbol',
        size: 160,
        cell: ({ row }) => (
          <Badge variant="outline" className="font-mono text-xs font-semibold px-2 py-0.5 bg-background">
            {row.original.shortCode}
          </Badge>
        ),
      },
      {
        accessorKey: 'description',
        header: 'Measurement Description',
        size: 320,
        cell: ({ row }) => (
          <span className="text-sm text-muted-foreground">{row.original.description || 'Standard measurement unit'}</span>
        ),
      },
      {
        id: 'actions',
        header: '',
        size: 60,
        cell: ({ row }) => {
          const u = row.original;
          return (
            <DropdownMenu>
              <DropdownMenuTrigger className="inline-flex items-center justify-center h-8 w-8 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent/60 transition-colors">
                <MoreHorizontal className="h-4 w-4" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-44">
                <DropdownMenuLabel>Unit Options</DropdownMenuLabel>
                <DropdownMenuItem onClick={() => toast.info(`Editing unit ${u.name}`)}>
                  <Edit className="h-3.5 w-3.5 mr-2" />
                  Edit Unit
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-rose-500 focus:text-rose-500"
                  onClick={() => toast.warning(`Unit ${u.name} removed`)}
                >
                  <Trash2 className="h-3.5 w-3.5 mr-2" />
                  Delete Unit
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
    return <EmptyState title="Failed to load units" actionLabel="Retry" onAction={() => refetch()} />;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Measurement Units"
        subtitle="Standard inventory metrics for counting pieces, cables, drums, boxes, and bulk packs."
        breadcrumb={[
          { label: 'Dashboard', href: '/admin/dashboard' },
          { label: 'Inventory', href: '/admin/inventory/items' },
          { label: 'Measurement Units' },
        ]}
        actions={
          <Button size="sm" onClick={() => setModalOpen(true)} className="h-9">
            <Plus className="mr-2 h-4 w-4" />
            Add Unit
          </Button>
        }
      />

      {/* KPI Ribbon */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4">
        <div className="rounded-xl border border-border/60 bg-card/60 p-4 backdrop-blur-sm shadow-xs">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-medium uppercase tracking-wider">Total Units</span>
            <Scale className="h-4 w-4 text-primary" />
          </div>
          <div className="mt-2 text-2xl font-bold tracking-tight text-foreground tabular-nums">
            {totalUnits}
          </div>
          <p className="mt-1 text-xs text-muted-foreground">Active metrics</p>
        </div>

        <div className="rounded-xl border border-border/60 bg-card/60 p-4 backdrop-blur-sm shadow-xs">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-medium uppercase tracking-wider">Discrete / Packaged</span>
            <Boxes className="h-4 w-4 text-emerald-500" />
          </div>
          <div className="mt-2 text-2xl font-bold tracking-tight text-foreground tabular-nums">
            {discreteUnits}
          </div>
          <p className="mt-1 text-xs text-emerald-600 dark:text-emerald-400 font-medium">Pieces, boxes, sets</p>
        </div>

        <div className="rounded-xl border border-border/60 bg-card/60 p-4 backdrop-blur-sm shadow-xs">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-medium uppercase tracking-wider">Continuous / Cable</span>
            <Ruler className="h-4 w-4 text-primary" />
          </div>
          <div className="mt-2 text-2xl font-bold tracking-tight text-foreground tabular-nums">
            {continuousUnits}
          </div>
          <p className="mt-1 text-xs text-muted-foreground">Meters, drums, rolls</p>
        </div>
      </div>

      {/* Main Data Table */}
      <DataTable
        columns={columns}
        data={list}
        searchKey="name"
        searchFilterFn={unitSearchFilter}
        searchPlaceholder="Search unit by name or code..."
      />

      {/* Add Unit Modal */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="sm:max-w-md">
          <form onSubmit={handleAddUnit}>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Scale className="h-5 w-5 text-primary" />
                Add Measurement Unit
              </DialogTitle>
              <DialogDescription>
                Define a new counting or length measurement unit for stock catalog items.
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-4 py-4">
              <div className="space-y-1.5">
                <Label htmlFor="unit-name">Unit Name *</Label>
                <Input
                  id="unit-name"
                  placeholder="e.g. Drum (1000m) or Box"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="unit-code">Short Code / Symbol *</Label>
                <Input
                  id="unit-code"
                  placeholder="e.g. drm or bx"
                  value={shortCode}
                  onChange={(e) => setShortCode(e.target.value)}
                  className="font-mono lowercase"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="unit-desc">Description (Optional)</Label>
                <Input
                  id="unit-desc"
                  placeholder="e.g. 1000 meters optical drop cable packaging"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">Save Unit</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
