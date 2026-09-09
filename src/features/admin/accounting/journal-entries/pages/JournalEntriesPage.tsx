'use client';
import { PageHero, PageContent } from '@/components/motion/PageHero';

import { useMemo } from 'react';
import {
  FileText,
  CheckCircle2,
  Clock,
} from 'lucide-react';
import { useJournalEntries } from '../hooks/use-journal-entries';
import { PageSkeleton, EmptyState, CurrencyDisplay } from '@/components/shared';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';


export function JournalEntriesPage() {
  const { entries, isLoading, isError, refetch } = useJournalEntries();

  const stats = useMemo(() => {
    const posted = entries.filter((e) => e.status === 'posted').length;
    const draft = entries.length - posted;
    return { posted, draft };
  }, [entries]);

  if (isLoading) return <PageSkeleton variant="table" rows={8} />;

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
    <div
      className="space-y-6 w-full pb-12"
    >
      {/* Header */}
      <PageHero className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight md:text-3xl flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-primary/10 text-primary border border-primary/20">
              <FileText className="h-6 w-6" />
            </div>
            Journal Entries
          </h1>
          <p className="text-muted-foreground text-sm mt-1.5">
            Double-entry vouchers for collections, bandwidth purchases, and payroll.
          </p>
        </div>
      </PageHero>
      <PageContent className="space-y-6">

      {/* Stats */}
            <div className="flex flex-wrap gap-x-6 gap-y-2 border-y border-border/60 py-3 text-sm">
        <p>
          <span className="font-semibold tabular-nums">{entries.length}</span>{' '}
          <span className="text-muted-foreground">total entries</span>
        </p>
        <p>
          <span className="font-semibold tabular-nums">{stats.posted}</span>{' '}
          <span className="text-muted-foreground">posted</span>
        </p>
        <p>
          <span className="font-semibold tabular-nums">{stats.draft}</span>{' '}
          <span className="text-muted-foreground">draft</span>
        </p>
      </div>

      {/* Table */}
      <div>
        {entries.length === 0 ? (
          <div className="py-16">
            <EmptyState
              title="No journal entries"
              description="Create a journal entry to post transactions."
            />
          </div>
        ) : (
          <Card className="border-border/60 bg-card shadow-sm ring-1 ring-border/60 overflow-hidden">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent border-border/50">
                    <TableHead>
                      <span className="text-xs font-medium tracking-wide text-muted-foreground">Entry ID</span>
                    </TableHead>
                    <TableHead>
                      <span className="text-xs font-medium tracking-wide text-muted-foreground">Date</span>
                    </TableHead>
                    <TableHead>
                      <span className="text-xs font-medium tracking-wide text-muted-foreground">Description</span>
                    </TableHead>
                    <TableHead>
                      <span className="text-xs font-medium tracking-wide text-muted-foreground">Debit</span>
                    </TableHead>
                    <TableHead>
                      <span className="text-xs font-medium tracking-wide text-muted-foreground">Credit</span>
                    </TableHead>
                    <TableHead className="text-right">
                      <span className="text-xs font-medium tracking-wide text-muted-foreground">Status</span>
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {entries.map((entry, idx) => (
                    <tr
                      key={entry.id}
                      className="group border-border/40 hover:bg-muted/30 transition-colors"
                    >
                      <TableCell className="py-3.5">
                        <span className="font-mono text-xs font-bold px-2 py-1 rounded-md bg-primary/10 text-primary">
                          {entry.id}
                        </span>
                      </TableCell>
                      <TableCell className="py-3.5">
                        <span className="font-mono text-xs">{entry.date}</span>
                      </TableCell>
                      <TableCell className="py-3.5">
                        <span className="text-sm font-medium group-hover:text-primary transition-colors">
                          {entry.description}
                        </span>
                      </TableCell>
                      <TableCell className="py-3.5">
                        <span className="font-mono text-sm font-bold">
                          <CurrencyDisplay amount={entry.debitBdt} />
                        </span>
                      </TableCell>
                      <TableCell className="py-3.5">
                        <span className="font-mono text-sm font-bold">
                          <CurrencyDisplay amount={entry.creditBdt} />
                        </span>
                      </TableCell>
                      <TableCell className="py-3.5 text-right">
                        {entry.status === 'posted' ? (
                          <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 text-[10px] font-medium gap-1">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 inline-block" />
                            Posted
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20 text-[10px] font-medium gap-1">
                            <span className="h-1.5 w-1.5 rounded-full bg-amber-500 inline-block" />
                            Draft
                          </Badge>
                        )}
                      </TableCell>
                    </tr>
                  ))}
                </TableBody>
              </Table>
            </div>
          </Card>
        )}
      </div>
    
      </PageContent>
    </div>
  );
}
