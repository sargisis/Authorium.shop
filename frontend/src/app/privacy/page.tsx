'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Shield, Eye, Lock, Server, Mail } from 'lucide-react';

export default function PrivacyPolicyPage() {
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
            Գաղտնիության Քաղաքականություն
          </h1>
          <p className="text-[10px] text-stone-700">Privacy Policy — Authorium.shop</p>
        </div>
      </div>

      <div className="px-4 py-4 flex flex-col gap-4">
        {/* Intro */}
        <div className="bg-white rounded-3xl p-4 shadow-sm border border-[#ffea9f]">
          <div className="flex items-center gap-2 mb-2">
            <Shield className="w-5 h-5 text-[#FF5722]" />
            <h2 className="text-sm font-black text-[#1A1A1A]">Ընդհանուր տեղեկատվություն</h2>
          </div>
          <p className="text-xs text-stone-600 leading-relaxed">
            Authorium.shop-ը (այսուհետ՝ «Կայք») հարգում է Ձեր անձնական տվյալների գաղտնիությունը եւ պատասխանատվություն է կրում դրանց անվտանգ պահպանման համար։
          </p>
          <p className="text-xs text-stone-700 leading-relaxed mt-2 font-medium">
            Կայքն օգտագործելով՝ Դուք համաձայնում եք սույն Գաղտնիության Քաղաքականությանը։
          </p>
        </div>

        {/* Section 1 */}
        <div className="bg-white rounded-3xl p-4 shadow-sm border border-[#ffea9f]">
          <div className="flex items-center gap-2 mb-3">
            <Eye className="w-5 h-5 text-[#FF5722]" />
            <h2 className="text-sm font-black text-[#1A1A1A]">1. Ինչ տվյալներ ենք հավաքում</h2>
          </div>
          <ul className="text-xs text-stone-600 leading-relaxed space-y-2">
            <li className="flex items-start gap-2">
              <span className="text-[#FF5722] font-bold mt-0.5">•</span>
              <span><b>Telegram ID, անուն, ազգանուն</b> — Telegram Mini App-ի վավերացման նպատակով։</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[#FF5722] font-bold mt-0.5">•</span>
              <span><b>Պատվերի տվյալներ (գումար, անուն, ամսաթիվ)</b> — գնումների եւ վճարումների համար։</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[#FF5722] font-bold mt-0.5">•</span>
              <span><b>Բանկային քարտի տվյալներ</b> — CVV-ն եւ ամբողջական համարը մեր սերվերներում երբեք չեն պահվում, մշակվում են անմիջապես վճարային համակարգերի (Ameriabank / Idram) կողմից։</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[#FF5722] font-bold mt-0.5">•</span>
              <span><b>Տեխնիկական տվյալներ (IP, սարք)</b> — ծառայության անվտանգության ապահովման համար։</span>
            </li>
          </ul>
        </div>

        {/* Section 2 */}
        <div className="bg-white rounded-3xl p-4 shadow-sm border border-[#ffea9f]">
          <div className="flex items-center gap-2 mb-3">
            <Server className="w-5 h-5 text-[#FF5722]" />
            <h2 className="text-sm font-black text-[#1A1A1A]">2. Ինչ նպատակով ենք օգտագործում</h2>
          </div>
          <ul className="text-xs text-stone-600 leading-relaxed space-y-2">
            <li className="flex items-start gap-2">
              <span className="text-[#FF5722] font-bold mt-0.5">•</span>
              <span>Գնումների մշակում եւ կատարում։</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[#FF5722] font-bold mt-0.5">•</span>
              <span>Վճարային գործընթացի (VPOS / Idram) իրականացում։</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[#FF5722] font-bold mt-0.5">•</span>
              <span>Գրքի հասանելիության ապահովում գնումից հետո։</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[#FF5722] font-bold mt-0.5">•</span>
              <span>Ծառայության անվտանգության ու որակի բարելավում։</span>
            </li>
          </ul>
        </div>

        {/* Section 3 */}
        <div className="bg-white rounded-3xl p-4 shadow-sm border border-[#ffea9f]">
          <div className="flex items-center gap-2 mb-3">
            <Lock className="w-5 h-5 text-[#FF5722]" />
            <h2 className="text-sm font-black text-[#1A1A1A]">3. Անվտանգություն եւ պաշտպանություն</h2>
          </div>
          <ul className="text-xs text-stone-600 leading-relaxed space-y-2 mt-2">
            <li className="flex items-start gap-2">
              <span className="text-emerald-600 font-bold mt-0.5">✓</span>
              <span><b>SSL/TLS 256-բիթ</b> — գործարքների բարձր գաղտնիություն։</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-emerald-600 font-bold mt-0.5">✓</span>
              <span><b>ArCa 3D-Secure 2.0</b> — բանկային քարտի երկաստիճան հաստատում։</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-emerald-600 font-bold mt-0.5">✓</span>
              <span>Անձնական տվյալները երրորդ կողմերին երբեք չեն վաճառվում։</span>
            </li>
          </ul>
        </div>

        {/* Section 4 */}
        <div className="bg-white rounded-3xl p-4 shadow-sm border border-[#ffea9f]">
          <h2 className="text-sm font-black text-[#1A1A1A] mb-2">4. Երրորդ կողմեր</h2>
          <p className="text-xs text-stone-600 leading-relaxed">
            Ձեր տվյալների մշակմանը կարող են մասնակցել հետեւյալ գործընկերները.
          </p>
          <ul className="text-xs text-stone-600 mt-2 space-y-1">
            <li className="flex items-start gap-2">
              <span className="text-[#FF5722] font-bold">•</span>
              <span><b>Ameriabank ՓԲԸ</b> — բանկային քարտերի վճարումների մշակում։</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[#FF5722] font-bold">•</span>
              <span><b>ԻԴՐԱՄ ՍՊԸ</b> — Idram դրամապանակի վճարումներ։</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[#FF5722] font-bold">•</span>
              <span><b>Telegram Inc.</b> — Mini App հարթակ։</span>
            </li>
          </ul>
        </div>

        {/* Section 5 */}
        <div className="bg-white rounded-3xl p-4 shadow-sm border border-[#ffea9f]">
          <h2 className="text-sm font-black text-[#1A1A1A] mb-2">5. Ձեր իրավունքները</h2>
          <ul className="text-xs text-stone-600 leading-relaxed space-y-2">
            <li className="flex items-start gap-2">
              <span className="text-[#FF5722] font-bold mt-0.5">•</span>
              <span>Ստանալ Ձեր անձնական տվյալների պատճենը։</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[#FF5722] font-bold mt-0.5">•</span>
              <span>Փոփոխել կամ ջնջել Ձեր անձնական տվյալները։</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[#FF5722] font-bold mt-0.5">•</span>
              <span>Հայտնել Ձեր տվյալների մշակման դեմ առարկություն։</span>
            </li>
          </ul>
          <p className="text-xs text-stone-500 mt-2">
            Դիմումի համար գրեք. {' '}
            <a href="mailto:info@authorium.store" className="text-[#FF5722] font-bold underline">
              info@authorium.store
            </a>
          </p>
        </div>

        <div className="bg-white rounded-3xl p-4 shadow-sm border border-[#ffea9f]">
          <div className="flex items-center gap-2 mb-2">
            <Mail className="w-4 h-4 text-[#FF5722]" />
            <h2 className="text-sm font-black text-[#1A1A1A]">Կապ եւ Փոփոխություններ</h2>
          </div>
          <p className="text-xs text-stone-600">
            Սույն Գաղտնիության Քաղաքականությունը կարող է փոփոխվել։ Փոփոխությունների դեպքում կտեղեկացվեք Telegram բոտի՝ @authorium_shop_bot կամ {' '}
            <a href="mailto:info@authorium.store" className="text-[#FF5722] font-bold underline">
              info@authorium.store
            </a>{' '}
            միջոցով։
          </p>
          <p className="text-[10px] text-stone-400 mt-2">Հաստատված է՝ 2025</p>
        </div>
      </div>
    </div>
  );
}
