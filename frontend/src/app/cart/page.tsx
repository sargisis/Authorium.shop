'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Trash2, Plus, Minus, ArrowRight, Tag } from 'lucide-react';
import { useCartStore } from '@/store';

export default function CartPage() {
  const { items, updateQuantity, removeFromCart, getTotalAmount } = useCartStore();
  const [promo, setPromo] = useState('');
  const [appliedPromo, setAppliedPromo] = useState(false);

  const totalAmount = getTotalAmount();
  const discount = appliedPromo ? Math.round(totalAmount * 0.2) : 0;
  const finalTotal = Math.max(0, totalAmount - discount);

  return (
    <div className="flex-1 flex flex-col px-4 py-3 bg-[#FFC800] min-h-screen">
      {/* Top Header */}
      <div className="flex items-center justify-between mb-4">
        <Link
          href="/"
          className="w-10 h-10 rounded-full bg-white/70 flex items-center justify-center text-stone-800 hover:bg-white transition"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-lg font-extrabold text-[#1A1A1A]">Զամբյուղ</h1>
        <div className="w-10 h-10" />
      </div>

      {items.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center p-6">
          <div className="w-20 h-20 rounded-full bg-white/50 flex items-center justify-center text-stone-600 mb-4">
            <Tag className="w-8 h-8" />
          </div>
          <h2 className="text-base font-bold text-stone-800">Զամբյուղը դատարկ է</h2>
          <p className="text-xs text-stone-600 mt-1 max-w-xs">
            Դուք դեռ չեք ավելացրել որևէ գիրք ձեր զամբյուղում
          </p>
          <Link
            href="/"
            className="mt-5 px-6 py-2.5 bg-[#FF5722] text-white text-xs font-bold rounded-full shadow-md hover:bg-[#E64A19] transition"
          >
            Դիտել գրքերը
          </Link>
        </div>
      ) : (
        <div className="flex-1 flex flex-col pb-20">
          {/* Cart Item Cards List matching mockup */}
          <div className="flex flex-col gap-3 mb-5">
            {items.map(({ book, quantity }) => (
              <div
                key={book.id}
                className="bg-white rounded-2xl p-3 shadow-sm border border-[#ffea9f] flex items-center gap-3"
              >
                <img
                  src={book.cover_url}
                  alt={book.title}
                  className="w-14 h-20 object-cover rounded-xl shadow-inner flex-shrink-0"
                />

                <div className="flex-1 min-w-0">
                  <h3 className="text-xs font-bold text-[#1A1A1A] truncate">{book.title}</h3>
                  <p className="text-[11px] text-[#757575] truncate">{book.author}</p>
                  <p className="text-xs font-extrabold text-[#FF5722] mt-1">
                    {book.price} AMD
                  </p>
                </div>

                <div className="flex flex-col items-end justify-between self-stretch">
                  <button
                    onClick={() => removeFromCart(book.id)}
                    className="text-stone-400 hover:text-red-500 transition p-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>

                  <div className="flex items-center gap-2 bg-stone-100 rounded-full px-2 py-0.5 border border-stone-200">
                    <button
                      onClick={() => updateQuantity(book.id, -1)}
                      className="text-stone-600 hover:text-black font-bold text-xs"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="text-xs font-extrabold text-stone-800 w-3 text-center">
                      {quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(book.id, 1)}
                      className="text-stone-600 hover:text-black font-bold text-xs"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Promo Code Box matching mockup */}
          <div className="bg-white rounded-2xl p-3 shadow-sm border border-[#ffea9f] mb-4">
            <span className="text-[11px] font-bold text-stone-500 mb-1.5 block">Պրոմոկոդ</span>
            <div className="flex gap-2">
              <input
                type="text"
                value={promo}
                onChange={(e) => setPromo(e.target.value)}
                placeholder="Մուտքագրեք (օր. AUTHORIUM)"
                className="flex-1 bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-xs uppercase focus:outline-none focus:ring-1 focus:ring-[#FF5722]"
              />
              <button
                onClick={() => {
                  const p = promo.trim().toUpperCase();
                  if (p === 'AUTHORIUM' || p === 'GIFT') {
                    setAppliedPromo(true);
                  } else if (p.length > 0) {
                    alert('Անվավեր պրոմոկոդ: Կարող եք օգտագործել "AUTHORIUM" կամ "GIFT"');
                  }
                }}
                className="px-4 py-2 bg-[#FFC800] hover:bg-yellow-400 text-stone-900 text-xs font-extrabold rounded-xl transition"
              >
                →
              </button>
            </div>
            {appliedPromo && (
              <span className="text-[11px] text-emerald-600 font-semibold mt-1.5 block">
                ✓ 20% Զեղչը ակտիվացված է ({promo.trim().toUpperCase()})
              </span>
            )}
          </div>

          {/* Summary Box & Proceed Button */}
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-[#ffea9f] flex flex-col gap-3">
            <div className="flex items-center justify-between text-xs text-stone-600">
              <span>Ընդհանուր գումար</span>
              <span className="font-extrabold text-stone-900 text-sm">{totalAmount} AMD</span>
            </div>
            {appliedPromo && (
              <div className="flex items-center justify-between text-xs text-emerald-600">
                <span>Զեղչ (20%)</span>
                <span className="font-bold">- {discount} AMD</span>
              </div>
            )}
            <div className="flex items-center justify-between text-xs font-black text-stone-900 pt-2 border-t border-stone-100">
              <span className="text-sm">Վերջնական</span>
              <span className="text-base text-[#FF5722]">{finalTotal} AMD</span>
            </div>

            <Link
              href={appliedPromo ? `/checkout?promo=${encodeURIComponent(promo.trim().toUpperCase())}` : '/checkout'}
              prefetch={true}
              className="w-full mt-2 py-3 bg-[#FF5722] hover:bg-[#E64A19] text-white text-xs font-extrabold rounded-full flex items-center justify-center gap-1.5 shadow-lg active:scale-95 transition"
            >
              <span>Շարունակել</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
