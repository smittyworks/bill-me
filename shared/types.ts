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

// --- Time Blocks ---

export type TimeBlockStatus = 'pending' | 'started' | 'completed';

export interface TimeBlock {
  id: string;
  user_id: string;
  date: string;             // ISO date string, e.g. "2026-04-07"
  start_time: string;       // "HH:MM:SS" as returned by Postgres TIME column
  duration_minutes: number; // multiples of 30
  label: string;
  description?: string;
  status: TimeBlockStatus;
  color: string;            // palette key, e.g. "sky"
  created_at: string;
  updated_at: string;
}

export interface CreateTimeBlockRequest {
  date: string;             // ISO date string
  start_time: string;       // "HH:MM" (24-hour) — API normalizes to "HH:MM:SS"
  duration_minutes: number;
  label: string;
  description?: string;
  color?: string;
}

export interface UpdateTimeBlockRequest {
  start_time?: string;
  duration_minutes?: number;
  label?: string;
  description?: string;
  status?: TimeBlockStatus;
}

export interface ListTimeBlocksResponse {
  time_blocks: TimeBlock[];
  date: string;
}
