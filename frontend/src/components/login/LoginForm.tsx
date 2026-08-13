import { useState } from 'react';
import { motion } from 'framer-motion';
import type { Variants } from 'framer-motion';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router';
import { EXPO, inputCls } from '@/components/settings/bits';
import { login } from '@/services/auth.api';
import { cn } from '@/lib/utils';

const headlineWord: Variants = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: EXPO } },
};

const fieldItem: Variants = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: EXPO } },
};

/** Left column of /login — headline, form. Real backend auth. */
export default function LoginForm() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('admin@telecom.local');
  const [password, setPassword] = useState('Admin123!');
  const [showPw, setShowPw] = useState(false);
  const [signingIn, setSigningIn] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (signingIn) return;
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
        {/* Form */}
        <form onSubmit={submit} className="mt-7">
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

          {/* Primary CTA — morphs to a spinner */}
          <motion.div variants={fieldItem} className="mt-6 flex justify-center">
            <button
              type="submit"
              disabled={signingIn}
              className={cn(
                'v-brand-gradient flex h-11 items-center justify-center gap-2 text-[14px] font-semibold text-white transition-all duration-300 enabled:hover:-translate-y-0.5 enabled:hover:shadow-glow active:scale-[0.97] disabled:cursor-default',
                signingIn ? 'w-11 rounded-full' : 'w-full rounded-md',
              )}
            >
              {signingIn ? <Loader2 size={18} className="animate-spin" /> : 'Sign in'}
            </button>
          </motion.div>
        </form>
      </motion.div>
    </div>
  );
}
