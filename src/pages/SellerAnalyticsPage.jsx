import React from 'react';
import { ArrowLeft, TrendingUp, BarChart3, Leaf, DollarSign, Calendar, Sparkles, Star, ShieldCheck, MessageSquare, ThumbsUp } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function SellerAnalyticsPage({ onNavigate }) {
  const { sellerStats, feedbacks, currentUser } = useApp();

  const sellerFeedbacks = (feedbacks || []).filter(
    f => !currentUser?.id || f.sellerId === currentUser?.id || f.sellerId === 'usr-seller-demo'
  );

  const avgRating = sellerFeedbacks.length > 0
    ? Number((sellerFeedbacks.reduce((s, f) => s + (f.overallRating || 5), 0) / sellerFeedbacks.length).toFixed(1))
    : 4.9;

  const totalReviewsCount = sellerFeedbacks.length || 142;

  const weeklyData = sellerStats?.dailyAnalytics || [
    { day: 'Mon', revenue: 1450, portions: 22, wasteKg: 9 },
    { day: 'Tue', revenue: 1680, portions: 26, wasteKg: 11 },
    { day: 'Wed', revenue: 1390, portions: 21, wasteKg: 8.5 },
    { day: 'Thu', revenue: 1850, portions: 28, wasteKg: 12 },
    { day: 'Fri', revenue: 2100, portions: 32, wasteKg: 13.5 },
    { day: 'Sat', revenue: 2350, portions: 36, wasteKg: 15 },
    { day: 'Sun', revenue: 1240, portions: 19, wasteKg: 7 },
  ];

  const maxRevenue = Math.max(...weeklyData.map(d => d.revenue), 1);
  const avgDaily = Math.round(weeklyData.reduce((sum, d) => sum + d.revenue, 0) / (weeklyData.length || 1));

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Back button */}
      <div>
        <button
          onClick={() => onNavigate('/seller')}
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-600 hover:text-emerald-700 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to seller dashboard</span>
        </button>
      </div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-emerald-600 uppercase tracking-wider mb-1">
            <BarChart3 className="w-4 h-4" />
            Performance & Impact Logs
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight font-display">
            Seller Analytics
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Crust & Co. Bakery · City Center Outlet, Gwalior (Last 7 Days)
          </p>
        </div>

        <div className="flex items-center gap-2 bg-emerald-50 text-emerald-900 px-3.5 py-1.5 rounded-xl border border-emerald-200 text-xs font-semibold">
          <Calendar className="w-3.5 h-3.5 text-emerald-600" />
          <span>Current Week (Simulated)</span>
        </div>
      </div>

      {/* 4 Summary Cards (including Food Provider Average Rating & Number of Reviews) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-soft space-y-2">
          <span className="text-xs text-slate-500 font-medium">Total Recovered</span>
          <div className="text-2xl sm:text-3xl font-black text-slate-900 font-display">
            ₹{sellerStats.revenueRecovered7d.toLocaleString()}
          </div>
          <div className="text-xs text-emerald-600 font-bold flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>+18% versus last week</span>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-soft space-y-2">
          <span className="text-xs text-slate-500 font-medium">Portions Rescued</span>
          <div className="text-2xl sm:text-3xl font-black text-slate-900 font-display">
            {sellerStats.portionsRescued7d}
          </div>
          <div className="text-xs text-slate-500">
            92% sell-through efficiency
          </div>
        </div>

        <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-soft space-y-2">
          <span className="text-xs text-slate-500 font-medium">CO₂e Diverted</span>
          <div className="text-2xl sm:text-3xl font-black text-emerald-700 font-display">
            {sellerStats.co2eAvoidedKg} kg
          </div>
          <div className="text-xs text-slate-500">
            ~380 km car emissions saved
          </div>
        </div>

        {/* Customer Rating & Reviews Card */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-soft space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500 font-medium">Customer Rating</span>
            <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
              Verified
            </span>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-amber-600 font-display flex items-center gap-1.5">
            <span>{avgRating.toFixed(1)}</span>
            <Star className="w-6 h-6 fill-amber-400 text-amber-400" />
          </div>
          <div className="text-xs text-slate-600 font-semibold flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>{totalReviewsCount} customer reviews</span>
          </div>
        </div>
      </div>

      {/* Weekly Revenue Bar Chart (Custom CSS Visualizer) */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-soft space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-slate-900 font-display">
              Daily Revenue Recovery (₹)
            </h3>
            <p className="text-xs text-slate-500">
              Recovered sales by day from surplus food listings
            </p>
          </div>
          <span className="text-xs font-bold text-slate-700 bg-slate-100 px-3 py-1 rounded-full">
            Average: ₹{avgDaily.toLocaleString()} / day
          </span>
        </div>

        <div className="h-64 flex items-end justify-between gap-2 sm:gap-6 pt-8 pb-4 border-b border-slate-100">
          {weeklyData.map((data) => {
            const heightPercent = (data.revenue / maxRevenue) * 100;
            return (
              <div key={data.day} className="flex-1 flex flex-col items-center gap-2 group">
                <span className="text-[11px] font-bold text-slate-700 opacity-0 group-hover:opacity-100 transition-opacity">
                  ₹{data.revenue}
                </span>
                <div className="w-full bg-slate-100 rounded-2xl h-48 flex items-end overflow-hidden p-1">
                  <div
                    className="w-full bg-gradient-to-t from-emerald-600 to-teal-400 rounded-xl transition-all duration-500 group-hover:from-emerald-500 group-hover:to-teal-300"
                    style={{ height: `${heightPercent}%` }}
                  />
                </div>
                <span className="text-xs font-bold text-slate-600 group-hover:text-emerald-700 transition-colors">
                  {data.day}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Waste Diversion & Category Insights */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-soft space-y-4">
          <h3 className="text-base font-bold text-slate-900 font-display">
            Top Performing Surplus Categories
          </h3>
          <div className="space-y-3">
            {[
              { name: 'Sourdough & Artisanal Breads', share: 44, amount: '₹5,300' },
              { name: 'Croissants & Breakfast Pastries', share: 32, amount: '₹3,860' },
              { name: 'Sandwiches & Savoury Brioches', share: 16, amount: '₹1,930' },
              { name: 'Dessert Danishes & Tarts', share: 8, amount: '₹970' }
            ].map((cat) => (
              <div key={cat.name} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-800">{cat.name}</span>
                  <span className="font-bold text-slate-900">{cat.amount} ({cat.share}%)</span>
                </div>
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-500 rounded-full"
                    style={{ width: `${cat.share}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-soft space-y-4">
          <h3 className="text-base font-bold text-slate-900 font-display">
            Community Goodwill & ESG Impact
          </h3>
          <div className="space-y-3 text-xs text-slate-600 leading-relaxed">
            <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100 flex items-start gap-3">
              <Leaf className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-slate-900">Zero Landfill Milestone</span>
                <p className="mt-0.5 text-slate-600">Your City Center outlet has maintained a 92% diversion rate for 4 consecutive weeks.</p>
              </div>
            </div>

            <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100 flex items-start gap-3">
              <Sparkles className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-slate-900">NGO Contribution Recognition</span>
                <p className="mt-0.5 text-slate-600">6 bulk batches were seamlessly claimed by Gwalior Roti Bank & Relief Trust and Apna Ghar Seva Sansthan.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Verified Customer Feedback Stream for Provider */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-soft space-y-4 text-left">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-lg font-bold text-slate-900 font-display flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-emerald-600" />
              <span>Customer Feedback & Verified Ratings ({sellerFeedbacks.length})</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Live feedback from completed orders and counter pickups
            </p>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 font-bold text-xs">
            <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
            <span>{avgRating.toFixed(1)} Provider Average</span>
          </div>
        </div>

        {sellerFeedbacks.length === 0 ? (
          <div className="p-6 text-center text-xs text-slate-400">
            No feedback entries yet. Ratings will appear here once customers complete pickups.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {sellerFeedbacks.slice(0, 6).map((fb) => (
              <div
                key={fb.id}
                className="p-4 rounded-2xl bg-slate-50/70 border border-slate-200/80 space-y-2 text-xs"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xs">
                      {fb.userAvatar || (fb.userName ? fb.userName.slice(0, 2).toUpperCase() : 'VR')}
                    </div>
                    <div>
                      <span className="font-extrabold text-slate-900 block">{fb.userName}</span>
                      <span className="text-[11px] text-slate-400 block">
                        {fb.foodTitle || 'Surplus Meal'} · {new Date(fb.createdAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-amber-100/70 text-amber-900 font-bold text-xs">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    <span>{fb.overallRating?.toFixed(1) || '5.0'}</span>
                  </div>
                </div>

                {fb.ratings && (
                  <div className="flex items-center gap-2 text-[10px] text-slate-500">
                    <span>Food: <strong>{fb.ratings.foodQuality}/5</strong></span>
                    <span>·</span>
                    <span>Pickup: <strong>{fb.ratings.pickupExperience}/5</strong></span>
                    <span>·</span>
                    <span>Value: <strong>{fb.ratings.valueForMoney}/5</strong></span>
                  </div>
                )}

                {fb.comment && (
                  <p className="text-slate-700 italic bg-white p-2.5 rounded-xl border border-slate-100">
                    "{fb.comment}"
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
