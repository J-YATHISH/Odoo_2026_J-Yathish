// In-memory token storage (never localStorage/sessionStorage)
let inMemoryToken: string | null = null;

export const setClientToken = (token: string | null) => {
  inMemoryToken = token;
};

export const getClientToken = () => inMemoryToken;

export interface APIErrorDetail {
  message: string;
  code?: string;
}

export interface APIErrorResponse {
  error: APIErrorDetail;
}

export class APIException extends Error {
  public readonly status: number;
  public readonly code?: string;

  constructor(message: string, status: number, code?: string) {
    super(message);
    this.name = 'APIException';
    this.status = status;
    this.code = code;
    // Set prototype explicitly to support proper inheritance checks
    Object.setPrototypeOf(this, APIException.prototype);
  }
}

/**
 * Standard HTTP Request Wrapper for the AssetFlow Backend API
 */
export async function apiFetch<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;
  if (!apiBaseUrl) {
    throw new Error('Environment variable VITE_API_BASE_URL is not set.');
  }

  // Normalize path combination
  const cleanBase = apiBaseUrl.endsWith('/') ? apiBaseUrl.slice(0, -1) : apiBaseUrl;
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  const url = `${cleanBase}${cleanEndpoint}`;

  const headers = new Headers(options.headers);
  if (!headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  if (inMemoryToken) {
    headers.set('Authorization', `Bearer ${inMemoryToken}`);
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let errorJson: APIErrorResponse | null = null;
    try {
      errorJson = (await response.json()) as APIErrorResponse;
    } catch {
      // Response was not JSON, we will fallback to status-based message
    }

    const errMsg = errorJson?.error?.message ?? `Request failed with status ${response.status}`;
    const errCode = errorJson?.error?.code;

    throw new APIException(errMsg, response.status, errCode);
  }

  if (response.status === 204) {
    return {} as T;
  }

  return response.json() as Promise<T>;
}
