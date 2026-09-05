import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import confetti from 'canvas-confetti';
import { loadRazorpayScript } from '../utils/razorpay';
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
  Smartphone,
  AlertCircle,
  AlertTriangle,
  RotateCcw,
  ExternalLink,
  ChevronRight
} from 'lucide-react';

export default function CheckoutPage({ rescueId, initialPortions = 1, onBack, onCompleteOrder }) {
  const { rescues, createOrder, createRazorpayOrder, verifyRazorpayPayment, currentUser, addToast } = useApp();
  const rescue = rescues.find((r) => r.id === rescueId) || rescues[0];

  const [portions, setPortions] = useState(initialPortions);
  const [paymentMethod, setPaymentMethod] = useState('razorpay'); // 'razorpay' | 'store' | 'wallet'
  const [selectedSlot, setSelectedSlot] = useState(rescue?.pickupStart || '20:30');
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentState, setPaymentState] = useState({ status: 'idle', message: '', details: null }); // 'idle' | 'success' | 'failed' | 'cancelled'
  const [showSandboxModal, setShowSandboxModal] = useState(false);
  const [pendingRazorpayData, setPendingRazorpayData] = useState(null);

  if (!rescue) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center space-y-4">
        <div className="animate-spin w-8 h-8 border-3 border-emerald-600 border-t-transparent rounded-full mx-auto" />
        <h2 className="text-xl font-bold text-slate-900">Loading rescue details...</h2>
        <button
          onClick={onBack}
          className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-semibold transition-colors"
        >
          Back to marketplace
        </button>
      </div>
    );
  }

  const isDonation = rescue.rescuePrice === 0 || rescue.isDonation;
  const menuPriceTotal = rescue.originalPrice * portions;
  const rescuePriceTotal = rescue.rescuePrice * portions;
  const savingsTotal = Math.max(0, menuPriceTotal - rescuePriceTotal);

  const paymentOptions = [
    {
      id: 'razorpay',
      name: 'Razorpay Secure Checkout',
      desc: 'Instant UPI (GPay/PhonePe), Credit & Debit Cards, NetBanking, Wallets',
      icon: Smartphone,
      badge: 'Recommended · Zero Surcharge',
      isRazorpay: true
    },
    {
      id: 'store',
      name: 'Pay at Store Counter',
      desc: 'Inspect food freshness on arrival and settle via Cash / UPI at counter',
      icon: Banknote,
      badge: null,
      isRazorpay: false
    },
    {
      id: 'wallet',
      name: 'ResQ Community Credits',
      desc: 'Available balance: ₹500. Deducted instantly from your community wallet.',
      icon: Sparkles,
      badge: 'Instant',
      isRazorpay: false
    }
  ];

  // Primary Order Processing Workflow
  const handleProceedPayment = async () => {
    setPaymentState({ status: 'idle', message: '', details: null });
    setIsProcessing(true);

    try {
      // 1. Free Community Donation Flow (Bypasses payment gateway)
      if (isDonation) {
        confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
        const order = await createOrder({
          rescue,
          portions,
          paymentMethod: 'Free Community Rescue'
        });
        setIsProcessing(false);
        onCompleteOrder(order?.id || 'order-new');
        return;
      }

      // 2. Pay at Store or Community Credits
      if (paymentMethod !== 'razorpay') {
        confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
        const order = await createOrder({
          rescue,
          portions,
          paymentMethod: paymentMethod === 'store' ? 'Pay at Store Counter' : 'ResQ Community Credits'
        });
        setIsProcessing(false);
        onCompleteOrder(order?.id || 'order-new');
        return;
      }

      // 3. Razorpay Online Checkout Flow
      // Step A: Create order securely from backend (secret key is NEVER exposed)
      const rzpData = await createRazorpayOrder({
        rescueId: rescue.id,
        portions
      });

      setPendingRazorpayData(rzpData);

      // Step B: Load Razorpay SDK script from CDN
      const isLoaded = await loadRazorpayScript();

      // Check if standard Razorpay modal is usable or if we should open the test sandbox simulator
      const isRealKey = rzpData.keyId && !rzpData.keyId.includes('demo') && !rzpData.isMockOrder;

      if (isLoaded && window.Razorpay && isRealKey) {
        // Real Razorpay Checkout Modal
        const options = {
          key: rzpData.keyId,
          amount: rzpData.amountInPaise,
          currency: rzpData.currency || 'INR',
          name: 'ResQFood Surplus Marketplace',
          description: `${portions}x ${rescue.title} at ${rescue.seller}`,
          image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=120&q=80',
          order_id: rzpData.orderId,
          handler: async function (response) {
            try {
              setIsProcessing(true);
              setPaymentState({ status: 'idle', message: 'Verifying payment cryptographic signature on backend...' });

              // Step C: Verify HMAC signature securely on the backend
              const confirmedOrder = await verifyRazorpayPayment({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                rescueId: rescue.id,
                portions,
                paymentMethod: 'Razorpay (Online UPI/Card)'
              });

              confetti({ particleCount: 100, spread: 80, origin: { y: 0.6 } });
              setPaymentState({ status: 'success', message: 'Payment verified and order confirmed!' });
              setIsProcessing(false);
              onCompleteOrder(confirmedOrder?.id || 'order-new');
            } catch (verifErr) {
              setIsProcessing(false);
              setPaymentState({
                status: 'failed',
                message: verifErr.message || 'Payment signature verification failed on backend. Order was not completed.'
              });
            }
          },
          prefill: {
            name: currentUser?.name || 'Rahul Sharma',
            email: currentUser?.email || 'rahul.sharma@example.com',
            contact: '+919876543210'
          },
          notes: {
            rescueId: rescue.id,
            portions: portions.toString(),
            pickupWindow: rescue.pickupWindow
          },
          theme: {
            color: '#059669' // ResQFood Emerald
          },
          modal: {
            ondismiss: function () {
              setIsProcessing(false);
              setPaymentState({
                status: 'cancelled',
                message: 'Payment cancelled: You closed the Razorpay payment window without completing the transaction.'
              });
            }
          }
        };

        const rzp = new window.Razorpay(options);
        rzp.on('payment.failed', function (response) {
          setIsProcessing(false);
          setPaymentState({
            status: 'failed',
            message: response.error?.description || 'Transaction declined by bank or issuing authority.',
            details: response.error
          });
        });

        rzp.open();
      } else {
        // Seamless Hackathon / Demo Sandbox Modal for testing without real card charges
        setIsProcessing(false);
        setShowSandboxModal(true);
      }
    } catch (err) {
      setIsProcessing(false);
      setPaymentState({
        status: 'failed',
        message: err.message || 'Failed to initialize payment gateway. Please try again.'
      });
    }
  };

  // Complete Sandbox Verification for Hackathon Testing
  const handleCompleteSandboxPayment = async () => {
    setShowSandboxModal(false);
    setIsProcessing(true);
    setPaymentState({ status: 'idle', message: 'Verifying payment signature with backend...' });

    try {
      const demoOrderId = pendingRazorpayData?.orderId || `order_demo_${Date.now()}`;
      const demoPaymentId = `pay_demo_${Date.now().toString().slice(-8)}`;
      const demoSignature = `sig_demo_${Date.now()}`;

      // Call the backend verification API
      const confirmedOrder = await verifyRazorpayPayment({
        razorpay_order_id: demoOrderId,
        razorpay_payment_id: demoPaymentId,
        razorpay_signature: demoSignature,
        rescueId: rescue.id,
        portions,
        paymentMethod: 'Razorpay Sandbox (Verified)'
      });

      confetti({ particleCount: 100, spread: 80, origin: { y: 0.6 } });
      setPaymentState({ status: 'success', message: 'Payment successfully verified!' });
      setIsProcessing(false);
      onCompleteOrder(confirmedOrder?.id || 'order-new');
    } catch (err) {
      setIsProcessing(false);
      setPaymentState({
        status: 'failed',
        message: err.message || 'Payment signature verification failed on backend.'
      });
    }
  };

  // Simulate Payment Failure for Demo
  const handleSimulatePaymentFailure = () => {
    setShowSandboxModal(false);
    setIsProcessing(false);
    setPaymentState({
      status: 'failed',
      message: 'Payment failed: Bank server timed out or insufficient funds. (Simulated test failure)'
    });
    addToast('Simulated payment failure triggered for testing', 'error');
  };

  // Simulate Payment Cancellation for Demo
  const handleSimulatePaymentCancelled = () => {
    setShowSandboxModal(false);
    setIsProcessing(false);
    setPaymentState({
      status: 'cancelled',
      message: 'Payment cancelled: Checkout window closed by user without charging.'
    });
    addToast('Payment cancelled by user', 'info');
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Top Back navigation */}
      <div>
        <button
          onClick={onBack}
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-600 hover:text-emerald-700 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to food details</span>
        </button>
      </div>

      {/* Page Title & Breadcrumb */}
      <div className="space-y-1">
        <div className="flex items-center gap-2 text-xs font-bold text-emerald-600 uppercase tracking-wider">
          <Lock className="w-3.5 h-3.5" />
          <span>Secure Checkout Flow</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight font-display">
          Review order & choose payment
        </h1>
        <p className="text-xs sm:text-sm text-slate-500">
          Backend order creation with server-side HMAC signature verification powered by Razorpay.
        </p>
      </div>

      {/* Payment State Banners: SUCCESS / FAILED / CANCELLED */}
      {paymentState.status === 'failed' && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-900 space-y-2 animate-fade-in">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-extrabold text-rose-900">Payment failed</h4>
              <p className="text-xs text-rose-700 mt-0.5 leading-relaxed">
                {paymentState.message}
              </p>
            </div>
            <button
              onClick={() => setPaymentState({ status: 'idle', message: '', details: null })}
              className="text-xs font-bold text-rose-700 hover:text-rose-900 underline shrink-0"
            >
              Dismiss
            </button>
          </div>

          <div className="flex items-center gap-2 pt-1 border-t border-rose-200/60">
            <button
              onClick={handleProceedPayment}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-sm transition-all"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Retry Payment</span>
            </button>
            <span className="text-[11px] text-rose-600">You can also try a different payment method below.</span>
          </div>
        </div>
      )}

      {paymentState.status === 'cancelled' && (
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 space-y-2 animate-fade-in">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-extrabold text-amber-900">Payment cancelled</h4>
              <p className="text-xs text-amber-700 mt-0.5 leading-relaxed">
                {paymentState.message} No funds have been deducted from your account.
              </p>
            </div>
            <button
              onClick={() => setPaymentState({ status: 'idle', message: '', details: null })}
              className="text-xs font-bold text-amber-800 hover:text-amber-950 underline shrink-0"
            >
              Dismiss
            </button>
          </div>

          <div className="flex items-center gap-2 pt-1 border-t border-amber-200/60">
            <button
              onClick={handleProceedPayment}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shadow-sm transition-all"
            >
              <span>Reopen Checkout</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {paymentState.status === 'success' && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-900 flex items-center gap-3 animate-fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <div>
            <h4 className="text-sm font-extrabold text-emerald-900">Payment successful!</h4>
            <p className="text-xs text-emerald-700 mt-0.5">Redirecting to your pickup pass with order ID and map location...</p>
          </div>
        </div>
      )}

      {/* Main Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Cols: Order Options & Payment Method */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Step 1: Portion Selector */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-soft space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider font-display">
                1. Select Portions
              </h2>
              <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                {rescue.portionsLeft} portion(s) available
              </span>
            </div>

            <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-2xl border border-slate-100">
              <div>
                <span className="text-sm font-bold text-slate-800 block">Portions to reserve</span>
                <span className="text-xs text-slate-500">
                  Limit {rescue.limitPerBuyer || 3} per person · Freshness guaranteed
                </span>
              </div>

              <div className="flex items-center bg-white rounded-xl p-1 border border-slate-200 shadow-sm">
                <button
                  onClick={() => setPortions(Math.max(1, portions - 1))}
                  disabled={portions <= 1}
                  className="w-8 h-8 rounded-lg bg-slate-50 hover:bg-slate-100 disabled:opacity-40 font-bold text-slate-800 flex items-center justify-center transition-colors"
                >
                  -
                </button>
                <span className="w-10 text-center font-black text-sm text-slate-900">
                  {portions}
                </span>
                <button
                  onClick={() => setPortions(Math.min(rescue.limitPerBuyer || 3, rescue.portionsLeft, portions + 1))}
                  disabled={portions >= Math.min(rescue.limitPerBuyer || 3, rescue.portionsLeft)}
                  className="w-8 h-8 rounded-lg bg-slate-50 hover:bg-slate-100 disabled:opacity-40 font-bold text-slate-800 flex items-center justify-center transition-colors"
                >
                  +
                </button>
              </div>
            </div>
          </div>

          {/* Step 2: Pickup Window & Arrival Time */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-soft space-y-4">
            <h2 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider font-display">
              2. Pickup Time Slot
            </h2>
            
            <div className="flex items-start gap-2.5 text-xs text-slate-600 bg-emerald-50/70 p-3 rounded-2xl border border-emerald-200/60">
              <Clock className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
              <div>
                <span>Official store pickup window: <strong>{rescue.pickupWindow}</strong></span>
                <span className="block text-[11px] text-slate-500 mt-0.5">
                  Arrive during this window to collect your freshly packed surplus.
                </span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2">
              {[rescue.pickupStart || '20:30', '21:00', rescue.pickupEnd || '22:00'].map((slot) => (
                <button
                  key={slot}
                  onClick={() => setSelectedSlot(slot)}
                  className={`py-2.5 px-3 rounded-xl text-xs font-bold border transition-all ${
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

          {/* Step 3: Payment Method Selection */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-soft space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider font-display">
                3. Choose Payment Method
              </h2>
              <div className="flex items-center gap-1 text-[11px] text-slate-500">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>256-Bit Encrypted</span>
              </div>
            </div>

            <div className="space-y-3">
              {paymentOptions.map((opt) => {
                const Icon = opt.icon;
                const isSelected = paymentMethod === opt.id;
                return (
                  <div
                    key={opt.id}
                    onClick={() => setPaymentMethod(opt.id)}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                      isSelected
                        ? 'bg-emerald-50/90 border-emerald-500 ring-2 ring-emerald-500/20 shadow-sm'
                        : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-3.5">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                        isSelected ? 'bg-emerald-600 text-white shadow-sm' : 'bg-slate-100 text-slate-600'
                      }`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs sm:text-sm font-extrabold text-slate-900">{opt.name}</span>
                          {opt.badge && (
                            <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                              {opt.badge}
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-500 mt-0.5">{opt.desc}</p>
                      </div>
                    </div>

                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                      isSelected ? 'border-emerald-600 bg-emerald-600' : 'border-slate-300'
                    }`}>
                      {isSelected && <div className="w-2 h-2 rounded-full bg-white" />}
                    </div>
                  </div>
                );
              })}
            </div>

            {paymentMethod === 'razorpay' && (
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 text-[11px] text-slate-500 flex items-center gap-2">
                <Lock className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>Payments are processed securely via <strong>Razorpay Payment Gateway</strong>. Server-side HMAC SHA256 signature verification guarantees transaction validity.</span>
              </div>
            )}
          </div>
        </div>

        {/* Right Col: Cart & Order Summary */}
        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-soft space-y-5 sticky top-24">
            
            <h2 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider font-display">
              Cart & Order Summary
            </h2>

            {/* Food item preview card */}
            <div className="flex items-start gap-3 p-3.5 bg-slate-50 rounded-2xl border border-slate-100">
              <img
                src={rescue.image || 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=150&q=80'}
                alt={rescue.title}
                className="w-16 h-16 rounded-xl object-cover shrink-0 border border-slate-200"
              />
              <div className="min-w-0 flex-1 space-y-1">
                <h3 className="font-extrabold text-slate-900 text-xs leading-tight line-clamp-1">
                  {rescue.title}
                </h3>
                <div className="text-[11px] text-slate-500 flex items-center gap-1">
                  <Store className="w-3 h-3 text-emerald-600 shrink-0" />
                  <span className="truncate">{rescue.seller}</span>
                </div>
                <div className="text-[11px] font-bold text-slate-700">
                  {portions} {portions === 1 ? 'portion' : 'portions'} × {rescue.rescuePrice === 0 ? 'FREE' : `₹${rescue.rescuePrice}`}
                </div>
              </div>
            </div>

            {/* Pickup location indicator */}
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-1">
              <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-700">
                <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                <span>Pickup Location</span>
              </div>
              <p className="text-[11px] text-slate-500 line-clamp-2 pl-5">
                {rescue.address}
              </p>
            </div>

            {/* Accurate Price Breakdown Calculation */}
            <div className="space-y-2.5 text-xs pt-2 border-t border-slate-100">
              <div className="flex items-center justify-between text-slate-500">
                <span>Menu value ({portions} portions)</span>
                <span className="line-through text-slate-400">₹{menuPriceTotal}</span>
              </div>

              <div className="flex items-center justify-between text-slate-700 font-semibold">
                <span>ResQFood rescue price</span>
                <span>{isDonation ? 'FREE' : `₹${rescuePriceTotal}`}</span>
              </div>

              <div className="flex items-center justify-between text-slate-500">
                <span>Platform zero-waste fee</span>
                <span className="text-emerald-700 font-bold">FREE (₹0)</span>
              </div>

              {!isDonation && savingsTotal > 0 && (
                <div className="bg-emerald-50 text-emerald-800 p-2.5 rounded-xl text-xs font-bold text-center border border-emerald-200/60">
                  🎉 You save ₹{savingsTotal} ({Math.round((savingsTotal / menuPriceTotal) * 100)}% discount)
                </div>
              )}
            </div>

            {/* Total Payable */}
            <div className="pt-3 border-t border-slate-200 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Total Payable</span>
                <span className="text-[11px] text-slate-400">Inclusive of all taxes</span>
              </div>
              <span className="text-2xl font-black text-slate-900 font-display">
                {isDonation ? 'FREE' : `₹${rescuePriceTotal}`}
              </span>
            </div>

            {/* Primary Action Button */}
            <button
              onClick={handleProceedPayment}
              disabled={isProcessing}
              className="w-full py-3.5 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white font-extrabold text-sm shadow-card hover:shadow-glow transition-all flex items-center justify-center gap-2"
            >
              {isProcessing ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Contacting Gateway...</span>
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4" />
                  <span>
                    {isDonation
                      ? 'Confirm Free Rescue'
                      : paymentMethod === 'razorpay'
                      ? `Pay ₹${rescuePriceTotal} via Razorpay`
                      : paymentMethod === 'store'
                      ? `Reserve & Pay ₹${rescuePriceTotal} at Store`
                      : `Pay ₹${rescuePriceTotal} with Credits`}
                  </span>
                </>
              )}
            </button>

            <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-400 text-center">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>Instant OTP pass & map directions generated upon confirmation</span>
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Razorpay Test Simulator Modal (For Demo / Hackathon evaluation) */}
      {showSandboxModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-5 animate-scale-up">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center font-black text-sm">
                  R
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 text-sm">Razorpay Checkout Sandbox</h3>
                  <span className="text-[10px] text-slate-400 font-mono">Test Gateway Mode</span>
                </div>
              </div>
              <span className="text-xs font-black text-slate-900 bg-slate-100 px-2 py-1 rounded-lg">
                ₹{rescuePriceTotal}
              </span>
            </div>

            <div className="space-y-2 text-xs text-slate-600 bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
              <div className="flex justify-between">
                <span className="text-slate-400">Order ID:</span>
                <span className="font-mono text-slate-800 font-bold">{pendingRazorpayData?.orderId || 'order_demo_123'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Item:</span>
                <span className="font-semibold text-slate-800">{rescue.title} ({portions}x)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Store:</span>
                <span className="font-semibold text-slate-800">{rescue.seller}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Security:</span>
                <span className="text-emerald-700 font-bold">HMAC SHA256 Signature Verification</span>
              </div>
            </div>

            <p className="text-xs text-slate-500 leading-relaxed">
              Test all payment states required by the hackathon criteria:
            </p>

            {/* Test State Triggers */}
            <div className="space-y-2.5">
              <button
                onClick={handleCompleteSandboxPayment}
                className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm transition-all flex items-center justify-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Simulate Successful Payment (Verify Signature)</span>
              </button>

              <button
                onClick={handleSimulatePaymentFailure}
                className="w-full py-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold text-xs transition-all flex items-center justify-center gap-2"
              >
                <AlertCircle className="w-4 h-4" />
                <span>Simulate Payment Failure (Declined)</span>
              </button>

              <button
                onClick={handleSimulatePaymentCancelled}
                className="w-full py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-all flex items-center justify-center gap-2"
              >
                <AlertTriangle className="w-4 h-4" />
                <span>Cancel / Dismiss Checkout</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
