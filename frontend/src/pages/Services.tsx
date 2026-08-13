import { useEffect, useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { ChevronRight, Plus, Search } from 'lucide-react';
import { toast } from 'sonner';
import DataTable from '@/components/crud/DataTable';
import FilterChips from '@/components/crud/FilterChips';
import Pill from '@/components/crud/Pill';
import ServiceDrawer from '@/components/services/ServiceDrawer';
import SummaryStrip from '@/components/crud/SummaryStrip';
import { Switch } from '@/components/ui/switch';
import { seededSeries } from '@/lib/mock';
import { fmtCurrency, fmtNumber } from '@/lib/format';
import { listServices, updateService } from '@/services/api/services.api';
import type { Service, ServiceType } from '@/services/types';
import { cn } from '@/lib/utils';

const TYPE_CHIPS = [
  { value: 'ALL', label: 'All' },
  { value: 'INTERNET', label: 'Internet' },
  { value: 'ROAMING', label: 'Roaming' },
  { value: 'VOLTE', label: 'VoLTE' },
  { value: 'SMS', label: 'SMS' },
  { value: 'OPTION', label: 'Option' },
];

const STATE_CHIPS = [
  { value: 'ALL', label: 'All' },
  { value: 'ACTIVE', label: 'Active' },
  { value: 'INACTIVE', label: 'Inactive' },
];

const TYPE_TONE: Record<ServiceType, 'brand' | 'orange' | 'success' | 'info' | 'neutral'> = {
  INTERNET: 'brand',
  ROAMING: 'orange',
  VOLTE: 'info',
  SMS: 'success',
  OPTION: 'neutral',
};

export default function ServicesPage() {
  const qc = useQueryClient();
  const [query, setQuery] = useState('');
  const [debounced, setDebounced] = useState('');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [stateFilter, setStateFilter] = useState('ALL');
  const [page, setPage] = useState(1);
  const [pageSize] = useState(12);
  const [selected, setSelected] = useState<Service | null>(null);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    const id = window.setTimeout(() => setDebounced(query.trim()), 150);
    return () => window.clearTimeout(id);
  }, [query]);

  const { data, isPending } = useQuery({
    queryKey: [
      'services',
      {
        page,
        pageSize,
        search: debounced,
        type: typeFilter === 'ALL' ? undefined : typeFilter,
        isActive: stateFilter === 'ALL' ? undefined : stateFilter === 'ACTIVE',
      },
    ],
    queryFn: () =>
      listServices({
        page,
        pageSize,
        search: debounced || undefined,
        type: typeFilter === 'ALL' ? undefined : (typeFilter as ServiceType),
        isActive: stateFilter === 'ALL' ? undefined : stateFilter === 'ACTIVE',
      }),
  });

  const { data: allData } = useQuery({
    queryKey: ['services', 'all'],
    queryFn: () => listServices({ page: 1, pageSize: 100 }),
  });
  const allServices = allData?.items ?? [];

  const toggleMut = useMutation({
    mutationFn: (s: Service) => updateService(s.id, { isActive: !s.isActive }),
    onSuccess: (updated) => {
      qc.invalidateQueries({ queryKey: ['services'] });
      toast.success(updated.isActive ? 'Service activated' : 'Service deactivated', { description: updated.name });
    },
  });

  const services = data?.items ?? [];
  const total = data?.meta.totalItems ?? 0;

  const counts = useMemo(() => {
    const active = allServices.filter((s) => s.isActive).length;
    const types = new Set(allServices.map((s) => s.type));
    return {
      ALL: allServices.length,
      ACTIVE: active,
      INACTIVE: allServices.length - active,
      TYPES: types.size,
      INTERNET: allServices.filter((s) => s.type === 'INTERNET').length,
      ROAMING: allServices.filter((s) => s.type === 'ROAMING').length,
      VOLTE: allServices.filter((s) => s.type === 'VOLTE').length,
      SMS: allServices.filter((s) => s.type === 'SMS').length,
      OPTION: allServices.filter((s) => s.type === 'OPTION').length,
    };
  }, [allServices]);

  const resetFilters = () => {
    setQuery('');
    setTypeFilter('ALL');
    setStateFilter('ALL');
    setPage(1);
  };

  const summary = useMemo(
    () => [
      { label: 'Total services', value: counts.ALL, format: (v: number) => fmtNumber(Math.round(v)), spark: seededSeries(801, 14, 12, 2, 0.2), tone: 'var(--accent)' },
      { label: 'Active', value: counts.ACTIVE, format: (v: number) => fmtNumber(Math.round(v)), spark: seededSeries(802, 14, 10, 1.5, 0.1), tone: 'var(--success)' },
      { label: 'Inactive', value: counts.INACTIVE, format: (v: number) => fmtNumber(Math.round(v)), spark: seededSeries(803, 14, 3, 1, 0), tone: 'var(--warning)' },
      { label: 'Catalog types', value: counts.TYPES, format: (v: number) => fmtNumber(Math.round(v)), spark: seededSeries(804, 14, 5, 0.5, 0), tone: 'var(--info)' },
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
            <h1 className="text-[24px] font-semibold leading-8 tracking-[-0.02em] text-ink-1">Services</h1>
            <span className="rounded-pill bg-brand-soft px-2 py-0.5 font-mono text-[11px] font-medium text-brand">
              {total.toLocaleString('en-US')} total
            </span>
          </div>
          <p className="mt-0.5 text-[13px] text-ink-2">Telecom services catalog.</p>
        </div>

        <div className="relative">
          <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-3" />
          <input
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setPage(1);
            }}
            placeholder="Search services…"
            aria-label="Search services"
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
          New service
        </motion.button>
      </motion.div>

      <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
        <FilterChips
          label="Service type"
          options={TYPE_CHIPS.map((c) => ({ value: c.value, label: c.label, count: counts[c.value as keyof typeof counts] ?? 0 }))}
          active={typeFilter}
          onChange={(v) => {
            setTypeFilter(v);
            setPage(1);
          }}
        />
        <FilterChips
          label="Service state"
          options={STATE_CHIPS.map((c) => ({ value: c.value, label: c.label, count: counts[c.value as keyof typeof counts] ?? 0 }))}
          active={stateFilter}
          onChange={(v) => {
            setStateFilter(v);
            setPage(1);
          }}
        />
      </div>

      <SummaryStrip stats={summary} />

      <div className="relative">
        <DataTable<Service>
          rows={services}
          columns={[
            {
              key: 'name',
              label: 'Name',
              sortable: true,
              render: (s) => (
                <div className="min-w-0 max-w-[280px]">
                  <p className="truncate text-[13px] font-medium text-ink-1">{s.name}</p>
                  <p className="truncate text-[11.5px] text-ink-3">{s.description}</p>
                </div>
              ),
            },
            {
              key: 'type',
              label: 'Type',
              sortable: true,
              render: (s) => <Pill tone={TYPE_TONE[s.type]}>{s.type}</Pill>,
            },
            {
              key: 'price',
              label: 'Price',
              align: 'right',
              sortable: true,
              render: (s) => (
                <span className="tnum font-mono text-[12.5px] text-ink-1">{fmtCurrency(s.price, 2)}</span>
              ),
            },
            {
              key: 'isActive',
              label: 'Status',
              sortable: true,
              sortValue: (s) => (s.isActive ? 1 : 0),
              render: (s) => (
                <div className="flex items-center gap-2">
                  <Switch
                    checked={s.isActive}
                    onCheckedChange={() => toggleMut.mutate(s)}
                    aria-label={`${s.isActive ? 'Deactivate' : 'Activate'} ${s.name}`}
                    className="h-[18px] w-8 [&_[data-slot=switch-thumb]]:size-3.5"
                  />
                  <span className={cn('text-[12px]', s.isActive ? 'text-success' : 'text-ink-3')}>
                    {s.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
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
          countLabel="services"
          initialSortKey="name"
          initialSortDir={1}
          emptyTitle="No services found"
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

      <ServiceDrawer service={selected} creating={false} onClose={() => setSelected(null)} />
      <ServiceDrawer service={null} creating={creating} onClose={() => setCreating(false)} />
    </div>
  );
}
