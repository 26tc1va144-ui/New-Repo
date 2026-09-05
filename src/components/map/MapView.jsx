import React, { useState } from 'react';
import {
  MapPin,
  Clock,
  ShieldCheck,
  ArrowRight,
  Filter,
  Layers,
  LocateFixed,
  Search,
  X,
  Compass
} from 'lucide-react';

export default function MapView({ rescues, onSelectRescue, selectedId = null }) {
  const [activePinId, setActivePinId] = useState(selectedId || 'rq-101');
  const [selectedRadius, setSelectedRadius] = useState(5); // km
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [mapCenter, setMapCenter] = useState({ name: 'Bandra West, Mumbai', lat: 19.0596, lng: 72.8350 });

  // Filter rescues within current radius and category
  const filteredRescues = rescues.filter((rescue) => {
    const matchesRadius = rescue.distance <= selectedRadius;
    const matchesCategory = categoryFilter === 'All' || rescue.category.toLowerCase().includes(categoryFilter.toLowerCase());
    return matchesRadius && matchesCategory;
  });

  const activeRescue = rescues.find((r) => r.id === activePinId) || rescues[0];

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'Bakery': return '🥐';
      case 'Restaurant': return '🍛';
      case 'Groceries': return '🥕';
      case 'Catering': return '🍲';
      case 'Cafe': return '🥪';
      default: return '🥗';
    }
  };

  // Convert simulated relative coordinates to map viewport percentages (offset from center)
  const getPinPosition = (rescue) => {
    // Base center: Bandra West (19.0596, 72.8350)
    const baseLat = 19.0596;
    const baseLng = 72.8350;
    const latDiff = (rescue.coordinates?.lat || baseLat) - baseLat;
    const lngDiff = (rescue.coordinates?.lng || baseLng) - baseLng;

    // Map into 10% to 90% space
    const top = 50 - (latDiff * 500);
    const left = 50 + (lngDiff * 600);

    return {
      top: `${Math.max(12, Math.min(85, top))}%`,
      left: `${Math.max(12, Math.min(88, left))}%`
    };
  };

  return (
    <div className="relative w-full h-[640px] rounded-3xl overflow-hidden border border-slate-200 shadow-card bg-slate-900 select-none">
      
      {/* Map Graphic Canvas / Background with stylized roads & terrain */}
      <div className="absolute inset-0 bg-[#0f172a] overflow-hidden">
        {/* SVG Geo Grid & Road Network Simulation */}
        <svg className="w-full h-full opacity-40" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#334155" strokeWidth="0.8" />
            </pattern>
            <radialGradient id="radarGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#10b981" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
            </radialGradient>
          </defs>
          
          <rect width="100%" height="100%" fill="url(#grid)" />

          {/* Mumbai Coastal Shoreline curves */}
          <path
            d="M 50,0 Q 120,250 80,450 T 150,650"
            fill="none"
            stroke="#0ea5e9"
            strokeWidth="8"
            strokeOpacity="0.3"
          />
          <path
            d="M 50,0 Q 120,250 80,450 T 150,650"
            fill="none"
            stroke="#38bdf8"
            strokeWidth="2"
            strokeOpacity="0.6"
          />

          {/* Simulated Major Arterial Roads (Western Express Highway, Linking Rd, SV Rd) */}
          <path d="M 0,220 C 300,200 600,280 1200,240" fill="none" stroke="#475569" strokeWidth="6" />
          <path d="M 0,400 C 400,380 700,430 1200,390" fill="none" stroke="#475569" strokeWidth="5" />
          <path d="M 380,0 C 400,300 370,500 420,650" fill="none" stroke="#64748b" strokeWidth="4" />
          <path d="M 680,0 C 660,250 710,480 690,650" fill="none" stroke="#475569" strokeWidth="4" />

          {/* Radar scan pulse radius ring */}
          <circle cx="50%" cy="50%" r="180" fill="url(#radarGlow)" />
          <circle cx="50%" cy="50%" r="180" fill="none" stroke="#10b981" strokeWidth="1" strokeDasharray="6 6" className="animate-spin-slow origin-center opacity-40" />
          <circle cx="50%" cy="50%" r="90" fill="none" stroke="#10b981" strokeWidth="1" strokeOpacity="0.3" />
        </svg>

        {/* User Simulated Location Marker (Center) */}
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center pointer-events-none z-20"
        >
          <div className="relative flex items-center justify-center">
            <div className="w-12 h-12 rounded-full bg-emerald-500/20 animate-ping absolute" />
            <div className="w-8 h-8 rounded-full bg-emerald-500/40 flex items-center justify-center">
              <div className="w-4 h-4 rounded-full bg-emerald-400 border-2 border-white shadow-lg" />
            </div>
          </div>
          <span className="mt-1 px-2.5 py-0.5 rounded-full bg-slate-900/90 border border-emerald-500/40 text-[10px] font-bold text-emerald-300 shadow-md">
            You: Bandra West
          </span>
        </div>

        {/* Dynamic Rescue Pins */}
        {filteredRescues.map((rescue) => {
          const isSelected = rescue.id === activePinId;
          const pos = getPinPosition(rescue);
          const icon = getCategoryIcon(rescue.category);

          return (
            <div
              key={rescue.id}
              onClick={() => setActivePinId(rescue.id)}
              style={{ top: pos.top, left: pos.left }}
              className={`absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer z-20 group transition-all duration-300 ${
                isSelected ? 'scale-125 z-30' : 'hover:scale-110'
              }`}
            >
              <div className="relative flex flex-col items-center">
                {/* Pin Head */}
                <div
                  className={`w-10 h-10 rounded-2xl flex items-center justify-center shadow-lg transition-transform ${
                    isSelected
                      ? 'bg-emerald-500 text-white ring-4 ring-emerald-300/40 scale-110'
                      : rescue.isExpiringSoon
                      ? 'bg-amber-500 text-slate-950'
                      : 'bg-white text-slate-900 hover:bg-emerald-50'
                  }`}
                >
                  <span className="text-base select-none">{icon}</span>
                  {rescue.isExpiringSoon && (
                    <span className="absolute -top-1 -right-1 w-3 h-3 bg-rose-500 rounded-full ring-2 ring-slate-900 animate-pulse" />
                  )}
                </div>

                {/* Price Tag Pill */}
                <div
                  className={`mt-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold whitespace-nowrap shadow-md transition-colors ${
                    isSelected
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-900/90 text-white border border-slate-700'
                  }`}
                >
                  {rescue.rescuePrice === 0 ? 'FREE' : `₹${rescue.rescuePrice}`}
                </div>

                {/* Pin Tip Arrow */}
                <div
                  className={`w-0 h-0 border-x-4 border-x-transparent border-t-4 ${
                    isSelected ? 'border-t-emerald-600' : 'border-t-slate-900'
                  }`}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Map Top Bar Controls */}
      <div className="absolute top-4 left-4 right-4 z-30 flex flex-wrap items-center justify-between gap-3 pointer-events-none">
        
        {/* Radius Filter Pills */}
        <div className="pointer-events-auto flex items-center gap-1.5 bg-slate-900/90 backdrop-blur-md p-1.5 rounded-2xl border border-slate-700/80 shadow-lg text-xs">
          <span className="text-slate-400 font-medium px-2 flex items-center gap-1">
            <Compass className="w-3.5 h-3.5 text-emerald-400" />
            Radius:
          </span>
          {[2, 5, 10].map((radius) => (
            <button
              key={radius}
              onClick={() => setSelectedRadius(radius)}
              className={`px-2.5 py-1 rounded-xl font-semibold transition-all ${
                selectedRadius === radius
                  ? 'bg-emerald-500 text-slate-950 shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              {radius} km
            </button>
          ))}
        </div>

        {/* Category Filter Chips */}
        <div className="pointer-events-auto flex items-center gap-1.5 bg-slate-900/90 backdrop-blur-md p-1.5 rounded-2xl border border-slate-700/80 shadow-lg text-xs overflow-x-auto">
          {['All', 'Bakery', 'Restaurant', 'Groceries', 'Catering', 'Cafe'].map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-2.5 py-1 rounded-xl font-medium whitespace-nowrap transition-all ${
                categoryFilter === cat
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-semibold'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Slide-Up Pin Detail Card (Bottom Overlay) */}
      {activeRescue && (
        <div className="absolute bottom-4 left-4 right-4 sm:left-auto sm:right-4 sm:w-96 z-30 bg-white/95 backdrop-blur-md rounded-2xl p-4 shadow-card border border-slate-200 animate-slide-up">
          <div className="flex items-start justify-between gap-2 mb-2">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                  {activeRescue.distance} km away
                </span>
                <span className="text-xs text-slate-500">{activeRescue.seller}</span>
              </div>
              <h4 className="font-bold text-slate-900 text-sm mt-1 line-clamp-1">
                {activeRescue.title}
              </h4>
            </div>
            <button
              onClick={() => setActivePinId(null)}
              className="text-slate-400 hover:text-slate-600 p-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <p className="text-xs text-slate-600 line-clamp-2 mb-3">
            {activeRescue.description}
          </p>

          <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-100">
            <div>
              <div className="text-base font-extrabold text-slate-900">
                {activeRescue.rescuePrice === 0 ? 'FREE' : `₹${activeRescue.rescuePrice}`}
                {activeRescue.originalPrice > 0 && (
                  <span className="text-xs text-slate-400 font-normal line-through ml-1.5">
                    ₹{activeRescue.originalPrice}
                  </span>
                )}
              </div>
              <div className="text-[10px] text-slate-500 flex items-center gap-1">
                <Clock className="w-3 h-3 text-emerald-600" />
                <span>Pickup: {activeRescue.pickupWindow.split(' ')[0]}</span>
              </div>
            </div>

            <button
              onClick={() => onSelectRescue(activeRescue.id)}
              className="inline-flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs px-3.5 py-2 rounded-xl shadow-sm transition-all"
            >
              <span>View details</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
