import React, { useState, useEffect, useRef, useMemo } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { haversineDistance, INDIA_GEO_CONFIG, INDIAN_CITIES } from '../../utils/geoUtils';
import {
  MapPin,
  Clock,
  ShieldCheck,
  ArrowRight,
  Filter,
  Layers,
  LocateFixed,
  Search,
  X,
  Compass,
  Sparkles,
  ChevronDown,
  AlertCircle,
  Tag,
  CheckCircle2,
  Globe2,
  Navigation
} from 'lucide-react';

// Pan-India sample food rescues spanning major cities & regions
const PAN_INDIA_SAMPLE_RESCUES = [
  // Mumbai
  {
    id: 'rq-mum-01',
    title: 'Artisan Sourdough Loaves & Croissant Box',
    seller: 'Crust & Co. Bakery',
    city: 'mumbai',
    cityName: 'Mumbai',
    category: 'Bakery',
    portionsLeft: 4,
    originalPrice: 420,
    rescuePrice: 99,
    pickupWindow: '20:30 – 22:00 today',
    pickupStart: '20:30',
    pickupEnd: '22:00',
    address: 'Shop 4, Hill Road, Near Bandra Station, Mumbai 400050',
    coordinates: { lat: 19.0596, lng: 72.8295 },
    isExpiringSoon: true,
    description: 'Fresh surplus sourdough loaves and flaky butter croissants baked this morning.'
  },
  {
    id: 'rq-mum-02',
    title: 'North Indian Deluxe Thali (5 Meals)',
    seller: 'Spice Route Kitchen',
    city: 'mumbai',
    cityName: 'Mumbai',
    category: 'Restaurant',
    portionsLeft: 6,
    originalPrice: 300,
    rescuePrice: 69,
    pickupWindow: '21:00 – 22:30 today',
    pickupStart: '21:00',
    pickupEnd: '22:30',
    address: '14th Road, Off Linking Road, Khar West, Mumbai 400052',
    coordinates: { lat: 19.0680, lng: 72.8390 },
    isExpiringSoon: false,
    description: 'Paneer Makhani, Dal Tadka, Jeera Rice & 4 Tawa Phulkas prepared fresh for lunch/dinner.'
  },

  // Delhi NCR
  {
    id: 'rq-del-01',
    title: 'Daryaganj Style Butter Chicken & Naan Combo',
    seller: 'Moti Mahal Delights',
    city: 'delhi',
    cityName: 'Delhi NCR',
    category: 'Restaurant',
    portionsLeft: 5,
    originalPrice: 450,
    rescuePrice: 120,
    pickupWindow: '21:30 – 23:00 today',
    pickupStart: '21:30',
    pickupEnd: '23:00',
    address: 'Block M, Connaught Place, New Delhi 110001',
    coordinates: { lat: 28.6328, lng: 77.2197 },
    isExpiringSoon: true,
    description: 'Slow-cooked rich tomato gravy butter chicken with butter garlic naans.'
  },
  {
    id: 'rq-del-02',
    title: 'Amritsari Chole Bhature Box (with Pickled Chillies)',
    seller: 'Sitaram Sweets & Snacks',
    city: 'delhi',
    cityName: 'Delhi NCR',
    category: 'Restaurant',
    portionsLeft: 8,
    originalPrice: 220,
    rescuePrice: 50,
    pickupWindow: '19:00 – 21:00 today',
    pickupStart: '19:00',
    pickupEnd: '21:00',
    address: 'Paharganj Main Bazaar, New Delhi 110055',
    coordinates: { lat: 28.6415, lng: 77.2140 },
    isExpiringSoon: false,
    description: 'Tangy pindi chole with fluffy bhature and spiced aloo sabzi.'
  },

  // Bengaluru
  {
    id: 'rq-blr-01',
    title: 'Filter Coffee Flask & Ghee Podi Dosa Kit',
    seller: 'Vidhyarthi Bhavan Express',
    city: 'bengaluru',
    cityName: 'Bengaluru',
    category: 'Cafe',
    portionsLeft: 6,
    originalPrice: 280,
    rescuePrice: 65,
    pickupWindow: '18:00 – 20:30 today',
    pickupStart: '18:00',
    pickupEnd: '20:30',
    address: '100ft Road, Indiranagar, Bengaluru 560038',
    coordinates: { lat: 12.9784, lng: 77.6408 },
    isExpiringSoon: false,
    description: 'Crispy ghee roast dosas with gun powder podi, fresh coconut chutney & hot filter coffee.'
  },
  {
    id: 'rq-blr-02',
    title: 'Organic Salad Bowls & Sprouted Grain Boxes',
    seller: 'The Green Bowl Co.',
    city: 'bengaluru',
    cityName: 'Bengaluru',
    category: 'Groceries',
    portionsLeft: 10,
    originalPrice: 340,
    rescuePrice: 85,
    pickupWindow: '19:30 – 21:30 today',
    pickupStart: '19:30',
    pickupEnd: '21:30',
    address: 'Koramangala 4th Block, Bengaluru 560034',
    coordinates: { lat: 12.9345, lng: 77.6250 },
    isExpiringSoon: true,
    description: 'High-protein grain bowls with avocado, microgreens, and lemon vinaigrette.'
  },

  // Hyderabad
  {
    id: 'rq-hyd-01',
    title: 'Shahi Veg Dum Biryani Handi (with Mirchi Ka Salan)',
    seller: 'Bawarchi Nawabi Kitchen',
    city: 'hyderabad',
    cityName: 'Hyderabad',
    category: 'Restaurant',
    portionsLeft: 7,
    originalPrice: 380,
    rescuePrice: 90,
    pickupWindow: '21:00 – 23:00 today',
    pickupStart: '21:00',
    pickupEnd: '23:00',
    address: 'Road No. 12, Banjara Hills, Hyderabad 500034',
    coordinates: { lat: 17.4156, lng: 78.4350 },
    isExpiringSoon: true,
    description: 'Fragrant basmati rice layered with saffron, vegetables, and caramelized onions in sealed clay handi.'
  },

  // Pune
  {
    id: 'rq-pun-01',
    title: 'Spicy Kattha Misal Pav with Jowar Bhakri',
    seller: 'Katakirr Pune Kitchen',
    city: 'pune',
    cityName: 'Pune',
    category: 'Restaurant',
    portionsLeft: 4,
    originalPrice: 180,
    rescuePrice: 40,
    pickupWindow: '19:00 – 21:00 today',
    pickupStart: '19:00',
    pickupEnd: '21:00',
    address: 'FC Road, Deccan Gymkhana, Pune 411004',
    coordinates: { lat: 18.5196, lng: 73.8415 },
    isExpiringSoon: false,
    description: 'Authentic Kolhapuri style rassa misal with fresh farsan, chopped onions and soft pavs.'
  },

  // Kolkata
  {
    id: 'rq-kol-01',
    title: 'Park Street Kathi Roll Platter & Sweet Sandesh',
    seller: 'Kusum Rolls & Sweets',
    city: 'kolkata',
    cityName: 'Kolkata',
    category: 'Restaurant',
    portionsLeft: 9,
    originalPrice: 290,
    rescuePrice: 70,
    pickupWindow: '20:00 – 22:30 today',
    pickupStart: '20:00',
    pickupEnd: '22:30',
    address: 'Park Street, Near Flurys, Kolkata 700016',
    coordinates: { lat: 22.5510, lng: 88.3524 },
    isExpiringSoon: false,
    description: 'Crispy flaky paratha kathi rolls filled with paneer tikka, mint chutney and sweet nolen gur sandesh.'
  },

  // Chennai
  {
    id: 'rq-chn-01',
    title: 'Traditional South Indian Tiffin (Idli, Vada, Kesari)',
    seller: 'Saravana Bhavan Hub',
    city: 'chennai',
    cityName: 'Chennai',
    category: 'Restaurant',
    portionsLeft: 12,
    originalPrice: 240,
    rescuePrice: 50,
    pickupWindow: '19:00 – 21:30 today',
    pickupStart: '19:00',
    pickupEnd: '21:30',
    address: 'Pondy Bazaar, T. Nagar, Chennai 600017',
    coordinates: { lat: 13.0418, lng: 80.2342 },
    isExpiringSoon: true,
    description: 'Steaming soft mallipoo idlis, crispy medu vadas, piping hot drumstick sambar and pineapple kesari.'
  },

  // Jaipur
  {
    id: 'rq-jai-01',
    title: 'Rajasthani Dal Baati Churma Royal Thali',
    seller: 'Rawat Mishthan Bhandar',
    city: 'jaipur',
    cityName: 'Jaipur',
    category: 'Catering',
    portionsLeft: 8,
    originalPrice: 350,
    rescuePrice: 85,
    pickupWindow: '20:00 – 22:30 today',
    pickupStart: '20:00',
    pickupEnd: '22:30',
    address: 'Station Road, Sindhi Camp, Jaipur 302001',
    coordinates: { lat: 26.9216, lng: 75.7958 },
    isExpiringSoon: false,
    description: 'Oven-baked baatis dipped in pure desi ghee, served with panchmel dal and sweet jaggery churma.'
  }
];

