import { num, str } from '@/lib/api/case';
import { isoDate } from '@/features/admin/sms/types';

type Raw = Record<string, unknown>;

export type TicketStatus = 'opened' | 'processing' | 'closed';
export type TicketPriority = 'low' | 'medium' | 'high';

export const TICKET_STATUS_LABEL: Record<TicketStatus, string> = {
  opened: 'Open',
  processing: 'In progress',
  closed: 'Closed',
};

/** Web categories (web App\Controllers\SupportTicket new-ticket form). */
export const TICKET_CATEGORIES: Array<{ value: string; label: string }> = [
  { value: 'technical', label: 'Technical' },
  { value: 'sales', label: 'Sales' },
  { value: 'noc', label: 'NOC' },
  { value: 'marketing', label: 'Marketing' },
  { value: 'general', label: 'General' },
  { value: 'none', label: 'Other' },
];

export interface StaffTicket {
  id: string;
  customerId: string;
  customerName: string;
  customerMobile: string;
  subject: string;
  category: string;
  priority: TicketPriority;
  status: TicketStatus;
  viewed: boolean;
  remarks: string;
  assigneeNames: string[];
  createdAt: string;
  lastActivityAt: string;
  messageCount: number;
  preview: string;
}

export function mapTicket(raw: unknown): StaffTicket {
  const r = (raw ?? {}) as Raw;
  const status = str(r.status);
  const priority = str(r.priority).toLowerCase();
  return {
    id: str(r.id),
    customerId: str(r.user_id),
    customerName: str(r.user_name),
    customerMobile: str(r.user_mobile),
    subject: str(r.subject),
    category: str(r.category),
    priority: (priority === 'high' || priority === 'medium' ? priority : 'low') as TicketPriority,
    status: (status === 'processing' || status === 'closed' ? status : 'opened') as TicketStatus,
    viewed: Boolean(r.viewed),
    remarks: str(r.remarks),
    assigneeNames: Array.isArray(r.assignee_names) ? r.assignee_names.map((n) => str(n)) : [],
    createdAt: isoDate(r.created_at),
    lastActivityAt: isoDate(r.last_activity_at),
    messageCount: num(r.message_count),
    preview: str(r.preview),
  };
}

export interface TicketStats {
  total: number;
  opened: number;
  processing: number;
  closed: number;
  unread: number;
  avgFirstResponseHours: number | null;
  respondedSample: number;
}

export function mapTicketStats(raw: unknown): TicketStats {
  const r = (raw ?? {}) as Raw;
  return {
    total: num(r.total),
    opened: num(r.opened),
    processing: num(r.processing),
    closed: num(r.closed),
    unread: num(r.unread),
    avgFirstResponseHours: r.avg_first_response_hours === null || r.avg_first_response_hours === undefined ? null : num(r.avg_first_response_hours),
    respondedSample: num(r.responded_sample),
  };
}

export interface TicketMessage {
  id: string;
  senderName: string;
  fromCustomer: boolean;
  mine: boolean;
  body: string;
  sentAt: string;
}

export function mapTicketMessage(raw: unknown): TicketMessage {
  const r = (raw ?? {}) as Raw;
  return {
    id: str(r.id),
    senderName: str(r.sender_name),
    fromCustomer: Boolean(r.from_customer),
    mine: Boolean(r.mine),
    body: str(r.msg),
    sentAt: isoDate(r.sent_at),
  };
}

export interface TicketDetail extends StaffTicket {
  messages: TicketMessage[];
  employees: Array<{ id: string; name: string }>;
  firstResponseMinutes: number | null;
}

export function mapTicketDetail(raw: unknown): TicketDetail {
  const r = (raw ?? {}) as Raw;
  return {
    ...mapTicket(raw),
    messages: Array.isArray(r.messages) ? r.messages.map(mapTicketMessage) : [],
    employees: Array.isArray(r.employees)
      ? r.employees.map((e) => {
          const o = (e ?? {}) as Raw;
          return { id: str(o.id), name: str(o.name) };
        })
      : [],
    firstResponseMinutes: r.first_response_minutes === null || r.first_response_minutes === undefined ? null : num(r.first_response_minutes),
  };
}
