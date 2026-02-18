import { NextRequest } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { sql } from '@/lib/db';
import { errorResponse, successResponse } from '@/lib/utils';
import { Bill, UpdateBillRequest } from '@shared/types';

type RouteContext = {
  params: Promise<{ id: string }>;
};

// GET /api/bills/:id - Get single bill
export async function GET(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return errorResponse('Unauthorized', 401);
    }

    const { id } = await context.params;

    const result = await sql`
      SELECT * FROM bills WHERE id = ${id} AND user_id = ${userId}
    `;

    if (result.length === 0) {
      return errorResponse('Bill not found', 404);
    }

    return successResponse(result[0] as Bill);
  } catch (error) {
    console.error('Error fetching bill:', error);
    return errorResponse('Failed to fetch bill', 500, error);
  }
}

// PATCH /api/bills/:id - Update bill
export async function PATCH(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return errorResponse('Unauthorized', 401);
    }

    const { id } = await context.params;
    const body: UpdateBillRequest = await request.json();

    // Build dynamic update
    if (!body.balance && !body.minimum_due && !body.due_date && !body.description && body.status === undefined) {
      return errorResponse('No fields to update', 400);
    }

    // Use current values if not provided
    const currentBill = await sql`SELECT * FROM bills WHERE id = ${id} AND user_id = ${userId}`;
    if (currentBill.length === 0) {
      return errorResponse('Bill not found', 404);
    }

    const current = currentBill[0];
    const newBalance = body.balance ?? current.balance;
    const newMinimumDue = body.minimum_due ?? current.minimum_due;
    const newDueDate = body.due_date ?? current.due_date;
    const newDescription = body.description ?? current.description;
    const newStatus = body.status ?? current.status;

    const result = await sql`
      UPDATE bills
      SET balance = ${newBalance},
          minimum_due = ${newMinimumDue},
          due_date = ${newDueDate},
          description = ${newDescription},
          status = ${newStatus},
          updated_at = NOW()
      WHERE id = ${id} AND user_id = ${userId}
      RETURNING *
    `;

    if (result.length === 0) {
      return errorResponse('Bill not found', 404);
    }

    return successResponse(result[0] as Bill);
  } catch (error) {
    console.error('Error updating bill:', error);
    return errorResponse('Failed to update bill', 500, error);
  }
}

// DELETE /api/bills/:id - Delete bill
export async function DELETE(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return errorResponse('Unauthorized', 401);
    }

    const { id } = await context.params;

    const result = await sql`
      DELETE FROM bills WHERE id = ${id} AND user_id = ${userId}
      RETURNING *
    `;

    if (result.length === 0) {
      return errorResponse('Bill not found', 404);
    }

    return successResponse({ success: true });
  } catch (error) {
    console.error('Error deleting bill:', error);
    return errorResponse('Failed to delete bill', 500, error);
  }
}
