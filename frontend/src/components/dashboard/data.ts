import type { Contract, Resource, Service, User } from '@/services/types';
import { clientName } from '@/lib/format';

/** Day bucket helper — count items by a date field, last `days` days. */
export function dailyCounts(items: Array<{ date: string }>, days: number): number[] {
  const out = new Array<number>(days).fill(0);
  const today = new Date();
  for (const it of items) {
    const d = new Date(it.date);
    const diff = Math.floor((today.getTime() - d.getTime()) / 86_400_000);
    if (diff >= 0 && diff < days) out[days - 1 - diff] += 1;
  }
  return out;
}

/** Weekly buckets (suffix points from the last `weeks` weeks) for sparklines. */
export function weeklySeries(items: Array<{ date: string }>, weeks = 14): number[] {
  const out = new Array<number>(weeks).fill(0);
  const now = Date.now();
  const weekMs = 7 * 86_400_000;
  for (const it of items) {
    const age = now - new Date(it.date).getTime();
    const w = Math.floor(age / weekMs);
    if (w >= 0 && w < weeks) out[weeks - 1 - w] += 1;
  }
  return out;
}

export function monthDelta(items: Array<{ date: string }>): { pct: number; direction: 'up' | 'down' } {
  const now = Date.now();
  const monthMs = 30 * 86_400_000;
  let cur = 0;
  let prev = 0;
  for (const it of items) {
    const age = now - new Date(it.date).getTime();
    if (age <= monthMs) cur += 1;
    else if (age <= 2 * monthMs) prev += 1;
  }
  const base = Math.max(prev, 1);
  const pct = Math.abs(Math.round(((cur - prev) / base) * 1000) / 10);
  return { pct, direction: cur >= prev ? 'up' : 'down' };
}

/* ------------------------------ activity feed ----------------------------- */

export type FeedKind = 'contract' | 'resource' | 'service' | 'user' | 'alert';

export interface FeedEntry {
  id: number;
  kind: FeedKind;
  avatarName: string;
  verb: string;
  object: string;
  at: number;
  caption: string;
}

/** Deterministic telecom activity feed built from the seeded mock data. */
export function buildActivityFeed(
  contracts: Contract[],
  resources: Resource[],
  services: Service[],
  users: User[],
): FeedEntry[] {
  if (!contracts.length || !resources.length || !services.length || !users.length) return [];
  const now = Date.now();
  const minutesAgo = [2, 9, 18, 31, 47, 68, 95, 130, 175, 230, 300, 390, 490, 600];
  const pick = <T,>(arr: T[], i: number) => arr[(i * 7 + 3) % arr.length];
  const last4 = (s: string) => s.slice(-4);

  const entries: FeedEntry[] = [
    {
      id: 1,
      kind: 'contract',
      avatarName: clientName(pick(contracts, 0).client),
      verb: 'created for',
      object: clientName(pick(contracts, 0).client),
      at: now - minutesAgo[0] * 60_000,
      caption: `Contract #${pick(contracts, 0).id} created for ${clientName(pick(contracts, 0).client)}`,
    },
    {
      id: 2,
      kind: 'resource',
      avatarName: clientName(pick(contracts, 3).client),
      verb: 'assigned to',
      object: `Contract #${pick(contracts, 3).id}`,
      at: now - minutesAgo[1] * 60_000,
      caption: `Resource ${pick(resources, 1).type} ···${last4(pick(resources, 1).iccid)} assigned to Contract #${pick(contracts, 3).id}`,
    },
    {
      id: 3,
      kind: 'service',
      avatarName: clientName(pick(contracts, 5).client),
      verb: 'activated on',
      object: `Contract #${pick(contracts, 5).id}`,
      at: now - minutesAgo[2] * 60_000,
      caption: `Service ${pick(services, 2).name} activated on Contract #${pick(contracts, 5).id}`,
    },
    {
      id: 4,
      kind: 'user',
      avatarName: pick(users, 4).email.split('@')[0],
      verb: 'registered as',
      object: pick(users, 4).role,
      at: now - minutesAgo[3] * 60_000,
      caption: `New user ${pick(users, 4).email} registered`,
    },
    {
      id: 5,
      kind: 'alert',
      avatarName: clientName(pick(contracts, 8).client),
      verb: 'suspended',
      object: `Contract #${pick(contracts, 8).id}`,
      at: now - minutesAgo[4] * 60_000,
      caption: `Contract #${pick(contracts, 8).id} suspended for ${clientName(pick(contracts, 8).client)}`,
    },
    {
      id: 6,
      kind: 'resource',
      avatarName: clientName(pick(contracts, 2).client),
      verb: 'blocked',
      object: last4(pick(resources, 6).iccid),
      at: now - minutesAgo[5] * 60_000,
      caption: `Resource ${pick(resources, 6).type} ···${last4(pick(resources, 6).iccid)} blocked`,
    },
    {
      id: 7,
      kind: 'service',
      avatarName: 'Catalog',
      verb: 'added to',
      object: 'the catalog',
      at: now - minutesAgo[6] * 60_000,
      caption: `Service ${pick(services, 7).name} added to the catalog`,
    },
    {
      id: 8,
      kind: 'contract',
      avatarName: clientName(pick(contracts, 6).client),
      verb: 'renewed for',
      object: clientName(pick(contracts, 6).client),
      at: now - minutesAgo[7] * 60_000,
      caption: `Contract #${pick(contracts, 6).id} renewed for ${clientName(pick(contracts, 6).client)}`,
    },
    {
      id: 9,
      kind: 'user',
      avatarName: pick(users, 9).email.split('@')[0],
      verb: 'promoted to',
      object: 'ADMIN',
      at: now - minutesAgo[8] * 60_000,
      caption: `${pick(users, 9).email} promoted to ADMIN`,
    },
    {
      id: 10,
      kind: 'alert',
      avatarName: clientName(pick(contracts, 10).client),
      verb: 'terminated for',
      object: clientName(pick(contracts, 10).client),
      at: now - minutesAgo[9] * 60_000,
      caption: `Contract #${pick(contracts, 10).id} terminated for ${clientName(pick(contracts, 10).client)}`,
    },
    {
      id: 11,
      kind: 'resource',
      avatarName: clientName(pick(contracts, 4).client),
      verb: 'released',
      object: `msisdn ${pick(resources, 11).msisdn}`,
      at: now - minutesAgo[10] * 60_000,
      caption: `Resource ${pick(resources, 11).type} ···${last4(pick(resources, 11).iccid)} released and available`,
    },
    {
      id: 12,
      kind: 'service',
      avatarName: 'Catalog',
      verb: 'deactivated',
      object: '—',
      at: now - minutesAgo[11] * 60_000,
      caption: `Service ${pick(services, 12).name} deactivated`,
    },
    {
      id: 13,
      kind: 'alert',
      avatarName: 'Warehouse',
      verb: 'low on',
      object: 'stock',
      at: now - minutesAgo[12] * 60_000,
      caption: `Stock alert: accessory ${pick(services, 13).name} below 10 units`,
    },
    {
      id: 14,
      kind: 'contract',
      avatarName: clientName(pick(contracts, 12).client),
      verb: 'created for',
      object: clientName(pick(contracts, 12).client),
      at: now - minutesAgo[13] * 60_000,
      caption: `Contract #${pick(contracts, 12).id} created for ${clientName(pick(contracts, 12).client)}`,
    },
  ];

  return entries;
}
