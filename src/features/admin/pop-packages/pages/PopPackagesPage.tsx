'use client';

import { useCallback, useMemo, useState } from 'react';
import type { LegacyColumnDef } from '@tanstack/react-table/legacy';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Search, Boxes, Zap, X, Edit, RefreshCw, Store } from 'lucide-react';
import {
  usePopPackageMutations,
  usePopPackages,
  usePops,
  type PopPackage,
} from '../hooks/use-pop-packages';
import { useDebouncedValue } from '@/hooks/use-debounced-value';
import { PageSkeleton } from '@/components/shared/LoadingSkeleton';
import { EmptyState } from '@/components/shared/EmptyState';
import { CurrencyDisplay } from '@/components/shared/CurrencyDisplay';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { DataTable } from '@/features/shared/data-table';
import { PageHeader } from '@/features/admin/shared/components/PageHeader';
import { handleApiError, errorMessage } from '@/lib/api/utils/error-handler';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Can } from '@/components/shared/Can';
import { useLocale } from '@/i18n/locale-context';

const money = z.union([z.literal(''), z.string().trim().regex(/^\d+(\.\d{1,2})?$/, 'Enter a valid amount')]);
const priceSchema = z
  .object({ price: money, selling_price: money })
  .refine((v) => v.price !== '' || v.selling_price !== '', { message: 'Enter a price or selling price', path: ['price'] });
type PriceForm = z.infer<typeof priceSchema>;

