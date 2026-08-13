import { useEffect, useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Ban } from 'lucide-react';
import { toast } from 'sonner';
import ConfirmDialog from '@/components/crud/ConfirmDialog';
import RightDrawer from '@/components/crud/RightDrawer';
import ContractPicker from '@/components/resources/ContractPicker';
import { FieldLabel } from '@/components/settings/SectionCard';
import { btnPrimary, btnSecondary, inputCls } from '@/components/settings/bits';
import { blockResource, createResource, updateResource } from '@/services/api/resources.api';
import type { Resource, ResourceStatus, ResourceType } from '@/services/types';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const TYPE_OPTIONS: ResourceType[] = ['SIM', 'ESIM'];
const STATUS_OPTIONS: ResourceStatus[] = ['ASSIGNED', 'AVAILABLE', 'BLOCKED'];

export default function ResourceDrawer({
  resource,
  creating,
  onClose,
}: {
  resource: Resource | null;
  creating: boolean;
  onClose: () => void;
}) {
  const qc = useQueryClient();
  const [type, setType] = useState<ResourceType>('SIM');
  const [iccid, setIccid] = useState('');
  const [imsi, setImsi] = useState('');
  const [msisdn, setMsisdn] = useState('');
  const [status, setStatus] = useState<ResourceStatus>('AVAILABLE');
  const [contractId, setContractId] = useState<string | null>(null);
  const [confirmBlock, setConfirmBlock] = useState(false);

  const open = creating || !!resource;

  useEffect(() => {
    setType(resource?.type ?? 'SIM');
    setIccid(resource?.iccid ?? '');
    setImsi(resource?.imsi ?? '');
    setMsisdn(resource?.msisdn ?? '');
    setStatus(resource?.status ?? 'AVAILABLE');
    setContractId(resource?.contractId ?? null);
    setConfirmBlock(false);
  }, [resource, creating]);

  const invalidate = () => qc.invalidateQueries({ queryKey: ['resources'] });

  const saveMut = useMutation({
    mutationFn: () => {
      const payload = {
        type,
        iccid: iccid.trim(),
        imsi: imsi.trim(),
        msisdn: msisdn.trim(),
        status,
        contractId: status === 'ASSIGNED' ? contractId : null,
      };
      return resource
        ? updateResource(resource.id, payload)
        : createResource(payload);
    },
    onSuccess: () => {
      invalidate();
      onClose();
      toast.success(resource ? 'Resource updated' : 'Resource created');
    },
  });

  const blockMut = useMutation({
    mutationFn: () => blockResource(resource!.id),
    onSuccess: () => {
      invalidate();
      setConfirmBlock(false);
      onClose();
      toast.success('Resource blocked', { description: 'Status set to BLOCKED — nothing was deleted.' });
    },
  });

  const msisdnValid = /^\+216[0-9]{8}$/.test(msisdn.trim());
  const canSave = iccid.trim().length >= 12 && imsi.trim().length >= 10 && msisdnValid;
  const needsContract = status === 'ASSIGNED';

  return (
    <>
      <RightDrawer
        open={open}
        onClose={onClose}
        title={resource ? 'Edit resource' : 'New resource'}
        subtitle={resource ? `${resource.id} · ${resource.type}` : 'Add a SIM or eSIM to the pool.'}
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <label className="block">
              <FieldLabel>Type</FieldLabel>
              <Select value={type} onValueChange={(v) => setType(v as ResourceType)}>
                <SelectTrigger className="w-full border-line-strong bg-surface text-[13px] text-ink-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TYPE_OPTIONS.map((t) => (
                    <SelectItem key={t} value={t}>{t}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </label>
            <label className="block">
              <FieldLabel>Status</FieldLabel>
              <Select value={status} onValueChange={(v) => setStatus(v as ResourceStatus)}>
                <SelectTrigger className="w-full border-line-strong bg-surface text-[13px] text-ink-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {STATUS_OPTIONS.map((s) => (
                    <SelectItem key={s} value={s}>{s}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </label>
          </div>
          <label className="block">
            <FieldLabel>ICCID</FieldLabel>
            <input
              value={iccid}
              onChange={(e) => setIccid(e.target.value)}
              placeholder="89350500000000000000"
              className={inputCls + ' font-mono'}
            />
          </label>
          <div className="grid grid-cols-2 gap-4">
            <label className="block">
              <FieldLabel>IMSI</FieldLabel>
              <input
                value={imsi}
                onChange={(e) => setImsi(e.target.value)}
                placeholder="605010000000000"
                className={inputCls + ' font-mono'}
              />
            </label>
            <label className="block">
              <FieldLabel>MSISDN</FieldLabel>
              <input
                value={msisdn}
                onChange={(e) => setMsisdn(e.target.value)}
                placeholder="+216XXXXXXXX"
                className={inputCls + ' font-mono'}
              />
            </label>
          </div>
          <div>
            <FieldLabel>Linked contract</FieldLabel>
            <ContractPicker value={contractId} onChange={setContractId} />
            {needsContract && !contractId && (
              <p className="mt-1 text-[11.5px] text-warning">An ASSIGNED resource needs a linked contract.</p>
            )}
          </div>
          {msisdn.trim().length > 0 && !msisdnValid && (
            <p className="text-[11.5px] text-warning">MSISDN must be in Tunisian format +216XXXXXXXX.</p>
          )}

          <div className="flex justify-end gap-2 border-t border-line pt-4">
            <button type="button" onClick={onClose} className={btnSecondary}>
              Cancel
            </button>
            <button
              type="button"
              disabled={!canSave || (needsContract && !contractId) || saveMut.isPending}
              onClick={() => saveMut.mutate()}
              className={btnPrimary}
            >
              {saveMut.isPending ? 'Saving…' : resource ? 'Save changes' : 'Create resource'}
            </button>
          </div>

          {resource && resource.status !== 'BLOCKED' && (
            <button
              type="button"
              onClick={() => setConfirmBlock(true)}
              className="flex w-full items-center justify-center gap-2 rounded-md border border-danger/30 bg-[rgba(225,29,72,0.05)] px-3 py-2 text-[13px] font-medium text-danger transition-colors duration-150 hover:bg-[rgba(225,29,72,0.10)]"
            >
              <Ban size={15} />
              Block resource
            </button>
          )}
        </div>
      </RightDrawer>

      <ConfirmDialog
        open={confirmBlock}
        onOpenChange={setConfirmBlock}
        title="Block this resource?"
        description={`This is a soft action: ${resource?.type} ···${resource?.iccid.slice(-4)} will be marked BLOCKED and unlinked from its contract. The record is not deleted.`}
        confirmLabel="Block resource"
        onConfirm={() => blockMut.mutate()}
      />
    </>
  );
}
