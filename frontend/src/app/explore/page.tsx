'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Search, Compass, Flame, Sparkles, Star, TrendingUp, BookOpen, ArrowRight } from 'lucide-react';
import { Book } from '@/types';
import { fetchBooks } from '@/lib/api';
import BookCard from '@/components/BookCard';
import { INITIAL_BOOKS } from '@/data/mockData';

export default function ExplorePage() {
  const [books, setBooks] = useState<Book[]>(INITIAL_BOOKS);
  const [filter, setFilter] = useState<'all' | 'popular' | 'special' | 'rating'>('all');
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchBooks().then((res) => setBooks(res));
  }, []);

  const filteredBooks = books.filter((b) => {
    if (search) {
      const q = search.toLowerCase();
      return b.title.toLowerCase().includes(q) || b.author.toLowerCase().includes(q);
    }
    if (filter === 'popular') return b.is_popular;
    if (filter === 'special') return b.is_special;
    if (filter === 'rating') return b.rating >= 4.7;
    return true;
  });

  const featuredBook = books[0];

  return (
    <div className="flex-1 flex flex-col px-4 py-3 bg-[#FFC800] min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-full bg-white/80 flex items-center justify-center text-[#FF5722] shadow-sm">
            <Compass className="w-5 h-5" />
          </div>
          <h1 className="text-xl font-black text-[#1A1A1A] tracking-tight">Բացահայտել</h1>
        </div>
      </div>

      {/* Search Input */}
      <div className="relative mb-3.5">
        <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-stone-500">
          <Search className="w-4 h-4" />
        </div>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Որոնել հեղինակ, գիրք, թեմա..."
          className="w-full pl-9 pr-4 py-2.5 bg-white rounded-full text-xs placeholder:text-stone-400 text-stone-900 border border-yellow-300 focus:outline-none focus:ring-2 focus:ring-[#FF5722] shadow-sm transition"
        />
      </div>

      {/* Quick Filter Badges */}
      <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar -mx-4 px-4 mb-4">
        <button
          onClick={() => setFilter('all')}
          className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition shadow-sm ${
            filter === 'all'
              ? 'bg-[#FF5722] text-white scale-105'
              : 'bg-white/80 text-stone-700 hover:bg-white'
          }`}
        >
          Բոլորը
        </button>
        <button
          onClick={() => setFilter('popular')}
          className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition shadow-sm flex items-center gap-1 ${
            filter === 'popular'
              ? 'bg-[#FF5722] text-white scale-105'
              : 'bg-white/80 text-stone-700 hover:bg-white'
          }`}
        >
          <Flame className="w-3.5 h-3.5" /> Թրենդային
        </button>
        <button
          onClick={() => setFilter('special')}
          className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition shadow-sm flex items-center gap-1 ${
            filter === 'special'
              ? 'bg-[#FF5722] text-white scale-105'
              : 'bg-white/80 text-stone-700 hover:bg-white'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" /> Հատուկ
        </button>
        <button
          onClick={() => setFilter('rating')}
          className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition shadow-sm flex items-center gap-1 ${
            filter === 'rating'
              ? 'bg-[#FF5722] text-white scale-105'
              : 'bg-white/80 text-stone-700 hover:bg-white'
          }`}
        >
          <Star className="w-3.5 h-3.5" /> Թոփ ռեյթինգ
        </button>
      </div>

      {/* Featured Book Spotlight Banner */}
      {!search && filter === 'all' && featuredBook && (
        <div className="bg-gradient-to-r from-[#212121] to-[#374151] rounded-3xl p-4 text-white mb-5 shadow-xl flex items-center gap-4 relative overflow-hidden">
          <div className="w-20 aspect-[3/4] rounded-xl overflow-hidden shadow-2xl border-2 border-white/20 flex-shrink-0">
            <img
              src={featuredBook.cover_url}
              alt={featuredBook.title}
              className="w-full h-full object-cover"
            />
          </div>

          <div className="flex-1 min-w-0">
            <span className="text-[10px] font-black uppercase tracking-wider text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded-full inline-block mb-1">
              ✨ Շաբաթվա գիրքը
            </span>
            <h3 className="text-sm font-black truncate">{featuredBook.title}</h3>
            <p className="text-[11px] text-stone-300 truncate mt-0.5">{featuredBook.author}</p>
            <div className="flex items-center gap-2 mt-2">
              <span className="text-xs font-black text-amber-400">{featuredBook.price} AMD</span>
              <Link
                href={`/book/${featuredBook.id}`}
                className="px-3 py-1 bg-[#FF5722] hover:bg-[#E64A19] text-white text-[11px] font-bold rounded-full transition"
              >
                Դիտել
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Books Grid */}
      <div className="flex-1 pb-24">
        <div className="flex items-center justify-between mb-3 px-1">
          <h2 className="text-sm font-extrabold text-[#1A1A1A]">
            {filter === 'popular'
              ? 'Թրենդային գրքեր'
              : filter === 'special'
              ? 'Հատուկ առաջարկներ'
              : filter === 'rating'
              ? 'Բարձր գնահատված'
              : 'Բոլոր առաջարկները'}
          </h2>
          <span className="text-xs font-bold text-stone-700">{filteredBooks.length} գիրք</span>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {filteredBooks.map((book) => (
            <BookCard key={`exp-${book.id}`} book={book} />
          ))}
        </div>
      </div>
    </div>
  );
}
