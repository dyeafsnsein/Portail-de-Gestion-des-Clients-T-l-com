import { useState } from 'react';
import { motion } from 'framer-motion';
import type { Variants } from 'framer-motion';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { Link, useNavigate } from 'react-router';
import { toast } from 'sonner';
import { Checkbox } from '@/components/ui/checkbox';
import { EXPO, inputCls } from '@/components/settings/bits';
import { login } from '@/services/auth.api';
import { cn } from '@/lib/utils';

/* Brand glyphs (inline SVG, no assets) */
function GoogleGlyph() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true">
      <path fill="#4285F4" d="M23.5 12.3c0-.9-.1-1.5-.3-2.2H12v4.1h6.5c-.1 1.1-.8 2.7-2.4 3.8l3.7 2.9c2.3-2.1 3.7-5.2 3.7-8.6z" />
      <path fill="#34A853" d="M12 24c3.2 0 6-1.1 7.9-2.9l-3.7-2.9c-1 .7-2.4 1.2-4.2 1.2-3.2 0-6-2.2-7-5.1l-3.9 3C3.2 21.3 7.3 24 12 24z" />
      <path fill="#FBBC05" d="M5 14.3c-.2-.7-.4-1.5-.4-2.3s.1-1.6.4-2.3l-3.9-3C.4 8.2 0 10 0 12s.4 3.8 1.1 5.3l3.9-3z" />
      <path fill="#EA4335" d="M12 4.7c1.8 0 3 .8 3.7 1.4l3.3-3.2C17.9 1.1 15.2 0 12 0 7.3 0 3.2 2.7 1.1 6.7l3.9 3c1-2.9 3.8-5 7-5z" />
    </svg>
  );
}

function GitHubGlyph() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current" aria-hidden="true">
      <path d="M12 .3a12 12 0 0 0-3.8 23.4c.6.1.8-.3.8-.6v-2c-3.3.7-4-1.6-4-1.6-.6-1.4-1.4-1.8-1.4-1.8-1-.7.1-.7.1-.7 1.2.1 1.8 1.2 1.8 1.2 1 1.8 2.8 1.3 3.5 1 .1-.8.4-1.3.7-1.6-2.7-.3-5.5-1.3-5.5-6 0-1.2.5-2.3 1.2-3.1-.1-.3-.5-1.5.1-3.2 0 0 1-.3 3.4 1.2a11.5 11.5 0 0 1 6 0C17.3 4.7 18.3 5 18.3 5c.6 1.7.2 2.9.1 3.2.8.8 1.2 1.9 1.2 3.1 0 4.7-2.8 5.7-5.5 6 .4.4.8 1.1.8 2.2v3.3c0 .3.2.7.8.6A12 12 0 0 0 12 .3z" />
    </svg>
  );
}

const ssoBtn =
  'flex h-10 items-center justify-center gap-2.5 rounded-md border border-line bg-surface text-[13px] font-medium text-ink-1 transition-all duration-150 hover:bg-surface-2 hover:border-line-strong active:scale-[0.97] disabled:pointer-events-none disabled:opacity-60';

const headlineWord: Variants = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: EXPO } },
};

const fieldItem: Variants = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: EXPO } },
};

