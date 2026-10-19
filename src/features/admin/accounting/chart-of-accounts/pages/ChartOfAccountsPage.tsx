'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import type { LegacyColumnDef } from '@tanstack/react-table/legacy';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  CreditCard,
  TrendingUp,
  TrendingDown,
  Landmark,
  Search,
  Plus,
  RefreshCw,
  X,
  FileSpreadsheet,
  Eye,
  Lock,
} from 'lucide-react';
import { toast } from 'sonner';
import {
  ACCOUNT_TYPES,
  useChartOfAccounts,
  useCreateAccount,
  type AccountType,
  type ChartOfAccountItem,
} from '../hooks/use-chart-of-accounts';
import { PageSkeleton, EmptyState, Can } from '@/components/shared';
import { DataTable } from '@/features/shared/data-table';
import { PageHeader } from '@/features/admin/shared/components/PageHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { handleApiError } from '@/lib/api/utils/error-handler';
import { cn } from '@/lib/utils';
import type { Tone } from '@/components/shared/status-tones';
import { KpiCard } from '../../shared/components';
import { downloadCsv, todayYmd } from '../../shared/table-utils';
import { humanize, money } from '../../shared/format';
import { formatCount } from '@/lib/format';
import { useLocale, useTranslations } from '@/i18n/locale-context';

type AccountTypeFilter = 'all' | AccountType;

type Translate = ReturnType<typeof useTranslations>;

const typeConfig: Record<
  AccountType,
  {
    icon: React.ComponentType<{ className?: string }>;
    tone: Tone;
  }
> = {
  asset: { icon: Landmark, tone: 'info' },
  liability: { icon: CreditCard, tone: 'warning' },
  equity: { icon: Landmark, tone: 'neutral' },
  revenue: { icon: TrendingUp, tone: 'success' },
  expense: { icon: TrendingDown, tone: 'danger' },
};

function typeLabel(t: Translate, type: string): string {
  switch (type) {
    case 'asset':
      return t('admin.accounting.coa.type.asset', 'Asset');
    case 'liability':
      return t('admin.accounting.coa.type.liability', 'Liability');
    case 'equity':
      return t('admin.accounting.coa.type.equity', 'Equity');
    case 'revenue':
      return t('admin.accounting.coa.type.revenue', 'Revenue');
    case 'expense':
      return t('admin.accounting.coa.type.expense', 'Expense');
    default:
      return humanize(type);
  }
}

function filterItems(t: Translate): Record<AccountTypeFilter, string> {
  return {
    all: t('admin.accounting.coa.filter.all', 'All Classifications'),
    asset: t('admin.accounting.coa.filter.asset', 'Assets'),
    liability: t('admin.accounting.coa.filter.liability', 'Liabilities'),
    equity: t('admin.accounting.coa.filter.equity', 'Equity'),
    revenue: t('admin.accounting.coa.filter.revenue', 'Revenue'),
    expense: t('admin.accounting.coa.filter.expense', 'Expenses'),
  };
}

const newAccountSchema = z.object({
  code: z.string().trim().min(1, 'GL code is required'),
  name: z.string().trim().min(1, 'Account title is required'),
  type: z.enum(ACCOUNT_TYPES, { error: 'Select a classification' }),
});
type NewAccountValues = z.infer<typeof newAccountSchema>;

