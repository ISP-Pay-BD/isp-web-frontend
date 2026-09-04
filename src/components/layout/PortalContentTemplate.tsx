'use client';

import type { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { easeOutExpo, useMotionSafe } from '@/lib/animations';

/**
 * Next.js `template.tsx` remounts on navigation while `layout.tsx` stays mounted.
 * That gives content-only enter animation without touching the sidebar.
 */
export default function PortalContentTemplate({ children }: { children: ReactNode }) {
  const { reduced } = useMotionSafe();

  return (
    <motion.div
      initial={reduced ? false : { opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: reduced ? 0 : 0.18, ease: easeOutExpo }}
    >
      {children}
    </motion.div>
  );
}
