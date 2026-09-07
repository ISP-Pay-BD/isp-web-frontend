'use client';

import { useMemo } from 'react';
import {
  Background,
  Controls,
  MiniMap,
  ReactFlow,
  ReactFlowProvider,
  type NodeTypes,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import type { HierarchyNode } from '../types';
import { flattenHierarchy, layoutHierarchy } from '../lib/layout';
import { HierarchyNodeComponent } from './HierarchyNode';

const nodeTypes: NodeTypes = {
  hierarchy: HierarchyNodeComponent,
};

function HierarchyGraphInner({ root }: { root: HierarchyNode }) {
  const { nodes, edges } = useMemo(() => {
    const flat = flattenHierarchy(root);
    return layoutHierarchy(flat.nodes, flat.edges, 'TB');
  }, [root]);

  return (
    <div className="h-[min(70vh,720px)] w-full overflow-hidden rounded-xl border border-border/60 bg-muted/20">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ padding: 0.18 }}
        minZoom={0.2}
        maxZoom={1.75}
        nodesDraggable={false}
        nodesConnectable={false}
        elementsSelectable
        panOnScroll
        zoomOnScroll
        zoomOnPinch
        proOptions={{ hideAttribution: true }}
      >
        <Background gap={18} size={1} color="hsl(var(--border))" />
        <Controls
          position="bottom-left"
          showInteractive={false}
          className="!overflow-hidden !rounded-lg !border !border-border/60 !bg-card !shadow-sm"
        />
        <MiniMap
          position="bottom-right"
          pannable
          zoomable
          className="!overflow-hidden !rounded-lg !border !border-border/60 !bg-card"
          nodeColor={(n) => {
            const role = (n.data as { role?: string } | undefined)?.role;
            if (role === 'super_admin') return '#1a0b38';
            if (role === 'admin') return '#f75803';
            if (role === 'reseller') return '#0ea5e9';
            return '#94a3b8';
          }}
        />
      </ReactFlow>
    </div>
  );
}

export function HierarchyGraph({ root }: { root: HierarchyNode }) {
  return (
    <ReactFlowProvider>
      <HierarchyGraphInner root={root} />
    </ReactFlowProvider>
  );
}
