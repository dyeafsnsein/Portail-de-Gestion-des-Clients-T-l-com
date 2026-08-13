import { useEffect, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { ChevronRight, Search, UserPlus } from 'lucide-react';
import DataTable from '@/components/crud/DataTable';
import FilterChips from '@/components/crud/FilterChips';
import Pill from '@/components/crud/Pill';
import SummaryStrip from '@/components/crud/SummaryStrip';
import UserDrawer, { Avatar, CreateUserDrawer } from '@/components/users/UserDrawer';
import { seededSeries } from '@/lib/mock';
import { fmtDate, fmtNumber } from '@/lib/format';
import { listUsers } from '@/services/api/users.api';
import type { User, UserRole } from '@/services/types';

const ROLE_CHIPS = [
  { value: 'ALL', label: 'All' },
  { value: 'ADMIN', label: 'Admin' },
  { value: 'USER', label: 'User' },
] as const;

type RoleFilter = (typeof ROLE_CHIPS)[number]['value'];

export default function UsersPage() {
  const [query, setQuery] = useState('');
  const [debounced, setDebounced] = useState('');
  const [role, setRole] = useState<RoleFilter>('ALL');
  const [page, setPage] = useState(1);
  const [pageSize] = useState(12);
  const [selected, setSelected] = useState<User | null>(null);
  const [creating, setCreating] = useState(false);

  // 150ms search debounce
  useEffect(() => {
    const id = window.setTimeout(() => setDebounced(query.trim()), 150);
    return () => window.clearTimeout(id);
  }, [query]);

  const { data, isPending } = useQuery({
    queryKey: ['users', { page, pageSize, search: debounced, role: role === 'ALL' ? undefined : role }],
    queryFn: () =>
      listUsers({
        page,
        pageSize,
        search: debounced || undefined,
        role: role === 'ALL' ? undefined : (role as UserRole),
      }),
  });

  // all users (unpaginated) — for chip counts + summary strip
  const { data: allData } = useQuery({
    queryKey: ['users', 'all'],
    queryFn: () => listUsers({ page: 1, pageSize: 100 }),
  });
  const allUsers = allData?.items ?? [];

  // keep the open drawer in sync after edits
  useEffect(() => {
    if (selected && data?.items) {
      const fresh = data.items.find((u) => u.id === selected.id);
      if (fresh) setSelected(fresh);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data?.items]);

  const users = data?.items ?? [];
  const total = data?.meta.totalItems ?? 0;

  const roleCounts = useMemo(() => {
    const admins = allUsers.filter((u) => u.role === 'ADMIN').length;
    const regular = allUsers.filter((u) => u.role === 'USER').length;
    const now = Date.now();
    const monthMs = 30 * 86_400_000;
    const newMonth = allUsers.filter((u) => now - new Date(u.createdAt).getTime() <= monthMs).length;
    return { admins, regular, newMonth };
  }, [allUsers]);

  const resetFilters = () => {
    setQuery('');
    setRole('ALL');
    setPage(1);
  };

  const summary = useMemo(
    () => [
      { label: 'Total users', value: total, format: (v: number) => fmtNumber(Math.round(v)), spark: seededSeries(501, 14, 20, 3, 0.4), tone: 'var(--accent)' },
      { label: 'Admins', value: roleCounts.admins, format: (v: number) => fmtNumber(Math.round(v)), spark: seededSeries(502, 14, 6, 1, 0.1), tone: 'var(--info)' },
      { label: 'Regular users', value: roleCounts.regular, format: (v: number) => fmtNumber(Math.round(v)), spark: seededSeries(503, 14, 14, 2, 0.3), tone: 'var(--success)' },
      { label: 'New this month', value: roleCounts.newMonth, format: (v: number) => `+${Math.round(v)}`, spark: seededSeries(504, 14, 3, 1, 0.2), tone: 'var(--warning)' },
    ],
    [total, roleCounts],
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
            <h1 className="text-[24px] font-semibold leading-8 tracking-[-0.02em] text-ink-1">Users</h1>
            <span className="rounded-pill bg-brand-soft px-2 py-0.5 font-mono text-[11px] font-medium text-brand">
              {total.toLocaleString('en-US')} total
            </span>
          </div>
          <p className="mt-0.5 text-[13px] text-ink-2">Portal accounts and their roles.</p>
        </div>

        <div className="relative">
          <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-3" />
          <input
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setPage(1);
            }}
            placeholder="Search users…"
            aria-label="Search users"
            className="w-56 max-w-full rounded-md border border-line-strong bg-surface py-2 pl-9 pr-3 text-[13px] text-ink-1 outline-none transition-colors duration-150 placeholder:text-ink-3 focus:border-brand"
          />
        </div>

        <motion.button
          type="button"
          whileTap={{ scale: 0.97 }}
          onClick={() => setCreating(true)}
          className="inline-flex items-center gap-1.5 rounded-md bg-brand px-3.5 py-2 text-[13px] font-medium text-white shadow-card transition-colors duration-150 hover:bg-brand-strong"
        >
          <UserPlus size={15} />
          Add User
        </motion.button>
      </motion.div>

      {/* role chips */}
      <FilterChips
        label="User roles"
        options={[
          { value: 'ALL', label: 'All', count: total },
          { value: 'ADMIN', label: 'Admin', count: roleCounts.admins },
          { value: 'USER', label: 'User', count: roleCounts.regular },
        ]}
        active={role}
        onChange={(v) => {
          setRole(v as RoleFilter);
          setPage(1);
        }}
      />

      <SummaryStrip stats={summary} />

      <div className="relative">
        <DataTable<User>
          rows={users}
          columns={[
            {
              key: 'email',
              label: 'Email',
              sortable: true,
              render: (u) => (
                <div className="flex items-center gap-3">
                  <Avatar user={u} size="md" />
                  <span className="truncate font-mono text-[12.5px] text-ink-1">{u.email}</span>
                </div>
              ),
            },
            {
              key: 'role',
              label: 'Role',
              sortable: true,
              render: (u) => <Pill tone={u.role === 'ADMIN' ? 'brand' : 'neutral'}>{u.role}</Pill>,
            },
            {
              key: 'createdAt',
              label: 'Created',
              sortable: true,
              render: (u) => <span className="text-[12.5px] text-ink-2">{fmtDate(u.createdAt)}</span>,
            },
            {
              key: 'chevron',
              label: '',
              render: () => (
                <ChevronRight size={15} className="ml-auto text-ink-3 transition-transform duration-150 group-hover:translate-x-0.5 group-hover:text-ink-1" />
              ),
            },
          ]}
          countLabel="users"
          initialSortKey="createdAt"
          initialSortDir={-1}
          emptyTitle="No users found"
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

      <UserDrawer user={selected} onClose={() => setSelected(null)} />
      <CreateUserDrawer open={creating} onClose={() => setCreating(false)} />
    </div>
  );
}
