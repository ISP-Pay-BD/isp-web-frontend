import { num, str } from '@/lib/api/case';

/**
 * Bandwidth buy & sell — UI types mapped 1:1 from the zapi payloads
 * (zapi/Modules/Reseller/Bandwidth + the Inventory catalogue/lookup bases).
 * All snake_case → camelCase conversion happens in the mappers below.
 */

type Raw = Record<string, unknown>;
const obj = (v: unknown): Raw => (v && typeof v === 'object' ? (v as Raw) : {});
const list = (v: unknown): unknown[] => (Array.isArray(v) ? v : []);
const optNum = (v: unknown): number | null => (v === null || v === undefined || v === '' ? null : num(v));
/** Y-m-d part of a date/datetime; legacy zero dates become ''. */
const day = (v: unknown): string => {
  const s = str(v).slice(0, 10);
  return s.startsWith('0000') ? '' : s;
};

export type ActiveStatus = 'active' | 'inactive';
const activeStatus = (v: unknown): ActiveStatus => (str(v).toLowerCase() === 'inactive' ? 'inactive' : 'active');

/* ------------------------------------------------------------ catalogue */

export interface BandwidthSubcategory {
  index: number;
  name: string;
  status: ActiveStatus;
  shortDescription: string;
  itemCount: number;
}

/** GET /v1/bandwidth/categories — one row per top-level category with its sub-categories. */
export interface BandwidthCategory {
  id: number;
  name: string;
  status: ActiveStatus;
  shortDescription: string;
  itemCount: number;
  subcategories: BandwidthSubcategory[];
}

export function mapCategory(raw: unknown): BandwidthCategory {
  const r = obj(raw);
  return {
    id: num(r.id),
    name: str(r.name),
    status: activeStatus(r.status),
    shortDescription: str(r.short_description),
    itemCount: num(r.item_count),
    subcategories: list(r.subcategories).map((s) => {
      const x = obj(s);
      return {
        index: num(x.index),
        name: str(x.name),
        status: activeStatus(x.status),
        shortDescription: str(x.short_description),
        itemCount: num(x.item_count),
      };
    }),
  };
}

/** GET /v1/bandwidth/items — id is the catalogue key "{categoryId}-{m|subIndex}-{index}". */
export interface BandwidthCatalogItem {
  id: string;
  itemName: string;
  categoryId: number;
  category: string;
  subcategoryIndex: number | null;
  subcategory: string;
  unitPrice: number;
  vat: number;
  status: ActiveStatus;
  description: string;
}

export function mapCatalogItem(raw: unknown): BandwidthCatalogItem {
  const r = obj(raw);
  return {
    id: str(r.id),
    itemName: str(r.item_name),
    categoryId: num(r.category_id),
    category: str(r.category),
    subcategoryIndex: optNum(r.subcategory_index),
    subcategory: str(r.subcategory),
    unitPrice: num(r.unit_price),
    vat: num(r.vat),
    status: activeStatus(r.status),
    description: str(r.description),
  };
}

/* ------------------------------------------------------------ providers */

/** GET /v1/bandwidth/providers (TenantLookupService `providers`). */
export interface BandwidthProvider {
  id: number;
  companyName: string;
  contactPerson: string;
  email: string;
  phoneNumber: string;
  mobileNumber: string;
  facebookUrl: string;
  skypeId: string;
  website: string;
  address: string;
  imageUrl: string;
  createdAt: string;
}

export function mapProvider(raw: unknown): BandwidthProvider {
  const r = obj(raw);
  return {
    id: num(r.id),
    companyName: str(r.company_name),
    contactPerson: str(r.contact_person),
    email: str(r.email),
    phoneNumber: str(r.phone_number),
    mobileNumber: str(r.mobile_number),
    facebookUrl: str(r.facebook_url),
    skypeId: str(r.skype_id),
    website: str(r.website),
    address: str(r.address),
    imageUrl: str(r.image_url),
    createdAt: str(r.created_at),
  };
}

/* ------------------------------------------------------- purchase bills */

/** BandwidthPurchaseBillService::PAYMENT_METHODS (validator in_list). */
export const PURCHASE_PAYMENT_METHODS = ['Cash', 'bKash', 'Nagad', 'Rocket', 'Upay', 'Bank Transfer', 'SSLCommerz', 'Cheque'] as const;

export interface PurchaseBillLine {
  itemId: string;
  item: string;
  description: string;
  unit: string;
  qty: number;
  rate: number;
  vat: number;
  fromDate: string;
  toDate: string;
  total: number;
}

