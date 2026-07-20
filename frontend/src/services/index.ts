import type { OrderSearchResponse } from '../types';

const apiBaseUrl = (
  import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3000/api'
).replace(/\/$/, '');

export class ApiError extends Error {
  readonly status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

export async function searchOrders(query: string, signal: AbortSignal) {
  const searchParams = new URLSearchParams({ query });
  const response = await fetch(`${apiBaseUrl}/orders/search?${searchParams}`, {
    signal,
  });

  if (!response.ok) {
    const body: unknown = await response.json().catch(() => null);
    const message =
      typeof body === 'object' &&
      body !== null &&
      'message' in body &&
      typeof body.message === 'string'
        ? body.message
        : 'دریافت اطلاعات سفارش با خطا روبه‌رو شد.';

    throw new ApiError(message, response.status);
  }

  return (await response.json()) as OrderSearchResponse;
}
