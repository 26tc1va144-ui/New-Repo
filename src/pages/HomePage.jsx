import React from 'react';
import { useApp } from '../context/AppContext';
import FoodCard from '../components/food/FoodCard';
import {
  Sparkles,
  MapPin,
  Clock,
  QrCode,
  HeartHandshake,
  Store,
  Users,
  ShieldCheck,
  ArrowRight,
  TrendingDown,
  CheckCircle2,
  ChevronRight
} from 'lucide-react';

export default function HomePage({ onNavigate, onSelectRescue }) {
  const { rescues, dynamicRescues, simulatedLocation } = useApp();

  // Featured rescues closest to user
  const activeRescues = (dynamicRescues && dynamicRescues.length > 0) ? dynamicRescues : rescues;
  const featuredRescues = activeRescues.slice(0, 3);
  const distances = activeRescues
    .map(r => r.distance)
    .filter(d => typeof d === 'number' && !isNaN(d));
  const closestDistance = distances.length ? Math.min(...distances).toFixed(1) : '1.2';

  const steps = [
    {
      number: 'STEP 1',
      title: 'Sellers list surplus',
      desc: 'Bakeries, restaurants and grocers post unsold stock in under 30 seconds with a pickup window and a rescue price.',
      icon: Store,
      color: 'from-amber-500 to-orange-500'
    },
    {
      number: 'STEP 2',
      title: 'Neighbours discover it',
      desc: 'Location-based matching surfaces the closest rescues first, with distance, freshness and allergen details.',
      icon: MapPin,
      color: 'from-emerald-500 to-teal-500'
    },
    {
      number: 'STEP 3',
      title: 'QR + OTP pickup',
      desc: 'Pay in-app, collect in person. A scannable code and a one-time PIN confirm handover without paperwork.',
      icon: QrCode,
      color: 'from-blue-500 to-cyan-500'
    },
    {
      number: 'STEP 4',
      title: 'NGOs catch the rest',
      desc: 'Anything unclaimed near expiry is auto-escalated to partner NGOs so nothing edible reaches a bin.',
      icon: HeartHandshake,
      color: 'from-rose-500 to-pink-500'
    }
  ];

  return (
    <div className="space-y-20 pb-16">
      
      {/* Hero Section */}
      <section className="relative pt-12 pb-16 md:pt-20 md:pb-24 overflow-hidden">
        {/* Decorative background glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-gradient-to-b from-emerald-100/50 via-teal-50/20 to-transparent pointer-events-none rounded-full blur-3xl -z-10" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            
            {/* Live Rescues Nearby Pill */}
            <div className="inline-flex items-center gap-2 bg-emerald-50 border border-emerald-200/80 px-3.5 py-1.5 rounded-full text-xs font-semibold text-emerald-800 shadow-sm animate-soft-pulse">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
              <span>{rescues.length} rescues nearby</span>
              <span className="text-emerald-400">·</span>
              <span className="text-emerald-700">Closest is {closestDistance} km away</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.15] font-display">
              Rescue surplus food.<br />
              <span className="bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 bg-clip-text text-transparent">
                Feed hope, not landfills.
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-lg sm:text-xl text-slate-600 leading-relaxed font-normal max-w-2xl mx-auto">
              ResQFood turns end-of-day surplus into affordable meals for neighbours and free meals for NGOs — matched by distance, priced by urgency, verified at pickup.
            </p>

            {/* Hero CTAs */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 pt-4">
              <button
                onClick={() => onNavigate('/browse')}
                className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-base shadow-card hover:shadow-glow transition-all flex items-center justify-center gap-2 group"
              >
                <span>Find food near me</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>

              <button
                onClick={() => onNavigate('/seller')}
                className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-white hover:bg-slate-50 text-slate-800 font-bold text-base border border-slate-200 shadow-soft transition-all flex items-center justify-center gap-2"
              >
                <Store className="w-4 h-4 text-emerald-600" />
                <span>List surplus food</span>
              </button>
            </div>

            {/* Location indicator */}
            <div className="flex items-center justify-center gap-1 text-xs text-slate-500 pt-2">
              <MapPin className="w-3.5 h-3.5 text-emerald-600" />
              <span>Current simulated location: <strong className="text-slate-700">{simulatedLocation.name}</strong></span>
            </div>
          </div>
        </div>
      </section>

      {/* How ResQFood Works Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight font-display">
            How ResQFood works
          </h2>
          <p className="text-slate-600 text-base mt-2">
            One marketplace, three roles, zero waste.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((step) => {
            const Icon = step.icon;
            return (
              <div
                key={step.number}
                className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-soft hover:shadow-card transition-all duration-300 flex flex-col justify-between group hover:-translate-y-1"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-[11px] font-extrabold tracking-widest text-emerald-600 uppercase bg-emerald-50 px-2.5 py-1 rounded-lg">
                      {step.number}
                    </span>
                    <div className={`w-10 h-10 rounded-2xl bg-gradient-to-tr ${step.color} flex items-center justify-center text-white shadow-md group-hover:scale-110 transition-transform`}>
                      <Icon className="w-5 h-5" />
                    </div>
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 mb-2 font-display">
                    {step.title}
                  </h3>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    {step.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Rescues Near Bandra West (Featured Showcase) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-emerald-600 uppercase tracking-wider mb-1">
              <Sparkles className="w-3.5 h-3.5" />
              Live Marketplace
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight font-display">
              Rescues near {simulatedLocation.name.split(',')[0]}
            </h2>
            <p className="text-slate-600 text-sm mt-1">
              Sorted by distance from your simulated location.
            </p>
          </div>

          <button
            onClick={() => onNavigate('/browse')}
            className="inline-flex items-center gap-1.5 text-sm font-bold text-emerald-600 hover:text-emerald-700 transition-colors"
          >
            <span>See all {rescues.length} rescues</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {featuredRescues.map((rescue) => (
            <FoodCard
              key={rescue.id}
              rescue={rescue}
              onSelect={onSelectRescue}
              onQuickReserve={() => onNavigate(`/checkout/${rescue.id}`)}
            />
          ))}
        </div>
      </section>

      {/* Role Portals (Sellers, Buyers, NGOs) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* For Sellers Card */}
          <div className="bg-gradient-to-br from-amber-50 to-orange-50/50 rounded-3xl p-8 border border-amber-200/70 flex flex-col justify-between shadow-soft hover:shadow-card transition-all">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-amber-500 text-white flex items-center justify-center shadow-md mb-6">
                <Store className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-extrabold text-slate-900 mb-2 font-display">
                For Sellers
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed mb-6">
                Recover revenue on stock you'd write off, track waste diverted per outlet, and meet CSR zero-waste targets automatically.
              </p>
            </div>
            <button
              onClick={() => onNavigate('/seller')}
              className="inline-flex items-center justify-between w-full px-5 py-3 rounded-2xl bg-white hover:bg-amber-100/50 text-slate-800 font-bold text-sm border border-amber-200 shadow-sm transition-all"
            >
              <span>Open seller dashboard</span>
              <ArrowRight className="w-4 h-4 text-amber-600" />
            </button>
          </div>

          {/* For Buyers Card */}
          <div className="bg-gradient-to-br from-emerald-50 to-teal-50/50 rounded-3xl p-8 border border-emerald-200/70 flex flex-col justify-between shadow-soft hover:shadow-card transition-all">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-md mb-6">
                <Users className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-extrabold text-slate-900 mb-2 font-display">
                For Buyers
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed mb-6">
                Great food at rescue prices, five minutes from home, with allergen logs, hold temperatures, and verified freshness labels.
              </p>
            </div>
            <button
              onClick={() => onNavigate('/browse')}
              className="inline-flex items-center justify-between w-full px-5 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-sm transition-all"
            >
              <span>Start browsing</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* For NGOs Card */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50/50 rounded-3xl p-8 border border-blue-200/70 flex flex-col justify-between shadow-soft hover:shadow-card transition-all">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-md mb-6">
                <HeartHandshake className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-extrabold text-slate-900 mb-2 font-display">
                For NGOs
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed mb-6">
                Claim bulk unclaimed food before cut-off, assign dispatch vehicles, and track every meal safely redistributed to shelters.
              </p>
            </div>
            <button
              onClick={() => onNavigate('/ngo')}
              className="inline-flex items-center justify-between w-full px-5 py-3 rounded-2xl bg-white hover:bg-blue-100/50 text-slate-800 font-bold text-sm border border-blue-200 shadow-sm transition-all"
            >
              <span>NGO coordination</span>
              <ArrowRight className="w-4 h-4 text-blue-600" />
            </button>
          </div>
        </div>
      </section>

      {/* Food Safety Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white rounded-3xl p-8 sm:p-12 shadow-card border border-slate-700/80 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase tracking-wider">
              <ShieldCheck className="w-4 h-4" />
              FSSAI Hygiene Standards Aligned
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight font-display text-white">
              Safety is not an afterthought
            </h2>
            <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
              Every listing carries hold-temperature logs, allergen tags and a hard freshness cut-off. Partners are FSSAI-verified before going live.
            </p>
          </div>

          <button
            onClick={() => onNavigate('/safety')}
            className="shrink-0 px-6 py-3.5 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm shadow-md transition-all flex items-center gap-2"
          >
            <span>Read our standards</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </section>
    </div>
  );
}
