import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import {
  authApi,
  listingsApi,
  ordersApi,
  donationsApi,
  notificationsApi,
  analyticsApi,
  feedbacksApi
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
      location: 'City Center, Gwalior'
    };
  });

  // Active role: 'buyer' | 'seller' | 'ngo' | 'admin'
  const [currentRole, setCurrentRole] = useState(() => {
    return localStorage.getItem('resq_role') || 'buyer';
  });

  // Simulated GPS Location (Defaults to Gwalior)
  const [simulatedLocation, setSimulatedLocation] = useState({
    name: 'City Center, Gwalior',
    city: 'Gwalior',
    lat: 26.2058,
    lng: 78.1950,
  });

  // Live Database Collections
  const [rescues, setRescues] = useState([]);
  const [orders, setOrders] = useState([]);
  const [feedbacks, setFeedbacks] = useState([]);
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

      // Fetch NGO claims, seller analytics & feedbacks
      const [claimsRes, feedbacksRes] = await Promise.all([
        donationsApi.getByNgo('all').catch(() => []),
        feedbacksApi.getAll().catch(() => [])
      ]);
      setNgoClaims(claimsRes || []);
      setFeedbacks(feedbacksRes || []);

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
              if (data.payload.impact) setCommunityImpact(data.payload.impact);
              if (data.payload.sellerStats) setSellerStats(data.payload.sellerStats);
              break;
            }
            case 'LISTING_UPDATED': {
              const updatedListing = normalizeListing(data.payload.listing);
              setRescues(prev => prev.map(l => l.id === updatedListing.id ? updatedListing : l));
              if (data.payload.impact) setCommunityImpact(data.payload.impact);
              if (data.payload.sellerStats) setSellerStats(data.payload.sellerStats);
              break;
            }
            case 'LISTING_CANCELLED': {
              setRescues(prev => prev.map(l => l.id === data.payload.id ? { ...l, status: 'Cancelled' } : l));
              if (data.payload.impact) setCommunityImpact(data.payload.impact);
              if (data.payload.sellerStats) setSellerStats(data.payload.sellerStats);
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
            case 'FEEDBACK_SUBMITTED': {
              const { feedback, providerStats } = data.payload;
              if (feedback) {
                setFeedbacks(prev => [feedback, ...prev.filter(f => f.id !== feedback.id)]);
                setOrders(prev => prev.map(o => o.id === feedback.orderId ? { ...o, hasFeedback: true, feedbackId: feedback.id } : o));
                if (providerStats) {
                  setRescues(prev => prev.map(l => {
                    if (l.sellerId === feedback.sellerId || l.id === feedback.rescueId) {
                      return {
                        ...l,
                        rating: providerStats.averageRating,
                        reviewsCount: providerStats.totalReviews
                      };
                    }
                    return l;
                  }));
                }
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
      
      // Proactively refresh community impact & seller stats so UI updates immediately
      analyticsApi.getImpact().then(res => res && setCommunityImpact(res)).catch(() => {});
      analyticsApi.getSeller(currentUser?.id || 'usr-seller-demo').then(res => res && setSellerStats(res)).catch(() => {});

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

  const createRazorpayOrder = async ({ rescueId, portions }) => {
    try {
      return await ordersApi.createRazorpayOrder({ rescueId, portions });
    } catch (err) {
      addToast(err.message || 'Failed to initialize Razorpay checkout', 'error');
      throw err;
    }
  };

  const verifyRazorpayPayment = async (verificationData) => {
    try {
      const res = await ordersApi.verifyRazorpayPayment({
        ...verificationData,
        buyerId: currentUser?.id || 'usr-buyer-demo',
        buyerName: currentUser?.name || 'Rahul Sharma'
      });

      if (res.success && res.order) {
        setOrders(prev => [res.order, ...prev.filter(o => o.id !== res.order.id)]);
        if (res.updatedListing) {
          const norm = normalizeListing(res.updatedListing);
          setRescues(prev => prev.map(l => l.id === norm.id ? norm : l));
        }
        addToast(`Payment verified! Your pickup OTP is ${res.order.otp}`, 'success');
        return res.order;
      }
      throw new Error(res.error || 'Payment signature verification failed');
    } catch (err) {
      addToast(err.message || 'Payment verification failed', 'error');
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
        ngoName: ngoName || currentUser?.name || 'Gwalior Roti Bank & Relief Trust',
        vehicleId: vehicleId || 'MP-07-GA-1024'
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

  // --- Customer Feedback Actions ---
  const submitFeedback = async (feedbackData) => {
    try {
      const res = await feedbacksApi.submit(feedbackData);
      if (res && res.success) {
        setFeedbacks(prev => [res.feedback, ...prev.filter(f => f.id !== res.feedback.id)]);
        // Mark order as reviewed
        setOrders(prev => prev.map(o => o.id === feedbackData.orderId ? { ...o, hasFeedback: true, feedbackId: res.feedback.id } : o));
        
        // Update provider rating in rescues if returned
        if (res.providerStats) {
          setRescues(prev => prev.map(l => {
            if (l.sellerId === res.feedback.sellerId || l.id === res.feedback.rescueId) {
              return {
                ...l,
                rating: res.providerStats.averageRating,
                reviewsCount: res.providerStats.totalReviews
              };
            }
            return l;
          }));
        }

        addToast('Thank you! Your verified feedback has been submitted.', 'success');
        return res;
      }
      return res;
    } catch (err) {
      addToast(err.message || 'Could not submit feedback.', 'error');
      throw err;
    }
  };

  const getFeedbackByOrder = useCallback((orderId) => {
    return feedbacks.find(f => f.orderId === orderId) || null;
  }, [feedbacks]);

  const getFeedbacksBySeller = useCallback((sellerId) => {
    const sellerFeedbacks = feedbacks.filter(f => f.sellerId === sellerId);
    return {
      sellerId,
      reviews: sellerFeedbacks,
      totalReviews: sellerFeedbacks.length,
      averageRating: sellerFeedbacks.length > 0
        ? Number((sellerFeedbacks.reduce((sum, f) => sum + (f.overallRating || 5), 0) / sellerFeedbacks.length).toFixed(1))
        : 4.8
    };
  }, [feedbacks]);

  const getFeedbacksByListing = useCallback((rescueId) => {
    const listingFeedbacks = feedbacks.filter(f => f.rescueId === rescueId);
    return {
      rescueId,
      reviews: listingFeedbacks,
      totalReviews: listingFeedbacks.length,
      averageRating: listingFeedbacks.length > 0
        ? Number((listingFeedbacks.reduce((sum, f) => sum + (f.overallRating || 5), 0) / listingFeedbacks.length).toFixed(1))
        : 4.8
    };
  }, [feedbacks]);

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
        createRazorpayOrder,
        verifyRazorpayPayment,
        verifyOrderOtp,
        ngoClaims,
        claimUnclaimedByNgo,

        // Customer Feedback & Reviews
        feedbacks,
        submitFeedback,
        getFeedbackByOrder,
        getFeedbacksBySeller,
        getFeedbacksByListing,

        // Notifications & Toasts
        notifications,
        unreadCount,
        markNotificationAsRead,
        markAllNotificationsAsRead,
        toasts,
        addToast,
        removeToast,

        // Analytics & Partners (Real-time dynamic calculations tied directly to live listings and orders)
        sellerStats: {
          storeName: sellerStats?.storeName || 'Crust & Co. Bakery',
          outlet: sellerStats?.outlet || 'City Center Outlet, Gwalior',
          revenueChangeWoW: sellerStats?.revenueChangeWoW || '+18%',
          revenueRecovered7d: sellerStats?.revenueRecovered7d ?? (12450 + orders.reduce((sum, o) => sum + (o.totalAmount || 0), 0)),
          portionsRescued7d: sellerStats?.portionsRescued7d ?? (184 + orders.reduce((sum, o) => sum + (o.portions || 0), 0)),
          wasteDivertedKg: sellerStats?.wasteDivertedKg ?? parseFloat((82.5 + orders.reduce((sum, o) => sum + (o.portions || 0), 0) * 0.45).toFixed(1)),
          co2eAvoidedKg: sellerStats?.co2eAvoidedKg ?? Math.round(442 + orders.reduce((sum, o) => sum + (o.portions || 0), 0) * 2.4),
          sellThroughRate: sellerStats?.sellThroughRate || '92%',
          activeListingsCount: rescues.filter(l => l.portionsLeft > 0 && l.status !== 'Expired' && l.status !== 'Cancelled').length,
          expiringTonightCount: rescues.filter(l => l.portionsLeft > 0 && (l.status === 'Low Stock' || l.isExpiringSoon)).length,
          dailyAnalytics: sellerStats?.dailyAnalytics || [
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
        communityImpact: (() => {
          const totalListedPortions = (rescues || []).reduce((sum, r) => sum + (Number(r.portionsTotal) || Number(r.portions) || Number(r.portionsLeft) || 0), 0);
          const buyerPortions = (orders || []).reduce((sum, o) => sum + (Number(o.portions) || 0), 0);
          const ngoPortions = (ngoClaims || []).reduce((sum, c) => sum + (Number(c.portionsClaimed) || 0), 0);
          const fallbackMeals = 180 + totalListedPortions + buyerPortions + ngoPortions;
          const fallbackCo2Kg = Math.round(fallbackMeals * 2.4);
          const fallbackCo2Tons = parseFloat((fallbackCo2Kg / 1000).toFixed(2));
          const fallbackCo2Display = fallbackCo2Kg >= 1000 ? `${fallbackCo2Tons} t` : `${fallbackCo2Kg} kg`;
          const fallbackLandfillKg = parseFloat((fallbackMeals * 0.45).toFixed(1));
          const fallbackLandfillDisplay = fallbackLandfillKg >= 1000 ? `${(fallbackLandfillKg / 1000).toFixed(2)} t` : `${fallbackLandfillKg} kg`;
          const fallbackWaterL = Math.round(fallbackMeals * 16);
          const fallbackWaterDisplay = `${fallbackWaterL.toLocaleString()} L`;

          return {
            mealsRescued: communityImpact?.mealsRescued ?? fallbackMeals,
            co2eAvoidedTons: communityImpact?.co2eAvoidedTons ?? fallbackCo2Tons,
            co2eAvoidedKg: communityImpact?.co2eAvoidedKg ?? fallbackCo2Kg,
            co2Display: communityImpact?.co2Display || fallbackCo2Display,
            kmDrivenEquivalent: communityImpact?.kmDrivenEquivalent ?? Math.round(fallbackCo2Kg * 4.1),
            landfillDivertedKg: communityImpact?.landfillDivertedKg ?? fallbackLandfillKg,
            landfillDisplay: communityImpact?.landfillDisplay || fallbackLandfillDisplay,
            waterSavedLitres: communityImpact?.waterSavedLitres ?? fallbackWaterL,
            waterDisplay: communityImpact?.waterDisplay || fallbackWaterDisplay,
            peopleFed: communityImpact?.peopleFed ?? Math.round(fallbackMeals * 0.85),
            participatingStores: communityImpact?.participatingStores ?? Math.max(new Set((rescues || []).map(r => r.seller || r.sellerName).filter(Boolean)).size, 5),
            activeNgoPartners: communityImpact?.activeNgoPartners ?? Math.max(new Set((ngoClaims || []).map(c => c.ngoName).filter(Boolean)).size, 3),
            activeListingsCount: (rescues || []).filter(l => (Number(l.portionsLeft) || 0) > 0 && l.status !== 'Expired' && l.status !== 'Cancelled').length,
            totalPortionsAvailable: (rescues || []).reduce((sum, l) => sum + (Number(l.portionsLeft) || 0), 0)
          };
        })(),
        ngos: [
          {
            id: 'ngo-1',
            name: 'Gwalior Roti Bank & Relief Trust',
            location: 'Maharaj Bada, Gwalior',
            vehicles: 4,
            volunteers: 18,
            mealsServedToday: 620,
            contactPhone: '+91 94251 12345',
            status: 'Ready for dispatch'
          },
          {
            id: 'ngo-2',
            name: 'Robin Hood Army Gwalior Chapter',
            location: 'Thatipur, Gwalior',
            vehicles: 3,
            volunteers: 24,
            mealsServedToday: 480,
            contactPhone: '+91 98262 54321',
            status: '1 vehicle en route to Morar'
          },
          {
            id: 'ngo-3',
            name: 'Apna Ghar Seva Sansthan Gwalior',
            location: 'Padav, Gwalior',
            vehicles: 2,
            volunteers: 12,
            mealsServedToday: 350,
            contactPhone: '+91 94257 88990',
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
