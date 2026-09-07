import { tenants } from '@/data/platform/tenants.data';
import { popResellers } from '@/data/admin/network-ops.data';
import { customers } from '@/data/admin/customers.data';
import type {
  HierarchyNode,
  HierarchyScope,
  HierarchySummary,
  HierarchyTreeResponse,
} from './hierarchy.types';

export type {
  HierarchyNode,
  HierarchyScope,
  HierarchySummary,
  HierarchyTreeResponse,
} from './hierarchy.types';

const CUSTOMERS_PER_RESELLER_IN_TREE = 6;

function customerNodesForPop(popId: string): HierarchyNode[] {
  const list = customers.filter((c) => c.resellerId === popId);
  const shown = list.slice(0, CUSTOMERS_PER_RESELLER_IN_TREE);
  const nodes: HierarchyNode[] = shown.map((c) => ({
    id: c.id,
    label: c.name,
    role: 'customer',
    meta: c.packageName,
    status: c.status,
    descendantCount: 0,
    childCount: 0,
    children: [],
  }));

  const remaining = list.length - shown.length;
  if (remaining > 0) {
    nodes.push({
      id: `${popId}_more`,
      label: `+${remaining} more customers`,
      role: 'customer',
      meta: 'Open Customers list',
      status: 'group',
      descendantCount: 0,
      childCount: 0,
      children: [],
    });
  }

  return nodes;
}

function buildResellerNodes(): HierarchyNode[] {
  return popResellers.map((pop) => {
    const assigned = customers.filter((c) => c.resellerId === pop.id);
    const children = customerNodesForPop(pop.id);
    return {
      id: pop.id,
      label: pop.name,
      role: 'reseller' as const,
      meta: `${pop.area} · balance ৳${pop.balanceBdt.toLocaleString('en-BD')}`,
      status: pop.status,
      descendantCount: assigned.length,
      childCount: children.length,
      children,
    };
  });
}

function buildAdminNode(tenantId: string, name: string, customerTotal: number): HierarchyNode {
  const resellers = buildResellerNodes();
  const resellerCustomers = resellers.reduce((sum, r) => sum + r.descendantCount, 0);
  // Direct (non-POP) customers under tenant admin
  const directCustomers: HierarchyNode[] = customers
    .filter((c) => !c.resellerId)
    .slice(0, 5)
    .map((c) => ({
      id: `direct_${c.id}`,
      label: c.name,
      role: 'customer' as const,
      meta: `${c.packageName} · direct`,
      status: c.status,
      descendantCount: 0,
      childCount: 0,
      children: [],
    }));
  const directTotal = customers.filter((c) => !c.resellerId).length;
  if (directTotal > directCustomers.length) {
    directCustomers.push({
      id: `${tenantId}_direct_more`,
      label: `+${directTotal - directCustomers.length} more direct customers`,
      role: 'customer',
      meta: 'Under tenant admin',
      status: 'group',
      descendantCount: 0,
      childCount: 0,
      children: [],
    });
  }

  const children = [...resellers, ...directCustomers];
  return {
    id: tenantId,
    label: name,
    role: 'admin',
    meta: `Tenant admin · ${customerTotal.toLocaleString('en-BD')} billed lines`,
    status: 'active',
    descendantCount: resellerCustomers + directTotal,
    childCount: children.length,
    children,
  };
}

function countRoles(node: HierarchyNode, acc: HierarchySummary): void {
  if (node.role === 'super_admin') acc.superAdmins += 1;
  if (node.role === 'admin') acc.admins += 1;
  if (node.role === 'reseller') acc.resellers += 1;
  if (node.role === 'customer' && node.status !== 'group') acc.customers += 1;
  acc.totalNodes += 1;
  node.children.forEach((c) => countRoles(c, acc));
}

function summarize(root: HierarchyNode): HierarchySummary {
  const acc: HierarchySummary = {
    superAdmins: 0,
    admins: 0,
    resellers: 0,
    customers: 0,
    totalNodes: 0,
  };
  countRoles(root, acc);
  // Prefer real customer totals from data for accuracy
  acc.customers = customers.length;
  return acc;
}

