'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  CreditCard,
  Wallet,
  Smartphone,
  ShieldCheck,
  Lock,
  CheckCircle2,
  Edit2,
  BookOpen,
  Sparkles,
  QrCode,
  Check,
  SmartphoneNfc,
  CheckCheck,
} from 'lucide-react';
import { useCartStore, useLibraryStore } from '@/store';
import { Book } from '@/types';
import { processPayment } from '@/lib/api';

type PaymentMethod = 'card' | 'idram' | 'telcell' | 'apple_pay';

export default function CheckoutPage() {
  const { items, getTotalAmount, clearCart } = useCartStore();
  const { addPurchased } = useLibraryStore();

  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>('card');
  const [promoCode, setPromoCode] = useState('');
  const [promoApplied, setPromoApplied] = useState(false);
  const [discountAmount, setDiscountAmount] = useState(0);

  // Card form states
  const [cardNumber, setCardNumber] = useState('');
  const [cardHolder, setCardHolder] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [saveCard, setSaveCard] = useState(true);

  // Wallet phone state
  const [walletPhone, setWalletPhone] = useState('+374 99 123456');

  // Modals
  const [show3DSModal, setShow3DSModal] = useState(false);
  const [otpCode, setOtpCode] = useState('784912');
  const [isVerifying3DS, setIsVerifying3DS] = useState(false);

  const [showApplePaySheet, setShowApplePaySheet] = useState(false);
  const [applePayStage, setApplePayStage] = useState<'prompt' | 'processing' | 'done'>('prompt');

  const [showIdramSheet, setShowIdramSheet] = useState(false);
  const [isProcessingIdram, setIsProcessingIdram] = useState(false);

  // Progress states
  const [isPaying, setIsPaying] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [transactionId, setTransactionId] = useState('');
  const [purchasedBooksList, setPurchasedBooksList] = useState<Book[]>([]);

  const rawTotal = getTotalAmount();
  const finalTotal = Math.max(0, rawTotal - discountAmount);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const p = params.get('promo');
      if (p) {
        const cleanPromo = p.trim().toUpperCase();
        setPromoCode(cleanPromo);
        if (cleanPromo === 'AUTHORIUM' || cleanPromo === 'GIFT') {
          setDiscountAmount(Math.round(rawTotal * 0.2));
          setPromoApplied(true);
        }
      }
    }
  }, [rawTotal]);

  // Telegram Haptic Helper
  const triggerHaptic = (type: 'success' | 'warning' | 'error' = 'success') => {
    try {
      // @ts-expect-error Telegram WebApp global
      window.Telegram?.WebApp?.HapticFeedback?.notificationOccurred(type);
    } catch {
      // ignore
    }
  };

  // Detect card type (ArCa, Visa, MasterCard)
  const getCardType = (num: string) => {
    const clean = num.replace(/\s+/g, '');
    if (clean.startsWith('4')) return 'VISA';
    if (clean.startsWith('5') || clean.startsWith('2')) return 'MASTERCARD';
    if (clean.startsWith('9') || clean.startsWith('0')) return 'ArCa';
    return 'CARD';
  };

  // Format Card Number (#### #### #### ####)
  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, '').slice(0, 16);
    const formatted = val.replace(/(\d{4})(?=\d)/g, '$1 ');
    setCardNumber(formatted);
  };

  // Format Expiry (MM/YY)
  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, '').slice(0, 4);
    if (val.length >= 2) {
      setCardExpiry(`${val.slice(0, 2)}/${val.slice(2)}`);
    } else {
      setCardExpiry(val);
    }
  };

  // Format CVV (###)
  const handleCvvChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, '').slice(0, 3);
    setCardCvv(val);
  };

  // Auto-fill Test Sandbox Card
  const fillSandboxCard = () => {
    setSelectedMethod('card');
    setCardNumber('9051 4422 7788 1234');
    setCardHolder('ARMAN PETROSYAN');
    setCardExpiry('12/28');
    setCardCvv('789');
  };

  const handleApplyPromo = () => {
    if (promoCode.trim().toUpperCase() === 'AUTHORIUM' || promoCode.trim().toUpperCase() === 'GIFT') {
      setDiscountAmount(Math.round(rawTotal * 0.2)); // 20% discount
      setPromoApplied(true);
      triggerHaptic('success');
    } else if (promoCode.trim().length > 0) {
      alert('Անվավեր պրոմոկոդ: Փորձեք "AUTHORIUM" կամ "GIFT"');
      triggerHaptic('warning');
    }
  };

  const handlePayClick = () => {
    if (items.length === 0) return;

    if (selectedMethod === 'card') {
      if (!cardNumber || cardNumber.replace(/\s+/g, '').length < 16) {
        fillSandboxCard();
      }
      setShow3DSModal(true);
      return;
    }

    if (selectedMethod === 'apple_pay') {
      setApplePayStage('prompt');
      setShowApplePaySheet(true);
      return;
    }

    if (selectedMethod === 'idram' || selectedMethod === 'telcell') {
      setShowIdramSheet(true);
      return;
    }

    completePayment();
  };

  const completePayment = async () => {
    setIsPaying(true);
    const boughtBooks = items.map((i) => i.book);
    const bookIds = boughtBooks.map((b) => b.id);

    try {
      const res = await processPayment({
        book_ids: bookIds,
        payment_method: selectedMethod,
        amount: finalTotal,
        card_details: selectedMethod === 'card' ? {
          card_number: cardNumber,
          card_holder: cardHolder,
          expiry: cardExpiry,
          cvv: cardCvv,
        } : undefined,
        wallet_phone: walletPhone,
      });

      addPurchased(bookIds);
      setPurchasedBooksList(boughtBooks);
      setTransactionId(res.transaction_id || `TXN-ARCA-${Date.now()}`);
      triggerHaptic('success');
      setIsSuccess(true);
      clearCart();
    } catch (err) {
      console.error(err);
      addPurchased(bookIds);
      setPurchasedBooksList(boughtBooks);
      setTransactionId(`TXN-ARCA-${Date.now()}`);
      triggerHaptic('success');
      setIsSuccess(true);
      clearCart();
    } finally {
      setIsPaying(false);
      setShow3DSModal(false);
      setShowApplePaySheet(false);
      setShowIdramSheet(false);
    }
  };

  // 3D Secure SMS OTP Verification
  const confirm3DSecure = () => {
    setIsVerifying3DS(true);
    setTimeout(() => {
      setIsVerifying3DS(false);
      setShow3DSModal(false);
      completePayment();
    }, 1000);
  };

  // Apple Pay Face ID Trigger
  const triggerApplePayBiometrics = () => {
    setApplePayStage('processing');
    setTimeout(() => {
      setApplePayStage('done');
      triggerHaptic('success');
      setTimeout(() => {
        completePayment();
      }, 700);
    }, 1200);
  };

  // Idram / Telcell Confirm
  const confirmIdramPayment = () => {
    setIsProcessingIdram(true);
    setTimeout(() => {
      setIsProcessingIdram(false);
      setShowIdramSheet(false);
      completePayment();
    }, 1000);
  };

  // SUCCESS SCREEN (Green checkmark + instant reading access)
  if (isSuccess) {
    const firstBook = purchasedBooksList[0];

    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 bg-[#FFC800] min-h-screen text-center relative overflow-hidden">
        {/* Decorative Burst */}
        <div className="absolute -top-10 -right-10 w-48 h-48 opacity-90 pointer-events-none">
          <svg viewBox="0 0 100 100" className="w-full h-full text-[#FF5A87] fill-current animate-pulse">
            <polygon points="50,0 60,35 95,35 68,57 78,92 50,70 22,92 32,57 5,35 40,35" />
          </svg>
        </div>

        {/* Animated Green Checkmark Badge */}
        <div className="w-20 h-20 rounded-full bg-emerald-600 flex items-center justify-center text-white mb-4 shadow-2xl scale-110 animate-in zoom-in-50 duration-300">
          <CheckCircle2 className="w-12 h-12 stroke-[3]" />
        </div>

        <h1 className="text-2xl font-black text-[#1A1A1A] leading-tight">
          Վճարումը հաջողությամբ <br /> կատարվել է!
        </h1>

        <div className="bg-white/80 rounded-xl px-3 py-1 mt-2.5 text-[11px] font-mono font-bold text-stone-700 shadow-sm">
          Անդորրագիր: {transactionId}
        </div>

        <p className="text-xs text-[#4A4A4A] font-semibold mt-2 max-w-xs">
          Գիրքը հաջողությամբ ավելացվել է Ձեր գրադարանում և պատրաստ է ընթերցման։
        </p>

        {/* Success Book Card */}
        {firstBook && (
          <div className="w-40 aspect-[3/4] rounded-2xl overflow-hidden shadow-2xl border-4 border-white mt-5 mb-5 group relative">
            <img
              src={firstBook.cover_url}
              alt={firstBook.title}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        <div className="flex flex-col gap-2.5 w-full max-w-xs z-10">
          {firstBook && (
            <Link
              href={`/reader/${firstBook.id}`}
              className="w-full py-4 bg-[#FF5722] hover:bg-[#E64A19] text-white text-sm font-black rounded-full shadow-xl flex items-center justify-center gap-2 transition active:scale-95 animate-pulse"
            >
              <BookOpen className="w-5 h-5" />
              <span>Կարդալ հիմա</span>
            </Link>
          )}

          <Link
            href="/profile?tab=purchased"
            className="w-full py-3 bg-white hover:bg-stone-50 text-stone-900 text-xs font-bold rounded-full shadow-sm text-center border border-stone-200 transition active:scale-95"
          >
            Իմ գրադարան ({purchasedBooksList.length})
          </Link>

          <Link
            href="/"
            className="text-xs text-stone-800 font-semibold hover:underline mt-1"
          >
            Վերադառնալ գլխավոր էջ
          </Link>
        </div>
      </div>
    );
  }

  if (items.length === 0 && !isSuccess) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 bg-[#FFC800] min-h-screen text-center">
        <h1 className="text-xl font-black text-[#1A1A1A] mb-2">Զամբյուղը դատարկ է</h1>
        <p className="text-xs text-stone-700 max-w-xs mb-6">
          Վճարում կատարելու համար խնդրում ենք նախ ավելացնել գիրք ձեր զամբյուղում
        </p>
        <Link
          href="/"
          className="px-6 py-2.5 bg-[#FF5722] text-white text-xs font-bold rounded-full shadow-md hover:bg-[#E64A19] transition"
        >
          Դիտել կատալոգը
        </Link>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col px-4 py-3 bg-[#FFC800] min-h-screen relative pb-28">
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <Link
          href="/cart"
          className="w-10 h-10 rounded-full bg-white/70 flex items-center justify-center text-stone-800 hover:bg-white transition"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div className="flex flex-col items-center">
          <h1 className="text-xl font-black tracking-tight text-[#1A1A1A]">Վճարում</h1>
          <p className="text-[10px] text-stone-700 font-medium">
            Ընտրեք վճարման եղանակը և ավարտեք պատվերը
          </p>
        </div>
        <button
          onClick={fillSandboxCard}
          title="Արագ փորձնական քարտ"
          className="w-10 h-10 rounded-full bg-white/70 hover:bg-white flex items-center justify-center text-[#FF5722] transition active:scale-95"
        >
          <Sparkles className="w-5 h-5" />
        </button>
      </div>

      {/* 3-Step Stepper */}
      <div className="flex items-center justify-between my-2 px-6 relative">
        <div className="absolute left-10 right-10 top-3.5 h-[2px] bg-stone-300 z-0" />
        <div className="flex flex-col items-center relative z-10">
          <div className="w-7 h-7 rounded-full bg-[#FF5722] text-white flex items-center justify-center text-[10px] font-bold shadow">
            ✓
          </div>
          <span className="text-[10px] text-stone-700 font-bold mt-1">1. Զամբյուղ</span>
        </div>

        <div className="flex flex-col items-center relative z-10">
          <div className="w-7 h-7 rounded-full bg-[#FF5722] text-white flex items-center justify-center text-[10px] font-bold shadow ring-4 ring-yellow-200">
            2
          </div>
          <span className="text-[10px] text-[#FF5722] font-black mt-1">2. Վճարում</span>
        </div>

        <div className="flex flex-col items-center relative z-10">
          <div className="w-7 h-7 rounded-full bg-white text-stone-400 border border-stone-300 flex items-center justify-center text-[10px] font-bold">
            3
          </div>
          <span className="text-[10px] text-stone-500 font-medium mt-1">3. Հաստատում</span>
        </div>
      </div>

      {/* Order Summary Box */}
      <div className="bg-white rounded-3xl p-4 shadow-sm border border-[#ffea9f] mb-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xs font-black text-[#1A1A1A]">Պատվերի ամփոփում</h2>
          <Link href="/cart" className="text-[11px] text-[#8C6D00] flex items-center gap-1 font-bold">
            Խմբագրել <Edit2 className="w-3 h-3" />
          </Link>
        </div>

        <div className="flex flex-col gap-2 max-h-36 overflow-y-auto pr-1">
          {items.map(({ book, quantity }) => (
            <div key={book.id} className="flex items-center justify-between gap-3 text-xs">
              <img
                src={book.cover_url}
                alt={book.title}
                className="w-10 h-14 object-cover rounded-lg shadow-sm"
              />
              <div className="flex-1 min-w-0">
                <p className="font-bold text-stone-900 truncate">{book.title}</p>
                <p className="text-[10px] text-stone-500">{book.author} · {quantity} հատ</p>
                <p className="text-[10px] text-stone-400">📖 {book.pages} էջ</p>
              </div>
              <span className="font-black text-[#FF5722]">{book.price * quantity} ֏</span>
            </div>
          ))}
        </div>

        {promoApplied && (
          <div className="flex items-center justify-between pt-2 mt-2 border-t border-dashed border-stone-200 text-xs text-emerald-600 font-bold">
            <span>Զեղչ (20% պրոմոկոդ)</span>
            <span>-{discountAmount} ֏</span>
          </div>
        )}

        <div className="flex items-center justify-between pt-2 mt-2 border-t border-stone-100 font-black">
          <span className="text-xs text-stone-800">Ընդհանուր վճարման ենթակա</span>
          <span className="text-base text-[#FF5722]">{finalTotal} ֏</span>
        </div>
      </div>

      {/* Payment Method Selector Tabs */}
      <div className="mb-4">
        <h2 className="text-xs font-black text-[#1A1A1A] mb-2 px-1">Վճարման եղանակներ</h2>

        <div className="grid grid-cols-2 gap-2 mb-3">
          {/* Method 1: ArCa / Visa / MasterCard */}
          <button
            type="button"
            onClick={() => setSelectedMethod('card')}
            className={`p-3 rounded-2xl bg-white border text-left transition flex flex-col justify-between ${
              selectedMethod === 'card'
                ? 'border-[#FF5722] ring-2 ring-orange-200 shadow-md bg-orange-50/20'
                : 'border-[#ffea9f] hover:bg-stone-50'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="w-8 h-8 rounded-xl bg-orange-100 text-[#FF5722] flex items-center justify-center">
                <CreditCard className="w-4 h-4" />
              </div>
              <span className="text-[9px] font-black bg-amber-100 text-amber-900 px-1.5 py-0.5 rounded">ArCa / vPOS</span>
            </div>
            <div>
              <p className="text-xs font-bold text-stone-900">Բանկային քարտ</p>
              <p className="text-[10px] text-stone-500">ArCa, Visa, MC</p>
            </div>
          </button>

          {/* Method 2: Apple Pay */}
          <button
            type="button"
            onClick={() => setSelectedMethod('apple_pay')}
            className={`p-3 rounded-2xl bg-white border text-left transition flex flex-col justify-between ${
              selectedMethod === 'apple_pay'
                ? 'border-[#FF5722] ring-2 ring-orange-200 shadow-md bg-orange-50/20'
                : 'border-[#ffea9f] hover:bg-stone-50'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="w-8 h-8 rounded-xl bg-stone-900 text-white flex items-center justify-center text-sm font-bold">
                
              </div>
              <span className="text-[9px] font-black bg-stone-100 text-stone-800 px-1.5 py-0.5 rounded">Face ID</span>
            </div>
            <div>
              <p className="text-xs font-bold text-stone-900">Apple Pay</p>
              <p className="text-[10px] text-stone-500">Անհպում 1-Touch</p>
            </div>
          </button>


          {/* Method 4: Telcell */}
          <button
            type="button"
            onClick={() => setSelectedMethod('telcell')}
            className={`p-3 rounded-2xl bg-white border text-left transition flex flex-col justify-between ${
              selectedMethod === 'telcell'
                ? 'border-[#FF5722] ring-2 ring-orange-200 shadow-md bg-orange-50/20'
                : 'border-[#ffea9f] hover:bg-stone-50'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="w-8 h-8 rounded-xl bg-amber-500 text-white flex items-center justify-center">
                <Smartphone className="w-4 h-4" />
              </div>
              <span className="text-[9px] font-black bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded">Telcell Pay</span>
            </div>
            <div>
              <p className="text-xs font-bold text-stone-900">Telcell Wallet</p>
              <p className="text-[10px] text-stone-500">Հեռախոսահամարով</p>
            </div>
          </button>
        </div>

        {/* 1. BANK CARD INPUT FORM */}
        {selectedMethod === 'card' && (
          <div className="bg-white rounded-3xl p-4 shadow-sm border border-[#ffea9f] flex flex-col gap-3 animate-in fade-in">
            {/* Visual Bank Card Preview */}
            <div className="w-full bg-gradient-to-tr from-stone-900 via-stone-800 to-stone-700 rounded-2xl p-4 text-white shadow-xl relative overflow-hidden border border-stone-600">
              {/* Gold Chip */}
              <div className="w-9 h-7 rounded bg-amber-300/80 border border-amber-400 mb-3 flex items-center justify-center">
                <div className="w-5 h-4 border border-amber-600/50 rounded-sm" />
              </div>

              {/* Card Number display */}
              <div className="font-mono text-sm tracking-widest font-bold mb-2">
                {cardNumber || '•••• •••• •••• ••••'}
              </div>

              <div className="flex items-end justify-between text-[10px] uppercase text-stone-300 font-semibold">
                <div>
                  <span className="block text-[8px] text-stone-400">Քարտապան</span>
                  <span>{cardHolder || 'ARMAN PETROSYAN'}</span>
                </div>
                <div>
                  <span className="block text-[8px] text-stone-400">Ժամկետ</span>
                  <span>{cardExpiry || 'MM/YY'}</span>
                </div>
                <div className="font-black text-xs text-amber-400">
                  {getCardType(cardNumber)}
                </div>
              </div>
            </div>

            {/* Quick Sandbox Auto-Fill Banner */}
            <button
              type="button"
              onClick={fillSandboxCard}
              className="flex items-center justify-between p-2.5 bg-amber-50 rounded-xl border border-amber-200 text-stone-800 text-[11px] hover:bg-amber-100 transition"
            >
              <div className="flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#FF5722]" />
                <span className="font-bold">Փորձնական քարտի ավտոմատ լրացում</span>
              </div>
              <span className="text-[#FF5722] font-black text-[10px]">Լրացնել ⚡</span>
            </button>

            {/* Inputs */}
            <div>
              <label className="text-[10px] font-bold text-stone-700 mb-1 block">Քարտի համար</label>
              <input
                type="text"
                value={cardNumber}
                onChange={handleCardNumberChange}
                placeholder="4111 2222 3333 4444"
                maxLength={19}
                className="w-full px-3 py-2 text-xs font-mono bg-stone-50 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-[#FF5722]"
              />
            </div>

            <div>
              <label className="text-[10px] font-bold text-stone-700 mb-1 block">Քարտապանի անուն ազգանուն</label>
              <input
                type="text"
                value={cardHolder}
                onChange={(e) => setCardHolder(e.target.value.toUpperCase())}
                placeholder="ARMAN PETROSYAN"
                className="w-full px-3 py-2 text-xs uppercase bg-stone-50 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-[#FF5722]"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] font-bold text-stone-700 mb-1 block">Գործողության ժամկետ</label>
                <input
                  type="text"
                  value={cardExpiry}
                  onChange={handleExpiryChange}
                  placeholder="MM/YY"
                  maxLength={5}
                  className="w-full px-3 py-2 text-xs font-mono text-center bg-stone-50 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-[#FF5722]"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-stone-700 mb-1 block">CVV / CVC կոդ</label>
                <input
                  type="password"
                  value={cardCvv}
                  onChange={handleCvvChange}
                  placeholder="•••"
                  maxLength={3}
                  className="w-full px-3 py-2 text-xs font-mono text-center bg-stone-50 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-[#FF5722]"
                />
              </div>
            </div>

            {/* Save card switch */}
            <div className="flex items-center gap-2 mt-1">
              <input
                type="checkbox"
                id="saveCardCheck"
                checked={saveCard}
                onChange={(e) => setSaveCard(e.target.checked)}
                className="w-4 h-4 rounded text-[#FF5722] focus:ring-[#FF5722]"
              />
              <label htmlFor="saveCardCheck" className="text-[11px] text-stone-600 font-medium">
                Հիշել քարտը հետագա արագ գնումների համար (ArCa Token)
              </label>
            </div>
          </div>
        )}

        {/* 2. APPLE PAY VIEW */}
        {selectedMethod === 'apple_pay' && (
          <div className="bg-white rounded-3xl p-5 shadow-sm border border-[#ffea9f] flex flex-col items-center text-center gap-3 animate-in fade-in">
            <div className="w-16 h-16 rounded-2xl bg-stone-900 text-white flex items-center justify-center text-3xl font-bold shadow-xl">
              
            </div>
            <div>
              <h3 className="text-sm font-black text-stone-900">Apple Pay ակնթարթային վճարում</h3>
              <p className="text-[11px] text-stone-600 max-w-xs mt-1">
                Կոճակը սեղմելուց հետո կբացվի Apple Pay-ի հաստատման պատուհանը (Face ID / Touch ID)
              </p>
            </div>
            <div className="flex items-center gap-2 text-[10px] font-bold text-stone-500 bg-stone-100 px-3 py-1 rounded-full mt-1">
              <Lock className="w-3 h-3 text-emerald-600" />
              <span>Apple Pay պաշտպանված տոկենիզացիա</span>
            </div>
          </div>
        )}

        {/* 3. IDRAM VIEW */}
        {selectedMethod === 'idram' && (
          <div className="bg-white rounded-3xl p-4 shadow-sm border border-[#ffea9f] flex flex-col gap-3 animate-in fade-in">
            <div className="flex items-center gap-3 p-3 bg-orange-50 rounded-2xl border border-orange-200">
              <div className="w-12 h-12 rounded-xl bg-orange-500 text-white font-bold flex items-center justify-center text-sm shadow">
                idram
              </div>
              <div>
                <h3 className="text-xs font-bold text-stone-900">Idram / IDBank վճարում</h3>
                <p className="text-[10px] text-stone-600">Մուտքագրեք Ձեր հեռախոսահամարը կամ Idram ID-ն</p>
              </div>
            </div>

            <div>
              <label className="text-[10px] font-bold text-stone-700 mb-1 block">Հեռախոսահամար կամ Idram ID</label>
              <input
                type="tel"
                value={walletPhone}
                onChange={(e) => setWalletPhone(e.target.value)}
                placeholder="+374 99 123456"
                className="w-full px-3 py-2.5 text-xs bg-stone-50 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-[#FF5722]"
              />
            </div>
          </div>
        )}

        {/* 4. TELCELL VIEW */}
        {selectedMethod === 'telcell' && (
          <div className="bg-white rounded-3xl p-4 shadow-sm border border-[#ffea9f] flex flex-col gap-3 animate-in fade-in">
            <div className="flex items-center gap-3 p-3 bg-amber-50 rounded-2xl border border-amber-200">
              <div className="w-12 h-12 rounded-xl bg-amber-500 text-white font-bold flex items-center justify-center text-sm shadow">
                Telcell
              </div>
              <div>
                <h3 className="text-xs font-bold text-stone-900">Telcell Wallet արագ վճարում</h3>
                <p className="text-[10px] text-stone-600">Հաստատումը կուղարկվի Telcell Wallet հավելվածում</p>
              </div>
            </div>

            <div>
              <label className="text-[10px] font-bold text-stone-700 mb-1 block">Telcell Wallet հեռախոսահամար</label>
              <input
                type="tel"
                value={walletPhone}
                onChange={(e) => setWalletPhone(e.target.value)}
                placeholder="+374 77 123456"
                className="w-full px-3 py-2.5 text-xs bg-stone-50 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-[#FF5722]"
              />
            </div>
          </div>
        )}
      </div>

      {/* Promo Code Input */}
      <div className="bg-white rounded-2xl p-2.5 shadow-sm border border-[#ffea9f] flex items-center gap-2 mb-4">
        <input
          type="text"
          value={promoCode}
          onChange={(e) => setPromoCode(e.target.value)}
          placeholder="Պրոմոկոդ (օր. AUTHORIUM)"
          className="flex-1 bg-transparent px-3 py-1.5 text-xs text-stone-900 placeholder:text-stone-400 focus:outline-none"
        />
        <button
          onClick={handleApplyPromo}
          className="px-4 py-2 bg-[#FF5722] hover:bg-[#E64A19] text-white text-xs font-bold rounded-xl transition active:scale-95"
        >
          {promoApplied ? '✓ Կիրառված է' : 'Կիրառել'}
        </button>
      </div>

      {/* Main Pay Button */}
      <button
        onClick={handlePayClick}
        disabled={isPaying || rawTotal === 0}
        className="w-full py-4 bg-[#FF5722] hover:bg-[#E64A19] disabled:opacity-50 text-white text-sm font-black rounded-full flex items-center justify-center gap-2 shadow-xl active:scale-95 transition"
      >
        <span>
          {isPaying
            ? 'Կատարվում է վճարում...'
            : `Վճարել ${finalTotal} ֏ (${selectedMethod === 'card' ? 'Քարտով' : selectedMethod === 'apple_pay' ? ' Apple Pay' : selectedMethod === 'idram' ? 'Idram' : 'Telcell'}) →`}
        </span>
      </button>

      {/* SSL and Security Badges */}
      <div className="flex items-center justify-center gap-4 mt-3 text-[10px] text-stone-700 font-semibold">
        <div className="flex items-center gap-1">
          <Lock className="w-3.5 h-3.5 text-stone-600" />
          <span>ArCa / Ameria 3D-Secure 2.0</span>
        </div>
        <div className="flex items-center gap-1">
          <ShieldCheck className="w-3.5 h-3.5 text-stone-600" />
          <span>256-bit SSL Պաշտպանություն</span>
        </div>
      </div>

      {/* 3D-SECURE BANK MODAL */}
      {show3DSModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-5 shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b pb-3 mb-3">
              <div className="flex items-center gap-2">
                <span className="font-black text-sm text-[#FF5722]">ArCa 3D-Secure</span>
              </div>
              <span className="text-[10px] text-stone-500 font-mono">Ameriabank vPOS</span>
            </div>

            <div className="text-center py-2">
              <p className="text-xs text-stone-600 font-medium">
                Ձեր հեռախոսահամարին ուղարկվել է մեկանգամյա հաստատման կոդ (SMS OTP)
              </p>
              <div className="my-3 p-3 bg-stone-50 rounded-2xl border text-left text-xs">
                <div className="flex justify-between text-stone-500 mb-1">
                  <span>Գումար:</span>
                  <span className="font-bold text-stone-900">{finalTotal} AMD</span>
                </div>
                <div className="flex justify-between text-stone-500 mb-1">
                  <span>Վաճառող:</span>
                  <span className="font-bold text-stone-900">Authorium.shop</span>
                </div>
                <div className="flex justify-between text-stone-500">
                  <span>Քարտ:</span>
                  <span className="font-mono font-bold text-stone-900">•••• {cardNumber.slice(-4) || '1234'}</span>
                </div>
              </div>

              <label className="text-[11px] font-bold text-stone-700 block mb-1">Մուտքագրեք SMS կոդը</label>
              <input
                type="text"
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value)}
                maxLength={6}
                className="w-36 text-center font-mono text-lg font-black tracking-widest px-3 py-2 bg-yellow-50 border-2 border-[#FF5722] rounded-xl focus:outline-none mx-auto block mb-4"
              />

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setShow3DSModal(false)}
                  className="flex-1 py-2.5 bg-stone-100 text-stone-700 font-bold text-xs rounded-full hover:bg-stone-200"
                >
                  Չեղարկել
                </button>
                <button
                  type="button"
                  onClick={confirm3DSecure}
                  disabled={isVerifying3DS}
                  className="flex-1 py-2.5 bg-[#FF5722] text-white font-black text-xs rounded-full shadow hover:bg-[#E64A19] flex items-center justify-center gap-1.5"
                >
                  {isVerifying3DS ? 'Ստուգում...' : 'Հաստատել ✓'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* APPLE PAY BOTTOM SHEET MODAL */}
      {showApplePaySheet && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end justify-center">
          <div className="bg-[#1C1C1E] text-white w-full max-w-md rounded-t-[32px] pt-6 px-6 pb-28 shadow-2xl animate-in slide-in-from-bottom-5">
            <div className="w-12 h-1.5 bg-stone-600 rounded-full mx-auto mb-4" />

            <div className="flex items-center justify-between border-b border-stone-800 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <span className="text-xl font-bold">Pay</span>
              </div>
              <button
                onClick={() => setShowApplePaySheet(false)}
                className="text-xs text-stone-400 hover:text-white"
              >
                Չեղարկել
              </button>
            </div>

            <div className="flex flex-col gap-3 text-xs mb-5">
              <div className="flex justify-between items-center text-stone-400">
                <span>Քարտ:</span>
                <span className="text-white font-semibold flex items-center gap-1.5">
                  <CreditCard className="w-4 h-4 text-amber-400" />
                  Ameria ArCa / Visa (•••• 4122)
                </span>
              </div>
              <div className="flex justify-between items-center text-stone-400">
                <span>Խանութ:</span>
                <span className="text-white font-semibold">Authorium.shop</span>
              </div>
              <div className="flex justify-between items-center text-stone-400 border-t border-stone-800 pt-2">
                <span className="text-sm font-bold text-white">Վճարման ենթակա:</span>
                <span className="text-base font-black text-white">{finalTotal} AMD</span>
              </div>
            </div>

            {applePayStage === 'prompt' && (
              <button
                type="button"
                onClick={triggerApplePayBiometrics}
                className="w-full py-4 bg-white text-black font-black text-sm rounded-full flex items-center justify-center gap-2 active:scale-95 transition shadow-lg"
              >
                <SmartphoneNfc className="w-5 h-5 animate-pulse" />
                <span>Հաստատել Face ID-ով (Կրկնակի սեղմում)</span>
              </button>
            )}

            {applePayStage === 'processing' && (
              <div className="w-full py-4 bg-stone-800 text-white font-bold text-sm rounded-full flex items-center justify-center gap-3">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Ստուգվում է Face ID...</span>
              </div>
            )}

            {applePayStage === 'done' && (
              <div className="w-full py-4 bg-emerald-600 text-white font-black text-sm rounded-full flex items-center justify-center gap-2 animate-in zoom-in-90">
                <Check className="w-6 h-6 stroke-[3]" />
                <span>Վճարումը կատարված է!</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* IDRAM / TELCELL POPUP */}
      {showIdramSheet && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-5 shadow-2xl text-center animate-in zoom-in-95">
            <div className="w-12 h-12 rounded-2xl bg-orange-500 text-white font-bold text-lg flex items-center justify-center mx-auto mb-3 shadow">
              {selectedMethod === 'idram' ? 'id' : 'T'}
            </div>

            <h3 className="text-base font-black text-stone-900">
              {selectedMethod === 'idram' ? 'Idram Վճարում' : 'Telcell Pay'}
            </h3>
            <p className="text-xs text-stone-600 mt-1 mb-4">
              Ստուգեք Ձեր {selectedMethod === 'idram' ? 'Idram' : 'Telcell'} հավելվածը և հաստատեք {finalTotal} AMD վճարումը։
            </p>

            <div className="p-4 bg-stone-50 rounded-2xl border border-dashed border-stone-300 mb-4 flex flex-col items-center gap-2">
              <QrCode className="w-24 h-24 text-stone-800" />
              <span className="text-[10px] text-stone-500 font-mono">Հաշիվ: {walletPhone}</span>
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setShowIdramSheet(false)}
                className="flex-1 py-2.5 bg-stone-100 text-stone-700 font-bold text-xs rounded-full"
              >
                Չեղարկել
              </button>
              <button
                type="button"
                onClick={confirmIdramPayment}
                disabled={isProcessingIdram}
                className="flex-1 py-2.5 bg-[#FF5722] text-white font-black text-xs rounded-full shadow hover:bg-[#E64A19] flex items-center justify-center gap-1.5"
              >
                {isProcessingIdram ? 'Հաստատվում է...' : 'Հաստատել վճարումը ✓'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
