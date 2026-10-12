import { http } from '@/lib/api/client';
import { num, str } from '@/lib/api/case';
import type { PageMeta } from '@/lib/api/types';

/**
 * Inventory backend (zapi `/api/v1/inventory/*`, menu `inventory_purchess`).
 * One mapper per row type: snake_case payload → camelCase UI type.
 */

type Raw = Record<string, unknown>;
const obj = (v: unknown): Raw => (v && typeof v === 'object' && !Array.isArray(v) ? (v as Raw) : {});
const arr = (v: unknown): unknown[] => (Array.isArray(v) ? v : []);
const numOrNull = (v: unknown): number | null => (v === null || v === undefined || v === '' ? null : num(v));
const strOrNull = (v: unknown): string | null => (v === null || v === undefined || v === '' ? null : str(v));

export const INVENTORY_URL = '/v1/inventory';

export const inventoryKeys = {
  all: ['admin', 'inventory'] as const,
  summary: ['admin', 'inventory', 'summary'] as const,
  items: ['admin', 'inventory', 'items'] as const,
  categories: ['admin', 'inventory', 'categories'] as const,
  units: ['admin', 'inventory', 'units'] as const,
  locations: ['admin', 'inventory', 'store-locations'] as const,
  suppliers: ['admin', 'inventory', 'suppliers'] as const,
  stock: ['admin', 'inventory', 'stock'] as const,
  transactions: ['admin', 'inventory', 'transactions'] as const,
  cpe: ['admin', 'inventory', 'cpe-assignments'] as const,
  customerOptions: ['admin', 'inventory', 'customer-options'] as const,
};

export interface Paged<T> {
  items: T[];
  meta: PageMeta;
  raw: Raw;
}

/** Server-paginated list state (DataTable `server` mode). */
export interface ListParams {
  page: number;
  pageSize: number;
  search?: string;
}

/** `page`/`per_page`/`search` query params (backend max per_page = 100). */
export function pageParams({ page, pageSize, search }: ListParams): Raw {
  return { page, per_page: pageSize, search: search || undefined };
}

/** Numeric ids go out as numbers, string keys (item ids like "3-m-0") as-is, empty → undefined. */
export function idParam(value: string | null | undefined): string | number | undefined {
  if (value === null || value === undefined || value === '') return undefined;
  return /^\d+$/.test(value) ? Number(value) : value;
}

export async function fetchPaged<T>(
  url: string,
  params: Raw,
  map: (raw: unknown) => T,
  options: { listKey?: string; signal?: AbortSignal } = {},
): Promise<Paged<T>> {
  const res = await http.getPage<unknown>(url, params, options);
  return { items: res.items.map(map), meta: res.meta, raw: res.raw };
}

export async function fetchList<T>(url: string, params: Raw, map: (raw: unknown) => T, signal?: AbortSignal): Promise<T[]> {
  return arr(await http.get<unknown>(url, params, signal)).map(map);
}

// ── Summary ───────────────────────────────────────────────────────────────

export interface InventorySummary {
  totalItems: number;
  activeItems: number;
  inactiveItems: number;
  categoriesCount: number;
  subcategoriesCount: number;
  vendorsCount: number;
  unitsCount: number;
  locationsCount: number;
  purchasedQty: number;
  purchaseTotal: number;
  stockQuantity: number;
  stockValue: number;
  stockRows: number;
  outOfStockRows: number;
  cpeAssigned: number;
  cpeReturned: number;
  transfersCount: number;
  transfersQty: number;
}

const SUMMARY_KEYS: Array<keyof InventorySummary> = [
  'totalItems', 'activeItems', 'inactiveItems', 'categoriesCount', 'subcategoriesCount', 'vendorsCount',
  'unitsCount', 'locationsCount', 'purchasedQty', 'purchaseTotal', 'stockQuantity', 'stockValue',
  'stockRows', 'outOfStockRows', 'cpeAssigned', 'cpeReturned', 'transfersCount', 'transfersQty',
];

