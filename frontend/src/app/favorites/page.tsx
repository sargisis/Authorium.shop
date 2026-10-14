'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Heart } from 'lucide-react';
import { Book } from '@/types';
import { fetchBooks } from '@/lib/api';
import { useFavoritesStore } from '@/store';
import BookCard from '@/components/BookCard';
import { INITIAL_BOOKS } from '@/data/mockData';

export default function FavoritesPage() {
  const [allBooks, setAllBooks] = useState<Book[]>(INITIAL_BOOKS);
  const favoriteIds = useFavoritesStore((s) => s.favoriteIds);

  useEffect(() => {
    fetchBooks().then((res) => setAllBooks(res));
  }, []);

  const favoriteBooks = allBooks.filter((b) => favoriteIds.includes(b.id));

  return (
    <div className="flex-1 flex flex-col px-4 py-3 bg-[#FFC800] min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <Link
          href="/"
          className="w-10 h-10 rounded-full bg-white/70 flex items-center justify-center text-stone-800 hover:bg-white transition"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-lg font-extrabold text-[#1A1A1A]">Սիրվածներ</h1>
        <div className="w-10 h-10" />
      </div>

      {/* Book Grid */}
      <div className="flex-1 pb-24">
        <div className="grid grid-cols-2 gap-3">
          {favoriteBooks.map((book) => (
            <BookCard key={book.id} book={book} />
          ))}
        </div>

        {favoriteBooks.length === 0 && (
          <div className="flex flex-col items-center justify-center text-center py-16">
            <div className="w-16 h-16 rounded-full bg-white/60 flex items-center justify-center text-[#FF5722] mb-3">
              <Heart className="w-8 h-8" />
            </div>
            <h2 className="text-base font-bold text-stone-800">Սիրված գրքեր չկան</h2>
            <p className="text-xs text-stone-600 mt-1 max-w-xs">
              Սեղմեք սրտիկի նշանին ցանկացած գրքի վրա՝ այն այստեղ ավելացնելու համար
            </p>
            <Link
              href="/categories"
              className="mt-5 px-5 py-2.5 bg-[#FF5722] text-white text-xs font-bold rounded-full shadow-md hover:bg-[#E64A19] transition"
            >
              Դիտել կատալոգը
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
