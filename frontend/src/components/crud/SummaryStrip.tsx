import { motion } from 'framer-motion';
import Sparkline from '@/components/Sparkline';
import { useCountUp } from '@/hooks/useCountUp';

/**
 * Summary strip — 4 mini stats with sparklines and count-up values
 * (same layout as the old customers summary strip).
 */

export interface StripStat {
  label: string;
  value: number;
  format: (v: number) => string;
  spark: number[];
  tone: string;
}

function Stat({ stat, index }: { stat: StripStat; index: number }) {
  const v = useCountUp(stat.value);
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 + index * 0.06, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="flex items-center justify-between gap-3 px-5 py-4"
    >
      <div>
        <p className="v-label">{stat.label}</p>
        <p className="tnum mt-1 text-[20px] font-semibold leading-6 tracking-[-0.01em] text-ink-1">
          {stat.format(v)}
        </p>
      </div>
      <Sparkline data={stat.spark} color={stat.tone} width={72} height={26} />
    </motion.div>
  );
}

export default function SummaryStrip({ stats }: { stats: StripStat[] }) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="v-card grid grid-cols-1 divide-y divide-line sm:grid-cols-2 sm:divide-y-0 xl:grid-cols-4 xl:divide-x"
    >
      {stats.map((s, i) => (
        <Stat key={s.label} stat={s} index={i} />
      ))}
    </motion.section>
  );
}