export function mapSummary(raw: unknown): InventorySummary {
  const r = obj(raw);
  return Object.fromEntries(SUMMARY_KEYS.map((k) => [k, num(r[k])])) as unknown as InventorySummary;
}

// ── Categories ────────────────────────────────────────────────────────────

export interface InventorySubcategory {
  index: number;
  name: string;
  status: string;
  shortDescription: string;
  itemCount: number;
}

export interface InventoryCategory {
  id: string;
  name: string;
  status: string;
  shortDescription: string;
  itemCount: number;
  subcategories: InventorySubcategory[];
}

export function mapSubcategory(raw: unknown): InventorySubcategory {
  const r = obj(raw);
  return {
    index: num(r.index),
    name: str(r.name),
    status: str(r.status, 'active'),
    shortDescription: str(r.short_description),
    itemCount: num(r.item_count),
  };
}

export function mapCategory(raw: unknown): InventoryCategory {
  const r = obj(raw);
  return {
    id: str(r.id),
    name: str(r.name),
    status: str(r.status, 'active'),
    shortDescription: str(r.short_description),
    itemCount: num(r.item_count),
    subcategories: arr(r.subcategories).map(mapSubcategory),
  };
}

export interface CategoryPayload {
  name: string;
  status: string;
  short_description?: string;
  parent_id?: string | number;
}

// ── Items (catalogue) ─────────────────────────────────────────────────────

export interface InventoryItem {
  /** String key "{categoryId}-{m|subIndex}-{index}" — shifts after deletes, always refetch. */
  id: string;
  itemName: string;
  categoryId: string;
  category: string;
  subcategoryIndex: number | null;
  subcategory: string;
  unitPrice: number;
  vat: number;
  status: string;
  description: string;
}

export function mapItem(raw: unknown): InventoryItem {
  const r = obj(raw);
  return {
    id: str(r.id),
    itemName: str(r.item_name),
    categoryId: str(r.category_id),
    category: str(r.category),
    subcategoryIndex: numOrNull(r.subcategory_index),
    subcategory: str(r.subcategory),
    unitPrice: num(r.unit_price),
    vat: num(r.vat),
    status: str(r.status, 'active'),
    description: str(r.description),
  };
}

export interface ItemPayload {
  item_name: string;
  category_id: string | number | undefined;
  subcategory_index?: number;
  status: string;
  price: number;
  vat?: number;
  description?: string;
}

// ── Units / store locations / suppliers ──────────────────────────────────

export interface InventoryUnit {
  id: string;
  name: string;
  createdAt: string;
}

export function mapUnit(raw: unknown): InventoryUnit {
  const r = obj(raw);
  return { id: str(r.id), name: str(r.name), createdAt: str(r.created_at) };
}

export interface StoreLocation {
  id: string;
  locationName: string;
  shortValue: string;
  createdAt: string;
}

export function mapStoreLocation(raw: unknown): StoreLocation {
  const r = obj(raw);
  return {
    id: str(r.id),
    locationName: str(r.location_name),
    shortValue: str(r.short_value),
    createdAt: str(r.created_at),
  };
}

export interface Supplier {
  id: string;
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
  purchaseTotal: number;
  billCount: number;
}

export function mapSupplier(raw: unknown): Supplier {
  const r = obj(raw);
  return {
    id: str(r.id),
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
    purchaseTotal: num(r.purchase_total),
    billCount: num(r.bill_count),
  };
}

export interface SupplierPayload {
  company_name: string;
  contact_person: string;
  email: string;
  mobile_number: string;
  phone_number?: string;
  website?: string;
  facebook_url?: string;
  skype_id?: string;
  address?: string;
}

// ── Stock on hand ─────────────────────────────────────────────────────────

export interface StockRow {
  id: string;
  /** Catalogue key, '' when the item was removed from the catalogue. */
  itemId: string;
  itemName: string;
  categoryId: string;
  category: string;
  subcategory: string;
  locationId: string;
  locationName: string;
  quantity: number;
  unitPrice: number;
  value: number;
  updatedAt: string;
}

