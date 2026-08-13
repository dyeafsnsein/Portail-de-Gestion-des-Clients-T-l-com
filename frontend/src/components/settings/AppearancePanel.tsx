import { AnimatePresence, motion } from 'framer-motion';
import { Check, Monitor, Moon, Sun } from 'lucide-react';
import SectionCard from '@/components/settings/SectionCard';
import { EXPO } from '@/components/settings/bits';
import { Switch } from '@/components/ui/switch';
import { useTheme } from '@/hooks/useTheme';
import type { Theme } from '@/hooks/useTheme';
import { ACCENTS, setAccent, setDensity, setInterfacePref, usePrefs } from '@/components/settings/prefs';
import { cn } from '@/lib/utils';

/* ------------------------- mini dashboard previews ------------------------ */

interface MockTokens {
  bg: string;
  surface: string;
  surface2: string;
  border: string;
  ink: string;
  ink3: string;
}

const LIGHT: MockTokens = {
  bg: '#F6F7F9',
  surface: '#FFFFFF',
  surface2: '#F0F2F5',
  border: '#E4E7ED',
  ink: '#0B1020',
  ink3: '#8B94AB',
};

const DARK: MockTokens = {
  bg: '#090B11',
  surface: '#10131C',
  surface2: '#171B28',
  border: '#1E2432',
  ink: '#F3F5F9',
  ink3: '#5E6880',
};

const CHART_LINE = 'M0 22 L15 18 L30 20 L45 12 L60 15 L75 8 L90 11 L105 5 L120 8';

/** Tiny code-drawn mock dashboard painted in the *target* theme's tokens. */
function MiniDash({ t }: { t: MockTokens }) {
  return (
    <div className="flex h-full w-full" style={{ background: t.bg }}>
      <div
        className="flex w-[24px] shrink-0 flex-col items-center gap-1.5 border-r py-2"
        style={{ borderColor: t.border, background: t.surface }}
      >
        <div className="h-2.5 w-2.5 rounded-[3px]" style={{ background: 'var(--accent)' }} />
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="h-1.5 w-3 rounded-full"
            style={{ background: i === 0 ? 'var(--accent)' : t.surface2 }}
          />
        ))}
      </div>
      <div className="min-w-0 flex-1 p-2">
        <div className="h-1.5 w-10 rounded-full" style={{ background: t.ink3, opacity: 0.55 }} />
        <div className="mt-1.5 grid grid-cols-3 gap-1.5">
          {[0, 1, 2].map((i) => (
            <div key={i} className="rounded-[4px] border p-1" style={{ background: t.surface, borderColor: t.border }}>
              <div className="h-1 w-4 rounded-full" style={{ background: t.ink3, opacity: 0.5 }} />
              <div className="mt-1 h-1.5 w-5 rounded-full" style={{ background: t.ink, opacity: 0.85 }} />
            </div>
          ))}
        </div>
        <div className="mt-1.5 rounded-[4px] border p-1" style={{ background: t.surface, borderColor: t.border }}>
          <svg viewBox="0 0 120 28" className="block h-7 w-full" preserveAspectRatio="none" aria-hidden="true">
            <path d={`${CHART_LINE} L120 28 L0 28 Z`} fill="var(--accent)" opacity={0.14} stroke="none" />
            <path d={CHART_LINE} fill="none" stroke="var(--accent)" strokeWidth={2} strokeLinecap="round" />
          </svg>
        </div>
      </div>
    </div>
  );
}

const MODES: ReadonlyArray<{ id: Theme; label: string; caption: string; icon: typeof Sun }> = [
  { id: 'light', label: 'Light', caption: 'Crisp and bright', icon: Sun },
  { id: 'dark', label: 'Dark', caption: 'Easy on the eyes', icon: Moon },
  { id: 'system', label: 'System', caption: 'Follows your OS', icon: Monitor },
];

function ModeCard({ mode, index }: { mode: (typeof MODES)[number]; index: number }) {
  const { theme, setTheme } = useTheme();
  const selected = theme === mode.id;
  const Icon = mode.icon;

  return (
    <motion.button
      type="button"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.07, duration: 0.4, ease: EXPO }}
      whileTap={{ scale: 0.98 }}
      onClick={() => setTheme(mode.id)}
      aria-pressed={selected}
      className="group w-[180px] max-w-full text-left"
    >
      <div
        className={cn(
          'relative h-[110px] overflow-hidden rounded-md border transition-[border-color,box-shadow] duration-200',
          selected
            ? 'border-transparent shadow-[0_0_0_2px_var(--accent)]'
            : 'border-line group-hover:border-line-strong',
        )}
      >
        {mode.id === 'system' ? (
          <div className="flex h-full">
            <div className="h-full w-1/2 overflow-hidden border-r" style={{ borderColor: DARK.border }}>
              <MiniDash t={LIGHT} />
            </div>
            <div className="h-full w-1/2 overflow-hidden">
              <MiniDash t={DARK} />
            </div>
          </div>
        ) : (
          <MiniDash t={mode.id === 'light' ? LIGHT : DARK} />
        )}
        <AnimatePresence>
          {selected && (
            <motion.span
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 400, damping: 22 }}
              className="absolute right-2 top-2 grid h-5 w-5 place-items-center rounded-full bg-brand text-white shadow-pop"
            >
              <Check size={12} strokeWidth={3} />
            </motion.span>
          )}
        </AnimatePresence>
      </div>
      <div className="mt-2 flex items-center gap-1.5">
        <Icon size={14} className={selected ? 'text-brand' : 'text-ink-3'} />
        <span className={cn('text-[13px] font-medium', selected ? 'text-ink-1' : 'text-ink-2')}>{mode.label}</span>
        <span className="text-[11px] text-ink-3">· {mode.caption}</span>
      </div>
    </motion.button>
  );
}

