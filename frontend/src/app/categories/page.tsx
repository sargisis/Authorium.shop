'use client';

import React, { useEffect, useState, use } from 'react';
import Link from 'next/link';
import { ArrowLeft, Search, X } from 'lucide-react';
import BookCard from '@/components/BookCard';
import CategoryGrid from '@/components/CategoryGrid';
import { Book, Category } from '@/types';
import { fetchBooks, fetchCategories } from '@/lib/api';
import { INITIAL_CATEGORIES } from '@/data/mockData';

export default function CategoriesPage({
  searchParams,
}: {
  searchParams?: Promise<{ selected?: string }>;
}) {
  const resolvedParams = searchParams ? use(searchParams) : {};
  const selectedCatId = resolvedParams.selected ? parseInt(resolvedParams.selected, 10) : undefined;

  const [categories, setCategories] = useState<Category[]>(INITIAL_CATEGORIES);
  const [activeCategory, setActiveCategory] = useState<number | undefined>(selectedCatId);
  const [search, setSearch] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchCategories().then((res) => setCategories(res));
  }, []);

  useEffect(() => {
    if (activeCategory || search) {
      setLoading(true);
      fetchBooks({ categoryId: activeCategory, search }).then((res) => {
        setBooks(res);
        setLoading(false);
      });
    }
  }, [activeCategory, search]);

  const activeCategoryObj = categories.find((c) => c.id === activeCategory);

  return (
    <div className="flex-1 flex flex-col px-4 py-3 bg-[#FFC800] min-h-screen">
      {/* Top Header matching Mockup Photo */}
      <div className="flex items-center justify-between mb-4">
        {activeCategory ? (
          <button
            onClick={() => setActiveCategory(undefined)}
            className="w-10 h-10 rounded-full bg-white/70 flex items-center justify-center text-stone-800 hover:bg-white transition active:scale-95"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
        ) : (
          <Link
            href="/"
            className="w-10 h-10 rounded-full bg-white/70 flex items-center justify-center text-stone-800 hover:bg-white transition active:scale-95"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
        )}

        <h1 className="text-xl font-black text-[#1A1A1A] tracking-tight">
          {activeCategoryObj ? activeCategoryObj.name : 'Կատեգորիաներ'}
        </h1>

        <button
          onClick={() => setShowSearch(!showSearch)}
          className="w-10 h-10 rounded-full bg-white/70 flex items-center justify-center text-stone-800 hover:bg-white transition active:scale-95"
        >
          {showSearch ? <X className="w-5 h-5" /> : <Search className="w-5 h-5" />}
        </button>
      </div>

      {/* Expandable Search Input */}
      {showSearch && (
        <div className="relative mb-4 animate-in fade-in slide-in-from-top-2">
          <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-stone-500">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Որոնել գրքեր..."
            autoFocus
            className="w-full pl-9 pr-4 py-2.5 bg-white rounded-full text-xs placeholder:text-stone-400 text-stone-900 border border-yellow-300 focus:outline-none focus:ring-2 focus:ring-[#FF5722] shadow-sm transition"
          />
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 pb-24">
        {activeCategory === undefined && !search ? (
          /* Exact Match of Photo 2: Beautiful Pastel 2-Column Categories Grid */
          <CategoryGrid
            categories={categories}
            selectedId={activeCategory}
            onSelect={(id) => setActiveCategory(id)}
          />
        ) : (
          /* Filtered Books List for Selected Category */
          <div>
            <div className="flex items-center justify-between mb-3 px-1">
              <span className="text-xs font-bold text-stone-800">
                Գտնվել է {books.length} գիրք
              </span>
              <button
                onClick={() => {
                  setActiveCategory(undefined);
                  setSearch('');
                }}
                className="text-xs font-bold text-[#FF5722] hover:underline"
              >
                Բոլոր կատեգորիաները
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {books.map((book) => (
                <BookCard key={book.id} book={book} />
              ))}
            </div>

            {!loading && books.length === 0 && (
              <div className="flex flex-col items-center justify-center text-center py-16 bg-white/50 rounded-3xl p-6 mt-3">
                <p className="text-sm font-bold text-stone-800">Այս ժանրում դեռ գրքեր չկան</p>
                <button
                  onClick={() => setActiveCategory(undefined)}
                  className="mt-4 px-5 py-2 bg-[#FF5722] text-white text-xs font-bold rounded-full shadow-md"
                >
                  Վերադառնալ կատեգորիաներ
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
