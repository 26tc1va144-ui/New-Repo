import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  INITIAL_RESCUES,
  MOCK_NOTIFICATIONS,
  MOCK_NGOS,
  MOCK_SELLER_STATS,
  MOCK_COMMUNITY_IMPACT
} from '../data/mockData';

const AppContext = createContext();

export function AppProvider({ children }) {
  // Current active role: 'buyer' | 'seller' | 'ngo'
  const [currentRole, setCurrentRole] = useState(() => {
    return localStorage.getItem('resq_role') || 'buyer';
  });

  // Simulated location
  const [simulatedLocation, setSimulatedLocation] = useState({
    name: 'Bandra West, Mumbai',
    city: 'Mumbai',
    lat: 19.0596,
    lng: 72.8295,
  });

  // Rescues catalog
  const [rescues, setRescues] = useState(() => {
    const saved = localStorage.getItem('resq_rescues');
    return saved ? JSON.parse(saved) : INITIAL_RESCUES;
  });

  // User Orders / Reservations
  const [orders, setOrders] = useState(() => {
    const saved = localStorage.getItem('resq_orders');
    return saved ? JSON.parse(saved) : [
      {
        id: 'order-demo',
        rescueId: 'rq-101',
        title: 'Artisan Sourdough & Croissant Box',
        seller: 'Crust & Co. Bakery',
        portions: 2,
        totalAmount: 298,
        savings: 982,
        otp: '4829',
        qrData: 'RESQ-ORDER-DEMO-4829-BANDRA',
        pickupWindow: '20:30 – 22:00 today',
        status: 'Ready for pickup',
        timestamp: new Date().toISOString(),
        paymentMethod: 'UPI Sandbox (GPay)',
        address: 'Shop 4, Hill Road, Near Bandra Station, Mumbai 400050'
      }
    ];
  });

  // Notifications
  const [notifications, setNotifications] = useState(() => {
    const saved = localStorage.getItem('resq_notifications');
    return saved ? JSON.parse(saved) : MOCK_NOTIFICATIONS;
  });

  // NGO Claims
  const [ngoClaims, setNgoClaims] = useState(() => {
    const saved = localStorage.getItem('resq_ngo_claims');
    return saved ? JSON.parse(saved) : [];
  });

  // Toast alert system
  const [toasts, setToasts] = useState([]);

  // Sync to local storage
  useEffect(() => {
    localStorage.setItem('resq_role', currentRole);
  }, [currentRole]);

  useEffect(() => {
    localStorage.setItem('resq_rescues', JSON.stringify(rescues));
  }, [rescues]);

  useEffect(() => {
    localStorage.setItem('resq_orders', JSON.stringify(orders));
  }, [orders]);

  useEffect(() => {
    localStorage.setItem('resq_notifications', JSON.stringify(notifications));
  }, [notifications]);

  useEffect(() => {
    localStorage.setItem('resq_ngo_claims', JSON.stringify(ngoClaims));
  }, [ngoClaims]);

  const addToast = (message, type = 'success') => {
    const id = Date.now().toString();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  };

  const removeToast = (id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  // Add new surplus listing (from seller)
  const addRescueListing = (listing) => {
    const newId = `rq-${Date.now().toString().slice(-4)}`;
    const discount = Math.round(((listing.originalPrice - listing.rescuePrice) / listing.originalPrice) * 100);
    const newRescue = {
      id: newId,
      title: listing.title,
      seller: 'Crust & Co. Bakery',
      sellerType: listing.category || 'Bakery',
      rating: 4.9,
      reviewsCount: 1,
      location: 'Bandra West, Mumbai',
      address: 'Shop 4, Hill Road, Bandra West, Mumbai',
      distance: 1.2,
      coordinates: { lat: 19.0596 + (Math.random() - 0.5) * 0.01, lng: 72.8350 + (Math.random() - 0.5) * 0.01 },
      originalPrice: Number(listing.originalPrice),
      rescuePrice: Number(listing.rescuePrice),
      discountPercent: discount,
      portionsTotal: Number(listing.portions),
      portionsLeft: Number(listing.portions),
      limitPerBuyer: 3,
      pickupWindow: listing.pickupWindow || '20:30 – 22:30 today',
      pickupStart: listing.pickupStart || '20:30',
      pickupEnd: listing.pickupEnd || '22:30',
      freshnessCutoff: listing.freshnessCutoff || 'Consume within 4 hours',
      holdTemperature: listing.holdTemperature || 'Held in standard temperature-controlled cabinet',
      isExpiringSoon: false,
      isDonation: Number(listing.rescuePrice) === 0,
      category: listing.category || 'Bakery',
      image: listing.image || 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=800&q=80',
      description: listing.description,
      allergens: listing.allergens || [],
      dietary: listing.dietary || ['Vegetarian'],
      fssaiLicense: 'FSSAI #11521008000452',
      fssaiVerified: true,
      ngoEscalated: false
    };

    setRescues(prev => [newRescue, ...prev]);

    // Send push notification
    const newNotif = {
      id: `notif-${Date.now()}`,
      title: `New Rescue Listed: ${newRescue.title}`,
      description: `Crust & Co. Bakery just added ${newRescue.portionsLeft} portions at ₹${newRescue.rescuePrice}`,
      time: 'Just now',
      read: false,
      type: 'rescue',
      link: `/food/${newRescue.id}`
    };
    setNotifications(prev => [newNotif, ...prev]);
    addToast(`Listing "${newRescue.title}" is now live for nearby buyers!`, 'success');
    return newRescue;
  };

  // Escalate listing to NGOs
  const escalateListingToNgo = (id) => {
    setRescues(prev => prev.map(r => {
      if (r.id === id) {
        return { ...r, ngoEscalated: true, isExpiringSoon: true };
      }
      return r;
    }));

    const found = rescues.find(r => r.id === id);
    const newNotif = {
      id: `notif-${Date.now()}`,
      title: `NGO Escalation Alert: ${found ? found.title : 'Food Rescue'}`,
      description: `Escalated for immediate NGO dispatch pickup before cut-off window.`,
      time: 'Just now',
      read: false,
      type: 'ngo',
      link: '/ngo'
    };
    setNotifications(prev => [newNotif, ...prev]);
    addToast('Surplus escalated to NGO coordination channel!', 'info');
  };

  // Create an order / reservation (Buyer)
  const createOrder = ({ rescue, portions, paymentMethod }) => {
    const otp = Math.floor(1000 + Math.random() * 9000).toString();
    const orderId = `ord-${Date.now().toString().slice(-6)}`;
    const totalAmount = rescue.rescuePrice * portions;
    const totalSavings = (rescue.originalPrice - rescue.rescuePrice) * portions;

    const newOrder = {
      id: orderId,
      rescueId: rescue.id,
      title: rescue.title,
      seller: rescue.seller,
      portions,
      totalAmount,
      savings: totalSavings,
      otp,
      qrData: `RESQ-${orderId}-${otp}-${rescue.seller.replace(/\s+/g, '')}`,
      pickupWindow: rescue.pickupWindow,
      status: 'Ready for pickup',
      timestamp: new Date().toISOString(),
      paymentMethod,
      address: rescue.address
    };

    // Deduct remaining portions
    setRescues(prev => prev.map(r => {
      if (r.id === rescue.id) {
        const remaining = Math.max(0, r.portionsLeft - portions);
        return { ...r, portionsLeft: remaining };
      }
      return r;
    }));

    setOrders(prev => [newOrder, ...prev]);

    // Add notification
    const orderNotif = {
      id: `notif-${Date.now()}`,
      title: `Rescue Reserved: ${rescue.title}`,
      description: `Pickup pass with OTP ${otp} generated. Ready for collection.`,
      time: 'Just now',
      read: false,
      type: 'order',
      link: `/order-confirmation/${orderId}`
    };
    setNotifications(prev => [orderNotif, ...prev]);
    addToast(`Reservation confirmed! Your pickup OTP is ${otp}`, 'success');

    return newOrder;
  };

  // Seller verifies buyer OTP
  const verifyOrderOtp = (inputOtp) => {
    const orderIndex = orders.findIndex(o => o.otp === inputOtp.trim());
    if (orderIndex !== -1) {
      const targetOrder = orders[orderIndex];
      if (targetOrder.status === 'Collected') {
        return { success: false, message: 'This order has already been verified and collected!' };
      }
      const updated = [...orders];
      updated[orderIndex] = { ...targetOrder, status: 'Collected' };
      setOrders(updated);
      addToast(`OTP Verified! Handover confirmed for "${targetOrder.title}"`, 'success');
      return { success: true, order: targetOrder };
    }
    return { success: false, message: 'Invalid OTP code. Please verify the 4 digits.' };
  };

  // NGO claims unclaimed surplus
  const claimUnclaimedByNgo = (rescueId, ngoName, vehicleId) => {
    const rescue = rescues.find(r => r.id === rescueId);
    if (!rescue) return;

    const claimRecord = {
      id: `claim-${Date.now()}`,
      rescueId,
      rescueTitle: rescue.title,
      seller: rescue.seller,
      sellerAddress: rescue.address,
      portionsClaimed: rescue.portionsLeft,
      ngoName,
      vehicleId: vehicleId || 'MH-02-CD-4421',
      claimedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      eta: '25 mins',
      status: 'Dispatched for Pickup'
    };

    setNgoClaims(prev => [claimRecord, ...prev]);

    // Set rescue portions to 0
    setRescues(prev => prev.map(r => {
      if (r.id === rescueId) {
        return { ...r, portionsLeft: 0, claimedByNgo: ngoName };
      }
      return r;
    }));

    addToast(`Successfully claimed ${rescue.portionsLeft} portions for ${ngoName} dispatch!`, 'success');
  };

  // Mark single or all notifications read
  const markNotificationAsRead = (id) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const markAllNotificationsAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    addToast('All notifications marked as read', 'info');
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <AppContext.Provider
      value={{
        currentRole,
        setCurrentRole,
        simulatedLocation,
        setSimulatedLocation,
        rescues,
        orders,
        notifications,
        unreadCount,
        ngoClaims,
        toasts,
        addToast,
        removeToast,
        addRescueListing,
        escalateListingToNgo,
        createOrder,
        verifyOrderOtp,
        claimUnclaimedByNgo,
        markNotificationAsRead,
        markAllNotificationsAsRead,
        sellerStats: MOCK_SELLER_STATS,
        communityImpact: MOCK_COMMUNITY_IMPACT,
        ngos: MOCK_NGOS
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
