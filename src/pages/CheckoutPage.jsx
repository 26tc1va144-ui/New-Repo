import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import confetti from 'canvas-confetti';
import {
  ArrowLeft,
  ShieldCheck,
  CreditCard,
  QrCode,
  CheckCircle2,
  Lock,
  Sparkles,
  Store,
  Clock,
  MapPin,
  Banknote,
  Smartphone
} from 'lucide-react';

export default function CheckoutPage({ rescueId, initialPortions = 1, onBack, onCompleteOrder }) {
  const { rescues, createOrder } = useApp();
  const rescue = rescues.find((r) => r.id === rescueId) || rescues[0];

  const [portions, setPortions] = useState(initialPortions);
  const [paymentMethod, setPaymentMethod] = useState('upi'); // 'upi' | 'card' | 'store' | 'wallet'
  const [selectedSlot, setSelectedSlot] = useState(rescue.pickupStart || '20:30');
  const [isProcessing, setIsProcessing] = useState(false);

  const isDonation = rescue.rescuePrice === 0 || rescue.isDonation;
  const menuPriceTotal = rescue.originalPrice * portions;
  const rescuePriceTotal = rescue.rescuePrice * portions;
  const savingsTotal = menuPriceTotal - rescuePriceTotal;

  const paymentOptions = [
    {
      id: 'upi',
      name: 'UPI Sandbox (GPay / PhonePe / Paytm)',
      desc: 'Instant 1-click test simulation',
      icon: Smartphone,
      badge: 'Fastest'
    },
    {
      id: 'card',
      name: 'Credit / Debit Card (Mock Sandbox)',
      desc: 'Visa, Mastercard, RuPay test sandbox',
      icon: CreditCard,
      badge: 'Zero fees'
    },
    {
      id: 'store',
      name: 'Pay at Store Pickup',
      desc: 'Settle in cash or UPI at store counter',
      icon: Banknote,
      badge: null
    },
    {
      id: 'wallet',
      name: 'ResQ Community Credits',
      desc: 'Balance: ₹500 available',
      icon: Sparkles,
      badge: 'Instant'
    }
  ];

  const handleProcessOrder = () => {
    setIsProcessing(true);

    setTimeout(() => {
      // Trigger festive confetti
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });

      const order = createOrder({
        rescue,
        portions,
        paymentMethod: paymentOptions.find(p => p.id === paymentMethod)?.name || 'UPI Sandbox'
      });

      setIsProcessing(false);
      onCompleteOrder(order.id);
    }, 1000);
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Back button */}
      <div>
        <button
          onClick={onBack}
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-600 hover:text-emerald-700 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to rescue details</span>
        </button>
      </div>

      {/* Header */}
      <div className="space-y-1">
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight font-display">
          Reserve your rescue
        </h1>
        <p className="text-sm text-slate-500">
          Payments run in a demo sandbox — no real card is charged.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Left 2 Cols: Form options */}
        <div className="md:col-span-2 space-y-6">
          
          {/* Quantity Section */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-soft space-y-4">
            <h2 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider font-display">
              1. Quantity
            </h2>
            <div className="flex items-center justify-between">
              <div>
                <span className="text-sm font-bold text-slate-800">Portions to reserve</span>
                <span className="text-xs text-slate-500 block">
                  Limit {rescue.limitPerBuyer || 3} per buyer · {rescue.portionsLeft} available
                </span>
              </div>

              <div className="flex items-center bg-slate-100 rounded-2xl p-1 border border-slate-200">
                <button
                  onClick={() => setPortions(Math.max(1, portions - 1))}
                  disabled={portions <= 1}
                  className="w-8 h-8 rounded-xl bg-white disabled:opacity-40 font-bold text-slate-800 shadow-sm flex items-center justify-center hover:bg-slate-50"
                >
                  -
                </button>
                <span className="w-10 text-center font-bold text-sm text-slate-900">
                  {portions}
                </span>
                <button
                  onClick={() => setPortions(Math.min(rescue.limitPerBuyer || 3, portions + 1))}
                  disabled={portions >= Math.min(rescue.limitPerBuyer || 3, rescue.portionsLeft)}
                  className="w-8 h-8 rounded-xl bg-white disabled:opacity-40 font-bold text-slate-800 shadow-sm flex items-center justify-center hover:bg-slate-50"
                >
                  +
                </button>
              </div>
            </div>
          </div>

          {/* Pickup Window Selection */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-soft space-y-4">
            <h2 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider font-display">
              2. Pickup Time Slot
            </h2>
            <div className="flex items-center gap-2 text-xs text-slate-600 bg-emerald-50/70 p-3 rounded-xl border border-emerald-200/60">
              <Clock className="w-4 h-4 text-emerald-700 shrink-0" />
              <span>Official pickup window: <strong>{rescue.pickupWindow}</strong></span>
            </div>

            <div className="grid grid-cols-3 gap-2 pt-1">
              {[rescue.pickupStart || '20:30', '21:00', rescue.pickupEnd || '22:00'].map((slot) => (
                <button
                  key={slot}
                  onClick={() => setSelectedSlot(slot)}
                  className={`py-2.5 px-3 rounded-xl text-xs font-semibold border transition-all ${
                    selectedSlot === slot
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {slot} arrival
                </button>
              ))}
            </div>
          </div>

          {/* Payment method selection */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-soft space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider font-display">
                3. Payment method
              </h2>
              <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200/50">
                Sandbox Mode
              </span>
            </div>

            <div className="space-y-2.5">
              {paymentOptions.map((opt) => {
                const Icon = opt.icon;
                const isSelected = paymentMethod === opt.id;
                return (
                  <div
                    key={opt.id}
                    onClick={() => setPaymentMethod(opt.id)}
                    className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                      isSelected
                        ? 'bg-emerald-50/80 border-emerald-500 ring-2 ring-emerald-500/20 shadow-sm'
                        : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                        isSelected ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-600'
                      }`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-900">{opt.name}</div>
                        <div className="text-[11px] text-slate-500">{opt.desc}</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {opt.badge && (
                        <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded">
                          {opt.badge}
                        </span>
                      )}
                      <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                        isSelected ? 'border-emerald-600 bg-emerald-600' : 'border-slate-300'
                      }`}>
                        {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Col: Order Summary */}
        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-soft space-y-4 sticky top-24">
            <h2 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider font-display">
              Order summary
            </h2>

            {/* Item Card */}
            <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100 space-y-1">
              <h3 className="font-bold text-slate-900 text-xs">{rescue.title}</h3>
              <div className="text-[11px] text-slate-500">
                {rescue.seller} · pickup {rescue.pickupStart || '20:30'}–{rescue.pickupEnd || '22:00'}
              </div>
              <div className="text-xs font-semibold text-slate-700 pt-1">
                {portions} {portions === 1 ? 'portion' : 'portions'} selected
              </div>
            </div>

            {/* Pricing breakdown */}
            <div className="space-y-2 text-xs pt-2 border-t border-slate-100">
              <div className="flex items-center justify-between text-slate-500">
                <span>Original menu value</span>
                <span className="line-through">₹{menuPriceTotal}</span>
              </div>
              <div className="flex items-center justify-between text-slate-500">
                <span>Rescue price ({portions}x)</span>
                <span className="font-medium text-slate-800">
                  {isDonation ? 'FREE' : `₹${rescuePriceTotal}`}
                </span>
              </div>
              <div className="flex items-center justify-between text-slate-500">
                <span>Rescue platform fee</span>
                <span className="text-emerald-600 font-medium">Free (Zero-waste pledge)</span>
              </div>

              {!isDonation && (
                <div className="bg-emerald-50 text-emerald-800 p-2.5 rounded-xl text-xs font-semibold text-center border border-emerald-200/50">
                  You save ₹{savingsTotal} versus menu price!
                </div>
              )}
            </div>

            {/* Total due */}
            <div className="pt-3 border-t border-slate-200 flex items-center justify-between">
              <span className="text-sm font-bold text-slate-900">Total payable</span>
              <span className="text-2xl font-black text-slate-900 font-display">
                {isDonation ? 'FREE' : `₹${rescuePriceTotal}`}
              </span>
            </div>

            {/* Action Button */}
            <button
              onClick={handleProcessOrder}
              disabled={isProcessing}
              className="w-full py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white font-bold text-sm shadow-card hover:shadow-glow transition-all flex items-center justify-center gap-2"
            >
              {isProcessing ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Generating Pickup Pass...</span>
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4" />
                  <span>{isDonation ? 'Confirm Free Rescue' : `Pay ₹${rescuePriceTotal} (Sandbox)`}</span>
                </>
              )}
            </button>

            <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-400 pt-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>QR Code & 4-Digit OTP issued instantly upon checkout</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
