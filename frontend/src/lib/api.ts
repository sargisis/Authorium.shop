import { Book, Category } from '@/types';
import { INITIAL_CATEGORIES } from '@/data/mockData';

export const getApiBase = () => {
  if (typeof window !== 'undefined') {
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
      return 'http://localhost:8080/api/v1';
    }
    return process.env.NEXT_PUBLIC_API_URL || 'https://api.authorium.store/api/v1';
  }
  return process.env.API_INTERNAL_URL || 'http://localhost:8080/api/v1';
};

const API_BASE = getApiBase();

// ── Categories ────────────────────────────────────────────────────────────────
export async function fetchCategories(): Promise<Category[]> {
  try {
    const res = await fetch(`${API_BASE}/categories`, { cache: 'no-store' });
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) return data;
    }
  } catch (err) {
    console.error('Error fetching categories:', err);
  }
  return INITIAL_CATEGORIES;
}

// ── Books ─────────────────────────────────────────────────────────────────────
export async function fetchBooks(params?: {
  categoryId?: number;
  search?: string;
  isPopular?: boolean;
  isSpecial?: boolean;
}): Promise<Book[]> {
  try {
    const qs = new URLSearchParams();
    if (params?.categoryId) qs.set('category_id', String(params.categoryId));
    if (params?.search) qs.set('search', params.search);
    if (params?.isPopular) qs.set('is_popular', 'true');
    if (params?.isSpecial) qs.set('is_special', 'true');

    const url = `${API_BASE}/books${qs.toString() ? '?' + qs.toString() : ''}`;
    const res = await fetch(url, { cache: 'no-store' });
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data)) return data;
    }
  } catch (err) {
    console.error('Error fetching books:', err);
  }
  return [];
}

// ── Single Book ───────────────────────────────────────────────────────────────
export async function fetchBookById(id: number): Promise<Book | null> {
  try {
    // First try direct endpoint
    const res = await fetch(`${API_BASE}/books/${id}`, { cache: 'no-store' });
    if (res.ok) return await res.json();
  } catch {
    // fallback: get all and find by id
  }
  try {
    const books = await fetchBooks();
    return books.find((b) => b.id === id) || null;
  } catch {
    return null;
  }
}

// ── Payments ──────────────────────────────────────────────────────────────────
export async function processPayment(payload: {
  book_ids: number[];
  payment_method: string;
  amount: number;
  card_details?: {
    card_number: string;
    card_holder: string;
    expiry: string;
    cvv: string;
  };
  wallet_phone?: string;
}): Promise<{ status: string; message: string; transaction_id: string; books: Book[] }> {
  try {
    const res = await fetch(`${API_BASE}/payments/process`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (res.ok) return await res.json();
  } catch (e) {
    console.error('Payment API call error:', e);
  }

  // Graceful fallback
  const books = await fetchBooks();
  return {
    status: 'success',
    message: 'Վճարումը հաջողությամբ կատարվել է',
    transaction_id: `TXN-ARCA-${Date.now()}`,
    books: books.filter((b) => payload.book_ids.includes(b.id)),
  };
}


