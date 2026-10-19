'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Background,
  Controls,
  MiniMap,
  Panel,
  ReactFlow,
  ReactFlowProvider,
  useReactFlow,
  type ColorMode,
  type NodeMouseHandler,
  type NodeTypes,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import '../styles/hierarchy-flow.css';
import {
  ArrowDownUp,
  ArrowLeftRight,
  Focus,
  Maximize2,
  Minimize2,
} from 'lucide-react';
import { useTheme } from 'next-themes';
import { useTranslations } from '@/i18n/locale-context';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { HierarchyNode } from '../types';
import {
  collectExpandableIds,
  defaultExpandedIds,
  flattenHierarchy,
  layoutHierarchy,
} from '../lib/layout';
import { HierarchyNodeComponent } from './HierarchyNode';

const nodeTypes: NodeTypes = {
  hierarchy: HierarchyNodeComponent,
};

type LayoutDir = 'TB' | 'LR';

interface HierarchyGraphInnerProps {
  root: HierarchyNode;
  query: string;
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  layout: LayoutDir;
}

function HierarchyGraphInner({
  root,
  query,
  selectedId,
  onSelect,
  layout,
}: HierarchyGraphInnerProps) {
  const t = useTranslations();
  const { fitView } = useReactFlow();
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';
  const colorMode: ColorMode = isDark ? 'dark' : 'light';
  const [expandedIds, setExpandedIds] = useState(() => defaultExpandedIds(root));
  const [syncedRoot, setSyncedRoot] = useState(root);

  if (root !== syncedRoot) {
    setSyncedRoot(root);
    setExpandedIds(defaultExpandedIds(root));
  }

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void fitView({ padding: 0.16, duration: 280, maxZoom: 1.05 });
    }, 40);
    return () => window.clearTimeout(timer);
  }, [expandedIds, layout, root, fitView]);

  const { nodes, edges } = useMemo(() => {
    const flat = flattenHierarchy(root, expandedIds, layout, query, selectedId, isDark);
    return layoutHierarchy(flat.nodes, flat.edges, layout);
  }, [root, expandedIds, layout, query, selectedId, isDark]);

  const onNodeClick: NodeMouseHandler = useCallback(
    (_event, node) => {
      onSelect(node.id);
      const data = node.data as { expandable?: boolean };
      if (!data.expandable) return;
      setExpandedIds((prev) => {
        const next = new Set(prev);
        if (next.has(node.id)) next.delete(node.id);
        else next.add(node.id);
        return next;
      });
    },
    [onSelect],
  );

  const ariaLabelConfig = useMemo(
    () => ({
      'node.a11yDescription.default': t(
        'shared.hierarchy.flow.nodeDescription',
        'Press enter or space to select a node. Press delete to remove it and escape to cancel.',
      ),
      'edge.a11yDescription.default': t(
        'shared.hierarchy.flow.edgeDescription',
        'Press enter or space to select an edge. You can then press delete to remove it or escape to cancel.',
      ),
      'controls.ariaLabel': t('shared.hierarchy.flow.controls', 'Control Panel'),
      'controls.zoomIn.ariaLabel': t('shared.hierarchy.flow.zoomIn', 'Zoom In'),
      'controls.zoomOut.ariaLabel': t('shared.hierarchy.flow.zoomOut', 'Zoom Out'),
      'controls.fitView.ariaLabel': t('shared.hierarchy.flow.fitView', 'Fit View'),
      'minimap.ariaLabel': t('shared.hierarchy.flow.minimap', 'Mini Map'),
      'handle.ariaLabel': t('shared.hierarchy.flow.handle', 'Handle'),
    }),
    [t],
  );

  const expandAll = () => setExpandedIds(new Set(collectExpandableIds(root)));
  const collapseDeep = () => setExpandedIds(defaultExpandedIds(root));

  return (
    <div
      className={cn(
        'hierarchy-flow relative h-[min(72vh,760px)] w-full overflow-hidden rounded-xl border',
        'border-border/60 bg-muted/20',
        'dark:border-white/10 dark:bg-zinc-950/80',
        isDark && 'dark',
      )}
    >
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        colorMode={colorMode}
        ariaLabelConfig={ariaLabelConfig}
        onNodeClick={onNodeClick}
        onPaneClick={() => onSelect(null)}
        fitView
        fitViewOptions={{ padding: 0.16, maxZoom: 1.05 }}
        minZoom={0.2}
        maxZoom={2}
        nodesDraggable={false}
        nodesConnectable={false}
        elementsSelectable
        panOnScroll
        zoomOnScroll
        zoomOnPinch
        zoomOnDoubleClick={false}
        proOptions={{ hideAttribution: true }}
      >
        <Background
          gap={18}
          size={1.25}
          color={isDark ? 'oklch(0.28 0.02 250)' : 'var(--border)'}
        />
        <Controls
          position="bottom-left"
          showInteractive={false}
          className="!overflow-hidden !rounded-lg !border !border-border/60 !bg-card !shadow-md dark:!border-white/15 dark:!bg-zinc-900"
        />
        <MiniMap
          position="bottom-right"
          pannable
          zoomable
          bgColor={isDark ? 'hsl(222 30% 12%)' : undefined}
          maskColor={isDark ? 'rgba(0,0,0,0.5)' : 'rgba(0,0,0,0.1)'}
          className="!overflow-hidden !rounded-lg !border !border-border/60 !bg-card dark:!border-white/15"
          nodeColor={(n) => {
            const role = (n.data as { role?: string } | undefined)?.role;
            if (role === 'super_admin') return isDark ? '#a78bfa' : '#10141a';
            if (role === 'admin') return '#e85a1a';
            if (role === 'reseller') return isDark ? '#38bdf8' : '#0ea5e9';
            return isDark ? '#94a3b8' : '#64748b';
          }}
          nodeStrokeColor={isDark ? 'rgba(255,255,255,0.2)' : 'transparent'}
        />
        <Panel position="top-right" className="flex flex-wrap gap-1.5">
          <Button
            type="button"
            size="sm"
            variant="secondary"
            className="h-8 border border-border/50 bg-card text-xs shadow-sm dark:border-white/10 dark:bg-zinc-900"
            onClick={() => void fitView({ padding: 0.16, duration: 280, maxZoom: 1.05 })}
          >
            <Focus className="mr-1.5 h-3.5 w-3.5" />
            {t('shared.hierarchy.fit', 'Fit')}
          </Button>
          <Button
            type="button"
            size="sm"
            variant="secondary"
            className="h-8 border border-border/50 bg-card text-xs shadow-sm dark:border-white/10 dark:bg-zinc-900"
            onClick={expandAll}
          >
            <Maximize2 className="mr-1.5 h-3.5 w-3.5" />
            {t('shared.hierarchy.expand', 'Expand')}
          </Button>
          <Button
            type="button"
            size="sm"
            variant="secondary"
            className="h-8 border border-border/50 bg-card text-xs shadow-sm dark:border-white/10 dark:bg-zinc-900"
            onClick={collapseDeep}
          >
            <Minimize2 className="mr-1.5 h-3.5 w-3.5" />
            {t('shared.hierarchy.collapse', 'Collapse')}
          </Button>
        </Panel>
      </ReactFlow>
    </div>
  );
}

