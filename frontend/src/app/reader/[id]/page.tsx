'use client';

import React, { useEffect, useState, use } from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Book } from '@/types';
import { fetchBookById } from '@/lib/api';
import { useLibraryStore } from '@/store';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://api.authorium.store/api/v1';

export default function ReaderPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const bookId = parseInt(resolvedParams.id, 10);

  const [book, setBook] = useState<Book | null>(null);
  const [loading, setLoading] = useState(true);

  const { getProgress, saveProgress } = useLibraryStore();
  const saved = getProgress(bookId);
  const [location, setLocation] = useState<string | number>(saved?.page || 0);

  const handleLocationChange = (loc: string | number) => {
    setLocation(loc);
    const pageNum = typeof loc === 'number' ? loc : parseInt(String(loc), 10) || 1;
    saveProgress(bookId, pageNum, book?.pages || 100);
  };

  useEffect(() => {
    fetchBookById(bookId).then((res) => {
      setBook(res);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [bookId]);

  // Determine file type
  const fileUrl = book?.file_url || '';
  const isPdf = fileUrl.toLowerCase().endsWith('.pdf');
  const isEpub = fileUrl.toLowerCase().endsWith('.epub');

  // Resolve full URL
  const resolveUrl = (url: string) => {
    if (!url) return '';
    if (url.startsWith('http://') || url.startsWith('https://')) return url;
    return url;
  };

  const fullFileUrl = resolveUrl(fileUrl);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-stone-100">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-[#FFC800] border-t-transparent rounded-full animate-spin mx-auto mb-2" />
          <p className="text-sm text-gray-500">Բեռնվում է...</p>
        </div>
      </div>
    );
  }

  if (!book || !fileUrl) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-stone-100 gap-4">
        <p className="text-gray-500 text-sm">Գիրքը հասանելի չէ</p>
        <Link href="/profile?tab=purchased" className="text-[#FF5500] underline text-sm">
          Վերադառնալ
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen w-full bg-stone-100 overflow-hidden">
      {/* Top Header */}
      <header className="sticky top-0 z-50 px-3.5 py-2 flex items-center justify-between bg-white border-b shadow-sm shrink-0">
        <div className="flex items-center gap-2">
          <Link
            href="/profile?tab=purchased"
            className="p-2 rounded-full hover:bg-black/5 active:scale-90 transition"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="min-w-0">
            <h1 className="text-sm font-extrabold truncate max-w-[200px]">
              {book.title}
            </h1>
            <p className="text-[10px] opacity-70 truncate">{book.author}</p>
          </div>
        </div>
      </header>

      {/* Main Reader Area */}
      <main className="flex-1 relative w-full h-full overflow-hidden">
        {isPdf ? (
          // PDF Viewer — inline iframe
          <iframe
            src={`${fullFileUrl}#toolbar=1&view=FitH`}
            className="w-full h-full border-none"
            title={book.title}
            style={{ minHeight: 'calc(100vh - 50px)' }}
          />
        ) : isEpub ? (
          // EPUB Reader — lazy-loaded to avoid SSR issues
          <EpubReader url={fullFileUrl} location={location} onLocationChange={handleLocationChange} />
        ) : (
          <div className="flex items-center justify-center h-full text-gray-400 text-sm">
            Ֆայլի ձևաչափը չի աջակցվում
          </div>
        )}
      </main>
    </div>
  );
}

// Lazy EPUB reader component
function EpubReader({
  url,
  location,
  onLocationChange,
}: {
  url: string;
  location: string | number;
  onLocationChange: (loc: string) => void;
}) {
  const [ReactReaderLib, setLib] = useState<typeof import('react-reader') | null>(null);

  useEffect(() => {
    import('react-reader').then(setLib);
  }, []);

  if (!ReactReaderLib) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="w-8 h-8 border-2 border-[#FFC800] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const { ReactReader, ReactReaderStyle } = ReactReaderLib;
  return (
    <ReactReader
      url={url}
      location={location}
      locationChanged={onLocationChange}
      epubInitOptions={{ openAs: 'epub' }}
      readerStyles={{
        ...ReactReaderStyle,
        readerArea: { ...ReactReaderStyle.readerArea, backgroundColor: '#FAF9F6' },
      }}
    />
  );
}

