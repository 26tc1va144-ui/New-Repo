import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  CheckCircle2,
  QrCode,
  Clock,
  MapPin,
  Store,
  Share2,
  Calendar,
  ShieldCheck,
  ArrowLeft,
  Sparkles,
  Download,
  AlertCircle
} from 'lucide-react';

export default function OrderConfirmationPage({ orderId, onNavigate }) {
  const { orders, verifyOrderOtp, addToast } = useApp();
  const order = orders.find(o => o.id === orderId) || orders[0];

  const [simulatedSuccess, setSimulatedSuccess] = useState(order?.status === 'Collected');

  if (!order) {
    return (
      <div className="max-w-md mx-auto py-16 text-center space-y-4">
        <AlertCircle className="w-12 h-12 text-rose-500 mx-auto" />
        <h2 className="text-xl font-bold text-slate-900">Order not found</h2>
        <button
          onClick={() => onNavigate('/browse')}
          className="px-4 py-2 rounded-xl bg-emerald-600 text-white text-sm font-semibold"
        >
          Back to discover
        </button>
      </div>
    );
  }

  const handleSimulatePickup = () => {
    const result = verifyOrderOtp(order.otp);
    if (result.success) {
      setSimulatedSuccess(true);
    }
  };

  const handleDownload = () => {
    addToast('Rescue pass saved to offline cache!', 'success');
  };

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Top Back Navigation */}
      <div>
        <button
          onClick={() => onNavigate('/browse')}
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-600 hover:text-emerald-700 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to marketplace</span>
        </button>
      </div>

      {/* Main Digital Pass Card */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-card overflow-hidden">
        
        {/* Pass Header Banner */}
        <div className={`p-6 text-white text-center transition-colors ${
          simulatedSuccess
            ? 'bg-gradient-to-r from-emerald-600 to-teal-700'
            : 'bg-gradient-to-r from-slate-900 via-slate-800 to-emerald-950'
        }`}>
          <div className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center mx-auto mb-3">
            <CheckCircle2 className="w-6 h-6 text-emerald-300" />
          </div>
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-300">
            {simulatedSuccess ? 'Pickup Complete' : 'Digital Rescue Pass Ready'}
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold font-display mt-1">
            {simulatedSuccess ? 'Meal Handover Confirmed!' : 'Reservation Confirmed'}
          </h1>
          <p className="text-xs text-slate-300 mt-1">
            Order Ref: <span className="font-mono text-emerald-200">{order.id.toUpperCase()}</span>
          </p>
        </div>

        {/* Pass Core: QR Code + 4-digit PIN */}
        <div className="p-6 sm:p-8 space-y-6 text-center">
          
          {/* Status Badge */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Status: {simulatedSuccess ? 'Collected & Verified' : 'Ready for In-Store Pickup'}</span>
          </div>

          {/* Scannable Visual QR Code Box */}
          <div className="relative max-w-[200px] mx-auto p-4 bg-white rounded-2xl border-2 border-dashed border-emerald-500/40 shadow-soft">
            {/* High fidelity SVG QR pattern */}
            <svg className="w-full h-auto" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect width="100" height="100" fill="white" />
              {/* Corner squares */}
              <rect x="5" y="5" width="25" height="25" rx="3" fill="#064e3b" />
              <rect x="10" y="10" width="15" height="15" fill="white" />
              <rect x="13" y="13" width="9" height="9" fill="#059669" />

              <rect x="70" y="5" width="25" height="25" rx="3" fill="#064e3b" />
              <rect x="75" y="10" width="15" height="15" fill="white" />
              <rect x="78" y="13" width="9" height="9" fill="#059669" />

              <rect x="5" y="70" width="25" height="25" rx="3" fill="#064e3b" />
              <rect x="10" y="75" width="15" height="15" fill="white" />
              <rect x="13" y="78" width="9" height="9" fill="#059669" />

              {/* Data pixel matrix simulation */}
              <rect x="36" y="8" width="6" height="6" fill="#065f46" />
              <rect x="46" y="8" width="6" height="6" fill="#065f46" />
              <rect x="56" y="8" width="6" height="6" fill="#065f46" />
              <rect x="36" y="20" width="6" height="6" fill="#065f46" />
              <rect x="48" y="22" width="8" height="6" fill="#059669" />

              <rect x="8" y="40" width="6" height="6" fill="#065f46" />
              <rect x="20" y="40" width="6" height="6" fill="#065f46" />
              <rect x="35" y="38" width="10" height="10" fill="#047857" />
              <rect x="52" y="38" width="12" height="10" fill="#065f46" />
              <rect x="72" y="40" width="6" height="6" fill="#065f46" />
              <rect x="84" y="40" width="6" height="6" fill="#065f46" />

              <rect x="10" y="54" width="8" height="6" fill="#065f46" />
              <rect x="25" y="52" width="6" height="6" fill="#065f46" />
              <rect x="40" y="56" width="6" height="6" fill="#065f46" />
              <rect x="54" y="54" width="8" height="8" fill="#059669" />
              <rect x="70" y="54" width="6" height="6" fill="#065f46" />
              <rect x="82" y="54" width="8" height="6" fill="#065f46" />

              <rect x="36" y="74" width="6" height="6" fill="#065f46" />
              <rect x="48" y="72" width="6" height="6" fill="#065f46" />
              <rect x="62" y="76" width="6" height="6" fill="#065f46" />
              <rect x="78" y="74" width="6" height="6" fill="#065f46" />
              <rect x="42" y="86" width="12" height="6" fill="#065f46" />
              <rect x="60" y="86" width="6" height="6" fill="#065f46" />
              <rect x="75" y="86" width="8" height="6" fill="#059669" />
            </svg>
            <div className="text-[10px] text-slate-400 font-mono mt-2">
              Present to store counter
            </div>
          </div>

          {/* 4-digit OTP Code */}
          <div className="space-y-1">
            <span className="text-xs font-bold uppercase tracking-widest text-slate-400">
              One-Time Pickup PIN / OTP
            </span>
            <div className="flex items-center justify-center gap-3">
              {order.otp.split('').map((digit, idx) => (
                <div
                  key={idx}
                  className="w-12 h-14 rounded-xl bg-slate-100 border-2 border-emerald-500/40 flex items-center justify-center text-2xl font-black text-slate-900 font-display shadow-inner"
                >
                  {digit}
                </div>
              ))}
            </div>
            <p className="text-xs text-slate-500 pt-1">
              Read out these 4 digits to store staff to verify receipt
            </p>
          </div>

          {/* Order Details Grid */}
          <div className="text-left bg-slate-50 rounded-2xl p-5 border border-slate-100 space-y-3">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h3 className="font-bold text-slate-900 text-sm">{order.title}</h3>
                <div className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                  <Store className="w-3.5 h-3.5 text-emerald-600" />
                  <span>{order.seller}</span>
                </div>
              </div>
              <span className="text-xs font-bold bg-white px-2.5 py-1 rounded-lg border border-slate-200">
                {order.portions} portion(s)
              </span>
            </div>

            <div className="pt-2 border-t border-slate-200/70 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="flex items-start gap-2">
                <Clock className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Pickup Window</span>
                  <span className="font-semibold text-slate-800">{order.pickupWindow}</span>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Pickup Address</span>
                  <span className="font-semibold text-slate-800">{order.address}</span>
                </div>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-200/70 flex items-center justify-between text-xs">
              <span className="text-slate-500">Amount Paid ({order.paymentMethod}):</span>
              <span className="font-extrabold text-slate-900 text-sm">
                {order.totalAmount === 0 ? 'FREE' : `₹${order.totalAmount}`}
              </span>
            </div>
          </div>

          {/* Interactive Store Handover Simulator Action */}
          {!simulatedSuccess ? (
            <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200/80 space-y-2">
              <div className="text-xs font-bold text-emerald-900">
                Demo Interactive Feature:
              </div>
              <p className="text-xs text-emerald-700">
                Simulate the merchant at Crust & Co. scanning this QR code or confirming the OTP:
              </p>
              <button
                onClick={handleSimulatePickup}
                className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm transition-all flex items-center justify-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Simulate In-Store Handover & Verify OTP</span>
              </button>
            </div>
          ) : (
            <div className="p-4 bg-emerald-100/60 rounded-2xl border border-emerald-300 text-xs font-semibold text-emerald-900 flex items-center justify-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              <span>Handover completed! Enjoy your fresh meal and thank you for reducing food waste.</span>
            </div>
          )}

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              onClick={handleDownload}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200/80 text-slate-700 text-xs font-semibold transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Save Pass</span>
            </button>

            <button
              onClick={() => onNavigate('/impact')}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-semibold transition-colors border border-emerald-200"
            >
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              <span>View Your Impact</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
