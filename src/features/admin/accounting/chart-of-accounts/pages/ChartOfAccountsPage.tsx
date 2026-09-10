'use client';

import { useState, useMemo } from 'react';
import {
  BookOpen,
  ChevronRight,
  CreditCard,
  TrendingUp,
  TrendingDown,
  Landmark,
  Search,
  Plus,
  RefreshCw,
  X,
  FileSpreadsheet,
  Layers,
  FolderTree,
  Building,
  ShieldCheck,
  Eye,
  CheckCircle2,
} from 'lucide-react';
import { useChartOfAccounts, type ChartOfAccountItem } from '../hooks/use-chart-of-accounts';
import { PageSkeleton, EmptyState, CurrencyDisplay } from '@/components/shared';
import { PageHeader } from '@/features/admin/shared/components/PageHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
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
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

type AccountTypeFilter = 'all' | 'asset' | 'liability' | 'equity' | 'income' | 'expense';

const typeConfig: Record<string, { label: string; icon: React.ComponentType<{ className?: string }>; color: string; bg: string; border: string }> = {
  asset: { label: 'Asset', icon: Landmark, color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/20' },
  liability: { label: 'Liability', icon: CreditCard, color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20' },
  equity: { label: 'Equity', icon: Landmark, color: 'text-purple-400', bg: 'bg-purple-500/10', border: 'border-purple-500/20' },
  income: { label: 'Revenue / Income', icon: TrendingUp, color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' },
  expense: { label: 'Expense / Outflow', icon: TrendingDown, color: 'text-rose-400', bg: 'bg-rose-500/10', border: 'border-rose-500/20' },
};

export function ChartOfAccountsPage() {
  const { accounts, isLoading, isError, refetch } = useChartOfAccounts();

  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<AccountTypeFilter>('all');
  const [selectedAccount, setSelectedAccount] = useState<ChartOfAccountItem | null>(null);
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);

  // New Account State
  const [newCode, setNewCode] = useState('');
  const [newName, setNewName] = useState('');
  const [newType, setNewType] = useState<'asset' | 'liability' | 'equity' | 'income' | 'expense'>('asset');
  const [newParentId, setNewParentId] = useState('none');

  const filteredAccounts = useMemo(() => {
    return accounts.filter((acc) => {
      const q = search.toLowerCase().trim();
      const matchesSearch =
        !q ||
        acc.name.toLowerCase().includes(q) ||
        acc.code.toLowerCase().includes(q) ||
        acc.id.toLowerCase().includes(q);

      const matchesType = typeFilter === 'all' || acc.type === typeFilter;
      return matchesSearch && matchesType;
    });
  }, [accounts, search, typeFilter]);

  const stats = useMemo(() => {
    const rootAccounts = accounts.filter((a) => !a.parentId);
    const totalAssets = accounts.filter((a) => a.type === 'asset' && !a.parentId).reduce((s, a) => s + a.balanceBdt, 0);
    const totalLiabilities = accounts.filter((a) => a.type === 'liability' && !a.parentId).reduce((s, a) => s + a.balanceBdt, 0);
    const totalRevenue = accounts.filter((a) => a.type === 'income' && !a.parentId).reduce((s, a) => s + a.balanceBdt, 0);
    const totalExpenses = accounts.filter((a) => a.type === 'expense' && !a.parentId).reduce((s, a) => s + a.balanceBdt, 0);

    return {
      glCount: accounts.length,
      rootCount: rootAccounts.length,
      totalAssets,
      totalLiabilities,
      totalRevenue,
      totalExpenses,
    };
  }, [accounts]);

  const handleCreateAccount = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCode.trim() || !newName.trim()) {
      toast.error('Code and Account Name are required');
      return;
    }
    toast.success(`General Ledger account "${newCode} - ${newName}" created successfully!`);
    setIsNewModalOpen(false);
    setNewCode('');
    setNewName('');
  };

  const handleExportCSV = () => {
    toast.success(`Exporting chart of accounts hierarchy (${filteredAccounts.length} accounts)...`);
  };

  if (isLoading) return <PageSkeleton variant="table" rows={8} />;

  if (isError) {
    return (
      <EmptyState
        title="Failed to load chart of accounts"
        description="Could not load the general ledger hierarchy."
        actionLabel="Retry"
        onAction={() => refetch()}
      />
    );
  }

  return (
    <div className="space-y-6 w-full pb-12">
      {/* Top Header */}
      <PageHeader
        title="Chart of Accounts (GL Hierarchy)"
        subtitle="Standardized ISP general ledger hierarchy covering subscriber revenue, IIG transit costs, and capital assets."
        breadcrumb={[{ label: 'Dashboard', url: '/admin/dashboard' }, { label: 'Accounting' }, { label: 'Chart of Accounts' }]}
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => refetch()}
              className="border-border/80 hover:bg-accent text-xs h-9 gap-1.5"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              Refresh
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleExportCSV}
              className="border-border/80 hover:bg-accent text-xs h-9 gap-1.5"
            >
              <FileSpreadsheet className="h-3.5 w-3.5 text-emerald-400" />
              Export COA
            </Button>
            <Button
              size="sm"
              onClick={() => setIsNewModalOpen(true)}
              className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold shadow-sm text-xs h-9 gap-1.5"
            >
              <Plus className="h-4 w-4" />
              New GL Account
            </Button>
          </div>
        }
      />

      {/* KPI Stats Ribbon */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="border border-border/70 bg-card/60 backdrop-blur-md shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 rounded-full blur-xl pointer-events-none" />
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Total Assets (1000)</span>
              <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20">
                <Landmark className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-2 text-2xl font-black font-mono text-blue-400">৳{stats.totalAssets.toLocaleString()}</div>
            <div className="mt-2 text-[11px] text-muted-foreground">Fixed & liquid balance</div>
          </CardContent>
        </Card>

        <Card className="border border-border/70 bg-card/60 backdrop-blur-md shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-full blur-xl pointer-events-none" />
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Liabilities (2000)</span>
              <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
                <CreditCard className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-2 text-2xl font-black font-mono text-amber-400">৳{stats.totalLiabilities.toLocaleString()}</div>
            <div className="mt-2 text-[11px] text-muted-foreground">Outstanding trade debts</div>
          </CardContent>
        </Card>

        <Card className="border border-border/70 bg-card/60 backdrop-blur-md shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-xl pointer-events-none" />
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Revenue (4000)</span>
              <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <TrendingUp className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-2 text-2xl font-black font-mono text-emerald-400">৳{stats.totalRevenue.toLocaleString()}</div>
            <div className="mt-2 text-[11px] text-muted-foreground">Operating revenue stream</div>
          </CardContent>
        </Card>

        <Card className="border border-border/70 bg-card/60 backdrop-blur-md shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-rose-500/5 rounded-full blur-xl pointer-events-none" />
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Expenses (5000)</span>
              <div className="p-2 rounded-lg bg-rose-500/10 text-rose-400 border border-rose-500/20">
                <TrendingDown className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-2 text-2xl font-black font-mono text-rose-400">৳{stats.totalExpenses.toLocaleString()}</div>
            <div className="mt-2 text-[11px] text-muted-foreground">General expenditures</div>
          </CardContent>
        </Card>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between p-3.5 rounded-xl border border-border/60 bg-card/60 backdrop-blur-sm shadow-sm">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search accounts by code, title, category..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-9 text-xs bg-background/80"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        <Select value={typeFilter} onValueChange={(v) => v && setTypeFilter(v as AccountTypeFilter)}>
          <SelectTrigger className="w-[200px] h-9 text-xs bg-background/80">
            <SelectValue placeholder="All Account Types" />
          </SelectTrigger>
          <SelectContent className="text-xs">
            <SelectItem value="all">All Classifications</SelectItem>
            <SelectItem value="asset">Assets (1000s)</SelectItem>
            <SelectItem value="liability">Liabilities (2000s)</SelectItem>
            <SelectItem value="equity">Equity (3000s)</SelectItem>
            <SelectItem value="income">Revenues (4000s)</SelectItem>
            <SelectItem value="expense">Expenses (5000s)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Accounts Table */}
      {filteredAccounts.length === 0 ? (
        <EmptyState
          title="No accounts match filter"
          description="Try modifying search or classification filters."
          actionLabel="Clear Filters"
          onAction={() => {
            setSearch('');
            setTypeFilter('all');
          }}
        />
      ) : (
        <div className="rounded-xl border border-border/60 bg-card overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/40 text-muted-foreground font-medium border-b border-border/60">
                  <TableHead className="w-[120px] text-xs font-semibold">GL Code</TableHead>
                  <TableHead className="text-xs font-semibold">Account Title</TableHead>
                  <TableHead className="text-xs font-semibold">Classification</TableHead>
                  <TableHead className="text-right text-xs font-semibold">Current Balance (৳)</TableHead>
                  <TableHead className="text-right text-xs font-semibold">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="divide-y divide-border/40">
                {filteredAccounts.map((acc) => {
                  const isChild = Boolean(acc.parentId);
                  const cfg = typeConfig[acc.type] ?? typeConfig.asset;
                  const Icon = cfg.icon;

                  return (
                    <TableRow
                      key={acc.id}
                      className="hover:bg-muted/30 cursor-pointer transition-colors duration-150 group"
                      onClick={() => setSelectedAccount(acc)}
                    >
                      <TableCell className="py-3">
                        <span
                          className={cn(
                            'font-mono text-xs font-bold px-2 py-1 rounded-md border',
                            isChild
                              ? 'bg-muted/40 border-border/60 text-muted-foreground'
                              : 'bg-primary/10 border-primary/20 text-primary'
                          )}
                        >
                          {acc.code}
                        </span>
                      </TableCell>
                      <TableCell className="py-3">
                        <div className="flex items-center gap-2">
                          {isChild && <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/50 ml-3" />}
                          <span
                            className={cn(
                              'text-xs',
                              isChild
                                ? 'text-muted-foreground font-normal'
                                : 'font-bold text-foreground group-hover:text-primary transition-colors'
                            )}
                          >
                            {acc.name}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="py-3">
                        <Badge variant="outline" className={cn('text-[10px] font-semibold gap-1.5', cfg.color, cfg.bg, cfg.border)}>
                          <Icon className="h-3 w-3" />
                          {cfg.label}
                        </Badge>
                      </TableCell>
                      <TableCell className="py-3 text-right">
                        <span
                          className={cn(
                            'font-mono text-sm font-bold',
                            acc.balanceBdt >= 0 ? 'text-emerald-400' : 'text-rose-400'
                          )}
                        >
                          ৳{acc.balanceBdt.toLocaleString()}
                        </span>
                      </TableCell>
                      <TableCell className="py-3 text-right" onClick={(e) => e.stopPropagation()}>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-muted-foreground hover:text-foreground"
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
        <SheetContent className="bg-card border-border text-foreground w-full sm:max-w-md overflow-y-auto">
          {selectedAccount && (
            <div className="space-y-6">
              <SheetHeader>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="font-mono text-[10px] bg-primary/10 text-primary border-primary/20">
                    GL #{selectedAccount.code}
                  </Badge>
                  <Badge variant="outline" className="text-[10px] bg-muted/40 text-muted-foreground border-border/60 capitalize">
                    {selectedAccount.type}
                  </Badge>
                </div>
                <SheetTitle className="text-xl font-bold text-foreground">{selectedAccount.name}</SheetTitle>
                <SheetDescription className="text-xs text-muted-foreground">
                  General ledger account parameters and current trial balance.
                </SheetDescription>
              </SheetHeader>

              <div className="space-y-4">
                <Card className="border border-border/70 bg-muted/20 p-4 space-y-3">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-muted-foreground">GL Code</span>
                    <span className="font-mono font-bold text-primary">{selectedAccount.code}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-muted-foreground">Current Balance</span>
                    <span className="font-mono font-bold text-emerald-400 text-base">
                      ৳{selectedAccount.balanceBdt.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-muted-foreground">Classification</span>
                    <span className="font-medium text-foreground capitalize">{selectedAccount.type}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-muted-foreground">Parent Category</span>
                    <span className="font-mono text-muted-foreground">{selectedAccount.parentId || 'Top-Level Root'}</span>
                  </div>
                </Card>

                <div className="pt-4 flex gap-2">
                  <Button
                    className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-xs"
                    onClick={() => {
                      toast.success(`Opening transaction history for GL #${selectedAccount.code}`);
                      setSelectedAccount(null);
                    }}
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

      {/* New GL Account Modal */}
      {isNewModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <Card className="border border-border bg-card text-foreground w-full max-w-md shadow-2xl animate-in fade-in-0 zoom-in-95">
            <div className="p-6 space-y-5">
              <div className="flex items-center justify-between border-b border-border/60 pb-4">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-primary/10 text-primary border border-primary/20">
                    <Plus className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-foreground">Create GL Account</h3>
                    <p className="text-xs text-muted-foreground">Add a new code to the general ledger hierarchy.</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsNewModalOpen(false)}
                  className="text-muted-foreground hover:text-foreground rounded-lg p-1"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleCreateAccount} className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-muted-foreground">GL Code *</label>
                    <Input
                      placeholder="e.g. 5210"
                      value={newCode}
                      onChange={(e) => setNewCode(e.target.value)}
                      className="h-9 text-xs font-mono"
                      required
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-muted-foreground">Classification *</label>
                    <Select value={newType} onValueChange={(v) => v && setNewType(v as any)}>
                      <SelectTrigger className="h-9 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="text-xs">
                        <SelectItem value="asset">Asset (1000)</SelectItem>
                        <SelectItem value="liability">Liability (2000)</SelectItem>
                        <SelectItem value="equity">Equity (3000)</SelectItem>
                        <SelectItem value="income">Revenue (4000)</SelectItem>
                        <SelectItem value="expense">Expense (5000)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground">Account Title *</label>
                  <Input
                    placeholder="e.g. NTTN Metro Redundancy Lease"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    className="h-9 text-xs"
                    required
                  />
                </div>

                <div className="flex justify-end gap-2 pt-4 border-t border-border/60">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsNewModalOpen(false)}
                    className="border-border hover:bg-accent text-xs"
                  >
                    Cancel
                  </Button>
                  <Button type="submit" className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-xs">
                    Create GL Code
                  </Button>
                </div>
              </form>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
