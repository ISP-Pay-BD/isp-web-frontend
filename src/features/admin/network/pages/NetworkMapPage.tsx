'use client';

import { useState } from 'react';
import { PageHeader } from '@/features/admin/shared';
import { useNetworkMap } from '../hooks/useNetwork';
import type { NetworkMapNodeItem } from '@/data/admin/network-ops.data';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { PageSkeleton } from '@/components/shared/LoadingSkeleton';
import { MapPin, Layers, RadioTower, Globe, ZoomIn, ZoomOut, CheckCircle2, AlertCircle } from 'lucide-react';

const levelColors: Record<string, { bg: string; border: string; text: string; dot: string }> = {
  Root: { bg: 'bg-red-500/10', border: 'border-red-500/40', text: 'text-red-500', dot: 'bg-red-500' },
  L1: { bg: 'bg-blue-500/10', border: 'border-blue-500/40', text: 'text-blue-500', dot: 'bg-blue-500' },
  L2: { bg: 'bg-emerald-500/10', border: 'border-emerald-500/40', text: 'text-emerald-500', dot: 'bg-emerald-500' },
  L3: { bg: 'bg-amber-500/10', border: 'border-amber-500/40', text: 'text-amber-500', dot: 'bg-amber-500' },
  L4: { bg: 'bg-purple-500/10', border: 'border-purple-500/40', text: 'text-purple-500', dot: 'bg-purple-500' },
  'L5+': { bg: 'bg-cyan-500/10', border: 'border-cyan-500/40', text: 'text-cyan-500', dot: 'bg-cyan-500' },
};

