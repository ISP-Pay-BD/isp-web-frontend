/**
 * `GET /v1/employee-portal/operations` (Rust `EmployeeDashboard`, PHP `Dashboard::employee`). Money is in taka.
 * Each section is gated by a `can_*` flag; a section the employee may not read is hidden, and a payload that
 * omits a section (older API) hides it too.
 */

type Raw = Record<string, unknown>;

const str = (v: unknown) =>
  typeof v === 'string' ? v.trim() : typeof v === 'number' ? String(v) : '';
const num = (v: unknown) => {
  const n = typeof v === 'number' ? v : Number(v);
  return Number.isFinite(n) ? n : 0;
};
const list = (v: unknown): Raw[] =>
  Array.isArray(v) ? (v.filter((x) => x && typeof x === 'object') as Raw[]) : [];
const has = (raw: Raw, key: string) => key in raw && raw[key] !== null && raw[key] !== undefined;

export interface DueCustomer {
  id: string;
  name: string;
  mobile: string;
  address: string;
  areaName: string;
  packageName: string;
  packagePrice: number;
  willExpire: string;
}

export interface MyCollection {
  id: string;
  invoice: string;
  amount: number;
  month: string;
  paidVia: string;
  status: string;
  createdAt: string;
  customerName: string;
  customerMobile: string;
}

export interface AssignedTicket {
  id: string;
  subject: string;
  status: string;
  priority: string;
  createdAt: string;
}

export interface EmployeeOperations {
  month: string;
  hasAreas: boolean;
  perms: {
    readCustomer: boolean;
    createCustomer: boolean;
    readPayment: boolean;
    createPayment: boolean;
    readTicket: boolean;
  };
  area: {
    paidCount: number;
    paidAmount: number;
    dueCount: number;
    dueAmount: number;
    dueCustomers: DueCustomer[];
  } | null;
  collections: {
    todayAmount: number;
    todayCount: number;
    monthAmount: number;
    monthCount: number;
    recent: MyCollection[];
  } | null;
  tickets: { count: number; items: AssignedTicket[] } | null;
}

export function mapOperations(raw: Raw): EmployeeOperations {
  const perms = {
    readCustomer: raw.can_read_customer === true,
    createCustomer: raw.can_create_customer === true,
    readPayment: raw.can_read_payment === true,
    createPayment: raw.can_create_payment === true,
    readTicket: raw.can_read_ticket === true,
  };
  const areaIds = Array.isArray(raw.area_ids) ? raw.area_ids : [];

  return {
    month: str(raw.month),
    hasAreas: areaIds.length > 0,
    perms,
    area:
      perms.readCustomer && has(raw, 'area_due_count')
        ? {
            paidCount: num(raw.area_paid_count),
            paidAmount: num(raw.area_paid_amount),
            dueCount: num(raw.area_due_count),
            dueAmount: num(raw.area_due_amount),
            dueCustomers: list(raw.due_customers_list).map((c) => ({
              id: str(c.id),
              name: str(c.name),
              mobile: str(c.mobile),
              address: str(c.address),
              areaName: str(c.area_name),
              packageName: str(c.package_name),
              packagePrice: num(c.package_price),
              willExpire: str(c.will_expire),
            })),
          }
        : null,
    collections:
      perms.readPayment && has(raw, 'my_month_collection')
        ? {
            todayAmount: num(raw.my_today_collection),
            todayCount: num(raw.my_today_count),
            monthAmount: num(raw.my_month_collection),
            monthCount: num(raw.my_month_count),
            recent: list(raw.my_recent_collections).map((p) => ({
              id: str(p.id),
              invoice: str(p.invoice),
              amount: num(p.amount),
              month: str(p.month),
              paidVia: str(p.paid_via),
              status: str(p.status).toLowerCase(),
              createdAt: str(p.created_at),
              customerName: str(p.customer_name),
              customerMobile: str(p.customer_mobile),
            })),
          }
        : null,
    tickets:
      perms.readTicket && has(raw, 'assigned_tickets_count')
        ? {
            count: num(raw.assigned_tickets_count),
            items: list(raw.assigned_tickets).map((tk) => ({
              id: str(tk.id),
              subject: str(tk.subject),
              status: str(tk.status).toLowerCase(),
              priority: str(tk.priority).toLowerCase(),
              createdAt: str(tk.created_at),
            })),
          }
        : null,
  };
}
