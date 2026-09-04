import type { Customer } from '../shared/types';
import { areas } from './areas.data';
import { packages } from './packages.data';
import { pick, BD_FIRST_NAMES, BD_LAST_NAMES, bdPhone, isoDate } from '../shared/generators';

const POP_IDS = ['pop_uttara', 'pop_mirpur', 'pop_dhanmondi', 'pop_chittagong'] as const;
const CLIENT_TYPES = ['residential', 'corporate', 'student'] as const;
const CORE_COLORS = ['blue', 'orange', 'green', 'brown', 'slate'] as const;
const PPPOE_SERVICES = ['pppoe', 'static'] as const;

export const customers: Customer[] = Array.from({ length: 80 }, (_, i) => {
  const num = String(i + 1).padStart(3, '0');
  const pkg = pick(packages, i);
  const area = pick(areas, i);
  const sub = pick(area.subareas, i);
  const isExpired = i % 8 === 0;
  const isSuspended = i % 17 === 0;
  const month = (i % 12) + 1;
  const pppoeDisabled = i % 7 === 0;

  const today = new Date();
  const bandwidthData = Array.from({ length: 7 }, (_, d) => {
    const date = new Date(today);
    date.setDate(date.getDate() - (6 - d));
    return {
      date: date.toISOString().slice(0, 10),
      downloadMb: Math.round(500 + Math.random() * 2000),
      uploadMb: Math.round(100 + Math.random() * 800),
    };
  });

  return {
    id: `cust_${num}`,
    name: `${pick(BD_FIRST_NAMES, i)} ${pick(BD_LAST_NAMES, i + 3)}`,
    username: `user_${num}`,
    phone: bdPhone(1000 + i),
    email: i % 3 === 0 ? `user${num}@demo.local` : undefined,
    packageId: pkg.id,
    packageName: pkg.name,
    packagePrice: pkg.priceBdt,
    areaId: area.id,
    areaName: area.name,
    subAreaName: sub.name,
    subAreaCode: sub.areaCode,
    resellerId: i % 4 === 0 ? pick(POP_IDS, i) : undefined,
    status: isSuspended ? 'suspended' : isExpired ? 'expired' : 'active',
    expiryDate: isExpired ? isoDate(2026, 8, 5 + (i % 20)) : isoDate(2026, 10, 1 + (i % 28)),
    balanceBdt: i % 6 === 0 ? [500, 800, 1200][i % 3]! : 0,
    connectionType: i % 11 === 0 ? 'hotspot' : i % 23 === 0 ? 'static' : 'pppoe',
    macAddress: `AA:BB:${String(i % 256).padStart(2, '0')}:CC:${String((i * 3) % 256).padStart(2, '0')}:${String(i % 100).padStart(2, '0')}`,
    ipAddress: `103.${15 + (i % 5)}.${20 + (i % 30)}.${100 + (i % 155)}`,
    online: !isExpired && !isSuspended && i % 4 !== 0,
    createdAt: isoDate(2024 + (i % 2), month, 1 + (i % 28)),
    nidNumber: i % 2 === 0 ? `${1000000000 + i * 12345}` : undefined,
    code: `C${String(i + 1).padStart(4, '0')}`,
    address: `${i + 1} Road ${pick(['A', 'B', 'C', 'D', 'E'], i)}, ${area.name}`,
    latitude: 23.7 + (i % 10) * 0.01,
    longitude: 90.3 + (i % 10) * 0.015,
    routerId: `router_${i % 5}`,
    routerName: `MikroTik-${pick(['RB4011', 'hEX S', 'hAP ac²', 'CCR1036', 'CCR1009'], i)}`,
    connectionDetails: {
      connectionType: i % 11 === 0 ? 'Hotspot' : 'PPPOE',
      cableRequirement: `${10 + (i % 50)} meter`,
      fiberCode: i % 3 === 0 ? `FBR-${String(i).padStart(3, '0')}` : undefined,
      numberOfCore: i % 3 === 0 ? `${2 + (i % 8)}` : undefined,
      coreColor: i % 3 === 0 ? pick(CORE_COLORS, i) : undefined,
      clientType: pick(CLIENT_TYPES, i),
      billingStatus: isExpired ? 'overdue' : 'current',
      otc: i % 5 === 0 ? 'Yes' : 'No',
      routerUsername: `admin_${num}`,
      routerPassword: `pass_${num}`,
    },
    pppoeDetails: {
      name: `pppoe_${num}`,
      password: `secret_${num}`,
      service: pick(PPPOE_SERVICES, i),
      profile: pkg.name,
      disabled: pppoeDisabled,
      lastLoggedOut: i % 4 === 0 ? '2026-09-01 14:30:00' : undefined,
      lastCallerId: i % 4 === 0 ? `AA:BB:${String(i % 256).padStart(2, '0')}:CC:${String((i * 3) % 256).padStart(2, '0')}:${String(i % 100).padStart(2, '0')}` : undefined,
    },
    oltDetails: {
      name: `OLT-${pick(['Uttara', 'Mirpur', 'Dhanmondi', 'CTG', 'Sylhet'], i)}`,
      onuId: `${10 + (i % 20)}`,
      status: i % 5 === 0 ? 'offline' : 'online',
      rxPower: `${-18 - (i % 10)}.${i % 10} dBm`,
      macAddress: `CC:DD:${String(i % 256).padStart(2, '0')}:EE:${String((i * 7) % 256).padStart(2, '0')}:${String(i % 50).padStart(2, '0')}`,
      callId: `${i % 4 === 0 ? `AA:BB:${String(i % 256).padStart(2, '0')}:CC:${String((i * 3) % 256).padStart(2, '0')}:${String(i % 100).padStart(2, '0')}` : ''}`,
      matchedId: `${i % 4 === 0 ? `ONU-${10 + (i % 20)}` : ''}`,
      description: i % 5 === 0 ? 'Device not found on OLT' : `PON Port ${(i % 4) + 1}`,
      lastSeen: i % 5 === 0 ? undefined : '2026-09-01 15:45:00',
      reason: i % 5 === 0 ? 'OLT timeout' : undefined,
    },
    bandwidthUsage: bandwidthData,
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
  { id: 'fur_1', name: 'New Lead — Uttara', phone: bdPhone(9001), email: 'uttara_lead@test.com', area: 'Uttara Sector 11', reseller: 'Uttara POP', temporaryExpiry: '2026-09-09T23:59:59', requestedAt: '2026-09-02T09:00:00', status: 'pending' as const },
  { id: 'fur_2', name: 'New Lead — Mirpur', phone: bdPhone(9002), email: 'mirpur_lead@test.com', area: 'Mirpur 10', reseller: 'Mirpur POP', temporaryExpiry: '2026-09-08T23:59:59', requestedAt: '2026-09-01T14:30:00', status: 'pending' as const },
  { id: 'fur_3', name: 'New Lead — CTG', phone: bdPhone(9003), email: null, area: 'Pahartali', reseller: null, temporaryExpiry: '2026-09-06T23:59:59', requestedAt: '2026-08-30T11:00:00', status: 'approved' as const },
  { id: 'fur_4', name: 'New Lead — Dhanmondi', phone: bdPhone(9004), email: 'dhan_lead@test.com', area: 'Dhanmondi 27', reseller: 'Dhanmondi POP', temporaryExpiry: '2026-09-07T23:59:59', requestedAt: '2026-08-28T16:00:00', status: 'rejected' as const },
];