/** Full platform tree: Super Admin → each tenant admin → POPs → customers. */
export function buildPlatformHierarchy(): HierarchyTreeResponse {
  const adminChildren = tenants.slice(0, 4).map((t) => {
    if (t.id === 'tenant_demo') {
      return buildAdminNode(t.id, t.name, t.customers);
    }
    // Other tenants: compact POP stubs (no shared customer pool)
    const stubResellers: HierarchyNode[] = [
      {
        id: `${t.id}_pop_a`,
        label: `${t.slug.toUpperCase()} POP A`,
        role: 'reseller',
        meta: 'Sample POP',
        status: 'active',
        descendantCount: Math.round(t.customers * 0.35),
        childCount: 1,
        children: [
          {
            id: `${t.id}_cust_group`,
            label: `${Math.round(t.customers * 0.35)} customers`,
            role: 'customer',
            meta: 'Grouped',
            status: 'group',
            descendantCount: 0,
            childCount: 0,
            children: [],
          },
        ],
      },
      {
        id: `${t.id}_pop_b`,
        label: `${t.slug.toUpperCase()} POP B`,
        role: 'reseller',
        meta: 'Sample POP',
        status: 'active',
        descendantCount: Math.round(t.customers * 0.25),
        childCount: 1,
        children: [
          {
            id: `${t.id}_cust_group_b`,
            label: `${Math.round(t.customers * 0.25)} customers`,
            role: 'customer',
            meta: 'Grouped',
            status: 'group',
            descendantCount: 0,
            childCount: 0,
            children: [],
          },
        ],
      },
    ];
    return {
      id: t.id,
      label: t.name,
      role: 'admin' as const,
      meta: `${t.ownerName} · ${t.plan}`,
      status: t.status,
      descendantCount: t.customers,
      childCount: stubResellers.length,
      children: stubResellers,
    };
  });

  const root: HierarchyNode = {
    id: 'platform_root',
    label: 'ISP Pay BD Super Admin',
    role: 'super_admin',
    meta: 'Platform control plane',
    status: 'active',
    descendantCount: adminChildren.reduce((s, a) => s + a.descendantCount, 0),
    childCount: adminChildren.length,
    children: adminChildren,
  };

  return {
    scope: 'platform',
    root,
    summary: summarize(root),
    title: 'Platform hierarchy',
    subtitle: 'Super Admin → Tenant Admin → POP Reseller → Customer',
  };
}

export function buildAdminHierarchy(): HierarchyTreeResponse {
  const root = buildAdminNode('tenant_demo', 'Demo ISP Network', customers.length);
  return {
    scope: 'admin',
    root,
    summary: {
      ...summarize(root),
      superAdmins: 0,
      admins: 1,
      resellers: popResellers.length,
      customers: customers.length,
    },
    title: 'Tenant hierarchy',
    subtitle: 'Admin → POP Reseller → Customer',
  };
}

export function buildResellerHierarchy(resellerId = 'pop_uttara'): HierarchyTreeResponse {
  const pop = popResellers.find((p) => p.id === resellerId) ?? popResellers[0]!;
  const children = customerNodesForPop(pop.id);
  const assigned = customers.filter((c) => c.resellerId === pop.id);
  const root: HierarchyNode = {
    id: pop.id,
    label: pop.name,
    role: 'reseller',
    meta: `${pop.area} · your POP`,
    status: pop.status,
    descendantCount: assigned.length,
    childCount: children.length,
    children,
  };

  return {
    scope: 'reseller',
    root,
    summary: {
      superAdmins: 0,
      admins: 0,
      resellers: 1,
      customers: assigned.length,
      totalNodes: 1 + children.length,
    },
    title: 'POP hierarchy',
    subtitle: 'Reseller → Customer',
  };
}

export function getHierarchyByScope(
  scope: HierarchyScope,
  resellerId?: string,
): HierarchyTreeResponse {
  if (scope === 'platform') return buildPlatformHierarchy();
  if (scope === 'reseller') return buildResellerHierarchy(resellerId);
  return buildAdminHierarchy();
}
