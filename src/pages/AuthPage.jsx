import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Users,
  Store,
  HeartHandshake,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  Lock
} from 'lucide-react';

export default function AuthPage({ onNavigate }) {
  const { currentRole, setCurrentRole, addToast } = useApp();
  const [emailInput, setEmailInput] = useState('');

  const handleRoleSelect = (role, targetPath) => {
    setCurrentRole(role);
    addToast(`Signed in instantly as ${role.toUpperCase()} persona!`, 'success');
    onNavigate(targetPath);
  };

  const handleCustomLogin = (e) => {
    e.preventDefault();
    if (!emailInput) return;
    addToast(`Demo login link generated for ${emailInput}`, 'success');
    onNavigate('/browse');
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
      
      {/* Page Header */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-600 uppercase tracking-wider bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
          <Sparkles className="w-3.5 h-3.5" />
          Multi-Persona Access
        </div>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight font-display">
          Welcome to ResQFood
        </h1>
        <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
          Pick the role you want to explore. This demo signs you in instantly — no password is ever sent anywhere.
        </p>
      </div>

      {/* 3 Role Selection Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Role 1: Buyer */}
        <div className={`bg-white rounded-3xl p-6 sm:p-8 border shadow-soft flex flex-col justify-between transition-all hover:-translate-y-1 ${
          currentRole === 'buyer' ? 'border-emerald-500 ring-2 ring-emerald-500/20' : 'border-slate-200 hover:border-emerald-200'
        }`}>
          <div>
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mb-6">
              <Users className="w-6 h-6" />
            </div>
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-extrabold text-slate-900 text-xl font-display">
                Neighbour
              </h3>
              {currentRole === 'buyer' && (
                <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                  Active
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 mb-4">
              Demo Persona: <strong>Rahul S. · Bandra West</strong>
            </p>
            <ul className="text-xs text-slate-600 space-y-2 mb-6">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>Browse discounts up to 80% off</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>Reserve with demo sandbox checkout</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>Scannable QR & 4-digit pickup pass</span>
              </li>
            </ul>
          </div>

          <button
            onClick={() => handleRoleSelect('buyer', '/browse')}
            className="w-full py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm transition-all flex items-center justify-center gap-2"
          >
            <span>Explore as Buyer</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* Role 2: Seller */}
        <div className={`bg-white rounded-3xl p-6 sm:p-8 border shadow-soft flex flex-col justify-between transition-all hover:-translate-y-1 ${
          currentRole === 'seller' ? 'border-amber-500 ring-2 ring-amber-500/20' : 'border-slate-200 hover:border-amber-200'
        }`}>
          <div>
            <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center mb-6">
              <Store className="w-6 h-6" />
            </div>
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-extrabold text-slate-900 text-xl font-display">
                Seller
              </h3>
              {currentRole === 'seller' && (
                <span className="text-[10px] font-bold bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full">
                  Active
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 mb-4">
              Demo Persona: <strong>Crust & Co. Bakery Manager</strong>
            </p>
            <ul className="text-xs text-slate-600 space-y-2 mb-6">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                <span>Post surplus batches in 30 seconds</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                <span>Verify buyer pickup OTP codes</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                <span>Track ₹12,000+ recovered revenue</span>
              </li>
            </ul>
          </div>

          <button
            onClick={() => handleRoleSelect('seller', '/seller')}
            className="w-full py-3 rounded-2xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs shadow-sm transition-all flex items-center justify-center gap-2"
          >
            <span>Enter as Seller</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* Role 3: NGO */}
        <div className={`bg-white rounded-3xl p-6 sm:p-8 border shadow-soft flex flex-col justify-between transition-all hover:-translate-y-1 ${
          currentRole === 'ngo' ? 'border-rose-500 ring-2 ring-rose-500/20' : 'border-slate-200 hover:border-rose-200'
        }`}>
          <div>
            <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-700 flex items-center justify-center mb-6">
              <HeartHandshake className="w-6 h-6" />
            </div>
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-extrabold text-slate-900 text-xl font-display">
                NGO Coordinator
              </h3>
              {currentRole === 'ngo' && (
                <span className="text-[10px] font-bold bg-rose-100 text-rose-800 px-2 py-0.5 rounded-full">
                  Active
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 mb-4">
              Demo Persona: <strong>Roti Bank Mumbai Dispatch</strong>
            </p>
            <ul className="text-xs text-slate-600 space-y-2 mb-6">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                <span>1-click bulk surplus claim</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                <span>Dispatch fleet vehicles with thermal boxes</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                <span>Log redistributed community meals</span>
              </li>
            </ul>
          </div>

          <button
            onClick={() => handleRoleSelect('ngo', '/ngo')}
            className="w-full py-3 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-sm transition-all flex items-center justify-center gap-2"
          >
            <span>Enter as NGO</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Or Sign in with Email Simulation */}
      <div className="max-w-md mx-auto bg-slate-50 p-6 rounded-3xl border border-slate-200 space-y-4 text-center">
        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
          Or Enter Custom Email Demo
        </span>

        <form onSubmit={handleCustomLogin} className="flex gap-2">
          <input
            type="email"
            placeholder="you@example.com"
            value={emailInput}
            onChange={(e) => setEmailInput(e.target.value)}
            className="flex-1 px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
          />
          <button
            type="submit"
            className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-colors"
          >
            Continue
          </button>
        </form>

        <div className="flex items-center justify-center gap-1 text-[11px] text-slate-400">
          <Lock className="w-3 h-3 text-emerald-600" />
          <span>Passwordless sandbox authentication</span>
        </div>
      </div>
    </div>
  );
}
