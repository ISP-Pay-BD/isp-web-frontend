'use client';

import { useEffect, useRef, useState, useCallback, type ElementType } from 'react';
import { Zap } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useMotionSafe } from '@/lib/animations';

export interface TimelineItem {
  id: number;
  title: string;
  subtitle: string;
  content: string;
  icon: ElementType;
  relatedIds: number[];
  status: 'completed' | 'in-progress' | 'pending';
  energy: number;
  color: string;
}

interface RadialOrbitalTimelineProps {
  timelineData: TimelineItem[];
  className?: string;
  radius?: number;
  hubLabel?: string;
}

export default function RadialOrbitalTimeline({
  timelineData,
  className,
  radius = 150,
  hubLabel = 'ISP Pay BD',
}: RadialOrbitalTimelineProps) {
  const { reduced } = useMotionSafe();
  const [rotationAngle, setRotationAngle] = useState(0);
  const [autoRotate, setAutoRotate] = useState(!reduced);
  const [activeNodeId, setActiveNodeId] = useState<number | null>(null);
  const [hubActive, setHubActive] = useState(false);
  const [hoveredNodeId, setHoveredNodeId] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const nodeRefs = useRef<Map<number, HTMLDivElement>>(new Map());

  const dismissAll = useCallback(() => {
    setActiveNodeId(null);
    setHubActive(false);
    setAutoRotate(!reduced);
  }, [reduced]);

  // Dismiss on any click outside a node or hub
  const handleContainerClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      const target = e.target as HTMLElement;
      if (!target.closest('[data-orbital-node]') && !target.closest('[data-orbital-hub]')) {
        dismissAll();
      }
    },
    [dismissAll],
  );

  const toggleHub = useCallback(() => {
    setHubActive((prev) => {
      if (prev) {
        setAutoRotate(!reduced);
        return false;
      }
      setActiveNodeId(null);
      setAutoRotate(false);
      return true;
    });
  }, [reduced]);

  const getRelatedItems = (itemId: number): number[] => {
    const item = timelineData.find((i) => i.id === itemId);
    return item ? item.relatedIds : [];
  };

  const toggleItem = useCallback(
    (id: number) => {
      setHubActive(false);
      setActiveNodeId((prev) => {
        if (prev === id) {
          setAutoRotate(!reduced);
          return null;
        }
        setAutoRotate(false);
        return id;
      });
    },
    [reduced],
  );

  useEffect(() => {
    if (reduced) {
      setAutoRotate(false);
      return;
    }
    if (!autoRotate) return;

    const timer = window.setInterval(() => {
      setRotationAngle((prev) => Number(((prev + 0.15) % 360).toFixed(3)));
    }, 50);

    return () => window.clearInterval(timer);
  }, [autoRotate, reduced]);

  const calculateNodePosition = (index: number, total: number) => {
    const angle = ((index / total) * 360 + rotationAngle) % 360;
    const radian = (angle * Math.PI) / 180;
    const x = radius * Math.cos(radian);
    const y = radius * Math.sin(radian);
    const zIndex = Math.round(100 + 50 * Math.cos(radian));
    const depth = (1 + Math.sin(radian)) / 2;
    const opacity = Math.max(0.4, 0.4 + 0.6 * depth);
    const scale = 0.8 + 0.2 * depth;
    // cardPlacement: 'below' if node is in upper half, 'above' if in lower half
    const cardPlacement = angle > 90 && angle < 270 ? 'above' : 'below';
    return { x, y, zIndex, opacity, scale, angle, cardPlacement };
  };

  const isRelatedToActive = (itemId: number): boolean => {
    if (!activeNodeId) return false;
    return getRelatedItems(activeNodeId).includes(itemId);
  };

  const activeItem = activeNodeId ? timelineData.find((i) => i.id === activeNodeId) : null;
  const ringSize = radius * 2;

  return (
    <div
      ref={containerRef}
      onClick={handleContainerClick}
      className={cn(
        'relative flex h-[420px] w-full items-center justify-center overflow-visible sm:h-[460px]',
        className,
      )}
    >
      {/* Ambient glow */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute left-1/2 top-1/2 h-[300px] w-[300px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-landing-cta/[0.05] blur-[80px]" />
      </div>

      <div className="relative flex h-full w-full max-w-lg items-center justify-center">
        <div
          className="absolute inset-0 flex items-center justify-center"
          style={{ perspective: '800px' }}
        >
          {/* Orbit rings */}
          <div
            className="absolute rounded-full border border-white/[0.06]"
            style={{ width: ringSize, height: ringSize }}
          />
          <div
            className="absolute rounded-full border border-white/[0.04]"
            style={{ width: ringSize * 0.68, height: ringSize * 0.68 }}
          />
          <div
            className="absolute rounded-full border border-dashed border-white/[0.03]"
            style={{ width: ringSize * 1.12, height: ringSize * 1.12 }}
          />

          {/* Center hub */}
          <div
            data-orbital-hub
            className="absolute z-10 flex flex-col items-center justify-center cursor-pointer"
            onClick={(e) => {
              e.stopPropagation();
              toggleHub();
            }}
          >
            <div className="relative">
              <div className={cn(
                "absolute inset-0 -m-6 animate-ping rounded-full border border-landing-cta/20 opacity-30 transition-opacity",
                hubActive && "opacity-60",
              )} />
              <div
                className={cn(
                  "absolute inset-0 -m-10 animate-ping rounded-full border border-landing-cta/10 opacity-20 transition-opacity",
                  hubActive && "opacity-40",
                )}
                style={{ animationDelay: '0.6s' }}
              />
              <div className={cn(
                "relative flex h-16 w-16 items-center justify-center rounded-full border transition-all duration-300",
                hubActive
                  ? "border-landing-cta/50 bg-gradient-to-br from-white/15 via-landing-cta/30 to-amber-500/15 shadow-[0_0_60px_rgba(247,88,3,0.35),inset_0_1px_0_rgba(255,255,255,0.2)] backdrop-blur-xl scale-110"
                  : "border-white/20 bg-gradient-to-br from-white/10 via-landing-cta/20 to-amber-500/10 shadow-[0_0_50px_rgba(247,88,3,0.2),inset_0_1px_0_rgba(255,255,255,0.15)] backdrop-blur-xl hover:scale-105 hover:border-white/30",
              )}>
                <div className="absolute inset-[3px] rounded-full bg-gradient-to-br from-[#0c0118] to-[#120228]" />
                <span className="relative px-1 text-center font-landing-display text-[9px] font-bold tracking-wider text-white/90">
                  {hubLabel}
                </span>
              </div>
            </div>

            {/* Hub overview card — macOS style */}
            {hubActive && (
              <div className="absolute top-[5rem] left-1/2 z-50 w-72 -translate-x-1/2 overflow-hidden rounded-2xl border border-white/[0.12] bg-[#0a0114]/95 shadow-[0_25px_80px_rgba(0,0,0,0.7),inset_0_1px_0_rgba(255,255,255,0.08)] backdrop-blur-2xl">
                {/* macOS header */}
                <div className="flex items-center gap-2 border-b border-white/[0.06] px-4 py-2">
                  <div className="flex gap-1.5">
                    <div className="h-2.5 w-2.5 rounded-full bg-white/10" />
                    <div className="h-2.5 w-2.5 rounded-full bg-white/10" />
                    <div className="h-2.5 w-2.5 rounded-full bg-white/10" />
                  </div>
                  <span className="ml-1 text-[10px] font-medium text-white/40">Platform Overview</span>
                </div>

                <div className="p-4">
                  <div className="mb-3 flex items-center gap-2.5">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-landing-cta/20 bg-landing-cta/10">
                      <Zap size={14} className="text-landing-cta" />
                    </div>
                    <div>
                      <div className="text-[11px] font-bold text-white">{hubLabel}</div>
                      <div className="text-[10px] text-white/40">ISP Billing & Operations</div>
                    </div>
                  </div>

                  <p className="text-[11px] leading-relaxed text-white/50 mb-3">
                    Complete platform for ISP operators — billing, router sync, payments, customer management, and network monitoring.
                  </p>

                  {/* Feature grid */}
                  <div className="grid grid-cols-2 gap-1.5">
                    {timelineData.map((item) => {
                      const ItemIcon = item.icon;
                      return (
                        <button
                          key={item.id}
                          type="button"
                          className="flex items-center gap-2 rounded-lg border border-white/[0.06] bg-white/[0.02] px-2.5 py-2 text-left transition-all hover:border-white/[0.12] hover:bg-white/[0.04]"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleItem(item.id);
                          }}
                        >
                          <ItemIcon size={12} style={{ color: item.color }} className="shrink-0" />
                          <div>
                            <div className="text-[9px] font-bold text-white/80">{item.title}</div>
                            <div className="text-[8px] text-white/35">{item.status === 'completed' ? 'Live' : item.status === 'in-progress' ? 'Active' : 'Soon'}</div>
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  {/* Summary stats */}
                  <div className="mt-3 flex items-center gap-3 border-t border-white/[0.06] pt-3">
                    <div className="flex items-center gap-1.5">
                      <div className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                      <span className="text-[9px] text-white/40">
                        {timelineData.filter((i) => i.status === 'completed').length} Live
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <div className="h-1.5 w-1.5 rounded-full bg-landing-cta" />
                      <span className="text-[9px] text-white/40">
                        {timelineData.filter((i) => i.status === 'in-progress').length} Active
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <div className="h-1.5 w-1.5 rounded-full bg-white/30" />
                      <span className="text-[9px] text-white/40">
                        {timelineData.filter((i) => i.status === 'pending').length} Coming
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Nodes */}
          {timelineData.map((item, index) => {
            const pos = calculateNodePosition(index, timelineData.length);
            const isActive = activeNodeId === item.id;
            const isRelated = isRelatedToActive(item.id);
            const isHovered = hoveredNodeId === item.id;
            const Icon = item.icon;
            const cardBelow = pos.cardPlacement === 'below';

            return (
              <div
                key={item.id}
                ref={(el) => {
                  if (el) nodeRefs.current.set(item.id, el);
                  else nodeRefs.current.delete(item.id);
                }}
                data-orbital-node
                className="absolute cursor-pointer"
                style={{
                  transform: `translate(${pos.x}px, ${pos.y}px) scale(${isActive ? 1.12 : pos.scale})`,
                  zIndex: isActive ? 200 : pos.zIndex,
                  opacity: isActive ? 1 : pos.opacity,
                  transition: 'transform 0.5s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.4s ease, z-index 0s',
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  toggleItem(item.id);
                }}
                onMouseEnter={() => setHoveredNodeId(item.id)}
                onMouseLeave={() => setHoveredNodeId(null)}
              >
                {/* Glow behind node */}
                <div
                  className={cn(
                    'pointer-events-none absolute rounded-full transition-opacity duration-300',
                    isActive || isRelated ? 'opacity-100' : 'opacity-0',
                  )}
                  style={{
                    background: `radial-gradient(circle, ${item.color}25 0%, transparent 70%)`,
                    width: 64,
                    height: 64,
                    left: -12,
                    top: -12,
                  }}
                />

                {/* Node circle */}
                <div
                  className={cn(
                    'relative flex h-10 w-10 items-center justify-center rounded-full border transition-all duration-300',
                    isActive
                      ? 'border-white/40 bg-white/15 shadow-[0_0_20px_rgba(255,255,255,0.1)] backdrop-blur-xl'
                      : isRelated
                        ? 'border-landing-cta/50 bg-landing-cta/15 backdrop-blur-lg'
                        : isHovered
                          ? 'border-white/30 bg-white/10 backdrop-blur-lg'
                          : 'border-white/[0.12] bg-white/[0.06] backdrop-blur-md',
                  )}
                >
                  <Icon
                    size={16}
                    className={cn(
                      'transition-colors duration-300',
                      isActive ? 'text-white' : isRelated ? 'text-landing-cta' : 'text-white/60',
                    )}
                  />

                  {/* Status dot */}
                  <div
                    className={cn(
                      'absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full border-2 border-[#0c0118]',
                      item.status === 'completed' && 'bg-emerald-400',
                      item.status === 'in-progress' && 'bg-landing-cta',
                      item.status === 'pending' && 'bg-white/30',
                    )}
                  />
                </div>

                {/* Label */}
                <div
                  className={cn(
                    'absolute left-1/2 -translate-x-1/2 whitespace-nowrap text-center transition-all duration-300',
                    cardBelow ? 'top-12' : 'bottom-12',
                    isActive ? 'opacity-100' : 'opacity-70',
                  )}
                >
                  <div className="text-[10px] font-bold tracking-wider text-white/90">
                    {item.title}
                  </div>
                  <div className="text-[9px] text-white/40">{item.subtitle}</div>
                </div>

                {/* Detail card — positioned above or below based on node location */}
                {isActive && activeItem && (
                  <div
                    className={cn(
                      'absolute left-1/2 z-50 w-64 -translate-x-1/2 overflow-hidden rounded-2xl border border-white/[0.12] bg-[#0a0114]/95 shadow-[0_20px_60px_rgba(0,0,0,0.7),inset_0_1px_0_rgba(255,255,255,0.08)] backdrop-blur-2xl',
                      cardBelow ? 'top-[4.5rem]' : 'bottom-[4.5rem]',
                    )}
                  >
                    {/* macOS header bar */}
                    <div className="flex items-center gap-2 border-b border-white/[0.06] px-4 py-2">
                      <div className="flex gap-1.5">
                        <div className="h-2.5 w-2.5 rounded-full bg-white/10" />
                        <div className="h-2.5 w-2.5 rounded-full bg-white/10" />
                        <div className="h-2.5 w-2.5 rounded-full bg-white/10" />
                      </div>
                      <span className="ml-1 text-[10px] font-medium text-white/40">
                        {activeItem.subtitle}
                      </span>
                    </div>

                    <div className="p-4">
                      {/* Title row */}
                      <div className="flex items-center gap-2.5">
                        <div
                          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/[0.05]"
                          style={{ color: activeItem.color }}
                        >
                          <activeItem.icon size={15} />
                        </div>
                        <div>
                          <div className="text-[11px] font-bold text-white">{activeItem.title}</div>
                          <div className="text-[10px] text-white/40">{activeItem.subtitle}</div>
                        </div>
                      </div>

                      <p className="mt-3 text-[11px] leading-relaxed text-white/55">
                        {activeItem.content}
                      </p>

                      {/* Progress */}
                      <div className="mt-3 border-t border-white/[0.06] pt-3">
                        <div className="mb-1.5 flex items-center justify-between">
                          <span className="text-[10px] text-white/40">Progress</span>
                          <span className="font-mono text-[10px] font-bold text-white/70">
                            {activeItem.energy}%
                          </span>
                        </div>
                        <div className="h-1 w-full overflow-hidden rounded-full bg-white/[0.06]">
                          <div
                            className="h-full rounded-full transition-all duration-700"
                            style={{
                              width: `${activeItem.energy}%`,
                              background: `linear-gradient(90deg, ${activeItem.color}, ${activeItem.color}88)`,
                            }}
                          />
                        </div>
                      </div>

                      {/* Related items */}
                      {activeItem.relatedIds.length > 0 && (
                        <div className="mt-3 border-t border-white/[0.06] pt-3">
                          <div className="mb-1.5 text-[10px] font-medium text-white/40">Connected</div>
                          <div className="flex flex-wrap gap-1">
                            {activeItem.relatedIds.map((relId) => {
                              const rel = timelineData.find((i) => i.id === relId);
                              return rel ? (
                                <button
                                  key={relId}
                                  type="button"
                                  className="rounded-md border border-white/10 bg-white/[0.04] px-2 py-1 text-[9px] text-white/60 transition-all hover:border-landing-cta/40 hover:bg-landing-cta/10 hover:text-white/80"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    toggleItem(relId);
                                  }}
                                >
                                  {rel.title}
                                </button>
                              ) : null;
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
