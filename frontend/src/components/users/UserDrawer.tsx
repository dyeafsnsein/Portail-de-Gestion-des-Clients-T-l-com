import { useEffect, useRef, useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { KeyRound, Trash2, Upload } from 'lucide-react';
import { toast } from 'sonner';
import ConfirmDialog from '@/components/crud/ConfirmDialog';
import Pill from '@/components/crud/Pill';
import RightDrawer from '@/components/crud/RightDrawer';
import { FieldLabel } from '@/components/settings/SectionCard';
import { btnPrimary, btnSecondary, inputCls } from '@/components/settings/bits';
import { fmtDate } from '@/lib/format';
import { avatarGradient, initials } from '@/lib/mock';
import {
  createUser,
  deleteUser,
  resetPassword,
  updateUser,
  uploadAvatar,
} from '@/services/api/users.api';
import type { User, UserRole } from '@/services/types';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export function Avatar({ user, avatarUrl, size = 'lg' }: { user: User; avatarUrl?: string | null; size?: 'lg' | 'md' }) {
  const cls = size === 'lg' ? 'h-14 w-14 text-[16px]' : 'h-8 w-8 text-[10px]';
  const url = avatarUrl ?? user.avatarUrl;
  if (url) {
    return <img src={url} alt="" className={`${cls} shrink-0 rounded-full object-cover`} />;
  }
  return (
    <span
      className={`${cls} grid shrink-0 place-items-center rounded-full font-semibold text-white`}
      style={{ background: avatarGradient(user.email) }}
    >
      {initials(user.email)}
    </span>
  );
}

/** Detail / edit drawer for one user (or create form). */
export default function UserDrawer({
  user,
  onClose,
}: {
  user: User | null;
  onClose: () => void;
}) {
  const qc = useQueryClient();
  const fileRef = useRef<HTMLInputElement>(null);
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<UserRole>('USER');
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [confirmReset, setConfirmReset] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    setEmail(user?.email ?? '');
    setRole(user?.role ?? 'USER');
    setAvatarUrl(user?.avatarUrl ?? null);
    setNewPassword('');
  }, [user]);

  const invalidate = () => qc.invalidateQueries({ queryKey: ['users'] });

  const updateMut = useMutation({
    mutationFn: (payload: { email: string; role: UserRole }) =>
      updateUser(user!.id, payload),
    onSuccess: () => {
      invalidate();
      toast.success('Profile updated');
    },
  });

  const resetMut = useMutation({
    mutationFn: () => resetPassword(user!.id, newPassword),
    onSuccess: () => {
      setConfirmReset(false);
      setNewPassword('');
      toast.success('Password reset', { description: `New password set for ${user?.email}` });
    },
  });

  const deleteMut = useMutation({
    mutationFn: () => deleteUser(user!.id),
    onSuccess: () => {
      invalidate();
      setConfirmDelete(false);
      onClose();
      toast.success('User deleted');
    },
  });

  const avatarMut = useMutation({
    mutationFn: (file: File) => uploadAvatar(user!.id, file),
    onSuccess: (res) => {
      setAvatarUrl(res.avatarUrl);
      invalidate();
      toast.success('Avatar updated');
    },
    onError: () => toast.error('Upload failed'),
  });

  const dirty = user ? email !== user.email || role !== user.role : true;
  const canReset = newPassword.length >= 8;

  return (
    <>
      <RightDrawer
        open={!!user}
        onClose={onClose}
        title={user ? 'User details' : undefined}
        subtitle={user ? `${fmtDate(user.createdAt)} · joined` : undefined}
      >
        {user && (
          <motion.div
            key={user.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="space-y-5"
          >
            {/* header */}
            <div className="flex items-center gap-4">
              <div className="relative">
                <Avatar user={user} avatarUrl={avatarUrl} />
                <button
                  type="button"
                  aria-label="Upload avatar"
                  onClick={() => fileRef.current?.click()}
                  className="absolute -bottom-1 -right-1 grid h-6 w-6 place-items-center rounded-full border border-line bg-surface text-ink-2 shadow-card transition-colors duration-150 hover:text-ink-1"
                >
                  <Upload size={12} />
                </button>
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) avatarMut.mutate(f);
                    e.target.value = '';
                  }}
                />
              </div>
              <div className="min-w-0">
                <div className="truncate font-mono text-[13px] font-medium text-ink-1">{user.email}</div>
                <div className="mt-1 flex items-center gap-1.5">
                  <Pill tone={user.role === 'ADMIN' ? 'brand' : 'neutral'}>{user.role}</Pill>
                  <span className="text-[11px] text-ink-3">ID {user.id}</span>
                </div>
              </div>
            </div>

            {/* edit form */}
            <div className="space-y-4">
              <label className="block">
                <FieldLabel>Email</FieldLabel>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={inputCls}
                />
              </label>
              <label className="block">
                <FieldLabel>Role</FieldLabel>
                <Select value={role} onValueChange={(v) => setRole(v as UserRole)}>
                  <SelectTrigger className="w-full border-line-strong bg-surface text-[13px] text-ink-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ADMIN">ADMIN</SelectItem>
                    <SelectItem value="USER">USER</SelectItem>
                  </SelectContent>
                </Select>
              </label>
              <div className="flex justify-end">
                <button
                  type="button"
                  disabled={!dirty || updateMut.isPending}
                  onClick={() => updateMut.mutate({ email, role })}
                  className={btnPrimary}
                >
                  {updateMut.isPending ? 'Saving…' : 'Save changes'}
                </button>
              </div>
            </div>

            {/* actions */}
            <div className="space-y-2 border-t border-line pt-4">
              {confirmReset && (
                <div className="space-y-2 rounded-md border border-line bg-surface-2 p-3">
                  <FieldLabel>New password</FieldLabel>
                  <input
                    type="text"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Minimum 8 characters"
                    className={inputCls}
                  />
                  <div className="flex justify-end gap-2">
                    <button type="button" onClick={() => { setConfirmReset(false); setNewPassword(''); }} className={btnSecondary}>
                      Cancel
                    </button>
                    <button
                      type="button"
                      disabled={!canReset || resetMut.isPending}
                      onClick={() => resetMut.mutate()}
                      className={btnPrimary}
                    >
                      {resetMut.isPending ? 'Setting…' : 'Set password'}
                    </button>
                  </div>
                </div>
              )}
              {!confirmReset && (
                <button
                  type="button"
                  onClick={() => setConfirmReset(true)}
                  className="flex w-full items-center gap-2 rounded-md border border-line bg-surface px-3 py-2 text-[13px] font-medium text-ink-2 transition-colors duration-150 hover:bg-surface-2 hover:text-ink-1"
                >
                  <KeyRound size={15} />
                  Reset password
                </button>
              )}
              <button
                type="button"
                onClick={() => setConfirmDelete(true)}
                className="flex w-full items-center gap-2 rounded-md border border-danger/30 bg-[rgba(225,29,72,0.05)] px-3 py-2 text-[13px] font-medium text-danger transition-colors duration-150 hover:bg-[rgba(225,29,72,0.10)]"
              >
                <Trash2 size={15} />
                Delete user
              </button>
            </div>
          </motion.div>
        )}
      </RightDrawer>

      <ConfirmDialog
        open={confirmDelete}
        onOpenChange={setConfirmDelete}
        title="Delete user?"
        description={`${user?.email} will lose access to the portal immediately. This cannot be undone.`}
        confirmLabel="Delete user"
        destructive
        onConfirm={() => deleteMut.mutate()}
      />
    </>
  );
}

