import { Bill, ListBillsResponse, CreateBillRequest, CreateBillResponse, UpdateBillRequest } from '../../shared/types';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000';

export class ApiClient {
  private token: string | null = null;

  setToken(token: string | null) {
    this.token = token;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...((options.headers as Record<string, string>) || {}),
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Request failed' }));
      throw new Error(error.error || error.message || 'Request failed');
    }

    return response.json();
  }

  // Bills endpoints
  async getBills(status?: 'paid' | 'unpaid'): Promise<ListBillsResponse> {
    const params = status ? `?status=${status}` : '';
    return this.request<ListBillsResponse>(`/api/bills${params}`);
  }

  async getBill(id: string): Promise<Bill> {
    return this.request<Bill>(`/api/bills/${id}`);
  }

  async createBill(data: CreateBillRequest): Promise<CreateBillResponse> {
    return this.request<CreateBillResponse>('/api/bills', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateBill(id: string, data: UpdateBillRequest): Promise<Bill> {
    return this.request<Bill>(`/api/bills/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async deleteBill(id: string): Promise<{ success: boolean }> {
    return this.request<{ success: boolean }>(`/api/bills/${id}`, {
      method: 'DELETE',
    });
  }

  async healthCheck(): Promise<{ status: string; timestamp: string }> {
    return this.request('/api/health');
  }

  // Notifications endpoints
  async registerPushToken(data: { token: string; device_id?: string }): Promise<{ success: boolean }> {
    return this.request('/api/notifications/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }
}

export const api = new ApiClient();
