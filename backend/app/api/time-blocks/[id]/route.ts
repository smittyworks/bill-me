import { NextRequest } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { sql } from '@/lib/db';
import { errorResponse, successResponse } from '@/lib/utils';
import { TimeBlock, UpdateTimeBlockRequest } from '@shared/types';

type RouteContext = {
  params: Promise<{ id: string }>;
};

// PATCH /api/time-blocks/:id — update a block
export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    const { userId } = await auth();
    if (!userId) return errorResponse('Unauthorized', 401);

    const { id } = await context.params;
    const body: UpdateTimeBlockRequest = await request.json();

    const current = await sql`
      SELECT * FROM time_blocks WHERE id = ${id} AND user_id = ${userId}
    `;
    if (current.length === 0) return errorResponse('Time block not found', 404);

    const c = current[0];
    const newLabel = body.label?.trim() ?? c.label;
    const newDescription = body.description !== undefined ? body.description : c.description;
    const newStatus = body.status ?? c.status;
    const newDurationMinutes = body.duration_minutes ?? c.duration_minutes;

    // Normalize start_time if provided
    let newStartTime = c.start_time;
    if (body.start_time) {
      newStartTime = body.start_time.length === 5 ? `${body.start_time}:00` : body.start_time;
    }

    const result = await sql`
      UPDATE time_blocks
      SET label = ${newLabel},
          description = ${newDescription},
          status = ${newStatus},
          start_time = ${newStartTime},
          duration_minutes = ${newDurationMinutes},
          updated_at = NOW()
      WHERE id = ${id} AND user_id = ${userId}
      RETURNING *
    `;

    return successResponse(result[0] as TimeBlock);
  } catch (error) {
    console.error('Error updating time block:', error);
    return errorResponse('Failed to update time block', 500, error);
  }
}

// DELETE /api/time-blocks/:id
export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    const { userId } = await auth();
    if (!userId) return errorResponse('Unauthorized', 401);

    const { id } = await context.params;

    const result = await sql`
      DELETE FROM time_blocks WHERE id = ${id} AND user_id = ${userId}
      RETURNING *
    `;

    if (result.length === 0) return errorResponse('Time block not found', 404);

    return successResponse({ success: true });
  } catch (error) {
    console.error('Error deleting time block:', error);
    return errorResponse('Failed to delete time block', 500, error);
  }
}
