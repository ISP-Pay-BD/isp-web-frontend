'use client';

import { formatDateTime } from '@/lib/format';
import { methodLabel } from '../lib/mappers';
import type { PaymentReceipt } from '../types';

const STATUS_LABEL: Record<PaymentReceipt['status'], string> = {
  completed: 'PAID',
  pending: 'PENDING',
  failed: 'FAILED',
};

/**
 * A4 money receipt / invoice built only from the receipt endpoint
 * (issuer header = tenant branding settings). Hidden on screen unless
 * `onScreen`; when printing, everything else on the page is hidden.
 */
export function PaymentReceiptA4({ receipt, onScreen = false }: { receipt: PaymentReceipt; onScreen?: boolean }) {
  const { issuer, customer } = receipt;
  const when = receipt.paidAt ?? receipt.createdAt;
  const description =
    receipt.userType === 'user' && customer?.packageName
      ? `Internet service — ${customer.packageName}`
      : receipt.comment || (customer?.packageName ? `Plan — ${customer.packageName}` : 'Payment');

  return (
    <>
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #payment-receipt-a4,
          #payment-receipt-a4 * {
            visibility: visible;
          }
          #payment-receipt-a4 {
            display: block !important;
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
        }
      `}</style>
      <div
        id="payment-receipt-a4"
        className={`${onScreen ? 'block rounded-xl border border-border/60 shadow-sm' : 'hidden'} print:block text-black bg-white p-8 max-w-[210mm] mx-auto font-sans`}
      >
        <div className="flex justify-between items-start border-b-2 border-black pb-4 gap-6">
          <div className="min-w-0">
            {issuer.name ? <h1 className="text-2xl font-black uppercase tracking-tight text-black">{issuer.name}</h1> : null}
            {issuer.slogan ? <p className="text-xs text-gray-700 font-medium">{issuer.slogan}</p> : null}
            {issuer.address ? <p className="text-[11px] text-gray-600 mt-1">{issuer.address}</p> : null}
            {issuer.phone || issuer.email ? (
              <p className="text-[11px] text-gray-600">
                {[issuer.phone && `Tel: ${issuer.phone}`, issuer.email && `Email: ${issuer.email}`].filter(Boolean).join(' · ')}
              </p>
            ) : null}
          </div>
          <div className="text-right border-2 border-black p-3 rounded bg-gray-50 min-w-[190px]">
            <div className="text-[11px] font-bold uppercase tracking-wider text-gray-800 border-b border-black pb-1 mb-1">
              Money receipt / Invoice
            </div>
            <div className="text-sm font-mono font-black">{receipt.invoiceNo}</div>
            {when ? <div className="text-[10px] text-gray-600 mt-1">Date: {formatDateTime(when)}</div> : null}
            <div className="text-[10px] text-gray-600 font-bold uppercase">Status: {STATUS_LABEL[receipt.status]}</div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 my-4 p-3 border border-black rounded text-xs bg-gray-50/50">
          <div>
            <div className="font-bold text-gray-700 uppercase text-[10px] tracking-wider mb-1">Bill to</div>
            <div className="font-black text-sm text-black">{customer?.name || '—'}</div>
            {customer ? (
              <>
                <div className="font-mono text-gray-800 mt-0.5">
                  Customer ID: <strong>{customer.code || customer.id}</strong>
                </div>
                {customer.mobile ? <div className="text-gray-700 mt-0.5">Mobile: {customer.mobile}</div> : null}
                {customer.address ? <div className="text-gray-700 mt-0.5">{customer.address}</div> : null}
                {customer.areaName ? <div className="text-gray-700 mt-0.5">Area: {customer.areaName}</div> : null}
              </>
            ) : null}
          </div>
          <div className="text-right">
            <div className="font-bold text-gray-700 uppercase text-[10px] tracking-wider mb-1">Settlement</div>
            <div className="font-mono font-bold text-black uppercase">Method: {methodLabel(receipt)}</div>
            {receipt.trxId ? <div className="font-mono text-gray-800 mt-0.5">TrxID / Ref: {receipt.trxId}</div> : null}
            {receipt.paidAt ? <div className="text-gray-700 mt-0.5">Paid: {formatDateTime(receipt.paidAt)}</div> : null}
            {receipt.collector ? <div className="text-gray-700 mt-0.5">Collected by: {receipt.collector}</div> : null}
          </div>
        </div>

        <table className="w-full text-xs border-collapse border border-black my-5">
          <thead>
            <tr className="bg-gray-100 border-b border-black text-black">
              <th className="border border-black p-2 text-center w-12 font-bold">SL</th>
              <th className="border border-black p-2 text-left font-bold">Description</th>
              <th className="border border-black p-2 text-center w-28 font-bold">Billing month</th>
              <th className="border border-black p-2 text-right w-32 font-bold">Amount (BDT)</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="border border-black p-2.5 text-center font-mono font-bold">01</td>
              <td className="border border-black p-2.5 font-bold text-black">{description}</td>
              <td className="border border-black p-2.5 text-center font-mono">{receipt.billingMonth || '—'}</td>
              <td className="border border-black p-2.5 text-right font-mono font-bold">৳{receipt.amountBdt.toFixed(2)}</td>
            </tr>
          </tbody>
          <tfoot>
            <tr className="bg-gray-100 font-black text-sm">
              <td colSpan={3} className="border border-black p-2 text-right">
                {receipt.status === 'completed' ? 'Total paid' : 'Amount due'}
              </td>
              <td className="border border-black p-2 text-right font-mono text-base">৳{receipt.amountBdt.toFixed(2)}</td>
            </tr>
          </tfoot>
        </table>

        <div className="mt-16 pt-6 grid grid-cols-2 gap-12 text-xs">
          <div className="text-center">
            <div className="border-t border-black pt-1.5 font-bold uppercase tracking-wider text-[11px]">Customer signature</div>
          </div>
          <div className="text-center">
            <div className="border-t border-black pt-1.5 font-bold uppercase tracking-wider text-[11px]">Authorized signature</div>
            {issuer.name ? <div className="text-[10px] text-gray-500">{issuer.name}</div> : null}
          </div>
        </div>
        <div className="mt-8 pt-3 border-t border-gray-300 text-[9px] text-center text-gray-500">
          System generated receipt · Payment #{receipt.id}
        </div>
      </div>
    </>
  );
}
