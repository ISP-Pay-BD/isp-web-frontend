'use client';

import { useState, useMemo } from 'react';
import { Plus, Search, Edit, Trash2, Package as PackageIcon, Eye, EyeOff } from 'lucide-react';
import { useForm, type Resolver } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  usePackages,
  useCreatePackage,
  useUpdatePackage,
  useDeletePackage,
} from '../hooks/use-packages';
import { packageSchema, type PackageFormValues } from '../schemas/package.schema';
import { PageSkeleton } from '@/components/shared/LoadingSkeleton';
import { EmptyState } from '@/components/shared/EmptyState';
import { CurrencyDisplay } from '@/components/shared/CurrencyDisplay';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { Can } from '@/components/shared/Can';
import { DataTable } from '@/features/shared/data-table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { LegacyColumnDef } from '@tanstack/react-table/legacy';
import type { Package } from '@/data/shared/types';

export function PackagesPage() {
  const { data, isLoading, isError, refetch } = usePackages();
  const createMutation = useCreatePackage();
  const updateMutation = useUpdatePackage();
  const deleteMutation = useDeletePackage();

  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editPkg, setEditPkg] = useState<Package | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<PackageFormValues>({
    resolver: zodResolver(packageSchema) as Resolver<PackageFormValues>,
    defaultValues: { name: '', speedMbps: 10, priceBdt: 800, validityDays: 30, type: 'home', visible: true },
  });

  const items = data?.items ?? [];
  const filtered = useMemo(() => {
    return items.filter((p) => {
      const matchSearch = search === '' || p.name.toLowerCase().includes(search.toLowerCase());
      const matchType = typeFilter === 'all' || p.type === typeFilter;
      return matchSearch && matchType;
    });
  }, [items, search, typeFilter]);

  const openCreate = () => {
    setEditPkg(null);
    reset({ name: '', speedMbps: 10, priceBdt: 800, validityDays: 30, type: 'home', visible: true });
    setDialogOpen(true);
  };

  const openEdit = (pkg: Package) => {
    setEditPkg(pkg);
    reset({
      name: pkg.name,
      speedMbps: pkg.speedMbps,
      priceBdt: pkg.priceBdt,
      validityDays: pkg.validityDays,
      type: pkg.type,
      visible: pkg.visible,
    });
    setDialogOpen(true);
  };

  const onSubmit = async (values: PackageFormValues) => {
    if (editPkg) {
      await updateMutation.mutateAsync({ id: editPkg.id, payload: values });
    } else {
      await createMutation.mutateAsync(values);
    }
    setDialogOpen(false);
  };

  const columns: LegacyColumnDef<Package, unknown>[] = [
    {
      accessorKey: 'name',
      header: 'Package',
      cell: ({ row }) => {
        const p = row.original;
        return (
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
              <PackageIcon className="h-4 w-4 text-primary" />
            </div>
            <div>
              <div className="font-medium">{p.name}</div>
              <div className="text-xs text-muted-foreground font-mono">{p.id}</div>
            </div>
          </div>
        );
      },
    },
    { accessorKey: 'speedMbps', header: 'Speed', cell: ({ row }) => <span className="font-mono">{row.original.speedMbps} Mbps</span> },
    {
      accessorKey: 'priceBdt',
      header: 'Price',
      cell: ({ row }) => <CurrencyDisplay amount={row.original.priceBdt} className="font-semibold" />,
    },
    {
      accessorKey: 'validityDays',
      header: 'Validity',
      cell: ({ row }) => <span className="text-sm">{row.original.validityDays} days</span>,
    },
    {
      accessorKey: 'type',
      header: 'Type',
      cell: ({ row }) => (
        <Badge variant="outline" className="capitalize">{row.original.type}</Badge>
      ),
    },
    {
      accessorKey: 'visible',
      header: 'Visible',
      cell: ({ row }) =>
        row.original.visible ? (
          <Eye className="h-4 w-4 text-emerald-500" />
        ) : (
          <EyeOff className="h-4 w-4 text-muted-foreground" />
        ),
    },
    {
      id: 'actions',
      header: '',
      cell: ({ row }) => (
        <div className="flex gap-1">
          <Can menu="packages" action="update">
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(row.original)}>
              <Edit className="h-4 w-4" />
            </Button>
          </Can>
          <Can menu="packages" action="delete">
            <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => setDeleteId(row.original.id)}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </Can>
        </div>
      ),
    },
  ];

  if (isLoading) return <PageSkeleton rows={8} />;
  if (isError) {
    return (
      <EmptyState title="Failed to load packages" description="Could not fetch package catalog." actionLabel="Retry" onAction={() => refetch()} />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Internet Packages</h1>
          <p className="text-muted-foreground text-sm">Manage broadband plans, pricing, and visibility for subscribers.</p>
        </div>
        <Can menu="packages" action="create">
          <Button size="sm" onClick={openCreate}>
            <Plus className="mr-1.5 h-4 w-4" /> Add Package
          </Button>
        </Can>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search packages..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-8 h-9" />
        </div>
        <Select value={typeFilter} onValueChange={(v) => v && setTypeFilter(v)}>
          <SelectTrigger className="w-[140px] h-9"><SelectValue placeholder="Type" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="home">Home</SelectItem>
            <SelectItem value="corporate">Corporate</SelectItem>
            <SelectItem value="hotspot">Hotspot</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <DataTable columns={columns} data={filtered} emptyTitle="No packages" emptyDescription="Create your first internet package plan." />

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editPkg ? 'Edit Package' : 'Add Package'}</DialogTitle>
            <DialogDescription>Configure speed, price, and billing cycle for this plan.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="name">Package Name</Label>
              <Input id="name" {...register('name')} placeholder="Home 20 Mbps" />
              {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Speed (Mbps)</Label>
                <Input type="number" {...register('speedMbps')} />
              </div>
              <div className="space-y-1.5">
                <Label>Price (৳)</Label>
                <Input type="number" {...register('priceBdt')} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Validity (days)</Label>
                <Input type="number" {...register('validityDays')} />
              </div>
              <div className="space-y-1.5">
                <Label>Type</Label>
                <Select value={watch('type')} onValueChange={(v) => v && setValue('type', v as PackageFormValues['type'])}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="home">Home</SelectItem>
                    <SelectItem value="corporate">Corporate</SelectItem>
                    <SelectItem value="hotspot">Hotspot</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {editPkg ? 'Save Changes' : 'Create Package'}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={Boolean(deleteId)}
        onOpenChange={(open) => !open && setDeleteId(null)}
        title="Delete Package"
        description="Subscribers on this plan will need to be migrated. This action cannot be undone."
        confirmLabel="Delete"
        destructive
        onConfirm={() => {
          if (deleteId) {
            deleteMutation.mutate(deleteId);
            setDeleteId(null);
          }
        }}
      />
    </div>
  );
}
