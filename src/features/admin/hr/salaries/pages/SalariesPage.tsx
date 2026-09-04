'use client';
import { PageHero, PageContent } from '@/components/motion/PageHero';

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useSalaries } from '../hooks/use-salaries';
import { PageSkeleton, EmptyState, CurrencyDisplay } from '@/components/shared';
import { SalaryPaymentModal } from '../components/SalaryPaymentModal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Banknote, PlusCircle, Search, CheckCircle2, DollarSign, Wallet, X, BanknoteIcon } from 'lucide-react';
import type { SalaryPaymentFormValues } from '../schemas';

const hoverLift = { y: -2, transition: { duration: 0.15 } };

const statStyles: Record<string, { iconBg: string; iconText: string; border: string; valueText: string }> = {
  amber: { iconBg: 'bg-amber-500/10', iconText: 'text-amber-600 dark:text-amber-400', border: 'border-amber-500/20', valueText: 'text-amber-600 dark:text-amber-400' },
  blue: { iconBg: 'bg-blue-500/10', iconText: 'text-blue-600 dark:text-blue-400', border: 'border-blue-500/20', valueText: 'text-blue-600 dark:text-blue-400' },
  emerald: { iconBg: 'bg-emerald-500/10', iconText: 'text-emerald-600 dark:text-emerald-400', border: 'border-emerald-500/20', valueText: 'text-emerald-600 dark:text-emerald-400' },
  purple: { iconBg: 'bg-purple-500/10', iconText: 'text-purple-600 dark:text-purple-400', border: 'border-purple-500/20', valueText: 'text-purple-600 dark:text-purple-400' },
};

const methodColors: Record<string, string> = {
  'Bank Transfer': 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',
  'Cash': 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
  'bKash': 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20',
};

