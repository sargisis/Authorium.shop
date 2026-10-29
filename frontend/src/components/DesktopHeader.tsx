'use client';

import Link from 'next/link';
import { BookOpen, Compass, Heart, ShoppingBag, UserRound } from 'lucide-react';
import { useTelegramAuth } from '@/components/TelegramProvider';
import TelegramLoginButton from '@/components/TelegramLoginButton';

const links = [
  { label: 'Գրքեր', href: '/categories', icon: BookOpen },
  { label: 'Բացահայտել', href: '/explore', icon: Compass },
  { label: 'Սիրվածներ', href: '/favorites', icon: Heart },
];

export default function DesktopHeader() {
  const { user } = useTelegramAuth();

  return (
    <header className="desktop-header">
      <Link href="/" className="desktop-brand">
        <img src="/logo.png" alt="" />
        <span>Authorium.store</span>
      </Link>

      <nav className="desktop-nav-links" aria-label="Հիմնական նավիգացիա">
        {links.map(({ label, href, icon: Icon }) => (
          <Link href={href} key={href}>
            <Icon size={17} aria-hidden="true" />
            <span>{label}</span>
          </Link>
        ))}
      </nav>

      <div className="desktop-nav-actions">
        <Link href="/cart" className="desktop-nav-action" aria-label="Զամբյուղ">
          <ShoppingBag size={18} />
          <span>Զամբյուղ</span>
        </Link>
        {user ? (
          <Link href="/profile" className="desktop-nav-action desktop-nav-action-primary">
            <UserRound size={18} />
            <span>{user.first_name}</span>
          </Link>
        ) : (
          <TelegramLoginButton />
        )}
      </div>
    </header>
  );
}