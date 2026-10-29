'use client';

import React, { useEffect, useRef, useState, use } from 'react';
import Link from 'next/link';
import { ArrowLeft, ChevronLeft, ChevronRight, Minus, Plus, Sun, Lamp, Moon } from 'lucide-react';
import { Book } from '@/types';
import { fetchBookById } from '@/lib/api';
import { useLibraryStore } from '@/store';

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

  const fileUrl = book?.file_url || '';
  const isPdf = fileUrl.toLowerCase().endsWith('.pdf');
  const isEpub = fileUrl.toLowerCase().endsWith('.epub');

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
    <div className="flex flex-col h-screen w-full bg-[#FAF9F6] overflow-hidden">
      {/* Top Header */}
      <header className="sticky top-0 z-50 px-3.5 py-2 flex items-center justify-between bg-white border-b shadow-sm shrink-0">
        <div className="flex items-center gap-2 min-w-0">
          <Link
            href="/profile?tab=purchased"
            className="p-2 rounded-full hover:bg-black/5 active:scale-90 transition shrink-0"
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
          <PdfTextReader
            url={fileUrl}
            initialPage={typeof location === 'number' && location > 0 ? location : 1}
            onPageChange={handleLocationChange}
          />
        ) : isEpub ? (
          <EpubReader url={fileUrl} location={location} onLocationChange={handleLocationChange} />
        ) : (
          <div className="flex items-center justify-center h-full text-gray-400 text-sm">
            Ֆայլի ձևաչափը չի աջակցվում
          </div>
        )}
      </main>
    </div>
  );
}

type ReaderTheme = 'light' | 'sepia' | 'dark';

const THEME_CLASSES: Record<ReaderTheme, string> = {
  light: 'bg-[#FAF9F6] text-[#1A1A1A]',
  sepia: 'bg-[#F4ECD8] text-[#5B4636]',
  dark: 'bg-[#181818] text-[#E5E0D8]',
};

const PREFS_KEY = 'authorium-reader-prefs';

interface PdfPageText {
  pageNum: number;
  paragraphs: string[];
  chapterLabel?: string;
}

const CHAPTER_WORD_RE = /գլ(ո|ու)խ\s*([\dIVXLCDM]+)/iu;
const ROMAN_ONLY_RE = /^[IVXLCDM]{1,6}$/;

// Best-effort chapter-heading detection — our source PDFs are plain novels
// with no semantic markup, so this looks for the Armenian "Chapter N" word
// (ԳԼՈՒԽ/Գլուխ) anywhere in a paragraph, or a standalone roman numeral
// paragraph (used by some books instead of a word). Books with neither
// convention simply won't show a chapter indicator.
function detectChapterLabel(paragraphs: string[]): string | null {
  for (const para of paragraphs) {
    const m = para.match(CHAPTER_WORD_RE);
    if (m) return `Գլուխ ${m[2]}`;
  }
  for (const para of paragraphs) {
    const trimmed = para.trim();
    if (ROMAN_ONLY_RE.test(trimmed)) return `Գլուխ ${trimmed}`;
  }
  return null;
}

// Reconstructs readable paragraphs from pdf.js text items using line-grouping
// and vertical-gap heuristics (PDFs have no semantic paragraph markup).
function buildParagraphs(items: Array<{ str: string; transform: number[] }>): string[] {
  const lines: { y: number; text: string }[] = [];
  let currentY: number | null = null;
  let currentParts: string[] = [];

  const flushLine = () => {
    if (currentParts.length && currentY !== null) {
      lines.push({ y: currentY, text: cleanText(currentParts.join(' ')) });
    }
    currentParts = [];
  };

  for (const item of items) {
    const y = item.transform[5];
    if (currentY === null || Math.abs(y - currentY) > 2) {
      flushLine();
      currentY = y;
    }
    if (item.str) currentParts.push(item.str);
  }
  flushLine();

  const gaps: number[] = [];
  for (let i = 1; i < lines.length; i++) gaps.push(Math.abs(lines[i - 1].y - lines[i].y));
  const sortedGaps = [...gaps].sort((a, b) => a - b);
  const medianGap = sortedGaps.length ? sortedGaps[Math.floor(sortedGaps.length / 2)] : 0;

  const paragraphs: string[] = [];
  let buffer = '';
  lines.forEach((line, i) => {
    if (!line.text) return;
    if (i === 0) {
      buffer = line.text;
      return;
    }
    const gap = Math.abs(lines[i - 1].y - line.y);
    const isNewParagraph = medianGap > 0 && gap > medianGap * 1.35;
    if (isNewParagraph) {
      if (buffer) paragraphs.push(buffer);
      buffer = line.text;
    } else {
      buffer = buffer ? `${buffer} ${line.text}` : line.text;
    }
  });
  if (buffer) paragraphs.push(buffer);
  return paragraphs;
}

