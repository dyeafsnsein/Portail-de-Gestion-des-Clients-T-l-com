import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useLocation, useNavigate } from 'react-router';
import { Bell, ChevronRight, LogOut, Menu, Search, UserRound, Settings as SettingsIcon } from 'lucide-react';
import ThemeToggle from '@/components/ThemeToggle';
import { clearAuth, useAuth } from '@/lib/auth';
import { avatarGradient, initials } from '@/lib/mock';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { fmtClock } from '@/lib/format';

/** Sticky app topbar. In normal flow: sticky top-0. */

const CRUMBS: Record<string, string> = {
  '/': 'Dashboard',
  '/users': 'Users',
  '/contracts': 'Contracts',
  '/resources': 'Resources',
  '/services': 'Services',
  '/accessories': 'Accessories',
  '/orders': 'Orders',
  '/settings': 'Settings',
};

const NOTIFICATIONS = [
  { id: 1, title: 'New user registered', body: 'sara.benali@mytt.tn just joined the portal.', time: '4m ago', tone: 'var(--accent)' },
  { id: 2, title: 'Contract created', body: 'Contract #C-1043 was created for Lumen Field.', time: '22m ago', tone: 'var(--success)' },
  { id: 3, title: 'Low stock alert', body: 'Charger Ultra-Fast is down to 7 units.', time: '1h ago', tone: 'var(--warning)' },
  { id: 4, title: 'Contract suspended', body: 'Contract #C-0981 was suspended for non-payment.', time: '3h ago', tone: 'var(--danger)' },
];

function LiveClock() {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(id);
  }, []);
  return <span className="tnum hidden font-mono text-[12px] text-ink-2 sm:inline">{fmtClock(now)}</span>;
}

export default function Topbar({ onMenu, onOpenCommand }: { onMenu: () => void; onOpenCommand: () => void }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [notifOpen, setNotifOpen] = useState(false);
  const [unread, setUnread] = useState(true);
  const crumb = CRUMBS[location.pathname] ?? 'Overview';

  const displayName = user?.firstName && user.lastName
    ? `${user.firstName} ${user.lastName}`
    : user?.email ?? 'Admin';
  const displaySub = user?.email ?? '';

  return (
    <header className="themed sticky top-0 z-30 flex h-16 items-center gap-2 border-b border-line bg-canvas/80 px-3 backdrop-blur-[12px] sm:gap-3 sm:px-4 lg:px-6">
      <button
        type="button"
        onClick={onMenu}
        aria-label="Open menu"
        className="grid h-9 w-9 place-items-center rounded-md border border-line bg-surface text-ink-2 hover:bg-surface-2 md:hidden"
      >
        <Menu size={16} />
      </button>

      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-[13px] text-ink-2" aria-label="Breadcrumb">
        <span className="hidden sm:inline">Admin Back-office</span>
        <ChevronRight size={13} className="hidden text-ink-3 sm:inline" />
        <span className="font-medium text-ink-1">{crumb}</span>
      </nav>

      {/* Command search (full bar from sm up, icon button on mobile) */}
      <div className="mx-auto hidden w-full max-w-sm flex-1 px-2 sm:block">
        <button
          type="button"
          onClick={onOpenCommand}
          className="flex h-9 w-full items-center gap-2 rounded-pill border border-line bg-surface px-3.5 text-[13px] text-ink-3 transition-colors duration-150 hover:border-line-strong hover:text-ink-2"
        >
          <Search size={14} />
          <span className="flex-1 text-left">Search or jump to…</span>
          <kbd className="rounded-sm border border-line bg-surface-2 px-1.5 py-0.5 font-mono text-[10px] text-ink-2">⌘K</kbd>
        </button>
      </div>
      <div className="flex-1 sm:hidden" />

      <div className="flex items-center gap-1.5 sm:gap-2">
        <button
          type="button"
          onClick={onOpenCommand}
          aria-label="Search"
          className="grid h-9 w-9 place-items-center rounded-md border border-line bg-surface text-ink-2 transition-colors duration-150 hover:bg-surface-2 hover:text-ink-1 sm:hidden"
        >
          <Search size={16} />
        </button>
        <LiveClock />

        {/* Notifications */}
        <DropdownMenu open={notifOpen} onOpenChange={(v) => { setNotifOpen(v); if (v) setUnread(false); }}>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              aria-label="Notifications"
              className="relative grid h-9 w-9 place-items-center rounded-md border border-line bg-surface text-ink-2 transition-colors duration-150 hover:bg-surface-2 hover:text-ink-1"
            >
              <Bell size={16} />
              {unread && <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-danger ring-2 ring-surface" />}
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80 p-0">
            <div className="flex items-center justify-between border-b border-line px-4 py-2.5">
              <span className="text-[13px] font-semibold text-ink-1">Notifications</span>
              <span className="rounded-pill bg-brand-soft px-2 py-0.5 text-[10px] font-semibold text-brand">4 new</span>
            </div>
            <AnimatePresence>
              {notifOpen &&
                NOTIFICATIONS.map((n, i) => (
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
                      <div className="mt-1 font-mono text-[10px] text-ink-3">{n.time}</div>
                    </div>
                  </motion.div>
                ))}
            </AnimatePresence>
          </DropdownMenuContent>
        </DropdownMenu>

        <ThemeToggle />

        {/* Avatar */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button type="button" aria-label="Account" className="rounded-full">
              {user?.avatarUrl ? (
                <img
                  src={user.avatarUrl}
                  alt=""
                  className="h-9 w-9 rounded-full object-cover ring-2 ring-brand-soft"
                />
              ) : (
                <span
                  className="v-brand-gradient grid h-9 w-9 place-items-center rounded-full text-[11px] font-semibold text-white ring-2 ring-brand-soft"
                  style={user ? { background: avatarGradient(user.email) } : undefined}
                >
                  {user ? initials(user.email) : 'AR'}
                </span>
              )}
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <div className="px-2 py-1.5">
              <div className="text-[13px] font-medium text-ink-1">{displayName}</div>
              <div className="text-[11px] text-ink-3">{displaySub}</div>
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem onSelect={() => navigate('/settings')}><UserRound size={15} className="mr-2" /> Profile</DropdownMenuItem>
            <DropdownMenuItem onSelect={() => navigate('/settings')}><SettingsIcon size={15} className="mr-2" /> Settings</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onSelect={() => { clearAuth(); navigate('/login'); }}><LogOut size={15} className="mr-2" /> Log out</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
