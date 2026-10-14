'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeft, RefreshCw, AlertCircle, Clock, CheckCircle2, Mail } from 'lucide-react';

export default function RefundPolicyPage() {
  return (
    <div className="flex-1 flex flex-col bg-[#FFC800] min-h-screen pb-24">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 sticky top-0 bg-[#FFC800] z-10 border-b border-yellow-400/40">
        <Link
          href="/"
          className="w-10 h-10 rounded-full bg-white/70 flex items-center justify-center text-stone-800 hover:bg-white transition active:scale-95"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-base font-black text-[#1A1A1A] leading-tight">
            Վերդարձման Քաղաքականություն
          </h1>
          <p className="text-[10px] text-stone-700">Վերդարձման և չեղարկման քաղաքականություն — Authorium.shop</p>
        </div>
      </div>

      <div className="px-4 py-4 flex flex-col gap-4">

        {/* Intro */}
        <div className="bg-white rounded-3xl p-4 shadow-sm border border-[#ffea9f]">
          <div className="flex items-center gap-2 mb-2">
            <RefreshCw className="w-5 h-5 text-[#FF5722]" />
            <h2 className="text-sm font-black text-[#1A1A1A]">Ընդհանուր դրույթներ</h2>
          </div>
          <p className="text-xs text-stone-700 leading-relaxed font-medium">
            Authorium.shop-ը վաճառում է <b>թվային հեղինական գրքեր (PDF ձևաչափով)</b>,
            որոնք կարճ ժամանակի ընթացքում կարողանում են բացվել և կարդալ հենց այստեղ՝ վերին շեմի մեջ։

          </p>
          <p className="text-xs text-stone-600 leading-relaxed mt-2">
            Սա միայն թվային ձևաչափով է. մենք չենք ուղղում Ձեր բանկային քարտի տվյալները, և վերդարձումների կատարումը նույնպես կատարվում է համապատասխան
            վճարային համակարգերի միջոցով։
          </p>
        </div>

        {/* When refund IS possible */}
        <div className="bg-white rounded-3xl p-4 shadow-sm border border-[#ffea9f]">
          <div className="flex items-center gap-2 mb-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            <h2 className="text-sm font-black text-[#1A1A1A]">Երբ է հնարավոր վերդարձումը</h2>
          </div>
          <ul className="text-xs text-stone-600 leading-relaxed space-y-3">
            <li className="flex items-start gap-2 bg-emerald-50 p-2.5 rounded-xl border border-emerald-200">
              <span className="text-emerald-600 font-bold mt-0.5">✓</span>
              <div>
                <b className="text-stone-800">Կարտ կորցվել է, բայց վճարումը չի կատարվել</b>
                <p className="mt-0.5">Եթե վճարումը 48 ժամվա ընթացքում չի հաստատվել Ձեր կողմից։
                Մենք այն լիորեն վերդարձում ենք վճարային քարտին։</p>
              </div>
            </li>
            <li className="flex items-start gap-2 bg-emerald-50 p-2.5 rounded-xl border border-emerald-200">
              <span className="text-emerald-600 font-bold mt-0.5">✓</span>
              <div>
                <b className="text-stone-800">Խոսով կամ տեխնիկական խնդիր՝ Ձեր կողմից չի բացվել</b>
                <p className="mt-0.5">Այդ դեպքում, եթե գիրքը կա տեխնիկական սխալ (վնասվել է ներբեռնման ժամանակ),
                մենք վերդարձում ենք գումարը կամ սովորաբար տեղակալում։</p>
              </div>
            </li>
            <li className="flex items-start gap-2 bg-emerald-50 p-2.5 rounded-xl border border-emerald-200">
              <span className="text-emerald-600 font-bold mt-0.5">✓</span>
              <div>
                <b className="text-stone-800">Պարտնող դերի վերաբերվելու դեպք (կրկնվող գումարագցում)</b>
                <p className="mt-0.5">Եթե նույնանում գումարը երկու անգամ բանկային քարտից գնվել է՝ վերդարձում ենք։</p>
              </div>
            </li>
          </ul>
        </div>

        {/* When refund is NOT possible */}
        <div className="bg-white rounded-3xl p-4 shadow-sm border border-[#ffea9f]">
          <div className="flex items-center gap-2 mb-3">
            <AlertCircle className="w-5 h-5 text-red-500" />
            <h2 className="text-sm font-black text-[#1A1A1A]">Երբ վերդարձումը ՀՆԱՐԱՎՈՐ ՉԷ</h2>
          </div>
          <ul className="text-xs text-stone-600 leading-relaxed space-y-3">
            <li className="flex items-start gap-2 bg-red-50 p-2.5 rounded-xl border border-red-200">
              <span className="text-red-500 font-bold mt-0.5">✗</span>
              <div>
                <b className="text-stone-800">Գիրքը բացվել է և սկսվել է կարդալը</b>
                <p className="mt-0.5">Ինկ թվային օրակներին վճարի վերդարձումը հնարավոր չէ, եթե Ձեր արդեն բացել եք
                և սկսել կարդալը։</p>
              </div>
            </li>
            <li className="flex items-start gap-2 bg-red-50 p-2.5 rounded-xl border border-red-200">
              <span className="text-red-500 font-bold mt-0.5">✗</span>
              <div>
                <b className="text-stone-800">Մտածելությունը՝ «ուզում եմ մտածելի»</b>
                <p className="mt-0.5">Առաքիչի վերաձեռնումը (buyer’s remorse) վերդարձման հիմք չէ։</p>

              </div>
            </li>
            <li className="flex items-start gap-2 bg-red-50 p-2.5 rounded-xl border border-red-200">
              <span className="text-red-500 font-bold mt-0.5">✗</span>
              <div>
                <b className="text-stone-800">48 ժամվա անցնելույց ձեռքբերման մեջ կատարված վճարը</b>
                <p className="mt-0.5">Եթե 48 ժամվա ընթացքում վճարը կատարվել է ոչ նույնական սխալի պատճառով,
                այդ դեպքում վերդարձումը հնարավոր չէ։</p>
              </div>
            </li>
          </ul>
        </div>

        {/* How to request */}
        <div className="bg-white rounded-3xl p-4 shadow-sm border border-[#ffea9f]">
          <div className="flex items-center gap-2 mb-3">
            <Clock className="w-5 h-5 text-[#FF5722]" />
            <h2 className="text-sm font-black text-[#1A1A1A]">Ինչպե՞ս հայցնել վերդարձում</h2>
          </div>
          <ol className="text-xs text-stone-600 leading-relaxed space-y-2">
            <li className="flex items-start gap-2">
              <span className="w-5 h-5 rounded-full bg-[#FF5722] text-white text-[10px] font-black flex items-center justify-center flex-shrink-0">1</span>
              <span>Ուղարկեք հարցումը <b>info@authorium.store</b> հասցեին կամ Telegram բոտին՝ <b>@authorium_shop_bot</b></span>
            </li>
            <li className="flex items-start gap-2">
              <span className="w-5 h-5 rounded-full bg-[#FF5722] text-white text-[10px] font-black flex items-center justify-center flex-shrink-0">2</span>
              <span>Նշեք <b>պատվերի ID</b>-ն (ապարարակի կոդը) և <b>վճարի ամսաթիվը</b></span>
            </li>
            <li className="flex items-start gap-2">
              <span className="w-5 h-5 rounded-full bg-[#FF5722] text-white text-[10px] font-black flex items-center justify-center flex-shrink-0">3</span>
              <span>Նկարագրեք խնդիրը (տեխնիկական խնդիր, կրկնվող վճար, և այլ)</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="w-5 h-5 rounded-full bg-[#FF5722] text-white text-[10px] font-black flex items-center justify-center flex-shrink-0">4</span>
              <span>Մենք պատասխանում ենք <b>1–3 աշխատաժամվա ընթացքում</b></span>
            </li>
            <li className="flex items-start gap-2">
              <span className="w-5 h-5 rounded-full bg-emerald-600 text-white text-[10px] font-black flex items-center justify-center flex-shrink-0">✓</span>
              <span>Վերդարձումն կատարվում է <b>5–10 աշխատաժամվա</b> ընթացքում կամ Ձեր բանկի քարտին</span>
            </li>
          </ol>
        </div>

        {/* Contact */}
        <div className="bg-white rounded-3xl p-4 shadow-sm border border-[#ffea9f]">
          <div className="flex items-center gap-2 mb-2">
            <Mail className="w-4 h-4 text-[#FF5722]" />
            <h2 className="text-sm font-black text-[#1A1A1A]">Կապի հասցեները</h2>
          </div>
          <p className="text-xs text-stone-600">
            Հարցեր և բողոքներ՝
            <a href="mailto:info@authorium.store" className="text-[#FF5722] font-bold underline">
              info@authorium.store
            </a>
            {' '}կամ Telegram-՝{' '}
            <a href="https://t.me/authorium_shop_bot" className="text-[#FF5722] font-bold underline">
              @authorium_shop_bot
            </a>
          </p>
          <p className="text-[10px] text-stone-400 mt-2">Հրաժարավեց հունվել է՝ 2025 թվականի հունիսին</p>
        </div>

      </div>
    </div>
  );
}
