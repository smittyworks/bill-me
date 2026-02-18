import { NextRequest } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { sql } from '@/lib/db';
import { errorResponse, successResponse } from '@/lib/utils';
import { extractBillData } from '@/lib/claude';
import { Bill, ListBillsResponse, CreateBillResponse } from '@shared/types';

// GET /api/bills - List all bills for authenticated user
export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return errorResponse('Unauthorized', 401);
    }

    // Get query params for filtering
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status'); // 'paid' | 'unpaid' | null (all)

    // Build and execute query
    let result;
    if (status === 'paid' || status === 'unpaid') {
      result = await sql`
        SELECT * FROM bills
        WHERE user_id = ${userId} AND status = ${status}
        ORDER BY due_date DESC
      `;
    } else {
      result = await sql`
        SELECT * FROM bills
        WHERE user_id = ${userId}
        ORDER BY due_date DESC
      `;
    }

    const response: ListBillsResponse = {
      bills: result as Bill[],
      total: result.length,
    };

    return successResponse(response);
  } catch (error) {
    console.error('Error fetching bills:', error);
    return errorResponse('Failed to fetch bills', 500, error);
  }
}

// POST /api/bills - Create a new bill
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return errorResponse('Unauthorized', 401);
    }

    const body = await request.json();

    // If values are already provided (web flow), use them directly.
    // Otherwise fall back to Claude extraction from image_url (mobile flow).
    let balance = body.balance;
    let minimumDue = body.minimum_due;
    let dueDate = body.due_date;
    let description = body.description;

    if (balance == null || dueDate == null) {
      if (!body.image_url) {
        return errorResponse('image_url is required when bill fields are not provided', 400);
      }
      console.log('Extracting bill data from image...');
      const extracted = await extractBillData(body.image_url);
      balance = body.balance ?? extracted.balance;
      minimumDue = body.minimum_due ?? extracted.minimum_due;
      dueDate = body.due_date ?? extracted.due_date;
      description = body.description ?? extracted.description;
    }

    // Save to database (image_url is nullable — not stored for web-created bills)
    const result = await sql`
      INSERT INTO bills (user_id, balance, minimum_due, due_date, description, image_url, status)
      VALUES (${userId}, ${balance}, ${minimumDue}, ${dueDate}, ${description}, ${body.image_url ?? null}, 'unpaid')
      RETURNING *
    `;

    const response: CreateBillResponse = {
      bill: result[0] as Bill,
      extracted_data: {
        balance,
        minimum_due: minimumDue,
        due_date: dueDate,
        confidence: 'high',
      },
    };

    return successResponse(response, 201);
  } catch (error: any) {
    console.error('Error creating bill:', error);
    return errorResponse(
      error.message || 'Failed to create bill',
      500,
      error
    );
  }
}