function NewAccountDialog({ onClose }: { onClose: () => void }) {
  const { t, te } = useLocale();
  const typeItems = Object.fromEntries(ACCOUNT_TYPES.map((type) => [type, typeLabel(t, type)]));
  const form = useForm<NewAccountValues>({
    resolver: zodResolver(newAccountSchema),
    defaultValues: { code: '', name: '', type: 'asset' },
  });
  const { errors } = form.formState;
  const create = useCreateAccount((e) => handleApiError(e, form.setError));

  const onSubmit = form.handleSubmit((values) =>
    create.mutate(values, {
      onSuccess: () => {
        toast.success(
          t('admin.accounting.coa.toast.created', 'GL account {code} — {name} created', {
            code: values.code,
            name: values.name,
          }),
        );
        onClose();
      },
    }),
  );

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{t('admin.accounting.coa.dialog.title', 'Create GL Account')}</DialogTitle>
          <DialogDescription>{t('admin.accounting.coa.dialog.desc', 'Add a new account to the general ledger.')}</DialogDescription>
        </DialogHeader>

        <form onSubmit={onSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="coa-code" className="text-muted-foreground text-xs font-semibold">
                {t('admin.accounting.coa.dialog.code', 'GL Code *')}
              </Label>
              <Input id="coa-code" className="h-9 font-mono text-xs" {...form.register('code')} />
              {errors.code && <p className="text-destructive text-xs">{te(errors.code.message ?? '')}</p>}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="coa-type" className="text-muted-foreground text-xs font-semibold">
                {t('admin.accounting.coa.dialog.type', 'Classification *')}
              </Label>
              <Controller
                control={form.control}
                name="type"
                render={({ field }) => (
                  <Select
                    items={typeItems}
                    value={field.value}
                    onValueChange={(v) => v && field.onChange(v)}
                  >
                    <SelectTrigger id="coa-type" className="h-9 w-full text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="text-xs">
                      {ACCOUNT_TYPES.map((type) => (
                        <SelectItem key={type} value={type}>
                          {typeItems[type]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.type && <p className="text-destructive text-xs">{te(errors.type.message ?? '')}</p>}
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="coa-name" className="text-muted-foreground text-xs font-semibold">
              {t('admin.accounting.coa.dialog.name', 'Account Title *')}
            </Label>
            <Input id="coa-name" className="h-9 text-xs" {...form.register('name')} />
            {errors.name && <p className="text-destructive text-xs">{te(errors.name.message ?? '')}</p>}
          </div>

          <DialogFooter className="pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={create.isPending}
              className="text-xs"
            >
              {t('common.cancel', 'Cancel')}
            </Button>
            <Button
              type="submit"
              disabled={create.isPending}
              className="bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-semibold"
            >
              {create.isPending ? t('admin.accounting.coa.dialog.creating', 'Creating…') : t('admin.accounting.coa.dialog.create', 'Create GL Code')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function ChartOfAccountsPage() {
  const t = useTranslations();
  const typeFilterItems = filterItems(t);
  const { accounts, isLoading, isError, error, refetch, isFetching } = useChartOfAccounts();

  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<AccountTypeFilter>('all');
  const [selectedAccount, setSelectedAccount] = useState<ChartOfAccountItem | null>(null);
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);

  const filteredAccounts = useMemo(() => {
    const q = search.toLowerCase().trim();
    return accounts.filter((acc) => {
      const matchesSearch =
        !q || acc.name.toLowerCase().includes(q) || acc.code.toLowerCase().includes(q);
      const matchesType = typeFilter === 'all' || acc.type === typeFilter;
      return matchesSearch && matchesType;
    });
  }, [accounts, search, typeFilter]);

  const stats = useMemo(() => {
    const byType = (type: AccountType) => accounts.filter((a) => a.type === type);
    const sum = (list: ChartOfAccountItem[]) => list.reduce((s, a) => s + a.balance, 0);
    const [assets, liabilities, revenue, expenses] = (
      ['asset', 'liability', 'revenue', 'expense'] as const
    ).map(byType);
    return {
      assets: { total: sum(assets), count: assets.length },
      liabilities: { total: sum(liabilities), count: liabilities.length },
      revenue: { total: sum(revenue), count: revenue.length },
      expenses: { total: sum(expenses), count: expenses.length },
    };
  }, [accounts]);

  const columns = useMemo<LegacyColumnDef<ChartOfAccountItem, unknown>[]>(
    () => [
      {
        accessorKey: 'code',
        header: t('admin.accounting.coa.colCode', 'GL Code'),
        size: 120,
        cell: ({ row }) => (
          <span className="bg-primary/10 border-primary/20 text-primary rounded-md border px-2 py-1 font-mono text-xs font-bold">
            {row.original.code}
          </span>
        ),
      },
      {
        accessorKey: 'name',
        header: t('admin.accounting.coa.colName', 'Account Title'),
        enableHiding: false,
        meta: { mobile: 'title' },
        cell: ({ row }) => (
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              className="text-foreground hover:text-primary text-left font-bold transition-colors"
              onClick={() => setSelectedAccount(row.original)}
            >
              {row.original.name}
            </button>
            {row.original.isSystem && (
              <Badge variant="outline" className="text-muted-foreground border-border/60 gap-1 text-xs">
                <Lock className="h-2.5 w-2.5" />
                {t('admin.accounting.coa.system', 'System')}
              </Badge>
            )}
          </div>
        ),
      },
      {
        accessorKey: 'type',
        header: t('admin.accounting.coa.colType', 'Classification'),
        cell: ({ row }) => {
          const type = row.original.type;
          const cfg = typeConfig[type as AccountType];
          const Icon = cfg?.icon ?? Landmark;
          return (
            <Badge variant="outline" tone={cfg?.tone ?? 'neutral'} className="gap-1.5 text-xs font-semibold">
              <Icon className="h-3 w-3" />
              {typeLabel(t, type)}
            </Badge>
          );
        },
      },
      {
        accessorKey: 'balance',
        header: t('admin.accounting.coa.colBalance', 'Current Balance (৳)'),
        cell: ({ row }) => (
          <span
            className={cn(
              'font-mono text-sm font-bold tabular-nums',
              row.original.balance >= 0 ? 'text-emerald-400' : 'text-rose-400',
            )}
          >
            {money(row.original.balance)}
          </span>
        ),
      },
      {
        id: 'actions',
        header: '',
        enableHiding: false,
        cell: ({ row }) => (
          <Button
            variant="ghost"
            size="icon"
            className="text-muted-foreground hover:text-foreground h-7 w-7"
            aria-label={t('admin.accounting.coa.viewAccount', 'View account {code}', { code: row.original.code })}
            onClick={() => setSelectedAccount(row.original)}
          >
            <Eye className="h-3.5 w-3.5" />
          </Button>
        ),
      },
    ],
    [t],
  );

  const handleExportCSV = () => {
    downloadCsv(
      `chart_of_accounts_${todayYmd()}.csv`,
      ['Code', 'Account', 'Type', 'System account', 'Status', 'Balance (BDT)'],
      filteredAccounts.map((a) => [
        a.code,
        a.name,
        a.type,
        a.isSystem ? 'yes' : 'no',
        a.status,
        a.balance,
      ]),
    );
    toast.success(t('admin.accounting.coa.toast.exported', 'Exported {n} accounts', { n: formatCount(filteredAccounts.length) }));
  };

  if (isLoading) return <PageSkeleton variant="table" rows={8} />;

  if (isError) {
    return (
      <EmptyState variant="error"
        title={t('admin.accounting.coa.loadFailed', 'Failed to load chart of accounts')}
        description={error.message}
        actionLabel={t('common.retry', 'Retry')}
        onAction={() => refetch()}
      />
    );
  }

  return (
    <div className="w-full space-y-6 pb-12">
      {/* Top Header */}
      <PageHeader
        title={t('nav.acc-coa', 'Chart of Accounts')}
        subtitle={t('admin.accounting.coa.subtitle', 'General ledger accounts with their current balances. System accounts are maintained automatically.')}
        breadcrumb={[
          { label: t('common.crumb.dashboard', 'Dashboard'), url: '/admin/dashboard' },
          { label: t('nav.accounting', 'Accounting') },
          { label: t('nav.acc-coa', 'Chart of Accounts') },
        ]}
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => refetch()}
              className="border-border/80 hover:bg-accent h-9 gap-1.5 text-xs"
            >
              <RefreshCw className={cn('h-3.5 w-3.5', isFetching && 'animate-spin')} />
              {t('admin.accounting.coa.refresh', 'Refresh')}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleExportCSV}
              disabled={filteredAccounts.length === 0}
              className="border-border/80 hover:bg-accent h-9 gap-1.5 text-xs"
            >
              <FileSpreadsheet className="h-3.5 w-3.5 text-emerald-400" />
              {t('admin.accounting.coa.export', 'Export COA')}
            </Button>
            <Can menu="accounting" action="create">
              <Button
                size="sm"
                onClick={() => setIsNewModalOpen(true)}
                className="bg-primary hover:bg-primary/90 text-primary-foreground h-9 gap-1.5 text-xs font-semibold shadow-sm"
              >
                <Plus className="h-4 w-4" />
                {t('admin.accounting.coa.newAccount', 'New GL Account')}
              </Button>
            </Can>
          </div>
        }
      />

      {/* KPI Stats Ribbon */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          label={t('admin.accounting.coa.kpiAssets', 'Total Assets')}
          value={money(stats.assets.total)}
          hint={t('admin.accounting.coa.assetAccounts', '{n} asset accounts', { n: formatCount(stats.assets.count) })}
          icon={Landmark}
          tone="blue"
        />
        <KpiCard
          label={t('admin.accounting.coa.kpiLiabilities', 'Liabilities')}
          value={money(stats.liabilities.total)}
          hint={t('admin.accounting.coa.liabilityAccounts', '{n} liability accounts', { n: formatCount(stats.liabilities.count) })}
          icon={CreditCard}
          tone="amber"
        />
        <KpiCard
          label={t('admin.accounting.coa.kpiRevenue', 'Revenue')}
          value={money(stats.revenue.total)}
          hint={t('admin.accounting.coa.revenueAccounts', '{n} revenue accounts', { n: formatCount(stats.revenue.count) })}
          icon={TrendingUp}
          tone="emerald"
        />
        <KpiCard
          label={t('admin.accounting.coa.kpiExpenses', 'Expenses')}
          value={money(stats.expenses.total)}
          hint={t('admin.accounting.coa.expenseAccounts', '{n} expense accounts', { n: formatCount(stats.expenses.count) })}
          icon={TrendingDown}
          tone="rose"
        />
      </div>

      {/* Filter Bar */}
      <div className="border-border/60 bg-card/60 flex flex-col gap-3 rounded-xl border p-3.5 shadow-sm backdrop-blur-sm sm:flex-row sm:items-center sm:justify-between">
        <div className="relative max-w-md flex-1">
          <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
          <Input
            placeholder={t('admin.accounting.coa.searchPlaceholder', 'Search accounts by code or title...')}
            aria-label={t('admin.accounting.coa.searchLabel', 'Search accounts')}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-background/80 h-9 pl-9 text-xs"
          />
          {search && (
            <button
              type="button"
              aria-label={t('admin.accounting.shared.clearSearch', 'Clear search')}
              onClick={() => setSearch('')}
              className="text-muted-foreground hover:text-foreground absolute top-1/2 right-2.5 -translate-y-1/2"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        <Select
          items={typeFilterItems}
          value={typeFilter}
          onValueChange={(v) => v && setTypeFilter(v as AccountTypeFilter)}
        >
          <SelectTrigger
            className="bg-background/80 h-9 min-w-[200px] text-xs"
            aria-label={t('admin.accounting.coa.accountType', 'Account type')}
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="text-xs">
            {(Object.keys(typeFilterItems) as AccountTypeFilter[]).map((type) => (
              <SelectItem key={type} value={type}>
                {typeFilterItems[type]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Accounts Table */}
      {filteredAccounts.length === 0 ? (
        accounts.length === 0 ? (
          <EmptyState
            title={t('admin.accounting.coa.emptyNone', 'No accounts yet')}
            description={t('admin.accounting.coa.emptyNoneHint', 'Create the first general ledger account to get started.')}
          />
        ) : (
          <EmptyState
            title={t('admin.accounting.coa.emptyFiltered', 'No accounts match filter')}
            description={t('admin.accounting.coa.emptyFilteredHint', 'Try modifying search or classification filters.')}
            actionLabel={t('admin.accounting.coa.clearFilters', 'Clear Filters')}
            onAction={() => {
              setSearch('');
              setTypeFilter('all');
            }}
          />
        )
      ) : (
        <DataTable
          urlState
          columns={columns}
          data={filteredAccounts}
          getRowId={(row) => row.id}
        />
      )}

      {/* Inspector Sheet */}
      <Sheet open={!!selectedAccount} onOpenChange={(open) => !open && setSelectedAccount(null)}>
        <SheetContent className="bg-card border-border text-foreground w-full overflow-y-auto sm:max-w-md">
          {selectedAccount && (
            <div className="space-y-6">
              <SheetHeader>
                <div className="flex items-center gap-2">
                  <Badge
                    variant="outline"
                    className="bg-primary/10 text-primary border-primary/20 font-mono text-xs"
                  >
                    GL #{selectedAccount.code}
                  </Badge>
                  <Badge
                    variant="outline"
                    className="bg-muted/40 text-muted-foreground border-border/60 text-xs capitalize"
                  >
                    {typeLabel(t, selectedAccount.type)}
                  </Badge>
                  {selectedAccount.isSystem && (
                    <Badge
                      variant="outline"
                      className="text-muted-foreground border-border/60 gap-1 text-xs"
                    >
                      <Lock className="h-2.5 w-2.5" />
                      {t('admin.accounting.coa.system', 'System')}
                    </Badge>
                  )}
                </div>
                <SheetTitle className="text-foreground text-xl font-bold">
                  {selectedAccount.name}
                </SheetTitle>
                <SheetDescription className="text-muted-foreground text-xs">
                  {t('admin.accounting.coa.sheetDesc', 'General ledger account and its current balance.')}
                </SheetDescription>
              </SheetHeader>

              <div className="space-y-4">
                <Card className="border-border/70 bg-muted/20 space-y-3 border p-4">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">{t('admin.accounting.coa.colCode', 'GL Code')}</span>
                    <span className="text-primary font-mono font-bold">{selectedAccount.code}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">{t('admin.accounting.coa.currentBalance', 'Current Balance')}</span>
                    <span
                      className={cn(
                        'font-mono text-base font-bold',
                        selectedAccount.balance >= 0 ? 'text-emerald-400' : 'text-rose-400',
                      )}
                    >
                      {money(selectedAccount.balance)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">{t('admin.accounting.coa.colType', 'Classification')}</span>
                    <span className="text-foreground font-medium capitalize">
                      {typeLabel(t, selectedAccount.type)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">{t('admin.accounting.coa.maintainedBy', 'Maintained by')}</span>
                    <span className="text-foreground font-medium">
                      {selectedAccount.isSystem ? t('admin.accounting.coa.system', 'System') : t('admin.accounting.coa.user', 'User')}
                    </span>
                  </div>
                  {selectedAccount.status && (
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">{t('common.status', 'Status')}</span>
                      <span className="text-foreground font-medium capitalize">
                        {t(`status.${selectedAccount.status.toLowerCase()}`, selectedAccount.status)}
                      </span>
                    </div>
                  )}
                </Card>

                <div className="flex gap-2 pt-4">
                  <Button
                    className="bg-primary hover:bg-primary/90 text-primary-foreground flex-1 text-xs font-semibold"
                    render={
                      <Link
                        href={`/admin/accounting/journal-entries?account_id=${encodeURIComponent(selectedAccount.id)}`}
                      />
                    }
                  >
                    {t('admin.accounting.coa.viewLedger', 'View Ledger Transactions')}
                  </Button>
                  <Button
                    variant="outline"
                    className="border-border hover:bg-accent text-xs"
                    onClick={() => setSelectedAccount(null)}
                  >
                    {t('common.close', 'Close')}
                  </Button>
                </div>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>

      {isNewModalOpen && <NewAccountDialog onClose={() => setIsNewModalOpen(false)} />}
    </div>
  );
}
