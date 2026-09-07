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
