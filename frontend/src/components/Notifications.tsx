import { useMemo, useRef, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { AnimatePresence, motion } from 'framer-motion';
import { Bell } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { clientName, fmtClock, fmtCurrency } from '@/lib/format';
import { listAccessories } from '@/services/api/accessories.api';
import { listRecentOrders } from '@/services/api/orders.api';
import { listUsers } from '@/services/api/users.api';

function relTime(at: number): string {
  const mins = Math.round((Date.now() - at) / 60_000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const h = Math.floor(mins / 60);
  return `${h}h ${mins % 60 ? `${mins % 60}m` : ''} ago`.trim();
}

interface Notif {
  id: string;
  title: string;
  body: string;
  time: number;
  tone: string;
}

function buildNotifications(
  orders: { id: string; createdAt: string; totalAmount: number; client: { email: string } }[],
  users: { id: string; createdAt: string; email: string }[],
  accessories: { id: string; name: string; stockQuantity: number; updatedAt: string }[],
): Notif[] {
  const out: Notif[] = [];

  for (const o of orders) {
    out.push({
      id: `order-${o.id}`,
      title: 'New order',
      body: `${clientName(o.client)} placed an order for ${fmtCurrency(o.totalAmount, 2)}.`,
      time: new Date(o.createdAt).getTime(),
      tone: 'var(--accent)',
    });
  }

  const newest = [...users].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  for (const u of newest.slice(0, 5)) {
    out.push({
      id: `user-${u.id}`,
      title: 'New user registered',
      body: `${u.email} just joined the portal.`,
      time: new Date(u.createdAt).getTime(),
      tone: 'var(--success)',
    });
  }

  for (const a of accessories.filter((x) => x.stockQuantity < 10)) {
    out.push({
      id: `stock-${a.id}`,
      title: 'Low stock alert',
      body: `${a.name} is down to ${a.stockQuantity} units.`,
      time: new Date(a.updatedAt).getTime(),
      tone: 'var(--warning)',
    });
  }

  return out.sort((a, b) => b.time - a.time).slice(0, 8);
}

export default function Notifications() {
  const [open, setOpen] = useState(false);
  const lastSeen = useRef<number>(Date.now());

  const ordersQ = useQuery({
    queryKey: ['orders', 'recent', 'notif'],
    queryFn: () => listRecentOrders(6),
    refetchInterval: 30_000,
  });
  const usersQ = useQuery({
    queryKey: ['users', 'notif'],
    queryFn: () => listUsers({ page: 1, pageSize: 100 }),
    refetchInterval: 30_000,
  });
  const accQ = useQuery({
    queryKey: ['accessories', 'notif'],
    queryFn: () => listAccessories({ page: 1, pageSize: 100 }),
    refetchInterval: 30_000,
  });

  const notifs = useMemo(
    () => buildNotifications(ordersQ.data ?? [], usersQ.data?.items ?? [], accQ.data?.items ?? []),
    [ordersQ.data, usersQ.data, accQ.data],
  );

  const unread = notifs.filter((n) => n.time > lastSeen.current).length;
  const loading = ordersQ.isPending || usersQ.isPending || accQ.isPending;

  return (
    <DropdownMenu
      open={open}
      onOpenChange={(v) => {
        setOpen(v);
        if (v) lastSeen.current = Date.now();
      }}
    >
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          aria-label="Notifications"
          className="relative grid h-9 w-9 place-items-center rounded-md border border-line bg-surface text-ink-2 transition-colors duration-150 hover:bg-surface-2 hover:text-ink-1"
        >
          <Bell size={16} />
          {unread > 0 && (
            <span className="absolute right-1.5 top-1.5 grid h-4 min-w-4 place-items-center rounded-full bg-danger px-1 font-mono text-[9px] font-semibold text-white ring-2 ring-surface">
              {unread > 9 ? '9+' : unread}
            </span>
          )}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 p-0">
        <div className="flex items-center justify-between border-b border-line px-4 py-2.5">
          <span className="text-[13px] font-semibold text-ink-1">Notifications</span>
          {unread > 0 && (
            <span className="rounded-pill bg-brand-soft px-2 py-0.5 text-[10px] font-semibold text-brand">
              {unread} new
            </span>
          )}
        </div>
        {loading && notifs.length === 0 ? (
          <div className="px-4 py-8 text-center text-[12.5px] text-ink-3">Loading notifications…</div>
        ) : notifs.length === 0 ? (
          <div className="px-4 py-8 text-center text-[12.5px] text-ink-3">No notifications yet.</div>
        ) : (
          <AnimatePresence>
            {open &&
              notifs.map((n, i) => (
                <motion.div
                  key={n.id}
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04, duration: 0.2 }}
                  className="flex gap-3 border-b border-line px-4 py-3 last:border-0 hover:bg-surface-2"
                >
                  <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full" style={{ background: n.tone }} />
                  <div className="min-w-0">
                    <div className="text-[13px] font-medium text-ink-1">{n.title}</div>
                    <div className="text-[12px] leading-4 text-ink-2">{n.body}</div>
                    <div className="mt-1 font-mono text-[10px] text-ink-3">{fmtClock(new Date(n.time))} · {relTime(n.time)}</div>
                  </div>
                </motion.div>
              ))}
          </AnimatePresence>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
