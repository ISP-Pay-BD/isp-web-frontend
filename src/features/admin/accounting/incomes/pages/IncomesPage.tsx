'use client';

import { useState, useMemo } from 'react';
import {
  TrendingUp,
  Plus,
  Search,
  Trash2,
  Calendar,
  DollarSign,
  Receipt,
  Building,
  CreditCard,
  Layers,
  ArrowUpRight,
  Filter,
  CheckCircle2,
  RefreshCw,
  X,
  FileSpreadsheet,
  Wallet,
  Eye,
  MoreVertical,
} from 'lucide-react';
import { useIncomes } from '../hooks/use-incomes';
import type { IncomeItem } from '../types';
import type { IncomeFormValues } from '../schemas';
import { PageSkeleton, EmptyState, CurrencyDisplay, ConfirmDialog, Can } from '@/components/shared';
import { PageHeader } from '@/features/admin/shared/components/PageHeader';
import { IncomeModal } from '../components/IncomeModal';
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

export function IncomesPage() {
  const { incomes, isLoading, isError, refetch, createIncome, deleteIncome } = useIncomes();

  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<IncomeItem | null>(null);
  const [selectedIncome, setSelectedIncome] = useState<IncomeItem | null>(null);

  const categories = useMemo(() => {
    return Array.from(new Set(incomes.map((i) => i.category)));
  }, [incomes]);

  const filteredIncomes = useMemo(() => {
    return incomes.filter((item) => {
      const q = search.toLowerCase().trim();
      const matchesSearch =
        !q ||
        item.category.toLowerCase().includes(q) ||
        (item.note && item.note.toLowerCase().includes(q)) ||
        (item.invoiceNo && item.invoiceNo.toLowerCase().includes(q)) ||
        (item.bankAccount && item.bankAccount.toLowerCase().includes(q)) ||
        item.id.toLowerCase().includes(q) ||
        item.amountBdt.toString().includes(q);

      const matchesCategory = categoryFilter === 'all' || item.category === categoryFilter;
      return matchesSearch && matchesCategory;
    });
  }, [incomes, search, categoryFilter]);

  const stats = useMemo(() => {
    const totalAmount = incomes.reduce((sum, i) => sum + (i.amountBdt || 0), 0);
    const count = incomes.length;
    const avgTicket = count > 0 ? Math.round(totalAmount / count) : 0;
    const bkashCount = incomes.filter((i) => i.method.toLowerCase().includes('bkash') || i.method.toLowerCase().includes('pgw')).length;
    return { totalAmount, count, avgTicket, bkashCount };
  }, [incomes]);

  const handleSaveIncome = async (values: IncomeFormValues) => {
    await createIncome(values);
  };

  const handleConfirmDelete = async () => {
    if (!itemToDelete) return;
    try {
      await deleteIncome(itemToDelete.id);
      toast.success('Income entry removed from general ledger');
      setDeleteConfirmOpen(false);
      setItemToDelete(null);
    } catch {
      toast.error('Failed to delete income entry');
    }
  };

  const handleExportCSV = () => {
    toast.success(`Exporting ${filteredIncomes.length} income ledger records to CSV...`);
  };

  if (isLoading) return <PageSkeleton variant="table" rows={8} />;

  if (isError) {
    return (
      <div className="p-6">
        <EmptyState
          title="Failed to load income entries"
          description="Could not communicate with the accounting ledger."
          actionLabel="Retry"
          onAction={() => refetch()}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header */}
      <PageHeader
        title="Income & Inward Ledger"
        subtitle="Track subscription receipts, installation revenues, OTC payments, and misc revenue deposits."
        breadcrumb={[{ label: 'Dashboard', url: '/admin/dashboard' }, { label: 'Accounting' }, { label: 'Incomes' }]}
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => refetch()}
              className="text-xs border-border/80 hover:bg-accent gap-1.5"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              Refresh
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleExportCSV}
              className="text-xs border-border/80 hover:bg-accent gap-1.5"
            >
              <FileSpreadsheet className="h-3.5 w-3.5 text-emerald-400" />
              Export CSV
            </Button>
            <Can menu="accounting" action="create">
              <Button
                onClick={() => setModalOpen(true)}
                className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold shadow-sm text-xs h-9 gap-1.5"
              >
                <Plus className="h-4 w-4" />
                New Income Entry
              </Button>
            </Can>
          </div>
        }
      />

      {/* KPI Stats Ribbon */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="border border-border/70 bg-card/60 backdrop-blur-md shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-xl pointer-events-none" />
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Total Recorded</span>
              <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <TrendingUp className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-2 text-2xl font-black font-mono text-emerald-400">৳{stats.totalAmount.toLocaleString()}</div>
            <div className="mt-2 text-[11px] text-muted-foreground">Gross revenue inflows</div>
          </CardContent>
        </Card>

        <Card className="border border-border/70 bg-card/60 backdrop-blur-md shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/5 rounded-full blur-xl pointer-events-none" />
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Vouchers / Deposits</span>
              <div className="p-2 rounded-lg bg-purple-500/10 text-purple-400 border border-purple-500/20">
                <Receipt className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-2 text-2xl font-black font-mono text-foreground">{stats.count}</div>
            <div className="mt-2 text-[11px] text-muted-foreground">Total money receipts issued</div>
          </CardContent>
        </Card>

        <Card className="border border-border/70 bg-card/60 backdrop-blur-md shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 rounded-full blur-xl pointer-events-none" />
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Average Ticket</span>
              <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20">
                <Wallet className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-2 text-2xl font-black font-mono text-blue-400">৳{stats.avgTicket.toLocaleString()}</div>
            <div className="mt-2 text-[11px] text-muted-foreground">Mean inward voucher size</div>
          </CardContent>
        </Card>

        <Card className="border border-border/70 bg-card/60 backdrop-blur-md shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-full blur-xl pointer-events-none" />
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Digital & PGW Flow</span>
              <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
                <CreditCard className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-2 text-2xl font-black font-mono text-amber-400">{stats.bkashCount} Deposits</div>
            <div className="mt-2 text-[11px] text-muted-foreground">Settled via MFS & Online PGW</div>
          </CardContent>
        </Card>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between p-3.5 rounded-xl border border-border/60 bg-card/60 backdrop-blur-sm shadow-sm">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by voucher ID, category, invoice #, bank, note..."
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
            <SelectItem value="all">All Income Categories</SelectItem>
            {categories.map((c) => (
              <SelectItem key={c} value={c}>
                {c}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Incomes Table */}
      {filteredIncomes.length === 0 ? (
        <EmptyState
          icon={<TrendingUp className="h-10 w-10 text-muted-foreground" />}
          title="No income records found"
          description="No income transactions match your filters."
          actionLabel="Record Income"
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
                  <TableHead className="text-xs font-semibold">Method / Gateway</TableHead>
                  <TableHead className="text-xs font-semibold">Reference Note</TableHead>
                  <TableHead className="text-right text-xs font-semibold">Amount (BDT)</TableHead>
                  <TableHead className="text-right text-xs font-semibold">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="divide-y divide-border/40">
                {filteredIncomes.map((item, idx) => (
                  <TableRow
                    key={item.id}
                    className="hover:bg-muted/30 cursor-pointer transition-colors duration-150 group"
                    onClick={() => setSelectedIncome(item)}
                  >
                    <TableCell className="text-muted-foreground font-mono text-xs">{idx + 1}</TableCell>
                    <TableCell className="font-mono text-xs font-bold text-primary">
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
                    <TableCell>
                      <Badge
                        variant="outline"
                        className="bg-primary/10 text-primary border-primary/20 text-[10px] font-medium"
                      >
                        {item.method}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground max-w-[220px] truncate">
                      {item.note || item.invoiceNo || '—'}
                    </TableCell>
                    <TableCell className="text-right font-mono font-bold text-sm text-emerald-400">
                      ৳{item.amountBdt.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-muted-foreground hover:text-foreground"
                          onClick={() => setSelectedIncome(item)}
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
      <Sheet open={!!selectedIncome} onOpenChange={(open) => !open && setSelectedIncome(null)}>
        <SheetContent className="bg-card border-border text-foreground w-full sm:max-w-md overflow-y-auto">
          {selectedIncome && (
            <div className="space-y-6">
              <SheetHeader>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="font-mono text-[10px] bg-primary/10 text-primary border-primary/20">
                    {selectedIncome.id}
                  </Badge>
                  <Badge variant="outline" className="text-[10px] bg-emerald-500/10 text-emerald-400 border-emerald-500/20">
                    Posted to GL
                  </Badge>
                </div>
                <SheetTitle className="text-xl font-bold text-foreground">{selectedIncome.category}</SheetTitle>
                <SheetDescription className="text-xs text-muted-foreground">
                  Transaction breakdown and bank deposit trail.
                </SheetDescription>
              </SheetHeader>

              <div className="space-y-4">
                <Card className="border border-border/70 bg-muted/20 p-4 space-y-3">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-muted-foreground">Amount Credited</span>
                    <span className="font-mono font-bold text-emerald-400 text-base">
                      ৳{selectedIncome.amountBdt.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-muted-foreground">Date of Receipt</span>
                    <span className="font-mono text-foreground">{selectedIncome.date}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-muted-foreground">Settlement Method</span>
                    <span className="font-medium text-foreground">{selectedIncome.method}</span>
                  </div>
                  {selectedIncome.bankAccount && (
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-muted-foreground">Destination Account</span>
                      <span className="font-mono text-foreground">{selectedIncome.bankAccount}</span>
                    </div>
                  )}
                  {selectedIncome.invoiceNo && (
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-muted-foreground">Linked Invoice</span>
                      <span className="font-mono text-primary">{selectedIncome.invoiceNo}</span>
                    </div>
                  )}
                </Card>

                {selectedIncome.note && (
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Note / Remarks</label>
                    <p className="text-xs text-foreground p-3 rounded-lg bg-muted/30 border border-border/60">
                      {selectedIncome.note}
                    </p>
                  </div>
                )}

                <div className="pt-4 flex gap-2">
                  <Button
                    className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-xs"
                    onClick={() => {
                      toast.success(`Printing deposit voucher #${selectedIncome.id}`);
                    }}
                  >
                    Print Money Receipt
                  </Button>
                  <Button
                    variant="outline"
                    className="border-border hover:bg-accent text-xs"
                    onClick={() => setSelectedIncome(null)}
                  >
                    Close
                  </Button>
                </div>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>

      {/* New Income Modal */}
      {modalOpen && (
        <IncomeModal
          open={modalOpen}
          onOpenChange={setModalOpen}
          onSave={handleSaveIncome}
        />
      )}

      {/* Delete Dialog */}
      <ConfirmDialog
        open={deleteConfirmOpen}
        onOpenChange={setDeleteConfirmOpen}
        title="Delete Income Record"
        description={`Are you sure you want to delete entry ${itemToDelete?.id} (${itemToDelete?.category})? This will reverse the general ledger credit.`}
        confirmLabel="Delete Voucher"
        destructive
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}
