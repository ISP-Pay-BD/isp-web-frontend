'use client';

import { useState, useMemo } from 'react';
import { useSalaries } from '../hooks/use-salaries';
import { PageSkeleton, EmptyState, StatCard, StatusBadge, CurrencyDisplay, Can } from '@/components/shared';
import { SalaryPaymentModal } from '../components/SalaryPaymentModal';
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
import { Banknote, PlusCircle, Search, Calendar, CheckCircle2, DollarSign } from 'lucide-react';
import type { SalaryPaymentFormValues } from '../schemas';

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

  const totalDisbursed = useMemo(() => {
    return filteredPayments.reduce((sum, p) => sum + (p.amountBdt || 0), 0);
  }, [filteredPayments]);

  const handleSavePayment = async (values: SalaryPaymentFormValues, employeeName: string) => {
    await recordPayment({
      employeeId: values.employeeId,
      employeeName,
      month: values.month,
      amountBdt: values.amountBdt,
      paidVia: values.paidVia,
      notes: values.notes,
    });
  };

  if (isLoading) {
    return <PageSkeleton rows={8} />;
  }

  if (isError) {
    return (
      <div className="p-6">
        <EmptyState
          title="Failed to load salary disbursements"
          description="Could not load the payroll payment registry."
          actionLabel="Retry"
          onAction={() => refetch()}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Salary Payments</h1>
          <p className="text-muted-foreground text-sm">
            Disburse and review monthly employee payroll, bank transfers, and payment vouchers.
          </p>
        </div>
        <Can menu="employee_payment" action="create">
          <Button onClick={() => setModalOpen(true)} className="bg-primary hover:bg-primary/90">
            <PlusCircle className="mr-2 h-4 w-4" />
            New Salary Payment
          </Button>
        </Can>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Disbursed (Visible)"
          value={<CurrencyDisplay amount={totalDisbursed} />}
          description="Sum of filtered payments"
          icon={DollarSign}
        />
        <StatCard
          title="Disbursed Count"
          value={filteredPayments.length}
          description="Total vouchers issued"
          icon={CheckCircle2}
        />
        <StatCard
          title="Avg. Salary"
          value={<CurrencyDisplay amount={filteredPayments.length > 0 ? Math.round(totalDisbursed / filteredPayments.length) : 0} />}
          description="Per payout average"
          icon={Banknote}
        />
        <StatCard
          title="Active Staff"
          value={employees.length}
          description="Payroll beneficiaries"
          icon={Calendar}
        />
      </div>

      {/* Filter Bar */}
      <div className="bg-card flex flex-col gap-3 rounded-lg border p-4 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="text-muted-foreground absolute top-2.5 left-2.5 h-4 w-4" />
          <Input
            placeholder="Search by employee name or voucher ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8"
          />
        </div>
        <div className="flex items-center gap-2">
          <Select value={monthFilter} onValueChange={(v) => setMonthFilter(v ?? 'all')}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Salary Month" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Months</SelectItem>
              {monthsList.map((m) => (
                <SelectItem key={m} value={m}>
                  {m}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Table Content */}
      {filteredPayments.length === 0 ? (
        <EmptyState
          icon={<Banknote className="h-10 w-10" />}
          title="No salary disbursements found"
          description="No salary payment matches your search or selected month."
          actionLabel="Disburse Salary"
          onAction={() => setModalOpen(true)}
        />
      ) : (
        <div className="bg-card rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">#</TableHead>
                <TableHead>Voucher ID</TableHead>
                <TableHead>Employee</TableHead>
                <TableHead>Month</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Paid Date</TableHead>
                <TableHead>Paid Via</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPayments.map((p, idx) => (
                <TableRow key={p.id}>
                  <TableCell className="text-muted-foreground font-mono text-xs">{idx + 1}</TableCell>
                  <TableCell className="font-mono text-xs font-semibold">{p.id}</TableCell>
                  <TableCell className="font-medium">{p.employeeName}</TableCell>
                  <TableCell>
                    <span className="bg-muted text-muted-foreground rounded px-2 py-0.5 font-mono text-xs font-medium">
                      {p.month}
                    </span>
                  </TableCell>
                  <TableCell>
                    <CurrencyDisplay amount={p.amountBdt} className="font-semibold" />
                  </TableCell>
                  <TableCell className="text-muted-foreground text-xs">{p.paidAt}</TableCell>
                  <TableCell className="text-muted-foreground text-xs">{p.paidVia ?? 'Bank Transfer'}</TableCell>
                  <TableCell>
                    <StatusBadge status={p.status} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* New Payment Modal */}
      {modalOpen && (
        <SalaryPaymentModal
          open={modalOpen}
          onOpenChange={setModalOpen}
          employees={employees}
          onSave={handleSavePayment}
        />
      )}
    </div>
  );
}
