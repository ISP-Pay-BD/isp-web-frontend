'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
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
import { KpiCard } from '../../shared/components';
import { downloadCsv, todayYmd } from '../../shared/table-utils';
import { humanize, money } from '../../shared/format';

type AccountTypeFilter = 'all' | AccountType;

const typeConfig: Record<
  AccountType,
  {
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    color: string;
    bg: string;
    border: string;
  }
> = {
  asset: {
    label: 'Asset',
    icon: Landmark,
    color: 'text-blue-400',
    bg: 'bg-blue-500/10',
    border: 'border-blue-500/20',
  },
  liability: {
    label: 'Liability',
    icon: CreditCard,
    color: 'text-amber-400',
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/20',
  },
  equity: {
    label: 'Equity',
    icon: Landmark,
    color: 'text-purple-400',
    bg: 'bg-purple-500/10',
    border: 'border-purple-500/20',
  },
  revenue: {
    label: 'Revenue',
    icon: TrendingUp,
    color: 'text-emerald-400',
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-500/20',
  },
  expense: {
    label: 'Expense',
    icon: TrendingDown,
    color: 'text-rose-400',
    bg: 'bg-rose-500/10',
    border: 'border-rose-500/20',
  },
};

const FILTER_ITEMS: Record<AccountTypeFilter, string> = {
  all: 'All Classifications',
  asset: 'Assets',
  liability: 'Liabilities',
  equity: 'Equity',
  revenue: 'Revenue',
  expense: 'Expenses',
};

const TYPE_ITEMS = Object.fromEntries(ACCOUNT_TYPES.map((t) => [t, typeConfig[t].label]));

const newAccountSchema = z.object({
  code: z.string().trim().min(1, 'GL code is required'),
  name: z.string().trim().min(1, 'Account title is required'),
  type: z.enum(ACCOUNT_TYPES, { error: 'Select a classification' }),
});
type NewAccountValues = z.infer<typeof newAccountSchema>;

