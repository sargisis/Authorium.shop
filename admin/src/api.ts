const getApiBase = () => {
  if (typeof window !== 'undefined') {
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
      return 'http://localhost:8080/api/v1';
    }
  }
  if (import.meta.env.VITE_API_URL) return import.meta.env.VITE_API_URL;
  return 'https://api.authorium.store/api/v1';
};

const API_BASE = getApiBase();

let authToken: string | null = localStorage.getItem('admin_token');

export function setToken(t: string | null) {
  authToken = t;
  if (t) localStorage.setItem('admin_token', t);
  else localStorage.removeItem('admin_token');
}
export function getToken() { return authToken; }

async function request<T>(path: string, opts: RequestInit = {}): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...opts,
    headers: {
      'Content-Type': 'application/json',
      ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
      ...(opts.headers || {}),
    },
  });
  if (!res.ok) {
    if (res.status === 401 && path !== '/auth/login') {
      setToken(null);
    }
    const raw = await res.text();
    let message = raw;
    try {
      const parsed = JSON.parse(raw);
      if (parsed.error) message = parsed.error;
      else if (parsed.message) message = parsed.message;
    } catch {}
    throw new Error(message || res.statusText);
  }
  // For DELETE / 204 No Content / empty responses
  const contentType = res.headers.get('content-type') || '';
  if (res.status === 204 || !contentType.includes('application/json')) {
    return undefined as T;
  }
  return res.json();
}

// ── Auth ────────────────────────────────────────────────────────────────────
export const login = (login: string, password: string) =>
  request<{ access_token: string; user: AdminUser }>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ login, password }),
  });

export const getMe = () => request<AdminUser>('/me');

// ── Books ────────────────────────────────────────────────────────────────────
export const getBooks = (params?: Record<string, string>) => {
  const qs = params ? '?' + new URLSearchParams(params).toString() : '';
  return request<Book[]>(`/admin/books${qs}`);
};
export const getBook = (id: number) => request<Book>(`/admin/books/${id}`);
export const createBook = (body: Partial<Book>) =>
  request<Book>('/admin/books', { method: 'POST', body: JSON.stringify(body) });
export const updateBook = (id: number, body: Partial<Book>) =>
  request<Book>(`/admin/books/${id}`, { method: 'PUT', body: JSON.stringify(body) });
export const deleteBook = (id: number) =>
  request<void>(`/admin/books/${id}`, { method: 'DELETE' });

// ── Stats ────────────────────────────────────────────────────────────────────
export const getSummary = () => request<StatsSummary>('/stats/summary');
export const getSalesChart = (from: string, to: string, group: 'day' | 'month') =>
  request<SalesPoint[]>(`/stats/sales?from=${from}&to=${to}&group=${group}`);
export const getTopBooks = (from: string, to: string, limit = 5) =>
  request<TopBook[]>(`/stats/top-books?from=${from}&to=${to}&limit=${limit}`);

// ── Orders ───────────────────────────────────────────────────────────────────
export const getOrders = (params?: Record<string, string>) => {
  const qs = params ? '?' + new URLSearchParams(params).toString() : '';
  return request<Order[]>(`/admin/orders${qs}`);
};

// ── Audit Log ────────────────────────────────────────────────────────────────
export const getAuditLog = (params?: Record<string, string>) => {
  const qs = params ? '?' + new URLSearchParams(params).toString() : '';
  return request<AuditEntry[]>(`/admin/audit-log${qs}`);
};

export const changePassword = (current_password: string, new_password: string) =>
  request<{ message: string }>('/admin/me/password', {
    method: 'PUT',
    body: JSON.stringify({ current_password, new_password }),
  });

// ── Users (owner only) ───────────────────────────────────────────────────────
export const getUsers = () => request<AdminUser[]>('/admin/users');
export const createUser = (body: { login: string; password: string; role: string; telegram_id?: number }) =>
  request<AdminUser>('/admin/users', { method: 'POST', body: JSON.stringify(body) });
export const updateUser = (id: number, body: Partial<AdminUser>) =>
  request<AdminUser>(`/admin/users/${id}`, { method: 'PUT', body: JSON.stringify(body) });
export const deleteUser = (id: number) =>
  request<void>(`/admin/users/${id}`, { method: 'DELETE' });

// ── Types ────────────────────────────────────────────────────────────────────
export interface AdminUser {
  id: number;
  login: string;
  role: 'owner' | 'admin';
  telegram_id?: number;
  created_at: string;
}
export interface Book {
  id: number;
  title: string;
  author: string;
  description?: string;
  price: number;
  cover_url?: string;
  file_url?: string;
  active: boolean;
  created_at: string;
  updated_at: string;
}
export interface StatsSummary {
  revenue: number;
  orders_count: number;
  avg_order_value: number;
  books_count: number;
}
export interface SalesPoint {
  date: string;
  revenue: number;
  orders_count: number;
}
export interface TopBook {
  book_id: number;
  title: string;
  revenue: number;
  sales_count: number;
}
export interface Order {
  id: number;
  buyer_telegram_id: number;
  total: number;
  status: string;
  items_summary?: string;
  created_at: string;
}
export interface AuditEntry {
  id: number;
  user_id?: number;
  action: string;
  entity: string;
  entity_id?: number;
  details?: string;
  created_at: string;
}