/** GET /v1/bandwidth/purchase-bills — total includes per-line VAT; due = max(0, total − paid − discount). */
export interface BandwidthPurchaseBill {
  id: number;
  providerId: number;
  providerName: string;
  invoiceNumber: string;
  billingDate: string;
  paymentStatus: 'Paid' | 'Due';
  total: number;
  paid: number;
  discount: number;
  due: number;
  paymentMethod: string;
  paidBy: string;
  receivedBy: string;
  remarks: string;
  items: PurchaseBillLine[];
  imageUrl: string;
  createdAt: string;
}

export function mapPurchaseBill(raw: unknown): BandwidthPurchaseBill {
  const r = obj(raw);
  return {
    id: num(r.id),
    providerId: num(r.provider_id),
    providerName: str(r.provider_name),
    invoiceNumber: str(r.invoice_number),
    billingDate: str(r.billing_date),
    paymentStatus: str(r.payment_status) === 'Paid' ? 'Paid' : 'Due',
    total: num(r.total),
    paid: num(r.paid),
    discount: num(r.discount),
    due: num(r.due),
    paymentMethod: str(r.payment_method),
    paidBy: str(r.paid_by),
    receivedBy: str(r.received_by),
    remarks: str(r.remarks),
    items: list(r.items).map((l) => {
      const x = obj(l);
      return {
        itemId: str(x.item_id),
        item: str(x.item),
        description: str(x.description),
        unit: str(x.unit),
        qty: num(x.qty),
        rate: num(x.rate),
        vat: num(x.vat),
        fromDate: str(x.from_date),
        toDate: str(x.to_date),
        total: num(x.total),
      };
    }),
    imageUrl: str(r.image_url),
    createdAt: str(r.created_at),
  };
}

export interface PurchaseBillTotals {
  total: number;
  paid: number;
  due: number;
  count: number;
  dueCount: number;
}

export function mapPurchaseBillTotals(raw: unknown): PurchaseBillTotals {
  const r = obj(raw);
  return { total: num(r.total), paid: num(r.paid), due: num(r.due), count: num(r.count), dueCount: num(r.due_count) };
}

/* --------------------------------------------------------- sell clients */

export interface ClientVlan {
  name: string;
  ip: string;
}

/** GET /v1/bandwidth/clients (bandwidth_sell_client row minus password). */
export interface BandwidthSellClient {
  id: number;
  customerName: string;
  customerCode: string;
  contactPerson: string;
  email: string;
  mobileNumber: string;
  phoneNumber: string;
  popStatus: ActiveStatus;
  referenceBy: string;
  address: string;
  nttnInfo: string;
  scrId: string;
  activationDate: string;
  popName: string;
  username: string;
  vlans: ClientVlan[];
  ips: string[];
  createdAt: string;
}

export function mapSellClient(raw: unknown): BandwidthSellClient {
  const r = obj(raw);
  return {
    id: num(r.id),
    customerName: str(r.customer_name),
    customerCode: str(r.customer_code),
    contactPerson: str(r.contact_person),
    email: str(r.email),
    mobileNumber: str(r.mobile_number),
    phoneNumber: str(r.phone_number),
    popStatus: activeStatus(r.pop_status),
    referenceBy: str(r.reference_by),
    address: str(r.address),
    nttnInfo: str(r.nttn_info),
    scrId: str(r.scr_id),
    activationDate: day(r.activation_date),
    popName: str(r.pop_name),
    username: str(r.username),
    vlans: list(r.vlans).map((v) => ({ name: str(obj(v).name), ip: str(obj(v).ip) })),
    ips: list(r.ips).map((v) => str(v)).filter(Boolean),
    createdAt: str(r.created_at),
  };
}

/* ------------------------------------------------------- sell invoices */

/** LineGroupService::PAYMENT_METHODS (validator in_list) with display labels. */
export const SELL_PAYMENT_METHODS: { value: string; label: string }[] = [
  { value: 'cash', label: 'Cash' },
  { value: 'bkash', label: 'bKash' },
  { value: 'nagad', label: 'Nagad' },
  { value: 'rocket', label: 'Rocket' },
  { value: 'upay', label: 'Upay' },
  { value: 'sslcommerz', label: 'SSLCommerz' },
  { value: 'bank_transfer', label: 'Bank Transfer' },
  { value: 'cheque', label: 'Cheque' },
];

export type SellStatus = 'paid' | 'due';
const sellStatus = (v: unknown): SellStatus => (str(v).toLowerCase() === 'paid' ? 'paid' : 'due');

export interface SellInvoiceLine {
  id: number;
  itemId: string;
  itemName: string;
  category: string;
  subcategory: string;
  description: string;
  qty: number;
  rate: number;
  total: number;
  fromDate: string;
  toDate: string;
}

