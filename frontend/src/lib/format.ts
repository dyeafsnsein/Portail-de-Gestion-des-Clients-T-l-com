/* ------------------------------ formatting ------------------------------ */

export function fmtCompact(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return `${Math.round(n)}`;
}

export function fmtCurrency(n: number, decimals = 0): string {
  return n.toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

export function fmtNumber(n: number, decimals = 0): string {
  return n.toLocaleString('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
}

export function fmtClock(d: Date): string {
  return d.toLocaleTimeString('en-GB', { hour12: false });
}

export function fmtDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

/** Display name for a backend client (nested `client` object) — falls back to email. */
export function clientName(c: { email: string; firstName?: string | null; lastName?: string | null }): string {
  const full = [c.firstName, c.lastName].filter(Boolean).join(' ').trim();
  return full || c.email;
}
