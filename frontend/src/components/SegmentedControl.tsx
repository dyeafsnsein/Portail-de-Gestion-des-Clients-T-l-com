import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

/** Segmented control — pill track, thumb slides with layoutId spring (design.md §6.6). */
export default function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  id,
}: {
  options: readonly T[];
  value: T;
  onChange: (v: T) => void;
  id: string;
}) {
  return (
    <div className="flex items-center gap-0.5 rounded-pill bg-surface-2 p-0.5">
      {options.map((opt) => {
        const active = opt === value;
        return (
          <button
            key={opt}
            type="button"
            onClick={() => onChange(opt)}
            className={cn(
              'relative rounded-pill px-2.5 py-1 font-mono text-[11px] font-medium transition-colors duration-150',
              active ? 'text-ink-1' : 'text-ink-3 hover:text-ink-2',
            )}
          >
            {active && (
              <motion.span
                layoutId={`seg-${id}`}
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                className="absolute inset-0 rounded-pill border border-line bg-surface shadow-card"
              />
            )}
            <span className="relative z-10">{opt}</span>
          </button>
        );
      })}
    </div>
  );
}
