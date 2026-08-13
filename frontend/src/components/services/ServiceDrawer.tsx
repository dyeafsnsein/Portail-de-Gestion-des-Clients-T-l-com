import { useEffect, useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import RightDrawer from '@/components/crud/RightDrawer';
import { FieldLabel } from '@/components/settings/SectionCard';
import { btnPrimary, btnSecondary, inputCls } from '@/components/settings/bits';
import { Switch } from '@/components/ui/switch';
import { createService, updateService } from '@/services/api/services.api';
import type { Service, ServiceType } from '@/services/types';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';

const TYPE_OPTIONS: ServiceType[] = ['INTERNET', 'ROAMING', 'VOLTE', 'SMS', 'OPTION'];

export default function ServiceDrawer({
  service,
  creating,
  onClose,
}: {
  service: Service | null;
  creating: boolean;
  onClose: () => void;
}) {
  const qc = useQueryClient();
  const [name, setName] = useState('');
  const [type, setType] = useState<ServiceType>('INTERNET');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('10');
  const [isActive, setIsActive] = useState(true);

  const open = creating || !!service;

  useEffect(() => {
    setName(service?.name ?? '');
    setType(service?.type ?? 'INTERNET');
    setDescription(service?.description ?? '');
    setPrice(service ? String(service.price) : '10');
    setIsActive(service?.isActive ?? true);
  }, [service, creating]);

  const invalidate = () => qc.invalidateQueries({ queryKey: ['services'] });

  const saveMut = useMutation({
    mutationFn: () => {
      const payload = { name: name.trim(), type, description: description.trim(), price: Number(price), isActive };
      return service ? updateService(service.id, payload) : createService(payload);
    },
    onSuccess: () => {
      invalidate();
      onClose();
      toast.success(service ? 'Service updated' : 'Service created');
    },
  });

  const canSave = name.trim().length > 1 && Number.isFinite(Number(price)) && Number(price) >= 0;

  return (
    <RightDrawer
      open={open}
      onClose={onClose}
      title={service ? 'Edit service' : 'New service'}
      subtitle={service ? `${service.id} · ${service.type}` : 'Add a service to the catalog.'}
    >
      <div className="space-y-4">
        <label className="block">
          <FieldLabel>Name</FieldLabel>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Fiber 300Mbps"
            className={inputCls}
          />
        </label>
        <div className="grid grid-cols-2 gap-4">
          <label className="block">
            <FieldLabel>Type</FieldLabel>
            <Select value={type} onValueChange={(v) => setType(v as ServiceType)}>
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
            <FieldLabel>Price (USD)</FieldLabel>
            <input
              type="number"
              min="0"
              step="0.5"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className={inputCls + ' tnum'}
            />
          </label>
        </div>
        <label className="block">
          <FieldLabel>Description</FieldLabel>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            placeholder="What does this service include?"
            className={cn(inputCls, 'h-auto resize-none py-2')}
          />
        </label>
        <div className="flex items-center justify-between rounded-md border border-line bg-surface-2 px-3 py-2.5">
          <div>
            <p className="text-[13px] font-medium text-ink-1">Active</p>
            <p className="text-[11.5px] text-ink-3">Visible and orderable by clients.</p>
          </div>
          <Switch checked={isActive} onCheckedChange={setIsActive} aria-label="Toggle active" className="h-[18px] w-8 [&_[data-slot=switch-thumb]]:size-3.5" />
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
            {saveMut.isPending ? 'Saving…' : service ? 'Save changes' : 'Create service'}
          </button>
        </div>
      </div>
    </RightDrawer>
  );
}
