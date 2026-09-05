import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import MapView from '../components/map/MapView';
import { MapPin, Navigation, Clock, ShieldCheck, ArrowRight, Sparkles } from 'lucide-react';

export default function MapPage({ onNavigate, onSelectRescue }) {
  const { rescues, simulatedLocation } = useApp();
  const [selectedMapId, setSelectedMapId] = useState(rescues[0]?.id || 'rq-101');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-4 border-b border-slate-200/80">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-emerald-600 uppercase tracking-wider mb-1">
            <Navigation className="w-3.5 h-3.5" />
            Live Geo-Radar
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight font-display">
            Rescue map
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Location matching uses a simulated GPS fix at <strong className="text-slate-800">{simulatedLocation.name}</strong>. Tap a pin to preview a rescue.
          </p>
        </div>

        <button
          onClick={() => onNavigate('/browse')}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 text-sm font-semibold border border-slate-200 shadow-soft transition-all"
        >
          <span>Grid view</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* Main Map Component with Radar Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Cols: Interactive Map Canvas */}
        <div className="lg:col-span-2">
          <MapView
            rescues={rescues}
            selectedId={selectedMapId}
            onSelectRescue={onSelectRescue}
          />
        </div>

        {/* Right Col: Nearby List Sidebar */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-soft flex flex-col h-[640px]">
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100">
            <h3 className="font-bold text-slate-900 text-sm font-display flex items-center gap-2">
              <MapPin className="w-4 h-4 text-emerald-600" />
              <span>Rescues in Radar ({rescues.length})</span>
            </h3>
            <span className="text-[11px] text-slate-500 font-medium">Bandra Radius</span>
          </div>

          <div className="flex-1 overflow-y-auto space-y-3 pr-1">
            {rescues.map((rescue) => {
              const isSelected = rescue.id === selectedMapId;
              return (
                <div
                  key={rescue.id}
                  onClick={() => setSelectedMapId(rescue.id)}
                  className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-emerald-50/90 border-emerald-300 ring-2 ring-emerald-500/20 shadow-sm'
                      : 'bg-white border-slate-200/80 hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-0.5 flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 text-xs text-slate-500">
                        <span className="font-semibold text-slate-700 truncate">{rescue.seller}</span>
                        <span>·</span>
                        <span className="text-emerald-700 font-bold shrink-0">{rescue.distance} km</span>
                      </div>
                      <h4 className="font-bold text-slate-900 text-xs leading-tight truncate">
                        {rescue.title}
                      </h4>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-xs font-black text-slate-900">
                        {rescue.rescuePrice === 0 ? 'FREE' : `₹${rescue.rescuePrice}`}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100/80 text-[11px] text-slate-500">
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-slate-400" />
                      <span>{rescue.pickupWindow.split(' ')[0]}</span>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectRescue(rescue.id);
                      }}
                      className="text-emerald-600 hover:text-emerald-700 font-bold text-xs flex items-center gap-0.5"
                    >
                      <span>Details</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="pt-3 mt-3 border-t border-slate-100 text-center">
            <button
              onClick={() => onNavigate('/browse')}
              className="w-full py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200/80 text-slate-700 font-semibold text-xs transition-colors"
            >
              Browse all items with allergen filters
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
