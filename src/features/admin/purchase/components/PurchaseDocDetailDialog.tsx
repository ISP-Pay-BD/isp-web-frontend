'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { CreditCard, FileText, Receipt, XCircle } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Can, ConfirmDialog, EmptyState, TableSkeleton } from '@/components/shared';
import { formatBdtWithSymbol } from '@/lib/format/currency';
import { errorMessage } from '@/lib/api/utils/error-handler';
import { fmtDateTime } from '@/features/admin/inventory/shared/form-utils';
import type { BillPayment, PurchaseDoc, PurchaseDocKind } from '../api';
import { usePurchaseDoc } from '../hooks/use-purchase-docs';
import { useBillPayments, useVoidBillPayment } from '../hooks/use-purchase-bills';
import { PaymentStatusBadge } from './PaymentStatusBadge';
import { RecordPaymentDialog } from './RecordPaymentDialog';

const MENU = 'inventory_purchess';
const LABEL: Record<PurchaseDocKind, string> = { requisition: 'Requisition', bill: 'Purchase Bill' };

interface PurchaseDocDetailDialogProps {
  kind: PurchaseDocKind;
  /** requisition_id; null = closed. */
  docId: string | null;
  onOpenChange: (open: boolean) => void;
}

/** View a requisition / purchase bill with its lines (and, for bills, the payment history). */
export function PurchaseDocDetailDialog({ kind, docId, onOpenChange }: PurchaseDocDetailDialogProps) {
  return (
    <Dialog open={docId !== null} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-4xl">
        {docId ? <DetailBody kind={kind} rid={docId} onClose={() => onOpenChange(false)} /> : null}
      </DialogContent>
    </Dialog>
  );
}

function DetailBody({ kind, rid, onClose }: { kind: PurchaseDocKind; rid: string; onClose: () => void }) {
  const detail = usePurchaseDoc(kind, rid);
  const Icon = kind === 'bill' ? Receipt : FileText;

  return (
    <>
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2">
          <Icon className="h-5 w-5 text-primary" />
          {LABEL[kind]} {rid}
          {detail.data && kind === 'bill' ? <PaymentStatusBadge status={detail.data.paymentStatus} /> : null}
        </DialogTitle>
        <DialogDescription>
          {kind === 'bill' ? 'Approved purchase — lines and vendor payments.' : 'Pending requisition — awaiting approval.'}
        </DialogDescription>
      </DialogHeader>

      <div className="max-h-[65vh] space-y-5 overflow-y-auto py-2 pr-1">
        {detail.isLoading ? (
          <TableSkeleton rows={4} />
        ) : detail.isError || !detail.data ? (
          <EmptyState
            title={`Failed to load ${LABEL[kind].toLowerCase()}`}
            description={errorMessage(detail.error)}
            actionLabel="Retry"
            onAction={() => detail.refetch()}
          />
        ) : (
          <>
            <DocSummary doc={detail.data} kind={kind} />
            <LinesTable doc={detail.data} />
            {kind === 'bill' ? <PaymentsSection rid={rid} /> : null}
          </>
        )}
      </div>

      <DialogFooter>
        <Button type="button" variant="outline" onClick={onClose}>
          Close
        </Button>
      </DialogFooter>
    </>
  );
}

function DocSummary({ doc, kind }: { doc: PurchaseDoc; kind: PurchaseDocKind }) {
  const facts: Array<[string, string]> = [
    [kind === 'bill' ? 'Bill date' : 'Requisition date', doc.requisitionDate || '—'],
    ['Deadline', doc.deadline || '—'],
    ['Requested by', doc.requisitionBy || '—'],
  ];
  if (kind === 'bill') facts.push(['Approved by', [doc.approvedBy, doc.approvedDate].filter(Boolean).join(' · ') || '—']);
  facts.push(['Total', formatBdtWithSymbol(doc.total)]);
  if (kind === 'bill') {
    facts.push(['Paid', formatBdtWithSymbol(doc.paidAmount)]);
    facts.push(['Due', formatBdtWithSymbol(doc.dueAmount)]);
  }

  return (
    <div className="space-y-3">
      <dl className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {facts.map(([label, value]) => (
          <div key={label} className="rounded-lg border border-border/60 bg-card/60 px-3 py-2">
            <dt className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">{label}</dt>
            <dd className="mt-0.5 text-sm font-semibold tabular-nums text-foreground">{value}</dd>
          </div>
        ))}
      </dl>
      {doc.remarks ? (
        <p className="rounded-lg border border-border/60 bg-muted/30 px-3 py-2 text-sm text-muted-foreground">
          <span className="font-medium text-foreground">Remarks: </span>
          {doc.remarks}
        </p>
      ) : null}
    </div>
  );
}

