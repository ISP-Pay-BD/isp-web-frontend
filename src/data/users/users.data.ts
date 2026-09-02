import type { UserRole, UserStatus } from '@/types/auth';
import type { PermissionMap } from '@/types/auth';
import { DEMO_PASSWORD } from '../shared/constants';
import {
  customerPermissions,
  employeePermissions,
  fullAdminPermissions,
  resellerPermissions,
  superAdminPermissions,
} from './permissions.data';

export interface DemoUserRecord {
  id: string;
  name: string;
  email: string;
  password: string;
  phone: string;
  role: UserRole;
  status: UserStatus;
  tenantId: string;
  organizationName: string;
  permissions: PermissionMap;
}

export const demoUsers: DemoUserRecord[] = [
  {
    id: 'user_001',
    name: 'Rahim Uddin',
    email: 'customer@demo.isppaybd.com',
    password: DEMO_PASSWORD,
    phone: '01710000001',
    role: 'user',
    status: 'active',
    tenantId: 'tenant_demo',
    organizationName: 'Demo ISP Network',
    permissions: customerPermissions,
  },
  {
    id: 'user_002',
    name: 'Karim Expired',
    email: 'customer-expired@demo.isppaybd.com',
    password: DEMO_PASSWORD,
    phone: '01710000002',
    role: 'user',
    status: 'inactive',
    tenantId: 'tenant_demo',
    organizationName: 'Demo ISP Network',
    permissions: customerPermissions,
  },
  {
    id: 'user_003',
    name: 'POP Manager',
    email: 'reseller@demo.isppaybd.com',
    password: DEMO_PASSWORD,
    phone: '01710000003',
    role: 'resellerAdmin',
    status: 'active',
    tenantId: 'tenant_demo',
    organizationName: 'Demo POP Uttara',
    permissions: resellerPermissions,
  },
  {
    id: 'user_004',
    name: 'Tenant Admin',
    email: 'admin@demo.isppaybd.com',
    password: DEMO_PASSWORD,
    phone: '01710000004',
    role: 'admin',
    status: 'active',
    tenantId: 'tenant_demo',
    organizationName: 'Demo ISP Network',
    permissions: fullAdminPermissions,
  },
  {
    id: 'user_005',
    name: 'Staff Member',
    email: 'employee@demo.isppaybd.com',
    password: DEMO_PASSWORD,
    phone: '01710000005',
    role: 'employee',
    status: 'active',
    tenantId: 'tenant_demo',
    organizationName: 'Demo ISP Network',
    permissions: employeePermissions,
  },
  {
    id: 'user_006',
    name: 'Platform Owner',
    email: 'super@demo.isppaybd.com',
    password: DEMO_PASSWORD,
    phone: '01710000006',
    role: 'super_admin',
    status: 'active',
    tenantId: 'platform',
    organizationName: 'ISP Pay BD',
    permissions: superAdminPermissions,
  },
];

export const demoUserCredentials = demoUsers.map(({ email, password, role, name }) => ({
  email,
  password,
  role,
  name,
}));