/** Create-user drawer. */
export function CreateUserDrawer({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const qc = useQueryClient();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>('USER');

  const createMut = useMutation({
    mutationFn: createUser,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['users'] });
      onClose();
      setEmail('');
      setPassword('');
      setRole('USER');
      toast.success('User created', { description: 'The new user can sign in immediately.' });
    },
  });

  const canSubmit = email.trim().includes('@') && password.length >= 8;

  return (
    <RightDrawer open={open} onClose={onClose} title="Add user" subtitle="Create a new portal account.">
      <div className="space-y-4">
        <label className="block">
          <FieldLabel>Email</FieldLabel>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="name@mytt.tn"
            className={inputCls}
          />
        </label>
        <label className="block">
          <FieldLabel>Password</FieldLabel>
          <input
            type="text"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Minimum 8 characters"
            className={inputCls}
          />
        </label>
        <label className="block">
          <FieldLabel>Role</FieldLabel>
          <Select value={role} onValueChange={(v) => setRole(v as UserRole)}>
            <SelectTrigger className="w-full border-line-strong bg-surface text-[13px] text-ink-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ADMIN">ADMIN</SelectItem>
              <SelectItem value="USER">USER</SelectItem>
            </SelectContent>
          </Select>
        </label>
        <div className="flex justify-end gap-2 border-t border-line pt-4">
          <button type="button" onClick={onClose} className={btnSecondary}>
            Cancel
          </button>
          <button
            type="button"
            disabled={!canSubmit || createMut.isPending}
            onClick={() => createMut.mutate({ email: email.trim(), password, role })}
            className={btnPrimary}
          >
            {createMut.isPending ? 'Creating…' : 'Create user'}
          </button>
        </div>
      </div>
    </RightDrawer>
  );
}
