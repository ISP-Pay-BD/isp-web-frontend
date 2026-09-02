import type { SupportTicket } from '../shared/types';
import { customers } from '../admin/customers.data';
import { pick, BD_FIRST_NAMES } from '../shared/generators';

const subjects = [
  'Internet slow after 8 PM',
  'Payment not reflected',
  'Router keeps disconnecting',
  'Cannot login to customer portal',
  'Wrong package assigned',
  'Need MAC bind change',
  'Fiber line down since morning',
  'bKash payment pending',
  'Request speed upgrade',
  'Bill amount incorrect',
  'WiFi password reset',
  'New connection installation',
  'POP funding not credited',
  'SMS not received',
  'Expired but paid yesterday',
];

export const supportTickets: SupportTicket[] = Array.from({ length: 18 }, (_, i) => {
  const cust = pick(customers, i);
  const status = (['open', 'pending', 'closed'] as const)[i % 3]!;
  const priority = (['low', 'medium', 'high'] as const)[i % 3]!;
  const created = `2026-${String((i % 8) + 1).padStart(2, '0')}-${String((i % 28) + 1).padStart(2, '0')}T${String(9 + (i % 8)).padStart(2, '0')}:00:00`;

  return {
    id: `tkt_${String(i + 1).padStart(3, '0')}`,
    subject: subjects[i % subjects.length]!,
    status,
    priority,
    customerId: cust.id,
    customerName: cust.name,
    createdAt: created,
    updatedAt: created,
    messages: [
      {
        id: `msg_${i}_1`,
        sender: 'customer',
        senderName: cust.name,
        body: `Customer report: ${subjects[i % subjects.length]}. Phone: ${cust.phone}`,
        sentAt: created,
      },
      ...(status !== 'open'
        ? [
            {
              id: `msg_${i}_2`,
              sender: 'admin' as const,
              senderName: `${pick(BD_FIRST_NAMES, i)} (Support)`,
              body: status === 'closed' ? 'Issue resolved. Please confirm.' : 'We are investigating. Technician assigned.',
              sentAt: created.replace('T09', 'T14').replace('T10', 'T15'),
            },
          ]
        : []),
    ],
  };
});

export function getTicketById(id: string): SupportTicket | undefined {
  return supportTickets.find((t) => t.id === id);
}

export const adminSupportStats = {
  open: supportTickets.filter((t) => t.status === 'open').length,
  pending: supportTickets.filter((t) => t.status === 'pending').length,
  closed: supportTickets.filter((t) => t.status === 'closed').length,
  avgResponseHours: 2.4,
};
