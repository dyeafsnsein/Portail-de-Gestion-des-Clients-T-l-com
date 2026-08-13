/**
 * Brand constants — Tunisie Telecom-inspired identity.
 * The full spectrum (BRAND_GRADIENT) is reserved for the logo mark and
 * login hero only; UI accents use the teal/orange tokens in index.css.
 */

/** Full brand spectrum (TT teardrop) — logo mark / login hero. */
export const BRAND_GRADIENT = [
  '#00A99D', // teal
  '#7AC143', // green
  '#F5C400', // yellow
  '#F7941E', // orange
  '#E4007E', // pink
  '#8E3BB3', // purple
  '#2F6FE0', // blue
] as const;

/** Chart series palette — sampled from the brand gradient. */
export const CHART_PALETTE = {
  teal: '#00A99D',
  green: '#7AC143',
  yellow: '#F5C400',
  orange: '#F7941E',
  pink: '#E85D75',
} as const;
