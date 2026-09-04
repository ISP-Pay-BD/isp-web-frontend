'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PageHeader } from '@/features/admin/shared';
import { useNetworkMap } from '../hooks/useNetwork';
import type { NetworkMapNodeItem } from '@/data/admin/network-ops.data';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { PageSkeleton } from '@/components/shared/LoadingSkeleton';
import {
  MapPin,
  Layers,
  RadioTower,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Wifi,
  WifiOff,
  Server,
  Globe,
} from 'lucide-react';
import { staggerContainer, fadeUp, hoverLift } from '@/lib/animations';

const levelColors: Record<string, { bg: string; border: string; text: string; dot: string; ring: string }> = {
  Root: { bg: 'bg-red-500/10', border: 'border-red-500/40', text: 'text-red-500', dot: 'bg-red-500', ring: 'ring-red-500/30' },
  L1: { bg: 'bg-blue-500/10', border: 'border-blue-500/40', text: 'text-blue-500', dot: 'bg-blue-500', ring: 'ring-blue-500/30' },
  L2: { bg: 'bg-emerald-500/10', border: 'border-emerald-500/40', text: 'text-emerald-500', dot: 'bg-emerald-500', ring: 'ring-emerald-500/30' },
  L3: { bg: 'bg-amber-500/10', border: 'border-amber-500/40', text: 'text-amber-500', dot: 'bg-amber-500', ring: 'ring-amber-500/30' },
  L4: { bg: 'bg-purple-500/10', border: 'border-purple-500/40', text: 'text-purple-500', dot: 'bg-purple-500', ring: 'ring-purple-500/30' },
  'L5+': { bg: 'bg-cyan-500/10', border: 'border-cyan-500/40', text: 'text-cyan-500', dot: 'bg-cyan-500', ring: 'ring-cyan-500/30' },
};