export function PopPackagesPage() {
  const { t, te } = useLocale();
  const popsQuery = usePops();
  const [pickedPop, setPickedPop] = useState<string | null>(null);
  const popId = pickedPop ?? popsQuery.data?.[0]?.id ?? null;
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebouncedValue(search.trim());
  const { data, isLoading, isError, error, isFetching, refetch } = usePopPackages(popId, debouncedSearch);
  const m = usePopPackageMutations(popId);
  const [editPkg, setEditPkg] = useState<PopPackage | null>(null);
  const [confirmSync, setConfirmSync] = useState(false);

  const form = useForm<PriceForm>({ resolver: zodResolver(priceSchema), defaultValues: { price: '', selling_price: '' } });

  const items = useMemo(() => data ?? [], [data]);
  const stats = useMemo(() => {
    const avg = items.length ? Math.round(items.reduce((a, p) => a + p.price, 0) / items.length) : 0;
    const margin = items.filter((p) => p.sellingPrice !== null).reduce((a, p) => a + ((p.sellingPrice ?? 0) - p.price), 0);
    return { avg, margin };
  }, [items]);

  const openEdit = useCallback(
    (pkg: PopPackage) => {
      setEditPkg(pkg);
      form.reset({ price: String(pkg.price), selling_price: pkg.sellingPrice !== null ? String(pkg.sellingPrice) : '' });
    },
    [form],
  );

  const columns = useMemo<LegacyColumnDef<PopPackage, unknown>[]>(
    () => [
      {
        id: 'index',
        header: '#',
        size: 50,
        enableSorting: false,
        enableHiding: false,
        meta: { mobile: 'hide' },
        cell: ({ row }) => <span className="font-mono text-xs text-muted-foreground">{row.index + 1}</span>,
      },
      {
        accessorKey: 'name',
        header: t('admin.popPackages.packages.colPackage', 'Package'),
        enableHiding: false,
        meta: { mobile: 'title' },
        cell: ({ row }) => {
          const pkg = row.original;
          return (
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl border shrink-0 bg-primary/10 text-primary border-primary/20">
                <Boxes className="h-4 w-4" />
              </div>
              <div className="min-w-0">
                <div className="font-bold text-sm text-foreground">{pkg.name}</div>
                <div className="text-xs font-normal text-muted-foreground font-mono">
                  #{pkg.id}
                  {pkg.mikrotikProfile ? ` · ${pkg.mikrotikProfile}` : ''}
                </div>
              </div>
            </div>
          );
        },
      },
      {
        accessorKey: 'bandwidth',
        header: t('admin.popPackages.packages.colBandwidth', 'Bandwidth'),
        cell: ({ row }) => (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-secondary/80 border border-border/50 text-xs font-bold font-mono text-foreground">
            <Zap className="h-3 w-3 text-amber-500" />
            {row.original.bandwidth || '—'}
          </span>
        ),
      },
      {
        accessorKey: 'price',
        header: t('admin.popPackages.packages.colPopPrice', 'POP Price'),
        cell: ({ row }) => (
          <span className="text-sm font-bold font-mono text-foreground">
            <CurrencyDisplay amount={row.original.price} />
          </span>
        ),
      },
      {
        accessorKey: 'sellingPrice',
        header: t('admin.popPackages.packages.colSellingPrice', 'Selling Price'),
        cell: ({ row }) =>
          row.original.sellingPrice !== null ? (
            <span className="text-sm font-bold font-mono text-emerald-600 dark:text-emerald-400">
              <CurrencyDisplay amount={row.original.sellingPrice} />
            </span>
          ) : (
            <span className="text-muted-foreground text-xs">—</span>
          ),
      },
      {
        accessorKey: 'packageType',
        header: t('admin.popPackages.packages.colCycle', 'Cycle'),
        cell: ({ row }) => <span className="text-xs text-muted-foreground capitalize">{row.original.packageType || '—'}</span>,
      },
      {
        id: 'actions',
        header: t('common.actions', 'Actions'),
        enableHiding: false,
        cell: ({ row }) => (
          <div className="flex justify-end">
            <Can menu="Resellers" action="update">
              <Button
                size="sm"
                variant="ghost"
                onClick={() => openEdit(row.original)}
                title={t('admin.popPackages.packages.editPrices', 'Edit prices')}
                aria-label={t('admin.popPackages.packages.editPricesFor', 'Edit prices for {name}', { name: row.original.name })}
                className="h-7 w-7 p-0 text-primary hover:bg-primary/10"
              >
                <Edit className="h-3.5 w-3.5" />
              </Button>
            </Can>
          </div>
        ),
      },
    ],
    [openEdit, t],
  );

  const onSubmit = async (values: PriceForm) => {
    if (!editPkg) return;
    try {
      await m.updatePrice.mutateAsync({ packageId: editPkg.id, price: values.price, sellingPrice: values.selling_price });
      setEditPkg(null);
    } catch (err) {
      handleApiError(err, form.setError);
    }
  };

  if (popsQuery.isLoading) return <PageSkeleton variant="cards" rows={6} />;
  if (popsQuery.isError) {
    return (
      <EmptyState variant="error"
        title={t('admin.popPackages.packages.popsLoadFailed', 'Failed to load POP resellers')}
        description={errorMessage(popsQuery.error)}
        actionLabel={t('admin.customers.list.retry', 'Retry')}
        onAction={() => popsQuery.refetch()}
      />
    );
  }

  const pops = popsQuery.data ?? [];
  const popName = pops.find((p) => p.id === popId)?.name ?? '';

  return (
    <div className="space-y-6 w-full pb-12">
      <PageHeader
        title={t('admin.popPackages.packages.title', 'POP Package Prices')}
        subtitle={t('admin.popPackages.packages.subtitle', 'Per-POP price list: what each POP reseller pays (price) and charges its customers (selling price)')}
        breadcrumb={[
          { label: t('common.crumb.admin', 'Admin'), url: '/admin/dashboard' },
          { label: t('common.crumb.pop_suite', 'POP Suite') },
          { label: t('admin.popPackages.packages.crumb', 'POP Packages') },
        ]}
        actions={
          popId ? (
            <Can menu="Resellers" action="update">
              <Button
                size="sm"
                variant="outline"
                disabled={m.sync.isPending}
                onClick={() => setConfirmSync(true)}
                className="text-xs border-border/80 hover:bg-accent gap-1.5"
              >
                <RefreshCw className={`h-3.5 w-3.5 ${m.sync.isPending ? 'animate-spin' : ''}`} /> {t('admin.popPackages.packages.sync', 'Sync from Catalogue')}
              </Button>
            </Can>
          ) : null
        }
      />

      {pops.length === 0 ? (
        <EmptyState
          icon={<Store className="h-5 w-5" />}
          title={t('admin.popPackages.packages.emptyPops', 'No POP resellers yet')}
          description={t('admin.popPackages.packages.emptyPopsDesc', 'POP price lists appear here once you add a POP reseller.')}
        />
      ) : (
        <>
          {/* Stats Ribbon */}
          <div className="flex flex-wrap gap-x-6 gap-y-2 border-y border-border/60 py-3 text-sm">
            <p>
              <span className="font-semibold tabular-nums text-foreground">{items.length}</span>{' '}
              <span className="text-muted-foreground">
                {t('admin.popPackages.packages.statPackages', 'packages for {name}', {
                  name: popName || t('admin.popPackages.packages.thisPop', 'this POP'),
                })}
              </span>
            </p>
            <p>
              <span className="font-semibold tabular-nums text-foreground">
                <CurrencyDisplay amount={stats.avg} className="inline font-semibold" />
              </span>{' '}
              <span className="text-muted-foreground">{t('admin.popPackages.packages.statAvg', 'avg. POP price')}</span>
            </p>
            <p>
              <span className="font-semibold tabular-nums text-emerald-600 dark:text-emerald-400">
                <CurrencyDisplay amount={stats.margin} className="inline font-semibold" />
              </span>{' '}
              <span className="text-muted-foreground">{t('admin.popPackages.packages.statMargin', 'total POP margin per cycle')}</span>
            </p>
          </div>

          {/* Toolbar & Filter */}
          <Card className="border-border/60 bg-card shadow-sm ring-1 ring-border/60 overflow-hidden">
            <CardContent className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder={t('admin.popPackages.packages.search', 'Search package name...')}
                  aria-label={t('admin.popPackages.packages.search', 'Search package name...')}
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10 h-9 bg-background border-border/60 text-sm shadow-sm"
                />
                {search && (
                  <button
                    type="button"
                    aria-label={t('admin.customers.list.clearSearch', 'Clear search')}
                    onClick={() => setSearch('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>

              <div className="flex items-center gap-2">
                <Select
                  value={popId}
                  onValueChange={(v) => setPickedPop(v ? String(v) : null)}
                  items={Object.fromEntries(pops.map((p) => [p.id, p.name]))}
                >
                  <SelectTrigger className="h-9 text-xs w-[220px] bg-background border-border/60">
                    <Store className="h-3.5 w-3.5 mr-1 text-muted-foreground" />
                    <SelectValue placeholder={t('admin.popPackages.packages.selectPop', 'Select POP')} />
                  </SelectTrigger>
                  <SelectContent>
                    {pops.map((p) => (
                      <SelectItem key={p.id} value={p.id}>
                        {p.name}
                        {p.status === 'inactive' ? ` (${t('status.inactive', 'inactive')})` : ''}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Badge variant="secondary" className="font-mono text-xs px-2.5 py-1 bg-muted/50">
                  {items.length === 1
                    ? t('admin.popPackages.packages.resultOne', '{n} result', { n: items.length })
                    : t('admin.popPackages.packages.resultMany', '{n} results', { n: items.length })}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Table Content */}
          {isLoading ? (
            <Card className="border-border/60 bg-card shadow-sm ring-1 ring-border/60 overflow-hidden">
              <div className="p-6">
                <PageSkeleton variant="table" rows={4} />
              </div>
            </Card>
          ) : isError ? (
            <Card className="border-border/60 bg-card shadow-sm ring-1 ring-border/60 overflow-hidden">
              <div className="p-6">
                <EmptyState
                  variant="error"
                  title={t('admin.popPackages.packages.loadFailed', "Could not load this POP's packages")}
                  description={errorMessage(error)}
                  actionLabel={t('admin.customers.list.retry', 'Retry')}
                  onAction={() => refetch()}
                />
              </div>
            </Card>
          ) : items.length === 0 ? (
            <Card className="border-border/60 bg-card shadow-sm ring-1 ring-border/60 overflow-hidden">
              <div className="py-16">
                <EmptyState
                  title={debouncedSearch ? t('admin.popPackages.packages.emptySearch', 'No packages match your search') : t('admin.popPackages.packages.emptyNone', 'This POP has no packages yet')}
                  description={
                    debouncedSearch
                      ? t('admin.popPackages.packages.emptySearchHint', 'Try another name.')
                      : t('admin.popPackages.packages.emptyNoneHint', 'Use “Sync from Catalogue” to copy your package catalogue into this POP’s price list.')
                  }
                />
              </div>
            </Card>
          ) : (
            <div className={isFetching ? 'opacity-80 transition-opacity' : 'transition-opacity'}>
              <DataTable urlState columns={columns} data={items} getRowId={(row) => row.id} />
            </div>
          )}
        </>
      )}

      {/* Edit Price Dialog */}
      <Dialog open={editPkg !== null} onOpenChange={(open) => !open && setEditPkg(null)}>
        <DialogContent className="sm:max-w-md p-6 border-border/80 shadow-[var(--shadow-md)]">
          <DialogHeader>
            <DialogTitle className="text-base font-bold flex items-center gap-2.5">
              <div className="p-2 rounded-lg bg-primary/10 text-primary">
                <Edit className="h-4 w-4" />
              </div>
              {editPkg?.name}
            </DialogTitle>
            <DialogDescription className="text-xs">
              {t('admin.popPackages.packages.dialogDesc', 'Prices for {name} only.', { name: popName || t('admin.popPackages.packages.thisPop', 'this POP') })}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-2" noValidate>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="price" className="text-xs font-semibold">{t('admin.popPackages.packages.fieldPopPrice', 'POP Price (৳)')}</Label>
                <Input id="price" {...form.register('price')} inputMode="decimal" className="text-xs h-10 font-mono shadow-sm" />
                {form.formState.errors.price && <p className="text-xs text-destructive">{te(form.formState.errors.price.message ?? '')}</p>}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="selling_price" className="text-xs font-semibold">{t('admin.popPackages.packages.fieldSellingPrice', 'Selling Price (৳)')}</Label>
                <Input id="selling_price" {...form.register('selling_price')} inputMode="decimal" className="text-xs h-10 font-mono shadow-sm" />
                {form.formState.errors.selling_price && (
                  <p className="text-xs text-destructive">{te(form.formState.errors.selling_price.message ?? '')}</p>
                )}
              </div>
            </div>
            <div className="pt-2">
              <Button type="submit" className="w-full text-xs font-semibold shadow-sm" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? t('admin.popPackages.packages.saving', 'Saving…') : t('admin.popPackages.packages.savePrices', 'Save Prices')}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={confirmSync}
        onOpenChange={setConfirmSync}
        title={t('admin.popPackages.packages.syncTitle', 'Sync from catalogue?')}
        description={t('admin.popPackages.packages.syncDesc', "Copies your package catalogue into this POP's price list. Prices already set for a package are kept; packages removed from the catalogue are dropped.")}
        confirmLabel={t('admin.popPackages.packages.syncConfirm', 'Sync Packages')}
        onConfirm={async () => {
          await m.sync.mutateAsync();
          setConfirmSync(false);
        }}
      />
    </div>
  );
}
