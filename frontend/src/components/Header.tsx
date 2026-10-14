'use client';

import React from 'react';
import Link from 'next/link';
import { Bell, ShoppingBag } from 'lucide-react';
import { useCartStore } from '@/store';

interface HeaderProps {
  showBack?: boolean;
  title?: string;
}

export default function Header({ showBack, title }: HeaderProps) {
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => { setMounted(true); }, []);
  const totalCount = useCartStore((s) => s.getTotalCount());

  return (
    <header className="sticky top-0 z-40 px-4 py-2.5 flex items-center justify-between bg-[#FFC800]">
      {/* Decorative Sparkle (Left) */}
      <div className="flex items-center gap-1 text-[#1A1A1A]">
        <svg className="w-5 h-5 fill-current text-[#1A1A1A]" viewBox="0 0 24 24">
          <path d="M12 0L14.5 9.5L24 12L14.5 14.5L12 24L9.5 14.5L0 12L9.5 9.5L12 0Z" />
        </svg>
      </div>

      {/* Brand Title matching official round logo */}
      <Link href="/" className="flex items-center gap-2 select-none group transition-transform active:scale-95">
        <img src="/logo.png" alt="Authorium" className="w-8 h-8 rounded-full shadow-sm object-cover border border-amber-300/40" />
        <div className="flex flex-col items-start">
          <span className="font-['Uncial_Antiqua',_'Berkshire_Swash',_cursive] text-[22px] font-bold text-[#FF5500] tracking-normal leading-none drop-shadow-[0_1px_1px_rgba(255,85,0,0.15)]">
            Authorium
          </span>
          <span className="text-[10px] font-black text-[#1A1A1A] tracking-tight -mt-0.5 leading-none font-sans">
            .store
          </span>
        </div>
      </Link>

      {/* Actions (Cart & Notification) */}
      <div className="flex items-center gap-3">
        <Link href="/cart" className="relative p-1 text-[#1A1A1A] hover:opacity-80 transition">
          <ShoppingBag className="w-6 h-6 stroke-[2]" />
          {mounted && totalCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-[#FF5722] text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
              {totalCount}
            </span>
          )}
        </Link>
        <button className="p-1 text-[#1A1A1A] hover:opacity-80 transition">
          <Bell className="w-6 h-6 stroke-[2]" />
        </button>
      </div>
    </header>
  );
}
