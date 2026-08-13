import { useCallback, useEffect, useState } from 'react';
import { Outlet, useLocation } from 'react-router';
import { motion } from 'framer-motion';
import { Toaster } from 'sonner';
import Navbar from '@/components/Navbar';
import Topbar from '@/components/Topbar';
import Footer from '@/components/Footer';
import CommandPalette from '@/components/CommandPalette';
import { useTheme } from '@/hooks/useTheme';
import { cn } from '@/lib/utils';

/**
 * App shell: fixed left sidebar (264px / 68px rail, overlay drawer <768px)
 * + sticky topbar + content slot. Nested-route pattern — renders <Outlet/>,
 * App.tsx must nest routes under <Route element={<Layout/>}>.
 */

const COLLAPSE_KEY = 'vantage-sidebar-collapsed';

export default function Layout() {
  const location = useLocation();
  const { resolvedTheme } = useTheme();
  const [collapsed, setCollapsed] = useState(() => {
    try {
      const stored = localStorage.getItem(COLLAPSE_KEY);
      if (stored !== null) return stored === '1';
    } catch { /* ignore */ }
    return false;
  });
  const [mobileOpen, setMobileOpen] = useState(false);
  const [commandOpen, setCommandOpen] = useState(false);

  const persistCollapse = useCallback((v: boolean) => {
    setCollapsed(v);
    try { localStorage.setItem(COLLAPSE_KEY, v ? '1' : '0'); } catch { /* ignore */ }
  }, []);

  // Auto-collapse to icon rail on 768–1279px; restore preference above 1280px
  useEffect(() => {
    const mq = window.matchMedia('(min-width: 768px) and (max-width: 1279px)');
    const apply = () => {
      if (mq.matches) setCollapsed(true);
      else {
        try {
          const stored = localStorage.getItem(COLLAPSE_KEY);
          setCollapsed(stored === '1');
        } catch { /* ignore */ }
      }
    };
    apply();
    mq.addEventListener('change', apply);
    return () => mq.removeEventListener('change', apply);
  }, []);

  // Close drawer on route change
  useEffect(() => setMobileOpen(false), [location.pathname]);

  return (
    <div className="min-h-[100dvh] bg-canvas">
        <Navbar
          collapsed={collapsed}
          onToggleCollapse={() => persistCollapse(!collapsed)}
          mobileOpen={mobileOpen}
          onMobileClose={() => setMobileOpen(false)}
        />

        <div
          className={cn(
            'flex min-h-[100dvh] flex-col transition-[padding] duration-[250ms] ease-out',
            collapsed ? 'md:pl-[68px]' : 'md:pl-[264px]',
          )}
        >
          <Topbar onMenu={() => setMobileOpen(true)} onOpenCommand={() => setCommandOpen(true)} />

          <motion.main
            key={location.pathname}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="mx-auto w-full max-w-[1440px] flex-1 px-4 py-6 lg:px-6"
          >
            <Outlet />
          </motion.main>

          <Footer />
        </div>

        <CommandPalette open={commandOpen} onOpenChange={setCommandOpen} />
        <Toaster
          theme={resolvedTheme}
          position="bottom-right"
          toastOptions={{
            style: {
              background: 'var(--surface)',
              color: 'var(--text-1)',
              border: '1px solid var(--border)',
              borderLeft: '3px solid var(--accent)',
              boxShadow: 'var(--shadow-pop)',
            },
          }}
        />
      </div>
  );
}