export default function MapView({ rescues = [], onSelectRescue, selectedId = null }) {
  // Use pan-India sample data if external listings not provided or for demonstration
  const activeDataList = useMemo(() => {
    if (Array.isArray(rescues) && rescues.length > 0) {
      // Merge with coordinates if available
      return rescues.map(r => ({
        ...r,
        coordinates: r.coordinates || { lat: 19.0596, lng: 72.8295 }
      }));
    }
    return PAN_INDIA_SAMPLE_RESCUES;
  }, [rescues]);

  const [selectedCityId, setSelectedCityId] = useState('all-india');
  const [activePinId, setActivePinId] = useState(selectedId || activeDataList[0]?.id);
  const [selectedRadius, setSelectedRadius] = useState('All'); // 'All' | 2 | 5 | 10 | 20
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [priceFilter, setPriceFilter] = useState('All'); // 'All' | 'free' | 'under50' | 'under100' | 'under200'
  const [availabilityFilter, setAvailabilityFilter] = useState('All'); // 'All' | 'inStock' | 'expiring'
  const [showFiltersPanel, setShowFiltersPanel] = useState(false);

  const [userLocation, setUserLocation] = useState(null);
  const [isLocating, setIsLocating] = useState(false);
  const [locationError, setLocationError] = useState(null);

  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef({});
  const userMarkerRef = useRef(null);

  // Synchronize when selectedId prop updates
  useEffect(() => {
    if (selectedId) {
      setActivePinId(selectedId);
      if (markersRef.current[selectedId] && mapInstanceRef.current) {
        const marker = markersRef.current[selectedId];
        marker.openPopup();
        mapInstanceRef.current.panTo(marker.getLatLng(), { animate: true });
      }
    }
  }, [selectedId]);

  // Compute distances dynamically from user location or default Indian center
  const enrichedRescues = useMemo(() => {
    const baseLat = userLocation?.lat || 19.0596;
    const baseLng = userLocation?.lng || 72.8295;

    return activeDataList.map((rescue) => {
      const coords = rescue.coordinates || { lat: 19.0596, lng: 72.8295 };
      const calculatedDist = haversineDistance(baseLat, baseLng, coords.lat, coords.lng);
      return {
        ...rescue,
        calculatedDistance: calculatedDist,
        coordinates: coords
      };
    });
  }, [activeDataList, userLocation]);

  // Filter rescues by selected Indian city and other criteria
  const filteredRescues = useMemo(() => {
    return enrichedRescues.filter((rescue) => {
      // City Filter
      if (selectedCityId !== 'all-india') {
        const cityConfig = INDIAN_CITIES.find(c => c.id === selectedCityId);
        if (cityConfig) {
          // Check proximity to selected city center (within 60 km radius) or matching city tag
          const distToCity = haversineDistance(cityConfig.lat, cityConfig.lng, rescue.coordinates.lat, rescue.coordinates.lng);
          const matchesCityTag = rescue.city === selectedCityId || (rescue.address && rescue.address.toLowerCase().includes(cityConfig.name.toLowerCase()));
          if (distToCity > 60 && !matchesCityTag) return false;
        }
      }

      // Distance filter (from user or center)
      if (selectedRadius !== 'All') {
        const maxDist = Number(selectedRadius);
        if (rescue.calculatedDistance > maxDist) return false;
      }

      // Food type / Category filter
      if (categoryFilter !== 'All') {
        const cat = (rescue.category || '').toLowerCase();
        if (!cat.includes(categoryFilter.toLowerCase())) return false;
      }

      // Price filter
      const price = Number(rescue.rescuePrice) || 0;
      if (priceFilter === 'free' && price > 0) return false;
      if (priceFilter === 'under50' && price > 50) return false;
      if (priceFilter === 'under100' && price > 100) return false;
      if (priceFilter === 'under200' && price > 200) return false;

      // Availability filter
      const portions = Number(rescue.portionsLeft) || 0;
      if (availabilityFilter === 'inStock' && portions <= 0) return false;
      if (availabilityFilter === 'expiring' && !rescue.isExpiringSoon) return false;

      return true;
    });
  }, [enrichedRescues, selectedCityId, selectedRadius, categoryFilter, priceFilter, availabilityFilter]);

  const activeRescue = useMemo(() => {
    return enrichedRescues.find((r) => r.id === activePinId) || filteredRescues[0] || enrichedRescues[0];
  }, [enrichedRescues, filteredRescues, activePinId]);

  const getCategoryIcon = (category) => {
    const c = (category || '').toLowerCase();
    if (c.includes('bake')) return '🥐';
    if (c.includes('restaur') || c.includes('thali') || c.includes('biryani') || c.includes('chole')) return '🍛';
    if (c.includes('groc')) return '🥕';
    if (c.includes('cater') || c.includes('buffet') || c.includes('mess')) return '🍲';
    if (c.includes('cafe') || c.includes('coffee')) return '☕';
    return '🥗';
  };

  // 1. Initialize Map with India Geo Bounds
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }

    // Default: Centered on India overview
    const map = L.map(mapContainerRef.current, {
      center: [INDIA_GEO_CONFIG.center.lat, INDIA_GEO_CONFIG.center.lng],
      zoom: INDIA_GEO_CONFIG.zoom,
      minZoom: 4,
      zoomControl: false,
      attributionControl: false
    });

    // Custom positioned zoom controls
    L.control.zoom({ position: 'bottomright' }).addTo(map);

    // OpenStreetMap Clean Tile Layer with India coverage
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(map);

    mapInstanceRef.current = map;

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // 2. FlyTo Handler when City Changes
  const handleSelectCity = (cityId) => {
    setSelectedCityId(cityId);
    const city = INDIAN_CITIES.find(c => c.id === cityId);
    if (city && mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([city.lat, city.lng], city.zoom, {
        duration: 1.4,
        easeLinearity: 0.25
      });
    }
  };

  // 3. Render Food Markers across India
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    // Clear existing rescue markers
    Object.values(markersRef.current).forEach((m) => m.remove());
    markersRef.current = {};

    filteredRescues.forEach((rescue) => {
      const isSelected = rescue.id === activePinId;
      const iconEmoji = getCategoryIcon(rescue.category);
      const isFree = rescue.rescuePrice === 0;
      const priceText = isFree ? 'FREE' : `₹${rescue.rescuePrice}`;

      // Custom Leaflet Emerald Marker HTML with Indian branding
      const pinHtml = `
        <div style="transform: translate(-50%, -100%); cursor: pointer;" class="group transition-transform">
          <div style="position: relative; display: flex; flex-direction: column; align-items: center;">
            <div style="
              background-color: ${isSelected ? '#047857' : isFree ? '#2563eb' : '#059669'};
              width: ${isSelected ? '44px' : '38px'};
              height: ${isSelected ? '44px' : '38px'};
              border-radius: 12px;
              display: flex;
              align-items: center;
              justify-content: center;
              box-shadow: 0 6px 14px rgba(0,0,0,0.3);
              border: 2px solid white;
              transition: all 0.2s ease;
            ">
              <span style="font-size: ${isSelected ? '20px' : '17px'};">${iconEmoji}</span>
              ${rescue.isExpiringSoon ? '<span style="position: absolute; top: -3px; right: -3px; width: 10px; height: 10px; background-color: #f43f5e; border-radius: 50%; border: 2px solid white;"></span>' : ''}
            </div>

            <div style="
              margin-top: 3px;
              background-color: #0f172a;
              color: white;
              font-size: 10px;
              font-weight: 800;
              padding: 2px 6px;
              border-radius: 8px;
              white-space: nowrap;
              border: 1px solid #334155;
              box-shadow: 0 2px 6px rgba(0,0,0,0.3);
            ">
              ${priceText}
            </div>

            <div style="
              width: 0;
              height: 0;
              border-left: 5px solid transparent;
              border-right: 5px solid transparent;
              border-top: 5px solid #0f172a;
            "></div>
          </div>
        </div>
      `;

      const divIcon = L.divIcon({
        className: `resq-pin-${rescue.id}`,
        html: pinHtml,
        iconSize: [44, 60],
        iconAnchor: [22, 60],
        popupAnchor: [0, -60]
      });

      const marker = L.marker([rescue.coordinates.lat, rescue.coordinates.lng], { icon: divIcon }).addTo(map);

      // Interactive Leaflet Popup Content
      const popupDiv = document.createElement('div');
      popupDiv.className = 'p-1 font-sans text-slate-800';
      popupDiv.innerHTML = `
        <div style="font-family: inherit; min-width: 230px;">
          <div style="display: flex; align-items: center; justify-content: space-between; gap: 8px;">
            <span style="font-size: 10px; font-weight: 800; color: #059669; text-transform: uppercase; letter-spacing: 0.5px;">${rescue.category || 'Surplus'} · ${rescue.cityName || 'India'}</span>
            <span style="font-size: 10px; font-weight: 700; color: #64748b;">${rescue.calculatedDistance} km away</span>
          </div>

          <div style="font-size: 13px; font-weight: 800; color: #0f172a; margin-top: 3px; line-height: 1.3;">
            ${rescue.title}
          </div>

          <div style="font-size: 11px; color: #475569; margin-top: 2px;">
            📍 ${rescue.seller}
          </div>

          <div style="font-size: 11px; color: #64748b; margin-top: 4px; line-height: 1.3;">
            ${rescue.address}
          </div>

          <div style="display: flex; align-items: center; justify-content: space-between; margin-top: 8px; padding-top: 6px; border-top: 1px solid #e2e8f0;">
            <div>
              <div style="font-size: 14px; font-weight: 900; color: #059669;">
                ${isFree ? 'FREE' : `₹${rescue.rescuePrice}`}
                ${rescue.originalPrice > 0 ? `<span style="font-size: 10px; color: #94a3b8; text-decoration: line-through; margin-left: 4px; font-weight: normal;">₹${rescue.originalPrice}</span>` : ''}
              </div>
              <div style="font-size: 10px; color: #64748b;">
                ${rescue.portionsLeft} portion(s) available
              </div>
            </div>

            <button
              id="btn-view-details-${rescue.id}"
              style="
                background-color: #059669;
                color: white;
                border: none;
                border-radius: 8px;
                padding: 5px 10px;
                font-size: 11px;
                font-weight: 700;
                cursor: pointer;
              "
            >
              View Details →
            </button>
          </div>

          <div style="font-size: 10px; color: #059669; font-weight: 700; margin-top: 6px;">
            ⏰ Pickup: ${rescue.pickupWindow}
          </div>
        </div>
      `;

      marker.bindPopup(popupDiv);

      marker.on('click', () => {
        setActivePinId(rescue.id);
      });

      marker.on('popupopen', () => {
        const btn = document.getElementById(`btn-view-details-${rescue.id}`);
        if (btn && onSelectRescue) {
          btn.onclick = () => onSelectRescue(rescue.id);
        }
      });

      markersRef.current[rescue.id] = marker;
    });
  }, [filteredRescues, activePinId, onSelectRescue]);

  // 4. "Use My Location" Geolocation Handler
  const handleUseMyLocation = () => {
    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported by your browser.');
      return;
    }

    setIsLocating(true);
    setLocationError(null);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setIsLocating(false);
        const { latitude, longitude } = pos.coords;
        setUserLocation({ lat: latitude, lng: longitude });

        const map = mapInstanceRef.current;
        if (!map) return;

        if (userMarkerRef.current) {
          userMarkerRef.current.remove();
        }

        const userPinHtml = `
          <div style="position: relative; display: flex; align-items: center; justify-content: center;">
            <div style="position: absolute; width: 34px; height: 34px; border-radius: 50%; background-color: rgba(16, 185, 129, 0.35); animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
            <div style="width: 18px; height: 18px; border-radius: 50%; background-color: #059669; border: 3px solid white; box-shadow: 0 4px 10px rgba(5, 150, 105, 0.5);"></div>
          </div>
        `;

        const userIcon = L.divIcon({
          className: 'user-gps-pin',
          html: userPinHtml,
          iconSize: [34, 34],
          iconAnchor: [17, 17]
        });

        const userMarker = L.marker([latitude, longitude], { icon: userIcon }).addTo(map);
        userMarker.bindPopup('<div style="font-weight: 800; font-size: 12px; color: #059669;">📍 Your Location in India</div>').openPopup();
        userMarkerRef.current = userMarker;

        map.setView([latitude, longitude], 13, { animate: true });
      },
      (err) => {
        setIsLocating(false);
        let message = 'Could not access your location.';
        if (err.code === err.PERMISSION_DENIED) {
          message = 'Location access was denied. Please allow location permissions in your browser to find food closest to you in India.';
        } else if (err.code === err.POSITION_UNAVAILABLE) {
          message = 'Location information is currently unavailable.';
        } else if (err.code === err.TIMEOUT) {
          message = 'Location request timed out. Please try again.';
        }
        setLocationError(message);
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  return (
    <div className="relative w-full h-[640px] rounded-3xl overflow-hidden border border-slate-200 shadow-card bg-slate-900 select-none">
      
      {/* Real Leaflet.js Interactive Map Container with OpenStreetMap Tiles */}
      <div ref={mapContainerRef} className="w-full h-full z-0" />

      {/* Top Level Indian City Quick Switcher Bar */}
      <div className="absolute top-4 left-4 right-4 z-20 flex flex-col gap-2 pointer-events-none">
        
        {/* Row 1: Pan-India Quick City Pills */}
        <div className="pointer-events-auto flex items-center gap-1.5 bg-slate-900/90 backdrop-blur-md p-1.5 rounded-2xl border border-slate-700/80 shadow-lg overflow-x-auto scrollbar-none text-xs">
          <span className="text-emerald-400 font-extrabold px-2 flex items-center gap-1 shrink-0 text-[11px] uppercase tracking-wider">
            <Globe2 className="w-3.5 h-3.5" />
            <span>Map of India:</span>
          </span>

          {INDIAN_CITIES.map((city) => {
            const isSelected = selectedCityId === city.id;
            return (
              <button
                key={city.id}
                onClick={() => handleSelectCity(city.id)}
                className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-all flex items-center gap-1 shrink-0 text-xs ${
                  isSelected
                    ? 'bg-emerald-500 text-slate-950 shadow-md font-extrabold scale-105'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800'
                }`}
              >
                <span>{city.flag}</span>
                <span>{city.name}</span>
              </button>
            );
          })}
        </div>

        {/* Row 2: Secondary Controls (Radius + Locate Me + Filters) */}
        <div className="flex items-center justify-between gap-2">
          
          {/* Radius Selector */}
          <div className="pointer-events-auto flex items-center gap-1 bg-slate-900/90 backdrop-blur-md p-1 rounded-xl border border-slate-700/80 shadow-md text-xs">
            <span className="text-slate-400 font-bold px-2 flex items-center gap-1 text-[11px]">
              <Compass className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden sm:inline">Radius:</span>
            </span>
            {['All', '5', '10', '25'].map((r) => (
              <button
                key={r}
                onClick={() => setSelectedRadius(r)}
                className={`px-2 py-0.5 rounded-lg font-bold text-xs transition-all ${
                  selectedRadius === r
                    ? 'bg-emerald-500 text-slate-950 shadow-sm'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800'
                }`}
              >
                {r === 'All' ? 'All' : `${r}km`}
              </button>
            ))}
          </div>

          {/* Right Action Buttons */}
          <div className="pointer-events-auto flex items-center gap-2">
            <button
              onClick={handleUseMyLocation}
              disabled={isLocating}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 backdrop-blur-md border border-slate-700/80 text-emerald-300 text-xs font-bold shadow-md transition-all"
            >
              <LocateFixed className={`w-3.5 h-3.5 ${isLocating ? 'animate-spin text-emerald-400' : ''}`} />
              <span>{isLocating ? 'Locating...' : 'Use My Location'}</span>
            </button>

            <button
              onClick={() => setShowFiltersPanel(!showFiltersPanel)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl backdrop-blur-md border text-xs font-bold shadow-md transition-all ${
                showFiltersPanel
                  ? 'bg-emerald-500 text-slate-950 border-emerald-400'
                  : 'bg-slate-900/90 hover:bg-slate-800 text-slate-200 border-slate-700/80'
              }`}
            >
              <Filter className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Filters</span>
              <ChevronDown className={`w-3 h-3 transition-transform ${showFiltersPanel ? 'rotate-180' : ''}`} />
            </button>
          </div>
        </div>
      </div>

      {/* Expandable Advanced Filter Panel Overlay */}
      {showFiltersPanel && (
        <div className="absolute top-28 left-4 right-4 sm:left-auto sm:right-4 sm:w-80 z-30 bg-slate-900/95 backdrop-blur-md p-4 rounded-2xl border border-slate-700 shadow-2xl text-xs space-y-3.5 text-slate-200 animate-slide-up">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <span className="font-extrabold uppercase tracking-wider text-[10px] text-emerald-400 flex items-center gap-1">
              <Filter className="w-3 h-3" />
              Pan-India Map Filters
            </span>
            <button
              onClick={() => setShowFiltersPanel(false)}
              className="text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Category Filter */}
          <div className="space-y-1.5">
            <label className="text-slate-400 font-bold text-[10px] uppercase">Food Category</label>
            <div className="flex flex-wrap gap-1.5">
              {['All', 'Bakery', 'Restaurant', 'Groceries', 'Catering', 'Cafe'].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setCategoryFilter(cat)}
                  className={`px-2.5 py-1 rounded-xl text-[11px] font-semibold transition-all ${
                    categoryFilter === cat
                      ? 'bg-emerald-500 text-slate-950 font-bold'
                      : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Price Filter */}
          <div className="space-y-1.5">
            <label className="text-slate-400 font-bold text-[10px] uppercase">Price Range</label>
            <div className="grid grid-cols-2 gap-1.5">
              {[
                { id: 'All', label: 'All Prices' },
                { id: 'free', label: 'FREE (Donations)' },
                { id: 'under50', label: 'Under ₹50' },
                { id: 'under100', label: 'Under ₹100' }
              ].map((p) => (
                <button
                  key={p.id}
                  onClick={() => setPriceFilter(p.id)}
                  className={`px-2.5 py-1 rounded-xl text-[11px] font-semibold transition-all text-left truncate ${
                    priceFilter === p.id
                      ? 'bg-emerald-500 text-slate-950 font-bold'
                      : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Availability Filter */}
          <div className="space-y-1.5">
            <label className="text-slate-400 font-bold text-[10px] uppercase">Availability</label>
            <div className="flex gap-1.5">
              {[
                { id: 'All', label: 'All' },
                { id: 'inStock', label: 'In Stock' },
                { id: 'expiring', label: 'Expiring Soon' }
              ].map((av) => (
                <button
                  key={av.id}
                  onClick={() => setAvailabilityFilter(av.id)}
                  className={`flex-1 py-1 px-2 rounded-xl text-[11px] font-semibold transition-all text-center ${
                    availabilityFilter === av.id
                      ? 'bg-emerald-500 text-slate-950 font-bold'
                      : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  {av.label}
                </button>
              ))}
            </div>
          </div>

          {/* Reset Filters */}
          <div className="pt-2 border-t border-slate-800 flex justify-between items-center text-[11px]">
            <span className="text-slate-400">{filteredRescues.length} locations active</span>
            <button
              onClick={() => {
                setSelectedCityId('all-india');
                setSelectedRadius('All');
                setCategoryFilter('All');
                setPriceFilter('All');
                setAvailabilityFilter('All');
                handleSelectCity('all-india');
              }}
              className="text-emerald-400 hover:underline font-bold"
            >
              Reset to All India
            </button>
          </div>
        </div>
      )}

      {/* Geolocation Error Toast Alert */}
      {locationError && (
        <div className="absolute top-28 left-4 right-4 sm:left-4 sm:right-auto sm:max-w-md z-30 bg-rose-950/90 backdrop-blur-md border border-rose-500/50 text-white p-3 rounded-2xl shadow-xl flex items-start gap-2.5 animate-slide-up">
          <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
          <div className="text-xs flex-1">
            <span className="font-bold block text-rose-200">Location Access Notice</span>
            <span className="text-rose-300/90 text-[11px]">{locationError}</span>
          </div>
          <button
            onClick={() => setLocationError(null)}
            className="text-rose-400 hover:text-rose-200"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Bottom Floating Card: Active Rescue Preview */}
      {activeRescue && (
        <div className="absolute bottom-4 left-4 right-4 sm:left-auto sm:right-4 sm:w-96 z-20 bg-white/95 backdrop-blur-md rounded-2xl p-4 shadow-card border border-slate-200 animate-slide-up">
          <div className="flex items-start justify-between gap-2 mb-2">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200/50">
                  {activeRescue.cityName || 'India'} · {activeRescue.calculatedDistance} km
                </span>
                <span className="text-xs text-slate-500 font-semibold truncate max-w-[150px]">
                  {activeRescue.seller}
                </span>
              </div>
              <h4 className="font-extrabold text-slate-900 text-sm mt-1 line-clamp-1">
                {activeRescue.title}
              </h4>
            </div>
            <button
              onClick={() => setActivePinId(null)}
              className="text-slate-400 hover:text-slate-600 p-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <p className="text-xs text-slate-600 line-clamp-2 mb-2.5">
            {activeRescue.description}
          </p>

          <div className="text-[11px] text-slate-500 flex items-center gap-1.5 mb-3 bg-slate-50 p-2 rounded-xl border border-slate-100">
            <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span className="truncate">{activeRescue.address}</span>
          </div>

          <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-100">
            <div>
              <div className="text-base font-black text-slate-900">
                {activeRescue.rescuePrice === 0 ? 'FREE' : `₹${activeRescue.rescuePrice}`}
                {activeRescue.originalPrice > 0 && (
                  <span className="text-xs text-slate-400 font-normal line-through ml-1.5">
                    ₹${activeRescue.originalPrice}
                  </span>
                )}
              </div>
              <div className="text-[10px] text-slate-500 flex items-center gap-1 mt-0.5">
                <Clock className="w-3 h-3 text-emerald-600" />
                <span>Pickup: {activeRescue.pickupWindow}</span>
              </div>
            </div>

            <button
              onClick={() => onSelectRescue && onSelectRescue(activeRescue.id)}
              className="inline-flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-sm transition-all"
            >
              <span>View Details</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
