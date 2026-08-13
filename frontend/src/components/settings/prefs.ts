import { useSyncExternalStore } from 'react';

/**
 * Appearance preference engine — owned by the Settings "theme studio" but
 * applied app-wide at the document root so accent / density / motion choices
 * re-skin every page. Persisted to localStorage; re-applied on boot (this
 * module is imported eagerly via src/pages/Settings.tsx) and whenever the
 * `<html>` theme class flips (MutationObserver), because light & dark modes
 * use different accent values.
 */

export interface AccentTokens {
  accent: string;
  strong: string;
  soft: string;
}

export interface AccentPreset {
  id: string;
  name: string;
  /** picker swatch colour */
  swatch: string;
  light: AccentTokens;
  dark: AccentTokens;
}

export const ACCENTS: readonly AccentPreset[] = [
  {
    id: 'teal',
    name: 'Teal',
    swatch: '#00A99D',
    light: { accent: '#00A99D', strong: '#008F85', soft: 'rgba(0, 169, 157, 0.10)' },
    dark: { accent: '#1FC2B5', strong: '#00A99D', soft: 'rgba(31, 194, 181, 0.14)' },
  },
  {
    id: 'orange',
    name: 'Orange',
    swatch: '#F7941E',
    light: { accent: '#F7941E', strong: '#E07E00', soft: 'rgba(247, 148, 30, 0.12)' },
    dark: { accent: '#FFA93C', strong: '#F7941E', soft: 'rgba(255, 169, 60, 0.14)' },
  },
  {
    id: 'cyan',
    name: 'Cyan',
    swatch: '#0EA5E9',
    light: { accent: '#0EA5E9', strong: '#0284C7', soft: 'rgba(14, 165, 233, 0.10)' },
    dark: { accent: '#38BDF8', strong: '#0EA5E9', soft: 'rgba(56, 189, 248, 0.12)' },
  },
  {
    id: 'emerald',
    name: 'Emerald',
    swatch: '#10B981',
    light: { accent: '#10B981', strong: '#059669', soft: 'rgba(16, 185, 129, 0.10)' },
    dark: { accent: '#34D399', strong: '#10B981', soft: 'rgba(52, 211, 153, 0.12)' },
  },
  {
    id: 'rose',
    name: 'Rose',
    swatch: '#F43F5E',
    light: { accent: '#F43F5E', strong: '#E11D48', soft: 'rgba(244, 63, 94, 0.10)' },
    dark: { accent: '#FB7185', strong: '#F43F5E', soft: 'rgba(251, 113, 133, 0.12)' },
  },
] as const;

export type Density = 'comfortable' | 'compact';

export interface InterfacePrefs {
  reduceMotion: boolean;
  liveIndicators: boolean;
  weekStartsMonday: boolean;
}

interface PrefsState {
  accentId: string;
  density: Density;
  iface: InterfacePrefs;
}

const KEYS = {
  accent: 'vantage-accent',
  density: 'vantage-density',
  reduceMotion: 'vantage-pref-reduce-motion',
  liveIndicators: 'vantage-pref-live-indicators',
  weekMonday: 'vantage-pref-week-monday',
} as const;

function readStorage(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function writeStorage(key: string, value: string) {
  try {
    localStorage.setItem(key, value);
  } catch {
    /* ignore */
  }
}

function readState(): PrefsState {
  const storedAccent = readStorage(KEYS.accent);
  const accentId = ACCENTS.some((a) => a.id === storedAccent) ? (storedAccent as string) : 'teal';
  const density: Density = readStorage(KEYS.density) === 'compact' ? 'compact' : 'comfortable';
  return {
    accentId,
    density,
    iface: {
      reduceMotion: readStorage(KEYS.reduceMotion) === '1',
      liveIndicators: readStorage(KEYS.liveIndicators) !== '0', // default on
      weekStartsMonday: readStorage(KEYS.weekMonday) === '1',
    },
  };
}

let state: PrefsState = readState();
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((fn) => fn());
}

/** Global CSS backing density / motion / live-indicator prefs. Injected once. */
function ensureStyleTag() {
  if (typeof document === 'undefined') return;
  if (document.getElementById('vantage-prefs-style')) return;
  const style = document.createElement('style');
  style.id = 'vantage-prefs-style';
  style.textContent = `
html[data-density="compact"] .v-card { padding: 14px; }
html[data-density="compact"] td, html[data-density="compact"] th { padding-top: 6px; padding-bottom: 6px; }
html.v-reduce-motion *, html.v-reduce-motion *::before, html.v-reduce-motion *::after {
  animation-duration: 0.01ms !important;
  animation-iteration-count: 1 !important;
  transition-duration: 0.01ms !important;
  scroll-behavior: auto !important;
}
html.v-hide-live .v-live-dot { display: none; }
`;
  document.head.appendChild(style);
}

function applyAccentToDom() {
  if (typeof document === 'undefined') return;
  const preset = ACCENTS.find((a) => a.id === state.accentId) ?? ACCENTS[0];
  const dark = document.documentElement.classList.contains('dark');
  const tokens = dark ? preset.dark : preset.light;
  const root = document.documentElement.style;
  root.setProperty('--accent', tokens.accent);
  root.setProperty('--accent-strong', tokens.strong);
  root.setProperty('--accent-soft', tokens.soft);
}

function applyAll() {
  if (typeof document === 'undefined') return;
  ensureStyleTag();
  applyAccentToDom();
  const el = document.documentElement;
  el.dataset.density = state.density;
  el.classList.toggle('v-reduce-motion', state.iface.reduceMotion);
  el.classList.toggle('v-hide-live', !state.iface.liveIndicators);
}

/* Boot: apply stored prefs immediately, and keep accent tokens in sync with
   light/dark flips of the <html> class (they use different values). */
if (typeof document !== 'undefined') {
  applyAll();
  new MutationObserver(() => applyAccentToDom()).observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['class'],
  });
}

function setState(next: Partial<PrefsState>) {
  state = { ...state, ...next };
  applyAll();
  emit();
}

/* ------------------------------ public API ------------------------------ */

export function subscribePrefs(fn: () => void): () => void {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

export function setAccent(id: string) {
  if (!ACCENTS.some((a) => a.id === id)) return;
  writeStorage(KEYS.accent, id);
  setState({ accentId: id });
}

export function setDensity(density: Density) {
  writeStorage(KEYS.density, density);
  setState({ density });
}

export function setInterfacePref(key: keyof InterfacePrefs, value: boolean) {
  const storageKey =
    key === 'reduceMotion' ? KEYS.reduceMotion : key === 'liveIndicators' ? KEYS.liveIndicators : KEYS.weekMonday;
  writeStorage(storageKey, value ? '1' : '0');
  setState({ iface: { ...state.iface, [key]: value } });
}

/** React binding for the theme studio. */
export function usePrefs(): PrefsState {
  return useSyncExternalStore(subscribePrefs, () => state, () => state);
}
