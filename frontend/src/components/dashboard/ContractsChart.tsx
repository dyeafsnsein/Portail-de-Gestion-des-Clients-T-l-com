import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { format as formatDate } from 'date-fns';
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import SegmentedControl from '@/components/SegmentedControl';
import { CHART_PALETTE } from '@/lib/brand';
import { useTheme } from '@/hooks/useTheme';
import { fmtNumber } from '@/lib/format';
import { cn } from '@/lib/utils';
import type { Contract } from '@/services/types';
import { dailyCounts } from './data';

type Window = '7D' | '14D' | '30D' | '90D';
const WINDOWS: readonly Window[] = ['7D', '14D', '30D', '90D'];
const FMT: Record<Window, string> = { '7D': 'EEE', '14D': 'MMM d', '30D': 'MMM d', '90D': 'MMM d' };

function ChartTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-md border border-line bg-surface px-3 py-2 shadow-pop">
      <div className="mb-1 font-mono text-[10px] text-ink-3">{formatDate(label as number, 'MMM d, yyyy')}</div>
      {payload.map((p: any) => (
        <div key={p.dataKey} className="flex items-center gap-2 text-[12px]">
          <span
            className="h-2 w-2 rounded-full"
            style={{ background: p.dataKey === 'current' ? CHART_PALETTE.teal : CHART_PALETTE.orange }}
          />
          <span className="text-ink-2">{p.dataKey === 'current' ? 'This period' : 'Previous'}</span>
          <span className="tnum ml-auto font-mono font-medium text-ink-1">{fmtNumber(p.value)}</span>
        </div>
      ))}
    </div>
  );
}

function FlashStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline gap-2 px-4 first:pl-0 last:pr-0">
      <span className="text-[12px] text-ink-3">{label}</span>
      <span className="tnum rounded-sm px-1 font-mono text-[13px] font-semibold text-ink-1">{value}</span>
    </div>
  );
}

/** Contracts created over the last N days — area chart, current vs previous. */
export default function ContractsChart({ contracts }: { contracts: Contract[] }) {
  const { resolvedTheme } = useTheme();
  const [win, setWin] = useState<Window>('30D');
  const [hidden, setHidden] = useState<Record<string, boolean>>({});
  const [dimmed, setDimmed] = useState<string | null>(null);

  const days = win === '7D' ? 7 : win === '14D' ? 14 : win === '30D' ? 30 : 90;

  const data = useMemo(() => {
    const now = Date.now();
    const current = dailyCounts(contracts.map((c) => ({ date: c.startDate })), days);
    const prevStart = new Date(now - days * 86_400_000);
    const previous = dailyCounts(
      contracts
        .filter((c) => new Date(c.startDate).getTime() < prevStart.getTime())
        .map((c) => ({ date: c.startDate })),
      days,
    );
    return current.map((v, i) => ({
      t: now - (current.length - 1 - i) * 86_400_000,
      current: v,
      previous: previous[i] ?? 0,
    }));
  }, [contracts, days]);

  const seriesOpacity = (key: string) => {
    if (hidden[key]) return 0;
    if (dimmed && dimmed !== key) return 0.3;
    return 1;
  };

  const active = contracts.filter((c) => c.status === 'ACTIVE').length;
  const suspended = contracts.filter((c) => c.status === 'SUSPENDED').length;
  const terminated = contracts.filter((c) => c.status === 'TERMINATED').length;

  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.32, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="v-card col-span-12 flex flex-col xl:col-span-8"
      aria-label="Contracts created chart"
    >
      {/* header */}
      <div className="flex flex-wrap items-center gap-3 border-b border-line px-5 py-4">
        <div className="min-w-0 flex-1">
          <h2 className="text-[16px] font-semibold tracking-[-0.01em] text-ink-1">Contracts created</h2>
          <p className="text-[12px] text-ink-3">Last {days} days</p>
        </div>
        <div className="flex items-center gap-1.5 text-[11px]">
          {(['current', 'previous'] as const).map((k) => (
            <button
              key={k}
              type="button"
              onClick={() => setHidden((h) => ({ ...h, [k]: !h[k] }))}
              onMouseEnter={() => setDimmed(k)}
              onMouseLeave={() => setDimmed(null)}
              className={cn(
                'flex items-center gap-1.5 rounded-pill border border-line px-2 py-1 transition-opacity duration-200',
                hidden[k] && 'opacity-40',
              )}
            >
              <span
                className="h-2 w-2 rounded-full"
                style={{ background: k === 'current' ? CHART_PALETTE.teal : CHART_PALETTE.orange }}
              />
              <span className="text-ink-2">{k === 'current' ? 'This period' : 'Previous'}</span>
            </button>
          ))}
        </div>
        <SegmentedControl id="contracts-window" options={WINDOWS} value={win} onChange={setWin} />
      </div>

      {/* chart */}
      <div className="h-[300px] px-2 pt-4" key={resolvedTheme}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 4, right: 12, bottom: 0, left: 0 }}>
            <defs>
              <linearGradient id="contractsFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={CHART_PALETTE.teal} stopOpacity={0.25} />
                <stop offset="100%" stopColor={CHART_PALETTE.teal} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid horizontal vertical={false} stroke="var(--border)" strokeOpacity={0.6} />
            <XAxis
              dataKey="t"
              type="number"
              domain={['dataMin', 'dataMax']}
              tickFormatter={(t: number) => formatDate(t, FMT[win])}
              tick={{ fill: 'var(--text-3)', fontSize: 11, fontFamily: "'JetBrains Mono', monospace" }}
              axisLine={false}
              tickLine={false}
              minTickGap={48}
            />
            <YAxis
              allowDecimals={false}
              tick={{ fill: 'var(--text-3)', fontSize: 11, fontFamily: "'JetBrains Mono', monospace" }}
              axisLine={false}
              tickLine={false}
              tickCount={4}
              width={40}
            />
            <Tooltip content={<ChartTooltip />} cursor={{ stroke: 'var(--border-strong)', strokeDasharray: '3 3' }} />
            <Area
              type="monotone"
              dataKey="previous"
              stroke={CHART_PALETTE.orange}
              strokeWidth={1.5}
              strokeDasharray="5 4"
              fill="none"
              dot={false}
              strokeOpacity={seriesOpacity('previous')}
              animationDuration={800}
            />
            <Area
              type="monotone"
              dataKey="current"
              stroke={CHART_PALETTE.teal}
              strokeWidth={2}
              fill="url(#contractsFill)"
              fillOpacity={seriesOpacity('current')}
              strokeOpacity={seriesOpacity('current')}
              animationDuration={800}
              activeDot={{ r: 4, fill: CHART_PALETTE.teal, stroke: 'var(--surface)', strokeWidth: 2 }}
              dot={(props: any) => {
                const { cx, cy, index, key } = props;
                if (index !== data.length - 1) return <g key={key ?? index} />;
                return (
                  <circle
                    key={key ?? index}
                    cx={cx}
                    cy={cy}
                    r={4}
                    fill={CHART_PALETTE.teal}
                    stroke="var(--surface)"
                    strokeWidth={2}
                  />
                );
              }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* footer micro-stats */}
      <div className="mt-auto flex flex-wrap items-center divide-x divide-line border-t border-line px-5 py-3">
        <FlashStat label="Active" value={fmtNumber(active)} />
        <FlashStat label="Suspended" value={fmtNumber(suspended)} />
        <FlashStat label="Terminated" value={fmtNumber(terminated)} />
      </div>
    </motion.section>
  );
}
