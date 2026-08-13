import { motion } from 'framer-motion';
import { Toaster } from 'sonner';
import ThemeToggle from '@/components/ThemeToggle';
import DashboardMock from '@/components/login/DashboardMock';
import LoginForm from '@/components/login/LoginForm';
import StatTicker from '@/components/login/StatTicker';
import TestimonialCard from '@/components/login/TestimonialCard';
import { EXPO } from '@/components/settings/bits';
import { useTheme } from '@/hooks/useTheme';

/** Faint 1px dot grid, 24px pitch (login.md §2). */
function DotGrid() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0"
      style={{
        backgroundImage: 'radial-gradient(circle, var(--text-1) 1px, transparent 1px)',
        backgroundSize: '24px 24px',
        opacity: 0.05,
      }}
    />
  );
}

/**
 * Split-screen auth gateway (login.md) — form left (44%), live product
 * diorama right (56%). Renders outside the app shell; fake auth routes to `/`.
 * Mobile (<1024px): right panel collapses to a 220px aurora banner on top.
 */
export default function Login() {
  const { resolvedTheme } = useTheme();

  return (
    <div className="flex min-h-[100dvh] flex-col bg-canvas lg:flex-row">
      {/* Mobile banner — aurora + logo + ticker */}
      <div className="v-aurora relative h-[220px] shrink-0 overflow-hidden lg:hidden">
        <DotGrid />
        <div className="relative flex h-full flex-col items-center justify-center gap-2">
          <img src="/logo.svg" alt="MyTT" className="h-10 w-10" />
          <div className="flex flex-col items-center leading-none">
            <span className="text-[16px] font-bold tracking-[-0.01em] text-ink-1">MyTT</span>
            <span className="mt-1 text-[10px] font-medium tracking-[0.02em] text-ink-3">Portail Télécom</span>
          </div>
        </div>
        <StatTicker className="absolute inset-x-4 bottom-4" />
      </div>

      {/* Left — form (44%) */}
      <section className="relative flex w-full flex-1 flex-col px-6 py-6 sm:px-10 lg:w-[44%] lg:flex-none lg:py-8">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="flex items-center justify-between"
        >
          <div className="flex items-center gap-2.5">
            <img src="/logo.svg" alt="MyTT" className="h-8 w-8" />
            <span className="flex flex-col leading-none">
              <span className="text-[15px] font-bold tracking-[-0.01em] text-ink-1">MyTT</span>
              <span className="mt-0.5 text-[10px] font-medium tracking-[0.02em] text-ink-3">Portail Télécom</span>
            </span>
          </div>
          <ThemeToggle />
        </motion.div>

        <div className="flex flex-1 items-center py-8 lg:py-4">
          <div className="mx-auto w-full max-w-[400px]">
            <LoginForm />
          </div>
        </div>

        <p className="text-center font-mono text-[11px] text-ink-3 lg:text-left">
          © 2026 MyTT · fictional demo
        </p>
      </section>

      {/* Right — live diorama (56%) */}
      <aside className="v-aurora relative hidden w-[56%] overflow-hidden border-l border-line lg:flex lg:flex-col lg:items-center lg:justify-center">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
          className="absolute inset-0"
        >
          <DotGrid />
        </motion.div>

        <div className="relative flex w-full flex-1 flex-col items-center justify-center gap-6">
          <DashboardMock />
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.5, ease: EXPO }}
            className="w-[640px] max-w-[85%]"
          >
            <StatTicker />
          </motion.div>
        </div>

        <div className="absolute bottom-8 right-8">
          <TestimonialCard />
        </div>
      </aside>

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
