import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { haversineDistance } from '../utils/geoUtils';
import {
  CheckCircle2,
  QrCode,
  Clock,
  MapPin,
  Store,
  Share2,
  Calendar,
  ShieldCheck,
  ArrowLeft,
  Sparkles,
  Download,
  AlertCircle,
  ExternalLink,
  LocateFixed,
  Navigation
} from 'lucide-react';
import FeedbackForm from '../components/feedback/FeedbackForm';

export default function OrderConfirmationPage({ orderId, onNavigate }) {
  const { orders, verifyOrderOtp, addToast } = useApp();
  const order = orders.find(o => o.id === orderId) || orders[0];

  const [simulatedSuccess, setSimulatedSuccess] = useState(
    order?.status === 'Collected' || order?.status === 'Picked Up' || order?.status === 'Completed'
  );
  const [userLocation, setUserLocation] = useState(null);
  const [distanceKm, setDistanceKm] = useState(null);
  const [locationError, setLocationError] = useState(null);
  const [isLocating, setIsLocating] = useState(false);

  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);

  if (!order) {
    return (
      <div className="max-w-md mx-auto py-16 text-center space-y-4">
        <AlertCircle className="w-12 h-12 text-rose-500 mx-auto" />
        <h2 className="text-xl font-bold text-slate-900">Order not found</h2>
        <button
          onClick={() => onNavigate('/browse')}
          className="px-4 py-2 rounded-xl bg-emerald-600 text-white text-sm font-semibold"
        >
          Back to discover
        </button>
      </div>
    );
  }

  const pickupCoords = order.coordinates || { lat: 26.2058, lng: 78.1950 };

  // Initialize Leaflet Map for Pickup Location
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
    }

    const map = L.map(mapContainerRef.current, {
      center: [pickupCoords.lat, pickupCoords.lng],
      zoom: 15,
      zoomControl: true,
      scrollWheelZoom: false
    });

    mapInstanceRef.current = map;

    // OpenStreetMap Tile Layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19
    }).addTo(map);

    // Custom Emerald Food Pickup Marker
    const emeraldPinHtml = `
      <div style="transform: translate(-50%, -100%);" class="relative flex flex-col items-center">
        <div style="background-color: #059669; width: 44px; height: 44px; border-radius: 14px; display: flex; align-items: center; justify-content: center; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.2); border: 2.5px solid white;">
          <span style="font-size: 20px;">🍲</span>
        </div>
        <div style="width: 0; height: 0; border-left: 6px solid transparent; border-right: 6px solid transparent; border-top: 6px solid #059669;"></div>
      </div>
    `;

    const customMarkerIcon = L.divIcon({
      className: 'resq-pickup-pin',
      html: emeraldPinHtml,
      iconSize: [44, 50],
      iconAnchor: [22, 50],
      popupAnchor: [0, -50]
    });

    const marker = L.marker([pickupCoords.lat, pickupCoords.lng], { icon: customMarkerIcon }).addTo(map);

    const popupContent = `
      <div style="font-family: inherit; min-width: 180px; padding: 4px;">
        <div style="font-size: 11px; font-weight: 700; color: #059669; text-transform: uppercase;">Pickup Point</div>
        <div style="font-size: 13px; font-weight: 800; color: #0f172a; margin-top: 2px;">${order.seller || order.sellerName || 'Food Store'}</div>
        <div style="font-size: 12px; font-weight: 600; color: #334155; margin-top: 2px;">${order.title || order.foodItem}</div>
        <div style="font-size: 11px; color: #64748b; margin-top: 4px; line-height: 1.3;">${order.address || order.pickupLocation}</div>
        <div style="margin-top: 8px; font-size: 11px; font-weight: 700; color: #059669;">⏰ ${order.pickupWindow}</div>
      </div>
    `;

    marker.bindPopup(popupContent).openPopup();

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [pickupCoords.lat, pickupCoords.lng, order.title, order.seller, order.address, order.pickupWindow]);

  // Use My Location Feature
  const handleUseMyLocation = () => {
    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported by your browser.');
      addToast('Geolocation is not supported by your browser', 'error');
      return;
    }

    setIsLocating(true);
    setLocationError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setIsLocating(false);
        const { latitude, longitude } = position.coords;
        setUserLocation({ lat: latitude, lng: longitude });

        const dist = haversineDistance(latitude, longitude, pickupCoords.lat, pickupCoords.lng);
        setDistanceKm(dist);

        if (mapInstanceRef.current) {
          const userPinHtml = `
            <div style="transform: translate(-50%, -100%);" class="relative flex flex-col items-center">
              <div style="background-color: #2563eb; width: 36px; height: 36px; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 10px rgba(37, 99, 235, 0.4); border: 2.5px solid white;">
                <div style="width: 10px; height: 10px; border-radius: 50%; background-color: white;"></div>
              </div>
            </div>
          `;

          const userMarkerIcon = L.divIcon({
            className: 'user-pin',
            html: userPinHtml,
            iconSize: [36, 42],
            iconAnchor: [18, 42]
          });

          L.marker([latitude, longitude], { icon: userMarkerIcon })
            .addTo(mapInstanceRef.current)
            .bindPopup(`<div style="font-weight: bold; font-size: 12px;">You are here (${dist} km away)</div>`);

          const bounds = L.latLngBounds(
            [pickupCoords.lat, pickupCoords.lng],
            [latitude, longitude]
          );
          mapInstanceRef.current.fitBounds(bounds, { padding: [50, 50] });
        }

        addToast(`Location matched! Store is ${dist} km from you.`, 'success');
      },
      (error) => {
        setIsLocating(false);
        let msg = 'Could not access your location.';
        if (error.code === error.PERMISSION_DENIED) {
          msg = 'Location permission was denied. Please allow location access in your browser settings.';
        }
        setLocationError(msg);
        addToast(msg, 'error');
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  const handleSimulatePickup = async () => {
    const result = await verifyOrderOtp(order.otp);
    if (result && result.success) {
      setSimulatedSuccess(true);
    }
  };

  const handleDownload = () => {
    addToast('Rescue pass & QR code saved to offline cache!', 'success');
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Top Back Navigation */}
      <div>
        <button
          onClick={() => onNavigate('/browse')}
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-600 hover:text-emerald-700 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to marketplace</span>
        </button>
      </div>

      {/* Multi-Order Switcher Bar */}
      {orders.length > 1 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          <span className="text-xs font-bold text-slate-400 whitespace-nowrap">Your Orders:</span>
          {orders.map((o) => {
            const isCurrent = o.id === order.id;
            const isOrderCompleted = o.status === 'Completed' || o.status === 'Picked Up' || o.status === 'Collected';
            return (
              <button
                key={o.id}
                onClick={() => onNavigate(`/order-confirmation/${o.id}`)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                  isCurrent
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                <span>#{o.id}</span>
                <span className={`text-[10px] px-1.5 py-0.5 rounded-md ${
                  isCurrent ? 'bg-emerald-700 text-white' : isOrderCompleted ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-900'
                }`}>
                  {isOrderCompleted ? '✓ Completed' : 'Pending Pickup'}
                </span>
              </button>
            );
          })}
        </div>
      )}

      {/* Main Digital Pass Card */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-card overflow-hidden">
        
        {/* Pass Header Banner */}
        <div className={`p-6 sm:p-8 text-white text-center transition-colors ${
          simulatedSuccess
            ? 'bg-gradient-to-r from-emerald-600 to-teal-700'
            : 'bg-gradient-to-r from-slate-900 via-slate-800 to-emerald-950'
        }`}>
          <div className="w-14 h-14 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center mx-auto mb-3 shadow-inner">
            <CheckCircle2 className="w-8 h-8 text-emerald-300" />
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 mb-2">
            <span>Payment Successful</span>
            <span>·</span>
            <span>{order.paymentStatus || 'Paid'}</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold font-display">
            {simulatedSuccess ? 'Meal Handover Confirmed!' : 'Order Confirmed & Pass Issued'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-1">
            Order Ref ID: <span className="font-mono font-black text-emerald-300 tracking-wider">#{order.id.toUpperCase()}</span>
          </p>
        </div>

        {/* Pass Core: QR Code + 4-digit PIN */}
        <div className="p-6 sm:p-8 space-y-6 text-center">
          
          {/* Status Badge */}
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Status: {simulatedSuccess ? 'Collected & Verified' : 'Ready for In-Store Pickup'}</span>
          </div>

          {/* Scannable Visual QR Code Box */}
          <div className="relative max-w-[200px] mx-auto p-4 bg-white rounded-2xl border-2 border-dashed border-emerald-500/40 shadow-soft">
            <svg className="w-full h-auto" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect width="100" height="100" fill="white" />
              <rect x="5" y="5" width="25" height="25" rx="3" fill="#064e3b" />
              <rect x="10" y="10" width="15" height="15" fill="white" />
              <rect x="13" y="13" width="9" height="9" fill="#059669" />

              <rect x="70" y="5" width="25" height="25" rx="3" fill="#064e3b" />
              <rect x="75" y="10" width="15" height="15" fill="white" />
              <rect x="78" y="13" width="9" height="9" fill="#059669" />

              <rect x="5" y="70" width="25" height="25" rx="3" fill="#064e3b" />
              <rect x="10" y="75" width="15" height="15" fill="white" />
              <rect x="13" y="78" width="9" height="9" fill="#059669" />

              <rect x="36" y="8" width="6" height="6" fill="#065f46" />
              <rect x="46" y="8" width="6" height="6" fill="#065f46" />
              <rect x="56" y="8" width="6" height="6" fill="#065f46" />
              <rect x="36" y="20" width="6" height="6" fill="#065f46" />
              <rect x="48" y="22" width="8" height="6" fill="#059669" />

              <rect x="8" y="40" width="6" height="6" fill="#065f46" />
              <rect x="20" y="40" width="6" height="6" fill="#065f46" />
              <rect x="35" y="38" width="10" height="10" fill="#047857" />
              <rect x="52" y="38" width="12" height="10" fill="#065f46" />
              <rect x="72" y="40" width="6" height="6" fill="#065f46" />
              <rect x="84" y="40" width="6" height="6" fill="#065f46" />

              <rect x="10" y="54" width="8" height="6" fill="#065f46" />
              <rect x="25" y="52" width="6" height="6" fill="#065f46" />
              <rect x="40" y="56" width="6" height="6" fill="#065f46" />
              <rect x="54" y="54" width="8" height="8" fill="#059669" />
              <rect x="70" y="54" width="6" height="6" fill="#065f46" />
              <rect x="82" y="54" width="8" height="6" fill="#065f46" />

              <rect x="36" y="74" width="6" height="6" fill="#065f46" />
              <rect x="48" y="72" width="6" height="6" fill="#065f46" />
              <rect x="62" y="76" width="6" height="6" fill="#065f46" />
              <rect x="78" y="74" width="6" height="6" fill="#065f46" />
              <rect x="42" y="86" width="12" height="6" fill="#065f46" />
              <rect x="60" y="86" width="6" height="6" fill="#065f46" />
              <rect x="75" y="86" width="8" height="6" fill="#059669" />
            </svg>
            <div className="text-[10px] text-slate-400 font-mono mt-2">
              Present to store counter
            </div>
          </div>

          {/* 4-digit OTP Code */}
          <div className="space-y-1">
            <span className="text-xs font-bold uppercase tracking-widest text-slate-400">
              One-Time Pickup PIN / OTP
            </span>
            <div className="flex items-center justify-center gap-3">
              {(order.otp || '4829').split('').map((digit, idx) => (
                <div
                  key={idx}
                  className="w-12 h-14 rounded-xl bg-slate-100 border-2 border-emerald-500/40 flex items-center justify-center text-2xl font-black text-slate-900 font-display shadow-inner"
                >
                  {digit}
                </div>
              ))}
            </div>
            <p className="text-xs text-slate-500 pt-1">
              Read out these 4 digits to store staff to verify receipt
            </p>
          </div>

          {/* Detailed Order Specifications Table */}
          <div className="text-left bg-slate-50 rounded-2xl p-5 border border-slate-200/80 space-y-3">
            <div className="flex items-start justify-between gap-2">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 block">
                  Food Item
                </span>
                <h3 className="font-black text-slate-900 text-sm mt-0.5">{order.title || order.foodItem}</h3>
                <div className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                  <Store className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>{order.seller || order.sellerName}</span>
                </div>
              </div>
              <span className="text-xs font-bold bg-white px-2.5 py-1 rounded-lg border border-slate-200">
                {order.portions} portion(s)
              </span>
            </div>

            <div className="pt-2 border-t border-slate-200/70 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="flex items-start gap-2">
                <Clock className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Pickup Time</span>
                  <span className="font-semibold text-slate-800">{order.pickupWindow}</span>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Pickup Location</span>
                  <span className="font-semibold text-slate-800">{order.address || order.pickupLocation}</span>
                </div>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-200/70 flex items-center justify-between text-xs">
              <div className="space-y-0.5">
                <span className="text-slate-500 block">Payment Method:</span>
                <span className="font-bold text-slate-700">{order.paymentMethod || 'Razorpay'}</span>
              </div>
              <div className="text-right">
                <span className="text-slate-500 block text-[11px]">Amount Paid:</span>
                <span className="font-black text-slate-900 text-base">
                  {(order.amountPaid ?? order.totalAmount) === 0 ? 'FREE' : `₹${order.amountPaid ?? order.totalAmount}`}
                </span>
              </div>
            </div>
          </div>

          {/* Interactive Pickup Location Map (Leaflet.js + OpenStreetMap) */}
          <div className="text-left space-y-3 pt-2">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Pickup Location on Map</span>
                </h3>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Leaflet.js with OpenStreetMap · Tap marker for directions
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleUseMyLocation}
                  disabled={isLocating}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold border border-emerald-200 transition-colors"
                >
                  <LocateFixed className="w-3.5 h-3.5 text-emerald-600" />
                  <span>{isLocating ? 'Locating...' : 'Use My Location'}</span>
                </button>

                <a
                  href={`https://www.google.com/maps/dir/?api=1&destination=${pickupCoords.lat},${pickupCoords.lng}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors"
                >
                  <span>Google Maps</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>

            {distanceKm !== null && (
              <div className="p-2.5 bg-emerald-50 rounded-xl border border-emerald-200 text-xs font-bold text-emerald-800 flex items-center gap-2">
                <Navigation className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>You are approximately <strong>{distanceKm} km</strong> away from this food pickup location.</span>
              </div>
            )}

            {locationError && (
              <div className="p-2.5 bg-rose-50 rounded-xl border border-rose-200 text-xs text-rose-700">
                {locationError}
              </div>
            )}

            {/* Map Canvas Container */}
            <div className="w-full h-64 sm:h-72 rounded-2xl overflow-hidden border border-slate-200 shadow-soft relative">
              <div ref={mapContainerRef} className="w-full h-full z-10" />
            </div>
          </div>

          {/* Interactive Store Handover Simulator Action */}
          {!simulatedSuccess ? (
            <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200/80 space-y-2 text-left">
              <div className="text-xs font-bold text-emerald-900">
                Demo Interactive Feature:
              </div>
              <p className="text-xs text-emerald-700">
                Simulate the merchant scanning this QR code or verifying the OTP:
              </p>
              <button
                onClick={handleSimulatePickup}
                className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm transition-all flex items-center justify-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Simulate In-Store Handover & Verify OTP</span>
              </button>
            </div>
          ) : (
            <div className="p-4 bg-emerald-100/60 rounded-2xl border border-emerald-300 text-xs font-semibold text-emerald-900 flex items-center justify-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              <span>Handover completed! Enjoy your fresh meal and thank you for reducing food waste.</span>
            </div>
          )}

          {/* Feedback System for Completed Orders */}
          <FeedbackForm
            order={{
              ...order,
              status: simulatedSuccess ? 'Picked Up' : order.status
            }}
          />

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              onClick={handleDownload}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200/80 text-slate-700 text-xs font-semibold transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Save Pass</span>
            </button>

            <button
              onClick={() => onNavigate('/impact')}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-semibold transition-colors border border-emerald-200"
            >
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              <span>View Your Impact</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
