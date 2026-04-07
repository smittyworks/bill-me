import { TimeBlockStatus } from '@shared/types';
import { cn } from '@/lib/utils';

const config: Record<TimeBlockStatus, { label: string; className: string }> = {
  pending: { label: 'Pending', className: 'bg-muted text-muted-foreground' },
  started: { label: 'Started', className: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' },
  completed: { label: 'Done', className: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' },
};

export function StatusBadge({ status }: { status: TimeBlockStatus }) {
  const { label, className } = config[status];
  return (
    <span className={cn('inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium', className)}>
      {label}
    </span>
  );
}
