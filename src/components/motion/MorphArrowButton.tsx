'use client';

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Magnetic } from './Magnetic';
import { cn } from '@/lib/utils';
import { useMotionSafe } from '@/lib/animations';
import type { ComponentProps, ReactNode } from 'react';

type ButtonProps = ComponentProps<typeof Button>;

interface MorphArrowButtonProps extends Omit<ButtonProps, 'children' | 'className'> {
  children: ReactNode;
  href?: string;
  magnetic?: boolean;
  arrowClassName?: string;
  className?: string;
}

export function MorphArrowButton({
  children,
  href,
  magnetic = true,
  className,
  arrowClassName,
  ...buttonProps
}: MorphArrowButtonProps) {
  const { reduced } = useMotionSafe();
  const fullWidth = typeof className === 'string' && className.includes('w-full');

  const inner = (
    <Button className={cn('group/morph relative', className)} {...buttonProps}>
      <span>{children}</span>
      <ArrowRight
        className={cn(
          'ml-2 h-4 w-4 transition-transform duration-200 ease-out group-hover/morph:translate-x-1',
          arrowClassName,
        )}
      />
    </Button>
  );

  const wrapped =
    magnetic && !reduced ? (
      <Magnetic strength={5} className={fullWidth ? 'w-full' : undefined}>
        {inner}
      </Magnetic>
    ) : (
      inner
    );

  if (href) {
    return (
      <Link href={href} className={cn('inline-flex no-underline', fullWidth && 'w-full')}>
        {wrapped}
      </Link>
    );
  }

  return wrapped;
}
