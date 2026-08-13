import { useState } from 'react';
import type { ComponentType } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Palette, SlidersHorizontal } from 'lucide-react';
import GeneralPanel from '@/components/settings/GeneralPanel';
import AppearancePanel from '@/components/settings/AppearancePanel';
import { EXPO } from '@/components/settings/bits';
import { cn } from '@/lib/utils';

type TabId = 'general' | 'appearance';

const TABS: ReadonlyArray<{ id: TabId; label: string; icon: typeof SlidersHorizontal }> = [
  { id: 'general', label: 'General', icon: SlidersHorizontal },
  { id: 'appearance', label: 'Appearance', icon: Palette },
];

const PANELS: Record<TabId, ComponentType> = {
  general: GeneralPanel,
  appearance: AppearancePanel,
};

/**
 * Settings — admin profile (General) and theme system (Appearance).
 * Vertical tab nav on desktop, horizontal scroll chips on mobile.
 * Panels crossfade on tab change.
 */
export default function Settings() {
  const [tab, setTab] = useState<TabId>('general');
  const Panel = PANELS[tab];

  return (
    <div>
      <header>
        <h1 className="text-[24px] font-semibold leading-8 tracking-[-0.02em] text-ink-1">Settings</h1>
        <p className="mt-1 text-[13px] text-ink-3">
          Manage your admin profile and appearance preferences.
        </p>
      </header>

      <div className="mt-6 flex flex-col gap-6 md:flex-row md:items-start">
        {/* Tab nav — vertical on md+, horizontal scroll chips below */}
        <nav
          aria-label="Settings sections"
          className="-mx-4 flex shrink-0 gap-1 overflow-x-auto px-4 pb-1 md:mx-0 md:w-[200px] md:flex-col md:overflow-visible md:px-0 md:pb-0"
        >
          {TABS.map((t, i) => {
            const active = t.id === tab;
            const Icon = t.icon;
            return (
              <motion.button
                key={t.id}
                type="button"
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.04, duration: 0.25 }}
                onClick={() => setTab(t.id)}
                aria-current={active ? 'page' : undefined}
                className={cn(
                  'relative flex h-10 shrink-0 items-center gap-2.5 whitespace-nowrap rounded-md px-3 text-[13px] font-medium transition-colors duration-150',
                  active ? 'text-brand' : 'text-ink-2 hover:bg-surface-2 hover:text-ink-1',
                )}
              >
                {active && (
                  <motion.span
                    layoutId="settings-tab-active"
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                    className="absolute inset-0 rounded-md bg-brand-soft"
                  />
                )}
                <Icon size={16} className="relative z-10 shrink-0" />
                <span className="relative z-10">{t.label}</span>
              </motion.button>
            );
          })}
        </nav>

        {/* Active panel */}
        <div className="min-w-0 w-full max-w-[760px] flex-1">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={tab}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25, ease: EXPO }}
            >
              <Panel />
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
