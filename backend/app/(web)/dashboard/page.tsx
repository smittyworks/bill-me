import { auth } from '@clerk/nextjs/server';
import { sql } from '@/lib/db';
import { Bill } from '@shared/types';
import { BillCard } from '@/components/bills/BillCard';
import { EmptyState } from '@/components/bills/EmptyState';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { Plus } from 'lucide-react';

type FilterStatus = 'all' | 'unpaid' | 'paid';

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { userId } = await auth();
  const { status } = await searchParams;
  const filter = (status === 'paid' || status === 'unpaid' ? status : 'all') as FilterStatus;

  let bills: Bill[];
  if (filter === 'paid' || filter === 'unpaid') {
    const result = await sql`
      SELECT * FROM bills WHERE user_id = ${userId} AND status = ${filter}
      ORDER BY due_date ASC
    `;
    bills = result as Bill[];
  } else {
    const result = await sql`
      SELECT * FROM bills WHERE user_id = ${userId}
      ORDER BY due_date ASC
    `;
    bills = result as Bill[];
  }

  const unpaidTotal = bills
    .filter(b => b.status === 'unpaid')
    .reduce((sum, b) => sum + Number(b.minimum_due ?? 0), 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Bills</h1>
          {unpaidTotal > 0 && (
            <p className="text-sm text-muted-foreground mt-0.5">
              ${unpaidTotal.toFixed(2)} minimum due across {bills.filter(b => b.status === 'unpaid').length} unpaid bill{bills.filter(b => b.status === 'unpaid').length !== 1 ? 's' : ''}
            </p>
          )}
        </div>
        <Button asChild>
          <Link href="/bills/new">
            <Plus className="w-4 h-4 mr-1" />
            Add Bill
          </Link>
        </Button>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2">
        {(['all', 'unpaid', 'paid'] as const).map((f) => (
          <Button
            key={f}
            variant={filter === f ? 'default' : 'outline'}
            size="sm"
            asChild
          >
            <Link href={f === 'all' ? '/dashboard' : `/dashboard?status=${f}`}>
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </Link>
          </Button>
        ))}
      </div>

      {/* Bill list */}
      {bills.length === 0 ? (
        <EmptyState filter={filter} />
      ) : (
        <div className="space-y-3">
          {bills.map((bill) => (
            <BillCard key={bill.id} bill={bill} />
          ))}
        </div>
      )}
    </div>
  );
}