function cleanText(s: string): string {
  return s
    .replace(/\s+/g, ' ')
    .replace(/\s+([,.;:!?)\]»،։])/g, '$1')
    .replace(/([(«[])\s+/g, '$1')
    .trim();
}

// ── Apple Books-style reflowable text reader — extracts text via pdf.js and
// renders it as a continuous, adjustable (font size / theme) scroll instead
// of fixed page images, which reads far better on a phone. Falls back to the
// page-image reader if the PDF has no extractable text (e.g. a scan). ──
function PdfTextReader({
  url,
  initialPage,
  onPageChange,
}: {
  url: string;
  initialPage: number;
  onPageChange: (page: number) => void;
}) {
  const [status, setStatus] = useState<'loading' | 'ready' | 'fallback'>('loading');
  const [progressPct, setProgressPct] = useState(0);
  const [pages, setPages] = useState<PdfPageText[]>([]);
  const [fontSize, setFontSize] = useState(17);
  const [theme, setTheme] = useState<ReaderTheme>('light');
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [currentChapter, setCurrentChapter] = useState<string | null>(null);
  const markerRefs = useRef<Record<number, HTMLDivElement | null>>({});
  const chapterByPage = useRef<Record<number, string>>({});
  const hasScrolledToInitial = useRef(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(PREFS_KEY);
      if (raw) {
        const prefs = JSON.parse(raw);
        if (prefs.fontSize) setFontSize(prefs.fontSize);
        if (prefs.theme) setTheme(prefs.theme);
      }
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(PREFS_KEY, JSON.stringify({ fontSize, theme }));
    } catch {
      // ignore
    }
  }, [fontSize, theme]);

  useEffect(() => {
    let cancelled = false;
    import('react-pdf').then(async (lib) => {
      lib.pdfjs.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';
      try {
        const doc = await lib.pdfjs.getDocument({ url }).promise;
        const numPages = doc.numPages;
        const extracted: PdfPageText[] = [];
        let totalChars = 0;
        for (let p = 1; p <= numPages; p++) {
          if (cancelled) return;
          const page = await doc.getPage(p);
          const content = await page.getTextContent();
          const paragraphs = buildParagraphs(
            content.items as Array<{ str: string; transform: number[] }>
          );
          const chapterLabel = detectChapterLabel(paragraphs) || undefined;
          extracted.push({ pageNum: p, paragraphs, chapterLabel });
          totalChars += paragraphs.join('').length;
          setProgressPct(Math.round((p / numPages) * 100));
        }
        if (cancelled) return;
        if (totalChars < 200) {
          setStatus('fallback');
          return;
        }

        // Forward-fill so every page maps to the most recent chapter heading
        // seen so far, for an O(1) lookup while scrolling.
        let runningLabel = '';
        for (const pg of extracted) {
          if (pg.chapterLabel) runningLabel = pg.chapterLabel;
          if (runningLabel) chapterByPage.current[pg.pageNum] = runningLabel;
        }

        setPages(extracted);
        setStatus('ready');
      } catch {
        if (!cancelled) setStatus('fallback');
      }
    });
    return () => {
      cancelled = true;
    };
  }, [url]);

  useEffect(() => {
    if (status === 'ready' && !hasScrolledToInitial.current && initialPage > 1) {
      hasScrolledToInitial.current = true;
      requestAnimationFrame(() => {
        markerRefs.current[initialPage]?.scrollIntoView({ block: 'start' });
      });
    }
  }, [status, initialPage]);

  useEffect(() => {
    if (status !== 'ready') return;
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible.length > 0) {
          const pageNum = parseInt((visible[0].target as HTMLElement).dataset.page || '0', 10);
          if (pageNum) {
            setCurrentPage(pageNum);
            onPageChange(pageNum);
            setCurrentChapter(chapterByPage.current[pageNum] || null);
          }
        }
      },
      { rootMargin: '-10% 0px -80% 0px', threshold: 0 }
    );
    Object.values(markerRefs.current).forEach((el) => el && observer.observe(el));
    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  if (status === 'fallback') {
    return <PdfReader url={url} initialPage={initialPage} onPageChange={onPageChange} />;
  }

  if (status === 'loading') {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-3 px-8">
        <div className="w-8 h-8 border-2 border-[#FFC800] border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-stone-500">Գիրքը պատրաստվում է... {progressPct}%</p>
      </div>
    );
  }

  const cycleTheme = () =>
    setTheme((t) => (t === 'light' ? 'sepia' : t === 'sepia' ? 'dark' : 'light'));
  const ThemeIcon = theme === 'light' ? Sun : theme === 'sepia' ? Lamp : Moon;
  const barClasses =
    theme === 'dark' ? 'bg-[#232323] border-stone-700 text-[#E5E0D8]' : 'bg-white border-stone-200 text-[#1A1A1A]';

  return (
    <div className="flex flex-col h-full w-full">
      {currentChapter && (
        <div
          className={`shrink-0 px-4 py-1.5 text-[11px] font-bold tracking-wide text-center uppercase border-b transition-colors ${barClasses}`}
        >
          {currentChapter}
        </div>
      )}
      <div className={`flex-1 overflow-y-auto transition-colors ${THEME_CLASSES[theme]}`}>
        <div className="max-w-[65ch] mx-auto px-5 py-8" style={{ fontSize, lineHeight: 1.8 }}>
          {pages.map((pg) => (
            <div
              key={pg.pageNum}
              ref={(el) => {
                markerRefs.current[pg.pageNum] = el;
              }}
              data-page={pg.pageNum}
            >
              {pg.paragraphs.map((para, i) => {
                const isChapterHeading =
                  CHAPTER_WORD_RE.test(para) || ROMAN_ONLY_RE.test(para.trim());
                return (
                  <p
                    key={i}
                    className={
                      isChapterHeading
                        ? 'mt-8 mb-5 text-left font-extrabold'
                        : 'mb-4 text-left'
                    }
                    style={isChapterHeading ? { fontSize: fontSize * 1.25 } : undefined}
                  >
                    {para}
                  </p>
                );
              })}
            </div>
          ))}
          <p className="text-center text-xs opacity-50 pb-10">Վերջ</p>
        </div>
      </div>

      <div className={`shrink-0 flex items-center justify-between gap-2 px-3 py-2.5 border-t ${barClasses}`}>
        <span className="text-[11px] font-semibold opacity-60 tabular-nums shrink-0">
          {currentPage} / {pages.length}
        </span>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setFontSize((f) => Math.max(13, f - 2))}
            disabled={fontSize <= 13}
            className="p-2 rounded-full bg-black/5 disabled:opacity-30 active:scale-90 transition"
          >
            <Minus className="w-4 h-4" />
          </button>
          <span className="text-xs w-5 text-center tabular-nums">{fontSize}</span>
          <button
            onClick={() => setFontSize((f) => Math.min(25, f + 2))}
            disabled={fontSize >= 25}
            className="p-2 rounded-full bg-black/5 disabled:opacity-30 active:scale-90 transition"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
        <button onClick={cycleTheme} className="p-2 rounded-full bg-black/5 active:scale-90 transition">
          <ThemeIcon className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

