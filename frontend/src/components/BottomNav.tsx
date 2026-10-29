'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Grid, Compass, Heart, User, Users } from 'lucide-react';
import { useFavoritesStore } from '@/store';

export default function BottomNav() {
  const pathname = usePathname();
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => { setMounted(true); }, []);
  const favoriteIds = useFavoritesStore((state) => state.favoriteIds);

  // Hide bottom navigation in reader & checkout for clean distraction-free flow
  if (pathname?.startsWith('/reader') || pathname?.startsWith('/checkout')) {
    return null;
  }

  const navItems = [
    { label: 'Գլխավոր', href: '/', icon: Home },
    { label: 'Կատեգորիաներ', href: '/categories', icon: Grid },
    { label: 'Բացահայտել', href: '/explore', icon: Compass },
    { label: 'Հեղինակներ', href: '/authors', icon: Users },
    { label: 'Սիրվածներ', href: '/favorites', icon: Heart, badge: favoriteIds.length },
    { label: 'Պրոֆիլ', href: '/profile', icon: User },
  ];

  return (
    <nav className="bottom-nav fixed bottom-0 left-0 right-0 z-50 max-w-md mx-auto bg-white border-t border-[#f0e3b6] px-1.5 py-2.5 shadow-[0_-4px_20px_rgba(0,0,0,0.06)] rounded-t-3xl">
      <div className="flex items-center">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = item.href === '/' ? pathname === '/' : pathname.startsWith(item.href);

          return (
            <Link
              key={item.label}
              href={item.href}
              prefetch={true}
              className={`flex-1 min-w-0 flex flex-col items-center justify-center transition-all duration-150 relative active:scale-95 ${
                isActive ? 'text-[#FF5722] font-semibold scale-105' : 'text-[#757575] hover:text-[#1A1A1A]'
              }`}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5]' : 'stroke-[1.8]'}`} />
                {mounted && item.badge && item.badge > 0 ? (
                  <span className="absolute -top-1 -right-2 bg-[#FF5722] text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
                    {item.badge}
                  </span>
                ) : null}
              </div>
              <span className="w-full text-center text-[9px] mt-1 tracking-tight truncate px-0.5">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
