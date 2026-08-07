/**
 * Thin fetch wrapper around the backend REST API.
 * In dev, Vite proxies /api and /uploads to the FastAPI server (see vite.config.ts).
 * In production, set VITE_API_BASE_URL to the deployed backend URL.
 */
const BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

function getToken(): string | null {
  return localStorage.getItem('admin_token');
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const headers: Record<string, string> = {
    ...(options.body && !(options.body instanceof FormData) ? { 'Content-Type': 'application/json' } : {}),
    ...(options.headers as Record<string, string> | undefined),
  };
  const token = getToken();
  if (token && path.startsWith('/api/') && (path.includes('admin') || options.method !== 'GET')) {
    // attach token when available; protected endpoints will 401 if missing/invalid anyway
    headers['Authorization'] = `Bearer ${token}`;
  } else if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${BASE_URL}${path}`, { ...options, headers });
  if (!res.ok) {
    let detail = `Request failed: ${res.status}`;
    try {
      const data = await res.json();
      detail = data.detail || detail;
    } catch {
      /* ignore */
    }
    throw new Error(typeof detail === 'string' ? detail : JSON.stringify(detail));
  }
  if (res.status === 204) return undefined as unknown as T;
  return res.json();
}

export const api = {
  get: <T,>(path: string) => request<T>(path, { method: 'GET' }),
  post: <T,>(path: string, body?: unknown) =>
    request<T>(path, { method: 'POST', body: body ? JSON.stringify(body) : undefined }),
  put: <T,>(path: string, body?: unknown) =>
    request<T>(path, { method: 'PUT', body: body ? JSON.stringify(body) : undefined }),
  patch: <T,>(path: string, body?: unknown) =>
    request<T>(path, { method: 'PATCH', body: body ? JSON.stringify(body) : undefined }),
  delete: <T,>(path: string) => request<T>(path, { method: 'DELETE' }),
  upload: <T,>(path: string, formData: FormData) => request<T>(path, { method: 'POST', body: formData }),
};

export function imageUrl(path: string | null | undefined): string {
  if (!path) return 'https://placehold.co/800x1000/e5e5e0/999?text=No+Image';
  if (path.startsWith('http')) return path;
  return `${BASE_URL}${path}`;
}
