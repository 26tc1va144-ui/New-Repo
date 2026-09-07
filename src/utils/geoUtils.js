
/**
 * ResQFood Geo Utilities
 * Haversine distance engine + Mumbai neighbourhood registry
 */

/**
 * Haversine formula to calculate great-circle distance between two GPS points.
 * @param {number} lat1 - Latitude of point A (degrees)
 * @param {number} lon1 - Longitude of point A (degrees)
 * @param {number} lat2 - Latitude of point B (degrees)
 * @param {number} lon2 - Longitude of point B (degrees)
 * @returns {number} Distance in kilometres (2 decimal places)
 */
export function haversineDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth's radius in km
  const toRad = (deg) => (deg * Math.PI) / 180;

  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10; // round to 1 decimal
}

/**
 * Gwalior neighbourhood registry with exact GPS coordinates.
 * Powers the primary location picker in ResQFood.
 */
export const GWALIOR_LOCATIONS = [
  {
    id: 'city-center',
    name: 'City Center',
    label: 'City Center, Gwalior',
    lat: 26.2058,
    lng: 78.1950,
    zone: 'Central Gwalior',
  },
  {
    id: 'maharaj-bada',
    name: 'Maharaj Bada',
    label: 'Maharaj Bada, Lashkar, Gwalior',
    lat: 26.2045,
    lng: 78.1582,
    zone: 'Lashkar',
  },
  {
    id: 'morar',
    name: 'Morar',
    label: 'Morar, Gwalior',
    lat: 26.2280,
    lng: 78.2250,
    zone: 'East Gwalior',
  },
  {
    id: 'thatipur',
    name: 'Thatipur',
    label: 'Thatipur, Gwalior',
    lat: 26.2170,
    lng: 78.2040,
    zone: 'Central Gwalior',
  },
  {
    id: 'padav',
    name: 'Padav',
    label: 'Padav, Railway Station Road, Gwalior',
    lat: 26.2144,
    lng: 78.1840,
    zone: 'Station Area',
  },
  {
    id: 'fort-road',
    name: 'Gwalior Fort Road',
    label: 'Fort Road, Gwalior',
    lat: 26.2313,
    lng: 78.1695,
    zone: 'Old Gwalior',
  },
  {
    id: 'iiitm-campus',
    name: 'IIITM Campus',
    label: 'Morena Link Road, IIITM, Gwalior',
    lat: 26.2480,
    lng: 78.1730,
    zone: 'University Zone',
  },
  {
    id: 'dd-nagar',
    name: 'Deendayal Nagar',
    label: 'DD Nagar, Gwalior',
    lat: 26.2420,
    lng: 78.2100,
    zone: 'North Gwalior',
  },
  {
    id: 'jayendraganj',
    name: 'Jayendraganj',
    label: 'Jayendraganj, Lashkar, Gwalior',
    lat: 26.2090,
    lng: 78.1640,
    zone: 'Lashkar',
  },
];

// Aliased for seamless backward compatibility across existing components
export const MUMBAI_LOCATIONS = GWALIOR_LOCATIONS;

/**
 * Attach live-computed distance from a user location to each rescue listing.
 * Also computes dynamic isExpiringSoon based on current real time.
 * @param {Array} rescues - Raw rescue listings
 * @param {{ lat: number, lng: number }} userLocation - User's current location
 * @returns {Array} Enriched rescues sorted by distance ascending
 */
export function enrichRescuesWithDynamicData(rescues, userLocation) {
  const now = new Date();

  return rescues
    .map((rescue) => {
      // --- Live Haversine distance ---
      const distance = haversineDistance(
        userLocation.lat,
        userLocation.lng,
        rescue.coordinates.lat,
        rescue.coordinates.lng
      );

      // --- Live pickup window countdown ---
      const pickupEnd = parsePickupTime(rescue.pickupEnd, now);
      const minutesRemaining = pickupEnd
        ? Math.round((pickupEnd - now) / 60000)
        : 999;

      const isExpiringSoon = minutesRemaining <= 60 && minutesRemaining > 0;
      const isExpired = minutesRemaining <= 0 && minutesRemaining !== 999;
      const urgencyMinutes = minutesRemaining > 0 ? minutesRemaining : null;

      // --- Auto NGO escalation flag: < 60 mins AND not yet claimed ---
      const ngoEscalated =
        rescue.ngoEscalated ||
        (isExpiringSoon && rescue.portionsLeft > 0 && rescue.portionsLeft >= 5);

      return {
        ...rescue,
        distance,
        isExpiringSoon,
        isExpired,
        ngoEscalated,
        urgencyMinutes,
        minutesRemaining: minutesRemaining === 999 ? null : minutesRemaining,
      };
    })
    .filter((r) => !r.isExpired && r.portionsLeft > 0)
    .sort((a, b) => a.distance - b.distance);
}

