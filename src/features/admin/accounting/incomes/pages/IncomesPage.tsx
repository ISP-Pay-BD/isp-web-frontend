'use client';

import { useState, useMemo } from 'react';
import { useIncomes } from '../hooks/use-incomes';
import type { IncomeItem } from '../types';
import type { IncomeFormValues } from '../schemas';
import { PageSkeleton, EmptyState, StatCard, CurrencyDisplay, ConfirmDialog, Can } from '@/components/shared';
import { IncomeModal } from '../components/IncomeModal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { TrendingUp, Plus, Search, Trash2, Calendar, CreditCard, DollarSign } from 'lucide-react';
import { toast } from 'sonner';

export function IncomesPage() {
  const { incomes, isLoading, isError, refetch, createIncome, deleteIncome } = useIncomes();

  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<IncomeItem | null>(null);

  const categories = useMemo(() => {
    return Array.from(new Set(incomes.map((i) => i.category)));
  }, [incomes]);

  const filteredIncomes = useMemo(() => {
    return incomes.filter((item) => {
      const matchesSearch =
        item.category.toLowerCase().includes(search.toLowerCase()) ||
        (item.note && item.note.toLowerCase().includes(search.toLowerCase())) ||
        item.id.toLowerCase().includes(search.toLowerCase());
      const matchesCategory = categoryFilter === 'all' || item.category === categoryFilter;
      return matchesSearch && matchesCategory;
    });
  }, [incomes, search, categoryFilter]);

  const totalIncome = useMemo(() => {
    return filteredIncomes.reduce((sum, i) => sum + (i.amountBdt || 0), 0);
  }, [filteredIncomes]);

  const handleSaveIncome = async (values: IncomeFormValues) => {
    await createIncome(values);
  };

  const handleConfirmDelete = async () => {
    if (!itemToDelete) return;
    try {
      await deleteIncome(itemToDelete.id);
      toast.success('Income entry removed');
      setDeleteConfirmOpen(false);
    } catch {
      toast.error('Failed to delete income');
    }
  };

  if (isLoading) {
    return <PageSkeleton rows={8} />;
  }

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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Revenue & Incomes</h1>
          <p className="text-muted-foreground text-sm">
            Track customer collections, daily counter receipts, installation fees, and POP revenue streams.
          </p>
        </div>
        <Can menu="accounting" action="create">
          <Button onClick={() => setModalOpen(true)} className="bg-primary hover:bg-primary/90">
            <Plus className="mr-2 h-4 w-4" />
            New Income Entry
          </Button>
        </Can>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard
          title="Total Incomes (Visible)"
          value={<CurrencyDisplay amount={totalIncome} />}
          description="Aggregated collection"
          icon={DollarSign}
        />
        <StatCard
          title="Vouchers / Records"
          value={filteredIncomes.length}
          description="Entries matching criteria"
          icon={TrendingUp}
        />
        <StatCard
          title="Revenue Categories"
          value={categories.length}
          description="Distinct revenue sources"
          icon={CreditCard}
        />
      </div>

      {/* Filter Bar */}
      <div className="bg-card flex flex-col gap-3 rounded-lg border p-4 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="text-muted-foreground absolute top-2.5 left-2.5 h-4 w-4" />
          <Input
            placeholder="Search by category, note, or ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8"
          />
        </div>
        <div className="flex items-center gap-2">
          <Select value={categoryFilter} onValueChange={(v) => setCategoryFilter(v ?? 'all')}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map((c) => (
                <SelectItem key={c} value={c}>
                  {c}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Table */}
      {filteredIncomes.length === 0 ? (
        <EmptyState
          icon={<TrendingUp className="h-10 w-10" />}
          title="No income records found"
          description="No income transactions match your filters."
          actionLabel="Record Income"
          onAction={() => setModalOpen(true)}
        />
      ) : (
        <div className="bg-card rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">#</TableHead>
                <TableHead>Voucher ID</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Method</TableHead>
                <TableHead>Note</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredIncomes.map((item, idx) => (
                <TableRow key={item.id}>
                  <TableCell className="text-muted-foreground font-mono text-xs">{idx + 1}</TableCell>
                  <TableCell className="font-mono text-xs font-semibold">{item.id}</TableCell>
                  <TableCell className="flex items-center gap-1.5 text-xs font-mono">
                    <Calendar className="text-muted-foreground h-3.5 w-3.5" />
                    {item.date}
                  </TableCell>
                  <TableCell className="font-medium">{item.category}</TableCell>
                  <TableCell>
                    <span className="bg-muted text-muted-foreground rounded px-2 py-0.5 text-xs capitalize">
                      {item.method}
                    </span>
                  </TableCell>
                  <TableCell className="text-muted-foreground text-xs">{item.note ?? '--'}</TableCell>
                  <TableCell>
                    <CurrencyDisplay amount={item.amountBdt} className="font-semibold text-emerald-600 dark:text-emerald-400" />
                  </TableCell>
                  <TableCell className="text-right">
                    <Can menu="accounting" action="delete">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive hover:text-destructive"
                        onClick={() => {
                          setItemToDelete(item);
                          setDeleteConfirmOpen(true);
                        }}
                        title="Delete entry"
                      >
                        <Trash2 className="h-4 w-4" />
                        <span className="sr-only">Delete</span>
                      </Button>
                    </Can>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

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
        description={`Are you sure you want to delete entry ${itemToDelete?.id} (${itemToDelete?.category})?`}
        confirmLabel="Delete"
        destructive
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}
