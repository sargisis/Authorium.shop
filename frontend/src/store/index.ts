import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Book, CartItem } from '@/types';

interface CartStore {
  items: CartItem[];
  addToCart: (book: Book) => void;
  removeFromCart: (bookId: number) => void;
  updateQuantity: (bookId: number, delta: number) => void;
  clearCart: () => void;
  getTotalAmount: () => number;
  getTotalCount: () => number;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      addToCart: (book: Book) => {
        const currentItems = get().items;
        const existing = currentItems.find((i) => i.book.id === book.id);
        if (!existing) {
          set({ items: [...currentItems, { book, quantity: 1 }] });
        }
      },
      removeFromCart: (bookId: number) => {
        set({ items: get().items.filter((i) => i.book.id !== bookId) });
      },
      updateQuantity: (bookId: number, delta: number) => {
        const items = get().items
          .map((i) => {
            if (i.book.id === bookId) {
              const newQty = i.quantity + delta;
              // For digital e-books, max quantity is 1
              return newQty > 0 ? { ...i, quantity: 1 } : null;
            }
            return i;
          })
          .filter(Boolean) as CartItem[];
        set({ items });
      },
      clearCart: () => set({ items: [] }),
      getTotalAmount: () => {
        return get().items.reduce((sum, item) => sum + item.book.price * item.quantity, 0);
      },
      getTotalCount: () => {
        return get().items.reduce((sum, item) => sum + item.quantity, 0);
      },
    }),
    {
      name: 'authorium-cart',
    }
  )
);

interface FavoritesStore {
  favoriteIds: number[];
  toggleFavorite: (bookId: number) => void;
  isFavorite: (bookId: number) => boolean;
}

export const useFavoritesStore = create<FavoritesStore>()(
  persist(
    (set, get) => ({
      favoriteIds: [],
      toggleFavorite: (bookId: number) => {
        const { favoriteIds } = get();
        if (favoriteIds.includes(bookId)) {
          set({ favoriteIds: favoriteIds.filter((id) => id !== bookId) });
        } else {
          set({ favoriteIds: [...favoriteIds, bookId] });
        }
      },
      isFavorite: (bookId: number) => get().favoriteIds.includes(bookId),
    }),
    {
      name: 'authorium-favorites',
    }
  )
);

interface LibraryStore {
  purchasedIds: number[];
  readingProgress: Record<number, { page: number; totalPages: number; lastRead: string }>;
  addPurchased: (bookIds: number[]) => void;
  isPurchased: (bookId: number) => boolean;
  saveProgress: (bookId: number, page: number, totalPages: number) => void;
  getProgress: (bookId: number) => { page: number; totalPages: number } | null;
}

export const useLibraryStore = create<LibraryStore>()(
  persist(
    (set, get) => ({
      purchasedIds: [],
      readingProgress: {},
      addPurchased: (bookIds: number[]) => {
        const current = get().purchasedIds;
        const newIds = Array.from(new Set([...current, ...bookIds]));
        set({ purchasedIds: newIds });
      },
      isPurchased: (bookId: number) => get().purchasedIds.includes(bookId),
      saveProgress: (bookId: number, page: number, totalPages: number) => {
        const progress = { ...get().readingProgress };
        progress[bookId] = {
          page,
          totalPages,
          lastRead: new Date().toISOString(),
        };
        set({ readingProgress: progress });
      },
      getProgress: (bookId: number) => get().readingProgress[bookId] || null,
    }),
    {
      name: 'authorium-library',
    }
  )
);