export function NetworkMapPage() {
  const { data: nodes = [], isLoading } = useNetworkMap();
  const [selectedLevel, setSelectedLevel] = useState<string>('all');
  const [activeNode, setActiveNode] = useState<NetworkMapNodeItem | null>(null);
  const [zoom, setZoom] = useState<number>(1);

  const filtered = nodes.filter((n) => selectedLevel === 'all' || n.level === selectedLevel);

  if (isLoading) {
    return <PageSkeleton rows={5} />;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Network Geographic Mapping"
        subtitle="Geographic distribution of NOC core, distribution POPs, OLT headends, and customer fiber nodes"
        breadcrumb={[
          { label: 'Dashboard', url: '/admin/dashboard' },
          { label: 'Network' },
          { label: 'Mapping' },
        ]}
      />

      {/* Map Card */}
      <Card className="border-border/60 overflow-hidden">
        <CardHeader className="border-b bg-muted/20 py-3.5 px-5 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-2">
            <RadioTower className="h-4 w-4 text-primary" />
            <CardTitle className="text-sm font-semibold">Live Bangladesh Topology Map</CardTitle>
          </div>

          {/* Level Filter Legend (Mirroring PHP reference map.php) */}
          <div className="flex items-center gap-2 flex-wrap" aria-label="Marker hierarchy levels">
            <button
              onClick={() => setSelectedLevel('all')}
              className={`px-2.5 py-1 rounded-md text-xs font-medium border transition-colors ${
                selectedLevel === 'all' ? 'bg-primary text-primary-foreground border-primary' : 'bg-background hover:bg-muted'
              }`}
            >
              All Nodes ({nodes.length})
            </button>
            {(['Root', 'L1', 'L2', 'L3', 'L4', 'L5+'] as const).map((lvl) => {
              const count = nodes.filter((n) => n.level === lvl).length;
              const style = levelColors[lvl];
              const isSelected = selectedLevel === lvl;
              return (
                <button
                  key={lvl}
                  onClick={() => setSelectedLevel(lvl)}
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium border transition-colors ${
                    isSelected ? 'ring-2 ring-primary ring-offset-1 bg-background' : 'bg-background hover:bg-muted'
                  }`}
                >
                  <span className={`h-2 w-2 rounded-full ${style.dot}`} />
                  <span>{lvl}</span>
                  <span className="text-[10px] text-muted-foreground">({count})</span>
                </button>
              );
            })}
          </div>
        </CardHeader>

        <CardContent className="p-0 relative min-h-[560px] bg-slate-950/5 dark:bg-slate-950/60 overflow-hidden flex flex-col md:flex-row">
          {/* Visual SVG Map Canvas with Interactive Bangladesh Grid */}
          <div className="flex-1 relative p-6 flex items-center justify-center min-h-[480px]">
            {/* Map Controls */}
            <div className="absolute top-4 right-4 z-10 flex flex-col gap-1.5 bg-background/90 backdrop-blur rounded-lg border p-1 shadow-sm">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => setZoom((z) => Math.min(1.8, z + 0.15))}
              >
                <ZoomIn className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => setZoom((z) => Math.max(0.7, z - 0.15))}
              >
                <ZoomOut className="h-4 w-4" />
              </Button>
            </div>

            {/* Simulated Geographic Canvas */}
            <div
              className="relative w-full max-w-3xl aspect-[16/10] rounded-2xl border border-border/60 bg-card/60 backdrop-blur shadow-inner overflow-hidden transition-transform duration-200"
              style={{ transform: `scale(${zoom})` }}
            >
              {/* Radial Coordinate Grid */}
              <svg className="absolute inset-0 w-full h-full stroke-muted/30" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                    <path d="M 40 0 L 0 0 0 40" fill="none" strokeWidth="0.5" />
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#grid)" />
                {/* Connecting fiber line simulation between nodes */}
                <path
                  d="M 480 180 L 360 260 L 290 380 M 480 180 L 520 220 L 540 280"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeDasharray="4 4"
                  className="stroke-primary/40 animate-pulse"
                />
              </svg>

              {/* Pins rendered by calculated lat/lng on Dhaka region grid */}
              {filtered.map((node, index) => {
                // Map lat 23.70 - 23.90 to Y % and lng 90.30 - 90.45 to X %
                const yPercent = Math.min(85, Math.max(15, 100 - ((node.lat - 23.70) / 0.22) * 100));
                const xPercent = Math.min(85, Math.max(15, ((node.lng - 90.32) / 0.12) * 100));
                const style = levelColors[node.level];
                const isActive = activeNode?.id === node.id;

                return (
                  <div
                    key={node.id}
                    onClick={() => setActiveNode(node)}
                    style={{ left: `${xPercent}%`, top: `${yPercent}%` }}
                    className="absolute -translate-x-1/2 -translate-y-1/2 group cursor-pointer z-10"
                  >
                    <div className="relative flex items-center justify-center">
                      <span className={`absolute h-7 w-7 rounded-full opacity-60 animate-ping ${style.dot}`} />
                      <div
                        className={`h-6 w-6 rounded-full border-2 flex items-center justify-center text-[10px] font-bold shadow-lg transition-transform group-hover:scale-125 ${
                          isActive ? 'scale-125 ring-2 ring-primary ring-offset-2' : ''
                        } ${style.dot} text-white border-white`}
                      >
                        {node.level.charAt(0)}
                      </div>
                    </div>

                    {/* Tooltip on hover */}
                    <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-1.5 hidden group-hover:flex flex-col items-center pointer-events-none z-20">
                      <div className="bg-popover text-popover-foreground border text-[11px] font-medium px-2 py-1 rounded shadow-md whitespace-nowrap">
                        {node.name}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Node Inspector Sidebar Panel */}
          <div className="w-full md:w-80 border-t md:border-t-0 md:border-l bg-card p-5 space-y-4">
            <h3 className="text-sm font-semibold flex items-center gap-2">
              <Layers className="h-4 w-4 text-primary" />
              Node Inspector
            </h3>

            {activeNode ? (
              <div className="space-y-3.5 text-xs">
                <div className="space-y-1">
                  <div className="font-bold text-sm text-foreground">{activeNode.name}</div>
                  <div className="text-muted-foreground">{activeNode.zone}</div>
                </div>

                <div className="flex items-center gap-2">
                  <Badge variant="outline" className={`font-mono ${levelColors[activeNode.level].text}`}>
                    Level: {activeNode.level}
                  </Badge>
                  <Badge
                    variant={activeNode.status === 'online' ? 'default' : 'destructive'}
                    className="capitalize text-[10px]"
                  >
                    {activeNode.status}
                  </Badge>
                </div>

                <div className="space-y-2 border-t pt-3">
                  {activeNode.ip && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">IP Address:</span>
                      <code className="font-mono">{activeNode.ip}</code>
                    </div>
                  )}
                  {activeNode.deviceModel && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Hardware:</span>
                      <span className="font-medium">{activeNode.deviceModel}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Coordinates:</span>
                    <span className="font-mono">{activeNode.lat}, {activeNode.lng}</span>
                  </div>
                  {activeNode.connectedCount !== undefined && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Connected:</span>
                      <span className="font-bold text-foreground">{activeNode.connectedCount} users</span>
                    </div>
                  )}
                </div>

                <Button
                  size="sm"
                  variant="outline"
                  className="w-full mt-2"
                  onClick={() => setActiveNode(null)}
                >
                  Clear Selection
                </Button>
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground space-y-2">
                <MapPin className="h-8 w-8 mx-auto opacity-40" />
                <p className="text-xs">Click any node on the map to inspect telemetry, IP assignment, and fiber hierarchy.</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