/** GET /v1/bandwidth/invoices (grouped document); `lines` only on the detail endpoint. */
export interface BandwidthInvoice {
  id: number;
  requisitionId: string;
  clientId: number | null;
  clientName: string;
  itemCount: number;
  itemNames: string[];
  total: number;
  receivedAmount: number;
  discount: number;
  due: number;
  status: SellStatus;
  requisitionDate: string;
  requisitionBy: string;
  deadline: string;
  remarks: string;
  paymentDate: string;
  paymentMethod: string;
  paidBy: string;
  receivedBy: string;
  createdAt: string;
  lines: SellInvoiceLine[];
}

export function mapInvoice(raw: unknown): BandwidthInvoice {
  const r = obj(raw);
  return {
    id: num(r.id),
    requisitionId: str(r.requisition_id),
    clientId: optNum(r.client_id),
    clientName: str(r.client_name),
    itemCount: num(r.item_count),
    itemNames: list(r.item_names).map((v) => str(v)).filter(Boolean),
    total: num(r.total),
    receivedAmount: num(r.received_amount),
    discount: num(r.discount),
    due: num(r.due),
    status: sellStatus(r.status),
    requisitionDate: day(r.requisition_date),
    requisitionBy: str(r.requisition_by),
    deadline: day(r.deadline),
    remarks: str(r.remarks),
    paymentDate: day(r.payment_date),
    paymentMethod: str(r.payment_method),
    paidBy: str(r.paid_by),
    receivedBy: str(r.received_by),
    createdAt: str(r.created_at),
    lines: list(r.lines).map((l) => {
      const x = obj(l);
      return {
        id: num(x.id),
        itemId: str(x.item_id),
        itemName: str(x.item_name),
        category: str(x.category),
        subcategory: str(x.subcategory),
        description: str(x.description),
        qty: num(x.qty),
        rate: num(x.rate),
        total: num(x.total),
        fromDate: day(x.from_date),
        toDate: day(x.to_date),
      };
    }),
  };
}

/** `totals` of GET /v1/bandwidth/invoices: all-time, today, and the filtered set (count/received/due). */
export interface InvoiceTotals {
  all: number;
  today: number;
  filtered: number;
  count: number;
  received: number;
  due: number;
}

export function mapInvoiceTotals(raw: unknown): InvoiceTotals {
  const r = obj(raw);
  return {
    all: num(r.all),
    today: num(r.today),
    filtered: num(r.filtered),
    count: num(r.count),
    received: num(r.received),
    due: num(r.due),
  };
}

/* ---------------------------------------------------------- daily bill */

/** GET /v1/bandwidth/daily-bill — one sell invoice of the window with its client's contact columns. */
export interface DailyBillRow {
  id: number;
  requisitionId: string;
  requisitionDate: string;
  clientId: number | null;
  clientName: string;
  contactPerson: string;
  mobileNumber: string;
  phoneNumber: string;
  itemCount: number;
  itemNames: string[];
  fromDate: string;
  toDate: string;
  total: number;
  receivedAmount: number;
  discount: number;
  due: number;
  status: SellStatus;
  paymentDate: string;
  paymentMethod: string;
  paidBy: string;
  receivedBy: string;
  createdBy: string;
  createdAt: string;
  remarks: string;
}

export function mapDailyBill(raw: unknown): DailyBillRow {
  const r = obj(raw);
  return {
    id: num(r.id),
    requisitionId: str(r.requisition_id),
    requisitionDate: day(r.requisition_date),
    clientId: optNum(r.client_id),
    clientName: str(r.client_name),
    contactPerson: str(r.contact_person),
    mobileNumber: str(r.mobile_number),
    phoneNumber: str(r.phone_number),
    itemCount: num(r.item_count),
    itemNames: list(r.item_names).map((v) => str(v)).filter(Boolean),
    fromDate: day(r.from_date),
    toDate: day(r.to_date),
    total: num(r.total),
    receivedAmount: num(r.received_amount),
    discount: num(r.discount),
    due: num(r.due),
    status: sellStatus(r.status),
    paymentDate: day(r.payment_date),
    paymentMethod: str(r.payment_method),
    paidBy: str(r.paid_by),
    receivedBy: str(r.received_by),
    createdBy: str(r.created_by),
    createdAt: str(r.created_at),
    remarks: str(r.remarks),
  };
}

export interface DailyBillTotals {
  count: number;
  total: number;
  received: number;
  discount: number;
  due: number;
}

export function mapDailyBillTotals(raw: unknown): DailyBillTotals {
  const r = obj(raw);
  return { count: num(r.count), total: num(r.total), received: num(r.received), discount: num(r.discount), due: num(r.due) };
}

/** Anything a sell payment dialog needs (invoice list row or daily-bill row). */
export interface PayableInvoice {
  requisitionId: string;
  clientName: string;
  total: number;
  receivedAmount: number;
  discount: number;
  paymentMethod: string;
  paidBy: string;
  receivedBy: string;
  remarks: string;
}
