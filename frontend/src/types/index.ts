export interface Category {
  id: number;
  name: string;
  icon: string;
}

export interface Book {
  id: number;
  title: string;
  author: string;
  category_id: number;
  category?: Category;
  price: number;
  old_price?: number;
  pages: number;
  rating: number;
  cover_url: string;
  file_url?: string;
  description: string;
  is_popular?: boolean;
  is_special?: boolean;
}

export interface User {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  language_code?: string;
}

export interface CartItem {
  book: Book;
  quantity: number;
}
