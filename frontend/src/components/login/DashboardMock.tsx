import { memo, useId, useRef } from 'react';
import type { ReactNode } from 'react';
import { AnimatePresence, motion, useMotionValue, useSpring } from 'framer-motion';
import { CardSim, FileText, LayoutDashboard, Users } from 'lucide-react';
import Sparkline from '@/components/Sparkline';
import { useReducedMotionPref } from '@/hooks/useReducedMotionPref';
import { useCountUp } from '@/hooks/useCountUp';
import { fmtClock, fmtCompact, fmtNumber } from '@/lib/format';
import { seededSeries } from '@/lib/mock';
import { EXPO } from '@/components/settings/bits';

/* Perpetual float — isolated + memoised so parent re-renders don't reset it. */
const FloatBox = memo(function FloatBox({ reduced, children }: { reduced: boolean; children: ReactNode }) {
  if (reduced) return <>{children}</>;
  return (
    <motion.div animate={{ y: [0, -8, 0] }} transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}>
      {children}
    </motion.div>
  );
});

/** Static area chart — contracts created per day over the last 30 days. */
function MiniArea({ data }: { data: number[] }) {
  const id = useId();
  const w = 560;
  const h = 116;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const span = max - min || 1;
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * w;
    const y = 4 + (1 - (v - min) / span) * (h - 8);
    return [x, y] as const;
  });
  const line = pts.map(([x, y], i) => `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`).join(' ');
  const area = `${line} L${w},${h} L0,${h} Z`;

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="block h-[116px] w-full" preserveAspectRatio="none" aria-hidden="true">
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.25" />
          <stop offset="100%" stopColor="var(--accent)" stopOpacity="0" />
        </linearGradient>
      </defs>
      {[0.25, 0.5, 0.75].map((f) => (
        <line key={f} x1="0" x2={w} y1={h * f} y2={h * f} stroke="var(--border)" strokeOpacity="0.6" strokeWidth="1" />
      ))}
      <path d={area} fill={`url(#${id})`} />
      <motion.path
        d={line}
        fill="none"
        stroke="var(--accent)"
        strokeWidth="2"
        strokeLinecap="round"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
      />
    </svg>
  );
}

function MiniKpi({ label, value, spark, tone }: { label: string; value: string; spark: number[]; tone: string }) {
  return (
    <div className="flex min-w-0 flex-1 items-start justify-between gap-2 rounded-md border border-line bg-surface-2/50 p-3">
      <div className="min-w-0">
        <div className="v-label truncate">{label}</div>
        <div className="tnum mt-1 truncate text-[18px] font-semibold leading-6 text-ink-1">{value}</div>
      </div>
      <Sparkline data={spark} color={tone} width={56} height={20} />
    </div>
  );
}

/** The miniature portal card — sidebar strip, KPI tiles, chart, ticker line. */
function MockCard() {
  const totalUsers = useCountUp(24847);
  const activeContracts = useCountUp(1284);
  const sparkUsers = seededSeries(47, 24, 22, 2.4, 0.08);
  const sparkContracts = seededSeries(31, 24, 12, 2.2, 0.2);
  const contractsSeries = seededSeries(11, 30, 8, 3, 0.25);
  const latest = { text: 'Contract #C-1043 created for Lumen Field', at: Date.now() - 42000 };

  return (
    <div
      className="themed v-card shadow-pop dark:shadow-glow flex h-[400px] w-[640px] max-w-full overflow-hidden"
      style={{ borderRadius: 14 }}
    >
      {/* sidebar strip */}
      <div className="flex w-12 shrink-0 flex-col items-center gap-3 border-r border-line bg-surface-2/40 py-3">
        <img src="/logo.svg" alt="" className="h-5 w-5" />
        {[LayoutDashboard, Users, FileText, CardSim].map((Icon, i) => (
          <span
            key={i}
            className={
              'grid h-7 w-7 place-items-center rounded-md ' +
              (i === 0 ? 'bg-brand-soft text-brand' : 'text-ink-3')
            }
          >
            <Icon size={13} />
          </span>
        ))}
      </div>

      {/* main */}
      <div className="flex min-w-0 flex-1 flex-col p-4">
        <div className="flex items-center justify-between">
          <div className="text-[13px] font-semibold tracking-[-0.01em] text-ink-1">Dashboard</div>
          <span className="rounded-pill bg-brand-soft px-2 py-0.5 font-mono text-[10px] font-medium text-brand">
            Admin Back-office
          </span>
        </div>

        <div className="mt-3 flex gap-3">
          <MiniKpi label="Total users" value={fmtNumber(Math.round(totalUsers))} spark={sparkUsers} tone="var(--accent)" />
          <MiniKpi label="Active contracts" value={fmtCompact(activeContracts)} spark={sparkContracts} tone="var(--success)" />
        </div>

        <div className="mt-3 min-h-0 flex-1 rounded-md border border-line p-2">
          <div className="flex items-center justify-between px-1 pb-1">
            <span className="v-label">Contracts created · 30 days</span>
            <span className="font-mono text-[10px] text-ink-3">daily</span>
          </div>
          <MiniArea data={contractsSeries} />
        </div>

        <div className="mt-3 flex h-5 items-center gap-2 overflow-hidden">
          <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-brand" />
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={latest.at}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.3 }}
              className="truncate text-[11px] text-ink-3"
            >
              <span className="font-medium text-ink-1">System</span> {latest.text}
              <span className="ml-1.5 font-mono text-[10px]">{fmtClock(new Date(latest.at))}</span>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

/** Cursor-parallax tilt (±4°, springs ≈100ms lerp) + reveal; disabled under reduced motion. */
export default function DashboardMock() {
  const reduced = useReducedMotionPref();
  const ref = useRef<HTMLDivElement>(null);
  const rx = useMotionValue(0);
  const ry = useMotionValue(0);
  const rotateX = useSpring(rx, { stiffness: 160, damping: 20 });
  const rotateY = useSpring(ry, { stiffness: 160, damping: 20 });

  const onPointerMove = (e: React.PointerEvent) => {
    if (reduced || !ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width - 0.5;
    const py = (e.clientY - rect.top) / rect.height - 0.5;
    ry.set(px * 8);
    rx.set(-py * 8);
  };

  const onPointerLeave = () => {
    rx.set(0);
    ry.set(0);
  };

  return (
    <div
      ref={ref}
      onPointerMove={onPointerMove}
      onPointerLeave={onPointerLeave}
      className="grid w-full place-items-center px-8 py-6"
    >
      <FloatBox reduced={reduced}>
        <motion.div style={reduced ? undefined : { rotateX, rotateY, transformPerspective: 1100 }}>
          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: 24 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.7, ease: EXPO }}
            className="-rotate-[1.5deg]"
          >
            <MockCard />
          </motion.div>
        </motion.div>
      </FloatBox>
    </div>
  );
}
