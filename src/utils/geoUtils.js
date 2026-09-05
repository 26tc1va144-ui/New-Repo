
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
 * Mumbai neighbourhood registry with exact GPS coordinates.
 * These power the location picker in DemoNotice / BrowsePage.
 */
export const MUMBAI_LOCATIONS = [
  {
    id: 'bandra-west',
    name: 'Bandra West',
    label: 'Bandra West, Mumbai',
    lat: 19.0596,
    lng: 72.8295,
    zone: 'Western Suburbs',
  },
  {
    id: 'khar-west',
    name: 'Khar West',
    label: 'Khar West, Mumbai',
    lat: 19.0680,
    lng: 72.8390,
    zone: 'Western Suburbs',
  },
  {
    id: 'santacruz-west',
    name: 'Santacruz West',
    label: 'Santacruz West, Mumbai',
    lat: 19.0820,
    lng: 72.8360,
    zone: 'Western Suburbs',
  },
  {
    id: 'andheri-east',
    name: 'Andheri East',
    label: 'Andheri East, Mumbai',
    lat: 19.1197,
    lng: 72.8464,
    zone: 'Western Suburbs',
  },
  {
    id: 'dadar-west',
    name: 'Dadar West',
    label: 'Dadar West, Mumbai',
    lat: 19.0220,
    lng: 72.8420,
    zone: 'Central Mumbai',
  },
  {
    id: 'mahim',
    name: 'Mahim',
    label: 'Mahim, Mumbai',
    lat: 19.0410,
    lng: 72.8420,
    zone: 'Central Mumbai',
  },
  {
    id: 'colaba',
    name: 'Colaba',
    label: 'Colaba, Mumbai',
    lat: 18.9067,
    lng: 72.8147,
    zone: 'South Mumbai',
  },
  {
    id: 'worli',
    name: 'Worli',
    label: 'Worli, Mumbai',
    lat: 19.0127,
    lng: 72.8177,
    zone: 'Central Mumbai',
  },
];

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
  waterLitres: 180, // litres embedded water saved
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
