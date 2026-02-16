import { NextRequest } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { sql } from '@/lib/db';
import { errorResponse, successResponse } from '@/lib/utils';

// POST /api/notifications/register - Register push token
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return errorResponse('Unauthorized', 401);
    }

    const body = await request.json();

    if (!body.token) {
      return errorResponse('token is required', 400);
    }

    // Upsert push token (insert or update if user already has one)
    const result = await sql`
      INSERT INTO push_tokens (user_id, token, updated_at)
      VALUES (${userId}, ${body.token}, NOW())
      ON CONFLICT (user_id)
      DO UPDATE SET
        token = ${body.token},
        updated_at = NOW()
      RETURNING *
    `;

    return successResponse({ success: true, push_token: result[0] });
  } catch (error: any) {
    console.error('Error registering push token:', error);
    return errorResponse(
      error.message || 'Failed to register push token',
      500,
      error
    );
  }
}
