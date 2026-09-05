import React from 'react';
import { Clock, MapPin, Star, AlertTriangle, ShieldCheck, ArrowRight, Heart } from 'lucide-react';

export default function FoodCard({ rescue, onSelect, onQuickReserve }) {
  const isDonation = rescue.rescuePrice === 0 || rescue.isDonation;
  const portionsRatio = (rescue.portionsLeft / rescue.portionsTotal) * 100;

  return (
    <div
      onClick={() => onSelect(rescue.id)}
      className="group bg-white rounded-2xl border border-slate-200/80 hover:border-emerald-300 shadow-soft hover:shadow-card transition-all duration-300 overflow-hidden flex flex-col cursor-pointer hover:-translate-y-1"
    >
      {/* Card Image Container */}
      <div className="relative h-48 w-full overflow-hidden bg-slate-100">
        <img
          src={rescue.image}
          alt={rescue.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-black/20" />

        {/* Top Badges */}
        <div className="absolute top-3 left-3 flex flex-wrap items-center gap-1.5 z-10">
          {isDonation ? (
            <span className="bg-emerald-600 text-white font-bold text-xs px-2.5 py-1 rounded-full shadow-md flex items-center gap-1">
              <Heart className="w-3 h-3 fill-white" />
              100% Free Donation
            </span>
          ) : (
            <span className="bg-emerald-600 text-white font-extrabold text-xs px-2.5 py-1 rounded-full shadow-md">
              {rescue.discountPercent}% OFF
            </span>
          )}

          {rescue.isExpiringSoon && (
            <span className="bg-amber-500 text-slate-950 font-bold text-[11px] px-2 py-0.5 rounded-full shadow-md flex items-center gap-1 animate-soft-pulse">
              <Clock className="w-3 h-3" />
              Expiring soon
            </span>
          )}
        </div>

        {/* Category Badge (Top Right) */}
        <div className="absolute top-3 right-3 z-10">
          <span className="bg-white/90 backdrop-blur-md text-slate-800 font-medium text-xs px-2.5 py-1 rounded-full shadow-sm">
            {rescue.category}
          </span>
        </div>

        {/* Rating & Distance Overlay (Bottom of Image) */}
        <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-xs text-white">
          <div className="flex items-center gap-1.5 bg-black/40 backdrop-blur-md px-2 py-1 rounded-lg">
            <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
            <span className="font-bold">{rescue.rating}</span>
            <span className="text-white/70">({rescue.reviewsCount})</span>
          </div>

          <div className="flex items-center gap-1 bg-black/40 backdrop-blur-md px-2 py-1 rounded-lg">
            <MapPin className="w-3.5 h-3.5 text-emerald-400" />
            <span>{rescue.distance} km away</span>
          </div>
        </div>
      </div>

      {/* Card Body */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          {/* Seller Name & Verified badge */}
          <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium mb-1">
            <span className="truncate">{rescue.seller}</span>
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" title="FSSAI Verified" />
            <span>·</span>
            <span className="truncate">{rescue.location.split(',')[0]}</span>
          </div>

          {/* Listing Title */}
          <h3 className="font-bold text-slate-900 text-base leading-snug group-hover:text-emerald-700 transition-colors line-clamp-1 mb-2 font-display">
            {rescue.title}
          </h3>

          {/* Pickup Window Info */}
          <div className="flex items-center gap-1.5 text-xs text-slate-600 bg-slate-50 px-2.5 py-1.5 rounded-lg mb-3">
            <Clock className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span className="font-medium">Pickup window:</span>
            <span className="text-slate-800 font-semibold">{rescue.pickupWindow}</span>
          </div>

          {/* Allergen tags */}
          {rescue.allergens && rescue.allergens.length > 0 && (
            <div className="flex items-center gap-1 flex-wrap mb-3 text-[10px] text-slate-500">
              <span className="text-slate-400">Contains:</span>
              {rescue.allergens.map((allergen) => (
                <span
                  key={allergen}
                  className="bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded"
                >
                  {allergen}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Price & Action Section */}
        <div className="pt-3 border-t border-slate-100 mt-auto">
          {/* Portions left progress bar */}
          <div className="mb-3">
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="text-slate-500">Portions remaining</span>
              <span className={`font-bold ${rescue.portionsLeft <= 3 ? 'text-amber-600' : 'text-emerald-700'}`}>
                {rescue.portionsLeft} left
              </span>
            </div>
            <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  rescue.portionsLeft <= 3 ? 'bg-amber-500' : 'bg-emerald-500'
                }`}
                style={{ width: `${Math.max(10, Math.min(100, portionsRatio))}%` }}
              />
            </div>
          </div>

          <div className="flex items-center justify-between gap-2">
            <div>
              <div className="flex items-baseline gap-1.5">
                {isDonation ? (
                  <span className="text-lg font-black text-emerald-600 font-display">
                    FREE
                  </span>
                ) : (
                  <>
                    <span className="text-xl font-black text-slate-900 font-display">
                      ₹{rescue.rescuePrice}
                    </span>
                    <span className="text-xs text-slate-400 line-through">
                      ₹{rescue.originalPrice}
                    </span>
                  </>
                )}
              </div>
              <span className="text-[10px] text-emerald-700 font-medium">
                {isDonation ? 'For NGO / Community' : `Save ₹${rescue.originalPrice - rescue.rescuePrice}`}
              </span>
            </div>

            <button
              onClick={(e) => {
                e.stopPropagation();
                if (onQuickReserve) {
                  onQuickReserve(rescue);
                } else {
                  onSelect(rescue.id);
                }
              }}
              className="inline-flex items-center gap-1 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs px-3.5 py-2 rounded-xl shadow-sm hover:shadow-md transition-all group-hover:translate-x-0.5"
            >
              <span>{isDonation ? 'Claim Bulk' : 'Reserve'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
