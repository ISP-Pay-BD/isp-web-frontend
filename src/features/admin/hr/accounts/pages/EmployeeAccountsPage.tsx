'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { useEmployeeAccounts } from '../hooks/use-employee-accounts';
import { PageSkeleton, EmptyState, StatCard, CurrencyDisplay } from '@/components/shared';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { FileSpreadsheet, Search, HandCoins, CreditCard, ArrowUpRight } from 'lucide-react';

export function EmployeeAccountsPage() {
  const { accounts, employees, isLoading, isError, refetch } = useEmployeeAccounts();
  const [search, setSearch] = useState('');

  // Merge employee designation and salary info
  const combinedData = useMemo(() => {
    return accounts.map((acc) => {
      const emp = employees.find((e) => e.id === acc.employeeId);
      return {
        ...acc,
        role: emp?.role ?? 'Staff Member',
        monthlySalary: emp?.salaryBdt ?? 20000,
      };
    });
  }, [accounts, employees]);

  const filtered = useMemo(() => {
    return combinedData.filter(
      (a) =>
        a.employeeName.toLowerCase().includes(search.toLowerCase()) ||
        a.employeeId.toLowerCase().includes(search.toLowerCase()) ||
        a.role.toLowerCase().includes(search.toLowerCase()),
    );
  }, [combinedData, search]);

  const totalOutstandingAdvances = useMemo(() => {
    return combinedData.reduce((sum, a) => sum + (a.advancesBdt || 0), 0);
  }, [combinedData]);

  if (isLoading) {
    return <PageSkeleton rows={8} />;
  }

  if (isError) {
    return (
      <div className="p-6">
        <EmptyState
          title="Failed to load employee accounts"
          description="Could not load staff financial ledger accounts."
          actionLabel="Retry"
          onAction={() => refetch()}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header & Quick Action links */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Employee Accounts Ledger</h1>
          <p className="text-muted-foreground text-sm">
            Monthly ledger tracking: <strong>Balance = Salary − Approved Advances − Paid Salary</strong>.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" render={<Link href="/admin/hr/advance-salary" />}>
            <HandCoins className="mr-2 h-4 w-4" />
            Advance Salary
          </Button>
          <Button className="bg-primary hover:bg-primary/90" render={<Link href="/admin/hr/salaries" />}>
            <CreditCard className="mr-2 h-4 w-4" />
            Salary Payments
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard
          title="Total Staff Ledgers"
          value={combinedData.length}
          description="Enrolled staff payroll accounts"
          icon={FileSpreadsheet}
        />
        <StatCard
          title="Active Advances"
          value={<CurrencyDisplay amount={totalOutstandingAdvances} />}
          description="Pending payroll deductions"
          trend={{ value: `${combinedData.filter((a) => a.advancesBdt > 0).length} employees with advance`, positive: false }}
          icon={HandCoins}
        />
        <StatCard
          title="Current Pay Cycle"
          value="August 2026"
          description="Last finalized disbursement"
          icon={CreditCard}
        />
      </div>

      {/* Filter Bar */}
      <div className="bg-card flex flex-col gap-3 rounded-lg border p-4 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="text-muted-foreground absolute top-2.5 left-2.5 h-4 w-4" />
          <Input
            placeholder="Search by staff name, ID, or designation..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8"
          />
        </div>
      </div>

      {/* Table */}
      {filtered.length === 0 ? (
        <EmptyState
          icon={<FileSpreadsheet className="h-10 w-10" />}
          title="No employee accounts found"
          description="No account records matching your criteria."
        />
      ) : (
        <div className="bg-card rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">#</TableHead>
                <TableHead>Employee</TableHead>
                <TableHead>Designation</TableHead>
                <TableHead>Monthly Base</TableHead>
                <TableHead>Outstanding Advance</TableHead>
                <TableHead>Last Salary Month</TableHead>
                <TableHead>Net Balance Due</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((acc, idx) => (
                <TableRow key={acc.employeeId}>
                  <TableCell className="text-muted-foreground font-mono text-xs">{idx + 1}</TableCell>
                  <TableCell>
                    <div className="font-medium">{acc.employeeName}</div>
                    <div className="text-muted-foreground font-mono text-xs">{acc.employeeId}</div>
                  </TableCell>
                  <TableCell className="text-sm">{acc.role}</TableCell>
                  <TableCell>
                    <CurrencyDisplay amount={acc.monthlySalary} />
                  </TableCell>
                  <TableCell>
                    {acc.advancesBdt > 0 ? (
                      <span className="text-amber-600 dark:text-amber-400 font-medium">
                        <CurrencyDisplay amount={acc.advancesBdt} />
                      </span>
                    ) : (
                      <span className="text-muted-foreground text-xs">৳0</span>
                    )}
                  </TableCell>
                  <TableCell className="font-mono text-xs">{acc.lastSalaryMonth}</TableCell>
                  <TableCell>
                    <CurrencyDisplay
                      amount={acc.balanceBdt}
                      className={acc.balanceBdt < 0 ? 'text-destructive font-semibold' : 'text-emerald-600 font-semibold'}
                    />
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" render={<Link href={`/admin/hr/salaries`} />}>
                      Pay
                      <ArrowUpRight className="ml-1 h-3.5 w-3.5" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
