export type HierarchyRole = 'super_admin' | 'admin' | 'reseller' | 'customer';

export type HierarchyScope = 'platform' | 'admin' | 'reseller';

export interface HierarchyNode {
  id: string;
  label: string;
  role: HierarchyRole;
  meta?: string;
  status?: string;
  descendantCount: number;
  childCount: number;
  children: HierarchyNode[];
}

export interface HierarchySummary {
  superAdmins: number;
  admins: number;
  resellers: number;
  customers: number;
  totalNodes: number;
}

export interface HierarchyTreeResponse {
  scope: HierarchyScope;
  root: HierarchyNode;
  summary: HierarchySummary;
  title: string;
  subtitle: string;
}

export interface HierarchySubscriber {
  id: string;
  name: string;
  mobile: string;
  email: string;
  packageName: string;
  packagePrice: number;
  status: string;
  subscriptionStatus: string;
  lastRenewed: string | null;
  willExpire: string | null;
}

export interface ResellerSubscribersResponse {
  reseller: {
    id: string;
    name: string;
    mobile: string;
    email: string;
    balance: number;
    status: string;
  } | null;
  stats: {
    total: number;
    active: number;
    inactive: number;
  };
  items: HierarchySubscriber[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
