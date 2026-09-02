'use client';

import { useJournalEntries } from '../hooks/use-journal-entries';
import { PageSkeleton, EmptyState, StatCard, CurrencyDisplay, StatusBadge } from '@/components/shared';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { FileText, CheckCircle2, Clock } from 'lucide-react';

export function JournalEntriesPage() {
  const { entries, isLoading, isError, refetch } = useJournalEntries();

  const postedCount = entries.filter((e) => e.status === 'posted').length;

  if (isLoading) return <PageSkeleton rows={8} />;

  if (isError) {
    return (
      <EmptyState
        title="Failed to load journal entries"
        description="Could not load accounting vouchers."
        actionLabel="Retry"
        onAction={() => refetch()}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Journal Entries</h1>
        <p className="text-muted-foreground text-sm">Double-entry vouchers for collections, bandwidth purchases, and payroll.</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard title="Total Entries" value={entries.length} description="All vouchers" icon={FileText} />
        <StatCard title="Posted" value={postedCount} description="Locked to ledger" icon={CheckCircle2} />
        <StatCard title="Draft" value={entries.length - postedCount} description="Pending review" icon={Clock} />
      </div>

      {entries.length === 0 ? (
        <EmptyState title="No journal entries" description="Create a journal entry to post transactions." />
      ) : (
        <div className="bg-card rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Entry ID</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Debit</TableHead>
                <TableHead>Credit</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {entries.map((entry) => (
                <TableRow key={entry.id}>
                  <TableCell className="font-mono text-xs">{entry.id}</TableCell>
                  <TableCell className="font-mono text-xs">{entry.date}</TableCell>
                  <TableCell>{entry.description}</TableCell>
                  <TableCell><CurrencyDisplay amount={entry.debitBdt} /></TableCell>
                  <TableCell><CurrencyDisplay amount={entry.creditBdt} /></TableCell>
                  <TableCell>
                    <StatusBadge status={entry.status === 'posted' ? 'active' : 'pending'} label={entry.status} />
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
