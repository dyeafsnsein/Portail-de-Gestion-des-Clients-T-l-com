import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { avatarGradient, initials } from '@/lib/mock';
import { EXPO } from '@/components/settings/bits';

const TESTIMONIALS = [
  { quote: 'MyTT replaced our spreadsheets overnight.', name: 'Jonas Weber', role: 'Ops Manager @ Helio Systems' },
  { quote: 'Every SIM, contract and accessory in one place.', name: 'Maya Chen', role: 'Head of Back-office @ Nimbus Labs' },
  { quote: 'Finally, a portal the whole team actually uses.', name: 'Sofia Reyes', role: 'PM @ Driftwell' },
] as const;

/** Rotating testimonial — crossfades every 6s (login.md §2). */
export default function TestimonialCard({ className }: { className?: string }) {
  const [i, setI] = useState(0);

  useEffect(() => {
    const id = window.setInterval(() => setI((v) => (v + 1) % TESTIMONIALS.length), 6000);
    return () => window.clearInterval(id);
  }, []);

  const t = TESTIMONIALS[i];

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.6, duration: 0.5, ease: EXPO }}
      className={'v-card w-[300px] p-4 ' + (className ?? '')}
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={i}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4 }}
        >
          <p className="text-[13px] leading-5 text-ink-1">&ldquo;{t.quote}&rdquo;</p>
          <div className="mt-3 flex items-center gap-2.5">
            <span
              className="grid h-8 w-8 shrink-0 place-items-center rounded-full text-[10px] font-semibold text-white"
              style={{ background: avatarGradient(t.name) }}
            >
              {initials(t.name)}
            </span>
            <div className="min-w-0">
              <div className="truncate text-[12px] font-medium text-ink-1">{t.name}</div>
              <div className="truncate text-[11px] text-ink-3">{t.role}</div>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </motion.div>
  );
}