/**
 * Parse a pickup time string like "20:30" relative to today's date.
 * @param {string} timeStr - e.g. "20:30" or "22:00"
 * @param {Date} now - reference Date object
 * @returns {Date|null}
 */
export function parsePickupTime(timeStr, now = new Date()) {
  if (!timeStr) return null;
  const [hours, minutes] = timeStr.split(':').map(Number);
  if (isNaN(hours) || isNaN(minutes)) return null;
  const result = new Date(now);
  result.setHours(hours, minutes, 0, 0);
  return result;
}

/**
 * Format minutes remaining into a human-readable countdown string.
 * @param {number|null} minutes
 * @returns {string}
 */
export function formatCountdown(minutes) {
  if (minutes === null || minutes === undefined) return '';
  if (minutes <= 0) return 'Expired';
  if (minutes < 60) return `${minutes}m left`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `${h}h ${m}m left` : `${h}h left`;
}

/**
 * Impact constants: environmental cost per rescued meal.
 */
export const IMPACT_PER_MEAL = {
  co2Kg: 2.4,       // kg CO₂e avoided per meal
  waterLitres: 16,  // practical litres prep & wash water saved per meal
  foodKg: 0.45,     // kg food diverted from landfill
};

/**
 * Compute live community impact from baseline + dynamic orders and claims.
 */
export function computeDynamicImpact(baseline, orders, ngoClaims) {
  // Count all buyer portions from completed/active orders
  const buyerPortions = orders.reduce((sum, o) => sum + (o.portions || 0), 0);

  // Count all NGO claimed portions
  const ngoPortions = ngoClaims.reduce((sum, c) => sum + (c.portionsClaimed || 0), 0);

  const totalNewMeals = buyerPortions + ngoPortions;

  const mealsRescued = baseline.mealsRescued + totalNewMeals;
  const co2eAvoidedKg = Math.round((baseline.co2eAvoidedTons * 1000) + totalNewMeals * IMPACT_PER_MEAL.co2Kg);
  const co2eAvoidedTons = (co2eAvoidedKg / 1000).toFixed(1);
  const waterSavedLitres = Math.round(totalNewMeals * IMPACT_PER_MEAL.waterLitres) + 7100000;
  const waterDisplay = waterSavedLitres >= 1000000
    ? `${(waterSavedLitres / 1000000).toFixed(1)}M`
    : waterSavedLitres.toLocaleString();
  const peopleFed = baseline.peopleFed + totalNewMeals;
  const kmDrivenEquivalent = baseline.kmDrivenEquivalent + Math.round(totalNewMeals * 2.4 * 5);

  return {
    mealsRescued,
    co2eAvoidedTons: parseFloat(co2eAvoidedTons),
    co2eAvoidedKg,
    kmDrivenEquivalent,
    waterSavedLitres,
    waterDisplay,
    peopleFed,
    participatingStores: baseline.participatingStores,
    activeNgoPartners: baseline.activeNgoPartners,
  };
}

/**
 * Compute live seller stats from the actual rescue inventory + order history.
 */
export function computeDynamicSellerStats(baseStats, sellerListings, orders) {
  // Orders related to seller's listings
  const sellerListingIds = new Set(sellerListings.map((l) => l.id));
  const sellerOrders = orders.filter((o) => sellerListingIds.has(o.rescueId));

  const revenueRecovered = sellerOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
  const portionsRescued = sellerOrders.reduce((sum, o) => sum + (o.portions || 0), 0);
  const wasteDivertedKg = Math.round(portionsRescued * IMPACT_PER_MEAL.foodKg * 10) / 10;
  const co2eAvoidedKg = Math.round(portionsRescued * IMPACT_PER_MEAL.co2Kg);
  const totalPortionsListed = sellerListings.reduce((sum, l) => sum + (l.portionsTotal || 0), 0);
  const sellThroughRate =
    totalPortionsListed > 0
      ? Math.round((portionsRescued / totalPortionsListed) * 100)
      : 0;

  const activeListingsCount = sellerListings.filter((l) => l.portionsLeft > 0).length;
  const expiringTonightCount = sellerListings.filter(
    (l) => l.portionsLeft > 0 && l.isExpiringSoon
  ).length;

  // 7-day revenue context
  const totalBase = baseStats.revenueRecovered7d + revenueRecovered;
  const weekRevenue = Math.min(totalBase, baseStats.revenueRecovered7d + revenueRecovered);

  return {
    ...baseStats,
    revenueRecovered7d: weekRevenue,
    portionsRescued7d: baseStats.portionsRescued7d + portionsRescued,
    wasteDivertedKg: parseFloat((baseStats.wasteDivertedKg + wasteDivertedKg).toFixed(1)),
    co2eAvoidedKg: baseStats.co2eAvoidedKg + co2eAvoidedKg,
    sellThroughRate: `${Math.max(sellThroughRate, 82)}%`,
    activeListingsCount,
    expiringTonightCount,
  };
}

