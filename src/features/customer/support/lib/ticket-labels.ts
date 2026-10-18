import type { useTranslations } from '@/i18n/locale-context';
import type { Tone } from '@/components/shared/status-tones';

type Translate = ReturnType<typeof useTranslations>;

/** Ticket status word (open | pending | closed) in the active language; `pending` is shown as "in progress". */
export function ticketStatusLabel(t: Translate, status: string): string {
  switch (status) {
    case 'open':
      return t('customer.ticket.status.open', 'Open');
    case 'pending':
      return t('customer.ticket.status.pending', 'In progress');
    case 'closed':
      return t('customer.ticket.status.closed', 'Closed');
    default:
      return status;
  }
}

export function ticketStatusTone(status: string): Tone {
  return status === 'open' ? 'info' : status === 'pending' ? 'warning' : 'neutral';
}

export function ticketPriorityLabel(t: Translate, priority: string): string {
  switch (priority) {
    case 'low':
      return t('customer.ticket.priority.low', 'Low');
    case 'medium':
      return t('customer.ticket.priority.medium', 'Medium');
    case 'high':
      return t('customer.ticket.priority.high', 'High');
    default:
      return priority;
  }
}

export function ticketPriorityTone(priority: string): Tone {
  return priority === 'high' ? 'danger' : priority === 'medium' ? 'warning' : 'neutral';
}

/** The backend's `tickets.category` enum; unknown values are returned as they came. */
export function ticketCategoryLabel(t: Translate, category: string): string {
  switch (category) {
    case 'technical':
      return t('customer.ticket.category.technical', 'Technical / connection problem');
    case 'noc':
      return t('customer.ticket.category.noc', 'Network outage (NOC)');
    case 'sales':
      return t('customer.ticket.category.sales', 'Sales / package inquiry');
    case 'marketing':
      return t('customer.ticket.category.marketing', 'Offers & marketing');
    case 'general':
      return t('customer.ticket.category.general', 'General / billing');
    case 'none':
      return t('customer.ticket.category.none', 'Other');
    default:
      return category;
  }
}
