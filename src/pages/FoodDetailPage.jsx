import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  ArrowLeft,
  Clock,
  MapPin,
  Star,
  ShieldCheck,
  Thermometer,
  AlertCircle,
  CheckCircle2,
  Share2,
  Heart,
  ChevronRight,
  Info
} from 'lucide-react';

export default function FoodDetailPage({ rescueId, onBack, onCheckout, onNavigate }) {
  const { rescues, dynamicRescues, loading, addToast } = useApp();
  const allListings = dynamicRescues || rescues;
  const rescue = allListings.find((r) => r.id === rescueId) || rescues.find((r) => r.id === rescueId);

  const [portions, setPortions] = useState(1);

  if (!rescue) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center space-y-4">
        <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto text-slate-400">
          <AlertCircle className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-bold text-slate-900 font-display">
          {loading ? 'Loading surplus details...' : 'Listing Not Found'}
        </h2>
        <p className="text-sm text-slate-500">
          This surplus listing may have expired, been claimed, or removed by the seller.
        </p>
        <button
          onClick={onBack}
          className="px-6 py-2.5 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 transition-colors"
        >
          Return to Marketplace
        </button>
      </div>
    );
  }

  const isSoldOut = rescue.portionsLeft <= 0 || rescue.status === 'Sold Out';
  const isExpired = rescue.status === 'Expired';
  const isAvailable = !isSoldOut && !isExpired && rescue.status !== 'Cancelled';
  const maxLimit = Math.max(1, Math.min(rescue.limitPerBuyer || 3, rescue.portionsLeft));

  const handleShare = () => {
    navigator.clipboard?.writeText(window.location.href);
    addToast('Listing link copied to clipboard!', 'info');
  };

  const isDonation = rescue.rescuePrice === 0 || rescue.isDonation;
  const savingsPerPortion = rescue.originalPrice - rescue.rescuePrice;
  const totalSavings = savingsPerPortion * portions;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Back button */}
      <div>
        <button
          onClick={onBack}
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-600 hover:text-emerald-700 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to discover</span>
        </button>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-card overflow-hidden">
        
        {/* Main Image Header */}
        <div className="relative h-72 sm:h-96 w-full bg-slate-900">
          <img
            src={rescue.image}
            alt={rescue.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

          {/* Top Overlays */}
          <div className="absolute top-4 left-4 flex items-center gap-2">
            {isDonation ? (
              <span className="bg-emerald-600 text-white font-extrabold text-xs px-3 py-1 rounded-full shadow-md">
                100% Free Rescue
              </span>
            ) : (
              <span className="bg-emerald-600 text-white font-extrabold text-sm px-3.5 py-1.5 rounded-full shadow-md">
                {rescue.discountPercent}% OFF
              </span>
            )}

            {rescue.isExpiringSoon && (
              <span className="bg-amber-500 text-slate-950 font-bold text-xs px-3 py-1 rounded-full shadow-md animate-soft-pulse">
                Expiring soon
              </span>
            )}
          </div>

          <div className="absolute top-4 right-4">
            <button
              onClick={handleShare}
              className="p-2.5 rounded-full bg-black/40 backdrop-blur-md text-white hover:bg-black/60 transition-colors"
              title="Share listing"
            >
              <Share2 className="w-4 h-4" />
            </button>
          </div>

          {/* Bottom Title in Image */}
          <div className="absolute bottom-6 left-6 right-6 text-white space-y-2">
            <div className="flex items-center gap-2 text-xs font-semibold text-emerald-300">
              <span className="bg-emerald-500/30 backdrop-blur-md px-2.5 py-0.5 rounded-full border border-emerald-400/30">
                {rescue.category}
              </span>
              <span>·</span>
              <span className="flex items-center gap-1">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                {rescue.fssaiLicense || 'FSSAI Verified'}
              </span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-extrabold font-display leading-tight">
              {rescue.title}
            </h1>

            <div className="flex items-center gap-2 text-sm text-slate-200">
              <span className="font-semibold text-white">{rescue.seller}</span>
              <span>·</span>
              <div className="flex items-center gap-1 text-amber-400 font-bold">
                <Star className="w-3.5 h-3.5 fill-amber-400" />
                <span>{rescue.rating}</span>
                <span className="text-slate-300 font-normal">({rescue.reviewsCount} rescues)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 sm:p-8 space-y-8">
          
          {/* Description */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
              About this rescue
            </h3>
            <p className="text-base text-slate-700 leading-relaxed">
              {rescue.description}
            </p>
          </div>

          {/* 3 Core Metric Badges */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-1">
              <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                <Clock className="w-4 h-4 text-emerald-600" />
                <span>Pickup window</span>
              </div>
              <div className="text-sm font-bold text-slate-900">
                {rescue.pickupWindow}
              </div>
            </div>

            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-1">
              <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Freshness</span>
              </div>
              <div className="text-sm font-bold text-slate-900">
                {rescue.freshnessCutoff}
              </div>
            </div>

            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-1">
              <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                <MapPin className="w-4 h-4 text-emerald-600" />
                <span>Distance</span>
              </div>
              <div className="text-sm font-bold text-slate-900">
                {rescue.distance} km · {rescue.location.split(',')[0]}
              </div>
            </div>
          </div>

          {/* Temperature & Storage info */}
          <div className="bg-emerald-50/70 border border-emerald-200/80 rounded-2xl p-4 flex items-start gap-3">
            <Thermometer className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
            <div className="text-xs text-emerald-900">
              <span className="font-bold">Hold Temperature & Safety Protocol: </span>
              <span>{rescue.holdTemperature}</span>
            </div>
          </div>

          {/* Allergens & Dietary */}
          <div className="space-y-3 pb-6 border-b border-slate-100">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Allergen information
            </h3>
            {rescue.allergens && rescue.allergens.length > 0 ? (
              <div className="space-y-2">
                <div className="flex flex-wrap gap-2">
                  {rescue.allergens.map((alg) => (
                    <span
                      key={alg}
                      className="bg-amber-50 border border-amber-200 text-amber-900 text-xs font-semibold px-2.5 py-1 rounded-lg"
                    >
                      Contains: {alg}
                    </span>
                  ))}
                </div>
                <p className="text-xs text-slate-500 italic">
                  Prepared in a commercial kitchen that also handles other allergens. If you have severe allergies, please confirm with store staff at pickup.
                </p>
              </div>
            ) : (
              <p className="text-xs text-emerald-800 bg-emerald-50/60 p-2.5 rounded-xl border border-emerald-200/50">
                No major declared allergens (Gluten-Free & Plant-Based).
              </p>
            )}
          </div>

          {/* Pickup Store Location & Handover instructions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Pickup location
              </h3>
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-1.5">
                <div className="font-bold text-slate-900 text-sm">{rescue.seller}</div>
                <p className="text-xs text-slate-600 leading-relaxed">{rescue.address}</p>
                <div className="pt-2">
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600">
                    <MapPin className="w-3.5 h-3.5" />
                    Bandra West Zone · Simulated GPS
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Handover instructions
              </h3>
              <ul className="space-y-2 text-xs text-slate-600">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>Pay now with the demo payment sandbox</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>Collect in person within the pickup window ({rescue.pickupWindow.split(' ')[0]})</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>Confirm handover with scannable QR code + 4-digit OTP</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom Sticky Action Bar */}
          <div className="pt-6 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-6">
            
            {/* Quantity Selector */}
            <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-start">
              <div>
                <span className="text-xs text-slate-500 block">Quantity</span>
                <span className="text-[11px] text-emerald-700 font-semibold">
                  {rescue.portionsLeft} portions left (limit {rescue.limitPerBuyer || 3})
                </span>
              </div>

              <div className="flex items-center bg-slate-100 rounded-2xl p-1 border border-slate-200">
                <button
                  onClick={() => setPortions(Math.max(1, portions - 1))}
                  disabled={portions <= 1}
                  className="w-8 h-8 rounded-xl bg-white disabled:opacity-40 font-bold text-slate-800 shadow-sm flex items-center justify-center hover:bg-slate-50 transition-colors"
                >
                  -
                </button>
                <span className="w-10 text-center font-bold text-sm text-slate-900">
                  {portions}
                </span>
                <button
                  onClick={() => setPortions(Math.min(maxLimit, portions + 1))}
                  disabled={portions >= maxLimit}
                  className="w-8 h-8 rounded-xl bg-white disabled:opacity-40 font-bold text-slate-800 shadow-sm flex items-center justify-center hover:bg-slate-50 transition-colors"
                >
                  +
                </button>
              </div>
            </div>

            {/* Price & Reserve Button */}
            <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto">
              <div className="text-right">
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-black text-slate-900 font-display">
                    {isDonation ? 'FREE' : `₹${rescue.rescuePrice * portions}`}
                  </span>
                  {!isDonation && rescue.originalPrice > 0 && (
                    <span className="text-sm text-slate-400 line-through">
                      ₹{rescue.originalPrice * portions}
                    </span>
                  )}
                </div>
                {!isDonation && (
                  <span className="text-xs text-emerald-600 font-bold block">
                    You save ₹{totalSavings}
                  </span>
                )}
              </div>

              <button
                onClick={() => onCheckout(rescue.id, portions)}
                disabled={!isAvailable}
                className="px-8 py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-bold text-sm shadow-card hover:shadow-glow transition-all flex items-center gap-2"
              >
                <span>{isSoldOut ? 'Sold Out' : isExpired ? 'Expired' : isDonation ? 'Claim Bulk' : 'Reserve & pay'}</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Safety standards link */}
          <div className="text-center pt-2">
            <button
              onClick={() => onNavigate('/safety')}
              className="text-xs text-slate-500 hover:text-emerald-700 underline font-medium inline-flex items-center gap-1"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              How we verify food safety & FSSAI licenses
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
