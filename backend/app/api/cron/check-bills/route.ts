import { NextRequest } from 'next/server';
import { sql } from '@/lib/db';
import { sendBillReminders, BillReminder } from '@/lib/notifications';
import { errorResponse, successResponse } from '@/lib/utils';

// This endpoint will be called by Vercel Cron daily
// For now, you can also call it manually for testing
export async function GET(request: NextRequest) {
  try {
    // Optional: Add authorization check for cron jobs
    // const authHeader = request.headers.get('authorization');
    // if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    //   return errorResponse('Unauthorized', 401);
    // }

    // Find all unpaid bills due in exactly 5 days
    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() + 5);
    const targetDateStr = targetDate.toISOString().split('T')[0]; // YYYY-MM-DD

    console.log(`Checking for bills due on ${targetDateStr}...`);

    // Query bills and join with push tokens
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
      INNER JOIN push_tokens p ON b.user_id = p.user_id
      WHERE b.due_date = ${targetDateStr}
        AND b.status = 'unpaid'
    `;

    console.log(`Found ${result.length} bills due in 5 days`);

    if (result.length === 0) {
      return successResponse({
        message: 'No bills due in 5 days',
        count: 0,
      });
    }

    // Prepare reminders
    const reminders: BillReminder[] = result.map((bill: any) => ({
      userId: bill.user_id,
      pushToken: bill.push_token,
      billDescription: bill.description || 'Bill',
      balance: parseFloat(bill.balance),
      minimumDue: parseFloat(bill.minimum_due),
      dueDate: bill.due_date,
      daysUntilDue: 5,
    }));

    // Send notifications
    await sendBillReminders(reminders);

    return successResponse({
      message: 'Reminders sent',
      count: reminders.length,
      bills: reminders.map(r => ({
        description: r.billDescription,
        balance: r.balance,
        dueDate: r.dueDate,
      })),
    });
  } catch (error: any) {
    console.error('Error checking bills:', error);
    return errorResponse(
      error.message || 'Failed to check bills',
      500,
      error
    );
  }
}
