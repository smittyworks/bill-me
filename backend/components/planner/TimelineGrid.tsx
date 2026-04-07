'use client';

import { useEffect, useRef } from 'react';
import { TimeBlock } from '@shared/types';
import { formatTime, timeToMinutes } from '@/lib/time';
import { TimeBlockCard } from './TimeBlockCard';

const GRID_START_HOUR = 6;   // 6 AM
const GRID_END_HOUR = 24;    // midnight
const SLOT_HEIGHT_PX = 32;   // height per 30-minute slot

interface Props {
  blocks: TimeBlock[];
  onSelectBlock: (block: TimeBlock) => void;
  onSelectSlot: (time: string) => void;
}

export function TimelineGrid({ blocks, onSelectBlock, onSelectSlot }: Props) {
  const nowRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to current time on mount
  useEffect(() => {
    nowRef.current?.scrollIntoView({ block: 'center', behavior: 'smooth' });
  }, []);

  const gridStartMinutes = GRID_START_HOUR * 60;
  const totalSlots = (GRID_END_HOUR - GRID_START_HOUR) * 2; // 30-min slots

  function minutesToTop(minutes: number): number {
    return ((minutes - gridStartMinutes) / 30) * SLOT_HEIGHT_PX;
  }

  const now = new Date();
  const nowMinutes = now.getHours() * 60 + now.getMinutes();
  const nowTop = minutesToTop(nowMinutes);
  const isNowVisible = nowMinutes >= gridStartMinutes && nowMinutes <= GRID_END_HOUR * 60;

  const hours = Array.from(
    { length: GRID_END_HOUR - GRID_START_HOUR + 1 },
    (_, i) => GRID_START_HOUR + i
  );

  return (
    <div className="relative overflow-y-auto flex-1" style={{ maxHeight: 'calc(100vh - 200px)' }}>
      <div className="relative" style={{ height: totalSlots * SLOT_HEIGHT_PX }}>
        {/* Hour lines and labels */}
        {hours.map((hour) => {
          const top = minutesToTop(hour * 60);
          const label = `${String(hour % 12 || 12).padStart(2, ' ')}:00 ${hour < 12 ? 'AM' : 'PM'}`;
          return (
            <div key={hour} className="absolute left-0 right-0 flex items-start" style={{ top }}>
              <span className="w-16 pr-2 text-right text-xs text-muted-foreground leading-none select-none shrink-0">
                {label}
              </span>
              <div className="flex-1 border-t border-border" />
            </div>
          );
        })}

        {/* Half-hour lines (no label) */}
        {Array.from({ length: GRID_END_HOUR - GRID_START_HOUR }, (_, i) => {
          const top = minutesToTop((GRID_START_HOUR + i) * 60 + 30);
          return (
            <div key={`half-${i}`} className="absolute left-16 right-0 border-t border-border/30" style={{ top }} />
          );
        })}

        {/* Clickable slot areas (behind blocks) */}
        {Array.from({ length: totalSlots }, (_, i) => {
          const slotMinutes = gridStartMinutes + i * 30;
          const h = Math.floor(slotMinutes / 60);
          const m = slotMinutes % 60;
          const timeStr = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
          return (
            <div
              key={`slot-${i}`}
              className="absolute left-16 right-0 cursor-pointer hover:bg-accent/20 transition-colors"
              style={{ top: i * SLOT_HEIGHT_PX, height: SLOT_HEIGHT_PX }}
              onClick={() => onSelectSlot(timeStr)}
            />
          );
        })}

        {/* Current time indicator */}
        {isNowVisible && (
          <div
            ref={nowRef}
            className="absolute left-16 right-0 flex items-center pointer-events-none z-10"
            style={{ top: nowTop }}
          >
            <div className="w-2 h-2 rounded-full bg-red-500 -ml-1 shrink-0" />
            <div className="flex-1 border-t-2 border-red-500" />
          </div>
        )}

        {/* Time block cards */}
        {blocks.map((block) => {
          const blockMinutes = timeToMinutes(block.start_time);
          const top = minutesToTop(blockMinutes);
          const height = (block.duration_minutes / 30) * SLOT_HEIGHT_PX;
          return (
            <div
              key={block.id}
              className="absolute left-16 right-2 z-20"
              style={{ top: top + 1, height: height - 2 }}
            >
              <TimeBlockCard block={block} onSelect={onSelectBlock} />
            </div>
          );
        })}
      </div>
    </div>
  );
}
