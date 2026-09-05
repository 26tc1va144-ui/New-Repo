import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  HeartHandshake,
  Truck,
  Users,
  Clock,
  MapPin,
  AlertTriangle,
  CheckCircle2,
  Phone,
  ShieldCheck,
  Send,
  X
} from 'lucide-react';

export default function NgoPortalPage({ onNavigate }) {
  const {
    rescues,
    ngos,
    ngoClaims,
    claimUnclaimedByNgo,
    addToast
  } = useApp();

  const [selectedRescueForClaim, setSelectedRescueForClaim] = useState(null);
  const [selectedNgoName, setSelectedNgoName] = useState('Roti Bank Mumbai');
  const [vehicleNumber, setVehicleNumber] = useState('MH-02-CD-4421');
  const [driverName, setDriverName] = useState('Suresh K.');
  const [notes, setNotes] = useState('Insulated temperature thermal boxes equipped');

  // Items escalated or nearing cut-off
  const unclaimedItems = rescues.filter(r => r.ngoEscalated || r.isExpiringSoon || r.rescuePrice === 0);

  const handleClaimSubmit = async (e) => {
    e.preventDefault();
    if (!selectedRescueForClaim) return;

    try {
      await claimUnclaimedByNgo(selectedRescueForClaim.id, selectedNgoName, vehicleNumber);
      setSelectedRescueForClaim(null);
    } catch (err) {
      // Handled in context toast
    }
  };

  // Dynamically calculate operational metrics
  const totalMealsServedToday = (ngos || []).reduce((sum, n) => sum + (n.mealsServedToday || 0), 0) +
    (ngoClaims || []).reduce((sum, c) => sum + (c.portionsClaimed || 0), 0);
  const totalVehiclesAvailable = (ngos || []).reduce((sum, n) => sum + (n.vehicles || 0), 0);
  const totalVolunteersOnShift = (ngos || []).reduce((sum, n) => sum + (n.volunteers || 0), 0);
  const activeUnclaimedCount = unclaimedItems.length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-4 border-b border-slate-200/80">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-rose-600 uppercase tracking-wider mb-1">
            <HeartHandshake className="w-4 h-4" />
            Zero Hunger Coordination Hub
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight font-display">
            NGO coordination
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Unclaimed food near expiry is escalated here automatically.
          </p>
        </div>

        <div className="inline-flex items-center gap-2 bg-emerald-50 text-emerald-900 px-3.5 py-1.5 rounded-xl border border-emerald-200 text-xs font-semibold">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>Live NGO Dispatch Channel Active</span>
        </div>
      </div>

      {/* 4 Operations Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-soft space-y-1">
          <div className="text-3xl font-black text-slate-900 font-display">
            {totalMealsServedToday.toLocaleString()}
          </div>
          <div className="text-xs font-bold text-slate-700">Meals served today</div>
          <div className="text-[11px] text-slate-400">Across {(ngos || []).length} active distribution centres</div>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-soft space-y-1">
          <div className="text-3xl font-black text-slate-900 font-display">
            {totalVehiclesAvailable}
          </div>
          <div className="text-xs font-bold text-slate-700">Vehicles available</div>
          <div className="text-[11px] text-slate-400">Equipped with thermal carriers</div>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-soft space-y-1">
          <div className="text-3xl font-black text-slate-900 font-display">
            {totalVolunteersOnShift}
          </div>
          <div className="text-xs font-bold text-slate-700">Volunteers on shift</div>
          <div className="text-[11px] text-slate-400">Active in Bandra & Western suburbs</div>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-soft space-y-1">
          <div className="text-3xl font-black text-emerald-700 font-display">
            {activeUnclaimedCount}
          </div>
          <div className="text-xs font-bold text-slate-700">Urgent surplus alerts</div>
          <div className="text-[11px] text-slate-400">Ready for priority NGO rescue</div>
        </div>
      </div>

      {/* Unclaimed Food Alerts Stream */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-soft space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-900 font-display flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-500" />
              <span>Unclaimed food alerts</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Urgent bulk batches available for immediate NGO claim and vehicle dispatch
            </p>
          </div>

          <span className="text-xs font-bold bg-amber-50 text-amber-800 px-3 py-1 rounded-full border border-amber-200">
            {unclaimedItems.length} awaiting pickup
          </span>
        </div>

        <div className="space-y-4">
          {unclaimedItems.map((item) => (
            <div
              key={item.id}
              className="p-5 rounded-2xl border border-amber-200/80 bg-amber-50/40 hover:bg-amber-50/70 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div className="space-y-1.5 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-extrabold text-slate-900 text-base font-display">
                    {item.title}
                  </span>
                  <span className="text-xs font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200">
                    Awaiting a claim
                  </span>
                </div>

                <div className="text-xs text-slate-600 flex items-center gap-2 flex-wrap">
                  <span className="font-semibold text-slate-800">{item.seller}</span>
                  <span>·</span>
                  <span className="font-bold text-emerald-800">{item.portionsLeft} portions</span>
                  <span>·</span>
                  <span>{item.distance} km away</span>
                  <span>·</span>
                  <span className="flex items-center gap-1 text-slate-700 font-medium">
                    <Clock className="w-3.5 h-3.5 text-amber-600" />
                    Collection {item.pickupWindow.split(' ')[0]}
                  </span>
                </div>

                <p className="text-xs text-slate-500 line-clamp-1">
                  {item.description}
                </p>
              </div>

              <div className="shrink-0 flex items-center gap-3">
                <button
                  onClick={() => setSelectedRescueForClaim(item)}
                  className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-sm transition-all flex items-center gap-1.5"
                >
                  <Truck className="w-4 h-4 text-emerald-400" />
                  <span>Dispatch Vehicle to Claim</span>
                </button>
              </div>
            </div>
          ))}

          {unclaimedItems.length === 0 && (
            <div className="text-center py-8 text-xs text-slate-500 bg-slate-50 rounded-2xl">
              All surplus food is currently matched with neighbours or claimed by NGOs.
            </div>
          )}
        </div>
      </div>

      {/* Partner NGO Fleet Cards */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-slate-900 font-display">
          Partner NGO Fleets & Contacts
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {ngos.map((ngo) => (
            <div
              key={ngo.id}
              className="bg-white rounded-3xl p-6 border border-slate-200 shadow-soft space-y-4 hover:border-slate-300 transition-all"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-bold text-slate-900 text-base font-display">
                    {ngo.name}
                  </h3>
                  <div className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                    <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                    <span>{ngo.location}</span>
                  </div>
                </div>

                <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                  {ngo.status}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 text-xs">
                <div>
                  <span className="text-slate-400 block text-[10px] font-semibold">FLEET</span>
                  <span className="font-bold text-slate-800">{ngo.vehicles} vehicles</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] font-semibold">VOLUNTEERS</span>
                  <span className="font-bold text-slate-800">{ngo.volunteers} on call</span>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-between text-xs text-slate-600">
                <span className="flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                  {ngo.contactPhone}
                </span>
                <span className="font-bold text-emerald-700">{ngo.mealsServedToday} meals/day</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Active Dispatches Board */}
      {ngoClaims.length > 0 && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-soft space-y-4">
          <h2 className="text-lg font-bold text-slate-900 font-display flex items-center gap-2">
            <Truck className="w-5 h-5 text-emerald-600" />
            <span>Active Dispatch Operations ({ngoClaims.length})</span>
          </h2>

          <div className="divide-y divide-slate-100 text-xs">
            {ngoClaims.map((claim) => (
              <div key={claim.id} className="py-3 flex items-center justify-between gap-4">
                <div>
                  <div className="font-bold text-slate-900">{claim.rescueTitle}</div>
                  <div className="text-slate-500">
                    {claim.ngoName} · Vehicle {claim.vehicleId} · {claim.portionsClaimed} portions
                  </div>
                </div>

                <div className="text-right">
                  <span className="inline-flex items-center gap-1 text-emerald-700 font-bold bg-emerald-50 px-2.5 py-0.5 rounded-full">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    ETA: {claim.eta}
                  </span>
                  <div className="text-[10px] text-slate-400 mt-0.5">Claimed at {claim.claimedAt}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Claim Modal Dialog */}
      {selectedRescueForClaim && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-card border border-slate-200 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-lg font-extrabold text-slate-900 font-display">
                  Claim Surplus for NGO Dispatch
                </h3>
                <p className="text-xs text-slate-500">
                  Assign pickup vehicle and notify restaurant
                </p>
              </div>
              <button
                onClick={() => setSelectedRescueForClaim(null)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100 text-xs space-y-1">
              <div className="font-bold text-slate-900">{selectedRescueForClaim.title}</div>
              <div className="text-slate-600">
                {selectedRescueForClaim.seller} · {selectedRescueForClaim.portionsLeft} portions
              </div>
              <div className="text-emerald-700 font-semibold">
                Cost: Free (NGO community surplus allocation)
              </div>
            </div>

            <form onSubmit={handleClaimSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Assigning Organization
                </label>
                <select
                  value={selectedNgoName}
                  onChange={(e) => setSelectedNgoName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium"
                >
                  <option value="Roti Bank Mumbai">Roti Bank Mumbai (Dadar Fleet)</option>
                  <option value="Feeding Hands Trust">Feeding Hands Trust (Andheri Fleet)</option>
                  <option value="Anna Seva Foundation">Anna Seva Foundation (Bandra Fleet)</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Vehicle Number
                  </label>
                  <input
                    type="text"
                    required
                    value={vehicleNumber}
                    onChange={(e) => setVehicleNumber(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Driver / Volunteer
                  </label>
                  <input
                    type="text"
                    required
                    value={driverName}
                    onChange={(e) => setDriverName(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Dispatch Notes
                </label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedRescueForClaim(null)}
                  className="px-4 py-2 rounded-xl text-slate-600 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-card flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Confirm Dispatch</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
