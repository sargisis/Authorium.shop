'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Heart, BookOpen } from 'lucide-react';
import { Book } from '@/types';
import { useFavoritesStore } from '@/store';

interface BookCardProps {
  book: Book;
  size?: 'normal' | 'compact';
}

export default function BookCard({ book, size = 'normal' }: BookCardProps) {
  const { isFavorite, toggleFavorite } = useFavoritesStore();
  const favorite = isFavorite(book.id);

  return (
    <div
      className={`bg-white rounded-3xl p-3 shadow-[0_4px_15px_rgba(0,0,0,0.05)] border border-[#ffea9f] flex flex-col justify-between transition-all hover:scale-[1.02] ${
        size === 'compact' ? 'w-36 min-w-[9rem] desktop-book-card' : 'w-44 min-w-[11rem] desktop-book-card'
      }`}
    >
      <div className="relative w-full aspect-[3/4] rounded-2xl overflow-hidden bg-stone-100 shadow-inner group">
        <Link href={`/book/${book.id}`} prefetch={true} className="block w-full h-full active:scale-95 transition-transform flex items-center justify-center">
          {book.cover_url ? (
            <img
              src={book.cover_url}
              alt={book.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
          ) : (
            <span className="text-3xl">📚</span>
          )}
        </Link>
        {/* Favorite Heart Button */}
        <button
          onClick={(e) => {
            e.preventDefault();
            toggleFavorite(book.id);
          }}
          className="absolute top-2 right-2 w-8 h-8 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center text-[#FF5722] hover:bg-white shadow transition"
        >
          <Heart
            className={`w-4 h-4 ${favorite ? 'fill-[#FF5722]' : 'stroke-stone-700'}`}
          />
        </button>
      </div>

      <div className="mt-2.5 flex flex-col gap-1">
        <Link href={`/book/${book.id}`}>
          <h3 className="font-bold text-sm text-[#1A1A1A] line-clamp-2 leading-tight hover:text-[#FF5722] transition">
            {book.title}
          </h3>
        </Link>
        <p className="text-xs text-[#757575] font-medium truncate">{book.author}</p>

        {/* Category Pill Tag */}
        {book.category && (
          <div className="mt-1">
            <span className="inline-block bg-[#FFF3C4] text-[#8C6D00] text-[10px] font-semibold px-2 py-0.5 rounded-full">
              {book.category.name}
            </span>
          </div>
        )}

        {/* Pages and Price */}
        <div className="mt-2 flex items-center justify-between pt-1 border-t border-stone-100">
          <div className="flex items-center gap-1 text-[11px] text-[#757575]">
            <BookOpen className="w-3 h-3" />
            <span>{book.pages ? `${book.pages} էջ` : 'Էլ. գիրք'}</span>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-sm font-black text-[#FF5722]">{book.price} ֏</span>
            {book.old_price && (
              <span className="text-[10px] text-stone-400 line-through">
                {book.old_price} ֏
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
