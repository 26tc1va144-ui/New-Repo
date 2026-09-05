import React from 'react';
import { ArrowLeft, TrendingUp, BarChart3, Leaf, DollarSign, Calendar, Sparkles } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function SellerAnalyticsPage({ onNavigate }) {
  const { sellerStats } = useApp();

  const weeklyData = [
    { day: 'Mon', revenue: 1450, portions: 22, wasteKg: 9 },
    { day: 'Tue', revenue: 1680, portions: 26, wasteKg: 11 },
    { day: 'Wed', revenue: 1390, portions: 21, wasteKg: 8.5 },
    { day: 'Thu', revenue: 1850, portions: 28, wasteKg: 12 },
    { day: 'Fri', revenue: 2100, portions: 32, wasteKg: 13.5 },
    { day: 'Sat', revenue: 2350, portions: 36, wasteKg: 15 },
    { day: 'Sun', revenue: 1240, portions: 19, wasteKg: 7 },
  ];

  const maxRevenue = Math.max(...weeklyData.map(d => d.revenue));

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
            Crust & Co. Bakery · Bandra West Outlet (Last 7 Days)
          </p>
        </div>

        <div className="flex items-center gap-2 bg-emerald-50 text-emerald-900 px-3.5 py-1.5 rounded-xl border border-emerald-200 text-xs font-semibold">
          <Calendar className="w-3.5 h-3.5 text-emerald-600" />
          <span>Current Week (Simulated)</span>
        </div>
      </div>

      {/* 3 Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-soft space-y-2">
          <span className="text-xs text-slate-500 font-medium">Total Recovered</span>
          <div className="text-3xl font-black text-slate-900 font-display">
            ₹{sellerStats.revenueRecovered7d.toLocaleString()}
          </div>
          <div className="text-xs text-emerald-600 font-bold flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>+18% versus previous week</span>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-soft space-y-2">
          <span className="text-xs text-slate-500 font-medium">Portions Sold</span>
          <div className="text-3xl font-black text-slate-900 font-display">
            {sellerStats.portionsRescued7d}
          </div>
          <div className="text-xs text-slate-500">
            92% sell-through efficiency
          </div>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-soft space-y-2">
          <span className="text-xs text-slate-500 font-medium">CO₂e Offset</span>
          <div className="text-3xl font-black text-emerald-700 font-display">
            {sellerStats.co2eAvoidedKg} kg
          </div>
          <div className="text-xs text-slate-500">
            Equivalent to 380 km car travel prevented
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
            Average: ₹1,722 / day
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
                <p className="mt-0.5 text-slate-600">Your Bandra West outlet has maintained a 92% diversion rate for 4 consecutive weeks.</p>
              </div>
            </div>

            <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100 flex items-start gap-3">
              <Sparkles className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-slate-900">NGO Contribution Recognition</span>
                <p className="mt-0.5 text-slate-600">6 bulk batches were seamlessly claimed by Roti Bank Mumbai and Anna Seva Foundation.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
