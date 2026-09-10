'use client';

import { useState, useMemo } from 'react';
import {
  TrendingDown,
  Plus,
  Search,
  Trash2,
  Calendar,
  Building,
  CreditCard,
  Layers,
  ArrowDownRight,
  Filter,
  CheckCircle2,
  RefreshCw,
  X,
  FileSpreadsheet,
  Wallet,
  Eye,
  MoreVertical,
  DollarSign,
} from 'lucide-react';
import { useExpenses } from '../hooks/use-expenses';
import type { ExpenseItem } from '../types';
import type { ExpenseFormValues } from '../schemas';
import { PageSkeleton, EmptyState, CurrencyDisplay, ConfirmDialog, Can } from '@/components/shared';
import { PageHeader } from '@/features/admin/shared/components/PageHeader';
import { ExpenseModal } from '../components/ExpenseModal';
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

export function ExpensesPage() {
  const { expenses, isLoading, isError, refetch, createExpense, deleteExpense } = useExpenses();

  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<ExpenseItem | null>(null);
  const [selectedExpense, setSelectedExpense] = useState<ExpenseItem | null>(null);

  const categories = useMemo(() => Array.from(new Set(expenses.map((e) => e.category))), [expenses]);

  const filteredExpenses = useMemo(() => {
    return expenses.filter((item) => {
      const q = search.toLowerCase().trim();
      const matchesSearch =
        !q ||
        item.category.toLowerCase().includes(q) ||
        item.vendor.toLowerCase().includes(q) ||
        (item.note && item.note.toLowerCase().includes(q)) ||
        item.id.toLowerCase().includes(q) ||
        item.amountBdt.toString().includes(q);

      const matchesCategory = categoryFilter === 'all' || item.category === categoryFilter;
      return matchesSearch && matchesCategory;
    });
  }, [expenses, search, categoryFilter]);

  const stats = useMemo(() => {
    const totalAmount = expenses.reduce((sum, e) => sum + (e.amountBdt || 0), 0);
    const count = expenses.length;
    const avgExpense = count > 0 ? Math.round(totalAmount / count) : 0;
    const bandwidthExp = expenses
      .filter((e) => e.category.toLowerCase().includes('bandwidth') || e.category.toLowerCase().includes('transit'))
      .reduce((sum, e) => sum + e.amountBdt, 0);

    return { totalAmount, count, avgExpense, bandwidthExp };
  }, [expenses]);

  const handleSaveExpense = async (values: ExpenseFormValues) => {
    await createExpense(values);
    toast.success('Expense recorded in general ledger');
  };

  const handleConfirmDelete = async () => {
    if (!itemToDelete) return;
    try {
      await deleteExpense(itemToDelete.id);
      toast.success('Expense entry removed');
      setDeleteConfirmOpen(false);
      setItemToDelete(null);
    } catch {
      toast.error('Failed to delete expense entry');
    }
  };

  const handleExportCSV = () => {
    toast.success(`Exporting ${filteredExpenses.length} expense ledger entries to CSV...`);
  };

  if (isLoading) return <PageSkeleton variant="table" rows={8} />;

  if (isError) {
    return (
      <div className="p-6">
        <EmptyState
          title="Failed to load expense entries"
          description="Could not communicate with the accounting ledger."
          actionLabel="Retry"
          onAction={() => refetch()}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6 w-full pb-12">
      {/* Top Header */}
      <PageHeader
        title="Operational Expenses & Payables"
        subtitle="Manage upstream IIG bandwidth costs, NTTN transmission, staff salaries, hardware procurement, and utility bills."
        breadcrumb={[{ label: 'Dashboard', url: '/admin/dashboard' }, { label: 'Accounting' }, { label: 'Expenses' }]}
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => refetch()}
              className="border-white/10 hover:bg-white/5 text-xs h-9 gap-1.5"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              Refresh
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleExportCSV}
              className="border-white/10 hover:bg-white/5 text-xs h-9 gap-1.5"
            >
              <FileSpreadsheet className="h-3.5 w-3.5 text-rose-400" />
              Export CSV
            </Button>
            <Can menu="accounting" action="create">
              <Button
                onClick={() => setModalOpen(true)}
                className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold shadow-lg shadow-primary/20 text-xs h-9 gap-1.5"
              >
                <Plus className="h-4 w-4" />
                New Expense Entry
              </Button>
            </Can>
          </div>
        }
      />

      {/* KPI Stats Ribbon */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="border border-border/70 bg-card/60 backdrop-blur-md shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-rose-500/5 rounded-full blur-xl pointer-events-none" />
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Total Expenses</span>
              <div className="p-2 rounded-lg bg-rose-500/10 text-rose-400 border border-rose-500/20">
                <TrendingDown className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-2 text-2xl font-black font-mono text-rose-400">৳{stats.totalAmount.toLocaleString()}</div>
            <div className="mt-2 text-[11px] text-muted-foreground">Operating disbursements & OPEX</div>
          </CardContent>
        </Card>

        <Card className="border border-border/70 bg-card/60 backdrop-blur-md shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/5 rounded-full blur-xl pointer-events-none" />
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Payment Vouchers</span>
              <div className="p-2 rounded-lg bg-purple-500/10 text-purple-400 border border-purple-500/20">
                <CreditCard className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-2 text-2xl font-black font-mono text-foreground">{stats.count}</div>
            <div className="mt-2 text-[11px] text-muted-foreground">Disbursement debit vouchers</div>
          </CardContent>
        </Card>

        <Card className="border border-border/70 bg-card/60 backdrop-blur-md shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 rounded-full blur-xl pointer-events-none" />
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Upstream Bandwidth</span>
              <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20">
                <Building className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-2 text-2xl font-black font-mono text-blue-400">৳{stats.bandwidthExp.toLocaleString()}</div>
            <div className="mt-2 text-[11px] text-muted-foreground">IIG/NTTN recurring transit</div>
          </CardContent>
        </Card>

        <Card className="border border-border/70 bg-card/60 backdrop-blur-md shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-full blur-xl pointer-events-none" />
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Average Outflow</span>
              <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
                <Wallet className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-2 text-2xl font-black font-mono text-amber-400">৳{stats.avgExpense.toLocaleString()}</div>
            <div className="mt-2 text-[11px] text-muted-foreground">Mean transaction payout</div>
          </CardContent>
        </Card>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between p-3.5 rounded-xl border border-border/60 bg-card/60 backdrop-blur-sm shadow-sm">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by voucher ID, vendor, category, note..."
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

        <Select value={categoryFilter} onValueChange={(v) => v && setCategoryFilter(v)}>
          <SelectTrigger className="w-[200px] h-9 text-xs bg-background/80">
            <SelectValue placeholder="All Categories" />
          </SelectTrigger>
          <SelectContent className="text-xs">
            <SelectItem value="all">All Expense Categories</SelectItem>
            {categories.map((c) => (
              <SelectItem key={c} value={c}>
                {c}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Expenses Table */}
      {filteredExpenses.length === 0 ? (
        <EmptyState
          icon={<TrendingDown className="h-10 w-10 text-muted-foreground" />}
          title="No expense records found"
          description="No expense transactions match your active filters."
          actionLabel="Record Expense"
          onAction={() => setModalOpen(true)}
        />
      ) : (
        <div className="rounded-xl border border-border/60 bg-card overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/40 text-muted-foreground font-medium border-b border-border/60">
                  <TableHead className="w-12 text-xs font-semibold">#</TableHead>
                  <TableHead className="text-xs font-semibold">Voucher ID</TableHead>
                  <TableHead className="text-xs font-semibold">Date</TableHead>
                  <TableHead className="text-xs font-semibold">Category</TableHead>
                  <TableHead className="text-xs font-semibold">Vendor / Beneficiary</TableHead>
                  <TableHead className="text-xs font-semibold">Note / Description</TableHead>
                  <TableHead className="text-right text-xs font-semibold">Amount (BDT)</TableHead>
                  <TableHead className="text-right text-xs font-semibold">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="divide-y divide-border/40">
                {filteredExpenses.map((item, idx) => (
                  <TableRow
                    key={item.id}
                    className="hover:bg-muted/30 cursor-pointer transition-colors duration-150 group"
                    onClick={() => setSelectedExpense(item)}
                  >
                    <TableCell className="text-muted-foreground font-mono text-xs">{idx + 1}</TableCell>
                    <TableCell className="font-mono text-xs font-bold text-rose-400">
                      {item.id}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5 text-xs font-mono text-muted-foreground">
                        <Calendar className="h-3.5 w-3.5" />
                        {item.date}
                      </div>
                    </TableCell>
                    <TableCell className="font-semibold text-xs text-foreground">
                      {item.category}
                    </TableCell>
                    <TableCell className="text-xs font-medium text-foreground">
                      {item.vendor}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground max-w-[220px] truncate">
                      {item.note || '—'}
                    </TableCell>
                    <TableCell className="text-right font-mono font-bold text-sm text-rose-400">
                      ৳{item.amountBdt.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-muted-foreground hover:text-foreground"
                          onClick={() => setSelectedExpense(item)}
                        >
                          <Eye className="h-3.5 w-3.5" />
                        </Button>
                        <Can menu="accounting" action="delete">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-destructive hover:bg-destructive/10"
                            onClick={() => {
                              setItemToDelete(item);
                              setDeleteConfirmOpen(true);
                            }}
                            title="Delete entry"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </Can>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      )}

      {/* Inspector Sheet */}
      <Sheet open={!!selectedExpense} onOpenChange={(open) => !open && setSelectedExpense(null)}>
        <SheetContent className="bg-card border-border text-foreground w-full sm:max-w-md overflow-y-auto">
          {selectedExpense && (
            <div className="space-y-6">
              <SheetHeader>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="font-mono text-[10px] bg-rose-500/10 text-rose-400 border-rose-500/20">
                    {selectedExpense.id}
                  </Badge>
                  <Badge variant="outline" className="text-[10px] text-muted-foreground">
                    Debit Voucher
                  </Badge>
                </div>
                <SheetTitle className="text-xl font-bold text-foreground">{selectedExpense.category}</SheetTitle>
                <SheetDescription className="text-xs text-muted-foreground">
                  Payable voucher details, vendor entity, and payment breakdown.
                </SheetDescription>
              </SheetHeader>

              <div className="space-y-4">
                <Card className="border border-border/70 bg-muted/20 p-4 space-y-3">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-muted-foreground">Amount Debited</span>
                    <span className="font-mono font-bold text-rose-400 text-base">
                      ৳{selectedExpense.amountBdt.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-muted-foreground">Beneficiary Vendor</span>
                    <span className="font-semibold text-foreground">{selectedExpense.vendor}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-muted-foreground">Disbursement Date</span>
                    <span className="font-mono text-foreground">{selectedExpense.date}</span>
                  </div>
                </Card>

                {selectedExpense.note && (
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Description & Remarks</label>
                    <p className="text-xs text-foreground p-3 rounded-lg bg-muted/30 border border-border/60">
                      {selectedExpense.note}
                    </p>
                  </div>
                )}

                <div className="pt-4 flex gap-2">
                  <Button
                    className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-xs"
                    onClick={() => {
                      toast.success(`Printing expense voucher #${selectedExpense.id}`);
                    }}
                  >
                    Print Payment Voucher
                  </Button>
                  <Button
                    variant="outline"
                    className="border-border hover:bg-accent text-xs"
                    onClick={() => setSelectedExpense(null)}
                  >
                    Close
                  </Button>
                </div>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>

      {/* New Expense Modal */}
      {modalOpen && <ExpenseModal open={modalOpen} onOpenChange={setModalOpen} onSave={handleSaveExpense} />}

      {/* Delete Dialog */}
      <ConfirmDialog
        open={deleteConfirmOpen}
        onOpenChange={setDeleteConfirmOpen}
        title="Delete Expense Record"
        description={`Delete debit voucher ${itemToDelete?.id} (${itemToDelete?.category})? This will reverse the general ledger debit.`}
        confirmLabel="Delete Voucher"
        destructive
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}
