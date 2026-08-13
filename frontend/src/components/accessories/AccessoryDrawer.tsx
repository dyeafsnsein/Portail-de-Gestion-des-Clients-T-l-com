import { useEffect, useRef, useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ImagePlus, X } from 'lucide-react';
import { toast } from 'sonner';
import RightDrawer from '@/components/crud/RightDrawer';
import { FieldLabel } from '@/components/settings/SectionCard';
import { btnPrimary, btnSecondary, inputCls } from '@/components/settings/bits';
import { createAccessory, updateAccessory, uploadImage } from '@/services/api/accessories.api';
import type { Accessory, AccessoryCategory } from '@/services/types';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const CATEGORY_OPTIONS: AccessoryCategory[] = ['SMARTPHONE', 'CHARGER', 'HEADSET', 'MODEM'];

export default function AccessoryDrawer({
  accessory,
  creating,
  onClose,
}: {
  accessory: Accessory | null;
  creating: boolean;
  onClose: () => void;
}) {
  const qc = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [name, setName] = useState('');
  const [category, setCategory] = useState<AccessoryCategory>('MODEM');
  const [price, setPrice] = useState('99');
  const [stock, setStock] = useState('0');
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [pendingFile, setPendingFile] = useState<File | null>(null);

  const open = creating || !!accessory;

  useEffect(() => {
    setName(accessory?.name ?? '');
    setCategory(accessory?.category ?? 'MODEM');
    setPrice(accessory ? String(accessory.price) : '99');
    setStock(accessory ? String(accessory.stockQuantity) : '0');
    setImageUrl(accessory?.imageUrl ?? null);
    setPendingFile(null);
  }, [accessory, creating]);

  const invalidate = () => qc.invalidateQueries({ queryKey: ['accessories'] });

  const saveMut = useMutation({
    mutationFn: async () => {
      const payload = {
        name: name.trim(),
        category,
        price: Number(price),
        stockQuantity: Math.max(0, Math.round(Number(stock))),
      };
      const saved = accessory
        ? await updateAccessory(accessory.id, payload)
        : await createAccessory(payload);
      if (!accessory && pendingFile) {
        return uploadImage(saved.id, pendingFile);
      }
      return saved;
    },
    onSuccess: () => {
      invalidate();
      onClose();
      setPendingFile(null);
      toast.success(accessory ? 'Accessory updated' : 'Accessory created');
    },
  });

  /** Edit mode: upload straight to the existing accessory. Create mode: keep the file for after save. */
  const handleFile = (file: File) => {
    if (accessory) {
      uploadMut.mutate(file);
    } else {
      setPendingFile(file);
      setImageUrl(URL.createObjectURL(file));
    }
  };

  const uploadMut = useMutation({
    mutationFn: (file: File) => uploadImage(accessory!.id, file),
    onSuccess: (res) => setImageUrl(res.imageUrl),
  });

  const canSave =
    name.trim().length > 1 &&
    Number.isFinite(Number(price)) &&
    Number(price) >= 0 &&
    Number.isFinite(Number(stock)) &&
    Number(stock) >= 0;

  return (
    <RightDrawer
      open={open}
      onClose={onClose}
      title={accessory ? 'Edit accessory' : 'New accessory'}
      subtitle={accessory ? `${accessory.id} · ${accessory.category}` : 'Add an accessory to the catalog.'}
    >
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="grid size-14 shrink-0 place-items-center overflow-hidden rounded-md border border-line bg-surface-2">
            {imageUrl ? (
              <img src={imageUrl} alt={name || 'Accessory'} className="size-full object-cover" />
            ) : (
              <ImagePlus size={20} className="text-ink-3" />
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploadMut.isPending}
              className="inline-flex items-center gap-1.5 rounded-md border border-line-strong bg-surface px-3 py-1.5 text-[12.5px] font-medium text-ink-1 transition-colors duration-150 hover:border-ink-3 hover:text-ink-1 disabled:opacity-60"
            >
              {uploadMut.isPending ? 'Uploading…' : 'Upload image'}
            </button>
            {imageUrl && (
              <button
                type="button"
                onClick={() => setImageUrl(null)}
                className="inline-flex items-center gap-1 rounded-md border border-line-strong bg-surface px-2.5 py-1.5 text-[12.5px] text-ink-3 transition-colors duration-150 hover:text-danger"
              >
                <X size={13} />
                Remove
              </button>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleFile(file);
                e.target.value = '';
              }}
            />
          </div>
        </div>

        <label className="block">
          <FieldLabel>Name</FieldLabel>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Router WiFi 6"
            className={inputCls}
          />
        </label>
        <div className="grid grid-cols-2 gap-4">
          <label className="block">
            <FieldLabel>Category</FieldLabel>
            <Select value={category} onValueChange={(v) => setCategory(v as AccessoryCategory)}>
              <SelectTrigger className="w-full border-line-strong bg-surface text-[13px] text-ink-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CATEGORY_OPTIONS.map((c) => (
                  <SelectItem key={c} value={c}>{c}</SelectItem>
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
          <FieldLabel>Units in stock</FieldLabel>
          <input
            type="number"
            min="0"
            step="1"
            value={stock}
            onChange={(e) => setStock(e.target.value)}
            className={inputCls + ' tnum'}
          />
        </label>

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
            {saveMut.isPending ? 'Saving…' : accessory ? 'Save changes' : 'Create accessory'}
          </button>
        </div>
      </div>
    </RightDrawer>
  );
}
