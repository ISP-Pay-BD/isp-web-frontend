import type { Customer } from '../shared/types';
import { areas } from './areas.data';
import { packages } from './packages.data';
import { pick, BD_FIRST_NAMES, BD_LAST_NAMES, bdPhone, isoDate } from '../shared/generators';

const POP_IDS = ['pop_uttara', 'pop_mirpur', 'pop_dhanmondi', 'pop_chittagong'] as const;

export const customers: Customer[] = Array.from({ length: 80 }, (_, i) => {
  const num = String(i + 1).padStart(3, '0');
  const pkg = pick(packages, i);
  const area = pick(areas, i);
  const sub = pick(area.subareas, i);
  const isExpired = i % 8 === 0;
  const isSuspended = i % 17 === 0;
  const month = (i % 12) + 1;

  return {
    id: `cust_${num}`,
    name: `${pick(BD_FIRST_NAMES, i)} ${pick(BD_LAST_NAMES, i + 3)}`,
    username: `user_${num}`,
    phone: bdPhone(1000 + i),
    email: i % 3 === 0 ? `user${num}@demo.local` : undefined,
    packageId: pkg.id,
    packageName: pkg.name,
    areaId: area.id,
    areaName: `${area.name} — ${sub.name}`,
    resellerId: i % 4 === 0 ? pick(POP_IDS, i) : undefined,
    status: isSuspended ? 'suspended' : isExpired ? 'expired' : 'active',
    expiryDate: isExpired ? isoDate(2026, 8, 5 + (i % 20)) : isoDate(2026, 10, 1 + (i % 28)),
    balanceBdt: i % 6 === 0 ? [500, 800, 1200][i % 3]! : 0,
    connectionType: i % 11 === 0 ? 'hotspot' : i % 23 === 0 ? 'static' : 'pppoe',
    macAddress: `AA:BB:${String(i % 256).padStart(2, '0')}:CC:${String((i * 3) % 256).padStart(2, '0')}:${String(i % 100).padStart(2, '0')}`,
    ipAddress: `103.${15 + (i % 5)}.${20 + (i % 30)}.${100 + (i % 155)}`,
    online: !isExpired && !isSuspended && i % 4 !== 0,
    createdAt: isoDate(2024 + (i % 2), month, 1 + (i % 28)),
  };
});

export function getCustomerById(id: string): Customer | undefined {
  return customers.find((c) => c.id === id);
}

export const expiredCustomers = customers.filter((c) => c.status === 'expired');
export const activeCustomers = customers.filter((c) => c.status === 'active');
export const suspendedCustomers = customers.filter((c) => c.status === 'suspended');
export const onlineCustomers = customers.filter((c) => c.online);

export const freeUserRequests = [
  { id: 'fur_1', name: 'New Lead — Uttara', phone: bdPhone(9001), area: 'Uttara Sector 11', requestedAt: '2026-09-02T09:00:00', status: 'pending' as const },
  { id: 'fur_2', name: 'New Lead — Mirpur', phone: bdPhone(9002), area: 'Mirpur 10', requestedAt: '2026-09-01T14:30:00', status: 'pending' as const },
  { id: 'fur_3', name: 'New Lead — CTG', phone: bdPhone(9003), area: 'Pahartali', requestedAt: '2026-08-30T11:00:00', status: 'approved' as const },
];
