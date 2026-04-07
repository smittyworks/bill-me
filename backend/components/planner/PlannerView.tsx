'use client';

import { useState } from 'react';
import { TimeBlock, CreateTimeBlockRequest, UpdateTimeBlockRequest } from '@shared/types';
import { Button } from '@/components/ui/button';
import { Plus, CalendarDays } from 'lucide-react';
import { pickNextColor } from '@/lib/blockColors';
import { TimelineGrid } from './TimelineGrid';
import { BlockSheet } from './BlockSheet';
import { toast } from 'sonner';

interface Props {
  initialBlocks: TimeBlock[];
  date: string;
  displayDate: string;
}

export function PlannerView({ initialBlocks, date, displayDate }: Props) {
  const [blocks, setBlocks] = useState<TimeBlock[]>(initialBlocks);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [selectedBlock, setSelectedBlock] = useState<TimeBlock | undefined>();
  const [defaultStartTime, setDefaultStartTime] = useState<string | undefined>();

  function openAdd(time?: string) {
    setSelectedBlock(undefined);
    setDefaultStartTime(time);
    setSheetOpen(true);
  }

  function openEdit(block: TimeBlock) {
    setSelectedBlock(block);
    setDefaultStartTime(undefined);
    setSheetOpen(true);
  }

  async function handleSave(data: CreateTimeBlockRequest | UpdateTimeBlockRequest) {
    if (selectedBlock) {
      // Update existing
      const res = await fetch(`/api/time-blocks/${selectedBlock.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        toast.error('Failed to update block');
        return;
      }
      const updated: TimeBlock = await res.json();
      setBlocks((prev) =>
        prev.map((b) => (b.id === updated.id ? updated : b)).sort(sortByTime)
      );
      toast.success('Block updated');
    } else {
      // Create new — pick next color based on how many blocks already exist today
      const color = pickNextColor(blocks.length);
      const res = await fetch('/api/time-blocks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, color }),
      });
      if (!res.ok) {
        toast.error('Failed to create block');
        return;
      }
      const created: TimeBlock = await res.json();
      setBlocks((prev) => [...prev, created].sort(sortByTime));
      toast.success('Block added');
    }
  }

  async function handleDelete() {
    if (!selectedBlock) return;
    const res = await fetch(`/api/time-blocks/${selectedBlock.id}`, { method: 'DELETE' });
    if (!res.ok) {
      toast.error('Failed to delete block');
      return;
    }
    setBlocks((prev) => prev.filter((b) => b.id !== selectedBlock.id));
    toast.success('Block deleted');
  }

  return (
    <div className="flex flex-col h-full space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Planner</h1>
          <p className="text-sm text-muted-foreground flex items-center gap-1 mt-0.5">
            <CalendarDays className="w-3.5 h-3.5" />
            {displayDate}
          </p>
        </div>
        <Button onClick={() => openAdd()}>
          <Plus className="w-4 h-4 mr-1" />
          Add Block
        </Button>
      </div>

      {/* Empty state */}
      {blocks.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 text-center gap-3">
          <CalendarDays className="w-10 h-10 text-muted-foreground" />
          <p className="font-medium">No blocks yet for today</p>
          <p className="text-sm text-muted-foreground">Tap Add Block to plan your day</p>
          <Button onClick={() => openAdd()} className="mt-2">
            <Plus className="w-4 h-4 mr-1" />
            Add Block
          </Button>
        </div>
      )}

      {/* Timeline */}
      {blocks.length > 0 && (
        <TimelineGrid
          blocks={blocks}
          onSelectBlock={openEdit}
          onSelectSlot={(time) => openAdd(time)}
        />
      )}

      {/* Sheet */}
      <BlockSheet
        open={sheetOpen}
        onClose={() => setSheetOpen(false)}
        block={selectedBlock}
        defaultStartTime={defaultStartTime}
        onSave={handleSave}
        onDelete={selectedBlock ? handleDelete : undefined}
      />
    </div>
  );
}

function sortByTime(a: TimeBlock, b: TimeBlock): number {
  return a.start_time.localeCompare(b.start_time);
}
