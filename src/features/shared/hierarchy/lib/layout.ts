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
};

const NODE_WIDTH = 220;
const NODE_HEIGHT = 88;

export function flattenHierarchy(root: HierarchyNode): {
  nodes: Node<HierarchyFlowNodeData>[];
  edges: Edge[];
} {
  const nodes: Node<HierarchyFlowNodeData>[] = [];
  const edges: Edge[] = [];

  const walk = (node: HierarchyNode, parentId?: string) => {
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
      },
    });
    if (parentId) {
      edges.push({
        id: `e-${parentId}-${node.id}`,
        source: parentId,
        target: node.id,
        type: 'smoothstep',
        animated: false,
        style: { stroke: 'hsl(var(--border))', strokeWidth: 1.5 },
      });
    }
    node.children.forEach((child) => walk(child, node.id));
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
    nodesep: 36,
    ranksep: 72,
    marginx: 24,
    marginy: 24,
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
