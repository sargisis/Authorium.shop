'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Mail, MessageCircle, Phone, Globe, Clock, HelpCircle } from 'lucide-react';

export default function ContactPage() {
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
            Կապ մեզ հետ
          </h1>
          <p className="text-[10px] text-stone-700">Ստորագրումներ — Authorium.shop</p>
        </div>
      </div>

      <div className="px-4 py-4 flex flex-col gap-4">

        {/* Company Info */}
        <div className="bg-white rounded-3xl p-4 shadow-sm border border-[#ffea9f]">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 rounded-2xl bg-[#FFC800] flex items-center justify-center shadow-md">
              <span className="text-lg font-black text-[#FF5722]">A</span>
            </div>
            <div>
              <h2 className="text-sm font-black text-[#1A1A1A]">Authorium.shop</h2>
              <p className="text-[10px] text-stone-500">Հայերեն գրքերի հարթակում՝ Հայաստանում</p>
            </div>
          </div>
          <p className="text-xs text-stone-600 leading-relaxed">
            Authorium.shop-ը Հայաստանի հայերեն գրքերի առցանց խանութ է, որտեղ կարող եք
            գտնել նշված գրքերի էլեկտրոնային տարբերակները (PDF)՝ առաջին գիրքը անվճար։
          </p>
        </div>

        {/* Contact channels */}
        <div className="flex flex-col gap-3">
          <h2 className="text-xs font-black text-[#1A1A1A] px-1">Հիմնական կապեր</h2>

          {/* Telegram Bot */}
          <a
            href="https://t.me/authorium_shop_bot"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-white rounded-2xl p-3.5 shadow-sm border border-[#ffea9f] flex items-center gap-3 hover:bg-stone-50 transition active:scale-95"
          >
            <div className="w-10 h-10 rounded-xl bg-blue-500 text-white flex items-center justify-center shadow">
              <MessageCircle className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <p className="text-xs font-black text-stone-900">Telegram բոտ (անվճար է)</p>
              <p className="text-[10px] text-blue-600 font-bold">@authorium_shop_bot</p>
              <p className="text-[9px] text-stone-400">Պահանջում եք՝ պատասխան 1 ժամվա ընթացքում</p>
            </div>
            <span className="text-[10px] font-bold text-[#FF5722]">→</span>
          </a>

          {/* Email */}
          <a
            href="mailto:info@authorium.store"
            className="bg-white rounded-2xl p-3.5 shadow-sm border border-[#ffea9f] flex items-center gap-3 hover:bg-stone-50 transition active:scale-95"
          >
            <div className="w-10 h-10 rounded-xl bg-[#FF5722] text-white flex items-center justify-center shadow">
              <Mail className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <p className="text-xs font-black text-stone-900">Էլեկտրոնային փոստ (Email)</p>
              <p className="text-[10px] text-[#FF5722] font-bold">info@authorium.store</p>
              <p className="text-[9px] text-stone-400">Պատասխան՝ 1–3 աշխատաժամյա ընթացքում</p>
            </div>
            <span className="text-[10px] font-bold text-[#FF5722]">→</span>
          </a>

          {/* Website */}
          <a
            href="https://authorium.store"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-white rounded-2xl p-3.5 shadow-sm border border-[#ffea9f] flex items-center gap-3 hover:bg-stone-50 transition active:scale-95"
          >
            <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow">
              <Globe className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <p className="text-xs font-black text-stone-900">Կայք (Website)</p>
              <p className="text-[10px] text-emerald-700 font-bold">authorium.store</p>
            </div>
            <span className="text-[10px] font-bold text-[#FF5722]">→</span>
          </a>
        </div>

        {/* Working hours */}
        <div className="bg-white rounded-3xl p-4 shadow-sm border border-[#ffea9f]">
          <div className="flex items-center gap-2 mb-3">
            <Clock className="w-5 h-5 text-[#FF5722]" />
            <h2 className="text-sm font-black text-[#1A1A1A]">Աշխատանքային ժամեր և պայմաններ</h2>
          </div>
          <div className="flex flex-col gap-2 text-xs">
            <div className="flex justify-between items-center py-2 border-b border-stone-100">
              <span className="text-stone-600">Աշխատանքային օրեր</span>
              <span className="font-bold text-stone-900">Երկուշաբթի – Ուրբաթ</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-stone-100">
              <span className="text-stone-600">Ժամեր</span>
              <span className="font-bold text-stone-900">10:00 – 19:00 (ՀԱՅԱՍՏԱՆԻ ժամային)</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-stone-100">
              <span className="text-stone-600">Telegram բոտ</span>
              <span className="font-bold text-emerald-600">24/7 ավտոմատ</span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-stone-600">Պատասխան e-mail-ով</span>
              <span className="font-bold text-stone-900">1–3 աշխ. ժամ</span>
            </div>
          </div>
        </div>

        {/* FAQ quick section */}
        <div className="bg-white rounded-3xl p-4 shadow-sm border border-[#ffea9f]">
          <div className="flex items-center gap-2 mb-3">
            <HelpCircle className="w-5 h-5 text-[#FF5722]" />
            <h2 className="text-sm font-black text-[#1A1A1A]">Հաճախ տրվող հարցեր (FAQ)</h2>
          </div>
          <div className="flex flex-col gap-2.5">
            {[
              {
                q: 'Ի՞նչ գրքեր եք վաճառում։',
                a: 'Այն գրքերը, որոնք նշված են խանութում, որպես էլեկտրոնային գրքեր (PDF)՝ Telegram-ով։'
              },
              {
                q: 'Ինչպե՞ս եմ կարող վճարել։',
                a: 'ArCa, Visa, MasterCard (Ameriabank VPOS) և Apple Pay (VPOS-ի միջոցով)։'
              },
              {
                q: 'Անվճար գիրքը ինչպե՞ս ստանալ։',
                a: 'Կայքի էլեկտրոնային տարբերակները հասանելի են անմիջապես ձեր գրքերի էջերում՝ ներբեռնելու համար։ Առաջին գիրքը անվճար է։'
              },
              {
                q: 'Ինչպե՞ս կարդալ գիրքը՝ առանց ձեռքիս բեռնելու։',
                a: 'Դեռ որաժեմից հետո սեղմեք էկրանի վերևի կոճակը՝ «Կարդալ» վերնագրին, և գիրքը կբացվի անմիջապես։'
              },
            ].map((item, i) => (
              <div key={i} className="bg-stone-50 rounded-xl p-3 border border-stone-200">
                <p className="text-xs font-bold text-stone-900 mb-1">❓ {item.q}</p>
                <p className="text-xs text-stone-600">{item.a}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Legal info */}
        <div className="bg-white rounded-3xl p-4 shadow-sm border border-[#ffea9f]">
          <h2 className="text-xs font-black text-stone-800 mb-2">Իրավական տվյալներ</h2>
          <div className="text-[10px] text-stone-500 space-y-1">
            <p>Հաստատող՝ Authorium.store (IP / ՍՊԸ)</p>
            <p>Հաշվեպահակում՝ ՀՀՀ (Գանձելությունները պահվում են բանկում)</p>
            <p>Վճարային միջոցներ՝ Ameriabank ՓԲԸ (VPOS)</p>
            <p>Հասցե՝ Հայաստանի Հանրապետություն, Երևան</p>
            <p>Email: <a href="mailto:info@authorium.store" className="text-[#FF5722] underline">info@authorium.store</a></p>
          </div>

          <div className="flex gap-2 mt-3 text-[10px] font-bold">
            <Link href="/privacy" className="text-[#FF5722] hover:underline">
              Գաղտնիության Քաղաքականություն →
            </Link>
            <span className="text-stone-300">|</span>
            <Link href="/refund" className="text-[#FF5722] hover:underline">
              Վերադարձի Քաղաքականություն →
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}
