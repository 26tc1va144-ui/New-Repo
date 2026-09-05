import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Store,
  Plus,
  TrendingUp,
  Package,
  Trash2,
  Clock,
  HeartHandshake,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  BarChart3,
  KeyRound,
  X
} from 'lucide-react';

export default function SellerDashboardPage({ onNavigate }) {
  const {
    currentUser,
    rescues,
    addRescueListing,
    escalateListingToNgo,
    verifyOrderOtp,
    sellerStats,
    addToast
  } = useApp();

  const [showAddModal, setShowAddModal] = useState(false);
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [verifyOtpInput, setVerifyOtpInput] = useState('');
  const [otpVerifyResult, setOtpVerifyResult] = useState(null);

  // Form State for new listing
  const [formData, setFormData] = useState({
    title: '',
    category: 'Bakery',
    originalPrice: '',
    rescuePrice: '',
    portions: '6',
    pickupStart: '20:30',
    pickupEnd: '22:30',
    freshnessCutoff: 'Consume within 24 hours',
    holdTemperature: 'Stored at ambient room temperature in protective bakery packaging (< 24°C)',
    description: '',
    allergens: ['Gluten'],
    image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=800&q=80'
  });

  const availableAllergens = ['Gluten', 'Dairy', 'Eggs', 'Nuts', 'Soy'];

  const handleAllergenToggle = (alg) => {
    setFormData(prev => ({
      ...prev,
      allergens: prev.allergens.includes(alg)
        ? prev.allergens.filter(a => a !== alg)
        : [...prev.allergens, alg]
    }));
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.originalPrice || !formData.rescuePrice) {
      addToast('Please fill in required fields (Title, Prices)', 'error');
      return;
    }

    try {
      await addRescueListing({
        ...formData,
        pickupWindow: `${formData.pickupStart} – ${formData.pickupEnd} today`
      });

      setShowAddModal(false);
      // Reset form
      setFormData({
        title: '',
        category: 'Bakery',
        originalPrice: '',
        rescuePrice: '',
        portions: '6',
        pickupStart: '20:30',
        pickupEnd: '22:30',
        freshnessCutoff: 'Consume within 24 hours',
        holdTemperature: 'Stored in temperature-controlled cabinet',
        description: '',
        allergens: ['Gluten'],
        image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=800&q=80'
      });
    } catch (err) {
      // Toast already handled in context
    }
  };

  const handleOtpVerify = async (e) => {
    e.preventDefault();
    if (!verifyOtpInput || verifyOtpInput.length < 4) {
      addToast('Please enter the 4-digit OTP', 'error');
      return;
    }

    const res = await verifyOrderOtp(verifyOtpInput);
    setOtpVerifyResult(res);
  };

  // Filter listings for this store (includes any listing created by this seller)
  const sellerListings = rescues.filter(r =>
    (currentUser?.id && r.sellerId === currentUser.id) ||
    (currentUser?.name && (r.seller?.includes(currentUser.name) || r.sellerName?.includes(currentUser.name))) ||
    r.seller?.includes('Crust & Co') ||
    r.sellerName?.includes('Crust & Co')
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-4 border-b border-slate-200/80">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-emerald-600 uppercase tracking-wider mb-1">
            <Store className="w-4 h-4" />
            Merchant Portal
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight font-display">
            Seller dashboard
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            <strong className="text-slate-800">{sellerStats.storeName}</strong> · {sellerStats.outlet}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => setShowOtpModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-sm transition-all"
          >
            <KeyRound className="w-3.5 h-3.5 text-emerald-400" />
            <span>Verify Buyer OTP</span>
          </button>

          <button
            onClick={() => onNavigate('/seller/analytics')}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold border border-slate-200 shadow-soft transition-all"
          >
            <BarChart3 className="w-3.5 h-3.5 text-emerald-600" />
            <span>View analytics</span>
          </button>

          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-card transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>List surplus food</span>
          </button>
        </div>
      </div>

      {/* 4 Metric Highlights matching ResQFood */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Metric 1 */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-soft space-y-2">
          <div className="text-xs text-slate-500 font-medium flex items-center justify-between">
            <span>Revenue recovered (7d)</span>
            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
              {sellerStats.revenueChangeWoW} WoW
            </span>
          </div>
          <div className="text-3xl font-black text-slate-900 font-display">
            ₹{sellerStats.revenueRecovered7d.toLocaleString()}
          </div>
          <div className="text-[11px] text-slate-400">
            From unsold stock otherwise discarded
          </div>
        </div>

        {/* Metric 2 */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-soft space-y-2">
          <div className="text-xs text-slate-500 font-medium flex items-center justify-between">
            <span>Portions rescued (7d)</span>
            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
              {sellerStats.sellThroughRate} sell-through
            </span>
          </div>
          <div className="text-3xl font-black text-slate-900 font-display">
            {sellerStats.portionsRescued7d}
          </div>
          <div className="text-[11px] text-slate-400">
            Meals fed to neighbourhood buyers
          </div>
        </div>

        {/* Metric 3 */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-soft space-y-2">
          <div className="text-xs text-slate-500 font-medium flex items-center justify-between">
            <span>Waste diverted</span>
            <span className="text-xs font-semibold text-slate-500">7-day total</span>
          </div>
          <div className="text-3xl font-black text-emerald-700 font-display">
            {sellerStats.wasteDivertedKg} kg
          </div>
          <div className="text-[11px] text-slate-500 font-medium">
            ≈ {sellerStats.co2eAvoidedKg} kg CO₂e prevented
          </div>
        </div>

        {/* Metric 4 */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-soft space-y-2">
          <div className="text-xs text-slate-500 font-medium flex items-center justify-between">
            <span>Active listings</span>
            <span className="text-xs font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">
              {sellerStats.expiringTonightCount} expiring tonight
            </span>
          </div>
          <div className="text-3xl font-black text-slate-900 font-display">
            {sellerStats.activeListingsCount}
          </div>
          <div className="text-[11px] text-slate-400">
            Available on live buyer radar
          </div>
        </div>
      </div>

      {/* Partner NGOs Notice Box */}
      <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-3xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-sm">
            <HeartHandshake className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-bold text-sm text-slate-900 font-display">
              Automated NGO Escalation Safeguard
            </h4>
            <p className="text-xs text-slate-600 mt-0.5">
              Partner NGOs get first claim and collect free of charge if meals are unclaimed 60 minutes before closing.
            </p>
          </div>
        </div>

        <button
          onClick={() => onNavigate('/ngo')}
          className="shrink-0 text-xs font-bold text-emerald-800 hover:text-emerald-900 px-4 py-2 bg-white rounded-xl border border-emerald-300 shadow-sm"
        >
          View NGO channel →
        </button>
      </div>

      {/* Active Listings Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-soft overflow-hidden space-y-4 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-lg text-slate-900 font-display">
              Live Surplus Inventory
            </h3>
            <p className="text-xs text-slate-500">
              Manage current rescue batches, adjust stock, or escalate early to NGOs
            </p>
          </div>

          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 hover:text-emerald-700"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Batch</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 text-[11px] font-bold uppercase text-slate-400">
                <th className="pb-3 font-semibold">Item & Category</th>
                <th className="pb-3 font-semibold">Portions Remaining</th>
                <th className="pb-3 font-semibold">Rescue Price</th>
                <th className="pb-3 font-semibold">Pickup Window</th>
                <th className="pb-3 font-semibold">Status</th>
                <th className="pb-3 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {sellerListings.map((listing) => (
                <tr key={listing.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3.5">
                    <div className="flex items-center gap-3">
                      <img
                        src={listing.image}
                        alt={listing.title}
                        className="w-10 h-10 rounded-xl object-cover border border-slate-200"
                      />
                      <div>
                        <div className="font-bold text-slate-900">{listing.title}</div>
                        <div className="text-[11px] text-slate-400">{listing.category} · {listing.fssaiLicense}</div>
                      </div>
                    </div>
                  </td>

                  <td className="py-3.5">
                    <span className="font-extrabold text-slate-800">
                      {listing.portionsLeft}
                    </span>
                    <span className="text-slate-400"> / {listing.portionsTotal}</span>
                  </td>

                  <td className="py-3.5">
                    <span className="font-bold text-slate-900">₹{listing.rescuePrice}</span>
                    <span className="text-[10px] text-slate-400 line-through ml-1.5">₹{listing.originalPrice}</span>
                  </td>

                  <td className="py-3.5">
                    <div className="flex items-center gap-1 text-slate-600">
                      <Clock className="w-3 h-3 text-emerald-600" />
                      <span>{listing.pickupWindow.split(' ')[0]}</span>
                    </div>
                  </td>

                  <td className="py-3.5">
                    {listing.ngoEscalated ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-800 border border-blue-200">
                        <HeartHandshake className="w-3 h-3" />
                        Escalated to NGOs
                      </span>
                    ) : listing.isExpiringSoon ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
                        <Clock className="w-3 h-3" />
                        Expiring Soon
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                        <CheckCircle2 className="w-3 h-3" />
                        Live on Radar
                      </span>
                    )}
                  </td>

                  <td className="py-3.5 text-right">
                    {!listing.ngoEscalated && (
                      <button
                        onClick={() => escalateListingToNgo(listing.id)}
                        className="px-2.5 py-1 text-[11px] font-bold text-amber-700 bg-amber-50 hover:bg-amber-100 rounded-lg border border-amber-200 transition-colors"
                      >
                        Escalate to NGOs
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal 1: Add Surplus Listing Form */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-card border border-slate-200 max-h-[90vh] overflow-y-auto space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-xl font-extrabold text-slate-900 font-display">
                  Post Surplus Food Batch
                </h3>
                <p className="text-xs text-slate-500">
                  List end-of-day food in under 30 seconds
                </p>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Item Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Sourdough Loaf & Chocolate Danish Box"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Category
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium"
                  >
                    <option value="Bakery">Bakery</option>
                    <option value="Restaurant">Restaurant</option>
                    <option value="Groceries">Groceries</option>
                    <option value="Cafe">Cafe</option>
                    <option value="Catering">Catering</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Portions Available *
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={formData.portions}
                    onChange={(e) => setFormData({ ...formData, portions: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Original Menu Price (₹) *
                  </label>
                  <input
                    type="number"
                    min="1"
                    placeholder="e.g. 600"
                    required
                    value={formData.originalPrice}
                    onChange={(e) => setFormData({ ...formData, originalPrice: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Rescue Price (₹) *
                  </label>
                  <input
                    type="number"
                    min="0"
                    placeholder="e.g. 149 (or 0 for donation)"
                    required
                    value={formData.rescuePrice}
                    onChange={(e) => setFormData({ ...formData, rescuePrice: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Pickup Window (Start - End)
                  </label>
                  <div className="flex items-center gap-1.5">
                    <input
                      type="text"
                      value={formData.pickupStart}
                      onChange={(e) => setFormData({ ...formData, pickupStart: e.target.value })}
                      className="w-1/2 px-2.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-center"
                    />
                    <span className="text-slate-400">–</span>
                    <input
                      type="text"
                      value={formData.pickupEnd}
                      onChange={(e) => setFormData({ ...formData, pickupEnd: e.target.value })}
                      className="w-1/2 px-2.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-center"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Freshness Cut-off
                  </label>
                  <input
                    type="text"
                    value={formData.freshnessCutoff}
                    onChange={(e) => setFormData({ ...formData, freshnessCutoff: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  />
                </div>
              </div>

              {/* Hold Temperature Log */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Hold Temperature / Storage Log (FSSAI required)
                </label>
                <input
                  type="text"
                  value={formData.holdTemperature}
                  onChange={(e) => setFormData({ ...formData, holdTemperature: e.target.value })}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                />
              </div>

              {/* Allergens selection */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Declared Allergens
                </label>
                <div className="flex flex-wrap gap-2">
                  {availableAllergens.map((alg) => (
                    <button
                      type="button"
                      key={alg}
                      onClick={() => handleAllergenToggle(alg)}
                      className={`px-3 py-1 rounded-lg text-xs font-semibold border transition-all ${
                        formData.allergens.includes(alg)
                          ? 'bg-amber-100 text-amber-900 border-amber-300'
                          : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {alg}
                    </button>
                  ))}
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Description
                </label>
                <textarea
                  rows="2"
                  placeholder="Freshly baked this morning; includes croissants, sourdough, etc."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2.5 rounded-xl text-slate-600 hover:bg-slate-100 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-card"
                >
                  Publish Listing Now
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 2: Verify Buyer OTP Modal */}
      {showOtpModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-card border border-slate-200 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <KeyRound className="w-5 h-5 text-emerald-600" />
                <h3 className="text-lg font-extrabold text-slate-900 font-display">
                  Verify Buyer Pickup OTP
                </h3>
              </div>
              <button
                onClick={() => {
                  setShowOtpModal(false);
                  setOtpVerifyResult(null);
                  setVerifyOtpInput('');
                }}
                className="p-1 rounded-full text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-600">
              Ask the customer for their 4-digit rescue code shown on their digital pass.
            </p>

            <form onSubmit={handleOtpVerify} className="space-y-4">
              <div>
                <input
                  type="text"
                  maxLength="4"
                  required
                  placeholder="e.g. 4829"
                  value={verifyOtpInput}
                  onChange={(e) => setVerifyOtpInput(e.target.value.replace(/\D/g, ''))}
                  className="w-full text-center tracking-widest text-3xl font-black font-display py-3 bg-slate-50 border-2 border-emerald-500/40 rounded-2xl focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500"
                />
              </div>

              {otpVerifyResult && (
                <div className={`p-3.5 rounded-xl text-xs font-semibold ${
                  otpVerifyResult.success
                    ? 'bg-emerald-50 text-emerald-900 border border-emerald-200'
                    : 'bg-rose-50 text-rose-900 border border-rose-200'
                }`}>
                  {otpVerifyResult.success ? (
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5 text-emerald-700 font-bold">
                        <CheckCircle2 className="w-4 h-4" />
                        Handover Confirmed!
                      </div>
                      <div className="text-slate-700">
                        Item: {otpVerifyResult.order.title} ({otpVerifyResult.order.portions} portions)
                      </div>
                    </div>
                  ) : (
                    otpVerifyResult.message
                  )}
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowOtpModal(false);
                    setOtpVerifyResult(null);
                  }}
                  className="px-4 py-2 rounded-xl text-slate-600 text-xs font-semibold"
                >
                  Close
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-card"
                >
                  Confirm Handover
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
