import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { MapPin, Sparkles, UserCheck, X } from 'lucide-react';

export default function DemoNotice({ onNavigate }) {
  const [dismissed, setDismissed] = useState(false);
  const {
    currentRole,
    setCurrentRole,
    simulatedLocation,
    setSimulatedLocation,
    mumbaiLocations
  } = useApp();

  if (dismissed) return null;

  return (
    <div className="bg-gradient-to-r from-emerald-950 via-teal-950 to-slate-950 text-white text-xs py-2 px-4 border-b border-emerald-800/40 relative z-40">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="inline-flex items-center gap-1 bg-emerald-500/20 text-emerald-300 font-semibold px-2 py-0.5 rounded border border-emerald-500/30">
            <Sparkles className="w-3 h-3 text-emerald-300" />
            SHOWCASE DEMO
          </span>
          <div className="flex items-center gap-1.5 text-slate-200">
            <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span>Simulated GPS:</span>
            <select
              value={simulatedLocation.name}
              onChange={(e) => {
                const found = mumbaiLocations?.find(loc => loc.label === e.target.value || loc.name === e.target.value);
                if (found) {
                  setSimulatedLocation({
                    name: found.label,
                    city: 'Mumbai',
                    lat: found.lat,
                    lng: found.lng
                  });
                }
              }}
              className="bg-white/10 hover:bg-white/15 text-white font-semibold rounded px-2 py-0.5 border border-white/20 text-xs focus:outline-none cursor-pointer"
            >
              {mumbaiLocations?.map(loc => (
                <option key={loc.id} value={loc.label} className="bg-slate-900 text-white">
                  {loc.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 text-[11px] bg-white/10 px-2 py-0.5 rounded border border-white/15">
            <UserCheck className="w-3 h-3 text-emerald-300" />
            <span className="text-slate-300">Active persona:</span>
            <select
              value={currentRole}
              onChange={(e) => {
                setCurrentRole(e.target.value);
                if (e.target.value === 'seller') onNavigate('/seller');
                else if (e.target.value === 'ngo') onNavigate('/ngo');
                else onNavigate('/browse');
              }}
              className="bg-transparent text-emerald-200 font-medium focus:outline-none cursor-pointer"
            >
              <option value="buyer" className="bg-slate-900 text-white">Neighbour (Buyer)</option>
              <option value="seller" className="bg-slate-900 text-white">Crust & Co. (Seller)</option>
              <option value="ngo" className="bg-slate-900 text-white">Roti Bank (NGO)</option>
            </select>
          </div>

          <button
            onClick={() => setDismissed(true)}
            className="text-slate-400 hover:text-white transition-colors"
            title="Dismiss notice"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
