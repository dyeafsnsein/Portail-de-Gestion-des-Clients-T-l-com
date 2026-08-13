import { motion } from 'framer-motion';
import { CardSim, FileText, Radio, ShieldAlert, UserPlus } from 'lucide-react';
import { fmtClock } from '@/lib/format';
import { avatarGradient, initials } from '@/lib/mock';
import { cn } from '@/lib/utils';
import type { FeedEntry, FeedKind } from './data';

const KIND_ICON: Record<FeedKind, { icon: typeof FileText; color: string }> = {
  contract: { icon: FileText, color: 'var(--accent)' },
  resource: { icon: CardSim, color: 'var(--info)' },
  service: { icon: Radio, color: 'var(--success)' },
  user: { icon: UserPlus, color: 'var(--accent)' },
  alert: { icon: ShieldAlert, color: 'var(--warning)' },
};

function relTime(at: number): string {
  const mins = Math.round((Date.now() - at) / 60_000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const h = Math.floor(mins / 60);
  return `${h}h ${mins % 60 ? `${mins % 60}m` : ''} ago`.trim();
}

/** Static activity feed — same visual treatment as the old live feed. */
export default function ActivityFeed({ entries }: { entries: FeedEntry[] }) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="v-card relative col-span-12 flex flex-col overflow-hidden xl:col-span-4"
      aria-label="Recent activity"
    >
      <div className="flex items-center gap-2 border-b border-line px-5 py-4">
        <h2 className="text-[16px] font-semibold tracking-[-0.01em] text-ink-1">Recent activity</h2>
        <span className="ml-auto rounded-pill bg-surface-2 px-2 py-0.5 font-mono text-[11px] font-medium text-ink-2">
          {entries.length} events
        </span>
      </div>

      <ul className="max-h-[386px] flex-1 overflow-y-auto [mask-image:linear-gradient(180deg,black_88%,transparent)]">
        {entries.map((e, i) => {
          const meta = KIND_ICON[e.kind];
          const Icon = meta.icon;
          return (
            <motion.li
              key={e.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + i * 0.05, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className="overflow-hidden"
            >
              <div className="flex items-center gap-3 border-b border-line px-5 py-2.5 last:border-0">
                <span
                  className="grid h-8 w-8 shrink-0 place-items-center rounded-full text-[10px] font-semibold text-white"
                  style={{ background: avatarGradient(e.avatarName) }}
                >
                  {initials(e.avatarName)}
                </span>
                <div className="min-w-0 flex-1">
                  <p className={cn('truncate text-[13px] leading-5')}>
                    <span className="font-medium text-ink-1">{e.caption}</span>
                  </p>
                  <p className="font-mono text-[10px] text-ink-3">
                    {fmtClock(new Date(e.at))} · {relTime(e.at)}
                  </p>
                </div>
                <Icon size={16} className="shrink-0" style={{ color: meta.color }} />
              </div>
            </motion.li>
          );
        })}
      </ul>
    </motion.section>
  );
}
