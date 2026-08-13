import { motion } from 'framer-motion';
import { ArrowUpRight, ShoppingCart } from 'lucide-react';
import { useNavigate } from 'react-router';
import Pill from '@/components/crud/Pill';
import { ORDER_TONE } from '@/components/orders/OrderDrawer';
import { clientName, fmtCurrency, fmtDate } from '@/lib/format';
import { listRecentOrders } from '@/services/api/orders.api';
import { useQuery } from '@tanstack/react-query';

/** Recent Orders widget — 5 latest orders with status badges (dashboard card). */
export default function RecentOrders() {
  const navigate = useNavigate();
  const { data: orders = [] } = useQuery({ queryKey: ['orders', 'recent'], queryFn: () => listRecentOrders(5) });

  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.45, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="v-card col-span-12 overflow-hidden"
      aria-label="Recent orders"
    >
      <div className="flex items-center gap-2 border-b border-line px-5 py-4">
        <h2 className="text-[16px] font-semibold tracking-[-0.01em] text-ink-1">Recent orders</h2>
        <span className="ml-auto rounded-pill bg-surface-2 px-2 py-0.5 font-mono text-[11px] font-medium text-ink-2">
          {orders.length} latest
        </span>
        <button
          type="button"
          onClick={() => navigate('/orders')}
          className="inline-flex items-center gap-1 rounded-pill border border-line bg-surface px-2.5 py-1 text-[12px] font-medium text-ink-2 transition-colors duration-150 hover:border-line-strong hover:text-ink-1"
        >
          View all
          <ArrowUpRight size={13} />
        </button>
      </div>

      {orders.length === 0 ? (
        <div className="flex flex-col items-center gap-2 px-6 py-10 text-center">
          <ShoppingCart size={20} className="text-ink-3" />
          <p className="text-[13px] text-ink-3">No orders yet.</p>
        </div>
      ) : (
        <ul className="divide-y divide-line">
          {orders.map((o, i) => (
            <motion.li
              key={o.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 + i * 0.05, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            >
              <button
                type="button"
                onClick={() => navigate('/orders')}
                className="group flex w-full items-center gap-3 px-5 py-3 text-left transition-colors duration-150 hover:bg-surface-2"
              >
                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-brand-soft text-brand">
                  <ShoppingCart size={14} />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[13px] font-medium text-ink-1">
                    {clientName(o.client)}
                    <span className="ml-1.5 font-mono text-[11px] font-normal text-ink-3">{o.id}</span>
                  </p>
                  <p className="font-mono text-[10.5px] text-ink-3">{fmtDate(o.createdAt)}</p>
                </div>
                <div className="flex shrink-0 flex-col items-end gap-1">
                  <span className="tnum font-mono text-[12.5px] font-medium text-ink-1">
                    {fmtCurrency(o.totalAmount, 2)}
                  </span>
                  <Pill tone={ORDER_TONE[o.status]}>{o.status}</Pill>
                </div>
              </button>
            </motion.li>
          ))}
        </ul>
      )}
    </motion.section>
  );
}
