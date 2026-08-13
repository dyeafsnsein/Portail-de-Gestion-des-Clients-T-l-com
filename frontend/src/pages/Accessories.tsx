import { useEffect, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { ChevronRight, Plus, Search } from 'lucide-react';
import DataTable from '@/components/crud/DataTable';
import FilterChips from '@/components/crud/FilterChips';
import Pill from '@/components/crud/Pill';
import AccessoryDrawer from '@/components/accessories/AccessoryDrawer';
import SummaryStrip from '@/components/crud/SummaryStrip';
import { seededSeries } from '@/lib/mock';
import { fmtCurrency, fmtNumber } from '@/lib/format';
import { listAccessories } from '@/services/api/accessories.api';
import type { Accessory, AccessoryCategory } from '@/services/types';
import { cn } from '@/lib/utils';

const CATEGORY_CHIPS = [
  { value: 'ALL', label: 'All' },
  { value: 'SMARTPHONE', label: 'Smartphones' },
  { value: 'CHARGER', label: 'Chargers' },
  { value: 'HEADSET', label: 'Headsets' },
  { value: 'MODEM', label: 'Modems' },
];

const CATEGORY_TONE: Record<AccessoryCategory, 'brand' | 'orange' | 'success' | 'info' | 'warning'> = {
  SMARTPHONE: 'brand',
  CHARGER: 'warning',
  HEADSET: 'orange',
  MODEM: 'info',
};

export default function AccessoriesPage() {
  const [query, setQuery] = useState('');
  const [debounced, setDebounced] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [page, setPage] = useState(1);
  const [pageSize] = useState(12);
  const [selected, setSelected] = useState<Accessory | null>(null);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    const id = window.setTimeout(() => setDebounced(query.trim()), 150);
    return () => window.clearTimeout(id);
  }, [query]);

  const { data, isPending } = useQuery({
    queryKey: [
      'accessories',
      { page, pageSize, search: debounced, category: categoryFilter === 'ALL' ? undefined : categoryFilter },
    ],
    queryFn: () =>
      listAccessories({
        page,
        pageSize,
        search: debounced || undefined,
        category: categoryFilter === 'ALL' ? undefined : (categoryFilter as AccessoryCategory),
      }),
  });

  const { data: allData } = useQuery({
    queryKey: ['accessories', 'all'],
    queryFn: () => listAccessories({ page: 1, pageSize: 100 }),
  });
  const allAccessories = allData?.items ?? [];

  const accessories = data?.items ?? [];
  const total = data?.meta.totalItems ?? 0;

  const counts = useMemo(() => {
    const sum = (fn: (a: Accessory) => boolean) => allAccessories.filter(fn).length;
    const inStock = (a: Accessory) => a.stockQuantity > 0;
    return {
      ALL: allAccessories.length,
      SMARTPHONE: sum((a) => a.category === 'SMARTPHONE'),
      CHARGER: sum((a) => a.category === 'CHARGER'),
      HEADSET: sum((a) => a.category === 'HEADSET'),
      MODEM: sum((a) => a.category === 'MODEM'),
      OUT_OF_STOCK: sum((a) => !inStock(a)),
      IN_STOCK: sum(inStock),
      UNITS: allAccessories.reduce((acc, a) => acc + a.stockQuantity, 0),
    };
  }, [allAccessories]);

  const resetFilters = () => {
    setQuery('');
    setCategoryFilter('ALL');
    setPage(1);
  };

  const summary = useMemo(
    () => [
      { label: 'Catalog items', value: counts.ALL, format: (v: number) => fmtNumber(Math.round(v)), spark: seededSeries(901, 14, 18, 3, 0.3), tone: 'var(--accent)' },
      { label: 'Units in stock', value: counts.UNITS, format: (v: number) => fmtNumber(Math.round(v)), spark: seededSeries(902, 14, 400, 60, 10), tone: 'var(--info)' },
      { label: 'In stock', value: counts.IN_STOCK, format: (v: number) => fmtNumber(Math.round(v)), spark: seededSeries(903, 14, 16, 2, 0.2), tone: 'var(--success)' },
      { label: 'Out of stock', value: counts.OUT_OF_STOCK, format: (v: number) => fmtNumber(Math.round(v)), spark: seededSeries(904, 14, 1, 0.8, 0), tone: 'var(--danger)' },
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
            <h1 className="text-[24px] font-semibold leading-8 tracking-[-0.02em] text-ink-1">Accessories</h1>
            <span className="rounded-pill bg-brand-soft px-2 py-0.5 font-mono text-[11px] font-medium text-brand">
              {total.toLocaleString('en-US')} total
            </span>
          </div>
          <p className="mt-0.5 text-[13px] text-ink-2">Hardware catalog and stock levels.</p>
        </div>

        <div className="relative">
          <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-3" />
          <input
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setPage(1);
            }}
            placeholder="Search accessories…"
            aria-label="Search accessories"
            className="w-56 max-w-full rounded-md border border-line-strong bg-surface py-2 pl-9 pr-3 text-[13px] text-ink-1 outline-none transition-colors duration-150 placeholder:text-ink-3 focus:border-brand"
          />
        </div>

        <motion.button
          type="button"
          whileTap={{ scale: 0.97 }}
          onClick={() => setCreating(true)}
          className="inline-flex items-center gap-1.5 rounded-md bg-brand px-3.5 py-2 text-[13px] font-medium text-white shadow-card transition-colors duration-150 hover:bg-brand-strong"
        >
          <Plus size={15} />
          New accessory
        </motion.button>
      </motion.div>

      <FilterChips
        label="Category"
        options={CATEGORY_CHIPS.map((c) => ({ value: c.value, label: c.label, count: counts[c.value as keyof typeof counts] ?? 0 }))}
        active={categoryFilter}
        onChange={(v) => {
          setCategoryFilter(v);
          setPage(1);
        }}
      />

      <SummaryStrip stats={summary} />

      <div className="relative">
        <DataTable<Accessory>
          rows={accessories}
          columns={[
            {
              key: 'name',
              label: 'Name',
              sortable: true,
              render: (a) => (
                <div className="flex items-center gap-2.5">
                  <div className="grid size-8 shrink-0 place-items-center overflow-hidden rounded-md border border-line bg-surface-2">
                    {a.imageUrl ? (
                      <img src={a.imageUrl} alt={a.name} className="size-full object-cover" />
                    ) : (
                      <span className="text-[10px] font-semibold text-ink-3">{a.name.slice(0, 2).toUpperCase()}</span>
                    )}
                  </div>
                  <span className="text-[13px] font-medium text-ink-1">{a.name}</span>
                </div>
              ),
            },
            {
              key: 'category',
              label: 'Category',
              sortable: true,
              render: (a) => <Pill tone={CATEGORY_TONE[a.category]}>{a.category}</Pill>,
            },
            {
              key: 'price',
              label: 'Price',
              align: 'right',
              sortable: true,
              render: (a) => (
                <span className="tnum font-mono text-[12.5px] text-ink-1">{fmtCurrency(a.price, 2)}</span>
              ),
            },
            {
              key: 'stockQuantity',
              label: 'Stock',
              align: 'right',
              sortable: true,
              render: (a) => (
                <span className={cn('tnum font-mono text-[12.5px]', a.stockQuantity === 0 ? 'font-semibold text-danger' : 'text-ink-1')}>
                  {a.stockQuantity} {a.stockQuantity === 0 && <span className="text-[11px] font-medium">· out</span>}
                </span>
              ),
            },
            {
              key: 'chevron',
              label: '',
              render: () => (
                <ChevronRight size={15} className="ml-auto text-ink-3 transition-transform duration-150 group-hover:translate-x-0.5 group-hover:text-ink-1" />
              ),
            },
          ]}
          countLabel="accessories"
          initialSortKey="name"
          initialSortDir={1}
          emptyTitle="No accessories found"
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

      <AccessoryDrawer accessory={selected} creating={false} onClose={() => setSelected(null)} />
      <AccessoryDrawer accessory={null} creating={creating} onClose={() => setCreating(false)} />
    </div>
  );
}
