'use client';
import { PageHero, PageContent } from '@/components/motion/PageHero';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { useEmployeeAccounts } from '../hooks/use-employee-accounts';
import { PageSkeleton, EmptyState, CurrencyDisplay } from '@/components/shared';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { FileSpreadsheet, Search, HandCoins, CreditCard, ArrowUpRight, X, Briefcase, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

const roleColors: Record<string, string> = {
  'Support Agent': 'bg-muted/60 text-muted-foreground border-border/50',
  'Field Technician': 'bg-muted/60 text-muted-foreground border-border/50',
  'Network Engineer': 'bg-muted/60 text-muted-foreground border-border/50',
  'Accountant': 'bg-muted/60 text-muted-foreground border-border/50',
  'Sales Executive': 'bg-muted/60 text-muted-foreground border-border/50',
  'Office Admin': 'bg-muted/60 text-muted-foreground border-border/50',
};

export function EmployeeAccountsPage() {
  const { accounts, employees, isLoading, isError, refetch } = useEmployeeAccounts();
  const [search, setSearch] = useState('');

  const combinedData = useMemo(() => {
    return accounts.map((acc) => {
      const emp = employees.find((e) => e.id === acc.employeeId);
      return { ...acc, role: emp?.role ?? 'Staff Member', monthlySalary: emp?.salaryBdt ?? 20000 };
    });
  }, [accounts, employees]);

  const filtered = useMemo(() => {
    return combinedData.filter(
      (a) => a.employeeName.toLowerCase().includes(search.toLowerCase()) || a.employeeId.toLowerCase().includes(search.toLowerCase()) || a.role.toLowerCase().includes(search.toLowerCase()),
    );
  }, [combinedData, search]);

  const totalOutstandingAdvances = useMemo(() => combinedData.reduce((sum, a) => sum + (a.advancesBdt || 0), 0), [combinedData]);
  const advanceCount = useMemo(() => combinedData.filter((a) => a.advancesBdt > 0).length, [combinedData]);

  if (isLoading) return <PageSkeleton variant="table" rows={8} />;
  if (isError) {
    return (
      <div className="p-6">
        <EmptyState title="Failed to load employee accounts" description="Could not load staff financial ledger accounts." actionLabel="Retry" onAction={() => refetch()} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHero className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight md:text-3xl flex items-center gap-3">
            <div className="p-2 rounded-xl bg-primary/10 text-primary border border-primary/20">
              <Briefcase className="h-6 w-6" />
            </div>
            Employee Accounts Ledger
          </h1>
          <p className="text-muted-foreground text-sm mt-1.5">
            Monthly ledger tracking: <strong>Balance = Salary − Approved Advances − Paid Salary</strong>.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div >
            <Button variant="outline" render={<Link href="/admin/hr/advance-salary" />}>
              <HandCoins className="mr-2 h-4 w-4" /> Advance Salary
            </Button>
          </div>
          <div >
            <Button className="bg-primary hover:bg-primary/90 font-semibold" render={<Link href="/admin/hr/salaries" />}>
              <CreditCard className="mr-2 h-4 w-4" /> Salary Payments
            </Button>
          </div>
        </div>
      </PageHero>
      <PageContent className="space-y-6">

      <div className="flex flex-wrap gap-x-6 gap-y-2 border-y border-border/60 py-3 text-sm">
        <p>
          <span className="font-semibold tabular-nums">{combinedData.length}</span>{' '}
          <span className="text-muted-foreground">ledgers</span>
        </p>
        <p>
          <span className="font-semibold tabular-nums">
            <CurrencyDisplay amount={totalOutstandingAdvances} className="inline font-semibold" />
          </span>{' '}
          <span className="text-muted-foreground">outstanding advances</span>
        </p>
        <p>
          <span className="font-semibold tabular-nums">{advanceCount}</span>{' '}
          <span className="text-muted-foreground">with advance</span>
        </p>
        <p className="text-muted-foreground">Pay cycle <span className="font-medium text-foreground">August 2026</span></p>
      </div>

      <div>
        <Card className="border-border/60 bg-card shadow-sm ring-1 ring-border/60 overflow-hidden">
          <div className="p-4 border-b border-border/50">
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search by staff name, ID, or designation..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10 h-9 bg-background border-border/60 text-sm shadow-sm" />
              {search && (
                <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          </div>

          {filtered.length === 0 ? (
            <div className="py-16">
              <EmptyState icon={<FileSpreadsheet className="h-10 w-10" />} title="No employee accounts found" description="No account records matching your criteria." />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent border-border/50">
                    <TableHead className="w-12 text-[11px] font-medium tracking-wide text-muted-foreground">#</TableHead>
                    <TableHead className="text-[11px] font-medium tracking-wide text-muted-foreground">Employee</TableHead>
                    <TableHead className="text-[11px] font-medium tracking-wide text-muted-foreground">Designation</TableHead>
                    <TableHead className="text-[11px] font-medium tracking-wide text-muted-foreground">Monthly Base</TableHead>
                    <TableHead className="text-[11px] font-medium tracking-wide text-muted-foreground">Outstanding Advance</TableHead>
                    <TableHead className="text-[11px] font-medium tracking-wide text-muted-foreground">Last Salary Month</TableHead>
                    <TableHead className="text-[11px] font-medium tracking-wide text-muted-foreground">Net Balance Due</TableHead>
                    <TableHead className="text-right text-[11px] font-medium tracking-wide text-muted-foreground">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((acc, idx) => {
                    const roleColor = roleColors[acc.role] || 'bg-muted text-muted-foreground border-border/50';
                    return (
                      <tr key={acc.employeeId} className="group border-border/40 hover:bg-muted/30 transition-colors">
                        <TableCell className="text-muted-foreground font-mono text-xs">{idx + 1}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="relative flex h-9 w-9 items-center justify-center rounded-xl font-semibold text-[10px] border border-border/60 bg-muted/50 text-muted-foreground">
                              {acc.employeeName.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()}
                            </div>
                            <div>
                              <div className="font-semibold text-sm group-hover:text-primary transition-colors">{acc.employeeName}</div>
                              <div className="text-muted-foreground font-mono text-[10px]">{acc.employeeId}</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary" className={`text-[10px] font-medium border ${roleColor}`}>{acc.role}</Badge>
                        </TableCell>
                        <TableCell>
                          <span className="font-mono font-bold text-sm"><CurrencyDisplay amount={acc.monthlySalary} /></span>
                        </TableCell>
                        <TableCell>
                          {acc.advancesBdt > 0 ? (
                            <span className="flex items-center gap-1.5 font-semibold text-sm text-amber-600 dark:text-amber-400">
                              <AlertCircle className="h-3.5 w-3.5" />
                              <CurrencyDisplay amount={acc.advancesBdt} />
                            </span>
                          ) : (
                            <span className="text-muted-foreground text-xs">৳0</span>
                          )}
                        </TableCell>
                        <TableCell className="font-mono text-xs">{acc.lastSalaryMonth}</TableCell>
                        <TableCell>
                          <span className={cn('font-mono font-bold text-sm', acc.balanceBdt < 0 ? 'text-rose-500' : 'text-emerald-500')}>
                            <CurrencyDisplay amount={acc.balanceBdt} />
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="inline-flex">
                            <Button variant="ghost" size="sm" className="h-7 text-xs gap-1 hover:bg-primary/10 hover:text-primary" render={<Link href="/admin/hr/salaries" />}>
                              Pay <ArrowUpRight className="h-3 w-3" />
                            </Button>
                          </div>
                        </TableCell>
                      </tr>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </Card>
      </div>
    
      </PageContent>
    </div>
  );
}
