import { NextResponse } from 'next/server';
import { ApiError } from '../../shared/types';

export function errorResponse(
  message: string,
  status: number = 500,
  details?: unknown
): NextResponse<ApiError> {
  return NextResponse.json(
    {
      error: message,
      message,
      details,
    },
    { status }
  );
}

export function successResponse<T>(data: T, status: number = 200): NextResponse<T> {
  return NextResponse.json(data, { status });
}
