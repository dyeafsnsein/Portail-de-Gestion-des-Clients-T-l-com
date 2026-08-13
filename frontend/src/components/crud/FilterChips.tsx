import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

/** Filter chips row (same pattern as the old segment chips). */

export interface ChipOption {
  value: string;
  label: string;
  count?: number;
}

export default function FilterChips({
  options,
  active,
  onChange,
  label,
}: {
  options: ChipOption[];
  active: string;
  onChange: (value: string) => void;
  label: string;
}) {
  return (
    <div className="flex flex-wrap items-center gap-2" role="tablist" aria-label={label}>
      {options.map((o, i) => {
        const isActive = o.value === active;
        return (
          <motion.button
            key={o.value}
            type="button"
            role="tab"
            aria-selected={isActive}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 + i * 0.05, type: 'spring', stiffness: 300, damping: 24 }}
            onClick={() => onChange(o.value)}
            className={cn(
              'rounded-pill px-3 py-1.5 text-[12.5px] font-medium transition-colors duration-150',
              isActive ? 'bg-brand-soft text-brand' : 'text-ink-2 hover:bg-surface-2',
            )}
          >
            {o.label}{' '}
            {o.count !== undefined && (
              <span className={cn('font-mono text-[11px]', isActive ? 'text-brand' : 'text-ink-3')}>
                ({o.count.toLocaleString('en-US')})
              </span>
            )}
          </motion.button>
        );
      })}
    </div>
  );
}
