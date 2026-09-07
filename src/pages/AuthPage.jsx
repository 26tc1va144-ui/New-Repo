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
  Lock,
  Mail,
  Eye,
  EyeOff,
  User,
  MapPin,
  UtensilsCrossed,
  AlertCircle
} from 'lucide-react';

export default function AuthPage({ onNavigate, requiredNotice = false }) {
  const { currentRole, login, addToast } = useApp();
  
  // Auth Form mode: 'signin' | 'signup'
  const [authMode, setAuthMode] = useState('signin');
  
  // Form fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [selectedRole, setSelectedRole] = useState('buyer');
  const [selectedLocation, setSelectedLocation] = useState('City Center, Gwalior');
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Quick 1-click demo personas
  const DEMO_PERSONAS = [
    {
      role: 'buyer',
      name: 'Rahul S.',
      email: 'rahul.s@resqfood.org',
      roleLabel: 'Neighbour / Buyer',
      title: 'Neighbour',
      location: 'City Center, Gwalior',
      description: 'Explore live surplus listings up to 80% off, reserve boxes, and receive scannable QR pickup passes.',
      icon: Users,
      color: 'emerald',
      bgClass: 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:border-emerald-400',
      btnClass: 'bg-emerald-600 hover:bg-emerald-700 text-white',
      badgeClass: 'bg-emerald-100 text-emerald-800',
      targetPath: '/browse',
    },
    {
      role: 'seller',
      name: 'Crust & Co. Bakery',
      email: 'manager@crustandco.com',
      roleLabel: 'Seller (Bakery & Café)',
      title: 'Food Business',
      location: 'City Center, Gwalior',
      description: 'Post freshly baked surplus batches before closing, verify buyer OTP codes, and recover revenue.',
      icon: Store,
      color: 'amber',
      bgClass: 'bg-amber-50 text-amber-800 border-amber-200 hover:border-amber-400',
      btnClass: 'bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold',
      badgeClass: 'bg-amber-100 text-amber-900',
      targetPath: '/seller',
    },
    {
      role: 'ngo',
      name: 'Gwalior Roti Bank & Relief Trust',
      email: 'dispatch@rotibank.org',
      roleLabel: 'NGO Relief Coordinator',
      title: 'NGO Partner',
      location: 'Maharaj Bada, Lashkar, Gwalior',
      description: 'Claim unclaimed surplus approaching cut-off, dispatch temperature-controlled vans, and log meals.',
      icon: HeartHandshake,
      color: 'rose',
      bgClass: 'bg-rose-50 text-rose-800 border-rose-200 hover:border-rose-400',
      btnClass: 'bg-slate-900 hover:bg-slate-800 text-white',
      badgeClass: 'bg-rose-100 text-rose-900',
      targetPath: '/ngo',
    }
  ];

  // Handle Form Submission (Sign In or Sign Up)
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email || !email.includes('@')) {
      setError('Please enter a valid email address');
      return;
    }
    if (!password || password.length < 4) {
      setError('Password must be at least 4 characters');
      return;
    }
    if (authMode === 'signup' && !name.trim()) {
      setError('Please enter your full name or organization name');
      return;
    }

    setLoading(true);

    try {
      await login({
        name: authMode === 'signup' ? name.trim() : (email.split('@')[0].replace('.', ' ').toUpperCase() || 'ResQ Member'),
        email: email.trim(),
        role: selectedRole,
        location: selectedLocation
      });

      setLoading(false);

      // Redirect user to their corresponding role page
      if (selectedRole === 'seller') {
        onNavigate('/seller');
      } else if (selectedRole === 'ngo') {
        onNavigate('/ngo');
      } else {
        onNavigate('/browse');
      }
    } catch (err) {
      setLoading(false);
      setError(err.message || 'Login failed. Please try again.');
    }
  };

  // Instant 1-click persona demo login
  const handleQuickLogin = async (persona) => {
    try {
      await login({
        id: `usr-${persona.role}-demo`,
        name: persona.name,
        email: persona.email,
        role: persona.role,
        location: persona.location,
      });
      onNavigate(persona.targetPath);
    } catch (err) {
      onNavigate(persona.targetPath);
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-8 animate-fade-in">
      
      {/* Top Banner Notice: Compulsory Sign In */}
      <div className="bg-emerald-50 border border-emerald-200/80 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-emerald-500/20">
            <Lock className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm sm:text-base font-bold text-slate-900">
                Compulsory Authentication Required
              </h2>
              <span className="text-[10px] font-extrabold uppercase bg-emerald-600 text-white px-2 py-0.5 rounded-full">
                Security Enforced
              </span>
            </div>
            <p className="text-xs text-slate-600">
              Sign in is mandatory to browse surplus listings, claim meals, reserve bags, or manage partner inventory.
            </p>
          </div>
        </div>
        <span className="text-xs text-emerald-800 font-semibold bg-white px-3 py-1.5 rounded-xl border border-emerald-200 self-stretch sm:self-auto text-center">
          ⚡ Instant Demo Sign-In Available
        </span>
      </div>

      {/* Main Grid: Form on Left/Top, 1-Click Personas on Right/Bottom */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Sign In / Sign Up Card (7 cols) */}
        <div className="lg:col-span-6 bg-white rounded-3xl border border-slate-200/80 shadow-soft p-6 sm:p-8 space-y-6">
          
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-sm">
                <UtensilsCrossed className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-extrabold text-lg text-slate-900 font-display leading-tight">
                  {authMode === 'signin' ? 'Sign In to ResQFood' : 'Create an Account'}
                </h3>
                <p className="text-xs text-slate-500">
                  {authMode === 'signin' ? 'Enter your credentials to enter' : 'Join the surplus food rescue revolution'}
                </p>
              </div>
            </div>

            {/* Tab switch */}
            <div className="flex p-1 bg-slate-100 rounded-xl text-xs font-semibold text-slate-600">
              <button
                type="button"
                onClick={() => { setAuthMode('signin'); setError(''); }}
                className={`px-3 py-1.5 rounded-lg transition-all ${authMode === 'signin' ? 'bg-white text-slate-900 shadow-xs' : 'hover:text-slate-900'}`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => { setAuthMode('signup'); setError(''); }}
                className={`px-3 py-1.5 rounded-lg transition-all ${authMode === 'signup' ? 'bg-white text-slate-900 shadow-xs' : 'hover:text-slate-900'}`}
              >
                Register
              </button>
            </div>
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Full Name (Sign Up only) */}
            {authMode === 'signup' && (
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Full Name / Organization Name *
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. Aarav Mehta or Green Leaf Bakery"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all outline-none"
                  />
                </div>
              </div>
            )}

            {/* Email Address */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Email Address *
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all outline-none"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Password *
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Role Selection */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Select Your Role *
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'buyer', label: 'Neighbour', icon: Users, hint: 'Buyer' },
                  { id: 'seller', label: 'Food Store', icon: Store, hint: 'Seller' },
                  { id: 'ngo', label: 'NGO Relief', icon: HeartHandshake, hint: 'Relief' }
                ].map((item) => {
                  const Icon = item.icon;
                  const isSelected = selectedRole === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setSelectedRole(item.id)}
                      className={`p-2.5 rounded-xl border text-center transition-all flex flex-col items-center gap-1 ${
                        isSelected
                          ? 'border-emerald-600 bg-emerald-50/80 text-emerald-900 font-bold ring-2 ring-emerald-500/20'
                          : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                      }`}
                    >
                      <Icon className={`w-4 h-4 ${isSelected ? 'text-emerald-600' : 'text-slate-400'}`} />
                      <span className="text-xs leading-none">{item.label}</span>
                      <span className="text-[10px] text-slate-400 font-normal">{item.hint}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Remember me & simulated credentials */}
            <div className="flex items-center justify-between text-xs pt-1">
              <label className="flex items-center gap-2 cursor-pointer select-none text-slate-600">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded text-emerald-600 focus:ring-emerald-500 border-slate-300"
                />
                <span>Remember session</span>
              </label>
              <span className="text-slate-400 text-[11px]">
                Demo sandbox auth enabled
              </span>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md shadow-emerald-600/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-75"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>{authMode === 'signin' ? 'Sign In & Enter App' : 'Create Free Account & Enter'}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick Pre-fill Tip */}
          <div className="pt-2 text-center text-xs text-slate-500">
            <span>Don't want to type? Use the <strong>1-Click Instant Demo Login</strong> cards on the right.</span>
          </div>
        </div>

        {/* Right Column: 1-Click Fast Persona Access Cards (6 cols) */}
        <div className="lg:col-span-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-600" />
              <h3 className="font-extrabold text-base text-slate-900 font-display">
                1-Click Instant Persona Sign-In
              </h3>
            </div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Evaluator / Hackathon Mode
            </span>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            Click any role below to bypass manual entry and sign in directly as that verified persona with live simulated permissions:
          </p>

          <div className="space-y-3">
            {DEMO_PERSONAS.map((persona) => {
              const Icon = persona.icon;
              return (
                <div
                  key={persona.role}
                  className={`bg-white rounded-2xl p-4 sm:p-5 border transition-all duration-200 hover:shadow-card hover:-translate-y-0.5 border-slate-200`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${persona.bgClass}`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="font-bold text-sm text-slate-900">
                            {persona.name}
                          </h4>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${persona.badgeClass}`}>
                            {persona.roleLabel}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 line-clamp-2">
                          {persona.description}
                        </p>
                        <div className="flex items-center gap-1.5 text-[11px] text-slate-400 pt-0.5">
                          <MapPin className="w-3 h-3 text-emerald-600" />
                          <span>{persona.location}</span>
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleQuickLogin(persona)}
                      className={`shrink-0 px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm ${persona.btnClass}`}
                    >
                      <span>Sign In</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Security Assurances */}
          <div className="pt-2 grid grid-cols-3 gap-2 text-center">
            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
              <ShieldCheck className="w-4 h-4 text-emerald-600 mx-auto mb-1" />
              <div className="text-[11px] font-bold text-slate-800">FSSAI Certified</div>
              <div className="text-[9px] text-slate-400">Verified partners</div>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
              <Lock className="w-4 h-4 text-emerald-600 mx-auto mb-1" />
              <div className="text-[11px] font-bold text-slate-800">256-Bit SSL</div>
              <div className="text-[9px] text-slate-400">Encrypted token</div>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 mx-auto mb-1" />
              <div className="text-[11px] font-bold text-slate-800">OTP Handover</div>
              <div className="text-[9px] text-slate-400">Zero fraud loss</div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

