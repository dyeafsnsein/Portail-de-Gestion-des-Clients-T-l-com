/** Shared styling constants for settings + login surfaces. */

export const EXPO: [number, number, number, number] = [0.16, 1, 0.3, 1];

export const inputCls =
  'h-9 w-full rounded-md border border-line-strong bg-surface px-3 text-[13px] text-ink-1 outline-none transition-colors duration-150 placeholder:text-ink-3 focus:border-brand disabled:opacity-50';

export const btnPrimary =
  'inline-flex h-9 items-center justify-center gap-2 rounded-md bg-brand px-4 text-[13px] font-semibold text-white transition-all duration-150 hover:-translate-y-px hover:bg-brand-strong active:scale-[0.97] disabled:pointer-events-none disabled:opacity-50';

export const btnSecondary =
  'inline-flex h-9 items-center justify-center gap-2 rounded-md border border-line bg-surface px-4 text-[13px] font-medium text-ink-1 transition-colors duration-150 hover:bg-surface-2 active:scale-[0.97]';

export const btnGhost =
  'inline-flex h-9 items-center justify-center gap-2 rounded-md px-3 text-[13px] font-medium text-ink-2 transition-colors duration-150 hover:bg-surface-2 hover:text-ink-1 active:scale-[0.97]';

export const btnDestructive =
  'inline-flex h-9 items-center justify-center gap-2 rounded-md bg-danger px-4 text-[13px] font-semibold text-white transition-all duration-150 hover:brightness-110 active:scale-[0.97] disabled:pointer-events-none disabled:opacity-50';
