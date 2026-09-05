import React from 'react';
import { UtensilsCrossed, ShieldCheck, Heart, ExternalLink } from 'lucide-react';

export default function Footer({ onNavigate }) {
  return (
    <footer className="bg-slate-900 text-slate-300 border-t border-slate-800 pt-16 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 pb-12 border-b border-slate-800">
          
          {/* Brand Info */}
          <div className="md:col-span-1 space-y-4">
            <div
              onClick={() => onNavigate('/')}
              className="flex items-center gap-2 cursor-pointer group select-none"
            >
              <div className="w-9 h-9 rounded-xl bg-emerald-500 flex items-center justify-center text-slate-950 font-bold">
                <UtensilsCrossed className="w-5 h-5 text-slate-900" />
              </div>
              <span className="font-extrabold text-xl text-white font-display">
                ResQ<span className="text-emerald-400">Food</span>
              </span>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed">
              Rescue surplus food. Feed your neighbourhood. ResQFood turns end-of-day surplus into affordable meals for neighbours and free meals for NGOs.
            </p>
            <div className="flex items-center gap-2 text-xs text-emerald-400 font-medium">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>FSSAI Partner Guidelines Aligned</span>
            </div>
          </div>

          {/* Product Links */}
          <div>
            <h4 className="text-white text-sm font-semibold tracking-wider uppercase mb-4 font-display">
              Product
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <button
                  onClick={() => onNavigate('/browse')}
                  className="hover:text-emerald-400 transition-colors"
                >
                  Discover food
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('/map')}
                  className="hover:text-emerald-400 transition-colors"
                >
                  Nearby map
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('/impact')}
                  className="hover:text-emerald-400 transition-colors"
                >
                  Impact tracker
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('/notifications')}
                  className="hover:text-emerald-400 transition-colors"
                >
                  Notifications center
                </button>
              </li>
            </ul>
          </div>

          {/* Partners Links */}
          <div>
            <h4 className="text-white text-sm font-semibold tracking-wider uppercase mb-4 font-display">
              Partners
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <button
                  onClick={() => onNavigate('/seller')}
                  className="hover:text-emerald-400 transition-colors"
                >
                  Sell surplus (Seller Portal)
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('/seller/analytics')}
                  className="hover:text-emerald-400 transition-colors"
                >
                  Seller Analytics
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('/ngo')}
                  className="hover:text-emerald-400 transition-colors"
                >
                  NGO coordination
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('/safety')}
                  className="hover:text-emerald-400 transition-colors"
                >
                  Food safety standards
                </button>
              </li>
            </ul>
          </div>

          {/* Demo Notice & Disclaimer */}
          <div className="space-y-3">
            <h4 className="text-white text-sm font-semibold tracking-wider uppercase mb-4 font-display">
              Demo Notice
            </h4>
            <div className="bg-slate-800/80 rounded-xl p-3.5 border border-slate-700/60 text-xs text-slate-400 space-y-2">
              <p>
                This MVP uses simulated location (Bandra West, Mumbai), demo payment sandbox and sample data for showcase purposes.
              </p>
              <div className="text-[11px] text-emerald-400/90 font-mono">
                Environment: Production Sandbox
              </div>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© {new Date().getFullYear()} ResQFood Hub Inc. All rights reserved. Zero food waste initiative.</p>
          <div className="flex items-center gap-4">
            <button onClick={() => onNavigate('/safety')} className="hover:text-slate-300">Privacy & Terms</button>
            <button onClick={() => onNavigate('/safety')} className="hover:text-slate-300">FSSAI Compliance</button>
            <span className="flex items-center gap-1 text-slate-400">
              Built with <Heart className="w-3 h-3 text-rose-500 fill-rose-500" /> for community impact
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
