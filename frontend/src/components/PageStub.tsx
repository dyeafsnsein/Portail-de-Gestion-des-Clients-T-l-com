import { motion } from 'framer-motion';
import type { LucideIcon } from 'lucide-react';

/** Placeholder for sub-pages still under construction by page agents. */
export default function PageStub({
  title,
  caption,
  icon: Icon,
  image,
}: {
  title: string;
  caption: string;
  icon: LucideIcon;
  image?: string;
}) {
  return (
    <div>
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      >
        <h1 className="text-[24px] font-semibold leading-8 tracking-[-0.02em] text-ink-1">{title}</h1>
        <p className="mt-0.5 text-[13px] text-ink-2">{caption}</p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="v-card mt-6 flex flex-col items-center gap-4 px-6 py-16 text-center"
      >
        {image ? (
          <img src={image} alt="" className="h-36 w-auto" />
        ) : (
          <span className="grid h-14 w-14 place-items-center rounded-lg bg-brand-soft text-brand">
            <Icon size={24} />
          </span>
        )}
        <div>
          <p className="text-[15px] font-semibold text-ink-1">{title} is being assembled</p>
          <p className="mt-1 max-w-sm text-[13px] text-ink-3">
            This surface ships next — the app shell, theme system, and live data engine are already running underneath it.
          </p>
        </div>
      </motion.div>
    </div>
  );
}
