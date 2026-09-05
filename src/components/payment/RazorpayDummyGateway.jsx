import React, { useState, useEffect } from 'react';
import {
  X,
  ShieldCheck,
  Smartphone,
  CreditCard,
  Building2,
  Wallet,
  CheckCircle2,
  AlertCircle,
  QrCode,
  Lock,
  ArrowRight,
  ChevronRight,
  Info,
  Loader2
} from 'lucide-react';

export default function RazorpayDummyGateway({
  isOpen,
  onClose,
  orderData,
  totalAmount,
  foodTitle,
  sellerName,
  buyerInfo,
  onSuccess,
  onFailure,
  onCancel
}) {
  const [activeTab, setActiveTab] = useState('upi'); // 'upi' | 'card' | 'netbanking' | 'wallet'
  const [upiId, setUpiId] = useState('success@razorpay');
  const [selectedUpiApp, setSelectedUpiApp] = useState('gpay');
  
  // Card details
  const [cardNumber, setCardNumber] = useState('4111 2222 3333 4444');
  const [cardExpiry, setCardExpiry] = useState('12/28');
  const [cardCvv, setCardCvv] = useState('123');
  const [cardName, setCardName] = useState(buyerInfo?.name || 'Rahul Sharma');

  // Netbanking
  const [selectedBank, setSelectedBank] = useState('hdfc');

  // Processing state
  const [isAuthorizing, setIsAuthorizing] = useState(false);
  const [authStep, setAuthStep] = useState('idle'); // 'idle' | 'processing' | 'otp' | 'success'

  if (!isOpen) return null;

  const handlePaySuccess = () => {
    setIsAuthorizing(true);
    setAuthStep('processing');

    setTimeout(() => {
      setIsAuthorizing(false);
      setAuthStep('success');

      setTimeout(() => {
        onSuccess({
          razorpay_order_id: orderData?.orderId || `order_dummy_${Date.now()}`,
          razorpay_payment_id: `pay_dummy_${Date.now().toString().slice(-8)}`,
          razorpay_signature: `sig_demo_${Date.now()}`
        });
      }, 500);
    }, 1200);
  };

  const handlePayFailure = () => {
    setIsAuthorizing(true);
    setAuthStep('processing');

    setTimeout(() => {
      setIsAuthorizing(false);
      setAuthStep('idle');
      onFailure('Transaction declined by issuing bank (Simulated Test Failure).');
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      
      {/* Modal Container mimicking Razorpay Standard Checkout */}
      <div className="relative w-full max-w-xl bg-white rounded-2xl sm:rounded-3xl shadow-2xl border border-slate-200 overflow-hidden text-slate-800 animate-scale-up">
        
        {/* Razorpay Brand Header */}
        <div className="bg-[#0c2340] text-white p-5 flex items-center justify-between border-b border-blue-900/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#0d3b66] border border-blue-400/30 flex items-center justify-center font-black text-white text-base shadow-sm">
              ₹
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-sm sm:text-base leading-tight">ResQFood Marketplace</h3>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-300 font-bold px-2 py-0.5 rounded border border-emerald-400/30">
                  TEST MODE
                </span>
              </div>
              <p className="text-xs text-blue-200/80 mt-0.5 line-clamp-1">
                {foodTitle} · {sellerName}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right">
              <span className="text-[10px] text-blue-300 block uppercase font-bold tracking-wider">Amount</span>
              <span className="text-lg sm:text-xl font-black text-white font-display">₹{totalAmount}</span>
            </div>
            <button
              onClick={onCancel}
              className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors ml-1"
              title="Close Gateway"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Razorpay Sandbox Notice Pill */}
        <div className="bg-blue-50 border-b border-blue-100 px-4 py-2 flex items-center justify-between text-[11px] text-blue-800">
          <div className="flex items-center gap-1.5 font-medium">
            <Info className="w-3.5 h-3.5 text-blue-600 shrink-0" />
            <span><strong>Razorpay Test Sandbox:</strong> No real bank account will be charged.</span>
          </div>
          <span className="font-mono text-blue-600 font-semibold">{orderData?.orderId || 'order_test'}</span>
        </div>

        {/* Modal Body: Left Instrument Tabs + Right Content */}
        <div className="grid grid-cols-1 sm:grid-cols-3 min-h-[340px]">
          
          {/* Left Column: Instruments */}
          <div className="bg-slate-50 border-r border-slate-200/80 p-2 sm:p-3 space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2 block mb-1">
              Payment Options
            </span>

            {[
              { id: 'upi', name: 'UPI / QR', icon: Smartphone, badge: 'Popular' },
              { id: 'card', name: 'Card', icon: CreditCard, badge: 'Visa/MC' },
              { id: 'netbanking', name: 'NetBanking', icon: Building2, badge: null },
              { id: 'wallet', name: 'Wallets', icon: Wallet, badge: null }
            ].map((tab) => {
              const Icon = tab.icon;
              const isSelected = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center justify-between p-2.5 rounded-xl text-xs font-bold transition-all text-left ${
                    isSelected
                      ? 'bg-white text-[#0c2340] shadow-sm border border-slate-200'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Icon className={`w-4 h-4 ${isSelected ? 'text-blue-600' : 'text-slate-400'}`} />
                    <span>{tab.name}</span>
                  </div>
                  {tab.badge && (
                    <span className="text-[9px] font-bold bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded">
                      {tab.badge}
                    </span>
                  )}
                </button>
              );
            })}

            <div className="pt-6 px-2 text-[10px] text-slate-400 space-y-1">
              <div className="flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span className="font-semibold text-slate-600">Razorpay Verified</span>
              </div>
              <p>256-bit encryption standards</p>
            </div>
          </div>

          {/* Right Column: Instrument Form & Actions */}
          <div className="sm:col-span-2 p-4 sm:p-5 flex flex-col justify-between space-y-4">
            
            {/* TAB 1: UPI */}
            {activeTab === 'upi' && (
              <div className="space-y-4 animate-fade-in">
                <div>
                  <h4 className="font-bold text-xs text-slate-900 uppercase tracking-wider">
                    Instant UPI Payment
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    Pay using any registered UPI app or test QR code
                  </p>
                </div>

                {/* Simulated UPI QR Code */}
                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 flex items-center gap-3">
                  <div className="w-16 h-16 bg-white p-1 rounded-xl border border-slate-200 shrink-0 flex items-center justify-center">
                    <QrCode className="w-14 h-14 text-slate-900" />
                  </div>
                  <div className="text-xs space-y-0.5">
                    <span className="font-bold text-slate-800 block">Scan with any UPI App</span>
                    <span className="text-[11px] text-slate-500 block">GPay, PhonePe, Paytm, BHIM, Navi</span>
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded inline-block">
                      UPI ID: {upiId}
                    </span>
                  </div>
                </div>

                {/* UPI ID input */}
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-700 block">Enter UPI ID</label>
                  <input
                    type="text"
                    value={upiId}
                    onChange={(e) => setUpiId(e.target.value)}
                    placeholder="yourname@okhdfcbank"
                    className="w-full text-xs font-semibold px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  />
                  <span className="text-[10px] text-slate-400 block">Tip: Use <strong>success@razorpay</strong> for instant approval</span>
                </div>
              </div>
            )}

            {/* TAB 2: CARDS */}
            {activeTab === 'card' && (
              <div className="space-y-3.5 animate-fade-in">
                <div>
                  <h4 className="font-bold text-xs text-slate-900 uppercase tracking-wider">
                    Credit / Debit Card
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    Pre-filled with official Razorpay test credentials
                  </p>
                </div>

                <div className="space-y-2 text-xs">
                  <div>
                    <label className="text-[11px] font-bold text-slate-700 block mb-1">Card Number</label>
                    <div className="relative">
                      <input
                        type="text"
                        value={cardNumber}
                        onChange={(e) => setCardNumber(e.target.value)}
                        className="w-full text-xs font-mono font-bold px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <span className="absolute right-3 top-2 text-[10px] font-bold text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded">
                        VISA / RuPay
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[11px] font-bold text-slate-700 block mb-1">Expiry (MM/YY)</label>
                      <input
                        type="text"
                        value={cardExpiry}
                        onChange={(e) => setCardExpiry(e.target.value)}
                        className="w-full text-xs font-mono font-bold px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-bold text-slate-700 block mb-1">CVV</label>
                      <input
                        type="password"
                        value={cardCvv}
                        onChange={(e) => setCardCvv(e.target.value)}
                        className="w-full text-xs font-mono font-bold px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-700 block mb-1">Cardholder Name</label>
                    <input
                      type="text"
                      value={cardName}
                      onChange={(e) => setCardName(e.target.value)}
                      className="w-full text-xs font-semibold px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* TAB 3: NETBANKING */}
            {activeTab === 'netbanking' && (
              <div className="space-y-3 animate-fade-in">
                <div>
                  <h4 className="font-bold text-xs text-slate-900 uppercase tracking-wider">
                    Popular NetBanking Banks
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    Select your bank to authorize payment
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  {[
                    { id: 'hdfc', name: 'HDFC Bank' },
                    { id: 'sbi', name: 'State Bank of India' },
                    { id: 'icici', name: 'ICICI Bank' },
                    { id: 'axis', name: 'Axis Bank' },
                    { id: 'kotak', name: 'Kotak Mahindra' },
                    { id: 'pnb', name: 'Punjab National' }
                  ].map((bank) => (
                    <button
                      key={bank.id}
                      onClick={() => setSelectedBank(bank.id)}
                      className={`p-2.5 rounded-xl border text-left font-bold transition-all ${
                        selectedBank === bank.id
                          ? 'border-blue-600 bg-blue-50 text-blue-900 ring-1 ring-blue-500'
                          : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      {bank.name}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 4: WALLETS */}
            {activeTab === 'wallet' && (
              <div className="space-y-3 animate-fade-in">
                <div>
                  <h4 className="font-bold text-xs text-slate-900 uppercase tracking-wider">
                    Digital Wallets
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    Link wallet for one-click checkout
                  </p>
                </div>

                <div className="space-y-2">
                  {[
                    { id: 'paytm', name: 'Paytm Wallet' },
                    { id: 'phonepe', name: 'PhonePe Wallet' },
                    { id: 'mobikwik', name: 'MobiKwik' },
                    { id: 'amazon', name: 'Amazon Pay' }
                  ].map((w) => (
                    <div
                      key={w.id}
                      className="p-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 flex items-center justify-between cursor-pointer"
                    >
                      <span className="text-xs font-bold text-slate-800">{w.name}</span>
                      <span className="text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-bold">
                        Linked
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Action Bar (Razorpay CTA) */}
            <div className="pt-4 border-t border-slate-200 space-y-2">
              <button
                onClick={handlePaySuccess}
                disabled={isAuthorizing}
                className="w-full py-3 px-4 rounded-xl bg-[#0c2340] hover:bg-[#143257] disabled:bg-slate-400 text-white font-extrabold text-xs sm:text-sm shadow-md transition-all flex items-center justify-center gap-2"
              >
                {isAuthorizing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Processing with Razorpay...</span>
                  </>
                ) : (
                  <>
                    <Lock className="w-3.5 h-3.5 text-blue-300" />
                    <span>Pay ₹{totalAmount} (Simulate Success)</span>
                  </>
                )}
              </button>

              {/* Hackathon Testing Helpers: Failure & Cancel buttons */}
              <div className="flex items-center justify-between gap-2 pt-1">
                <button
                  onClick={handlePayFailure}
                  disabled={isAuthorizing}
                  className="flex-1 py-1.5 px-2 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-[11px] font-bold transition-colors flex items-center justify-center gap-1"
                >
                  <AlertCircle className="w-3 h-3" />
                  <span>Simulate Bank Failure</span>
                </button>

                <button
                  onClick={onCancel}
                  disabled={isAuthorizing}
                  className="flex-1 py-1.5 px-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-bold transition-colors"
                >
                  Cancel Payment
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