// ── PDF page-image fallback — used only when text extraction fails (e.g. a scanned PDF) ──
function PdfReader({
  url,
  initialPage,
  onPageChange,
}: {
  url: string;
  initialPage: number;
  onPageChange: (page: number) => void;
}) {
  const [ReactPdfLib, setLib] = useState<typeof import('react-pdf') | null>(null);
  const [numPages, setNumPages] = useState<number | null>(null);
  const [pageNumber, setPageNumber] = useState(initialPage || 1);
  const [zoom, setZoom] = useState(1);
  const [containerWidth, setContainerWidth] = useState(360);
  const [loadError, setLoadError] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    import('react-pdf').then((lib) => {
      lib.pdfjs.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';
      setLib(lib);
    });
  }, []);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const update = () => setContainerWidth(el.clientWidth);
    update();
    const observer = new ResizeObserver(update);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const goToPage = (page: number) => {
    if (!numPages) return;
    const clamped = Math.min(Math.max(page, 1), numPages);
    setPageNumber(clamped);
    onPageChange(clamped);
  };

  if (!ReactPdfLib) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="w-8 h-8 border-2 border-[#FFC800] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const { Document, Page } = ReactPdfLib;
  const pageWidth = Math.min(containerWidth - 24, 720) * zoom;

  return (
    <div className="flex flex-col h-full w-full">
      <div
        ref={containerRef}
        className="flex-1 overflow-auto bg-stone-200 flex justify-center"
      >
        {loadError ? (
          <div className="flex flex-col items-center justify-center text-center gap-3 p-8">
            <p className="text-sm text-stone-600">Գիրքը բեռնելիս սխալ առաջացավ</p>
            <a
              href={url}
              target="_blank"
              rel="noreferrer"
              className="text-[#FF5500] underline text-sm"
            >
              Բացել ֆայլը նոր էջում
            </a>
          </div>
        ) : (
          <Document
            file={url}
            onLoadSuccess={({ numPages: n }) => {
              setNumPages(n);
              goToPage(Math.min(Math.max(initialPage || 1, 1), n));
            }}
            onLoadError={() => setLoadError(true)}
            loading={
              <div className="flex items-center justify-center h-full py-20">
                <div className="w-8 h-8 border-2 border-[#FFC800] border-t-transparent rounded-full animate-spin" />
              </div>
            }
            className="py-3"
          >
            <div className="relative select-none">
              <Page
                pageNumber={pageNumber}
                width={pageWidth}
                renderTextLayer={false}
                renderAnnotationLayer={false}
                className="shadow-lg rounded-md overflow-hidden"
                loading={
                  <div
                    className="flex items-center justify-center bg-white"
                    style={{ width: pageWidth, aspectRatio: '3 / 4' }}
                  >
                    <div className="w-6 h-6 border-2 border-[#FFC800] border-t-transparent rounded-full animate-spin" />
                  </div>
                }
              />
              {/* Tap zones for page navigation */}
              <button
                aria-label="Նախորդ էջ"
                onClick={() => goToPage(pageNumber - 1)}
                className="absolute left-0 top-0 h-full w-[35%] active:bg-black/5"
              />
              <button
                aria-label="Հաջորդ էջ"
                onClick={() => goToPage(pageNumber + 1)}
                className="absolute right-0 top-0 h-full w-[35%] active:bg-black/5"
              />
            </div>
          </Document>
        )}
      </div>

      {/* Bottom Controls */}
      {!loadError && (
        <div className="shrink-0 flex items-center justify-between gap-2 px-3 py-2.5 bg-white border-t safe-area-bottom">
          <button
            onClick={() => goToPage(pageNumber - 1)}
            disabled={pageNumber <= 1}
            className="p-2 rounded-full bg-stone-100 disabled:opacity-30 active:scale-90 transition"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <span className="text-xs font-semibold text-stone-600 tabular-nums">
            {pageNumber} / {numPages || '…'}
          </span>

          <button
            onClick={() => goToPage(pageNumber + 1)}
            disabled={!numPages || pageNumber >= numPages}
            className="p-2 rounded-full bg-stone-100 disabled:opacity-30 active:scale-90 transition"
          >
            <ChevronRight className="w-5 h-5" />
          </button>

          <div className="w-px h-5 bg-stone-200 mx-1" />

          <button
            onClick={() => setZoom((z) => Math.max(0.75, +(z - 0.1).toFixed(2)))}
            disabled={zoom <= 0.75}
            className="p-2 rounded-full bg-stone-100 disabled:opacity-30 active:scale-90 transition"
          >
            <Minus className="w-4 h-4" />
          </button>
          <button
            onClick={() => setZoom((z) => Math.min(1.75, +(z + 0.1).toFixed(2)))}
            disabled={zoom >= 1.75}
            className="p-2 rounded-full bg-stone-100 disabled:opacity-30 active:scale-90 transition"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}

// ── EPUB Reader — lazy-loaded to avoid SSR issues ──
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
