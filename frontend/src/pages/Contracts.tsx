import { useEffect, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { ChevronRight, Plus, Search } from 'lucide-react';
import ContractDrawer from '@/components/contracts/ContractDrawer';
import DataTable from '@/components/crud/DataTable';
import FilterChips from '@/components/crud/FilterChips';
import Pill from '@/components/crud/Pill';
import SummaryStrip from '@/components/crud/SummaryStrip';
import { seededSeries } from '@/lib/mock';
import { clientName, fmtDate, fmtNumber } from '@/lib/format';
import { listAllContracts, listContracts } from '@/services/api/contracts.api';
import type { Contract, ContractStatus } from '@/services/types';

const STATUS_CHIPS: Array<{ value: string; label: string }> = [
  { value: 'ALL', label: 'All' },
  { value: 'ACTIVE', label: 'Active' },
  { value: 'SUSPENDED', label: 'Suspended' },
  { value: 'TERMINATED', label: 'Terminated' },
];

const STATUS_TONE: Record<ContractStatus, 'success' | 'warning' | 'danger'> = {
  ACTIVE: 'success',
  SUSPENDED: 'warning',
  TERMINATED: 'danger',
};

export default function ContractsPage() {
  const [query, setQuery] = useState('');
  const [debounced, setDebounced] = useState('');
  const [status, setStatus] = useState('ALL');
  const [page, setPage] = useState(1);
  const [pageSize] = useState(12);
  const [selected, setSelected] = useState<Contract | null>(null);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    const id = window.setTimeout(() => setDebounced(query.trim()), 150);
    return () => window.clearTimeout(id);
  }, [query]);

  const { data, isPending } = useQuery({
    queryKey: ['contracts', { page, pageSize, search: debounced, status: status === 'ALL' ? undefined : status }],
    queryFn: () =>
      listContracts({
        page,
        pageSize,
        search: debounced || undefined,
        status: status === 'ALL' ? undefined : (status as ContractStatus),
      }),
  });

  const { data: allData } = useQuery({ queryKey: ['contracts', 'all'], queryFn: listAllContracts });
  const allContracts = allData ?? [];

  const contracts = data?.items ?? [];
  const total = data?.meta.totalItems ?? 0;

  const counts = useMemo(() => {
    const byStatus = (s: ContractStatus) => allContracts.filter((c) => c.status === s).length;
    return {
      ALL: allContracts.length,
      ACTIVE: byStatus('ACTIVE'),
      SUSPENDED: byStatus('SUSPENDED'),
      TERMINATED: byStatus('TERMINATED'),
    };
  }, [allContracts]);

  const resetFilters = () => {
    setQuery('');
    setStatus('ALL');
    setPage(1);
  };

  const summary = useMemo(
    () => [
      { label: 'Total contracts', value: counts.ALL, format: (v: number) => fmtNumber(Math.round(v)), spark: seededSeries(601, 14, 18, 3, 0.4), tone: 'var(--accent)' },
      { label: 'Active', value: counts.ACTIVE, format: (v: number) => fmtNumber(Math.round(v)), spark: seededSeries(602, 14, 12, 2, 0.3), tone: 'var(--success)' },
      { label: 'Suspended', value: counts.SUSPENDED, format: (v: number) => fmtNumber(Math.round(v)), spark: seededSeries(603, 14, 4, 1, 0.1), tone: 'var(--warning)' },
      { label: 'Terminated', value: counts.TERMINATED, format: (v: number) => fmtNumber(Math.round(v)), spark: seededSeries(604, 14, 2, 0.6, 0.1), tone: 'var(--danger)' },
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
            <h1 className="text-[24px] font-semibold leading-8 tracking-[-0.02em] text-ink-1">Contracts</h1>
            <span className="rounded-pill bg-brand-soft px-2 py-0.5 font-mono text-[11px] font-medium text-brand">
              {total.toLocaleString('en-US')} total
            </span>
          </div>
          <p className="mt-0.5 text-[13px] text-ink-2">Client contracts and their lifecycle.</p>
        </div>

        <div className="relative">
          <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-3" />
          <input
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setPage(1);
            }}
            placeholder="Search by client…"
            aria-label="Search contracts"
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
          New contract
        </motion.button>
      </motion.div>

      <FilterChips
        label="Contract status"
        options={STATUS_CHIPS.map((c) => ({ value: c.value, label: c.label, count: counts[c.value as keyof typeof counts] ?? 0 }))}
        active={status}
        onChange={(v) => {
          setStatus(v);
          setPage(1);
        }}
      />

      <SummaryStrip stats={summary} />

      <div className="relative">
        <DataTable<Contract>
          rows={contracts}
          columns={[
            {
              key: 'client',
              label: 'Client',
              sortable: true,
              sortValue: (c) => clientName(c.client),
              render: (c) => (
                <div className="flex items-center gap-3">
                  <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full text-[10px] font-bold text-white" style={{ background: `linear-gradient(135deg,#00A99D,#4CA86C)` }}>
                    {clientName(c.client).split(' ').map((p) => p[0]).slice(0, 2).join('').toUpperCase()}
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-[13px] font-medium text-ink-1">{clientName(c.client)}</p>
                    <p className="truncate font-mono text-[11px] text-ink-3">{c.client.email}</p>
                  </div>
                </div>
              ),
            },
            {
              key: 'status',
              label: 'Status',
              sortable: true,
              render: (c) => <Pill tone={STATUS_TONE[c.status]}>{c.status}</Pill>,
            },
            {
              key: 'type',
              label: 'Type',
              sortable: true,
              render: (c) => <Pill tone="orange">{c.type}</Pill>,
            },
            {
              key: 'startDate',
              label: 'Start date',
              sortable: true,
              render: (c) => <span className="font-mono text-[12.5px] text-ink-2">{fmtDate(c.startDate)}</span>,
            },
            {
              key: 'endDate',
              label: 'End date',
              sortable: true,
              render: (c) => <span className="font-mono text-[12.5px] text-ink-2">{fmtDate(c.endDate)}</span>,
            },
            {
              key: 'chevron',
              label: '',
              render: () => (
                <ChevronRight size={15} className="ml-auto text-ink-3 transition-transform duration-150 group-hover:translate-x-0.5 group-hover:text-ink-1" />
              ),
            },
          ]}
          countLabel="contracts"
          initialSortKey="startDate"
          initialSortDir={-1}
          emptyTitle="No contracts found"
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

      <ContractDrawer contract={selected} creating={false} onClose={() => setSelected(null)} />
      <ContractDrawer contract={null} creating={creating} onClose={() => setCreating(false)} />
    </div>
  );
}
