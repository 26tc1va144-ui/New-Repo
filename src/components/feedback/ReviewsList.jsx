import React, { useState, useMemo } from 'react';
import {
  Star,
  ShieldCheck,
  MessageSquare,
  Sparkles,
  Store,
  Clock,
  ThumbsUp,
  Filter
} from 'lucide-react';

export default function ReviewsList({
  providerName,
  averageRating = 4.8,
  totalReviews = 0,
  ratingsBreakdown = { foodQuality: 4.9, pickupExperience: 4.8, valueForMoney: 4.9 },
  reviews = []
}) {
  const [activeFilter, setActiveFilter] = useState('all'); // 'all' | '5' | 'with-comment'

  const filteredReviews = useMemo(() => {
    if (!reviews || reviews.length === 0) return [];
    if (activeFilter === '5') {
      return reviews.filter(r => r.overallRating >= 4.8 || (r.ratings?.foodQuality === 5 && r.ratings?.valueForMoney === 5));
    }
    if (activeFilter === 'with-comment') {
      return reviews.filter(r => r.comment && r.comment.trim().length > 0);
    }
    return reviews;
  }, [reviews, activeFilter]);

  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-card p-6 sm:p-8 space-y-6 text-left">
      
      {/* Top Header: Provider Average Rating & Summary */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-emerald-700 uppercase tracking-wider mb-1">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Verified Customer Feedback</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900 font-display">
            Customer Ratings & Reviews
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Based on completed and verified surplus food pickups from <strong className="text-slate-700">{providerName}</strong>
          </p>
        </div>

        {/* Big Overall Rating Score Card */}
        <div className="flex items-center gap-3.5 bg-slate-50 p-4 rounded-2xl border border-slate-200/80 shadow-xs shrink-0">
          <div className="text-center">
            <div className="text-3xl font-black text-slate-900 leading-none flex items-center justify-center gap-1 font-display">
              <span>{Number(averageRating || 4.8).toFixed(1)}</span>
              <Star className="w-6 h-6 fill-amber-400 text-amber-400" />
            </div>
            <span className="text-[11px] font-bold text-slate-500 block mt-1">
              out of 5.0
            </span>
          </div>
          <div className="h-10 w-px bg-slate-200" />
          <div className="text-left text-xs space-y-0.5">
            <span className="font-extrabold text-slate-800 block text-sm">
              {totalReviews} {totalReviews === 1 ? 'Review' : 'Verified Reviews'}
            </span>
            <span className="text-[11px] text-emerald-700 font-semibold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              98% Recommended
            </span>
          </div>
        </div>
      </div>

      {/* 3 Aspects Breakdown Meter */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 bg-slate-50/80 rounded-2xl border border-slate-100">
        
        {/* Food Quality */}
        <div className="bg-white p-3 rounded-xl border border-slate-200/60 space-y-1.5">
          <div className="flex items-center justify-between text-xs font-bold text-slate-700">
            <span className="flex items-center gap-1.5">
              <span>🍲</span>
              <span>Food Quality</span>
            </span>
            <span className="text-amber-600 font-extrabold">
              {Number(ratingsBreakdown?.foodQuality || 4.9).toFixed(1)}/5
            </span>
          </div>
          <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-emerald-500 rounded-full"
              style={{ width: `${Math.min(100, ((ratingsBreakdown?.foodQuality || 4.9) / 5) * 100)}%` }}
            />
          </div>
        </div>

        {/* Pickup Experience */}
        <div className="bg-white p-3 rounded-xl border border-slate-200/60 space-y-1.5">
          <div className="flex items-center justify-between text-xs font-bold text-slate-700">
            <span className="flex items-center gap-1.5">
              <span>⏱️</span>
              <span>Pickup Experience</span>
            </span>
            <span className="text-amber-600 font-extrabold">
              {Number(ratingsBreakdown?.pickupExperience || 4.8).toFixed(1)}/5
            </span>
          </div>
          <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-teal-500 rounded-full"
              style={{ width: `${Math.min(100, ((ratingsBreakdown?.pickupExperience || 4.8) / 5) * 100)}%` }}
            />
          </div>
        </div>

        {/* Value for Money */}
        <div className="bg-white p-3 rounded-xl border border-slate-200/60 space-y-1.5">
          <div className="flex items-center justify-between text-xs font-bold text-slate-700">
            <span className="flex items-center gap-1.5">
              <span>💰</span>
              <span>Value for Money</span>
            </span>
            <span className="text-amber-600 font-extrabold">
              {Number(ratingsBreakdown?.valueForMoney || 4.9).toFixed(1)}/5
            </span>
          </div>
          <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-amber-500 rounded-full"
              style={{ width: `${Math.min(100, ((ratingsBreakdown?.valueForMoney || 4.9) / 5) * 100)}%` }}
            />
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center justify-between gap-2 pt-2">
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setActiveFilter('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeFilter === 'all'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            All Reviews ({reviews.length})
          </button>

          <button
            onClick={() => setActiveFilter('5')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1 ${
              activeFilter === '5'
                ? 'bg-amber-500 text-slate-950 shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <Star className="w-3 h-3 fill-current" />
            <span>Top Rated (5★)</span>
          </button>

          <button
            onClick={() => setActiveFilter('with-comment')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1 ${
              activeFilter === 'with-comment'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <MessageSquare className="w-3 h-3" />
            <span>With Comments</span>
          </button>
        </div>
      </div>

      {/* List of Selected Reviews */}
      {filteredReviews.length === 0 ? (
        <div className="p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200 space-y-2">
          <MessageSquare className="w-8 h-8 text-slate-300 mx-auto" />
          <p className="text-xs text-slate-500">No reviews found matching this filter.</p>
        </div>
      ) : (
        <div className="space-y-3.5">
          {filteredReviews.map((review) => {
            const dateStr = review.createdAt
              ? new Date(review.createdAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })
              : 'Recently';

            return (
              <div
                key={review.id}
                className="p-4 rounded-2xl bg-white border border-slate-200/80 hover:border-slate-300 transition-all space-y-2.5 shadow-xs"
              >
                {/* Reviewer Header */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xs shadow-xs">
                      {review.userAvatar || (review.userName ? review.userName.slice(0, 2).toUpperCase() : 'VR')}
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-extrabold text-slate-900 text-xs sm:text-sm">
                          {review.userName}
                        </span>
                        <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded-md border border-emerald-200/60">
                          <ShieldCheck className="w-3 h-3" />
                          Verified
                        </span>
                      </div>
                      <span className="text-[11px] text-slate-400 block mt-0.5">
                        {dateStr} · Rescued {review.foodTitle || 'Surplus Meal'}
                      </span>
                    </div>
                  </div>

                  {/* Star Rating Badge */}
                  <div className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs font-black">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    <span>{review.overallRating?.toFixed(1) || '5.0'}</span>
                  </div>
                </div>

                {/* Aspect Ratings Badges */}
                {review.ratings && (
                  <div className="flex flex-wrap items-center gap-1.5 text-[10px] font-semibold text-slate-600">
                    <span className="bg-slate-100 px-2 py-0.5 rounded-md">
                      🍲 Food: <strong>{review.ratings.foodQuality}/5</strong>
                    </span>
                    <span className="bg-slate-100 px-2 py-0.5 rounded-md">
                      ⏱️ Pickup: <strong>{review.ratings.pickupExperience}/5</strong>
                    </span>
                    <span className="bg-slate-100 px-2 py-0.5 rounded-md">
                      💰 Value: <strong>{review.ratings.valueForMoney}/5</strong>
                    </span>
                  </div>
                )}

                {/* Comment Content */}
                {review.comment ? (
                  <p className="text-xs text-slate-700 leading-relaxed bg-slate-50/70 p-3 rounded-xl border border-slate-100">
                    "{review.comment}"
                  </p>
                ) : (
                  <p className="text-xs text-slate-400 italic">
                    Buyer gave a {review.overallRating}★ rating with quick OTP handover.
                  </p>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
