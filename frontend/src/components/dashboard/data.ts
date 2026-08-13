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

/** Real activity feed — built from the actual createdAt/updatedAt timestamps of the records already loaded. */
export function buildActivityFeed(
  contracts: Contract[],
  resources: Resource[],
  services: Service[],
  users: User[],
): FeedEntry[] {
  const last4 = (s: string) => s.slice(-4);
  const shortId = (s: string) => s.slice(-8);
  const entries: FeedEntry[] = [];

  let id = 1;

  for (const c of contracts) {
    const name = clientName(c.client);
    entries.push({
      id: id++,
      kind: 'contract',
      avatarName: name,
      verb: 'created',
      object: `Contract #${shortId(c.id)}`,
      at: new Date(c.createdAt).getTime(),
      caption: `Contract #${shortId(c.id)} created for ${name}`,
    });
    if (c.status === 'SUSPENDED') {
      entries.push({
        id: id++,
        kind: 'alert',
        avatarName: name,
        verb: 'suspended',
        object: `Contract #${shortId(c.id)}`,
        at: new Date(c.updatedAt).getTime(),
        caption: `Contract #${shortId(c.id)} suspended for ${name}`,
      });
    } else if (c.status === 'TERMINATED') {
      entries.push({
        id: id++,
        kind: 'alert',
        avatarName: name,
        verb: 'terminated',
        object: `Contract #${shortId(c.id)}`,
        at: new Date(c.updatedAt).getTime(),
        caption: `Contract #${shortId(c.id)} terminated for ${name}`,
      });
    }
  }

  for (const r of resources) {
    const c = r.contractId ? contracts.find((x) => x.id === r.contractId)?.client : undefined;
    const name = c ? clientName(c) : 'Pool';
    entries.push({
      id: id++,
      kind: 'resource',
      avatarName: name,
      verb: 'added',
      object: `Resource ${r.type} ···${last4(r.iccid)}`,
      at: new Date(r.createdAt).getTime(),
      caption: `Resource ${r.type} ···${last4(r.iccid)} added`,
    });
    if (r.status === 'BLOCKED') {
      entries.push({
        id: id++,
        kind: 'alert',
        avatarName: name,
        verb: 'blocked',
        object: `Resource ${r.type} ···${last4(r.iccid)}`,
        at: new Date(r.updatedAt).getTime(),
        caption: `Resource ${r.type} ···${last4(r.iccid)} blocked`,
      });
    }
  }

  for (const s of services) {
    entries.push({
      id: id++,
      kind: 'service',
      avatarName: 'Catalog',
      verb: 'added',
      object: `Service ${s.name}`,
      at: new Date(s.createdAt).getTime(),
      caption: `Service ${s.name} added to the catalog`,
    });
    if (!s.isActive) {
      entries.push({
        id: id++,
        kind: 'alert',
        avatarName: 'Catalog',
        verb: 'deactivated',
        object: `Service ${s.name}`,
        at: new Date(s.updatedAt).getTime(),
        caption: `Service ${s.name} deactivated`,
      });
    }
  }

  for (const u of users) {
    entries.push({
      id: id++,
      kind: 'user',
      avatarName: u.email.split('@')[0],
      verb: 'registered',
      object: u.email,
      at: new Date(u.createdAt).getTime(),
      caption: `New user ${u.email} registered`,
    });
  }

  return entries
    .filter((e) => Number.isFinite(e.at))
    .sort((a, b) => b.at - a.at)
    .slice(0, 14);
}
