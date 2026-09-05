import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import {
  authApi,
  listingsApi,
  ordersApi,
  donationsApi,
  notificationsApi,
  analyticsApi
} from '../services/api';
import {
  enrichRescuesWithDynamicData,
  MUMBAI_LOCATIONS
} from '../utils/geoUtils';

const AppContext = createContext();

export function AppProvider({ children }) {
  // Current authenticated user (defaults to Rahul Sharma demo so website is immediately functional)
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const saved = localStorage.getItem('resq_auth_user');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return {
      id: 'usr-buyer-demo',
      name: 'Rahul Sharma',
      email: 'rahul.s@resqfood.org',
      role: 'buyer',
      avatar: 'RS',
      location: 'Bandra West, Mumbai'
    };
  });

  // Active role: 'buyer' | 'seller' | 'ngo' | 'admin'
  const [currentRole, setCurrentRole] = useState(() => {
    return localStorage.getItem('resq_role') || 'buyer';
  });

  // Simulated GPS Location
  const [simulatedLocation, setSimulatedLocation] = useState({
    name: 'Bandra West, Mumbai',
    city: 'Mumbai',
    lat: 19.0596,
    lng: 72.8295,
  });

  // Live Database Collections
  const [rescues, setRescues] = useState([]);
  const [orders, setOrders] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [ngoClaims, setNgoClaims] = useState([]);
  const [sellerStats, setSellerStats] = useState(null);
  const [communityImpact, setCommunityImpact] = useState(null);
  const [adminStats, setAdminStats] = useState(null);

  // Status & Notifications
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [toasts, setToasts] = useState([]);

  // Toast alert system
  const addToast = (message, type = 'success') => {
    const id = Date.now().toString() + Math.random().toString().slice(2, 5);
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4500);
  };

  const removeToast = (id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  // Sync session & role to local storage
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('resq_auth_user', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('resq_auth_user');
      localStorage.removeItem('resq_auth_token');
    }
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem('resq_role', currentRole);
  }, [currentRole]);

  // Normalize listing fields for backwards compatibility with UI components
  const normalizeListing = (item) => ({
    ...item,
    seller: item.sellerName || item.seller || 'Crust & Co. Bakery',
    sellerType: item.sellerType || item.category || 'Bakery',
    distance: item.distance || 1.2
  });

  // Fetch all primary datasets from the live API
  const fetchAllData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const [listingsRes, impactRes] = await Promise.all([
        listingsApi.getAll().catch(() => []),
        analyticsApi.getImpact().catch(() => null)
      ]);

      const normalizedListings = (listingsRes || []).map(normalizeListing);
      setRescues(normalizedListings);

      if (impactRes) {
        setCommunityImpact(impactRes);
      }

      // If user is signed in, fetch user-specific data
      if (currentUser?.id) {
        const [notifsRes, userOrdersRes] = await Promise.all([
          notificationsApi.getAll(currentUser.id).catch(() => []),
          currentUser.role === 'seller'
            ? ordersApi.getBySeller(currentUser.id).catch(() => [])
            : ordersApi.getByBuyer(currentUser.id).catch(() => [])
        ]);

        setNotifications(notifsRes || []);
        setOrders(userOrdersRes || []);

        if (currentUser.role === 'seller') {
          const statsRes = await analyticsApi.getSeller(currentUser.id).catch(() => null);
          if (statsRes) setSellerStats(statsRes);
        }
      } else {
        // Fetch general demo/initial orders if unauthenticated
        const generalOrders = await ordersApi.getByBuyer('usr-buyer-demo').catch(() => []);
        setOrders(generalOrders || []);
        const generalNotifs = await notificationsApi.getAll('all').catch(() => []);
        setNotifications(generalNotifs || []);
      }

      // Fetch NGO claims & seller analytics
      const claimsRes = await donationsApi.getByNgo('all').catch(() => []);
      setNgoClaims(claimsRes || []);

      const defaultSellerStats = await analyticsApi.getSeller('usr-seller-demo').catch(() => null);
      if (defaultSellerStats) {
        setSellerStats(defaultSellerStats);
      }

    } catch (err) {
      console.error('Failed to fetch data from API:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [currentUser]);

  // Initial load
  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  // Server-Sent Events (SSE) Real-Time Synchronization Listener
  useEffect(() => {
    let eventSource = null;

    try {
      eventSource = new EventSource('/api/realtime/stream');

      eventSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);

          switch (data.type) {
            case 'LISTING_CREATED': {
              const newListing = normalizeListing(data.payload.listing);
              setRescues(prev => [newListing, ...prev.filter(l => l.id !== newListing.id)]);
              break;
            }
            case 'LISTING_UPDATED': {
              const updatedListing = normalizeListing(data.payload.listing);
              setRescues(prev => prev.map(l => l.id === updatedListing.id ? updatedListing : l));
              break;
            }
            case 'LISTING_CANCELLED': {
              setRescues(prev => prev.map(l => l.id === data.payload.id ? { ...l, status: 'Cancelled' } : l));
              break;
            }
            case 'ORDER_CREATED': {
              const { order, updatedListing } = data.payload;
              if (updatedListing) {
                const norm = normalizeListing(updatedListing);
                setRescues(prev => prev.map(l => l.id === norm.id ? norm : l));
              }
              if (order) {
                setOrders(prev => [order, ...prev.filter(o => o.id !== order.id)]);
              }
              // Refresh impact and seller stats
              analyticsApi.getImpact().then(res => res && setCommunityImpact(res)).catch(() => {});
              analyticsApi.getSeller('usr-seller-demo').then(res => res && setSellerStats(res)).catch(() => {});
              break;
            }
            case 'ORDER_COMPLETED': {
              const { order } = data.payload;
              if (order) {
                setOrders(prev => prev.map(o => o.id === order.id ? order : o));
              }
              analyticsApi.getSeller('usr-seller-demo').then(res => res && setSellerStats(res)).catch(() => {});
              analyticsApi.getImpact().then(res => res && setCommunityImpact(res)).catch(() => {});
              break;
            }
            case 'DONATION_CLAIMED': {
              const { claim, updatedListing } = data.payload;
              if (updatedListing) {
                const norm = normalizeListing(updatedListing);
                setRescues(prev => prev.map(l => l.id === norm.id ? norm : l));
              }
              if (claim) {
                setNgoClaims(prev => [claim, ...prev.filter(c => c.id !== claim.id)]);
              }
              analyticsApi.getImpact().then(res => res && setCommunityImpact(res)).catch(() => {});
              break;
            }
            case 'NOTIFICATION_CREATED': {
              const { notification } = data.payload;
              if (notification) {
                setNotifications(prev => [notification, ...prev.filter(n => n.id !== notification.id)]);
              }
              break;
            }
            default:
              break;
          }
        } catch (parseErr) {
          // Heartbeat or comment
        }
      };

      eventSource.onerror = () => {
        // SSE auto-reconnects natively
      };
    } catch (sseErr) {
      console.warn('Real-time SSE not available in current environment:', sseErr);
    }

    return () => {
      if (eventSource) {
        eventSource.close();
      }
    };
  }, []);

  // --- Auth Actions ---
  const login = async (credentials) => {
    const role = credentials.role || 'buyer';
    const activeUser = {
      id: credentials.id || `usr-${Date.now().toString().slice(-4)}`,
      name: credentials.name || (role === 'seller' ? 'Crust & Co. Bakery' : role === 'ngo' ? 'Roti Bank Mumbai' : 'Rahul Sharma'),
      email: credentials.email || 'rahul.s@resqfood.org',
      role,
      avatar: (credentials.name || (role === 'seller' ? 'CC' : role === 'ngo' ? 'RB' : 'RS')).slice(0, 2).toUpperCase(),
      location: credentials.location || simulatedLocation.name
    };

    // Update state & localStorage immediately so UI transitions instantly
    setCurrentUser(activeUser);
    setCurrentRole(role);
    localStorage.setItem('resq_auth_user', JSON.stringify(activeUser));
    localStorage.setItem('resq_role', role);

    try {
      const res = await authApi.login(credentials);
      if (res && res.user) {
        setCurrentUser(res.user);
        setCurrentRole(res.user.role || role);
        localStorage.setItem('resq_auth_user', JSON.stringify(res.user));
        if (res.token) localStorage.setItem('resq_auth_token', res.token);
        addToast(`Welcome back, ${res.user.name}!`, 'success');
        return res.user;
      }
      addToast(`Signed in as ${activeUser.name}`, 'success');
      return activeUser;
    } catch (err) {
      addToast(`Signed in as ${activeUser.name}`, 'success');
      return activeUser;
    }
  };

  const register = async (userData) => {
    try {
      const res = await authApi.register(userData);
      if (res && res.user) {
        setCurrentUser(res.user);
        setCurrentRole(res.user.role || 'buyer');
        localStorage.setItem('resq_auth_user', JSON.stringify(res.user));
        localStorage.setItem('resq_role', res.user.role || 'buyer');
        if (res.token) localStorage.setItem('resq_auth_token', res.token);
        addToast(`Account created for ${res.user.name}!`, 'success');
        return res.user;
      }
    } catch (err) {
      addToast(err.message || 'Registration failed', 'error');
      throw err;
    }
  };

  const logout = () => {
    authApi.logout().catch(() => {});
    setCurrentUser(null);
    localStorage.removeItem('resq_auth_user');
    localStorage.removeItem('resq_auth_token');
    addToast('You have been signed out.', 'info');
  };

  // --- Listing Actions ---
  const addRescueListing = async (listingData) => {
    try {
      const created = await listingsApi.create({
        ...listingData,
        sellerId: currentUser?.id || 'usr-seller-demo',
        sellerName: currentUser?.name || 'Crust & Co. Bakery',
        location: simulatedLocation.name
      });
      const norm = normalizeListing(created);
      setRescues(prev => [norm, ...prev.filter(l => l.id !== norm.id)]);
      addToast(`Surplus batch "${norm.title}" is now live!`, 'success');
      return norm;
    } catch (err) {
      addToast(`Failed to add listing: ${err.message}`, 'error');
      throw err;
    }
  };

  const updateRescueListing = async (id, updates) => {
    try {
      const updated = await listingsApi.update(id, updates);
      const norm = normalizeListing(updated);
      setRescues(prev => prev.map(l => l.id === id ? norm : l));
      addToast('Listing updated successfully', 'success');
      return norm;
    } catch (err) {
      addToast(`Failed to update listing: ${err.message}`, 'error');
      throw err;
    }
  };

  const deleteRescueListing = async (id) => {
    try {
      await listingsApi.delete(id);
      setRescues(prev => prev.map(l => l.id === id ? { ...l, status: 'Cancelled' } : l));
      addToast('Listing cancelled from marketplace', 'info');
    } catch (err) {
      addToast(`Failed to cancel listing: ${err.message}`, 'error');
      throw err;
    }
  };

  const escalateListingToNgo = async (id) => {
    try {
      await updateRescueListing(id, { ngoEscalated: true, isExpiringSoon: true });
      addToast('Surplus escalated for emergency NGO claim!', 'info');
    } catch (err) {
      addToast(err.message, 'error');
    }
  };

  // --- Order Actions (Atomic Concurrency Protected) ---
  const createOrder = async ({ rescue, portions, paymentMethod }) => {
    try {
      const res = await ordersApi.create({
        rescueId: rescue.id,
        portions: portions || 1,
        buyerId: currentUser?.id || 'usr-buyer-demo',
        buyerName: currentUser?.name || 'Rahul Sharma',
        paymentMethod: paymentMethod || 'UPI Sandbox'
      });

      const { order, updatedListing } = res;

      if (updatedListing) {
        const norm = normalizeListing(updatedListing);
        setRescues(prev => prev.map(l => l.id === norm.id ? norm : l));
      }

      if (order) {
        setOrders(prev => [order, ...prev.filter(o => o.id !== order.id)]);
      }

      addToast(`Reservation confirmed! Your pickup OTP is ${order.otp}`, 'success');
      return order;
    } catch (err) {
      addToast(err.message || 'Could not complete reservation', 'error');
      throw err;
    }
  };

  const verifyOrderOtp = async (inputOtp) => {
    try {
      const res = await ordersApi.verifyOtp(inputOtp, currentUser?.id || 'usr-seller-demo');
      if (res.success && res.order) {
        setOrders(prev => prev.map(o => o.id === res.order.id ? res.order : o));
        addToast(`OTP Verified! Handover confirmed for "${res.order.title}"`, 'success');
        return res;
      }
      return { success: false, message: res.message || 'Verification failed' };
    } catch (err) {
      addToast(err.message || 'Invalid OTP', 'error');
      return { success: false, message: err.message };
    }
  };

  // --- NGO Actions ---
  const claimUnclaimedByNgo = async (rescueId, ngoName, vehicleId) => {
    try {
      const res = await donationsApi.claim({
        rescueId,
        ngoId: currentUser?.id || 'usr-ngo-demo',
        ngoName: ngoName || currentUser?.name || 'Roti Bank Mumbai',
        vehicleId: vehicleId || 'MH-02-CD-4421'
      });

      const { claim, updatedListing } = res;
      if (updatedListing) {
        const norm = normalizeListing(updatedListing);
        setRescues(prev => prev.map(l => l.id === norm.id ? norm : l));
      }
      if (claim) {
        setNgoClaims(prev => [claim, ...prev.filter(c => c.id !== claim.id)]);
      }

      addToast(`Successfully claimed surplus for ${claim.ngoName} dispatch!`, 'success');
      return claim;
    } catch (err) {
      addToast(err.message || 'Could not claim donation', 'error');
      throw err;
    }
  };

  // --- Notification Actions ---
  const markNotificationAsRead = async (id) => {
    try {
      await notificationsApi.markRead(id);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    } catch (err) {
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    }
  };

  const markAllNotificationsAsRead = async () => {
    try {
      await notificationsApi.markAllRead(currentUser?.id || 'all');
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      addToast('All notifications marked as read', 'info');
    } catch (err) {
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  // Reset database back to baseline seed
  const resetToDefaultData = async () => {
    try {
      await analyticsApi.resetDb();
      await fetchAllData();
      addToast('Database reset to baseline state', 'info');
    } catch (err) {
      addToast('Failed to reset database', 'error');
    }
  };

  // Live enriched rescues with Haversine distance calculations
  const dynamicRescues = enrichRescuesWithDynamicData(rescues, simulatedLocation);

  return (
    <AppContext.Provider
      value={{
        // Auth state
        currentUser,
        setCurrentUser,
        isAuthenticated: Boolean(currentUser),
        login,
        register,
        logout,

        // Roles & Location
        currentRole,
        setCurrentRole,
        simulatedLocation,
        setSimulatedLocation,
        mumbaiLocations: MUMBAI_LOCATIONS,

        // Data State
        loading,
        error,
        refreshData: fetchAllData,

        // Listings
        rescues,
        dynamicRescues,
        addRescueListing,
        updateRescueListing,
        deleteRescueListing,
        escalateListingToNgo,
        resetToDefaultData,

        // Orders & claims
        orders,
        createOrder,
        verifyOrderOtp,
        ngoClaims,
        claimUnclaimedByNgo,

        // Notifications & Toasts
        notifications,
        unreadCount,
        markNotificationAsRead,
        markAllNotificationsAsRead,
        toasts,
        addToast,
        removeToast,

        // Analytics & Partners
        sellerStats: sellerStats || {
          revenueRecovered7d: 12450,
          portionsRescued7d: 184,
          wasteDivertedKg: 82.5,
          co2eAvoidedKg: 442,
          sellThroughRate: '92%',
          activeListingsCount: rescues.filter(l => l.portionsLeft > 0 && l.status !== 'Expired').length,
          expiringTonightCount: rescues.filter(l => l.portionsLeft > 0 && l.status === 'Low Stock').length,
          dailyAnalytics: [
            { day: 'Mon', revenue: 1450, portions: 22, wasteKg: 9 },
            { day: 'Tue', revenue: 1680, portions: 26, wasteKg: 11 },
            { day: 'Wed', revenue: 1390, portions: 21, wasteKg: 8.5 },
            { day: 'Thu', revenue: 1850, portions: 28, wasteKg: 12 },
            { day: 'Fri', revenue: 2100, portions: 32, wasteKg: 13.5 },
            { day: 'Sat', revenue: 2350, portions: 36, wasteKg: 15 },
            { day: 'Sun', revenue: 1240, portions: 19, wasteKg: 7 }
          ],
          recentOrders: orders.slice(0, 5)
        },
        communityImpact: communityImpact || {
          mealsRescued: 48200 + orders.reduce((sum, o) => sum + (o.portions || 0), 0),
          co2eAvoidedTons: 115.6,
          kmDrivenEquivalent: 462400,
          waterSavedLitres: '7.1M',
          waterDisplay: '7.1M',
          peopleFed: 31200 + orders.reduce((sum, o) => sum + (o.portions || 0), 0),
          participatingStores: 142,
          activeNgoPartners: 28
        },
        ngos: [
          {
            id: 'ngo-1',
            name: 'Roti Bank Mumbai',
            location: 'Dadar West',
            vehicles: 3,
            volunteers: 14,
            mealsServedToday: 540,
            contactPhone: '+91 98200 11223',
            status: 'Ready for dispatch'
          },
          {
            id: 'ngo-2',
            name: 'Feeding Hands Trust',
            location: 'Andheri East',
            vehicles: 2,
            volunteers: 6,
            mealsServedToday: 320,
            contactPhone: '+91 98331 44556',
            status: '1 vehicle en route'
          },
          {
            id: 'ngo-3',
            name: 'Anna Seva Foundation',
            location: 'Bandra West',
            vehicles: 4,
            volunteers: 18,
            mealsServedToday: 430,
            contactPhone: '+91 98190 77889',
            status: 'Ready for dispatch'
          }
        ]
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