/** Left column of /login — headline, SSO, form, footer. Real backend auth. */
export default function LoginForm() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('admin@telecom.local');
  const [password, setPassword] = useState('Admin123!');
  const [showPw, setShowPw] = useState(false);
  const [remember, setRemember] = useState(true);
  const [ssoLoading, setSsoLoading] = useState<'google' | 'github' | null>(null);
  const [signingIn, setSigningIn] = useState(false);

  const busy = ssoLoading !== null || signingIn;

  const goSso = (provider: 'google' | 'github') => {
    if (busy) return;
    setSsoLoading(provider);
    window.setTimeout(() => {
      setSsoLoading(null);
      toast('SSO is not configured — use email and password to sign in');
    }, 500);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (busy) return;
    setSigningIn(true);
    try {
      await login(email, password);
      navigate('/');
    } catch {
      /* error toast already emitted by the api interceptor */
    } finally {
      setSigningIn(false);
    }
  };

  return (
    <div>
      {/* Headline — word-level stagger */}
      <motion.h1
        initial="hidden"
        animate="show"
        variants={{ show: { transition: { staggerChildren: 0.06, delayChildren: 0.1 } } }}
        className="text-[32px] font-bold leading-[38px] tracking-[-0.03em] text-ink-1"
      >
        {['Your', 'network,', 'in', 'motion.'].map((w) => (
          <motion.span key={w} variants={headlineWord} className="inline-block">
            {w}
            {'\u00A0'}
          </motion.span>
        ))}
      </motion.h1>
      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.45, ease: EXPO }}
        className="mt-2 text-[14px] text-ink-2"
      >
        Sign in to the MyTT Admin Back-office.
      </motion.p>

      <motion.div
        initial="hidden"
        animate="show"
        variants={{ show: { transition: { staggerChildren: 0.07, delayChildren: 0.5 } } }}
      >
        {/* SSO */}
        <motion.div variants={fieldItem} className="mt-7 grid grid-cols-2 gap-3">
          <button type="button" onClick={() => goSso('google')} disabled={busy} className={ssoBtn}>
            {ssoLoading === 'google' ? <Loader2 size={16} className="animate-spin" /> : <GoogleGlyph />}
            Google
          </button>
          <button type="button" onClick={() => goSso('github')} disabled={busy} className={ssoBtn}>
            {ssoLoading === 'github' ? <Loader2 size={16} className="animate-spin" /> : <GitHubGlyph />}
            GitHub
          </button>
        </motion.div>

        {/* Divider */}
        <motion.div variants={fieldItem} className="mt-5 flex items-center gap-3">
          <span className="h-px flex-1 bg-line" />
          <span className="text-[11px] text-ink-3">or</span>
          <span className="h-px flex-1 bg-line" />
        </motion.div>

        {/* Form */}
        <form onSubmit={submit} className="mt-5">
          <motion.div variants={fieldItem}>
            <label className="block">
              <span className="v-label mb-1.5 block">Email</span>
              <input
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@myttelecom.tn"
                className={cn(inputCls, 'h-10')}
              />
            </label>
          </motion.div>
          <motion.div variants={fieldItem} className="mt-4">
            <label className="block">
              <span className="v-label mb-1.5 block">Password</span>
              <span className="relative block">
                <input
                  type={showPw ? 'text' : 'password'}
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className={cn(inputCls, 'h-10 pr-10')}
                />
                <button
                  type="button"
                  onClick={() => setShowPw((v) => !v)}
                  aria-label={showPw ? 'Hide password' : 'Show password'}
                  className="absolute right-2 top-1/2 grid h-7 w-7 -translate-y-1/2 place-items-center rounded-sm text-ink-3 transition-colors duration-150 hover:bg-surface-2 hover:text-ink-1"
                >
                  {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </span>
            </label>
          </motion.div>
          <motion.div variants={fieldItem} className="mt-4 flex items-center justify-between">
            <label className="flex cursor-pointer items-center gap-2 text-[13px] text-ink-2">
              <Checkbox checked={remember} onCheckedChange={(v) => setRemember(v === true)} />
              Remember me
            </label>
            <button
              type="button"
              onClick={() => toast('Reset link sent — demo inbox, of course')}
              className="text-[13px] font-medium text-brand transition-colors duration-150 hover:text-brand-strong"
            >
              Forgot password?
            </button>
          </motion.div>

          {/* Primary CTA — morphs to a spinner */}
          <motion.div variants={fieldItem} className="mt-6 flex justify-center">
            <button
              type="submit"
              disabled={busy}
              className={cn(
                'v-brand-gradient flex h-11 items-center justify-center gap-2 text-[14px] font-semibold text-white transition-all duration-300 enabled:hover:-translate-y-0.5 enabled:hover:shadow-glow active:scale-[0.97] disabled:cursor-default',
                signingIn ? 'w-11 rounded-full' : 'w-full rounded-md',
              )}
            >
              {signingIn ? <Loader2 size={18} className="animate-spin" /> : 'Sign in'}
            </button>
          </motion.div>
        </form>

        {/* Footer */}
        <motion.div variants={fieldItem} className="mt-6 text-center">
          <p className="text-[13px] text-ink-2">
            New to MyTT?{' '}
            <Link to="/" className="font-semibold text-brand transition-colors duration-150 hover:text-brand-strong">
              Request access
            </Link>
          </p>
          <p className="mt-3 text-[11px] text-ink-3">
            <button type="button" onClick={() => toast('Demo link — nothing here yet')} className="hover:text-ink-2">
              Privacy
            </button>
            <span className="mx-2">·</span>
            <button type="button" onClick={() => toast('Demo link — nothing here yet')} className="hover:text-ink-2">
              Terms
            </button>
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
}
