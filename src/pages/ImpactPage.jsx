import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Sparkles,
  Droplet,
  CloudSun,
  Users,
  Award,
  ArrowRight,
  Calculator,
  Download,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';

export default function ImpactPage({ onNavigate }) {
  const { communityImpact, addToast } = useApp();

  // Interactive slider state for personal impact
  const [mealsPerWeek, setMealsPerWeek] = useState(2);

  // Calculations per rescue meal:
  // ~ 2.4 kg CO2e per meal
  // ~ 180 Litres water per meal
  // ~ ₹260 savings per meal
  const annualMeals = mealsPerWeek * 52;
  const annualCo2Kg = Math.round(annualMeals * 2.4);
  const annualWaterL = Math.round(annualMeals * 180).toLocaleString();
  const annualSavings = Math.round(annualMeals * 260).toLocaleString();
  const annualFoodSavedKg = Math.round(annualMeals * 0.45);

  const handleDownloadCertificate = () => {
    addToast('Impact Certificate generated and downloaded!', 'success');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
      
      {/* Page Header */}
      <div className="max-w-3xl space-y-3">
        <div className="inline-flex items-center gap-2 text-xs font-bold text-emerald-600 uppercase tracking-wider">
          <Sparkles className="w-4 h-4" />
          Community ESG Metrics
        </div>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight font-display">
          Impact tracker
        </h1>
        <p className="text-base sm:text-lg text-slate-600 leading-relaxed">
          Every rescued portion avoids the emissions, water and land already spent producing that food. These are the community totals for ResQFood.
        </p>
      </div>

      {/* 4 Community Totals Cards matching ResQFood */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Metric 1 */}
        <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-soft hover:shadow-card transition-all space-y-2 group">
          <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold mb-4 group-hover:scale-110 transition-transform">
            🍱
          </div>
          <div className="text-4xl font-black text-slate-900 font-display">
            {communityImpact.mealsRescued.toLocaleString()}
          </div>
          <div className="text-sm font-bold text-slate-800">
            Meals rescued
          </div>
          <div className="text-xs text-slate-500">
            since launch across all partner outlets
          </div>
        </div>

        {/* Metric 2 */}
        <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-soft hover:shadow-card transition-all space-y-2 group">
          <div className="w-12 h-12 rounded-2xl bg-teal-100 text-teal-700 flex items-center justify-center font-bold mb-4 group-hover:scale-110 transition-transform">
            🌱
          </div>
          <div className="text-4xl font-black text-slate-900 font-display">
            {communityImpact.co2eAvoidedTons} t
          </div>
          <div className="text-sm font-bold text-slate-800">
            CO₂e avoided
          </div>
          <div className="text-xs text-slate-500">
            ≈ {communityImpact.kmDrivenEquivalent.toLocaleString()} km not driven
          </div>
        </div>

        {/* Metric 3 */}
        <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-soft hover:shadow-card transition-all space-y-2 group">
          <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold mb-4 group-hover:scale-110 transition-transform">
            💧
          </div>
          <div className="text-4xl font-black text-slate-900 font-display">
            {communityImpact.waterDisplay || `${(communityImpact.waterSavedLitres / 1000000).toFixed(1)}M L`}
          </div>
          <div className="text-sm font-bold text-slate-800">
            Water saved
          </div>
          <div className="text-xs text-slate-500">
            embedded in rescued agricultural produce
          </div>
        </div>

        {/* Metric 4 */}
        <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-soft hover:shadow-card transition-all space-y-2 group">
          <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold mb-4 group-hover:scale-110 transition-transform">
            🤝
          </div>
          <div className="text-4xl font-black text-slate-900 font-display">
            {communityImpact.peopleFed.toLocaleString()}
          </div>
          <div className="text-sm font-bold text-slate-800">
            People fed
          </div>
          <div className="text-xs text-slate-500">
            via local buyers and partner NGOs
          </div>
        </div>
      </div>

      {/* Interactive Personal Impact Calculator */}
      <div className="bg-gradient-to-br from-emerald-900 via-teal-950 to-slate-950 text-white rounded-3xl p-8 sm:p-12 shadow-card space-y-8">
        <div className="max-w-2xl space-y-2">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-300 uppercase tracking-wider bg-emerald-500/20 px-3 py-1 rounded-full border border-emerald-500/30">
            <Calculator className="w-3.5 h-3.5" />
            Interactive Calculator
          </div>
          <h2 className="text-2xl sm:text-4xl font-extrabold font-display">
            Calculate your personal yearly impact
          </h2>
          <p className="text-sm sm:text-base text-slate-300">
            One rescued box a week keeps roughly 47 kg of food out of landfill every year. Move the slider to see your projected difference:
          </p>
        </div>

        {/* Slider Controls */}
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/10 space-y-4 max-w-xl">
          <div className="flex items-center justify-between">
            <span className="text-sm font-bold text-slate-200">Weekly rescue meals:</span>
            <span className="text-2xl font-black text-emerald-400 font-display">
              {mealsPerWeek} {mealsPerWeek === 1 ? 'meal' : 'meals'} / week
            </span>
          </div>

          <input
            type="range"
            min="1"
            max="10"
            value={mealsPerWeek}
            onChange={(e) => setMealsPerWeek(Number(e.target.value))}
            className="w-full accent-emerald-500 cursor-pointer h-2 bg-slate-700 rounded-lg"
          />

          <div className="flex justify-between text-[11px] text-slate-400 font-medium">
            <span>1 meal</span>
            <span>5 meals</span>
            <span>10 meals</span>
          </div>
        </div>

        {/* Output Metrics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div className="bg-white/5 backdrop-blur-md rounded-2xl p-5 border border-white/10 space-y-1">
            <div className="text-xs text-slate-400 font-semibold uppercase tracking-wider">
              Food Diverted
            </div>
            <div className="text-2xl font-black text-emerald-300 font-display">
              {annualFoodSavedKg} kg
            </div>
            <div className="text-[11px] text-slate-400">Kept out of methane landfills</div>
          </div>

          <div className="bg-white/5 backdrop-blur-md rounded-2xl p-5 border border-white/10 space-y-1">
            <div className="text-xs text-slate-400 font-semibold uppercase tracking-wider">
              CO₂e Offset
            </div>
            <div className="text-2xl font-black text-emerald-300 font-display">
              {annualCo2Kg} kg
            </div>
            <div className="text-[11px] text-slate-400">Equivalent to ~980 km driving</div>
          </div>

          <div className="bg-white/5 backdrop-blur-md rounded-2xl p-5 border border-white/10 space-y-1">
            <div className="text-xs text-slate-400 font-semibold uppercase tracking-wider">
              Water Conserved
            </div>
            <div className="text-2xl font-black text-emerald-300 font-display">
              {annualWaterL} L
            </div>
            <div className="text-[11px] text-slate-400">Agricultural virtual water</div>
          </div>

          <div className="bg-white/5 backdrop-blur-md rounded-2xl p-5 border border-white/10 space-y-1">
            <div className="text-xs text-slate-400 font-semibold uppercase tracking-wider">
              Money Saved
            </div>
            <div className="text-2xl font-black text-amber-300 font-display">
              ₹{annualSavings}
            </div>
            <div className="text-[11px] text-slate-400">Versus restaurant retail price</div>
          </div>
        </div>
      </div>

      {/* Call to Action Banner matching ResQFood */}
      <div className="bg-white rounded-3xl p-8 sm:p-10 border border-slate-200 shadow-soft flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="space-y-1 max-w-xl">
          <h3 className="text-xl sm:text-2xl font-bold text-slate-900 font-display">
            Add your rescue to the total
          </h3>
          <p className="text-sm text-slate-600">
            One rescued box a week keeps roughly 47 kg of food out of landfill every year. Browse what bakeries and kitchens near Bandra have listed right now.
          </p>
        </div>

        <button
          onClick={() => onNavigate('/browse')}
          className="shrink-0 px-8 py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-card hover:shadow-glow transition-all flex items-center gap-2"
        >
          <span>Find food near me</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* Impact Certificate Component */}
      <div className="bg-slate-50 rounded-3xl p-8 border border-slate-200 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-bold text-slate-900 font-display flex items-center gap-2">
              <Award className="w-5 h-5 text-emerald-600" />
              <span>Official Food Rescue Impact Certificate</span>
            </h3>
            <p className="text-xs text-slate-500">
              Verifiable proof of sustainable consumption and waste diverted
            </p>
          </div>

          <button
            onClick={handleDownloadCertificate}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white hover:bg-slate-100 text-slate-800 text-xs font-bold border border-slate-200 shadow-soft transition-all"
          >
            <Download className="w-4 h-4 text-emerald-600" />
            <span>Download High-Res PDF</span>
          </button>
        </div>

        {/* Certificate Mock Sheet */}
        <div className="max-w-xl mx-auto bg-white p-8 rounded-2xl border-2 border-emerald-600/30 shadow-card text-center space-y-4">
          <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
            <Award className="w-6 h-6" />
          </div>
          <span className="text-[10px] font-mono tracking-widest text-emerald-800 uppercase font-bold">
            Certificate of Recognition
          </span>
          <h4 className="text-xl font-bold font-display text-slate-900">
            Community Food Rescue Champion
          </h4>
          <p className="text-xs text-slate-600 max-w-sm mx-auto">
            Presented to active neighbours and donors in Bandra West for preventing food loss and supporting zero-waste neighbourhoods in {new Date().getFullYear()}.
          </p>
          <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400 font-mono">
            <span>RESQ-CERT-2026-MUMBAI</span>
            <span className="flex items-center gap-1 text-emerald-700 font-semibold">
              <ShieldCheck className="w-3.5 h-3.5" />
              FSSAI Aligned
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
