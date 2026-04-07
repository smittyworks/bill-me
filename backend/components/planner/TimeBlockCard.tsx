import { TimeBlock } from '@shared/types';
import { formatTime, formatDuration, addMinutes } from '@/lib/time';
import { blockColorClasses } from '@/lib/blockColors';
import { StatusBadge } from './StatusBadge';
import { cn } from '@/lib/utils';

const statusBorderColor = {
  pending: 'border-l-foreground/20',
  started: 'border-l-blue-500',
  completed: 'border-l-green-500',
};

interface Props {
  block: TimeBlock;
  onSelect: (block: TimeBlock) => void;
}

export function TimeBlockCard({ block, onSelect }: Props) {
  const endTime = addMinutes(block.start_time, block.duration_minutes);
  const colors = blockColorClasses[block.color] ?? blockColorClasses['sky'];

  return (
    <button
      onClick={() => onSelect(block)}
      className={cn(
        'w-full h-full text-left border border-l-4 rounded-md px-3 py-1.5 shadow-xs overflow-hidden',
        'active:scale-[0.99] transition-all',
        colors.bg,
        colors.border,
        statusBorderColor[block.status]
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <span className="font-medium text-sm leading-snug truncate">{block.label}</span>
        <StatusBadge status={block.status} />
      </div>
      <div className="text-xs text-muted-foreground mt-0.5">
        {formatTime(block.start_time)} – {formatTime(endTime)} · {formatDuration(block.duration_minutes)}
      </div>
      {block.description && (
        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{block.description}</p>
      )}
    </button>
  );
}
