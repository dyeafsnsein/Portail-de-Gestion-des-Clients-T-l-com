import { useRef, useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import SectionCard, { FieldLabel } from '@/components/settings/SectionCard';
import { btnPrimary, inputCls } from '@/components/settings/bits';
import { useAuth } from '@/lib/auth';
import { avatarGradient, initials } from '@/lib/mock';
import { uploadAvatar } from '@/services/api/users.api';
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

/** General tab — workspace + profile cards. */
export default function GeneralPanel() {
  const { user: authUser } = useAuth();
  const fileRef = useRef<HTMLInputElement>(null);
  const [savedWs, setSavedWs] = useState({ name: 'MyTT — Portail Télécom', slug: 'myttelecom.tn' });
  const [ws, setWs] = useState(savedWs);
  const wsDirty = ws.name !== savedWs.name || ws.slug !== savedWs.slug;

  const [avatarUrl, setAvatarUrl] = useState<string | null>(authUser?.avatarUrl ?? null);
  const [savedProfile, setSavedProfile] = useState({
    name: authUser?.firstName || authUser?.lastName
      ? `${authUser.firstName ?? ''} ${authUser.lastName ?? ''}`.trim()
      : (authUser?.email ?? ''),
    email: authUser?.email ?? '',
    tz: 'pt',
  });
  const [profile, setProfile] = useState(savedProfile);
  const profileDirty =
    profile.name !== savedProfile.name || profile.email !== savedProfile.email || profile.tz !== savedProfile.tz;

  const avatarMut = useMutation({
    mutationFn: (file: File) => uploadAvatar(authUser!.id, file),
    onSuccess: (res) => {
      setAvatarUrl(res.avatarUrl);
      toast.success('Avatar updated');
    },
    onError: () => toast.error('Upload failed'),
  });

  const email = authUser?.email ?? 'user';

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
            onClick={() => fileRef.current?.click()}
            disabled={!authUser || avatarMut.isPending}
            className="group relative h-14 w-14 shrink-0 overflow-hidden rounded-full disabled:opacity-60"
            aria-label="Change avatar"
            title="Upload avatar"
          >
            {avatarUrl ? (
              <img src={avatarUrl} alt="" className="h-full w-full object-cover" />
            ) : (
              <span
                className="grid h-full w-full place-items-center text-[16px] font-semibold text-white"
                style={{ background: avatarGradient(email) }}
              >
                {initials(email)}
              </span>
            )}
            <span className="absolute inset-0 grid place-items-center bg-black/55 text-[11px] font-semibold text-white opacity-0 transition-opacity duration-150 group-hover:opacity-100">
              {avatarMut.isPending ? '…' : 'Change'}
            </span>
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file && authUser) avatarMut.mutate(file);
              e.target.value = '';
            }}
          />
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
    </div>
  );
}
