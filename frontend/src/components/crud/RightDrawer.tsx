import { AnimatePresence, motion } from 'framer-motion';
import type { ReactNode } from 'react';
import { X } from 'lucide-react';

/**
 * Right-side drawer shell (same pattern as the old customer drawer):
 * fixed scrim + 560px panel with header and scrollable body.
 */
export default function RightDrawer({
  open,
  onClose,
  title,
  subtitle,
  actions,
  children,
  width = 560,
}: {
  open: boolean;
  onClose: () => void;
  title?: ReactNode;
  subtitle?: ReactNode;
  actions?: ReactNode;
  children: ReactNode;
  width?: number;
}) {
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.button
            type="button"
            aria-label="Close panel"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 z-40 bg-black/40 backdrop-blur-[2px]"
          />
          <motion.aside
            role="dialog"
            aria-label={typeof title === 'string' ? title : undefined}
            initial={{ x: width }}
            animate={{ x: 0 }}
            exit={{ x: width }}
            transition={{ type: 'spring', stiffness: 260, damping: 30 }}
            style={{ width }}
            className="fixed bottom-0 right-0 top-0 z-50 flex max-w-full flex-col border-l border-line bg-surface shadow-pop"
          >
            <div className="flex items-start gap-3 border-b border-line px-5 py-4">
              <div className="min-w-0 flex-1">
                <h2 className="text-[18px] font-semibold leading-6 text-ink-1">{title}</h2>
                {subtitle && <p className="mt-0.5 text-[12.5px] text-ink-3">{subtitle}</p>}
              </div>
              {actions}
              <button
                type="button"
                aria-label="Close"
                onClick={onClose}
                className="grid h-8 w-8 shrink-0 place-items-center rounded-md text-ink-3 transition-colors duration-150 hover:bg-surface-2 hover:text-ink-1"
              >
                <X size={16} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-5 py-4">{children}</div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
