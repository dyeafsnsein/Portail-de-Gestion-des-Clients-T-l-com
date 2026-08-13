import { AnimatePresence, motion } from 'framer-motion';
import {
  CardSim,
  ChevronsLeft,
  ChevronsRight,
  FileText,
  LayoutDashboard,
  LogOut,
  Radio,
  Settings,
  ShoppingCart,
  Smartphone,
  UserRound,
  Users,
  X,
} from 'lucide-react';
import { NavLink, useLocation, useNavigate } from 'react-router';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

/**
 * App shell sidebar. Fixed left rail: 264px expanded / 68px collapsed
 * (persisted by Layout). On <768px it becomes an overlay drawer controlled
 * by Layout. Links to every app route.
 */

export const SIDEBAR_WIDTH = 264;
export const SIDEBAR_RAIL = 68;

const NAV_ITEMS: ReadonlyArray<{ to: string; label: string; icon: typeof LayoutDashboard; end?: boolean }> = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/users', label: 'Users', icon: Users },
  { to: '/contracts', label: 'Contracts', icon: FileText },
  { to: '/resources', label: 'Resources', icon: CardSim },
  { to: '/services', label: 'Services', icon: Radio },
  { to: '/accessories', label: 'Accessories', icon: Smartphone },
  { to: '/orders', label: 'Orders', icon: ShoppingCart },
  { to: '/settings', label: 'Settings', icon: Settings },
];

export interface NavbarProps {
  collapsed: boolean;
  onToggleCollapse: () => void;
  mobileOpen: boolean;
  onMobileClose: () => void;
}

function SidebarBody({ collapsed, onToggleCollapse, onNavigate }: {
  collapsed: boolean;
  onToggleCollapse: () => void;
  onNavigate?: () => void;
}) {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <div className="flex h-full flex-col">
      {/* Logo */}
      <div className={cn('flex h-16 shrink-0 items-center gap-2.5 border-b border-line px-4', collapsed && 'justify-center px-0')}>
        <img src="/logo.svg" alt="MyTT" className="h-8 w-8 shrink-0" />
        {!collapsed && (
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex min-w-0 flex-col leading-none"
          >
            <span className="text-[15px] font-bold tracking-[-0.01em] text-ink-1">MyTT</span>
            <span className="mt-0.5 truncate text-[10px] font-medium tracking-[0.02em] text-ink-3">
              Portail Télécom
            </span>
          </motion.span>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-3 py-4">
        {!collapsed && (
          <div className="px-2 pb-2 text-[10px] font-semibold uppercase tracking-[0.08em] text-ink-3">
            Workspace
          </div>
        )}
        <ul className="flex flex-col gap-1">
          {NAV_ITEMS.map((item, i) => {
            const active = item.end ? location.pathname === '/' : location.pathname.startsWith(item.to);
            const Icon = item.icon;
            return (
              <motion.li
                key={item.to}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.03, duration: 0.25 }}
              >
                <NavLink
                  to={item.to}
                  end={item.end}
                  onClick={onNavigate}
                  title={collapsed ? item.label : undefined}
                  className={cn(
                    'group relative flex h-10 items-center gap-3 rounded-md px-3 text-[13.5px] font-medium transition-colors duration-150',
                    collapsed && 'justify-center px-0',
                    active ? 'text-brand' : 'text-ink-2 hover:bg-surface-2 hover:text-ink-1',
                  )}
                >
                  {active && (
                    <motion.span
                      layoutId="sidebar-active"
                      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                      className="absolute inset-0 rounded-md bg-brand-soft"
                    />
                  )}
                  {active && <span className="absolute left-0 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-r-full bg-brand" />}
                  <Icon size={18} className="relative z-10 shrink-0" />
                  {!collapsed && <span className="relative z-10 truncate">{item.label}</span>}
                </NavLink>
              </motion.li>
            );
          })}
        </ul>
      </nav>

      {/* Workspace + user */}
      <div className="shrink-0 border-t border-line p-3">
        {!collapsed && (
          <div className="mb-2 flex items-center justify-between rounded-md border border-line bg-surface-2 px-3 py-2">
            <div className="min-w-0">
              <div className="truncate text-[13px] font-medium text-ink-1">Admin Back-office</div>
              <div className="text-[11px] text-ink-3">Workspace</div>
            </div>
            <span className="rounded-sm bg-brand-soft px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-brand">
              PRO
            </span>
          </div>
        )}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className={cn(
                'flex w-full items-center gap-2.5 rounded-md px-2 py-2 text-left transition-colors duration-150 hover:bg-surface-2',
                collapsed && 'justify-center px-0',
              )}
            >
              <span className="v-brand-gradient grid h-8 w-8 shrink-0 place-items-center rounded-full text-[11px] font-semibold text-white ring-2 ring-brand-soft">
                AR
              </span>
              {!collapsed && (
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[13px] font-medium text-ink-1">Ava Reyes</span>
                  <span className="block text-[11px] text-ink-3">Admin</span>
                </span>
              )}
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent side="top" align="start" className="w-48">
            <DropdownMenuItem onSelect={() => navigate('/settings')}>
              <UserRound size={15} className="mr-2" /> Profile
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => navigate('/settings')}>
              <Settings size={15} className="mr-2" /> Settings
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onSelect={() => navigate('/login')}>
              <LogOut size={15} className="mr-2" /> Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Collapse chevron */}
        <button
          type="button"
          onClick={onToggleCollapse}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          className="mt-2 hidden w-full items-center justify-center gap-2 rounded-md py-1.5 text-ink-3 transition-colors duration-150 hover:bg-surface-2 hover:text-ink-1 md:flex"
        >
          {collapsed ? <ChevronsRight size={16} /> : <ChevronsLeft size={16} />}
          {!collapsed && <span className="text-[11px] font-medium">Collapse</span>}
        </button>
      </div>
    </div>
  );
}

export default function Navbar({ collapsed, onToggleCollapse, mobileOpen, onMobileClose }: NavbarProps) {
  return (
    <>
      {/* Desktop / tablet rail */}
      <aside
        className={cn(
          'themed fixed inset-y-0 left-0 z-40 hidden border-r border-line bg-surface transition-[width] duration-[250ms] ease-out md:block',
          collapsed ? 'w-[68px]' : 'w-[264px]',
        )}
      >
        <SidebarBody collapsed={collapsed} onToggleCollapse={onToggleCollapse} />
      </aside>

      {/* Mobile overlay drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-40 bg-black/40 md:hidden"
              onClick={onMobileClose}
            />
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="fixed inset-y-0 left-0 z-50 w-[264px] border-r border-line bg-surface md:hidden"
            >
              <button
                type="button"
                onClick={onMobileClose}
                aria-label="Close menu"
                className="absolute right-3 top-4 z-10 grid h-8 w-8 place-items-center rounded-md text-ink-3 hover:bg-surface-2 hover:text-ink-1"
              >
                <X size={16} />
              </button>
              <SidebarBody collapsed={false} onToggleCollapse={onMobileClose} onNavigate={onMobileClose} />
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
