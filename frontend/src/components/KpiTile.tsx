import { motion } from 'framer-motion';
import { TrendingDown, TrendingUp } from 'lucide-react';
import Sparkline from '@/components/Sparkline';
import { useCountUp } from '@/hooks/useCountUp';
import { cn } from '@/lib/utils';

/**
 * KPI tile — signature component (design.md §6.3).
 * Label · count-up value · delta pill · sparkline · optional LIVE chip.
 */
export default function KpiTile({
  label,
  value,
  format,
  delta,
  deltaDirection,
  sparkData,
  sparkTone = 'accent',
  live = false,
  flashKey,
  index = 0,
}: {
  label: string;
  value: number;
  format: (v: number) => string;
  delta: string;
  deltaDirection: 'up' | 'down';
  sparkData: number[];
  sparkTone?: 'accent' | 'success' | 'danger';
  live?: boolean;
  /** change to retrigger the accent-soft flash on live mutation */
  flashKey?: number;
  index?: number;
}) {
  const display = useCountUp(value);
  const toneColor = sparkTone === 'accent' ? 'var(--accent)' : sparkTone === 'success' ? 'var(--success)' : 'var(--danger)';
  const positive = deltaDirection === 'up';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      whileHover={{ y: -2 }}
      className="v-card group relative overflow-hidden p-5 transition-[border-color] duration-150 hover:border-line-strong"
    >
      {/* live-mutation flash */}
      {flashKey !== undefined && flashKey > 0 && (
        <motion.div
          key={flashKey}
          initial={{ opacity: 1 }}
          animate={{ opacity: 0 }}
          transition={{ duration: 0.6 }}
          className="pointer-events-none absolute inset-0 bg-brand-soft"
        />
      )}

      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="v-label flex items-center gap-2">
            <span className="truncate">{label}</span>
            {live && (
              <span className="flex items-center gap-1 rounded-pill bg-[color-mix(in_srgb,var(--success)_12%,transparent)] px-1.5 py-0.5 text-[9px] font-semibold tracking-[0.06em] text-success">
                <span className="v-live-dot" style={{ width: 5, height: 5 }} />
                LIVE
              </span>
            )}
          </div>
          <div className="tnum mt-1.5 text-[28px] font-semibold leading-9 tracking-[-0.02em] text-ink-1">
            {format(display)}
          </div>
          <div
            className={cn(
              'mt-1.5 inline-flex items-center gap-1 rounded-pill px-2 py-0.5 text-[11px] font-semibold',
              positive ? 'bg-[color-mix(in_srgb,var(--success)_10%,transparent)] text-success' : 'bg-[color-mix(in_srgb,var(--danger)_10%,transparent)] text-danger',
            )}
          >
            {positive ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
            {delta}
          </div>
        </div>
        <div className="shrink-0 pt-1">
          <Sparkline data={sparkData} color={toneColor} />
        </div>
      </div>
    </motion.div>
  );
}
