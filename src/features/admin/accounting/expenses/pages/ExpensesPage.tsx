'use client';

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useExpenses } from '../hooks/use-expenses';
import type { ExpenseItem } from '../types';
import type { ExpenseFormValues } from '../schemas';
import { PageSkeleton, EmptyState, StatCard, CurrencyDisplay, ConfirmDialog, Can } from '@/components/shared';
import { ExpenseModal } from '../components/ExpenseModal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { TrendingDown, Plus, Search, Trash2, Calendar, Building2, DollarSign } from 'lucide-react';
import { toast } from 'sonner';
import { staggerContainer, fadeUp, hoverLift } from '@/lib/animations';

export function ExpensesPage() {
  const { expenses, isLoading, isError, refetch, createExpense, deleteExpense } = useExpenses();

  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<ExpenseItem | null>(null);

  const categories = useMemo(() => Array.from(new Set(expenses.map((e) => e.category))), [expenses]);

  const filteredExpenses = useMemo(() => {
    return expenses.filter((item) => {
      const matchesSearch =
        item.category.toLowerCase().includes(search.toLowerCase()) ||
        item.vendor.toLowerCase().includes(search.toLowerCase()) ||
        item.id.toLowerCase().includes(search.toLowerCase());
      const matchesCategory = categoryFilter === 'all' || item.category === categoryFilter;
      return matchesSearch && matchesCategory;
    });
  }, [expenses, search, categoryFilter]);

  const totalExpenses = useMemo(
    () => filteredExpenses.reduce((sum, e) => sum + (e.amountBdt || 0), 0),
    [filteredExpenses],
  );

  const handleSaveExpense = async (values: ExpenseFormValues) => {
    await createExpense(values);
    toast.success('Expense recorded');
  };

  const handleConfirmDelete = async () => {
    if (!itemToDelete) return;
    try {
      await deleteExpense(itemToDelete.id);
      toast.success('Expense entry removed');
      setDeleteConfirmOpen(false);
    } catch {
      toast.error('Failed to delete expense');
    }
  };

  if (isLoading) return <PageSkeleton rows={8} />;

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
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="show"
      className="space-y-6 max-w-7xl mx-auto pb-12"
    >
      {/* Header */}
      <motion.div variants={fadeUp} className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Expenses & Payables</h1>
          <p className="text-muted-foreground text-sm">
            Track bandwidth purchases, salaries, equipment, rent, and operational outflows.
          </p>
        </div>
        <Can menu="accounting" action="create">
          <motion.div whileHover={hoverLift}>
            <Button onClick={() => setModalOpen(true)} className="bg-primary hover:bg-primary/90 shadow-sm font-semibold gap-1.5">
              <Plus className="h-4 w-4" />
              New Expense Entry
            </Button>
          </motion.div>
        </Can>
      </motion.div>

      {/* KPI Cards */}
      <motion.div variants={fadeUp} className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard
          title="Total Expenses (Visible)"
          value={<CurrencyDisplay amount={totalExpenses} />}
          description="Aggregated outflow"
          icon={DollarSign}
        />
        <StatCard title="Vouchers / Records" value={filteredExpenses.length} description="Entries matching criteria" icon={TrendingDown} />
        <StatCard title="Expense Categories" value={categories.length} description="Distinct cost centers" icon={Building2} />
      </motion.div>

      {/* Filter Bar */}
      <motion.div variants={fadeUp}>
        <Card className="border-border/60 shadow-sm ring-1 ring-foreground/5 p-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <Search className="text-muted-foreground absolute top-2.5 left-2.5 h-4 w-4" />
              <Input
                placeholder="Search by category, vendor, or ID..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-8 h-9 bg-background border-border/60 text-sm shadow-sm"
              />
            </div>
            <Select value={categoryFilter} onValueChange={(v) => setCategoryFilter(v ?? 'all')}>
              <SelectTrigger className="w-[200px] h-9 bg-background border-border/60 text-sm shadow-sm">
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
        </Card>
      </motion.div>

      {/* Table */}
      <motion.div variants={fadeUp}>
        {filteredExpenses.length === 0 ? (
          <EmptyState
            icon={<TrendingDown className="h-10 w-10" />}
            title="No expense records found"
            description="No expense transactions match your filters."
            actionLabel="Record Expense"
            onAction={() => setModalOpen(true)}
          />
        ) : (
          <Card className="border-border/60 shadow-sm ring-1 ring-foreground/5 overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent border-border/50">
                  <TableHead className="w-12 text-xs uppercase tracking-wider">#</TableHead>
                  <TableHead className="text-xs uppercase tracking-wider">Voucher ID</TableHead>
                  <TableHead className="text-xs uppercase tracking-wider">Date</TableHead>
                  <TableHead className="text-xs uppercase tracking-wider">Category</TableHead>
                  <TableHead className="text-xs uppercase tracking-wider">Vendor</TableHead>
                  <TableHead className="text-xs uppercase tracking-wider">Amount</TableHead>
                  <TableHead className="text-right text-xs uppercase tracking-wider">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredExpenses.map((item, idx) => (
                  <TableRow key={item.id} className="group border-border/40 hover:bg-muted/20 transition-colors">
                    <TableCell className="text-muted-foreground font-mono text-xs">{idx + 1}</TableCell>
                    <TableCell className="font-mono text-xs font-semibold">{item.id}</TableCell>
                    <TableCell className="flex items-center gap-1.5 text-xs font-mono">
                      <Calendar className="text-muted-foreground h-3.5 w-3.5" />
                      {item.date}
                    </TableCell>
                    <TableCell className="font-medium text-sm">{item.category}</TableCell>
                    <TableCell className="text-muted-foreground text-sm">{item.vendor}</TableCell>
                    <TableCell>
                      <CurrencyDisplay amount={item.amountBdt} className="font-semibold text-red-600 dark:text-red-400" />
                    </TableCell>
                    <TableCell className="text-right">
                      <Can menu="accounting" action="delete">
                        <motion.div whileHover={hoverLift} className="inline-block">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-destructive hover:bg-destructive/10"
                            onClick={() => {
                              setItemToDelete(item);
                              setDeleteConfirmOpen(true);
                            }}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                            <span className="sr-only">Delete</span>
                          </Button>
                        </motion.div>
                      </Can>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        )}
      </motion.div>

      {modalOpen && <ExpenseModal open={modalOpen} onOpenChange={setModalOpen} onSave={handleSaveExpense} />}

      <ConfirmDialog
        open={deleteConfirmOpen}
        onOpenChange={setDeleteConfirmOpen}
        title="Delete Expense Record"
        description={`Delete ${itemToDelete?.id} (${itemToDelete?.category})?`}
        confirmLabel="Delete"
        destructive
        onConfirm={handleConfirmDelete}
      />
    </motion.div>
  );
}
