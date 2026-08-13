import { cn } from '@/lib/utils';

export type PillTone = 'success' | 'warning' | 'danger' | 'info' | 'brand' | 'orange' | 'neutral';

const TONES: Record<PillTone, string> = {
  success: 'bg-[rgba(14,169,104,0.10)] text-success',
  warning: 'bg-[rgba(217,119,6,0.10)] text-warning',
  danger: 'bg-[rgba(225,29,72,0.10)] text-danger',
  info: 'bg-[rgba(2,132,199,0.10)] text-info',
  brand: 'bg-brand-soft text-brand',
  orange: 'bg-[rgba(247,148,30,0.12)] text-[#C05F00] dark:text-[#FFA93C]',
  neutral: 'bg-surface-2 text-ink-2',
};

/** Status/badge pill — same visual treatment as the old customer/plan badges. */
export default function Pill({ tone = 'neutral', children, className }: { tone?: PillTone; children: React.ReactNode; className?: string }) {
  return <span className={cn('rounded-pill px-2 py-0.5 text-[11px] font-medium', TONES[tone], className)}>{children}</span>;
}
