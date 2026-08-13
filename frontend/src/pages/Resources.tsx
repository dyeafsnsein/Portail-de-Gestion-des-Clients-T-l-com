import { useEffect, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { ChevronRight, Plus, Search } from 'lucide-react';
import DataTable from '@/components/crud/DataTable';
import FilterChips from '@/components/crud/FilterChips';
import Pill from '@/components/crud/Pill';
import SummaryStrip from '@/components/crud/SummaryStrip';
import ResourceDrawer from '@/components/resources/ResourceDrawer';
import { seededSeries } from '@/lib/mock';
import { clientName, fmtNumber } from '@/lib/format';
import { listAllContracts } from '@/services/api/contracts.api';
import { listResources } from '@/services/api/resources.api';
import type { Resource, ResourceStatus, ResourceType } from '@/services/types';

const TYPE_CHIPS = [
  { value: 'ALL', label: 'All' },
  { value: 'SIM', label: 'SIM' },
  { value: 'ESIM', label: 'ESIM' },
];

const STATUS_CHIPS = [
  { value: 'ALL', label: 'All' },
  { value: 'ASSIGNED', label: 'Assigned' },
  { value: 'AVAILABLE', label: 'Available' },
  { value: 'BLOCKED', label: 'Blocked' },
];

const TYPE_TONE: Record<ResourceType, 'brand' | 'orange'> = { SIM: 'brand', ESIM: 'orange' };
const STATUS_TONE: Record<ResourceStatus, 'info' | 'success' | 'danger'> = {
  ASSIGNED: 'info',
  AVAILABLE: 'success',
  BLOCKED: 'danger',
};

export default function ResourcesPage() {
  const [query, setQuery] = useState('');
  const [debounced, setDebounced] = useState('');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [page, setPage] = useState(1);
  const [pageSize] = useState(12);
  const [selected, setSelected] = useState<Resource | null>(null);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    const id = window.setTimeout(() => setDebounced(query.trim()), 150);
    return () => window.clearTimeout(id);
  }, [query]);

  const { data, isPending } = useQuery({
    queryKey: [
      'resources',
      { page, pageSize, search: debounced, type: typeFilter === 'ALL' ? undefined : typeFilter, status: statusFilter === 'ALL' ? undefined : statusFilter },
    ],
    queryFn: () =>
      listResources({
        page,
        pageSize,
        search: debounced || undefined,
        type: typeFilter === 'ALL' ? undefined : (typeFilter as ResourceType),
        status: statusFilter === 'ALL' ? undefined : (statusFilter as ResourceStatus),
      }),
  });

  const { data: allData } = useQuery({
    queryKey: ['resources', 'all'],
    queryFn: () => listResources({ page: 1, pageSize: 100 }),
  });
  const allResources = allData?.items ?? [];

  const { data: contractsData } = useQuery({ queryKey: ['contracts', 'all'], queryFn: listAllContracts });
  const contracts = contractsData ?? [];
  const clientOf = useMemo(() => {
    const map = new Map(contracts.map((c) => [c.id, clientName(c.client)]));
    return (id: string | null) => (id ? map.get(id) ?? null : null);
  }, [contracts]);

  const resources = data?.items ?? [];
  const total = data?.meta.totalItems ?? 0;

  const counts = useMemo(() => {
    const by = (fn: (r: Resource) => boolean) => allResources.filter(fn).length;
    return {
      ALL: allResources.length,
      SIM: by((r) => r.type === 'SIM'),
      ESIM: by((r) => r.type === 'ESIM'),
      ASSIGNED: by((r) => r.status === 'ASSIGNED'),
      AVAILABLE: by((r) => r.status === 'AVAILABLE'),
      BLOCKED: by((r) => r.status === 'BLOCKED'),
    };
  }, [allResources]);

  const resetFilters = () => {
    setQuery('');
    setTypeFilter('ALL');
    setStatusFilter('ALL');
    setPage(1);
  };

  const summary = useMemo(
    () => [
      { label: 'Total resources', value: counts.ALL, format: (v: number) => fmtNumber(Math.round(v)), spark: seededSeries(701, 14, 26, 4, 0.4), tone: 'var(--accent)' },
      { label: 'Assigned', value: counts.ASSIGNED, format: (v: number) => fmtNumber(Math.round(v)), spark: seededSeries(702, 14, 16, 3, 0.3), tone: 'var(--info)' },
      { label: 'Available', value: counts.AVAILABLE, format: (v: number) => fmtNumber(Math.round(v)), spark: seededSeries(703, 14, 6, 1.5, 0.2), tone: 'var(--success)' },
      { label: 'Blocked', value: counts.BLOCKED, format: (v: number) => fmtNumber(Math.round(v)), spark: seededSeries(704, 14, 2, 0.8, 0.1), tone: 'var(--danger)' },
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
            <h1 className="text-[24px] font-semibold leading-8 tracking-[-0.02em] text-ink-1">Resources</h1>
            <span className="rounded-pill bg-brand-soft px-2 py-0.5 font-mono text-[11px] font-medium text-brand">
              {total.toLocaleString('en-US')} total
            </span>
          </div>
          <p className="mt-0.5 text-[13px] text-ink-2">SIM and eSIM inventory.</p>
        </div>

        <div className="relative">
          <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-3" />
          <input
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setPage(1);
            }}
            placeholder="Search iccid / imsi / msisdn…"
            aria-label="Search resources"
            className="w-64 max-w-full rounded-md border border-line-strong bg-surface py-2 pl-9 pr-3 text-[13px] text-ink-1 outline-none transition-colors duration-150 placeholder:text-ink-3 focus:border-brand"
          />
        </div>

        <motion.button
          type="button"
          whileTap={{ scale: 0.97 }}
          onClick={() => setCreating(true)}
          className="inline-flex items-center gap-1.5 rounded-md bg-brand px-3.5 py-2 text-[13px] font-medium text-white shadow-card transition-colors duration-150 hover:bg-brand-strong"
        >
          <Plus size={15} />
          New resource
        </motion.button>
      </motion.div>

      <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
        <FilterChips
          label="Resource type"
          options={TYPE_CHIPS.map((c) => ({ value: c.value, label: c.label, count: counts[c.value as keyof typeof counts] ?? 0 }))}
          active={typeFilter}
          onChange={(v) => {
            setTypeFilter(v);
            setPage(1);
          }}
        />
        <FilterChips
          label="Resource status"
          options={STATUS_CHIPS.map((c) => ({ value: c.value, label: c.label, count: counts[c.value as keyof typeof counts] ?? 0 }))}
          active={statusFilter}
          onChange={(v) => {
            setStatusFilter(v);
            setPage(1);
          }}
        />
      </div>

      <SummaryStrip stats={summary} />

      <div className="relative">
        <DataTable<Resource>
          rows={resources}
          columns={[
            {
              key: 'type',
              label: 'Type',
              sortable: true,
              render: (r) => <Pill tone={TYPE_TONE[r.type]}>{r.type}</Pill>,
            },
            {
              key: 'iccid',
              label: 'ICCID',
              sortable: true,
              render: (r) => (
                <span className="font-mono text-[12.5px] text-ink-1">
                  {r.iccid.slice(0, 4)}…{r.iccid.slice(-4)}
                </span>
              ),
            },
            {
              key: 'imsi',
              label: 'IMSI',
              sortable: true,
              render: (r) => <span className="font-mono text-[12.5px] text-ink-2">{r.imsi}</span>,
            },
            {
              key: 'msisdn',
              label: 'MSISDN',
              sortable: true,
              render: (r) => <span className="font-mono text-[12.5px] text-ink-2">{r.msisdn}</span>,
            },
            {
              key: 'status',
              label: 'Status',
              sortable: true,
              render: (r) => <Pill tone={STATUS_TONE[r.status]}>{r.status}</Pill>,
            },
            {
              key: 'contract',
              label: 'Linked contract',
              sortable: true,
              sortValue: (r) => clientOf(r.contractId) ?? '',
              render: (r) => {
                const client = clientOf(r.contractId);
                return client ? (
                  <div className="min-w-0">
                    <p className="truncate text-[13px] font-medium text-ink-1">{client}</p>
                    <p className="font-mono text-[11px] text-ink-3">{r.contractId}</p>
                  </div>
                ) : (
                  <span className="text-[12px] text-ink-3">—</span>
                );
              },
            },
            {
              key: 'chevron',
              label: '',
              render: () => (
                <ChevronRight size={15} className="ml-auto text-ink-3 transition-transform duration-150 group-hover:translate-x-0.5 group-hover:text-ink-1" />
              ),
            },
          ]}
          countLabel="resources"
          initialSortKey="iccid"
          initialSortDir={1}
          emptyTitle="No resources found"
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

      <ResourceDrawer resource={selected} creating={false} onClose={() => setSelected(null)} />
      <ResourceDrawer resource={null} creating={creating} onClose={() => setCreating(false)} />
    </div>
  );
}
