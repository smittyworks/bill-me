import { auth } from '@clerk/nextjs/server';
import { sql } from '@/lib/db';
import { Bill } from '@shared/types';
import { notFound } from 'next/navigation';
import { BillDetail } from '@/components/bills/BillDetail';

export default async function BillPage({ params }: { params: Promise<{ id: string }> }) {
  const { userId } = await auth();
  const { id } = await params;

  const result = await sql`
    SELECT * FROM bills WHERE id = ${id} AND user_id = ${userId}
  `;

  if (result.length === 0) notFound();

  const bill = result[0] as Bill;

  return <BillDetail bill={bill} />;
}