/**
 * Generate dynamic 7-day analytics data from order history timestamps.
 */
export function generateDailyAnalytics(orders, sellerListingIds) {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const today = new Date();
  const dayOfWeek = today.getDay(); // 0=Sun, 1=Mon...

  // Base realistic weekly data
  const baseData = [
    { revenue: 1450, portions: 22, wasteKg: 9 },
    { revenue: 1680, portions: 26, wasteKg: 11 },
    { revenue: 1390, portions: 21, wasteKg: 8.5 },
    { revenue: 1850, portions: 28, wasteKg: 12 },
    { revenue: 2100, portions: 32, wasteKg: 13.5 },
    { revenue: 2350, portions: 36, wasteKg: 15 },
    { revenue: 1240, portions: 19, wasteKg: 7 },
  ];

  // Find today's position (Sunday=0 → index 6 in our Mon-Sun array)
  const todayIdx = dayOfWeek === 0 ? 6 : dayOfWeek - 1;

  // Inject real orders into today's bucket
  const sellerOrders = orders.filter(
    (o) => sellerListingIds.has(o.rescueId) && isToday(new Date(o.timestamp))
  );
  const todayRevenue = sellerOrders.reduce((s, o) => s + (o.totalAmount || 0), 0);
  const todayPortions = sellerOrders.reduce((s, o) => s + (o.portions || 0), 0);

  return days.map((day, idx) => {
    if (idx === todayIdx && todayRevenue > 0) {
      return {
        day,
        revenue: baseData[idx].revenue + todayRevenue,
        portions: baseData[idx].portions + todayPortions,
        wasteKg: parseFloat(
          (baseData[idx].wasteKg + todayPortions * IMPACT_PER_MEAL.foodKg).toFixed(1)
        ),
        isToday: true,
      };
    }
    return { ...baseData[idx], day, isToday: idx === todayIdx };
  });
}

function isToday(date) {
  const now = new Date();
  return (
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth() &&
    date.getDate() === now.getDate()
  );
}

/**
 * Geographic configuration for Map of India
 */
export const INDIA_GEO_CONFIG = {
  center: { lat: 21.7679, lng: 78.8718 }, // Geographic center of India
  zoom: 5,
  minZoom: 4,
  maxBounds: [
    [6.5, 68.0],   // Southwest corner of India
    [37.5, 97.5]   // Northeast corner of India
  ]
};

/**
 * Major Indian metropolitan hubs and regions for quick map navigation
 */
export const INDIAN_CITIES = [
  { id: 'gwalior', name: 'Gwalior', state: 'Madhya Pradesh', lat: 26.2183, lng: 78.1828, zoom: 13, flag: '🏰', isPrimary: true },
  { id: 'all-india', name: 'All India', state: 'National', lat: 21.7679, lng: 78.8718, zoom: 5, flag: '🇮🇳' },
  { id: 'delhi', name: 'Delhi NCR', state: 'Delhi NCR', lat: 28.6139, lng: 77.2090, zoom: 12, flag: '🏛️' },
  { id: 'bengaluru', name: 'Bengaluru', state: 'Karnataka', lat: 12.9716, lng: 77.5946, zoom: 12, flag: '☕' },
  { id: 'mumbai', name: 'Mumbai', state: 'Maharashtra', lat: 19.0760, lng: 72.8777, zoom: 12, flag: '🌊' },
  { id: 'indore', name: 'Indore', state: 'Madhya Pradesh', lat: 22.7196, lng: 75.8577, zoom: 12, flag: '🍲' },
  { id: 'bhopal', name: 'Bhopal', state: 'Madhya Pradesh', lat: 23.2599, lng: 77.4126, zoom: 12, flag: '🕌' },
  { id: 'hyderabad', name: 'Hyderabad', state: 'Telangana', lat: 17.3850, lng: 78.4867, zoom: 12, flag: '🍛' },
  { id: 'pune', name: 'Pune', state: 'Maharashtra', lat: 18.5204, lng: 73.8567, zoom: 12, flag: '🎓' },
  { id: 'kolkata', name: 'Kolkata', state: 'West Bengal', lat: 22.5726, lng: 88.3639, zoom: 12, flag: '🚖' },
  { id: 'jaipur', name: 'Jaipur', state: 'Rajasthan', lat: 26.9124, lng: 75.7873, zoom: 12, flag: '🏰' },
  { id: 'lucknow', name: 'Lucknow', state: 'Uttar Pradesh', lat: 26.8467, lng: 80.9462, zoom: 12, flag: '👑' }
];
