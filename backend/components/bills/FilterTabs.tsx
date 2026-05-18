'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

type FilterStatus = 'all' | 'unpaid' | 'paid';

export function FilterTabs({ currentFilter }: { currentFilter: FilterStatus }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [loadingFilter, setLoadingFilter] = useState<FilterStatus | null>(null);

  const handleClick = (f: FilterStatus) => {
    if (f === currentFilter || isPending) return;
    setLoadingFilter(f);
    const href = f === 'unpaid' ? '/dashboard' : `/dashboard?status=${f}`;
    startTransition(() => {
      router.push(href);
    });
  };

  return (
    <div className="flex gap-2">
      {(['all', 'unpaid', 'paid'] as const).map((f) => (
        <Button
          key={f}
          variant={currentFilter === f ? 'default' : 'outline'}
          size="sm"
          disabled={isPending}
          onClick={() => handleClick(f)}
          className="cursor-pointer"
        >
          {isPending && loadingFilter === f && (
            <Loader2 className="w-3 h-3 animate-spin" />
          )}
          {f.charAt(0).toUpperCase() + f.slice(1)}
        </Button>
      ))}
    </div>
  );
}
