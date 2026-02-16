/**
 * Shared TypeScript types for Bill Me app
 * Used by both mobile app and backend API
 */

export interface Bill {
  id: string;
  user_id: string;
  balance: number;
  minimum_due: number;
  due_date: string; // ISO date string
  image_url?: string;
  description?: string;
  status: 'unpaid' | 'paid';
  created_at: string;
  updated_at: string;
}

export interface CreateBillRequest {
  image_url: string;
  // Optional manual overrides if OCR fails
  balance?: number;
  minimum_due?: number;
  due_date?: string;
  description?: string;
}

export interface CreateBillResponse {
  bill: Bill;
  extracted_data: {
    balance: number;
    minimum_due: number;
    due_date: string;
    confidence: 'high' | 'medium' | 'low';
  };
}

export interface UpdateBillRequest {
  balance?: number;
  minimum_due?: number;
  due_date?: string;
  description?: string;
  status?: 'unpaid' | 'paid';
}

export interface ListBillsResponse {
  bills: Bill[];
  total: number;
}

export interface PushTokenRequest {
  token: string;
  device_id: string;
}

export interface ApiError {
  error: string;
  message?: string;
  details?: unknown;
}
