import { Button } from '@/components/ui/button';
import { Receipt } from 'lucide-react';
import Link from 'next/link';

export function EmptyState({ filter }: { filter: 'all' | 'unpaid' | 'paid' }) {
  const message =
    filter === 'paid'
      ? "No paid bills yet."
      : filter === 'unpaid'
      ? "No unpaid bills — you're all caught up!"
      : "No bills yet. Add your first one!";

  return (
    <div className="text-center py-16 space-y-4">
      <Receipt className="w-12 h-12 mx-auto text-muted-foreground/40" />
      <p className="text-muted-foreground">{message}</p>
      {filter !== 'paid' && (
        <Button asChild variant="outline">
          <Link href="/bills/new">Add a bill</Link>
        </Button>
      )}
    </div>
  );
}
