'use client';

import React, { useEffect, useState, use } from 'react';
import Link from 'next/link';
import { ArrowLeft, Heart, Share2, Star, BookOpen, ShoppingBag, Check } from 'lucide-react';
import { Book } from '@/types';
import { fetchBookById } from '@/lib/api';
import { useCartStore, useFavoritesStore, useLibraryStore } from '@/store';
import { INITIAL_BOOKS } from '@/data/mockData';

export default function BookDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const bookId = parseInt(resolvedParams.id, 10);

  const [book, setBook] = useState<Book | null>(() =>
    INITIAL_BOOKS.find((b) => b.id === bookId) || null
  );
  const [loading, setLoading] = useState<boolean>(() => !INITIAL_BOOKS.some((b) => b.id === bookId));
  const [added, setAdded] = useState(false);

  const addToCart = useCartStore((s) => s.addToCart);
  const { isFavorite, toggleFavorite } = useFavoritesStore();
  const { isPurchased, getProgress } = useLibraryStore();

  useEffect(() => {
    fetchBookById(bookId).then((res) => {
      setBook(res);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [bookId]);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center p-8 min-h-screen bg-[#FFC800]">
        <div className="w-8 h-8 border-2 border-stone-800 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!book) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-stone-800 min-h-screen bg-[#FFC800] gap-3">
        <p className="font-extrabold text-base">Գիրքը չի գտնվել</p>
        <Link href="/" className="px-5 py-2 bg-stone-900 text-white text-xs font-bold rounded-full">
          Վերադառնալ գլխավոր էջ
        </Link>
      </div>
    );
  }

  const favorite = isFavorite(book.id);
  const purchased = isPurchased(book.id);
  const progress = getProgress(book.id);

  const [copied, setCopied] = useState(false);

  const handleBuy = () => {
    addToCart(book);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const handleShare = async () => {
    const url = typeof window !== 'undefined' ? window.location.href : '';
    if (navigator.share) {
      try {
        await navigator.share({
          title: book?.title || 'Authorium Book',
          text: `${book?.title} - ${book?.author} | Authorium Bookstore`,
          url,
        });
        return;
      } catch {
        // Fallback to clipboard if share was cancelled or failed
      }
    }
    if (navigator.clipboard) {
      try {
        await navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
      } catch {
        // ignore
      }
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-[#FFC800] min-h-screen">
      {/* Top Bar */}
      <div className="px-4 py-3 flex items-center justify-between">
        <Link
          href="/"
          className="w-10 h-10 rounded-full bg-white/70 flex items-center justify-center text-stone-800 hover:bg-white transition active:scale-90"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div className="flex items-center gap-2">
          <button
            onClick={() => toggleFavorite(book.id)}
            className="w-10 h-10 rounded-full bg-white/70 flex items-center justify-center text-[#FF5722] hover:bg-white transition shadow-sm active:scale-90"
          >
            <Heart className={`w-5 h-5 ${favorite ? 'fill-[#FF5722]' : 'stroke-stone-800'}`} />
          </button>
          <button
            onClick={handleShare}
            title={copied ? "Հղումը պատճենված է" : "Կիսվել"}
            className="relative w-10 h-10 rounded-full bg-white/70 flex items-center justify-center text-stone-800 hover:bg-white transition shadow-sm active:scale-90"
          >
            {copied ? <Check className="w-5 h-5 text-emerald-600" /> : <Share2 className="w-5 h-5" />}
            {copied && (
              <span className="absolute -bottom-8 right-0 bg-stone-900 text-white text-[10px] font-bold px-2 py-0.5 rounded-md whitespace-nowrap shadow-md pointer-events-none">
                Պատճենված է
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Main Book Content Container */}
      <div className="flex-1 px-4 pb-24 flex flex-col items-center">
        {/* Book Big Cover with Shadow */}
        <div className="w-48 aspect-[3/4] rounded-2xl overflow-hidden shadow-2xl border-4 border-white/60 mb-5 relative group">
          <img
            src={book.cover_url}
            alt={book.title}
            className="w-full h-full object-cover"
          />
        </div>

        {/* Book Details Box */}
        <div className="w-full bg-white rounded-3xl p-5 shadow-lg border border-[#ffea9f] flex flex-col">
          <h1 className="text-xl font-extrabold text-[#1A1A1A] leading-tight text-center">
            {book.title}
          </h1>
          <p className="text-sm font-semibold text-[#757575] text-center mt-1">
            {book.author}
          </p>

          {/* Badges: Category & Pages */}
          <div className="flex items-center justify-center gap-2 mt-3">
            <span className="bg-[#FFF3C4] text-[#8C6D00] text-xs font-bold px-3 py-1 rounded-full">
              {book.category?.name || 'Գիրք'}
            </span>
            <span className="bg-stone-100 text-stone-600 text-xs font-semibold px-3 py-1 rounded-full flex items-center gap-1">
              <BookOpen className="w-3.5 h-3.5" /> {book.pages} էջ
            </span>
          </div>

          {/* Rating & Price */}
          <div className="flex items-center justify-between mt-5 pt-4 border-t border-stone-100">
            <div className="flex items-center gap-1 text-sm font-bold text-stone-800">
              <Star className="w-4 h-4 fill-amber-400 stroke-amber-400" />
              <span>{book.rating}</span>
              <span className="text-xs text-stone-400 font-normal">(124)</span>
            </div>

            <div className="flex items-baseline gap-2">
              <span className="text-xl font-black text-[#FF5722]">
                {book.price} AMD
              </span>
              {book.old_price && (
                <span className="text-xs text-stone-400 line-through">
                  {book.old_price} AMD
                </span>
              )}
            </div>
          </div>

          {/* If already purchased -> Read Now / Continue Reading button */}
          {purchased ? (
            <Link
              href={`/reader/${book.id}`}
              className="w-full mt-4 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-sm rounded-full flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/25 transition-all active:scale-95"
            >
              <BookOpen className="w-4 h-4" />
              <span>
                {progress && progress.page > 1
                  ? `Շարունակել (Էջ ${progress.page})`
                  : 'Կարդալ գիրքը'}
              </span>
            </Link>
          ) : (
            <button
              onClick={handleBuy}
              className={`w-full mt-4 py-3 rounded-full font-extrabold text-sm flex items-center justify-center gap-2 shadow-lg transition-all active:scale-95 cursor-pointer ${
                added
                  ? 'bg-emerald-600 text-white'
                  : 'bg-[#FF5722] hover:bg-[#E64A19] text-white shadow-orange-500/20'
              }`}
            >
              {added ? (
                <>
                  <Check className="w-4 h-4 stroke-[3]" />
                  <span>Ավելացված է զամբյուղում</span>
                </>
              ) : (
                <>
                  <ShoppingBag className="w-4 h-4 stroke-[2.5]" />
                  <span>Գնել գիրքը</span>
                </>
              )}
            </button>
          )}

          {/* Description Section */}
          <div className="mt-5 pt-4 border-t border-stone-100">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#757575] mb-2">
              Նկարագրություն
            </h3>
            <p className="text-xs text-stone-600 leading-relaxed font-medium">
              {book.description}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
