/**
 * Deterministic mock-data helpers (seeded PRNG, fake avatars). No backend —
 * all dummy data, seeded so it looks identical on every boot.
 */

/* ------------------------------ seeded PRNG ------------------------------ */

export function mulberry32(seed: number) {
  let a = seed >>> 0;
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Build a deterministic, good-looking random-walk series. */
export function seededSeries(seed: number, points: number, start: number, volatility: number, drift = 0): number[] {
  const rnd = mulberry32(seed);
  const out: number[] = [];
  let v = start;
  for (let i = 0; i < points; i++) {
    const wave = Math.sin(i / 6.5) * volatility * 0.6 + Math.sin(i / 2.3) * volatility * 0.25;
    v += (rnd() - 0.5) * volatility + drift;
    out.push(Math.max(0, v + wave));
  }
  return out;
}

/* ----------------------------- avatar gradients -------------------------- */

const AVATAR_GRADIENTS = [
  'linear-gradient(135deg,#00A99D,#4CA86C)',
  'linear-gradient(135deg,#2F6FE0,#8E3BB3)',
  'linear-gradient(135deg,#F7941E,#E85D75)',
  'linear-gradient(135deg,#4CA86C,#00A99D)',
  'linear-gradient(135deg,#8E3BB3,#2F6FE0)',
  'linear-gradient(135deg,#E85D75,#F7941E)',
];

export function avatarGradient(name: string): string {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) >>> 0;
  return AVATAR_GRADIENTS[h % AVATAR_GRADIENTS.length];
}

export function initials(name: string): string {
  return name
    .split(' ')
    .map((p) => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
}