export function NetworkMapPage() {
  const { data: nodes = [], isLoading } = useNetworkMap();
  const [selectedLevel, setSelectedLevel] = useState<string>('all');
  const [activeNode, setActiveNode] = useState<NetworkMapNodeItem | null>(null);
  const [zoom, setZoom] = useState<number>(1);

  const filtered = nodes.filter((n) => selectedLevel === 'all' || n.level === selectedLevel);

  if (isLoading) {
    return <PageSkeleton variant="dashboard" rows={5} />;
  }

  return (
    <motion.div
      className="space-y-6 max-w-7xl mx-auto pb-12"
      variants={staggerContainer}
      initial={false}
      animate="show"
    >
      {/* Header */}
      <motion.div variants={fadeUp}>
        <PageHeader
          title="Network Geographic Mapping"
          subtitle="Geographic distribution of NOC core, distribution POPs, OLT headends, and customer fiber nodes"
          breadcrumb={[
            { label: 'Dashboard', url: '/admin/dashboard' },
            { label: 'Network' },
            { label: 'Mapping' },
          ]}
        />
      </motion.div>

      {/* Map Card */}
      <motion.div variants={fadeUp}>
        <Card className="border-border/60 overflow-hidden shadow-sm ring-1 ring-foreground/5">
          <CardHeader className="border-b border-border/50 bg-muted/20 py-3.5 px-5 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-2.5">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10">
                <RadioTower className="h-4 w-4 text-primary" />
              </span>
              <div>
                <CardTitle className="text-sm font-semibold">Live Bangladesh Topology Map</CardTitle>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  {filtered.length} of {nodes.length} nodes displayed
                </p>
              </div>
            </div>

            {/* Level Filter Legend */}
            <div className="flex items-center gap-1.5 flex-wrap" aria-label="Marker hierarchy levels">
              <motion.button
                whileHover={hoverLift}
                whileTap={{ scale: 0.97 }}
                onClick={() => setSelectedLevel('all')}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold border transition-all duration-200 ${
                  selectedLevel === 'all'
                    ? 'bg-primary text-primary-foreground border-primary shadow-sm shadow-primary/20'
                    : 'bg-card border-border/60 hover:border-primary/30 hover:bg-primary/5 text-muted-foreground hover:text-foreground'
                }`}
              >
                All Nodes ({nodes.length})
              </motion.button>
              {(['Root', 'L1', 'L2', 'L3', 'L4', 'L5+'] as const).map((lvl) => {
                const count = nodes.filter((n) => n.level === lvl).length;
                const style = levelColors[lvl];
                const isSelected = selectedLevel === lvl;
                return (
                  <motion.button
                    key={lvl}
                    whileHover={hoverLift}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => setSelectedLevel(lvl)}
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold border transition-all duration-200 ${
                      isSelected
                        ? `ring-2 ${style.ring} bg-card border-current ${style.text}`
                        : 'bg-card border-border/60 hover:border-primary/30 text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    <span className={`h-2 w-2 rounded-full ${style.dot} ${isSelected ? 'animate-pulse' : ''}`} />
                    <span>{lvl}</span>
                    <span className="text-[10px] opacity-60">({count})</span>
                  </motion.button>
                );
              })}
            </div>
          </CardHeader>

          <CardContent className="p-0 relative min-h-[560px] bg-gradient-to-br from-slate-950/5 via-background to-slate-950/5 dark:from-slate-950/40 dark:via-background dark:to-slate-950/40 overflow-hidden flex flex-col md:flex-row">
            {/* Visual SVG Map Canvas */}
            <div className="flex-1 relative p-6 flex items-center justify-center min-h-[480px]">
              {/* Map Controls */}
              <div className="absolute top-4 right-4 z-10 flex flex-col gap-1.5 bg-card/90 backdrop-blur-md rounded-xl border border-border/60 p-1.5 shadow-lg">
                <motion.div whileHover={hoverLift}>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 rounded-lg"
                    onClick={() => setZoom((z) => Math.min(1.8, z + 0.15))}
                  >
                    <ZoomIn className="h-4 w-4" />
                  </Button>
                </motion.div>
                <motion.div whileHover={hoverLift}>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 rounded-lg"
                    onClick={() => setZoom((z) => Math.max(0.7, z - 0.15))}
                  >
                    <ZoomOut className="h-4 w-4" />
                  </Button>
                </motion.div>
                <div className="h-px bg-border/50 my-0.5" />
                <motion.div whileHover={hoverLift}>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 rounded-lg"
                    onClick={() => {
                      setZoom(1);
                      setActiveNode(null);
                      setSelectedLevel('all');
                    }}
                  >
                    <RotateCcw className="h-3.5 w-3.5" />
                  </Button>
                </motion.div>
                <div className="text-center text-[10px] text-muted-foreground font-mono py-0.5">
                  {Math.round(zoom * 100)}%
                </div>
              </div>

              {/* Simulated Geographic Canvas */}
              <motion.div
                className="relative w-full max-w-3xl aspect-[16/10] rounded-2xl border border-border/50 bg-card/40 backdrop-blur-sm shadow-inner overflow-hidden"
                animate={{ scale: zoom }}
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              >
                {/* Radial Coordinate Grid */}
                <svg className="absolute inset-0 w-full h-full stroke-muted/20" xmlns="http://www.w3.org/2000/svg">
                  <defs>
                    <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                      <path d="M 40 0 L 0 0 0 40" fill="none" strokeWidth="0.5" />
                    </pattern>
                    <radialGradient id="gridGlow" cx="50%" cy="50%" r="50%">
                      <stop offset="0%" stopColor="currentColor" stopOpacity="0.03" />
                      <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
                    </radialGradient>
                  </defs>
                  <rect width="100%" height="100%" fill="url(#grid)" />
                  <rect width="100%" height="100%" fill="url(#gridGlow)" className="text-primary" />

                  {/* Connecting fiber lines */}
                  <motion.path
                    d="M 480 180 L 360 260 L 290 380 M 480 180 L 520 220 L 540 280"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeDasharray="6 4"
                    className="text-primary/30"
                    initial={{ pathLength: 0, opacity: 0 }}
                    animate={{ pathLength: 1, opacity: 1 }}
                    transition={{ duration: 2, ease: 'easeInOut', delay: 0.5 }}
                  />
                  <motion.path
                    d="M 290 380 L 200 420 M 540 280 L 600 340 L 580 400"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1"
                    strokeDasharray="4 4"
                    className="text-primary/20"
                    initial={{ pathLength: 0, opacity: 0 }}
                    animate={{ pathLength: 1, opacity: 1 }}
                    transition={{ duration: 2, ease: 'easeInOut', delay: 0.8 }}
                  />
                </svg>

                {/* Nodes rendered on geographic grid */}
                <AnimatePresence mode="popLayout">
                  {filtered.map((node, index) => {
                    const yPercent = Math.min(85, Math.max(15, 100 - ((node.lat - 23.70) / 0.22) * 100));
                    const xPercent = Math.min(85, Math.max(15, ((node.lng - 90.32) / 0.12) * 100));
                    const style = levelColors[node.level];
                    const isActive = activeNode?.id === node.id;

                    return (
                      <motion.div
                        key={node.id}
                        layout
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.04 }}
                        onClick={() => setActiveNode(node)}
                        style={{ left: `${xPercent}%`, top: `${yPercent}%` }}
                        className="absolute -translate-x-1/2 -translate-y-1/2 group cursor-pointer z-10"
                      >
                        <div className="relative flex items-center justify-center">
                          {/* Ping ring */}
                          <motion.span
                            className={`absolute h-8 w-8 rounded-full opacity-40 ${style.dot}`}
                            animate={isActive ? { scale: [1, 1.6, 1], opacity: [0.4, 0, 0.4] } : { scale: [1, 1.3, 1], opacity: [0.3, 0.1, 0.3] }}
                            transition={{ duration: isActive ? 1.5 : 2.5, repeat: Infinity, ease: 'easeInOut' }}
                          />
                          {/* Node dot */}
                          <motion.div
                            className={`h-7 w-7 rounded-full border-2 flex items-center justify-center text-[10px] font-bold shadow-lg ${
                              isActive ? 'scale-125 ring-2 ring-offset-2 ring-offset-background' : 'group-hover:scale-110'
                            } ${style.dot} ${style.ring} text-white border-white/80`}
                            whileHover={{ scale: 1.2 }}
                            transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                          >
                            {node.level.charAt(0)}
                          </motion.div>
                        </div>

                        {/* Tooltip on hover */}
                        <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 hidden group-hover:flex flex-col items-center pointer-events-none z-20">
                          <div className="bg-popover text-popover-foreground border border-border/60 text-[11px] font-semibold px-2.5 py-1.5 rounded-lg shadow-xl whitespace-nowrap backdrop-blur-sm">
                            {node.name}
                            <span className="ml-1.5 text-muted-foreground font-normal">{node.level}</span>
                          </div>
                          <div className="w-2 h-2 bg-popover border-r border-b border-border/60 rotate-45 -mt-1" />
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </motion.div>
            </div>

            {/* Node Inspector Sidebar */}
            <div className="w-full md:w-80 border-t md:border-t-0 md:border-l border-border/50 bg-card/80 backdrop-blur-sm p-5 space-y-4">
              <h3 className="text-sm font-semibold flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-md bg-primary/10">
                  <Layers className="h-3.5 w-3.5 text-primary" />
                </span>
                Node Inspector
              </h3>

              <AnimatePresence mode="wait">
                {activeNode ? (
                  <motion.div
                    key={activeNode.id}
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    transition={{ duration: 0.2 }}
                    className="space-y-4"
                  >
                    <div className="space-y-1">
                      <div className="font-bold text-sm text-foreground">{activeNode.name}</div>
                      <div className="text-xs text-muted-foreground flex items-center gap-1.5">
                        <MapPin className="h-3 w-3" />
                        {activeNode.zone}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className={`font-mono text-[10px] ${levelColors[activeNode.level].text} ${levelColors[activeNode.level].border}`}>
                        {activeNode.level}
                      </Badge>
                      <Badge
                        variant={activeNode.status === 'online' ? 'default' : 'destructive'}
                        className="capitalize text-[10px] gap-1"
                      >
                        {activeNode.status === 'online' ? (
                          <Wifi className="h-2.5 w-2.5" />
                        ) : (
                          <WifiOff className="h-2.5 w-2.5" />
                        )}
                        {activeNode.status}
                      </Badge>
                    </div>

                    <div className="space-y-2.5 border-t border-border/50 pt-3">
                      {activeNode.ip && (
                        <div className="flex justify-between items-center">
                          <span className="text-xs text-muted-foreground flex items-center gap-1.5">
                            <Globe className="h-3 w-3" />
                            IP Address
                          </span>
                          <code className="font-mono text-xs bg-muted/50 px-1.5 py-0.5 rounded">{activeNode.ip}</code>
                        </div>
                      )}
                      {activeNode.deviceModel && (
                        <div className="flex justify-between items-center">
                          <span className="text-xs text-muted-foreground flex items-center gap-1.5">
                            <Server className="h-3 w-3" />
                            Hardware
                          </span>
                          <span className="text-xs font-medium">{activeNode.deviceModel}</span>
                        </div>
                      )}
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-muted-foreground">Coordinates</span>
                        <span className="font-mono text-xs">{activeNode.lat}, {activeNode.lng}</span>
                      </div>
                      {activeNode.connectedCount !== undefined && (
                        <div className="flex justify-between items-center">
                          <span className="text-xs text-muted-foreground">Connected</span>
                          <span className="text-xs font-bold text-foreground">{activeNode.connectedCount} users</span>
                        </div>
                      )}
                    </div>

                    <motion.div whileHover={hoverLift}>
                      <Button
                        size="sm"
                        variant="outline"
                        className="w-full mt-2 text-xs"
                        onClick={() => setActiveNode(null)}
                      >
                        Clear Selection
                      </Button>
                    </motion.div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="empty"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="text-center py-12 text-muted-foreground space-y-3"
                  >
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-muted/30 mx-auto">
                      <MapPin className="h-6 w-6 opacity-40" />
                    </div>
                    <div>
                      <p className="text-xs font-medium">No node selected</p>
                      <p className="text-[11px] text-muted-foreground/70 mt-1">Click any node on the map to inspect telemetry, IP assignment, and fiber hierarchy.</p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}
