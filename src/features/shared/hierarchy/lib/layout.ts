import dagre from '@dagrejs/dagre';
import type { Edge, Node } from '@xyflow/react';
import type { HierarchyNode, HierarchyRole } from '../types';

export type HierarchyFlowNodeData = {
  label: string;
  role: HierarchyRole;
  meta?: string;
  status?: string;
  descendantCount: number;
  childCount: number;
  expandable: boolean;
  expanded: boolean;
  matched?: boolean;
  selected?: boolean;
  layout: 'TB' | 'LR';
  dark?: boolean;
};

const NODE_WIDTH = 240;
const NODE_HEIGHT = 100;

export function collectExpandableIds(node: HierarchyNode, acc: string[] = []): string[] {
  if (node.children.length > 0) {
    acc.push(node.id);
    node.children.forEach((c) => collectExpandableIds(c, acc));
  }
  return acc;
}

export function defaultExpandedIds(root: HierarchyNode): Set<string> {
  return new Set([root.id, ...root.children.map((c) => c.id)]);
}

export function findNodeById(root: HierarchyNode, id: string): HierarchyNode | null {
  if (root.id === id) return root;
  for (const child of root.children) {
    const found = findNodeById(child, id);
    if (found) return found;
  }
  return null;
}

export function flattenHierarchy(
  root: HierarchyNode,
  expandedIds: Set<string>,
  layout: 'TB' | 'LR',
  query = '',
  selectedId?: string | null,
  dark = false,
): {
  nodes: Node<HierarchyFlowNodeData>[];
  edges: Edge[];
} {
  const q = query.trim().toLowerCase();
  const nodes: Node<HierarchyFlowNodeData>[] = [];
  const edges: Edge[] = [];
  const edgeStroke = dark ? 'oklch(0.65 0.02 250)' : 'oklch(0.48 0.018 250 / 0.55)';
  const edgeHot = dark ? '#e85a1a' : 'oklch(0.62 0.17 41)';

  const walk = (node: HierarchyNode, parentId?: string) => {
    const matched =
      !q ||
      node.label.toLowerCase().includes(q) ||
      (node.meta?.toLowerCase().includes(q) ?? false) ||
      node.role.replace('_', ' ').includes(q);

    const expandable = node.children.length > 0;

    nodes.push({
      id: node.id,
      type: 'hierarchy',
      position: { x: 0, y: 0 },
      data: {
        label: node.label,
        role: node.role,
        meta: node.meta,
        status: node.status,
        descendantCount: node.descendantCount,
        childCount: node.childCount,
        expandable,
        expanded: expandedIds.has(node.id),
        matched: q ? matched : undefined,
        selected: selectedId === node.id,
        layout,
        dark,
      },
    });

    if (parentId) {
      edges.push({
        id: `e-${parentId}-${node.id}`,
        source: parentId,
        target: node.id,
        type: 'smoothstep',
        animated: false,
        style: {
          stroke: matched && q ? edgeHot : edgeStroke,
          strokeWidth: matched && q ? 2.25 : dark ? 2 : 1.5,
        },
      });
    }

    if (expandedIds.has(node.id)) {
      node.children.forEach((child) => walk(child, node.id));
    }
  };

  walk(root);
  return { nodes, edges };
}

export function layoutHierarchy(
  nodes: Node<HierarchyFlowNodeData>[],
  edges: Edge[],
  direction: 'TB' | 'LR' = 'TB',
): { nodes: Node<HierarchyFlowNodeData>[]; edges: Edge[] } {
  const g = new dagre.graphlib.Graph().setDefaultEdgeLabel(() => ({}));
  g.setGraph({
    rankdir: direction,
    nodesep: direction === 'LR' ? 28 : 40,
    ranksep: direction === 'LR' ? 70 : 84,
    marginx: 28,
    marginy: 28,
  });

  nodes.forEach((node) => {
    g.setNode(node.id, { width: NODE_WIDTH, height: NODE_HEIGHT });
  });
  edges.forEach((edge) => {
    g.setEdge(edge.source, edge.target);
  });

  dagre.layout(g);

  const laidOut = nodes.map((node) => {
    const pos = g.node(node.id);
    return {
      ...node,
      position: {
        x: pos.x - NODE_WIDTH / 2,
        y: pos.y - NODE_HEIGHT / 2,
      },
    };
  });

  return { nodes: laidOut, edges };
}
