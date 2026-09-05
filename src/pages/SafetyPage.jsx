import React, { useState } from 'react';
import {
  ShieldCheck,
  Thermometer,
  Clock,
  QrCode,
  AlertCircle,
  ChevronDown,
  ArrowRight,
  CheckCircle2,
  Lock
} from 'lucide-react';
import { SAFETY_FAQS } from '../data/safetyContent';

export default function SafetyPage({ onNavigate }) {
  const [openFaq, setOpenFaq] = useState(0);

  const safetyPillars = [
    {
      title: 'Verified partners only',
      desc: 'Every seller uploads a valid FSSAI licence and passes a hygiene questionnaire before their first listing goes live.',
      icon: ShieldCheck,
      color: 'bg-emerald-100 text-emerald-700'
    },
    {
      title: 'Temperature discipline',
      desc: 'Hot food is held above 60°C and chilled food below 5°C. Sellers log the hold temperature at listing time.',
      icon: Thermometer,
      color: 'bg-blue-100 text-blue-700'
    },
    {
      title: 'Hard freshness cut-offs',
      desc: 'Listings auto-expire at the safe consumption limit. Cooked food never stays listed longer than four hours.',
      icon: Clock,
      color: 'bg-amber-100 text-amber-700'
    },
    {
      title: 'Traceable handover',
      desc: 'QR plus OTP confirmation records who collected what and when, so any issue can be traced in minutes.',
      icon: QrCode,
      color: 'bg-purple-100 text-purple-700'
    },
    {
      title: 'Allergen responsibility',
      desc: 'Surplus food is prepared in shared kitchens. We display declared allergens on every listing, but if you have a severe allergy, confirm with the seller at pickup before consuming.',
      icon: AlertCircle,
      color: 'bg-rose-100 text-rose-700'
    }
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
      
      {/* Header */}
      <div className="space-y-4 max-w-3xl">
        <div className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-600 uppercase tracking-wider bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
          <ShieldCheck className="w-4 h-4" />
          Rigorous Quality Guarantee
        </div>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight font-display">
          Food safety at ResQFood
        </h1>
        <p className="text-base sm:text-lg text-slate-600 leading-relaxed">
          Rescued does not mean risky. Surplus food is listed while it is still good — and we make the rules explicit for everyone involved.
        </p>
      </div>

      {/* 5 Pillars Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {safetyPillars.map((pillar, idx) => {
          const Icon = pillar.icon;
          return (
            <div
              key={pillar.title}
              className={`bg-white rounded-3xl p-6 border border-slate-200 shadow-soft space-y-3 ${
                idx === 4 ? 'md:col-span-2' : ''
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-2xl ${pillar.color} flex items-center justify-center shrink-0 shadow-sm`}>
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-slate-900 text-base font-display">
                  {pillar.title}
                </h3>
              </div>
              <p className="text-sm text-slate-600 leading-relaxed pl-13">
                {pillar.desc}
              </p>
            </div>
          );
        })}
      </div>

      {/* Common Questions Accordion */}
      <div className="space-y-6 pt-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 font-display">
            Common questions
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Answers regarding safety regulations, hygiene inspections, and container guidelines
          </p>
        </div>

        <div className="space-y-3">
          {(SAFETY_FAQS || []).map((faq, idx) => (
            <div
              key={faq.q}
              className="bg-white rounded-2xl border border-slate-200 shadow-soft overflow-hidden transition-all"
            >
              <button
                onClick={() => setOpenFaq(openFaq === idx ? -1 : idx)}
                className="w-full p-5 text-left flex items-center justify-between gap-4 font-bold text-slate-900 text-sm hover:text-emerald-700 transition-colors"
              >
                <span>{faq.q}</span>
                <ChevronDown
                  className={`w-4 h-4 text-slate-400 shrink-0 transition-transform duration-300 ${
                    openFaq === idx ? 'rotate-180 text-emerald-600' : ''
                  }`}
                />
              </button>

              {openFaq === idx && (
                <div className="px-5 pb-5 pt-1 text-xs sm:text-sm text-slate-600 leading-relaxed border-t border-slate-100 bg-slate-50/50">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Call to Action Footer */}
      <div className="bg-slate-900 text-white rounded-3xl p-8 sm:p-10 flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="space-y-1">
          <h3 className="text-xl font-bold font-display">
            Ready to taste safe, fresh surplus?
          </h3>
          <p className="text-xs text-slate-400">
            Join thousands of neighbours rescuing baked goods and meals everyday.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => onNavigate('/browse')}
            className="px-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-md transition-all flex items-center gap-1.5"
          >
            <span>Browse safe rescues</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            onClick={() => onNavigate('/seller')}
            className="px-6 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs border border-slate-700 transition-all"
          >
            <span>Become a verified seller</span>
          </button>
        </div>
      </div>
    </div>
  );
}
