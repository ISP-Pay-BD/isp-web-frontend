'use client';

import { useState, useMemo } from 'react';
import { useAdvanceSalary } from '../hooks/use-advance-salary';
import { PageSkeleton, EmptyState, StatCard, StatusBadge, CurrencyDisplay, Can } from '@/components/shared';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { HandCoins, Plus, Check, X, Search, Clock, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

export function AdvanceSalaryPage() {
  const { requests, employees, isLoading, isError, refetch, grantAdvance, updateStatus } = useAdvanceSalary();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Grant modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedEmpId, setSelectedEmpId] = useState('');
  const [grantAmount, setGrantAmount] = useState(5000);
  const [deductMonth, setDeductMonth] = useState('2026-09');
  const [grantReason, setGrantReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const filteredRequests = useMemo(() => {
    return requests.filter((r) => {
      const matchesSearch =
        r.employeeName.toLowerCase().includes(search.toLowerCase()) ||
        r.reason.toLowerCase().includes(search.toLowerCase());
      const matchesStatus = statusFilter === 'all' || r.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [requests, search, statusFilter]);

  const totalAdvanceApproved = useMemo(() => {
    return requests
      .filter((r) => r.status === 'approved')
      .reduce((sum, r) => sum + (r.amountBdt || 0), 0);
  }, [requests]);

  const handleGrantAdvance = async () => {
    if (!selectedEmpId) {
      toast.error('Please select an employee');
      return;
    }
    if (grantAmount <= 0) {
      toast.error('Enter a valid amount');
      return;
    }

    try {
      setIsSubmitting(true);
      const emp = employees.find((e) => e.id === selectedEmpId);
      await grantAdvance({
        employeeId: selectedEmpId,
        employeeName: emp?.name ?? 'Staff Member',
        amountBdt: grantAmount,
        deductMonth,
        reason: grantReason || 'Staff emergency request',
      });
      toast.success('Advance granted and recorded');
      setModalOpen(false);
      setSelectedEmpId('');
      setGrantReason('');
    } catch {
      toast.error('Failed to grant advance');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateStatus = async (id: string, status: 'approved' | 'rejected') => {
    try {
      await updateStatus({ id, status });
      toast.success(`Advance request ${status}`);
    } catch {
      toast.error('Failed to update request');
    }
  };

  if (isLoading) {
    return <PageSkeleton rows={8} />;
  }

  if (isError) {
    return (
      <div className="p-6">
        <EmptyState
          title="Failed to load advance salary requests"
          description="Could not communicate with the employee advance ledger."
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
          <h1 className="text-2xl font-bold tracking-tight">Advance Salary Management</h1>
          <p className="text-muted-foreground text-sm">
            Review staff advance requests, disburse emergency salary advances, and set deduction schedules.
          </p>
        </div>
        <Can menu="advance_salary" action="create">
          <Button onClick={() => setModalOpen(true)} className="bg-primary hover:bg-primary/90">
            <Plus className="mr-2 h-4 w-4" />
            Give Advance
          </Button>
        </Can>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard
          title="Total Approved Advance"
          value={<CurrencyDisplay amount={totalAdvanceApproved} />}
          description="Awaiting salary deduction"
          icon={HandCoins}
        />
        <StatCard
          title="Pending Requests"
          value={requests.filter((r) => r.status === 'pending').length}
          description="Requires admin approval"
          icon={Clock}
        />
        <StatCard
          title="Resolved Records"
          value={requests.filter((r) => r.status === 'approved' || r.status === 'rejected').length}
          description="Approved or rejected"
          icon={CheckCircle}
        />
      </div>

      {/* Filter Bar */}
      <div className="bg-card flex flex-col gap-3 rounded-lg border p-4 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="text-muted-foreground absolute top-2.5 left-2.5 h-4 w-4" />
          <Input
            placeholder="Search by staff name or reason..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8"
          />
        </div>
        <div className="flex items-center gap-2">
          <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v ?? 'all')}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="All Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Table */}
      {filteredRequests.length === 0 ? (
        <EmptyState
          icon={<HandCoins className="h-10 w-10" />}
          title="No advance requests found"
          description="No records matching your search or filters."
          actionLabel="Give Advance"
          onAction={() => setModalOpen(true)}
        />
      ) : (
        <div className="bg-card rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">#</TableHead>
                <TableHead>Staff Member</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Reason / Notes</TableHead>
                <TableHead>Requested Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRequests.map((req, idx) => (
                <TableRow key={req.id}>
                  <TableCell className="text-muted-foreground font-mono text-xs">{idx + 1}</TableCell>
                  <TableCell className="font-medium">{req.employeeName}</TableCell>
                  <TableCell>
                    <CurrencyDisplay amount={req.amountBdt} className="font-semibold text-amber-600 dark:text-amber-400" />
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">{req.reason}</TableCell>
                  <TableCell className="font-mono text-xs">{req.requestedAt}</TableCell>
                  <TableCell>
                    <StatusBadge
                      status={req.status === 'approved' ? 'paid' : req.status === 'pending' ? 'pending' : 'expired'}
                      label={req.status}
                    />
                  </TableCell>
                  <TableCell className="text-right">
                    {req.status === 'pending' ? (
                      <div className="flex items-center justify-end gap-1">
                        <Can menu="advance_salary" action="update">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-emerald-600 hover:text-emerald-700"
                            onClick={() => handleUpdateStatus(req.id, 'approved')}
                          >
                            <Check className="mr-1 h-3.5 w-3.5" />
                            Approve
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-destructive hover:text-destructive"
                            onClick={() => handleUpdateStatus(req.id, 'rejected')}
                          >
                            <X className="mr-1 h-3.5 w-3.5" />
                            Reject
                          </Button>
                        </Can>
                      </div>
                    ) : (
                      <span className="text-muted-foreground text-xs font-mono">Processed</span>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Grant Modal */}
      {modalOpen && (
        <Dialog open={modalOpen} onOpenChange={setModalOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Grant Advance Salary</DialogTitle>
              <DialogDescription>
                Provide upfront advance funds directly to the employee. This amount will be deducted during monthly payroll.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-2">
              <div className="space-y-1.5">
                <Label htmlFor="employee">Select Staff Member *</Label>
                <Select value={selectedEmpId} onValueChange={(v) => setSelectedEmpId(v ?? '')}>
                  <SelectTrigger id="employee">
                    <SelectValue placeholder="Choose employee" />
                  </SelectTrigger>
                  <SelectContent>
                    {employees.map((e) => (
                      <SelectItem key={e.id} value={e.id}>
                        {e.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="amount">Advance Amount (৳) *</Label>
                  <Input
                    id="amount"
                    type="number"
                    step="500"
                    value={grantAmount}
                    onChange={(e) => setGrantAmount(Number(e.target.value))}
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="deductMonth">Deduct In Month</Label>
                  <Input
                    id="deductMonth"
                    placeholder="YYYY-MM"
                    value={deductMonth}
                    onChange={(e) => setDeductMonth(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="reason">Reason / Emergency Note</Label>
                <Textarea
                  id="reason"
                  rows={2}
                  placeholder="e.g. Medical bill, Family emergency"
                  value={grantReason}
                  onChange={(e) => setGrantReason(e.target.value)}
                />
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setModalOpen(false)} disabled={isSubmitting}>
                Cancel
              </Button>
              <Button onClick={handleGrantAdvance} className="bg-primary hover:bg-primary/90" disabled={isSubmitting}>
                {isSubmitting ? 'Granting...' : 'Grant Advance'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
