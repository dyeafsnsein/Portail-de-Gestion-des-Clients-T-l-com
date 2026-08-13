import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router';
import KpiTile from '@/components/KpiTile';
import ActivityFeed from '@/components/dashboard/ActivityFeed';
import ContractsChart from '@/components/dashboard/ContractsChart';
import RecentOrders from '@/components/dashboard/RecentOrders';
import { buildActivityFeed, monthDelta, weeklySeries } from '@/components/dashboard/data';
import { fmtNumber } from '@/lib/format';
import { listAllContracts } from '@/services/api/contracts.api';
import { listResources } from '@/services/api/resources.api';
import { listServices } from '@/services/api/services.api';
import { listUsers } from '@/services/api/users.api';

function DashboardSkeleton() {
  return (
    <div className="grid grid-cols-12 gap-4" aria-label="Loading dashboard">
      <div className="col-span-12 space-y-2">
        <div className="v-skeleton h-7 w-40" />
        <div className="v-skeleton h-4 w-72" />
      </div>
      {[0, 1, 2, 3].map((i) => (
        <div key={i} className="col-span-12 sm:col-span-6 xl:col-span-3">
          <div className="v-skeleton h-[118px] w-full rounded-lg" />
        </div>
      ))}
      <div className="col-span-12 xl:col-span-8"><div className="v-skeleton h-[420px] w-full rounded-lg" /></div>
      <div className="col-span-12 xl:col-span-4"><div className="v-skeleton h-[420px] w-full rounded-lg" /></div>
    </div>
  );
}

