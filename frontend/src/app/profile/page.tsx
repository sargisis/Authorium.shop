'use client';

import React, { useEffect, useState, use } from 'react';
import Link from 'next/link';
import {
  BookMarked,
  Heart,
  ListOrdered,
  History,
  Settings,
  HelpCircle,
  LogOut,
  ChevronRight,
  User as UserIcon,
  BookOpen,
  ArrowLeft,
  CheckCircle2,
  Shield,
  RefreshCw,
  Phone,
} from 'lucide-react';
import { useFavoritesStore, useLibraryStore } from '@/store';
import { Book } from '@/types';
import { fetchBooks } from '@/lib/api';

interface TelegramUser {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  photo_url?: string;
}

function getTelegramUser(): TelegramUser | null {
  if (typeof window === 'undefined') return null;
  try {
    const tg = (window as any).Telegram?.WebApp?.initDataUnsafe?.user;
    if (tg) return tg;
  } catch {}
  return null;
}

export default function ProfilePage({
  searchParams,
}: {
  searchParams?: Promise<{ tab?: string }>;
}) {
  const resolvedParams = searchParams ? use(searchParams) : {};
  const activeTab = resolvedParams.tab;

  const [tgUser, setTgUser] = useState<TelegramUser | null>(null);
  const [allBooks, setAllBooks] = useState<Book[]>([]);
  const favoriteIds = useFavoritesStore((s) => s.favoriteIds);
  const { purchasedIds, getProgress } = useLibraryStore();

  useEffect(() => {
    const user = getTelegramUser();
    setTgUser(user);
    fetchBooks().then((books) => setAllBooks(books));
  }, []);

  // Build display name from real Telegram data
  const displayName = tgUser
    ? [tgUser.first_name, tgUser.last_name].filter(Boolean).join(' ')
    : 'Հյուր';
  const displayUsername = tgUser?.username ? `@${tgUser.username}` : '';

  const purchasedBooks = allBooks.filter((b) => purchasedIds.includes(b.id));

  // If viewing Purchased Books Tab (Իմ գրադարան)
  if (activeTab === 'purchased') {
    return (
      <div className="flex-1 flex flex-col px-4 py-3 bg-[#FFC800] min-h-screen">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <Link
            href="/profile"
            className="w-10 h-10 rounded-full bg-white/70 flex items-center justify-center text-stone-800 hover:bg-white transition"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-lg font-extrabold text-[#1A1A1A]">Իմ գրադարանը</h1>
          <div className="w-10 h-10" />
        </div>

        {/* Purchased Books List with Reader launch */}
        <div className="flex-1 flex flex-col gap-3 pb-24">
          {purchasedBooks.map((book) => {
            const progress = getProgress(book.id);
            const curPage = progress?.page || 1;
            const total = book.pages || progress?.totalPages || 100;
            const percent = Math.min(100, Math.round((curPage / total) * 100));

            return (
              <div
                key={book.id}
                className="bg-white rounded-2xl p-3.5 shadow-sm border border-[#ffea9f] flex items-center gap-3.5"
              >
                <img
                  src={book.cover_url}
                  alt={book.title}
                  className="w-16 h-24 object-cover rounded-xl shadow-md flex-shrink-0"
                />

                <div className="flex-1 min-w-0">
                  <h3 className="text-xs font-black text-[#1A1A1A] truncate">{book.title}</h3>
                  <p className="text-[11px] text-stone-500 truncate mt-0.5">{book.author}</p>

                  {/* Progress Bar */}
                  <div className="mt-2.5">
                    <div className="flex items-center justify-between text-[10px] text-stone-600 font-bold mb-1">
                      <span>Էջ {curPage} / {total}</span>
                      <span className="text-[#FF5722]">{percent}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-stone-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[#FF5722] rounded-full transition-all duration-300"
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>

                  {/* Read Action Button */}
                  <Link
                    href={`/reader/${book.id}`}
                    className="inline-flex items-center gap-1.5 mt-2.5 px-3.5 py-1.5 bg-[#FF5722] hover:bg-[#E64A19] text-white text-[11px] font-bold rounded-full shadow-sm transition active:scale-95"
                  >
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>{curPage > 1 ? 'Շարունակել' : 'Կարդալ'}</span>
                  </Link>
                </div>
              </div>
            );
          })}

          {purchasedBooks.length === 0 && (
            <div className="flex flex-col items-center justify-center text-center py-16">
              <div className="w-16 h-16 rounded-full bg-white/60 flex items-center justify-center text-stone-500 mb-3">
                <BookMarked className="w-8 h-8" />
              </div>
              <h2 className="text-base font-bold text-stone-800">Դուք դեռ գրքեր չեք գնել</h2>
              <p className="text-xs text-stone-600 mt-1 max-w-xs">
                Գնեք գիրք խանութից և այն անմիջապես կհայտնվի ձեր գրադարանում
              </p>
              <Link
                href="/categories"
                className="mt-5 px-5 py-2.5 bg-[#FF5722] text-white text-xs font-bold rounded-full shadow-md hover:bg-[#E64A19] transition"
              >
                Դիտել գրքերը
              </Link>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col px-4 py-3 bg-[#FFC800] min-h-screen">
      {/* User Header */}
      <div className="flex flex-col items-center py-5">
        {tgUser?.photo_url ? (
          <img
            src={tgUser.photo_url}
            alt={displayName}
            className="w-20 h-20 rounded-full border-4 border-white shadow-md mb-2 object-cover"
          />
        ) : (
          <div className="w-20 h-20 rounded-full border-4 border-white overflow-hidden shadow-md bg-stone-800 flex items-center justify-center text-white text-2xl font-bold mb-2">
            {tgUser?.first_name?.charAt(0)?.toUpperCase() || <UserIcon className="w-10 h-10" />}
          </div>
        )}
        <h2 className="text-lg font-black text-[#1A1A1A]">{displayName}</h2>
        {displayUsername && (
          <span className="text-xs text-stone-700 font-semibold">{displayUsername}</span>
        )}
      </div>

      {/* Menu Items */}
      <div className="flex flex-col gap-2.5 pb-24">
        {/* Purchased Books (Իմ գրադարան) */}
        <Link
          href="/profile?tab=purchased"
          className="p-3.5 bg-white rounded-2xl border border-[#ffea9f] flex items-center justify-between shadow-sm hover:scale-[1.01] transition"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-orange-100 text-[#FF5722] flex items-center justify-center">
              <BookMarked className="w-4 h-4" />
            </div>
            <span className="text-xs font-bold text-stone-800">Գնված գրքեր (Գրադարան)</span>
          </div>
          <div className="flex items-center gap-1.5 text-stone-400">
            <span className="text-xs font-extrabold text-[#FF5722] bg-orange-50 px-2 py-0.5 rounded-full border border-orange-200">
              {purchasedIds.length}
            </span>
            <ChevronRight className="w-4 h-4" />
          </div>
        </Link>

        {/* Favorites */}
        <Link
          href="/favorites"
          prefetch={true}
          className="p-3.5 bg-white rounded-2xl border border-[#ffea9f] flex items-center justify-between shadow-sm hover:scale-[1.01] transition"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-orange-100 text-[#FF5722] flex items-center justify-center">
              <Heart className="w-4 h-4" />
            </div>
            <span className="text-xs font-bold text-stone-800">Սիրվածներ</span>
          </div>
          <div className="flex items-center gap-1.5 text-stone-400">
            <span className="text-xs font-extrabold text-stone-600">{favoriteIds.length}</span>
            <ChevronRight className="w-4 h-4" />
          </div>
        </Link>

        {/* Reading List */}
        <div className="p-3.5 bg-white rounded-2xl border border-[#ffea9f] flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-orange-100 text-[#FF5722] flex items-center justify-center">
              <ListOrdered className="w-4 h-4" />
            </div>
            <span className="text-xs font-bold text-stone-800">Կարդալու ցանկ</span>
          </div>
          <div className="flex items-center gap-1.5 text-stone-400">
            <span className="text-xs font-extrabold text-stone-600">0</span>
            <ChevronRight className="w-4 h-4" />
          </div>
        </div>

        {/* Order History */}
        <Link
          href="/profile?tab=purchased"
          className="p-3.5 bg-white rounded-2xl border border-[#ffea9f] flex items-center justify-between shadow-sm hover:scale-[1.01] transition"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-orange-100 text-[#FF5722] flex items-center justify-center">
              <History className="w-4 h-4" />
            </div>
            <span className="text-xs font-bold text-stone-800">Պատվերների պատմություն</span>
          </div>
          <ChevronRight className="w-4 h-4 text-stone-400" />
        </Link>

        {/* Settings */}
        <div className="p-3.5 bg-white rounded-2xl border border-[#ffea9f] flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-orange-100 text-[#FF5722] flex items-center justify-center">
              <Settings className="w-4 h-4" />
            </div>
            <span className="text-xs font-bold text-stone-800">Կարգավորումներ</span>
          </div>
          <ChevronRight className="w-4 h-4 text-stone-400" />
        </div>

        {/* Help / Contact */}
        <Link
          href="/contact"
          className="p-3.5 bg-white rounded-2xl border border-[#ffea9f] flex items-center justify-between shadow-sm hover:scale-[1.01] transition"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-orange-100 text-[#FF5722] flex items-center justify-center">
              <HelpCircle className="w-4 h-4" />
            </div>
            <span className="text-xs font-bold text-stone-800">Օգնություն / Կապ</span>
          </div>
          <ChevronRight className="w-4 h-4 text-stone-400" />
        </Link>

        {/* Legal links (required by bank) */}
        <div className="mt-1">
          <p className="text-[10px] font-bold text-stone-500 px-1 mb-1.5 uppercase tracking-wider">Ստորագրումներ և քաղաքականություններ</p>
          <div className="flex flex-col gap-2">
            <Link
              href="/privacy"
              className="p-3 bg-white rounded-2xl border border-[#ffea9f] flex items-center justify-between shadow-sm hover:scale-[1.01] transition"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <Shield className="w-4 h-4" />
                </div>
              <span className="text-xs font-bold text-stone-800">Գաղտնիության Քաղաքականություն</span>
              </div>
              <ChevronRight className="w-4 h-4 text-stone-400" />
            </Link>

            <Link
              href="/refund"
              className="p-3 bg-white rounded-2xl border border-[#ffea9f] flex items-center justify-between shadow-sm hover:scale-[1.01] transition"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <RefreshCw className="w-4 h-4" />
                </div>
              <span className="text-xs font-bold text-stone-800">Վերադարձի Քաղաքականություն</span>
              </div>
              <ChevronRight className="w-4 h-4 text-stone-400" />
            </Link>
          </div>
        </div>

        {/* Logout */}
        <div className="p-3.5 bg-white/70 rounded-2xl border border-red-200 flex items-center justify-between shadow-sm text-red-600 cursor-pointer hover:bg-white transition">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-red-100 flex items-center justify-center">
              <LogOut className="w-4 h-4" />
            </div>
            <span className="text-xs font-bold">Դուրս գալ</span>
          </div>
        </div>
      </div>
    </div>
  );
}
