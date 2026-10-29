'use client';

import React, { useEffect, useState, use } from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { AUTHORS } from '@/data/authors';
import { Book } from '@/types';
import { fetchBooks } from '@/lib/api';
import BookCard from '@/components/BookCard';

export default function AuthorDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const author = AUTHORS.find((a) => a.slug === slug);

  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!author) return;
    fetchBooks().then((all) => {
      setBooks(all.filter((b) => b.author.trim() === author.nameHy.trim()));
      setLoading(false);
    });
  }, [author]);

  if (!author) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 min-h-screen bg-[#FFC800] text-center">
        <p className="text-stone-700 font-semibold">Հեղինակը չի գտնվել</p>
        <Link href="/authors" className="mt-4 text-[#FF5722] font-bold text-sm">
          Վերադառնալ հեղինակներին
        </Link>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col px-4 py-3 bg-[#FFC800] min-h-screen">
      <div className="flex items-center justify-between mb-4">
        <Link
          href="/authors"
          className="w-10 h-10 rounded-full bg-white/70 flex items-center justify-center text-stone-800 hover:bg-white transition"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-lg font-extrabold text-[#1A1A1A] truncate px-2">{author.nameHy}</h1>
        <div className="w-10 h-10" />
      </div>

      <div className="flex-1 pb-24">
        <div className="rounded-3xl overflow-hidden bg-white shadow-sm mb-4">
          <img src={author.photo} alt={author.nameEn} className="w-full aspect-square object-cover" />
        </div>

        <p className="text-sm text-stone-700 leading-relaxed mb-5">{author.bioHy}</p>

        {!loading && books.length > 0 && (
          <>
            <h2 className="text-base font-bold text-[#1A1A1A] mb-3">Գրքեր մեր խանութում</h2>
            <div className="grid grid-cols-2 gap-3">
              {books.map((book) => (
                <BookCard key={book.id} book={book} />
              ))}
            </div>
          </>
        )}

        {!loading && books.length === 0 && (
          <p className="text-xs text-stone-500">
            Այս հեղինակի գրքերը առայժմ մեր խանութում հասանելի չեն։
          </p>
        )}
      </div>
    </div>
  );
}