function LinesTable({ doc }: { doc: PurchaseDoc }) {
  return (
    <div className="overflow-hidden rounded-xl border border-border/70">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/40 hover:bg-muted/40">
            <TableHead className="text-[11px] uppercase">Item</TableHead>
            <TableHead className="text-[11px] uppercase">Unit</TableHead>
            <TableHead className="text-[11px] uppercase">Vendor</TableHead>
            <TableHead className="text-right text-[11px] uppercase">Qty</TableHead>
            <TableHead className="text-right text-[11px] uppercase">Rate</TableHead>
            <TableHead className="text-right text-[11px] uppercase">Total</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {doc.lines.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="py-6 text-center text-sm text-muted-foreground">
                No lines.
              </TableCell>
            </TableRow>
          ) : (
            doc.lines.map((l) => (
              <TableRow key={l.id || `${l.itemId}-${l.qty}`}>
                <TableCell>
                  <span className="text-sm font-medium text-foreground">{l.itemName || '—'}</span>
                  <p className="text-xs text-muted-foreground">
                    {[l.category, l.subcategory].filter(Boolean).join(' / ')}
                    {l.description ? ` · ${l.description}` : ''}
                  </p>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">{l.unitName || '—'}</TableCell>
                <TableCell className="text-sm text-muted-foreground">{l.vendorName || '—'}</TableCell>
                <TableCell className="text-right text-sm tabular-nums">{l.qty}</TableCell>
                <TableCell className="text-right text-sm tabular-nums">{formatBdtWithSymbol(l.rate)}</TableCell>
                <TableCell className="text-right text-sm font-semibold tabular-nums">{formatBdtWithSymbol(l.total)}</TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}

function PaymentsSection({ rid }: { rid: string }) {
  const payments = useBillPayments(rid);
  const voidPayment = useVoidBillPayment();
  const [paying, setPaying] = useState(false);
  const [voiding, setVoiding] = useState<BillPayment | null>(null);
  const info = payments.data;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-semibold text-foreground">Payment History</h4>
        {info && info.dueAmount > 0 ? (
          <Can menu={MENU} action="create">
            <Button type="button" size="sm" className="h-8" onClick={() => setPaying(true)}>
              <CreditCard className="mr-1.5 h-3.5 w-3.5" />
              Record Payment
            </Button>
          </Can>
        ) : null}
      </div>

      {payments.isLoading ? (
        <TableSkeleton rows={2} />
      ) : payments.isError || !info ? (
        <EmptyState
          title="Failed to load payments"
          description={errorMessage(payments.error)}
          actionLabel="Retry"
          onAction={() => payments.refetch()}
        />
      ) : (
        <div className="overflow-hidden rounded-xl border border-border/70">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/40 hover:bg-muted/40">
                <TableHead className="text-[11px] uppercase">Date</TableHead>
                <TableHead className="text-[11px] uppercase">Method</TableHead>
                <TableHead className="text-[11px] uppercase">Reference / Note</TableHead>
                <TableHead className="text-[11px] uppercase">By</TableHead>
                <TableHead className="text-right text-[11px] uppercase">Amount</TableHead>
                <TableHead className="w-10" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {info.items.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="py-6 text-center text-sm text-muted-foreground">
                    No payments recorded yet.
                  </TableCell>
                </TableRow>
              ) : (
                info.items.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell className="font-mono text-xs">{p.paymentDate || fmtDateTime(p.createdAt)}</TableCell>
                    <TableCell className="text-sm">{p.paymentMethod || '—'}</TableCell>
                    <TableCell className="text-xs">
                      {p.reference || '—'}
                      {p.note ? <p className="text-muted-foreground">{p.note}</p> : null}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">{p.createdByName || '—'}</TableCell>
                    <TableCell className="text-right text-sm font-semibold tabular-nums text-emerald-600 dark:text-emerald-400">
                      {formatBdtWithSymbol(p.amount)}
                    </TableCell>
                    <TableCell className="text-right">
                      <Can menu={MENU} action="delete">
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="h-7 w-7 p-0 text-rose-500 hover:text-rose-500"
                          aria-label="Void payment"
                          onClick={() => setVoiding(p)}
                        >
                          <XCircle className="h-3.5 w-3.5" />
                        </Button>
                      </Can>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
          <div className="flex justify-end gap-4 border-t border-border/60 bg-muted/20 px-4 py-2 text-xs">
            <span>
              Paid <span className="font-semibold tabular-nums text-foreground">{formatBdtWithSymbol(info.paidAmount)}</span>
            </span>
            <span>
              Due <span className="font-semibold tabular-nums text-rose-600 dark:text-rose-400">{formatBdtWithSymbol(info.dueAmount)}</span>
            </span>
          </div>
        </div>
      )}

      <RecordPaymentDialog rid={paying ? rid : null} onOpenChange={(o) => !o && setPaying(false)} />

      <ConfirmDialog
        open={voiding !== null}
        onOpenChange={(o) => !o && setVoiding(null)}
        title="Void this payment?"
        description={
          voiding ? `${formatBdtWithSymbol(voiding.amount)} paid on ${voiding.paymentDate || voiding.createdAt} will be voided.` : undefined
        }
        confirmLabel="Void Payment"
        destructive
        onConfirm={() => {
          if (!voiding) return;
          const target = voiding;
          voidPayment.mutate(
            { rid, paymentId: target.id },
            { onSuccess: () => toast.success(`Payment of ${formatBdtWithSymbol(target.amount)} voided`) },
          );
          setVoiding(null);
        }}
      />
    </div>
  );
}
