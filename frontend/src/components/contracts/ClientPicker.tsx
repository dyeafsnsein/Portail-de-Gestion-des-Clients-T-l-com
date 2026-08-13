import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { AnimatePresence, motion } from 'framer-motion';
import { Check, ChevronsUpDown, Search } from 'lucide-react';
import { listUsers } from '@/services/api/users.api';
import type { User } from '@/services/types';
import { cn } from '@/lib/utils';

/** Searchable client picker — lists USER-role accounts from the users service. */
export default function ClientPicker({
  value,
  onChange,
}: {
  value: string | null;
  onChange: (id: string | null) => void;
}) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState('');
  const { data } = useQuery({
    queryKey: ['users', 'clients'],
    queryFn: () => listUsers({ page: 1, pageSize: 100, role: 'USER' }),
  });
  const clients = data?.items ?? [];

  const filtered = clients.filter((u) => `${u.email} ${u.firstName ?? ''} ${u.lastName ?? ''}`.toLowerCase().includes(q.toLowerCase()));
  const selected: User | undefined = clients.find((u) => u.id === value);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={cn(
          'flex h-9 w-full items-center justify-between gap-2 rounded-md border border-line-strong bg-surface px-3 text-[13px] text-ink-1 outline-none transition-colors duration-150 focus:border-brand',
          !selected && 'text-ink-3',
        )}
      >
        <span className="truncate">{selected ? selected.email : 'Select a client'}</span>
        <ChevronsUpDown size={14} className="shrink-0 text-ink-3" />
      </button>

      <AnimatePresence>
        {open && (
          <>
            <button type="button" aria-label="Close picker" className="fixed inset-0 z-30 cursor-default" onClick={() => setOpen(false)} />
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: -4 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: -4 }}
              transition={{ duration: 0.15 }}
              className="absolute left-0 right-0 z-40 mt-1.5 overflow-hidden rounded-md border border-line bg-surface shadow-pop"
            >
              <div className="relative border-b border-line">
                <Search size={13} className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-ink-3" />
                <input
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="Search clients…"
                  className="w-full bg-transparent py-2 pl-8 pr-3 text-[13px] text-ink-1 outline-none placeholder:text-ink-3"
                />
              </div>
              <ul className="max-h-56 overflow-y-auto p-1">
                {filtered.map((u) => (
                  <li key={u.id}>
                    <button
                      type="button"
                      onClick={() => {
                        onChange(u.id);
                        setOpen(false);
                      }}
                      className={cn(
                        'flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-left text-[13px] transition-colors duration-100',
                        value === u.id ? 'bg-brand-soft font-medium text-brand' : 'text-ink-2 hover:bg-surface-2 hover:text-ink-1',
                      )}
                    >
                      <span className="min-w-0 flex-1">
                        <span className="block truncate">{u.email}</span>
                        <span className="block text-[10.5px] text-ink-3">{u.id}</span>
                      </span>
                      {value === u.id && <Check size={13} />}
                    </button>
                  </li>
                ))}
                {filtered.length === 0 && (
                  <li className="px-2 py-3 text-center text-[12.5px] text-ink-3">No clients match “{q}”.</li>
                )}
              </ul>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