export function mapStockRow(raw: unknown): StockRow {
  const r = obj(raw);
  return {
    id: str(r.id),
    itemId: str(r.item_id),
    itemName: str(r.item_name),
    categoryId: str(r.category_id),
    category: str(r.category),
    subcategory: str(r.subcategory),
    locationId: str(r.location_id),
    locationName: str(r.location_name),
    quantity: num(r.quantity),
    unitPrice: num(r.unit_price),
    value: num(r.value),
    updatedAt: str(r.updated_at),
  };
}

// ── Stock transactions (movements) ───────────────────────────────────────

export type StockTxnType = 'in' | 'out' | 'adjust' | 'transfer' | 'issue' | 'return';
export type StockMovementType = 'in' | 'out' | 'adjust' | 'transfer';

export interface StockTransaction {
  id: string;
  type: string;
  itemId: string;
  itemName: string;
  locationId: string;
  locationName: string;
  toLocationId: string | null;
  toLocationName: string;
  quantity: number;
  balanceAfter: number;
  unitCost: number | null;
  customerId: string | null;
  customerName: string;
  serialNo: string;
  macAddress: string;
  reference: string;
  note: string;
  createdByName: string;
  createdAt: string;
}

export function mapStockTransaction(raw: unknown): StockTransaction {
  const r = obj(raw);
  return {
    id: str(r.id),
    type: str(r.type),
    itemId: str(r.item_id),
    itemName: str(r.item_name),
    locationId: str(r.location_id),
    locationName: str(r.location_name),
    toLocationId: strOrNull(r.to_location_id),
    toLocationName: str(r.to_location_name),
    quantity: num(r.quantity),
    balanceAfter: num(r.balance_after),
    unitCost: numOrNull(r.unit_cost),
    customerId: strOrNull(r.customer_id),
    customerName: str(r.customer_name),
    serialNo: str(r.serial_no),
    macAddress: str(r.mac_address),
    reference: str(r.reference),
    note: str(r.note),
    createdByName: str(r.created_by_name),
    createdAt: str(r.created_at),
  };
}

export interface StockTransactionPayload {
  type: StockMovementType;
  item_id: string | number | undefined;
  location_id: string | number | undefined;
  to_location_id?: string | number;
  quantity: number;
  unit_cost?: number;
  reference?: string;
  note?: string;
}

// ── CPE / ONU assignments ────────────────────────────────────────────────

export interface CpeAssignment {
  id: string;
  itemId: string;
  itemName: string;
  locationId: string;
  locationName: string;
  customerId: string;
  customerName: string;
  customerMobile: string;
  serialNo: string;
  macAddress: string;
  status: string;
  assignedAt: string;
  returnedAt: string | null;
  note: string;
  assignedByName: string;
}

export function mapCpeAssignment(raw: unknown): CpeAssignment {
  const r = obj(raw);
  return {
    id: str(r.id),
    itemId: str(r.item_id),
    itemName: str(r.item_name),
    locationId: str(r.location_id),
    locationName: str(r.location_name),
    customerId: str(r.customer_id),
    customerName: str(r.customer_name),
    customerMobile: str(r.customer_mobile),
    serialNo: str(r.serial_no),
    macAddress: str(r.mac_address),
    status: str(r.status),
    assignedAt: str(r.assigned_at),
    returnedAt: strOrNull(r.returned_at),
    note: str(r.note),
    assignedByName: str(r.assigned_by_name),
  };
}

export interface CpeAssignPayload {
  item_id: string | number | undefined;
  location_id: string | number | undefined;
  customer_id: string | number | undefined;
  serial_no: string;
  mac_address?: string;
  note?: string;
}

export interface CustomerOption {
  id: string;
  name: string;
  mobile: string;
  pppoeId: string;
}

export function mapCustomerOption(raw: unknown): CustomerOption {
  const r = obj(raw);
  return { id: str(r.id), name: str(r.name), mobile: str(r.mobile), pppoeId: str(r.pppoe_id) };
}