function NewAccountDialog({ onClose }: { onClose: () => void }) {
  const form = useForm<NewAccountValues>({
    resolver: zodResolver(newAccountSchema),
    defaultValues: { code: '', name: '', type: 'asset' },
  });
  const { errors } = form.formState;
  const create = useCreateAccount((e) => handleApiError(e, form.setError));

  const onSubmit = form.handleSubmit((values) =>
    create.mutate(values, {
      onSuccess: () => {
        toast.success(`GL account ${values.code} — ${values.name} created`);
        onClose();
      },
    }),
  );

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Create GL Account</DialogTitle>
          <DialogDescription>Add a new account to the general ledger.</DialogDescription>
        </DialogHeader>

        <form onSubmit={onSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="coa-code" className="text-muted-foreground text-xs font-semibold">
                GL Code *
              </Label>
              <Input id="coa-code" className="h-9 font-mono text-xs" {...form.register('code')} />
              {errors.code && <p className="text-destructive text-xs">{errors.code.message}</p>}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="coa-type" className="text-muted-foreground text-xs font-semibold">
                Classification *
              </Label>
              <Controller
                control={form.control}
                name="type"
                render={({ field }) => (
                  <Select
                    items={TYPE_ITEMS}
                    value={field.value}
                    onValueChange={(v) => v && field.onChange(v)}
                  >
                    <SelectTrigger id="coa-type" className="h-9 w-full text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="text-xs">
                      {ACCOUNT_TYPES.map((t) => (
                        <SelectItem key={t} value={t}>
                          {typeConfig[t].label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.type && <p className="text-destructive text-xs">{errors.type.message}</p>}
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="coa-name" className="text-muted-foreground text-xs font-semibold">
              Account Title *
            </Label>
            <Input id="coa-name" className="h-9 text-xs" {...form.register('name')} />
            {errors.name && <p className="text-destructive text-xs">{errors.name.message}</p>}
          </div>

          <DialogFooter className="pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={create.isPending}
              className="text-xs"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={create.isPending}
              className="bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-semibold"
            >
              {create.isPending ? 'Creating…' : 'Create GL Code'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function ChartOfAccountsPage() {
  const router = useRouter();
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
    toast.success(`Exported ${filteredAccounts.length} accounts`);
  };

  if (isLoading) return <PageSkeleton variant="table" rows={8} />;

  if (isError) {
    return (
      <EmptyState
        title="Failed to load chart of accounts"
        description={error.message}
        actionLabel="Retry"
        onAction={() => refetch()}
      />
    );
  }

  return (
    <div className="w-full space-y-6 pb-12">
      {/* Top Header */}
      <PageHeader
        title="Chart of Accounts"
        subtitle="General ledger accounts with their current balances. System accounts are maintained automatically."
        breadcrumb={[
          { label: 'Dashboard', url: '/admin/dashboard' },
          { label: 'Accounting' },
          { label: 'Chart of Accounts' },
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
              Refresh
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleExportCSV}
              disabled={filteredAccounts.length === 0}
              className="border-border/80 hover:bg-accent h-9 gap-1.5 text-xs"
            >
              <FileSpreadsheet className="h-3.5 w-3.5 text-emerald-400" />
              Export COA
            </Button>
            <Can menu="accounting" action="create">
              <Button
                size="sm"
                onClick={() => setIsNewModalOpen(true)}
                className="bg-primary hover:bg-primary/90 text-primary-foreground h-9 gap-1.5 text-xs font-semibold shadow-sm"
              >
                <Plus className="h-4 w-4" />
                New GL Account
              </Button>
            </Can>
          </div>
        }
      />

      {/* KPI Stats Ribbon */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          label="Total Assets"
          value={money(stats.assets.total)}
          hint={`${stats.assets.count} asset accounts`}
          icon={Landmark}
          tone="blue"
        />
        <KpiCard
          label="Liabilities"
          value={money(stats.liabilities.total)}
          hint={`${stats.liabilities.count} liability accounts`}
          icon={CreditCard}
          tone="amber"
        />
        <KpiCard
          label="Revenue"
          value={money(stats.revenue.total)}
          hint={`${stats.revenue.count} revenue accounts`}
          icon={TrendingUp}
          tone="emerald"
        />
        <KpiCard
          label="Expenses"
          value={money(stats.expenses.total)}
          hint={`${stats.expenses.count} expense accounts`}
          icon={TrendingDown}
          tone="rose"
        />
      </div>

      {/* Filter Bar */}
      <div className="border-border/60 bg-card/60 flex flex-col gap-3 rounded-xl border p-3.5 shadow-sm backdrop-blur-sm sm:flex-row sm:items-center sm:justify-between">
        <div className="relative max-w-md flex-1">
          <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
          <Input
            placeholder="Search accounts by code or title..."
            aria-label="Search accounts"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-background/80 h-9 pl-9 text-xs"
          />
          {search && (
            <button
              type="button"
              aria-label="Clear search"
              onClick={() => setSearch('')}
              className="text-muted-foreground hover:text-foreground absolute top-1/2 right-2.5 -translate-y-1/2"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        <Select
          items={FILTER_ITEMS}
          value={typeFilter}
          onValueChange={(v) => v && setTypeFilter(v as AccountTypeFilter)}
        >
          <SelectTrigger
            className="bg-background/80 h-9 w-[200px] text-xs"
            aria-label="Account type"
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="text-xs">
            {(Object.keys(FILTER_ITEMS) as AccountTypeFilter[]).map((t) => (
              <SelectItem key={t} value={t}>
                {FILTER_ITEMS[t]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Accounts Table */}
      {filteredAccounts.length === 0 ? (
        accounts.length === 0 ? (
          <EmptyState
            title="No accounts yet"
            description="Create the first general ledger account to get started."
          />
        ) : (
          <EmptyState
            title="No accounts match filter"
            description="Try modifying search or classification filters."
            actionLabel="Clear Filters"
            onAction={() => {
              setSearch('');
              setTypeFilter('all');
            }}
          />
        )
      ) : (
        <div className="border-border/60 bg-card overflow-hidden rounded-xl border shadow-xs">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/40 text-muted-foreground border-border/60 border-b font-medium">
                  <TableHead className="w-[120px] text-xs font-semibold">GL Code</TableHead>
                  <TableHead className="text-xs font-semibold">Account Title</TableHead>
                  <TableHead className="text-xs font-semibold">Classification</TableHead>
                  <TableHead className="text-right text-xs font-semibold">
                    Current Balance (৳)
                  </TableHead>
                  <TableHead className="text-right text-xs font-semibold">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="divide-border/40 divide-y">
                {filteredAccounts.map((acc) => {
                  const cfg = typeConfig[acc.type as AccountType];
                  const Icon = cfg?.icon ?? Landmark;

                  return (
                    <TableRow
                      key={acc.id}
                      className="hover:bg-muted/30 group cursor-pointer transition-colors duration-150"
                      onClick={() => setSelectedAccount(acc)}
                    >
                      <TableCell className="py-3">
                        <span className="bg-primary/10 border-primary/20 text-primary rounded-md border px-2 py-1 font-mono text-xs font-bold">
                          {acc.code}
                        </span>
                      </TableCell>
                      <TableCell className="py-3">
                        <div className="flex items-center gap-2">
                          <span className="text-foreground group-hover:text-primary text-xs font-bold transition-colors">
                            {acc.name}
                          </span>
                          {acc.isSystem && (
                            <Badge
                              variant="outline"
                              className="text-muted-foreground border-border/60 gap-1 text-[9px]"
                            >
                              <Lock className="h-2.5 w-2.5" />
                              System
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="py-3">
                        <Badge
                          variant="outline"
                          className={cn(
                            'gap-1.5 text-[10px] font-semibold',
                            cfg ? [cfg.color, cfg.bg, cfg.border] : 'text-muted-foreground',
                          )}
                        >
                          <Icon className="h-3 w-3" />
                          {cfg?.label ?? humanize(acc.type)}
                        </Badge>
                      </TableCell>
                      <TableCell className="py-3 text-right">
                        <span
                          className={cn(
                            'font-mono text-sm font-bold tabular-nums',
                            acc.balance >= 0 ? 'text-emerald-400' : 'text-rose-400',
                          )}
                        >
                          {money(acc.balance)}
                        </span>
                      </TableCell>
                      <TableCell className="py-3 text-right" onClick={(e) => e.stopPropagation()}>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-muted-foreground hover:text-foreground h-7 w-7"
                          aria-label={`View account ${acc.code}`}
                          onClick={() => setSelectedAccount(acc)}
                        >
                          <Eye className="h-3.5 w-3.5" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </div>
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
                    className="bg-primary/10 text-primary border-primary/20 font-mono text-[10px]"
                  >
                    GL #{selectedAccount.code}
                  </Badge>
                  <Badge
                    variant="outline"
                    className="bg-muted/40 text-muted-foreground border-border/60 text-[10px] capitalize"
                  >
                    {selectedAccount.type}
                  </Badge>
                  {selectedAccount.isSystem && (
                    <Badge
                      variant="outline"
                      className="text-muted-foreground border-border/60 gap-1 text-[10px]"
                    >
                      <Lock className="h-2.5 w-2.5" />
                      System
                    </Badge>
                  )}
                </div>
                <SheetTitle className="text-foreground text-xl font-bold">
                  {selectedAccount.name}
                </SheetTitle>
                <SheetDescription className="text-muted-foreground text-xs">
                  General ledger account and its current balance.
                </SheetDescription>
              </SheetHeader>

              <div className="space-y-4">
                <Card className="border-border/70 bg-muted/20 space-y-3 border p-4">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">GL Code</span>
                    <span className="text-primary font-mono font-bold">{selectedAccount.code}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Current Balance</span>
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
                    <span className="text-muted-foreground">Classification</span>
                    <span className="text-foreground font-medium capitalize">
                      {selectedAccount.type}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Maintained by</span>
                    <span className="text-foreground font-medium">
                      {selectedAccount.isSystem ? 'System' : 'User'}
                    </span>
                  </div>
                  {selectedAccount.status && (
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">Status</span>
                      <span className="text-foreground font-medium capitalize">
                        {selectedAccount.status}
                      </span>
                    </div>
                  )}
                </Card>

                <div className="flex gap-2 pt-4">
                  <Button
                    className="bg-primary hover:bg-primary/90 text-primary-foreground flex-1 text-xs font-semibold"
                    onClick={() =>
                      router.push(
                        `/admin/accounting/journal-entries?account_id=${encodeURIComponent(selectedAccount.id)}`,
                      )
                    }
                  >
                    View Ledger Transactions
                  </Button>
                  <Button
                    variant="outline"
                    className="border-border hover:bg-accent text-xs"
                    onClick={() => setSelectedAccount(null)}
                  >
                    Close
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
