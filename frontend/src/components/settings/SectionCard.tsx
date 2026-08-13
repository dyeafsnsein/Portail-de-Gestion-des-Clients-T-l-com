import { motion } from 'framer-motion';
import type { ReactNode } from 'react';
import { EXPO } from '@/components/settings/bits';
import { cn } from '@/lib/utils';

/** Staggered card wrapper + field label for settings panels. */

export function FieldLabel({ children }: { children: ReactNode }) {
  return <span className="v-label mb-1.5 block">{children}</span>;
}

export default function SectionCard({
  title,
  description,
  children,
  index = 0,
  className,
}: {
  title: string;
  description?: string;
  children: ReactNode;
  index?: number;
  className?: string;
}) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08, duration: 0.4, ease: EXPO }}
      className={cn('v-card p-5', className)}
    >
      <h2 className="text-[16px] font-semibold leading-6 tracking-[-0.01em] text-ink-1">{title}</h2>
      {description && <p className="mt-0.5 text-[12px] leading-4 text-ink-3">{description}</p>}
      <div className="mt-4">{children}</div>
    </motion.section>
  );
}
