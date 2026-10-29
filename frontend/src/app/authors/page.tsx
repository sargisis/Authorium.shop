'use client';

import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { AUTHORS } from '@/data/authors';

export default function AuthorsPage() {
  return (
    <div className="flex-1 flex flex-col px-4 py-3 bg-[#FFC800] min-h-screen">
      <div className="flex items-center justify-between mb-4">
        <Link
          href="/"
          className="w-10 h-10 rounded-full bg-white/70 flex items-center justify-center text-stone-800 hover:bg-white transition"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-lg font-extrabold text-[#1A1A1A]">Հեղինակներ</h1>
        <div className="w-10 h-10" />
      </div>

      <div className="flex-1 pb-24">
        <div className="grid grid-cols-2 gap-3">
          {AUTHORS.map((author) => (
            <Link
              key={author.slug}
              href={`/authors/${author.slug}`}
              className="rounded-2xl overflow-hidden bg-white shadow-sm active:scale-95 transition-transform"
            >
              <img
                src={author.photo}
                alt={author.nameEn}
                className="w-full aspect-square object-cover"
              />
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
