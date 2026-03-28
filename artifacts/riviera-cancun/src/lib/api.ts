/**
 * Builds the full URL for a relative API path.
 *
 * In development, Vite proxies /api → localhost:8080, so we return the path as-is.
 * In production (Vercel), VITE_API_URL points to the backend on Railway/Render.
 *
 * Usage: apiFetch('/api/admin/login', { method: 'POST', ... })
 */
const API_BASE = (import.meta.env.VITE_API_URL as string | undefined)?.replace(/\/$/, '') ?? '';

export function apiUrl(path: string): string {
  return API_BASE ? `${API_BASE}${path}` : path;
}

export async function apiFetch(path: string, init?: RequestInit): Promise<Response> {
  return fetch(apiUrl(path), init);
}