export function SalariesPage() {
  const { salaryPayments, employees, isLoading, isError, refetch, recordPayment } = useSalaries();
  const [search, setSearch] = useState('');
  const [monthFilter, setMonthFilter] = useState('all');
  const [modalOpen, setModalOpen] = useState(false);

  const monthsList = useMemo(() => {
    const set = new Set(salaryPayments.map((p) => p.month));
    return Array.from(set).sort().reverse();
  }, [salaryPayments]);

  const filteredPayments = useMemo(() => {
    return salaryPayments.filter((payment) => {
      const matchesSearch =
        payment.employeeName.toLowerCase().includes(search.toLowerCase()) ||
        payment.id.toLowerCase().includes(search.toLowerCase());
      const matchesMonth = monthFilter === 'all' || payment.month === monthFilter;
      return matchesSearch && matchesMonth;
    });
  }, [salaryPayments, search, monthFilter]);

  const totalDisbursed = useMemo(() => filteredPayments.reduce((sum, p) => sum + (p.amountBdt || 0), 0), [filteredPayments]);
  const avgSalary = filteredPayments.length > 0 ? Math.round(totalDisbursed / filteredPayments.length) : 0;

  const handleSavePayment = async (values: SalaryPaymentFormValues, employeeName: string) => {
    await recordPayment({ employeeId: values.employeeId, employeeName, month: values.month, amountBdt: values.amountBdt, paidVia: values.paidVia, notes: values.notes });
  };

  if (isLoading) return <PageSkeleton variant="table" rows={8} />;
  if (isError) {
    return (
      <div className="p-6">
        <EmptyState title="Failed to load salary disbursements" description="Could not load the payroll payment registry." actionLabel="Retry" onAction={() => refetch()} />
      </div>
    );
  }

  const stats = [
    { label: 'Disbursed (Visible)', value: <CurrencyDisplay amount={totalDisbursed} className="font-bold" />, description: 'Sum of filtered payments', icon: DollarSign, color: 'amber' },
    { label: 'Disbursed Count', value: filteredPayments.length, description: 'Total vouchers issued', icon: CheckCircle2, color: 'blue' },
    { label: 'Avg. Salary', value: <CurrencyDisplay amount={avgSalary} className="font-bold" />, description: 'Per payout average', icon: BanknoteIcon, color: 'emerald' },
    { label: 'Active Staff', value: employees.length, description: 'Payroll beneficiaries', icon: Wallet, color: 'purple' },
  ];

  return (
    <div className="space-y-6">
      <PageHero className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight md:text-3xl flex items-center gap-3">
            <div className="p-2 rounded-xl bg-primary/10 text-primary border border-primary/20">
              <Banknote className="h-6 w-6" />
            </div>
            Salary Payments
          </h1>
          <p className="text-muted-foreground text-sm mt-1.5">
            Disburse and review monthly employee payroll, bank transfers, and payment vouchers.
          </p>
        </div>
        <motion.div whileHover={hoverLift}>
          <Button onClick={() => setModalOpen(true)} className="bg-primary hover:bg-primary/90 font-semibold shadow-sm gap-1.5">
            <PlusCircle className="h-4 w-4" /> New Salary Payment
          </Button>
        </motion.div>
      </PageHero>
      <PageContent className="space-y-6">

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, idx) => {
          const style = statStyles[stat.color];
          return (
            <div key={stat.label}>
              <Card className="border-border/60 bg-card shadow-sm ring-1 ring-foreground/5 hover:shadow-md hover:border-primary/20 transition-all duration-200 overflow-hidden group">
                <CardContent className="p-4 flex items-center gap-3.5">
                  <div className={`p-2.5 rounded-xl ${style.iconBg} ${style.iconText} border ${style.border} group-hover:scale-110 transition-transform duration-200`}>
                    <stat.icon className="h-5 w-5" />
                  </div>
                  <div>
                    <div className={`text-2xl font-bold tracking-tight ${style.valueText}`}>{stat.value}</div>
                    <div className="text-xs text-muted-foreground font-medium">{stat.label}</div>
                  </div>
                </CardContent>
              </Card>
            </div>
          );
        })}
      </div>

      <div>
        <Card className="border-border/60 bg-card shadow-sm ring-1 ring-foreground/5 overflow-hidden">
          <div className="p-4 border-b border-border/50">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="relative flex-1 min-w-[200px] sm:min-w-[300px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search by employee name or voucher ID..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10 h-9 bg-background border-border/60 text-sm shadow-sm" />
                {search && (
                  <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Select value={monthFilter} onValueChange={(v) => setMonthFilter(v ?? 'all')}>
                  <SelectTrigger className="w-[160px] h-9 text-xs border-border/60">
                    <SelectValue placeholder="Salary Month" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Months</SelectItem>
                    {monthsList.map((m) => <SelectItem key={m} value={m}>{m}</SelectItem>)}
                  </SelectContent>
                </Select>
                <Badge variant="secondary" className="font-mono text-xs px-2.5 py-1">{filteredPayments.length} result{filteredPayments.length !== 1 ? 's' : ''}</Badge>
              </div>
            </div>
          </div>

          {filteredPayments.length === 0 ? (
            <div className="py-16">
              <EmptyState icon={<Banknote className="h-10 w-10" />} title="No salary disbursements found" description="No salary payment matches your search or selected month." actionLabel="Disburse Salary" onAction={() => setModalOpen(true)} />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent border-border/50">
                    <TableHead className="w-12 text-[11px] uppercase tracking-wider font-semibold text-muted-foreground">#</TableHead>
                    <TableHead className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground">Voucher ID</TableHead>
                    <TableHead className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground">Employee</TableHead>
                    <TableHead className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground">Month</TableHead>
                    <TableHead className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground">Amount</TableHead>
                    <TableHead className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground">Paid Date</TableHead>
                    <TableHead className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground">Paid Via</TableHead>
                    <TableHead className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPayments.map((p, idx) => (
                    <motion.tr
                      key={p.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: idx * 0.02 }}
                      className="group border-border/40 hover:bg-muted/30 transition-colors"
                    >
                      <TableCell className="text-muted-foreground font-mono text-xs">{idx + 1}</TableCell>
                      <TableCell>
                        <span className="font-mono text-xs font-semibold bg-muted/40 px-2 py-1 rounded-md">{p.id}</span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary border border-primary/20 font-bold text-[10px] group-hover:scale-110 transition-transform">
                            {p.employeeName.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()}
                          </div>
                          <span className="font-semibold text-sm group-hover:text-primary transition-colors">{p.employeeName}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="font-mono text-xs bg-muted/40">{p.month}</Badge>
                      </TableCell>
                      <TableCell>
                        <span className="font-mono font-bold text-sm"><CurrencyDisplay amount={p.amountBdt} /></span>
                      </TableCell>
                      <TableCell className="text-muted-foreground text-xs font-mono">{p.paidAt}</TableCell>
                      <TableCell>
                        <Badge variant="secondary" className={`text-[10px] font-medium border ${methodColors[p.paidVia || 'Bank Transfer'] || methodColors['Bank Transfer']}`}>
                          {p.paidVia ?? 'Bank Transfer'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {p.status === 'paid' ? (
                          <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 text-xs font-medium gap-1">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 inline-block" /> Paid
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20 text-xs font-medium gap-1">
                            <span className="h-1.5 w-1.5 rounded-full bg-amber-500 inline-block" /> Pending
                          </Badge>
                        )}
                      </TableCell>
                    </motion.tr>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </Card>
      </div>

      </PageContent>
      {modalOpen && <SalaryPaymentModal open={modalOpen} onOpenChange={setModalOpen} employees={employees} onSave={handleSavePayment} />}
    </div>
  );
}
