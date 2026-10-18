import { cn } from '@/lib/utils';
import { RevealWords } from './motion-kit';

interface SectionTitleProps {
  title: string;
  description?: string;
  align?: 'left' | 'center';
  className?: string;
}

/** One heading style for every landing section, so the page keeps a single type rhythm. */
export function SectionTitle({ title, description, align = 'left', className }: SectionTitleProps) {
  const centered = align === 'center';
  return (
    <div className={cn('max-w-2xl', centered && 'mx-auto text-center', className)}>
      <h2 className="font-landing-display text-[clamp(2rem,1.3rem+2.8vw,3.25rem)] leading-[1.05] font-semibold tracking-[-0.035em] text-balance text-white">
        <RevealWords text={title} />
      </h2>
      {description ? (
        <p
          className={cn(
            'mt-5 max-w-xl text-base leading-relaxed text-white/60 sm:text-lg',
            centered && 'mx-auto',
          )}
        >
          {description}
        </p>
      ) : null}
    </div>
  );
}