export function HierarchyGraph({
  root,
  query,
  selectedId,
  onSelect,
  layout,
}: {
  root: HierarchyNode;
  query: string;
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  layout: LayoutDir;
}) {
  return (
    <ReactFlowProvider>
      <HierarchyGraphInner
        root={root}
        query={query}
        selectedId={selectedId}
        onSelect={onSelect}
        layout={layout}
      />
    </ReactFlowProvider>
  );
}

export function HierarchyLayoutToggle({
  layout,
  onChange,
}: {
  layout: LayoutDir;
  onChange: (next: LayoutDir) => void;
}) {
  const t = useTranslations();
  return (
    <div
      role="group"
      aria-label={t('shared.hierarchy.layoutLabel', 'Graph layout')}
      className="inline-flex overflow-hidden rounded-lg border border-border/60 bg-card dark:border-white/10"
    >
      <button
        type="button"
        onClick={() => onChange('TB')}
        className={cn(
          'inline-flex h-8 items-center gap-1.5 px-2.5 text-xs font-medium transition-colors',
          layout === 'TB' ? 'bg-muted text-foreground' : 'text-muted-foreground hover:text-foreground',
        )}
      >
        <ArrowDownUp className="h-3.5 w-3.5" />
        {t('shared.hierarchy.layoutTopDown', 'Top–down')}
      </button>
      <button
        type="button"
        onClick={() => onChange('LR')}
        className={cn(
          'inline-flex h-8 items-center gap-1.5 border-l border-border/60 px-2.5 text-xs font-medium transition-colors dark:border-white/10',
          layout === 'LR' ? 'bg-muted text-foreground' : 'text-muted-foreground hover:text-foreground',
        )}
      >
        <ArrowLeftRight className="h-3.5 w-3.5" />
        {t('shared.hierarchy.layoutLeftRight', 'Left–right')}
      </button>
    </div>
  );
}
