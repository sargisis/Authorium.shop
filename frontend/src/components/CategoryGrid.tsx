'use client';

import React from 'react';
import {
  Brain,
  Search,
  Heart,
  Briefcase,
  Landmark,
  Atom,
  Disc,
  BookOpen,
  MoreHorizontal,
  LucideIcon,
} from 'lucide-react';
import { Category } from '@/types';

interface StyleConfig {
  icon: LucideIcon;
  bg: string;
  borderColor: string;
  textColor: string;
  iconColor: string;
}

const categoryStyles: Record<number, StyleConfig> = {
  1: {
    // Հոգեբանություն (Yellow)
    icon: Brain,
    bg: 'bg-[#FFE985]',
    borderColor: 'border-[#F2D766]',
    textColor: 'text-[#3E2D04]',
    iconColor: 'text-[#B86B14]',
  },
  2: {
    // Դետեկտիվ (Pink)
    icon: Search,
    bg: 'bg-[#FFD7E0]',
    borderColor: 'border-[#F7C0CD]',
    textColor: 'text-[#4A1D27]',
    iconColor: 'text-[#C94D66]',
  },
  3: {
    // Ռոմանտիկա (Pink)
    icon: Heart,
    bg: 'bg-[#FFD7E0]',
    borderColor: 'border-[#F7C0CD]',
    textColor: 'text-[#4A1D27]',
    iconColor: 'text-[#C94D66]',
  },
  4: {
    // Բիզնես (Yellow)
    icon: Briefcase,
    bg: 'bg-[#FFE985]',
    borderColor: 'border-[#F2D766]',
    textColor: 'text-[#3E2D04]',
    iconColor: 'text-[#B86B14]',
  },
  5: {
    // Պատմություն (Yellow)
    icon: Landmark,
    bg: 'bg-[#FFE985]',
    borderColor: 'border-[#F2D766]',
    textColor: 'text-[#3E2D04]',
    iconColor: 'text-[#B86B14]',
  },
  6: {
    // Գիտություն (Light Blue)
    icon: Atom,
    bg: 'bg-[#D6ECFF]',
    borderColor: 'border-[#BDDCF7]',
    textColor: 'text-[#163D61]',
    iconColor: 'text-[#2582C9]',
  },
  7: {
    // Փիլիսոփայություն (Pink)
    icon: Disc,
    bg: 'bg-[#FFD7E0]',
    borderColor: 'border-[#F7C0CD]',
    textColor: 'text-[#4A1D27]',
    iconColor: 'text-[#C94D66]',
  },
  8: {
    // Գեղարվեստական (Yellow)
    icon: BookOpen,
    bg: 'bg-[#FFE985]',
    borderColor: 'border-[#F2D766]',
    textColor: 'text-[#3E2D04]',
    iconColor: 'text-[#B86B14]',
  },
  9: {
    // Այլ ժանրեր (Yellow)
    icon: MoreHorizontal,
    bg: 'bg-[#FFE985]',
    borderColor: 'border-[#F2D766]',
    textColor: 'text-[#3E2D04]',
    iconColor: 'text-[#B86B14]',
  },
};

interface CategoryGridProps {
  categories: Category[];
  selectedId?: number;
  onSelect?: (id: number) => void;
}

export default function CategoryGrid({ categories, selectedId, onSelect }: CategoryGridProps) {
  // Ensure we display all 9 categories
  const displayCats = categories.length > 0 ? categories : [
    { id: 1, name: 'Հոգեբանություն', icon: 'brain' },
    { id: 2, name: 'Դետեկտիվ', icon: 'search' },
    { id: 3, name: 'Ռոմանտիկա', icon: 'heart' },
    { id: 4, name: 'Բիզնես', icon: 'briefcase' },
    { id: 5, name: 'Պատմություն', icon: 'columns' },
    { id: 6, name: 'Գիտություն', icon: 'atom' },
    { id: 7, name: 'Փիլիսոփայություն', icon: 'yin-yang' },
    { id: 8, name: 'Գեղարվեստական', icon: 'palette' },
    { id: 9, name: 'Այլ ժանրեր', icon: 'more' },
  ];

  return (
    <div className="grid grid-cols-2 gap-3.5 relative">
      {displayCats.map((cat) => {
        const style = categoryStyles[cat.id] || categoryStyles[1];
        const Icon = style.icon;
        const isSelected = selectedId === cat.id;

        return (
          <button
            key={cat.id}
            type="button"
            onClick={() => onSelect?.(cat.id)}
            className={`flex flex-col items-center justify-center p-4 h-28 rounded-2xl border transition-all active:scale-95 shadow-[0_4px_12px_rgba(0,0,0,0.03)] cursor-pointer ${
              style.bg
            } ${style.borderColor} ${
              isSelected ? 'ring-4 ring-[#FF5722]/40 scale-[1.02] shadow-md' : 'hover:scale-[1.02]'
            }`}
          >
            <div className={`${style.iconColor} mb-2`}>
              <Icon className="w-7 h-7 stroke-[1.8]" />
            </div>
            <span
              className={`text-xs font-black text-center leading-tight tracking-tight ${style.textColor}`}
            >
              {cat.name}
            </span>
          </button>
        );
      })}

      {/* Decorative Stars matching Mockup Photo (10th slot) */}
      <div className="flex items-center justify-center relative pointer-events-none p-2 min-h-[112px]">
        {/* Orange 4-point Sparkle */}
        <div className="absolute top-3 left-8 w-6 h-6 text-[#FF6E40] opacity-90 animate-pulse">
          <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full">
            <path d="M12 0L14.5 9.5L24 12L14.5 14.5L12 24L9.5 14.5L0 12L9.5 9.5L12 0Z" />
          </svg>
        </div>

        {/* Small Orange Star */}
        <div className="absolute bottom-6 left-3 w-4 h-4 text-[#FF9E80] opacity-80">
          <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full">
            <path d="M12 0L14.5 9.5L24 12L14.5 14.5L12 24L9.5 14.5L0 12L9.5 9.5L12 0Z" />
          </svg>
        </div>

        {/* Big Pink 8-point Star Burst */}
        <div className="absolute bottom-1 right-3 w-16 h-16 text-[#FF6893] opacity-80">
          <svg viewBox="0 0 100 100" fill="currentColor" className="w-full h-full">
            <polygon points="50,0 60,35 95,35 68,57 78,92 50,70 22,92 32,57 5,35 40,35" />
          </svg>
        </div>
      </div>
    </div>
  );
}
