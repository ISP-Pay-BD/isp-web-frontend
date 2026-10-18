'use client';

import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { http } from '@/lib/api/client';
import { num, str } from '@/lib/api/case';

/**
 * Work orders = the staff support-ticket desk (GET/POST /v1/staff-tickets…),
 * the same endpoints the support pages use. Scope (opened by me / assigned to
 * me) is enforced by the backend from the JWT.
 */

export type WorkOrderStatus = 'opened' | 'processing' | 'closed';

export interface WorkOrder {
  id: string;
  customerId: string;
  customerName: string;
  subject: string;
  category: string;
  priority: string;
  status: WorkOrderStatus;
  viewed: boolean;
  remarks: string;
  assigneeIds: string[];
  createdAt: string;
}

export interface WorkOrderStats {
  total: number;
  opened: number;
  processing: number;
  closed: number;
  unread: number;
}

export interface WorkOrderDetail extends WorkOrder {
  messages: { sender: string; senderName: string; mine: boolean; msg: string; datetime: string }[];
  employees: { id: string; name: string }[];
}

type Raw = Record<string, unknown>;
const obj = (v: unknown): Raw => (v && typeof v === 'object' ? (v as Raw) : {});

function mapWorkOrder(raw: unknown): WorkOrder {
  const r = obj(raw);
  const status = str(r.status);
  return {
    id: str(r.id),
    customerId: str(r.user_id),
    customerName: str(r.user_name),
    subject: str(r.subject),
    category: str(r.category),
    priority: str(r.priority) || 'low',
    status: status === 'processing' || status === 'closed' ? status : 'opened',
    viewed: r.viewed === true,
    remarks: str(r.remarks),
    assigneeIds: Array.isArray(r.assignees) ? r.assignees.map((a) => str(a)) : [],
    createdAt: str(r.datetime),
  };
}

const workOrderKeys = {
  all: ['admin', 'work-orders'] as const,
  list: (params: Record<string, unknown>) => ['admin', 'work-orders', 'list', params] as const,
  detail: (id: string) => ['admin', 'work-orders', 'detail', id] as const,
};

export function useWorkOrders({ page, pageSize, search, status }: { page: number; pageSize: number; search?: string; status?: WorkOrderStatus | '' }) {
  const params = { page, per_page: pageSize, q: search || undefined, status: status || undefined };
  return useQuery({
    queryKey: workOrderKeys.list(params),
    queryFn: async ({ signal }) => {
      const res = await http.getPage<unknown>('/v1/staff-tickets', params, { signal });
      const s = obj(res.raw.stats);
      const stats: WorkOrderStats = {
        total: num(s.total),
        opened: num(s.opened),
        processing: num(s.processing),
        closed: num(s.closed),
        unread: num(s.unread),
      };
      return { items: res.items.map(mapWorkOrder), meta: res.meta, stats };
    },
    placeholderData: keepPreviousData,
  });
}

/** Detail + thread + assignable employees (marks the ticket viewed). */
export function useWorkOrder(id: string | null) {
  return useQuery({
    queryKey: workOrderKeys.detail(id ?? ''),
    queryFn: async ({ signal }): Promise<WorkOrderDetail> => {
      const r = obj(await http.get<unknown>(`/v1/staff-tickets/${id}`, undefined, signal));
      return {
        ...mapWorkOrder(r),
        messages: (Array.isArray(r.messages) ? r.messages : []).map((m) => {
          const x = obj(m);
          return { sender: str(x.sender), senderName: str(x.sender_name), mine: x.mine === true, msg: str(x.msg), datetime: str(x.datetime) };
        }),
        employees: (Array.isArray(r.employees) ? r.employees : []).map((e) => ({ id: str(obj(e).id), name: str(obj(e).name) })),
      };
    },
    enabled: Boolean(id),
  });
}

export function useSetWorkOrderStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: WorkOrderStatus }) => http.post<unknown>(`/v1/staff-tickets/${id}/status`, { status }),
    onSuccess: (_d, { status }) => {
      toast.success(`Work order marked ${status}`);
      qc.invalidateQueries({ queryKey: workOrderKeys.all });
    },
  });
}

/** Assign (transfer) work orders to employees of the tenant. */
export function useAssignWorkOrder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ ids, employeeIds }: { ids: string[]; employeeIds: string[] }) =>
      http.post<unknown>('/v1/staff-tickets/transfer', { ticket_ids: ids.map(Number), employee_ids: employeeIds.map(Number) }),
    onSuccess: () => {
      toast.success('Work order assigned');
      qc.invalidateQueries({ queryKey: workOrderKeys.all });
    },
  });
}
