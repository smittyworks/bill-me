'use client';

import { useState, useEffect } from 'react';
import { TimeBlock, CreateTimeBlockRequest, UpdateTimeBlockRequest, TimeBlockStatus } from '@shared/types';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { todayLocalDate, nextHalfHour } from '@/lib/time';
import { cn } from '@/lib/utils';

const DURATION_OPTIONS = [
  { label: '30m', value: 30 },
  { label: '1h', value: 60 },
  { label: '1h 30m', value: 90 },
  { label: '2h', value: 120 },
  { label: '2h 30m', value: 150 },
  { label: '3h', value: 180 },
];

const STATUS_OPTIONS: { label: string; value: TimeBlockStatus }[] = [
  { label: 'Pending', value: 'pending' },
  { label: 'Started', value: 'started' },
  { label: 'Done', value: 'completed' },
];

interface Props {
  open: boolean;
  onClose: () => void;
  /** If provided, sheet is in edit mode */
  block?: TimeBlock;
  /** Pre-fill start time (HH:MM) when adding from a slot */
  defaultStartTime?: string;
  onSave: (data: CreateTimeBlockRequest | UpdateTimeBlockRequest) => Promise<void>;
  onDelete?: () => Promise<void>;
}

export function BlockSheet({ open, onClose, block, defaultStartTime, onSave, onDelete }: Props) {
  const isEdit = !!block;

  const [label, setLabel] = useState('');
  const [startTime, setStartTime] = useState('');
  const [durationMinutes, setDurationMinutes] = useState(60);
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<TimeBlockStatus>('pending');
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  // Reset form when sheet opens/block changes
  useEffect(() => {
    if (open) {
      if (block) {
        setLabel(block.label);
        // Postgres returns "HH:MM:SS" — trim to "HH:MM" for the time input
        setStartTime(block.start_time.slice(0, 5));
        setDurationMinutes(block.duration_minutes);
        setDescription(block.description ?? '');
        setStatus(block.status);
      } else {
        setLabel('');
        setStartTime(defaultStartTime ?? nextHalfHour());
        setDurationMinutes(60);
        setDescription('');
        setStatus('pending');
      }
      setConfirmDelete(false);
    }
  }, [open, block, defaultStartTime]);

  async function handleSave() {
    if (!label.trim()) return;
    setSaving(true);
    try {
      if (isEdit) {
        const update: UpdateTimeBlockRequest = {
          label: label.trim(),
          start_time: startTime,
          duration_minutes: durationMinutes,
          description: description || undefined,
          status,
        };
        await onSave(update);
      } else {
        const create: CreateTimeBlockRequest = {
          date: todayLocalDate(),
          label: label.trim(),
          start_time: startTime,
          duration_minutes: durationMinutes,
          description: description || undefined,
        };
        await onSave(create);
      }
      onClose();
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!confirmDelete) {
      setConfirmDelete(true);
      setTimeout(() => setConfirmDelete(false), 3000);
      return;
    }
    setSaving(true);
    try {
      await onDelete?.();
      onClose();
    } finally {
      setSaving(false);
    }
  }

  return (
    <Sheet open={open} onOpenChange={(v) => !v && onClose()}>
      <SheetContent side="bottom" className="rounded-t-2xl max-h-[90vh] overflow-y-auto">
        <SheetHeader className="mb-4">
          <SheetTitle>{isEdit ? 'Edit Block' : 'New Block'}</SheetTitle>
        </SheetHeader>

        <div className="space-y-4">
          {/* Label */}
          <div className="space-y-1.5">
            <Label htmlFor="label">What are you working on?</Label>
            <Input
              id="label"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="e.g. Deep work, Emails, Gym"
              autoFocus
            />
          </div>

          {/* Start time */}
          <div className="space-y-1.5">
            <Label htmlFor="start_time">Start time</Label>
            <Input
              id="start_time"
              type="time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
            />
          </div>

          {/* Duration */}
          <div className="space-y-1.5">
            <Label>Duration</Label>
            <div className="flex flex-wrap gap-2">
              {DURATION_OPTIONS.map((opt) => (
                <Button
                  key={opt.value}
                  type="button"
                  size="sm"
                  variant={durationMinutes === opt.value ? 'default' : 'outline'}
                  onClick={() => setDurationMinutes(opt.value)}
                >
                  {opt.label}
                </Button>
              ))}
            </div>
          </div>

          {/* Status (edit only) */}
          {isEdit && (
            <div className="space-y-1.5">
              <Label>Status</Label>
              <div className="flex gap-2">
                {STATUS_OPTIONS.map((opt) => (
                  <Button
                    key={opt.value}
                    type="button"
                    size="sm"
                    variant={status === opt.value ? 'default' : 'outline'}
                    onClick={() => setStatus(opt.value)}
                    className="flex-1"
                  >
                    {opt.label}
                  </Button>
                ))}
              </div>
            </div>
          )}

          {/* Description */}
          <div className="space-y-1.5">
            <Label htmlFor="description">Notes <span className="text-muted-foreground">(optional)</span></Label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Any extra context..."
              rows={3}
              className={cn(
                'flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm',
                'placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2',
                'focus-visible:ring-ring resize-none'
              )}
            />
          </div>

          {/* Actions */}
          <Button
            className="w-full"
            onClick={handleSave}
            disabled={saving || !label.trim()}
          >
            {saving ? 'Saving…' : isEdit ? 'Save Changes' : 'Add Block'}
          </Button>

          {isEdit && onDelete && (
            <Button
              variant="outline"
              className="w-full text-destructive border-destructive/40 hover:bg-destructive/10"
              onClick={handleDelete}
              disabled={saving}
            >
              {confirmDelete ? 'Tap again to confirm delete' : 'Delete Block'}
            </Button>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
