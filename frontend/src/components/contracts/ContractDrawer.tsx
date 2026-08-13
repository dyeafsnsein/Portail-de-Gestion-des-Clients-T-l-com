import { useEffect, useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Ban } from 'lucide-react';
import { toast } from 'sonner';
import ConfirmDialog from '@/components/crud/ConfirmDialog';
import RightDrawer from '@/components/crud/RightDrawer';
import { FieldLabel } from '@/components/settings/SectionCard';
import { btnPrimary, btnSecondary, inputCls } from '@/components/settings/bits';
import { CONTRACT_TYPES } from '@/services/constants';
import { createContract, terminateContract, updateContract } from '@/services/api/contracts.api';
import type { Contract, ContractStatus } from '@/services/types';
import ClientPicker from '@/components/contracts/ClientPicker';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const STATUS_OPTIONS: ContractStatus[] = ['ACTIVE', 'SUSPENDED', 'TERMINATED'];

function today() {
  return new Date().toISOString().slice(0, 10);
}
function inAYear() {
  const d = new Date();
  d.setFullYear(d.getFullYear() + 1);
  return d.toISOString().slice(0, 10);
}
/** Backend returns full ISO datetimes — date inputs need YYYY-MM-DD. */
function toDateInput(iso?: string): string {
  return iso ? iso.slice(0, 10) : '';
}

export default function ContractDrawer({
  contract,
  creating,
  onClose,
}: {
  /** edit target — null in create mode */
  contract: Contract | null;
  creating: boolean;
  onClose: () => void;
}) {
  const qc = useQueryClient();
  const [clientId, setClientId] = useState<string | null>(null);
  const [type, setType] = useState('Postpaid');
  const [status, setStatus] = useState<ContractStatus>('ACTIVE');
  const [startDate, setStartDate] = useState(today());
  const [endDate, setEndDate] = useState(inAYear());
  const [confirmTerminate, setConfirmTerminate] = useState(false);

  const open = creating || !!contract;

  useEffect(() => {
    setClientId(contract?.clientId ?? null);
    setType(contract?.type ?? 'Postpaid');
    setStatus(contract?.status ?? 'ACTIVE');
    setStartDate(toDateInput(contract?.startDate) || today());
    setEndDate(toDateInput(contract?.endDate) || inAYear());
    setConfirmTerminate(false);
  }, [contract, creating]);

  const invalidate = () => qc.invalidateQueries({ queryKey: ['contracts'] });

  const saveMut = useMutation({
    mutationFn: () => {
      if (!clientId) throw new Error('Select a client');
      const payload = { clientId, type, status, startDate, endDate };
      return contract
        ? updateContract(contract.id, payload)
        : createContract(payload);
    },
    onSuccess: () => {
      invalidate();
      onClose();
      toast.success(contract ? 'Contract updated' : 'Contract created');
    },
  });

  const terminateMut = useMutation({
    mutationFn: () => terminateContract(contract!.id),
    onSuccess: () => {
      invalidate();
      setConfirmTerminate(false);
      onClose();
      toast.success('Contract terminated', { description: 'Status set to TERMINATED — nothing was deleted.' });
    },
  });

  const canSave = !!clientId && !!startDate && !!endDate && endDate >= startDate;

  return (
    <>
      <RightDrawer
        open={open}
        onClose={onClose}
        title={contract ? 'Edit contract' : 'New contract'}
        subtitle={contract ? `${contract.id} · started ${toDateInput(contract.startDate)}` : 'Create a client contract.'}
      >
        <div className="space-y-4">
          <div>
            <FieldLabel>Client</FieldLabel>
            <ClientPicker value={clientId} onChange={setClientId} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <label className="block">
              <FieldLabel>Type</FieldLabel>
              <Select value={type} onValueChange={setType}>
                <SelectTrigger className="w-full border-line-strong bg-surface text-[13px] text-ink-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CONTRACT_TYPES.map((t) => (
                    <SelectItem key={t} value={t}>{t}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </label>
            <label className="block">
              <FieldLabel>Status</FieldLabel>
              <Select value={status} onValueChange={(v) => setStatus(v as ContractStatus)}>
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
          <div className="grid grid-cols-2 gap-4">
            <label className="block">
              <FieldLabel>Start date</FieldLabel>
              <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className={inputCls} />
            </label>
            <label className="block">
              <FieldLabel>End date</FieldLabel>
              <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className={inputCls} />
            </label>
          </div>

          <div className="flex justify-end gap-2 border-t border-line pt-4">
            <button type="button" onClick={onClose} className={btnSecondary}>
              Cancel
            </button>
            <button
              type="button"
              disabled={!canSave || saveMut.isPending}
              onClick={() => saveMut.mutate()}
              className={btnPrimary}
            >
              {saveMut.isPending ? 'Saving…' : contract ? 'Save changes' : 'Create contract'}
            </button>
          </div>

          {contract && contract.status !== 'TERMINATED' && (
            <button
              type="button"
              onClick={() => setConfirmTerminate(true)}
              className="flex w-full items-center justify-center gap-2 rounded-md border border-danger/30 bg-[rgba(225,29,72,0.05)] px-3 py-2 text-[13px] font-medium text-danger transition-colors duration-150 hover:bg-[rgba(225,29,72,0.10)]"
            >
              <Ban size={15} />
              Terminate contract
            </button>
          )}
        </div>
      </RightDrawer>

      <ConfirmDialog
        open={confirmTerminate}
        onOpenChange={setConfirmTerminate}
        title="Terminate this contract?"
        description={`This is a soft action: ${contract?.id} (${contract?.client.email}) will be marked TERMINATED and excluded from active counts. The record is not deleted and can be edited later.`}
        confirmLabel="Terminate contract"
        onConfirm={() => terminateMut.mutate()}
      />
    </>
  );
}
