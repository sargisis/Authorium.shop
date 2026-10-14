'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Search, ArrowRight } from 'lucide-react';
import Header from '@/components/Header';
import BookCard from '@/components/BookCard';
import { Book } from '@/types';
import { fetchBooks } from '@/lib/api';
import { INITIAL_BOOKS } from '@/data/mockData';

export default function HomePage() {
  // Pre-seed with instant mock data so there is ZERO waiting time or flicker
  const [allBooks, setAllBooks] = useState<Book[]>(INITIAL_BOOKS);
  const [popularBooks, setPopularBooks] = useState<Book[]>(() =>
    INITIAL_BOOKS.filter((b) => b.is_popular)
  );
  const [specialBooks, setSpecialBooks] = useState<Book[]>(() =>
    INITIAL_BOOKS.filter((b) => b.is_special)
  );
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchBooks().then((books) => {
      if (books && books.length > 0) {
        setAllBooks(books);
        const pop = books.filter((b) => b.is_popular);
        const spec = books.filter((b) => b.is_special);
        setPopularBooks(pop.length > 0 ? pop : books.slice(0, 4));
        setSpecialBooks(spec.length > 0 ? spec : books.slice(0, 4));
      }
    });
  }, []);

  const filteredBooks = searchQuery.trim()
    ? allBooks.filter(
        (b) =>
          b.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          b.author.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : allBooks;

  return (
    <div className="flex-1 flex flex-col">
      <Header />

      <main className="px-4 py-2 flex flex-col gap-5">
        {/* Search Bar matching mockup */}
        <div className="relative">
          <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-stone-500">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Որոնիր գիրք, հեղինակ, ժանր..."
            className="w-full pl-9 pr-4 py-2.5 bg-white/90 focus:bg-white rounded-full text-xs placeholder:text-stone-400 text-stone-900 border border-yellow-300 focus:outline-none focus:ring-2 focus:ring-[#FF5722] shadow-sm transition"
          />
        </div>

        {/* Hero Promo Banner matching mockup */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#FFD233] to-[#FFB700] p-5 shadow-[0_6px_20px_rgba(255,160,0,0.25)] border border-[#FFE066]">
          {/* Decorative Pink Star Burst & Hand-drawn elements */}
          <div className="absolute -top-4 -right-4 w-32 h-32 opacity-90 pointer-events-none">
            <svg viewBox="0 0 100 100" className="w-full h-full text-[#FF5A87] fill-current animate-pulse">
              <polygon points="50,0 60,35 95,35 68,57 78,92 50,70 22,92 32,57 5,35 40,35" />
            </svg>
          </div>

          <div className="relative z-10 max-w-[65%]">
            <h2 className="text-xl font-black leading-snug text-[#1A1A1A]">
              Բացահայտիր <br />
              քո հաջորդ գիրքը
            </h2>
            <p className="text-[11px] text-[#4A4A4A] mt-1.5 font-medium leading-relaxed">
              Անվերջ պատմություններ, <br />
              մեկ հարթակում
            </p>

            <Link
              href="/categories"
              className="inline-flex items-center gap-1.5 mt-3.5 px-4 py-2 bg-[#FF5722] hover:bg-[#E64A19] text-white text-xs font-bold rounded-full shadow-md hover:shadow-lg transition-transform active:scale-95"
            >
              <span>Դիտել գրքերը</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Dots Indicator */}
          <div className="absolute bottom-2.5 right-6 flex items-center gap-1.5 z-10">
            <span className="w-2 h-2 rounded-full bg-[#FF5722]" />
            <span className="w-1.5 h-1.5 rounded-full bg-white/70" />
            <span className="w-1.5 h-1.5 rounded-full bg-white/70" />
            <span className="w-1.5 h-1.5 rounded-full bg-white/70" />
          </div>
        </div>

        {/* Section: Հատուկ առաջարկներ (Special Offers) */}
        <div>
          <div className="flex items-center justify-between mb-2.5">
            <h2 className="text-base font-extrabold text-[#1A1A1A] tracking-tight">
              Հատուկ առաջարկներ
            </h2>
            <Link
              href="/categories"
              className="text-xs font-semibold text-[#8C6D00] hover:text-[#1A1A1A] flex items-center gap-0.5"
            >
              Դիտել բոլորը <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="carousel-swipe flex gap-3 pb-2 no-scrollbar -mx-4 px-4">
            {specialBooks.map((book) => (
              <BookCard key={`special-${book.id}`} book={book} />
            ))}
          </div>
        </div>

        {/* Section: Հայտնի գրքեր (Popular Books) */}
        <div>
          <div className="flex items-center justify-between mb-2.5">
            <h2 className="text-base font-extrabold text-[#1A1A1A] tracking-tight">
              Հայտնի գրքեր
            </h2>
            <Link
              href="/categories"
              className="text-xs font-semibold text-[#8C6D00] hover:text-[#1A1A1A] flex items-center gap-0.5"
            >
              Դիտել բոլորը <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="carousel-swipe flex gap-3 pb-2 no-scrollbar -mx-4 px-4">
            {popularBooks.map((book) => (
              <BookCard key={`pop-${book.id}`} book={book} />
            ))}
          </div>
        </div>

        {/* Section: Բոլոր առաջարկները (All Books showcase) */}
        <div className="mb-20">
          <div className="flex items-center justify-between mb-2.5">
            <h2 className="text-base font-extrabold text-[#1A1A1A] tracking-tight">
              Բոլոր գրքերը
            </h2>
            <Link
              href="/explore"
              className="text-xs font-semibold text-[#8C6D00] hover:text-[#1A1A1A] flex items-center gap-0.5"
            >
              Բացահայտել <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {filteredBooks.map((book) => (
              <BookCard key={`all-home-${book.id}`} book={book} />
            ))}
          </div>
          {filteredBooks.length === 0 && (
            <div className="text-center py-10 bg-white/40 rounded-2xl text-xs font-bold text-stone-700">
              Գրքեր չեն գտնվել
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
