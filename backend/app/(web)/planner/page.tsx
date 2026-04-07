import { auth } from '@clerk/nextjs/server';
import { sql } from '@/lib/db';
import { TimeBlock } from '@shared/types';
import { PlannerView } from '@/components/planner/PlannerView';
import { todayLocalDate } from '@/lib/time';

export default async function PlannerPage() {
  const { userId } = await auth();
  const date = todayLocalDate();

  const result = await sql`
    SELECT * FROM time_blocks
    WHERE user_id = ${userId} AND date = ${date}
    ORDER BY start_time ASC
  `;

  const blocks = result as TimeBlock[];

  const displayDate = new Date(date + 'T00:00:00').toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });

  return <PlannerView initialBlocks={blocks} date={date} displayDate={displayDate} />;
}
