import { useEffect, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { ChevronRight, Search } from 'lucide-react';
import DataTable from '@/components/crud/DataTable';
import FilterChips from '@/components/crud/FilterChips';
import Pill from '@/components/crud/Pill';
import SummaryStrip from '@/components/crud/SummaryStrip';
import OrderDrawer, { ORDER_TONE } from '@/components/orders/OrderDrawer';
import { seededSeries } from '@/lib/mock';
import { clientName, fmtCurrency, fmtDate, fmtNumber } from '@/lib/format';
import { listOrders } from '@/services/api/orders.api';
import type { Order, OrderStatus } from '@/services/types';

const STATUS_CHIPS = [
  { value: 'ALL', label: 'All' },
  { value: 'PENDING', label: 'Pending' },
  { value: 'PROCESSING', label: 'Processing' },
  { value: 'SHIPPED', label: 'Shipped' },
  { value: 'DELIVERED', label: 'Delivered' },
  { value: 'CANCELLED', label: 'Cancelled' },
];

export default function OrdersPage() {
  const [query, setQuery] = useState('');
  const [debounced, setDebounced] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [page, setPage] = useState(1);
  const [pageSize] = useState(12);
  const [selected, setSelected] = useState<Order | null>(null);

  useEffect(() => {
    const id = window.setTimeout(() => setDebounced(query.trim()), 150);
    return () => window.clearTimeout(id);
  }, [query]);

  const { data, isPending } = useQuery({
    queryKey: [
      'orders',
      { page, pageSize, search: debounced, status: statusFilter === 'ALL' ? undefined : statusFilter },
    ],
    queryFn: () =>
      listOrders({
        page,
        pageSize,
        search: debounced || undefined,
        status: statusFilter === 'ALL' ? undefined : (statusFilter as OrderStatus),
      }),
  });

  const { data: allData } = useQuery({
    queryKey: ['orders', 'all'],
    queryFn: () => listOrders({ page: 1, pageSize: 100 }),
  });
  const allOrders = allData?.items ?? [];

  const orders = data?.items ?? [];
  const total = data?.meta.totalItems ?? 0;

  const counts = useMemo(() => {
    const by = (s: OrderStatus) => allOrders.filter((o) => o.status === s).length;
    const sum = (fn: (o: Order) => boolean) => allOrders.filter(fn).length;
    return {
      ALL: allOrders.length,
      PENDING: by('PENDING'),
      PROCESSING: by('PROCESSING'),
      SHIPPED: by('SHIPPED'),
      DELIVERED: by('DELIVERED'),
      CANCELLED: by('CANCELLED'),
      FLOW: sum((o) => o.status === 'PROCESSING' || o.status === 'SHIPPED'),
      REVENUE: allOrders.reduce((acc, o) => acc + o.totalAmount, 0),
    };
  }, [allOrders]);

  const resetFilters = () => {
    setQuery('');
    setStatusFilter('ALL');
    setPage(1);
  };

  const summary = useMemo(
    () => [
      { label: 'Total orders', value: counts.ALL, format: (v: number) => fmtNumber(Math.round(v)), spark: seededSeries(1001, 14, 18, 2, 0.2), tone: 'var(--accent)' },
      { label: 'Pending', value: counts.PENDING, format: (v: number) => fmtNumber(Math.round(v)), spark: seededSeries(1002, 14, 3, 0.8, 0), tone: 'var(--text-3)' },
      { label: 'Processing / shipped', value: counts.FLOW, format: (v: number) => fmtNumber(Math.round(v)), spark: seededSeries(1003, 14, 7, 1.2, 0.1), tone: 'var(--info)' },
      { label: 'Delivered', value: counts.DELIVERED, format: (v: number) => fmtNumber(Math.round(v)), spark: seededSeries(1004, 14, 9, 1.5, 0.1), tone: 'var(--success)' },
    ],
    [counts],
  );

  return (
    <div className="space-y-5">
      {/* header */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="flex flex-wrap items-center gap-3"
      >
        <div className="mr-auto">
          <div className="flex items-center gap-2">
            <h1 className="text-[24px] font-semibold leading-8 tracking-[-0.02em] text-ink-1">Orders</h1>
            <span className="rounded-pill bg-brand-soft px-2 py-0.5 font-mono text-[11px] font-medium text-brand">
              {total.toLocaleString('en-US')} total
            </span>
          </div>
          <p className="mt-0.5 text-[13px] text-ink-2">Client orders across accessories, services and resources.</p>
        </div>

        <div className="relative">
          <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-3" />
          <input
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setPage(1);
            }}
            placeholder="Search order id or client…"
            aria-label="Search orders"
            className="w-64 max-w-full rounded-md border border-line-strong bg-surface py-2 pl-9 pr-3 text-[13px] text-ink-1 outline-none transition-colors duration-150 placeholder:text-ink-3 focus:border-brand"
          />
        </div>
      </motion.div>

      <FilterChips
        label="Order status"
        options={STATUS_CHIPS.map((c) => ({ value: c.value, label: c.label, count: counts[c.value as keyof typeof counts] ?? 0 }))}
        active={statusFilter}
        onChange={(v) => {
          setStatusFilter(v);
          setPage(1);
        }}
      />

      <SummaryStrip stats={summary} />

      <div className="relative">
        <DataTable<Order>
          rows={orders}
          columns={[
            {
              key: 'id',
              label: 'Order',
              sortable: true,
              render: (o) => (
                <div>
                  <p className="font-mono text-[12.5px] font-medium text-ink-1">{o.id}</p>
                  <p className="font-mono text-[10.5px] text-ink-3">{fmtDate(o.createdAt)}</p>
                </div>
              ),
            },
            {
              key: 'client',
              label: 'Client',
              sortable: true,
              sortValue: (o) => clientName(o.client),
              render: (o) => <span className="text-[13px] font-medium text-ink-1">{clientName(o.client)}</span>,
            },
            {
              key: 'items',
              label: 'Items',
              sortable: true,
              sortValue: (o) => o.items.length,
              render: (o) => (
                <span className="tnum text-[12.5px] text-ink-2">
                  {o.items.length} {o.items.length === 1 ? 'item' : 'items'}
                </span>
              ),
            },
            {
              key: 'totalAmount',
              label: 'Total',
              align: 'right',
              sortable: true,
              render: (o) => (
                <span className="tnum font-mono text-[12.5px] text-ink-1">{fmtCurrency(o.totalAmount, 2)}</span>
              ),
            },
            {
              key: 'status',
              label: 'Status',
              sortable: true,
              sortValue: (o) => o.status,
              render: (o) => <Pill tone={ORDER_TONE[o.status]}>{o.status}</Pill>,
            },
            {
              key: 'chevron',
              label: '',
              render: () => (
                <ChevronRight size={15} className="ml-auto text-ink-3 transition-transform duration-150 group-hover:translate-x-0.5 group-hover:text-ink-1" />
              ),
            },
          ]}
          countLabel="orders"
          initialSortKey="createdAt"
          initialSortDir={-1}
          emptyTitle="No orders found"
          emptyMessage="Adjust your search or filters to find what you're looking for."
          onResetFilters={resetFilters}
          onRowClick={setSelected}
        />
        {isPending && (
          <div className="v-card absolute inset-0 z-10 grid place-items-center">
            <div className="v-skeleton h-[280px] w-[98%] rounded-lg" />
          </div>
        )}
      </div>

      <OrderDrawer order={selected} onClose={() => setSelected(null)} />
    </div>
  );
}
