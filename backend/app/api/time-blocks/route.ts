import { NextRequest } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { sql } from '@/lib/db';
import { errorResponse, successResponse } from '@/lib/utils';
import { TimeBlock, ListTimeBlocksResponse, CreateTimeBlockRequest } from '@shared/types';

// GET /api/time-blocks?date=YYYY-MM-DD — defaults to today
export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) return errorResponse('Unauthorized', 401);

    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date') ?? new Date().toISOString().split('T')[0];

    const result = await sql`
      SELECT * FROM time_blocks
      WHERE user_id = ${userId} AND date = ${date}
      ORDER BY start_time ASC
    `;

    const response: ListTimeBlocksResponse = {
      time_blocks: result as TimeBlock[],
      date,
    };

    return successResponse(response);
  } catch (error) {
    console.error('Error fetching time blocks:', error);
    return errorResponse('Failed to fetch time blocks', 500, error);
  }
}

// POST /api/time-blocks — create a new block
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) return errorResponse('Unauthorized', 401);

    const body: CreateTimeBlockRequest = await request.json();

    if (!body.label?.trim()) return errorResponse('label is required', 400);
    if (!body.date) return errorResponse('date is required', 400);
    if (!body.start_time) return errorResponse('start_time is required', 400);
    if (!body.duration_minutes || body.duration_minutes % 30 !== 0) {
      return errorResponse('duration_minutes must be a positive multiple of 30', 400);
    }

    // Normalize "HH:MM" → "HH:MM:00" for Postgres TIME column
    const startTime = body.start_time.length === 5 ? `${body.start_time}:00` : body.start_time;

    const color = body.color ?? 'sky';

    const result = await sql`
      INSERT INTO time_blocks (user_id, date, start_time, duration_minutes, label, description, status, color)
      VALUES (${userId}, ${body.date}, ${startTime}, ${body.duration_minutes}, ${body.label.trim()}, ${body.description ?? null}, 'pending', ${color})
      RETURNING *
    `;

    return successResponse(result[0] as TimeBlock, 201);
  } catch (error) {
    console.error('Error creating time block:', error);
    return errorResponse('Failed to create time block', 500, error);
  }
}
