import { num, str } from '@/lib/api/case';

/**
 * Purchase backend (zapi, menu `inventory_purchess`):
 * - `/v1/requisitions`   — PENDING requisitions; approving moves the document to purchase bills
 * - `/v1/purchase-bills` — approved purchases + vendor payments
 * Both share the same document ("Doc") shape, addressed by the string `requisition_id`.
 */

type Raw = Record<string, unknown>;
const obj = (v: unknown): Raw => (v && typeof v === 'object' && !Array.isArray(v) ? (v as Raw) : {});
const arr = (v: unknown): unknown[] => (Array.isArray(v) ? v : []);
const numOrNull = (v: unknown): number | null => (v === null || v === undefined || v === '' ? null : num(v));
const strOrNull = (v: unknown): string | null => (v === null || v === undefined || v === '' ? null : str(v));

export type PurchaseDocKind = 'requisition' | 'bill';

export const PURCHASE_DOC_URL: Record<PurchaseDocKind, string> = {
  requisition: '/v1/requisitions',
  bill: '/v1/purchase-bills',
};

export const purchaseKeys = {
  all: ['admin', 'purchase'] as const,
  requisitions: ['admin', 'purchase', 'requisitions'] as const,
  bills: ['admin', 'purchase', 'purchase-bills'] as const,
};

export const docKey = (kind: PurchaseDocKind) => (kind === 'bill' ? purchaseKeys.bills : purchaseKeys.requisitions);

export interface PurchaseDocLine {
  id: string;
  itemId: string;
  itemName: string;
  categoryId: string;
  category: string;
  subcategoryIndex: number | null;
  subcategory: string;
  description: string;
  qty: number;
  rate: number;
  total: number;
  unitId: string | null;
  unitName: string;
  vendorId: string | null;
  vendorName: string;
}

export interface PurchaseDoc {
  id: string;
  /** String document id used in URLs. */
  requisitionId: string;
  itemCount: number;
  itemNames: string[];
  vendors: string[];
  total: number;
  requisitionDate: string;
  requisitionBy: string;
  deadline: string;
  approvedBy: string;
  approvedDate: string;
  remarks: string;
  createdAt: string;
  status: string;
  /** Purchase bills only. */
  paidAmount: number;
  dueAmount: number;
  paymentStatus: string;
  /** Detail endpoint only. */
  lines: PurchaseDocLine[];
}

export function mapDocLine(raw: unknown): PurchaseDocLine {
  const r = obj(raw);
  return {
    id: str(r.id),
    itemId: str(r.item_id),
    itemName: str(r.item_name),
    categoryId: str(r.category_id),
    category: str(r.category),
    subcategoryIndex: numOrNull(r.subcategory_index),
    subcategory: str(r.subcategory),
    description: str(r.description),
    qty: num(r.qty),
    rate: num(r.rate),
    total: num(r.total),
    unitId: strOrNull(r.unit_id),
    unitName: str(r.unit_name),
    vendorId: strOrNull(r.vendor_id),
    vendorName: str(r.vendor_name),
  };
}

export function mapDoc(raw: unknown): PurchaseDoc {
  const r = obj(raw);
  return {
    id: str(r.id),
    requisitionId: str(r.requisition_id),
    itemCount: num(r.item_count),
    itemNames: arr(r.item_names).map((v) => str(v)).filter(Boolean),
    vendors: arr(r.vendors).map((v) => str(v)).filter(Boolean),
    total: num(r.total),
    requisitionDate: str(r.requisition_date),
    requisitionBy: str(r.requisition_by),
    deadline: str(r.deadline),
    approvedBy: str(r.approved_by),
    approvedDate: str(r.approved_date),
    remarks: str(r.remarks),
    createdAt: str(r.created_at),
    status: str(r.status),
    paidAmount: num(r.paid_amount),
    dueAmount: num(r.due_amount),
    paymentStatus: str(r.payment_status),
    lines: arr(r.lines).map(mapDocLine),
  };
}

export interface PurchaseDocTotals {
  all: number;
  today: number;
  filtered: number;
  count: number;
  /** Purchase bills only. */
  paid: number;
  due: number;
}

export function mapDocTotals(raw: unknown): PurchaseDocTotals {
  const r = obj(raw);
  return {
    all: num(r.all),
    today: num(r.today),
    filtered: num(r.filtered),
    count: num(r.count),
    paid: num(r.paid),
    due: num(r.due),
  };
}

export interface PurchaseDocLinePayload {
  id?: string | number;
  item_id: string | number | undefined;
  qty: number;
  rate: number;
  unit_id?: string | number | null;
  vendor_id?: string | number | null;
  description?: string;
}

export interface PurchaseDocPayload {
  requisition_date?: string;
  deadline?: string;
  remarks?: string;
  items: PurchaseDocLinePayload[];
}

export interface BillPayment {
  id: string;
  amount: number;
  paymentDate: string;
  paymentMethod: string;
  reference: string;
  note: string;
  createdByName: string;
  createdAt: string;
}

export interface BillPayments {
  items: BillPayment[];
  total: number;
  paidAmount: number;
  dueAmount: number;
  paymentMethods: string[];
}

export function mapBillPayments(raw: unknown): BillPayments {
  const r = obj(raw);
  return {
    items: arr(r.items).map((p) => {
      const x = obj(p);
      return {
        id: str(x.id),
        amount: num(x.amount),
        paymentDate: str(x.payment_date),
        paymentMethod: str(x.payment_method),
        reference: str(x.reference),
        note: str(x.note),
        createdByName: str(x.created_by_name),
        createdAt: str(x.created_at),
      };
    }),
    total: num(r.total),
    paidAmount: num(r.paid_amount),
    dueAmount: num(r.due_amount),
    paymentMethods: arr(r.payment_methods).map((v) => str(v)).filter(Boolean),
  };
}

export interface BillPaymentPayload {
  amount: number;
  payment_date?: string;
  payment_method: string;
  reference?: string;
  note?: string;
}
