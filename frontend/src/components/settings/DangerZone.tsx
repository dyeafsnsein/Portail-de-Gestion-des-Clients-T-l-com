import { useState } from 'react';
import { motion } from 'framer-motion';
import { TriangleAlert } from 'lucide-react';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { EXPO, btnDestructive, btnSecondary, inputCls } from '@/components/settings/bits';

/**
 * Danger zone — delete workspace behind a typed-confirm dialog (settings.md §7).
 * Demo only: confirm just fires a toast.
 */
export default function DangerZone({ index = 0 }: { index?: number }) {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState('');
  const [shake, setShake] = useState(0);
  const matches = value.trim() === 'MYTT';

  const close = (next: boolean) => {
    setOpen(next);
    if (!next) setValue('');
  };

  const attemptDelete = () => {
    if (!matches) {
      setShake((s) => s + 1);
      return;
    }
    toast('This is a demo — nothing was deleted');
    close(false);
  };

  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08, duration: 0.4, ease: EXPO }}
      className="rounded-lg border border-[color-mix(in_srgb,var(--danger)_35%,transparent)] bg-[color-mix(in_srgb,var(--danger)_7%,transparent)] p-5"
    >
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <span className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-md bg-[color-mix(in_srgb,var(--danger)_12%,transparent)] text-danger">
            <TriangleAlert size={16} />
          </span>
          <div>
            <h2 className="text-[16px] font-semibold leading-6 tracking-[-0.01em] text-ink-1">Delete workspace</h2>
            <p className="mt-0.5 max-w-md text-[12px] leading-4 text-ink-2">
              Permanently removes the MyTT workspace, all contracts, resources and stored data. This cannot be undone.
            </p>
          </div>
        </div>
        <button type="button" onClick={() => setOpen(true)} className={btnDestructive}>
          Delete MyTT workspace
        </button>
      </div>

      <Dialog open={open} onOpenChange={close}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete MyTT workspace?</DialogTitle>
            <DialogDescription>
              This permanently deletes the workspace and all of its data. Type{' '}
              <span className="font-mono font-semibold text-ink-1">MYTT</span> to confirm.
            </DialogDescription>
          </DialogHeader>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              attemptDelete();
            }}
          >
            <motion.div
              key={shake}
              animate={shake > 0 ? { x: [0, -6, 6, -4, 4, 0] } : undefined}
              transition={{ duration: 0.2 }}
            >
              <input
                autoFocus
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder="Type MYTT"
                aria-label="Type MYTT to confirm deletion"
                className={inputCls + ' font-mono'}
              />
            </motion.div>
            <DialogFooter className="mt-4">
              <button type="button" onClick={() => close(false)} className={btnSecondary}>
                Cancel
              </button>
              <button type="submit" disabled={!matches} className={btnDestructive}>
                Delete workspace
              </button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </motion.section>
  );
}
