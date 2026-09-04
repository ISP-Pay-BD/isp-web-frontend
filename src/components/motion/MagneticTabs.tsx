'use client';

import { useState, type ReactNode } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { springSoft, useMotionSafe } from '@/lib/animations';

export interface MagneticTabItem {
  value: string;
  label: string;
}

interface MagneticTabsProps {
  items: MagneticTabItem[];
  value: string;
  onChange: (value: string) => void;
  className?: string;
  /** Visual style for marketing (dark) vs portal */
  tone?: 'marketing' | 'portal';
  layoutId?: string;
}

export function MagneticTabs({
  items,
  value,
  onChange,
  className,
  tone = 'marketing',
  layoutId = 'magnetic-tab-indicator',
}: MagneticTabsProps) {
  const { reduced, springSoft: spring } = useMotionSafe();
  const [hover, setHover] = useState<string | null>(null);

  return (
    <div
      className={cn(
        'relative inline-flex flex-wrap gap-1 rounded-lg p-1',
        tone === 'marketing' ? 'bg-white/[0.04]' : 'bg-muted/60',
        className,
      )}
      role="tablist"
    >
      {items.map((item) => {
        const active = value === item.value;
        const pulled = !reduced && hover === item.value && !active;

        return (
          <button
            key={item.value}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(item.value)}
            onMouseEnter={() => setHover(item.value)}
            onMouseLeave={() => setHover(null)}
            className={cn(
              'relative z-10 rounded-md px-4 py-2 text-sm font-medium transition-colors',
              active
                ? tone === 'marketing'
                  ? 'text-[#0a0114]'
                  : 'text-foreground'
                : tone === 'marketing'
                  ? 'text-white/55 hover:text-white'
                  : 'text-muted-foreground hover:text-foreground',
            )}
          >
            {active && (
              <motion.span
                layoutId={layoutId}
                className={cn(
                  'absolute inset-0 -z-10 rounded-md',
                  tone === 'marketing' ? 'bg-white' : 'bg-background shadow-sm',
                )}
                transition={spring}
              />
            )}
            <motion.span
              className="relative inline-block"
              animate={pulled ? { y: -2 } : { y: 0 }}
              transition={spring}
            >
              {item.label}
            </motion.span>
          </button>
        );
      })}
    </div>
  );
}

interface MagneticTabsPanelProps {
  children: ReactNode;
  activeKey: string;
  className?: string;
}

export function MagneticTabsPanel({ children, activeKey, className }: MagneticTabsPanelProps) {
  const { reduced } = useMotionSafe();
  return (
    <motion.div
      key={activeKey}
      className={className}
      initial={reduced ? false : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: reduced ? 0 : 0.28, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}