export default function Dashboard() {
  const navigate = useNavigate();

  const contractsQ = useQuery({ queryKey: ['contracts', 'all'], queryFn: listAllContracts });
  const usersQ = useQuery({
    queryKey: ['users', { page: 1, pageSize: 100 }],
    queryFn: () => listUsers({ page: 1, pageSize: 100 }),
  });
  const resourcesQ = useQuery({
    queryKey: ['resources', { page: 1, pageSize: 100 }],
    queryFn: () => listResources({ page: 1, pageSize: 100 }),
  });
  const servicesQ = useQuery({
    queryKey: ['services', { page: 1, pageSize: 100 }],
    queryFn: () => listServices({ page: 1, pageSize: 100 }),
  });

  const loading = [contractsQ, usersQ, resourcesQ, servicesQ].some((q) => q.isPending);

  const users = useMemo(() => usersQ.data?.items ?? [], [usersQ.data]);
  const contracts = useMemo(() => contractsQ.data ?? [], [contractsQ.data]);
  const resources = useMemo(() => resourcesQ.data?.items ?? [], [resourcesQ.data]);
  const services = useMemo(() => servicesQ.data?.items ?? [], [servicesQ.data]);

  const kpis = useMemo(() => {
    const activeContracts = contracts.filter((c) => c.status === 'ACTIVE');
    const activeServices = services.filter((s) => s.isActive);
    const userDelta = monthDelta(users.map((u) => ({ date: u.createdAt })));
    const contractDelta = monthDelta(contracts.map((c) => ({ date: c.startDate })));
    const resourceDelta = monthDelta(resources.map((r) => ({ date: r.createdAt })));
    const serviceDelta = monthDelta(services.map((s) => ({ date: s.createdAt })));
    return {
      totalUsers: usersQ.data?.meta.totalItems ?? users.length,
      activeContracts: activeContracts.length,
      totalResources: resourcesQ.data?.meta.totalItems ?? resources.length,
      activeServices: activeServices.length,
      usersDelta: userDelta,
      contractsDelta: contractDelta,
      resourcesDelta: resourceDelta,
      servicesDelta: serviceDelta,
      sparkUsers: weeklySeries(users.map((u) => ({ date: u.createdAt }))),
      sparkContracts: weeklySeries(contracts.map((c) => ({ date: c.startDate }))),
      sparkResources: weeklySeries(resources.map((r) => ({ date: r.createdAt }))),
      sparkServices: weeklySeries(services.map((s) => ({ date: s.createdAt }))),
    };
  }, [users, contracts, resources, services, usersQ.data?.meta.totalItems, resourcesQ.data?.meta.totalItems]);

  const feed = useMemo(() => buildActivityFeed(contracts, resources, services, users), [contracts, resources, services, users]);

  if (loading) return <DashboardSkeleton />;

  return (
    <div className="grid grid-cols-12 gap-4">
      {/* ——— Page header ——— */}
      <div className="col-span-12 flex flex-wrap items-end justify-between gap-4">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        >
          <h1 className="text-[24px] font-semibold leading-8 tracking-[-0.02em] text-ink-1">Dashboard</h1>
          <p className="mt-0.5 text-[13px] text-ink-2">
            Welcome back, Ava — here's what's happening in the Admin Back-office.
          </p>
        </motion.div>
      </div>

      {/* ——— KPI tiles ——— */}
      <div className="col-span-12 sm:col-span-6 xl:col-span-3">
        <KpiTile
          index={0}
          label="Total users"
          value={kpis.totalUsers}
          format={(v) => fmtNumber(Math.round(v))}
          delta={`${kpis.usersDelta.direction === 'up' ? '+' : ''}${kpis.usersDelta.pct}% vs last month`}
          deltaDirection={kpis.usersDelta.direction}
          sparkData={kpis.sparkUsers}
          sparkTone="accent"
        />
      </div>
      <div className="col-span-12 sm:col-span-6 xl:col-span-3">
        <KpiTile
          index={1}
          label="Active contracts"
          value={kpis.activeContracts}
          format={(v) => fmtNumber(Math.round(v))}
          delta={`${kpis.contractsDelta.direction === 'up' ? '+' : ''}${kpis.contractsDelta.pct}% vs last month`}
          deltaDirection={kpis.contractsDelta.direction}
          sparkData={kpis.sparkContracts}
          sparkTone="success"
        />
      </div>
      <div className="col-span-12 sm:col-span-6 xl:col-span-3">
        <KpiTile
          index={2}
          label="Total resources"
          value={kpis.totalResources}
          format={(v) => fmtNumber(Math.round(v))}
          delta={`${kpis.resourcesDelta.direction === 'up' ? '+' : ''}${kpis.resourcesDelta.pct}% vs last month`}
          deltaDirection={kpis.resourcesDelta.direction}
          sparkData={kpis.sparkResources}
          sparkTone="accent"
        />
      </div>
      <div className="col-span-12 sm:col-span-6 xl:col-span-3">
        <KpiTile
          index={3}
          label="Active services"
          value={kpis.activeServices}
          format={(v) => fmtNumber(Math.round(v))}
          delta={`${kpis.servicesDelta.direction === 'up' ? '+' : ''}${kpis.servicesDelta.pct}% vs last month`}
          deltaDirection={kpis.servicesDelta.direction}
          sparkData={kpis.sparkServices}
          sparkTone="success"
        />
      </div>

      {/* ——— Chart + activity ——— */}
      <ContractsChart contracts={contracts} />
      <ActivityFeed entries={feed} />

      {/* ——— Recent orders ——— */}
      <RecentOrders />

      {/* quick nav */}
      <motion.section
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="v-card col-span-12"
      >
        <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-4">
          <div>
            <h2 className="text-[16px] font-semibold tracking-[-0.01em] text-ink-1">Manage your portal</h2>
            <p className="text-[12px] text-ink-3">Jump into a module to view or edit records.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {[
              { label: `Users · ${kpis.totalUsers}`, to: '/users' },
              { label: `Contracts · ${contracts.length}`, to: '/contracts' },
              { label: `Resources · ${kpis.totalResources}`, to: '/resources' },
              { label: `Services · ${services.length}`, to: '/services' },
              { label: `Accessories`, to: '/accessories' },
            ].map((b) => (
              <button
                key={b.to}
                type="button"
                onClick={() => navigate(b.to)}
                className="rounded-pill border border-line bg-surface px-3 py-1.5 text-[12.5px] font-medium text-ink-2 transition-colors duration-150 hover:border-line-strong hover:bg-surface-2 hover:text-ink-1"
              >
                {b.label}
              </button>
            ))}
          </div>
        </div>
      </motion.section>
    </div>
  );
}