/* ------------------------------ accent picker ----------------------------- */

function AccentPicker() {
  const { accentId } = usePrefs();
  return (
    <div className="flex flex-wrap items-center gap-3">
      {ACCENTS.map((a) => {
        const selected = a.id === accentId;
        return (
          <motion.button
            key={a.id}
            type="button"
            title={a.name}
            aria-label={`${a.name} accent`}
            aria-pressed={selected}
            onClick={() => setAccent(a.id)}
            whileTap={{ scale: 0.9 }}
            animate={selected ? { scale: [1.15, 1] } : { scale: 1 }}
            transition={{ duration: 0.2 }}
            className="relative grid h-7 w-7 place-items-center rounded-full"
            style={{ backgroundColor: a.swatch }}
          >
            {selected && (
              <>
                <span
                  className="absolute -inset-[4px] rounded-full border-2"
                  style={{ borderColor: a.swatch }}
                />
                <Check size={13} strokeWidth={3.5} className="relative text-white drop-shadow" />
              </>
            )}
          </motion.button>
        );
      })}
      <span className="ml-1 text-[12px] capitalize text-ink-3">{ACCENTS.find((a) => a.id === accentId)?.name}</span>
    </div>
  );
}

/* ------------------------------ density toggle ---------------------------- */

function DensityToggle() {
  const { density } = usePrefs();
  const compact = density === 'compact';
  const rows = [
    { name: 'Nimbus Labs', plan: 'Scale' },
    { name: 'Ferrostack', plan: 'Growth' },
    { name: 'Bluepine Co.', plan: 'Trial' },
  ];

  return (
    <div>
      <div className="flex w-fit items-center gap-0.5 rounded-pill bg-surface-2 p-0.5">
        {(['comfortable', 'compact'] as const).map((d) => {
          const active = d === density;
          return (
            <button
              key={d}
              type="button"
              onClick={() => setDensity(d)}
              className={cn(
                'relative rounded-pill px-3.5 py-1.5 text-[12px] font-medium capitalize transition-colors duration-150',
                active ? 'text-ink-1' : 'text-ink-3 hover:text-ink-2',
              )}
            >
              {active && (
                <motion.span
                  layoutId="density-thumb"
                  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                  className="absolute inset-0 rounded-pill border border-line bg-surface shadow-card"
                />
              )}
              <span className="relative z-10">{d}</span>
            </button>
          );
        })}
      </div>

      {/* sample table — row heights tween with density */}
      <div className="mt-3 overflow-hidden rounded-md border border-line">
        <div className="flex h-8 items-center gap-3 border-b border-line bg-surface-2 px-3 text-[10px] font-semibold uppercase tracking-[0.06em] text-ink-3">
          <span className="w-24">Customer</span>
          <span>Plan</span>
        </div>
        {rows.map((r) => (
          <motion.div
            key={r.name}
            animate={{ height: compact ? 36 : 44 }}
            transition={{ duration: 0.3, ease: EXPO }}
            className="flex items-center gap-3 border-b border-line px-3 last:border-b-0"
          >
            <span className="h-4 w-4 shrink-0 rounded-full" style={{ background: 'var(--accent-soft)' }} />
            <span className="w-24 truncate text-[12px] text-ink-1">{r.name}</span>
            <span className="rounded-sm px-1.5 py-0.5 text-[10px] font-medium" style={{ background: 'var(--accent-soft)', color: 'var(--accent)' }}>
              {r.plan}
            </span>
          </motion.div>
        ))}
      </div>
      <p className="mt-2 text-[11px] text-ink-3">
        Compact trims table rows 44→36px and card padding 20→14px across the app.
      </p>
    </div>
  );
}

/* ------------------------------ panel ------------------------------------- */

const INTERFACE_SWITCHES: ReadonlyArray<{
  key: 'reduceMotion' | 'liveIndicators' | 'weekStartsMonday';
  title: string;
  description: string;
}> = [
  { key: 'reduceMotion', title: 'Reduce motion', description: 'Minimises animations and live pulses app-wide.' },
  { key: 'liveIndicators', title: 'Show live indicators', description: 'Pulsing dots on real-time tiles and feeds.' },
  { key: 'weekStartsMonday', title: 'Week starts on Monday', description: 'Used by calendars and weekly reports.' },
];

export default function AppearancePanel() {
  const prefs = usePrefs();

  return (
    <div className="flex flex-col gap-5">
      <SectionCard title="Theme" description="Instantly re-themes the entire app — try it." index={0}>
        <div className="flex flex-wrap gap-4">
          {MODES.map((m, i) => (
            <ModeCard key={m.id} mode={m} index={i} />
          ))}
        </div>
      </SectionCard>

      <SectionCard title="Accent color" description="Re-skins buttons, charts and active states live." index={1}>
        <AccentPicker />
      </SectionCard>

      <SectionCard title="Density" description="How much data fits on a screen." index={2}>
        <DensityToggle />
      </SectionCard>

      <SectionCard title="Interface" description="Fine-tune how the app behaves." index={3}>
        <div className="flex flex-col divide-y divide-line">
          {INTERFACE_SWITCHES.map((row) => (
            <div key={row.key} className="flex items-center justify-between gap-4 py-3 first:pt-0 last:pb-0">
              <div>
                <div className="text-[13px] font-medium text-ink-1">{row.title}</div>
                <div className="text-[12px] text-ink-3">{row.description}</div>
              </div>
              <Switch
                checked={prefs.iface[row.key]}
                onCheckedChange={(v) => setInterfacePref(row.key, v)}
                aria-label={row.title}
              />
            </div>
          ))}
        </div>
      </SectionCard>
    </div>
  );
}
