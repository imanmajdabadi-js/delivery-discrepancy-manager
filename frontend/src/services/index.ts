import type {
  ApiErrorPayload,
  CaseDetailsResponse,
  CaseListResponse,
  CaseStatsResponse,
  CaseStatus,
  CreateCaseRequest,
  CreateCaseResponse,
  OrderSearchResponse,
  SubmitCaseDecisionRequest,
  SubmitCaseDecisionResponse,
} from '../types';

const apiBaseUrl = (
  import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3000/api'
).replace(/\/$/, '');

export class ApiError extends Error {
  readonly status: number;
  readonly payload: ApiErrorPayload | null;

  constructor(
    message: string,
    status: number,
    payload: ApiErrorPayload | null,
  ) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.payload = payload;
  }
}

async function parseErrorResponse(response: Response, fallbackMessage: string) {
  const body: unknown = await response.json().catch(() => null);
  const payload =
    typeof body === 'object' && body !== null
      ? (body as ApiErrorPayload)
      : null;
  const message =
    payload && typeof payload.message === 'string'
      ? payload.message
      : fallbackMessage;

  return new ApiError(message, response.status, payload);
}

function getAuthHeaders(): HeadersInit {
  const token = localStorage.getItem('auth_token');

  if (!token) {
    return { 'Content-Type': 'application/json' };
  }

  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  };
}

export async function searchOrders(query: string, signal: AbortSignal) {
  const searchParams = new URLSearchParams({ query });
  const response = await fetch(`${apiBaseUrl}/orders/search?${searchParams}`, {
    headers: getAuthHeaders(),
    signal,
  });

  if (!response.ok) {
    throw await parseErrorResponse(
      response,
      'دریافت اطلاعات سفارش با خطا روبه‌رو شد.',
    );
  }

  return (await response.json()) as OrderSearchResponse;
}

export async function createCase(request: CreateCaseRequest) {
  const response = await fetch(`${apiBaseUrl}/cases`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    throw await parseErrorResponse(
      response,
      'ثبت پرونده با خطا روبه‌رو شد. اطلاعات واردشده حفظ شده است.',
    );
  }

  return (await response.json()) as CreateCaseResponse;
}

export async function getCaseDetails(caseId: string, signal: AbortSignal) {
  const response = await fetch(`${apiBaseUrl}/cases/${caseId}`, {
    headers: getAuthHeaders(),
    signal,
  });

  if (!response.ok) {
    throw await parseErrorResponse(
      response,
      'دریافت اطلاعات پرونده با خطا روبه‌رو شد.',
    );
  }

  return (await response.json()) as CaseDetailsResponse;
}

export async function submitCaseDecision(
  caseId: string,
  request: SubmitCaseDecisionRequest,
) {
  const response = await fetch(`${apiBaseUrl}/cases/${caseId}/decision`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    throw await parseErrorResponse(
      response,
      'ثبت تصمیم با خطا روبه‌رو شد. توضیح واردشده حفظ شده است.',
    );
  }

  return (await response.json()) as SubmitCaseDecisionResponse;
}

export async function getCaseStats(signal?: AbortSignal) {
  const response = await fetch(`${apiBaseUrl}/cases/stats`, {
    headers: getAuthHeaders(),
    signal,
  });

  if (!response.ok) {
    throw await parseErrorResponse(
      response,
      'دریافت آمار پرونده‌ها با خطا روبه‌رو شد.',
    );
  }

  return (await response.json()) as CaseStatsResponse;
}

export async function getCases(
  query: string,
  status: CaseStatus | null,
  signal: AbortSignal,
) {
  const searchParams = new URLSearchParams();

  if (query) {
    searchParams.set('query', query);
  }

  if (status) {
    searchParams.set('status', status);
  }

  const queryString = searchParams.toString();
  const response = await fetch(
    `${apiBaseUrl}/cases${queryString ? `?${queryString}` : ''}`,
    {
      headers: getAuthHeaders(),
      signal,
    },
  );

  if (!response.ok) {
    throw await parseErrorResponse(
      response,
      'دریافت فهرست پرونده‌ها با خطا روبه‌رو شد.',
    );
  }

  return (await response.json()) as CaseListResponse;
}
