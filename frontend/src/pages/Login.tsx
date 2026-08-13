import { motion } from 'framer-motion';
import { Toaster } from 'sonner';
import ThemeToggle from '@/components/ThemeToggle';
import LoginForm from '@/components/login/LoginForm';
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
 * Auth gateway (login.md) — centered form on an aurora canvas.
 * Renders outside the app shell; real auth routes to `/`.
 */
export default function Login() {
  const { resolvedTheme } = useTheme();

  return (
    <div className="v-aurora relative flex min-h-[100dvh] flex-col bg-canvas">
      <DotGrid />

      {/* Top bar — brand + theme toggle */}
      <div className="relative flex items-center justify-between px-6 py-6 sm:px-10">
        <div className="flex items-center gap-2.5">
          <img src="/logo.svg" alt="MyTT" className="h-8 w-8" />
          <span className="flex flex-col leading-none">
            <span className="text-[15px] font-bold tracking-[-0.01em] text-ink-1">MyTT</span>
            <span className="mt-0.5 text-[10px] font-medium tracking-[0.02em] text-ink-3">Portail Télécom</span>
          </span>
        </div>
        <ThemeToggle />
      </div>

      {/* Form */}
      <section className="relative flex flex-1 items-center px-6 py-8 sm:px-10">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="mx-auto w-full max-w-[400px]"
        >
          <LoginForm />
        </motion.div>
      </section>

      <p className="relative pb-6 text-center font-mono text-[11px] text-ink-3">© 2026 MyTT</p>

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
