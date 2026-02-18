import { NextRequest } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { extractBillData } from '@/lib/claude';
import { errorResponse, successResponse } from '@/lib/utils';

// POST /api/bills/extract - Extract bill data from image without saving
// Accepts multipart/form-data with an 'image' file field
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return errorResponse('Unauthorized', 401);
    }

    const formData = await request.formData();
    const file = formData.get('image') as File | null;

    if (!file) {
      return errorResponse('image file is required', 400);
    }

    // Convert to base64
    const buffer = await file.arrayBuffer();
    const base64 = Buffer.from(buffer).toString('base64');
    const dataUrl = `data:${file.type};base64,${base64}`;

    const extracted = await extractBillData(dataUrl);

    return successResponse({ extracted });
  } catch (error: any) {
    console.error('Error extracting bill data:', error);
    return errorResponse(error.message || 'Failed to extract bill data', 500, error);
  }
}
