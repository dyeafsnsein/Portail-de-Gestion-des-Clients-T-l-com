import { useEffect, useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowRight, Ban, CalendarDays, PackageCheck, UserRound } from 'lucide-react';
import { toast } from 'sonner';
import ConfirmDialog from '@/components/crud/ConfirmDialog';
import Pill from '@/components/crud/Pill';
import RightDrawer from '@/components/crud/RightDrawer';
import { clientName, fmtCurrency, fmtDate } from '@/lib/format';
import { updateOrderStatus } from '@/services/api/orders.api';
import type { Order, OrderItemType, OrderStatus } from '@/services/types';
import { cn } from '@/lib/utils';

export const ORDER_TONE: Record<OrderStatus, 'neutral' | 'info' | 'warning' | 'success' | 'danger'> = {
  PENDING: 'neutral',
  PROCESSING: 'info',
  SHIPPED: 'warning',
  DELIVERED: 'success',
  CANCELLED: 'danger',
};

const NEXT_STATUS: Partial<Record<OrderStatus, OrderStatus>> = {
  PENDING: 'PROCESSING',
  PROCESSING: 'SHIPPED',
  SHIPPED: 'DELIVERED',
};

const TYPE_TONE: Record<OrderItemType, 'brand' | 'orange' | 'info'> = {
  ACCESSORY: 'brand',
  SERVICE: 'orange',
  RESOURCE: 'info',
};

/** Detail drawer for an order — itemized lines, client info, status flow. */
export default function OrderDrawer({
  order,
  onClose,
}: {
  order: Order | null;
  onClose: () => void;
}) {
  const qc = useQueryClient();
  const [view, setView] = useState<Order | null>(order);
  const [confirmCancel, setConfirmCancel] = useState(false);

  useEffect(() => setView(order), [order]);

  const invalidate = () => qc.invalidateQueries({ queryKey: ['orders'] });

  const advanceMut = useMutation({
    mutationFn: (status: OrderStatus) => updateOrderStatus(view!.id, status),
    onSuccess: (updated) => {
      setView(updated);
      invalidate();
      toast.success(`Order ${updated.status}`, { description: `${updated.id} · ${clientName(updated.client)}` });
    },
  });

  const cancelMut = useMutation({
    mutationFn: () => updateOrderStatus(view!.id, 'CANCELLED'),
    onSuccess: (updated) => {
      setView(updated);
      invalidate();
      setConfirmCancel(false);
      toast.success('Order cancelled', { description: `${updated.id} · ${clientName(updated.client)}` });
    },
  });

  const next = view ? NEXT_STATUS[view.status] : undefined;
  const cancellable = !!view && view.status !== 'CANCELLED' && view.status !== 'DELIVERED';

  return (
    <>
      <RightDrawer
        open={!!view}
        onClose={onClose}
        title={view ? `Order ${view.id}` : 'Order'}
        subtitle={view ? `${clientName(view.client)} · placed ${fmtDate(view.createdAt)}` : ''}
      >
        {view && (
          <div className="space-y-5">
            {/* status banner */}
            <div className="flex items-center justify-between rounded-md border border-line bg-surface-2 px-3 py-2.5">
              <div className="flex items-center gap-2">
                <UserRound size={15} className="text-ink-3" />
                <div>
                  <p className="text-[13px] font-medium text-ink-1">{clientName(view.client)}</p>
                  <p className="font-mono text-[11px] text-ink-3">{view.id}</p>
                </div>
              </div>
              <Pill tone={ORDER_TONE[view.status]}>{view.status}</Pill>
            </div>

            {/* itemized lines */}
            <div>
              <p className="v-label mb-2">Items ({view.items.length})</p>
              <ul className="divide-y divide-line rounded-md border border-line">
                {view.items.map((it) => (
                  <li key={it.id} className="flex items-center gap-3 px-3 py-2.5">
                    <Pill tone={TYPE_TONE[it.itemType]} className="shrink-0">{it.itemType.slice(0, 4)}</Pill>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[13px] font-medium text-ink-1">{it.itemName}</p>
                      <p className="tnum font-mono text-[11px] text-ink-3">
                        {it.quantity} × {fmtCurrency(it.priceAtPurchase, 2)}
                      </p>
                    </div>
                    <span className="tnum shrink-0 font-mono text-[12.5px] text-ink-1">
                      {fmtCurrency(it.quantity * it.priceAtPurchase, 2)}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            {/* totals */}
            <div className="flex items-center justify-between rounded-md border border-line bg-surface-2 px-3 py-2.5">
              <div className="flex items-center gap-2 text-[12px] text-ink-2">
                <CalendarDays size={14} className="text-ink-3" />
                <span className="font-mono">{fmtDate(view.createdAt)}</span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-[12px] text-ink-3">Total</span>
                <span className="tnum font-mono text-[17px] font-semibold text-ink-1">
                  {fmtCurrency(view.totalAmount, 2)}
                </span>
              </div>
            </div>

            {/* status flow */}
            <div className="space-y-2 border-t border-line pt-4">
              {next ? (
                <button
                  type="button"
                  disabled={advanceMut.isPending}
                  onClick={() => advanceMut.mutate(next)}
                  className="flex w-full items-center justify-center gap-2 rounded-md bg-brand px-3 py-2 text-[13px] font-medium text-white shadow-card transition-colors duration-150 hover:bg-brand-strong disabled:opacity-60"
                >
                  <PackageCheck size={15} />
                  {advanceMut.isPending ? 'Updating…' : `Mark as ${next}`}
                  <ArrowRight size={14} />
                </button>
              ) : (
                <div className="flex items-center justify-center gap-2 rounded-md border border-line bg-surface-2 px-3 py-2 text-[12.5px] text-ink-3">
                  {view.status === 'DELIVERED' && 'Order delivered — no further action'}
                  {view.status === 'CANCELLED' && 'Order cancelled'}
                </div>
              )}
              {cancellable && (
                <button
                  type="button"
                  disabled={cancelMut.isPending}
                  onClick={() => setConfirmCancel(true)}
                  className={cn(
                    'flex w-full items-center justify-center gap-2 rounded-md border border-danger/30 bg-[rgba(225,29,72,0.05)] px-3 py-2 text-[13px] font-medium text-danger transition-colors duration-150 hover:bg-[rgba(225,29,72,0.10)] disabled:opacity-60',
                  )}
                >
                  <Ban size={15} />
                  {cancelMut.isPending ? 'Cancelling…' : 'Cancel order'}
                </button>
              )}
            </div>
          </div>
        )}
      </RightDrawer>

      <ConfirmDialog
        open={confirmCancel}
        onOpenChange={setConfirmCancel}
        title="Cancel this order?"
        description={`${view?.id} (${view ? clientName(view.client) : ''}) will be marked CANCELLED and excluded from fulfilment counts. This cannot be undone.`}
        confirmLabel="Cancel order"
        destructive
        onConfirm={() => cancelMut.mutate()}
      />
    </>
  );
}
