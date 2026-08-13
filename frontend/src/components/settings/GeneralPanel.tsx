import { useState } from 'react';
import { toast } from 'sonner';
import SectionCard, { FieldLabel } from '@/components/settings/SectionCard';
import { btnPrimary, inputCls } from '@/components/settings/bits';
import DangerZone from '@/components/settings/DangerZone';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const TIMEZONES = [
  { value: 'pt', label: '(UTC−08:00) Pacific Time' },
  { value: 'et', label: '(UTC−05:00) Eastern Time' },
  { value: 'utc', label: '(UTC+00:00) London' },
  { value: 'cet', label: '(UTC+01:00) Berlin' },
  { value: 'ist', label: '(UTC+05:30) Mumbai' },
  { value: 'jst', label: '(UTC+09:00) Tokyo' },
] as const;

/** General tab — workspace + profile cards + danger zone (settings.md §2, §7). */
export default function GeneralPanel() {
  const [savedWs, setSavedWs] = useState({ name: 'MyTT — Portail Télécom', slug: 'myttelecom.tn' });
  const [ws, setWs] = useState(savedWs);
  const wsDirty = ws.name !== savedWs.name || ws.slug !== savedWs.slug;

  const [savedProfile, setSavedProfile] = useState({ name: 'Ava Reyes', email: 'ava@myttelecom.tn', tz: 'pt' });
  const [profile, setProfile] = useState(savedProfile);
  const profileDirty =
    profile.name !== savedProfile.name || profile.email !== savedProfile.email || profile.tz !== savedProfile.tz;

  return (
    <div className="flex flex-col gap-5">
      <SectionCard title="Workspace" description="How your team sees this workspace across MyTT." index={0}>
        <div className="flex items-start gap-4">
          <img
            src="/logo.svg"
            alt="Workspace logo"
            className="h-11 w-11 shrink-0 rounded-md border border-line bg-surface-2 p-1.5"
          />
          <div className="grid min-w-0 flex-1 gap-4 sm:grid-cols-2">
            <label className="block">
              <FieldLabel>Workspace name</FieldLabel>
              <input
                value={ws.name}
                onChange={(e) => setWs((s) => ({ ...s, name: e.target.value }))}
                className={inputCls}
              />
            </label>
            <label className="block">
              <FieldLabel>Slug</FieldLabel>
              <input
                value={ws.slug}
                onChange={(e) => setWs((s) => ({ ...s, slug: e.target.value }))}
                className={inputCls + ' font-mono'}
              />
            </label>
          </div>
        </div>
        <div className="mt-4 flex justify-end border-t border-line pt-4">
          <button
            type="button"
            disabled={!wsDirty}
            onClick={() => {
              setSavedWs(ws);
              toast.success('Workspace updated');
            }}
            className={btnPrimary}
          >
            Save changes
          </button>
        </div>
      </SectionCard>

      <SectionCard title="Profile" description="Your personal details inside the MyTT — Portail Télécom workspace." index={1}>
        <div className="flex items-start gap-4">
          <button
            type="button"
            onClick={() => toast('Avatar upload is disabled in this demo')}
            className="group relative h-14 w-14 shrink-0 overflow-hidden rounded-full"
            aria-label="Change avatar"
          >
            <span className="v-brand-gradient grid h-full w-full place-items-center text-[16px] font-semibold text-white">
              AR
            </span>
            <span className="absolute inset-0 grid place-items-center bg-black/55 text-[11px] font-semibold text-white opacity-0 transition-opacity duration-150 group-hover:opacity-100">
              Change
            </span>
          </button>
          <div className="grid min-w-0 flex-1 gap-4 sm:grid-cols-2">
            <label className="block">
              <FieldLabel>Full name</FieldLabel>
              <input
                value={profile.name}
                onChange={(e) => setProfile((s) => ({ ...s, name: e.target.value }))}
                className={inputCls}
              />
            </label>
            <label className="block">
              <FieldLabel>Email</FieldLabel>
              <input
                type="email"
                value={profile.email}
                onChange={(e) => setProfile((s) => ({ ...s, email: e.target.value }))}
                className={inputCls}
              />
            </label>
            <div className="sm:col-span-2">
              <FieldLabel>Timezone</FieldLabel>
              <Select value={profile.tz} onValueChange={(v) => setProfile((s) => ({ ...s, tz: v }))}>
                <SelectTrigger className="w-full border-line-strong bg-surface text-[13px] text-ink-1">
                  <SelectValue placeholder="Select timezone" />
                </SelectTrigger>
                <SelectContent>
                  {TIMEZONES.map((tz) => (
                    <SelectItem key={tz.value} value={tz.value}>
                      {tz.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
        <div className="mt-4 flex justify-end border-t border-line pt-4">
          <button
            type="button"
            disabled={!profileDirty}
            onClick={() => {
              setSavedProfile(profile);
              toast.success('Profile updated');
            }}
            className={btnPrimary}
          >
            Save changes
          </button>
        </div>
      </SectionCard>

      <DangerZone index={2} />
    </div>
  );
}
