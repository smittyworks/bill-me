import { NextRequest } from 'next/server';
import { sql } from '@/lib/db';
import { sendBillReminders, sendSlackReminders, BillReminder } from '@/lib/notifications';
import { errorResponse, successResponse } from '@/lib/utils';

// Called by Vercel Cron daily (see vercel.json), or manually for testing.
// Notifies for all unpaid bills due within the next 5 days OR up to 5 days overdue.
export async function GET(request: NextRequest) {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const result = await sql`
      SELECT
        b.id,
        b.user_id,
        b.balance,
        b.minimum_due,
        b.due_date,
        b.description,
        p.token as push_token
      FROM bills b
      LEFT JOIN push_tokens p ON b.user_id = p.user_id
      WHERE b.due_date BETWEEN (CURRENT_DATE - INTERVAL '5 days') AND (CURRENT_DATE + INTERVAL '5 days')
        AND b.status = 'unpaid'
      ORDER BY b.due_date ASC
    `;

    console.log(`Found ${result.length} unpaid bills in the notification window`);

    if (result.length === 0) {
      return successResponse({ message: 'No bills in notification window', count: 0 });
    }

    const reminders: BillReminder[] = result.map((bill: any) => {
      const due = new Date(bill.due_date);
      due.setHours(0, 0, 0, 0);
      const daysUntilDue = Math.round((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      return {
        userId: bill.user_id,
        pushToken: bill.push_token || '',
        billDescription: bill.description || 'Bill',
        balance: parseFloat(bill.balance),
        minimumDue: parseFloat(bill.minimum_due),
        dueDate: bill.due_date,
        daysUntilDue,
      };
    });

    await Promise.all([
      sendBillReminders(reminders),
      sendSlackReminders(reminders),
    ]);

    return successResponse({
      message: 'Reminders sent',
      count: reminders.length,
      bills: reminders.map(r => ({
        description: r.billDescription,
        balance: r.balance,
        dueDate: r.dueDate,
        daysUntilDue: r.daysUntilDue,
      })),
    });
  } catch (error: any) {
    console.error('Error checking bills:', error);
    return errorResponse(error.message || 'Failed to check bills', 500, error);
  }
}
