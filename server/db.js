import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.join(__dirname, 'data');
const DB_FILE = path.join(DATA_DIR, 'resqfood.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Environmental Constants
export const IMPACT_PER_MEAL = {
  co2Kg: 2.4,       // kg CO₂e avoided per meal
  waterLitres: 16,  // practical litres of food prep, cooking & sanitation water saved per meal
  foodKg: 0.45,     // kg food waste diverted
};

// Initial Realistic Seed Dataset (Created only on first boot if DB file doesn't exist)
const INITIAL_DATABASE = {
  users: [
    {
      id: 'usr-buyer-demo',
      name: 'Rahul Sharma',
      email: 'rahul.s@resqfood.org',
      phone: '+91 98201 44321',
      role: 'buyer',
      avatar: 'RS',
      address: 'Bandra West, Mumbai 400050',
      coordinates: { lat: 19.0596, lng: 72.8295 },
      createdAt: '2026-08-15T10:00:00.000Z'
    },
    {
      id: 'usr-seller-demo',
      name: 'Crust & Co. Bakery',
      email: 'manager@crustandco.com',
      phone: '+91 98209 88123',
      role: 'seller',
      avatar: 'CC',
      sellerType: 'Bakery',
      address: 'Shop 4, Hill Road, Bandra West, Mumbai 400050',
      coordinates: { lat: 19.0596, lng: 72.8350 },
      fssaiLicense: 'FSSAI #11521008000452',
      rating: 4.8,
      reviewsCount: 142,
      createdAt: '2026-07-10T08:30:00.000Z'
    },
    {
      id: 'usr-ngo-demo',
      name: 'Roti Bank Mumbai',
      email: 'dispatch@rotibank.org',
      phone: '+91 98334 11220',
      role: 'ngo',
      avatar: 'RB',
      address: 'Mumbai Central Relief Hub, Mumbai 400008',
      coordinates: { lat: 18.9696, lng: 72.8193 },
      fleetCount: 8,
      createdAt: '2026-06-01T09:00:00.000Z'
    },
    {
      id: 'usr-admin-demo',
      name: 'ResQFood Administrator',
      email: 'admin@resqfood.org',
      phone: '+91 99999 00000',
      role: 'admin',
      avatar: 'AD',
      address: 'Nariman Point, Mumbai 400021',
      coordinates: { lat: 18.9256, lng: 72.8242 },
      createdAt: '2026-05-01T00:00:00.000Z'
    }
  ],
  listings: [
    {
      id: 'rq-101',
      title: 'Artisan Sourdough & Croissant Box',
      sellerId: 'usr-seller-demo',
      sellerName: 'Crust & Co. Bakery',
      sellerType: 'Bakery',
      rating: 4.8,
      reviewsCount: 142,
      location: 'Bandra West, Mumbai',
      address: 'Shop 4, Hill Road, Near Bandra Station, Mumbai 400050',
      coordinates: { lat: 19.0596, lng: 72.8350 },
      originalPrice: 640,
      rescuePrice: 149,
      discountPercent: 77,
      portionsTotal: 8,
      portionsLeft: 6,
      limitPerBuyer: 3,
      pickupWindow: '20:30 – 22:00 today',
      pickupStart: '20:30',
      pickupEnd: '22:00',
      freshnessCutoff: 'Best before tomorrow 6 PM',
      holdTemperature: 'Stored at ambient room temperature in protective bakery paper (< 24°C)',
      status: 'Available', // 'Available' | 'Low Stock' | 'Reserved' | 'Sold Out' | 'Expired' | 'Cancelled' | 'Donated'
      isDonation: false,
      category: 'Bakery',
      image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=800&q=80',
      description: "End-of-day sourdough loaves, butter croissants and seasonal danish pastries baked this morning, ready for breakfast.",
      allergens: ['Gluten', 'Dairy', 'Eggs'],
      dietary: ['Vegetarian'],
      fssaiLicense: 'FSSAI #11521008000452',
      fssaiVerified: true,
      ngoEscalated: false,
      createdAt: new Date(Date.now() - 3600000 * 3).toISOString(),
      updatedAt: new Date(Date.now() - 3600000 * 3).toISOString()
    },
    {
      id: 'rq-102',
      title: 'North Indian Thali Surplus (5 meals)',
      sellerId: 'usr-seller-demo',
      sellerName: 'Spice Route Kitchen',
      sellerType: 'Restaurant',
      rating: 4.6,
      reviewsCount: 89,
      location: 'Khar West, Mumbai',
      address: '14th Road, Off Linking Road, Khar West, Mumbai 400052',
      coordinates: { lat: 19.0680, lng: 72.8390 },
      originalPrice: 1250,
      rescuePrice: 299,
      discountPercent: 76,
      portionsTotal: 10,
      portionsLeft: 4,
      limitPerBuyer: 2,
      pickupWindow: '21:00 – 22:30 today',
      pickupStart: '21:00',
      pickupEnd: '22:30',
      freshnessCutoff: 'Consume within 3 hours of pickup',
      holdTemperature: 'Steam holding cabinet at > 65°C maintained continuously',
      status: 'Available',
      isDonation: false,
      category: 'Restaurant',
      image: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?auto=format&fit=crop&w=800&q=80',
      description: 'Hot, freshly packed executive thalis with Paneer Butter Masala, Dal Makhani, Jeera Rice, and soft Phulkas prepared for evening corporate dinner surplus.',
      allergens: ['Dairy'],
      dietary: ['Vegetarian'],
      fssaiLicense: 'FSSAI #11522003001890',
      fssaiVerified: true,
      ngoEscalated: true,
      createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
      updatedAt: new Date(Date.now() - 3600000 * 2).toISOString()
    },
    {
      id: 'rq-103',
      title: 'Fresh Organic Produce Rescue Crate',
      sellerId: 'usr-seller-demo',
      sellerName: 'GreenLeaf Grocers',
      sellerType: 'Groceries',
      rating: 4.4,
      reviewsCount: 64,
      location: 'Andheri East, Mumbai',
      address: 'Plot 12, Mahakali Caves Rd, Andheri East, Mumbai 400093',
      coordinates: { lat: 19.1197, lng: 72.8464 },
      originalPrice: 900,
      rescuePrice: 199,
      discountPercent: 78,
      portionsTotal: 15,
      portionsLeft: 12,
      limitPerBuyer: 4,
      pickupWindow: '18:00 – 21:00 today',
      pickupStart: '18:00',
      pickupEnd: '21:00',
      freshnessCutoff: 'Best consumed within 3–4 days',
      holdTemperature: 'Cold room maintained between 4°C – 8°C',
      status: 'Available',
      isDonation: false,
      category: 'Groceries',
      image: 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?auto=format&fit=crop&w=800&q=80',
      description: 'Assorted seasonal organic vegetables and fruit surplus including sweet bell peppers, carrots, avocados, and fresh leafy greens sourced from farm morning shipments.',
      allergens: [],
      dietary: ['Vegan', 'Gluten-Free'],
      fssaiLicense: 'FSSAI #11520005000781',
      fssaiVerified: true,
      ngoEscalated: false,
      createdAt: new Date(Date.now() - 3600000 * 4).toISOString(),
      updatedAt: new Date(Date.now() - 3600000 * 4).toISOString()
    },
    {
      id: 'rq-104',
      title: 'Gourmet Cold Brew & Danish Bundle',
      sellerId: 'usr-seller-demo',
      sellerName: 'Brew & Bean Specialty Cafe',
      sellerType: 'Cafe',
      rating: 4.9,
      reviewsCount: 112,
      location: 'Bandra West, Mumbai',
      address: 'Perry Cross Road, Bandra West, Mumbai 400050',
      coordinates: { lat: 19.0550, lng: 72.8280 },
      originalPrice: 580,
      rescuePrice: 120,
      discountPercent: 79,
      portionsTotal: 6,
      portionsLeft: 2,
      limitPerBuyer: 2,
      pickupWindow: '19:00 – 20:30 today',
      pickupStart: '19:00',
      pickupEnd: '20:30',
      freshnessCutoff: 'Bottled fresh today, keep chilled',
      holdTemperature: 'Display chiller at 3°C',
      status: 'Low Stock',
      isDonation: false,
      category: 'Cafe',
      image: 'https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?auto=format&fit=crop&w=800&q=80',
      description: 'Single-origin Ethiopian cold brew bottles paired with freshly rolled cinnamon buns from morning roast batches.',
      allergens: ['Gluten', 'Dairy'],
      dietary: ['Vegetarian'],
      fssaiLicense: 'FSSAI #11523002000311',
      fssaiVerified: true,
      ngoEscalated: false,
      createdAt: new Date(Date.now() - 3600000 * 5).toISOString(),
      updatedAt: new Date(Date.now() - 3600000 * 5).toISOString()
    },
    {
      id: 'rq-105',
      title: 'Buffet Excess: Paneer Tikka & Biryani',
      sellerId: 'usr-seller-demo',
      sellerName: 'Grand Banquet Catering',
      sellerType: 'Catering',
      rating: 4.7,
      reviewsCount: 97,
      location: 'Santacruz West, Mumbai',
      address: 'S.V. Road, Near Milan Subway, Santacruz West, Mumbai 400054',
      coordinates: { lat: 19.0820, lng: 72.8360 },
      originalPrice: 2200,
      rescuePrice: 0,
      discountPercent: 100,
      portionsTotal: 25,
      portionsLeft: 25,
      limitPerBuyer: 10,
      pickupWindow: '22:00 – 23:30 today',
      pickupStart: '22:00',
      pickupEnd: '23:30',
      freshnessCutoff: 'Consume within 2 hours of collection',
      holdTemperature: 'Commercial chafing warmers at > 68°C',
      status: 'Available',
      isDonation: true,
      category: 'Catering',
      image: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=800&q=80',
      description: 'High quality surplus from a corporate luncheon banquet. Handled by certified chefs in sealed food-grade containers. Free community rescue for NGOs or hungry neighbours.',
      allergens: ['Dairy'],
      dietary: ['Vegetarian'],
      fssaiLicense: 'FSSAI #11521011002241',
      fssaiVerified: true,
      ngoEscalated: true,
      createdAt: new Date(Date.now() - 3600000 * 1).toISOString(),
      updatedAt: new Date(Date.now() - 3600000 * 1).toISOString()
    }
  ],
  orders: [
    {
      id: 'ord-initial-demo',
      rescueId: 'rq-101',
      title: 'Artisan Sourdough & Croissant Box',
      sellerId: 'usr-seller-demo',
      sellerName: 'Crust & Co. Bakery',
      buyerId: 'usr-buyer-demo',
      buyerName: 'Rahul Sharma',
      portions: 2,
      totalAmount: 298,
      savings: 982,
      otp: '4829',
      qrData: 'RESQ-ORDER-ord-initial-demo-4829-BANDRA',
      pickupWindow: '20:30 – 22:00 today',
      status: 'Ready for Pickup', // 'Pending' | 'Confirmed' | 'Ready for Pickup' | 'Picked Up' | 'Completed' | 'Cancelled' | 'Expired'
      paymentMethod: 'UPI Sandbox (GPay)',
      address: 'Shop 4, Hill Road, Near Bandra Station, Mumbai 400050',
      createdAt: new Date(Date.now() - 3600000 * 2).toISOString()
    }
  ],
  claims: [
    {
      id: 'claim-initial-demo',
      rescueId: 'rq-102',
      rescueTitle: 'North Indian Thali Surplus (5 meals)',
      sellerId: 'usr-seller-demo',
      sellerName: 'Spice Route Kitchen',
      sellerAddress: '14th Road, Off Linking Road, Khar West, Mumbai 400052',
      portionsClaimed: 6,
      ngoId: 'usr-ngo-demo',
      ngoName: 'Roti Bank Mumbai',
      vehicleId: 'MH-02-CD-4421',
      claimedAt: '19:45',
      eta: '20 mins',
      status: 'Dispatched for Pickup',
      createdAt: new Date(Date.now() - 3600000 * 3).toISOString()
    }
  ],
  notifications: [
    {
      id: 'notif-1',
      userId: 'usr-buyer-demo',
      title: 'Pickup Pass Ready: Crust & Co. Bakery',
      message: 'Your reservation for Artisan Sourdough Box is ready for collection with OTP 4829.',
      time: '12m ago',
      read: false,
      type: 'order',
      link: '/order-confirmation/ord-initial-demo',
      createdAt: new Date(Date.now() - 720000).toISOString()
    },
    {
      id: 'notif-2',
      userId: 'usr-ngo-demo',
      title: 'Emergency Donation Available in Santacruz',
      message: 'Grand Banquet Catering posted 25 portions of hot meals available for 0 cost NGO rescue.',
      time: '35m ago',
      read: false,
      type: 'ngo',
      link: '/ngo',
      createdAt: new Date(Date.now() - 2100000).toISOString()
    },
    {
      id: 'notif-3',
      userId: 'usr-seller-demo',
      title: 'Surplus Batch Nearing Cutoff',
      message: 'North Indian Thali has 4 portions remaining with pickup cutoff in 45 minutes.',
      time: '1h ago',
      read: true,
      type: 'system',
      link: '/seller',
      createdAt: new Date(Date.now() - 3600000).toISOString()
    }
  ]
};

class Database {
  constructor() {
    this.memoryData = null;
    this.isWriting = false;
    this.init();
  }

  init() {
    try {
      if (!fs.existsSync(DB_FILE)) {
        fs.writeFileSync(DB_FILE, JSON.stringify(INITIAL_DATABASE, null, 2), 'utf-8');
        this.memoryData = JSON.parse(JSON.stringify(INITIAL_DATABASE));
      } else {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        this.memoryData = JSON.parse(raw);
      }
    } catch (err) {
      console.error('Failed to initialize database, falling back to initial data:', err);
      this.memoryData = JSON.parse(JSON.stringify(INITIAL_DATABASE));
    }
    this.refreshListingStatuses();
  }

  save() {
    try {
      fs.writeFileSync(DB_FILE, JSON.stringify(this.memoryData, null, 2), 'utf-8');
    } catch (err) {
      console.error('Error writing to database file:', err);
    }
  }

  // Automated Status Lifecycle Evaluator
  refreshListingStatuses() {
    const now = new Date();
    const currentHour = now.getHours();
    const currentMin = now.getMinutes();
    const currentTimeVal = currentHour * 60 + currentMin;

    let modified = false;

    this.memoryData.listings = this.memoryData.listings.map(item => {
      // Check portions
      let newStatus = item.status;

      if (item.status === 'Cancelled' || item.status === 'Donated') {
        return item;
      }

      // Check Expiry: compare pickupEnd ("22:00")
      if (item.pickupEnd) {
        const [endH, endM] = item.pickupEnd.split(':').map(Number);
        if (!isNaN(endH) && !isNaN(endM)) {
          const endTimeVal = endH * 60 + endM;
          // If current time passed pickup cutoff (and within same day window)
          if (currentTimeVal > endTimeVal + 30) {
            newStatus = 'Expired';
          }
        }
      }

      if (newStatus !== 'Expired') {
        if (item.portionsLeft <= 0) {
          newStatus = 'Sold Out';
        } else if (item.portionsLeft <= 3) {
          newStatus = 'Low Stock';
        } else {
          newStatus = 'Available';
        }
      }

      if (newStatus !== item.status) {
        modified = true;
        return { ...item, status: newStatus, updatedAt: now.toISOString() };
      }

      return item;
    });

    if (modified) {
      this.save();
    }
  }

  // --- Users ---
  getUsers() {
    return this.memoryData.users;
  }

  getUserById(id) {
    return this.memoryData.users.find(u => u.id === id);
  }

  getUserByEmail(email) {
    if (!email) return null;
    return this.memoryData.users.find(u => u.email.toLowerCase() === email.toLowerCase());
  }

  createUser(userData) {
    const newUser = {
      id: userData.id || `usr-${Date.now().toString().slice(-6)}`,
      name: userData.name,
      email: userData.email,
      phone: userData.phone || '+91 98000 00000',
      role: userData.role || 'buyer',
      avatar: userData.avatar || (userData.name ? userData.name.slice(0, 2).toUpperCase() : 'RQ'),
      sellerType: userData.sellerType || (userData.role === 'seller' ? 'Bakery' : undefined),
      address: userData.address || 'Bandra West, Mumbai',
      coordinates: userData.coordinates || { lat: 19.0596, lng: 72.8295 },
      createdAt: new Date().toISOString()
    };
    this.memoryData.users.push(newUser);
    this.save();
    return newUser;
  }

  // --- Listings ---
  getListings(filters = {}) {
    this.refreshListingStatuses();
    let result = [...this.memoryData.listings];

    // Status filter: by default, buyers see only available and low stock
    if (filters.activeOnly) {
      result = result.filter(l => (l.status === 'Available' || l.status === 'Low Stock') && l.portionsLeft > 0);
    }

    if (filters.sellerId) {
      result = result.filter(l => l.sellerId === filters.sellerId);
    }

    if (filters.category && filters.category !== 'All') {
      result = result.filter(l => l.category.toLowerCase() === filters.category.toLowerCase());
    }

    if (filters.isDonation !== undefined) {
      result = result.filter(l => l.isDonation === (filters.isDonation === 'true' || filters.isDonation === true));
    }

    if (filters.search) {
      const q = filters.search.toLowerCase();
      result = result.filter(l =>
        l.title.toLowerCase().includes(q) ||
        l.sellerName.toLowerCase().includes(q) ||
        l.location.toLowerCase().includes(q) ||
        l.category.toLowerCase().includes(q)
      );
    }

    // Sort
    if (filters.sortBy === 'price-asc') {
      result.sort((a, b) => a.rescuePrice - b.rescuePrice);
    } else if (filters.sortBy === 'discount-desc') {
      result.sort((a, b) => b.discountPercent - a.discountPercent);
    } else {
      // Default: newest first
      result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }

    return result;
  }

  getListingById(id) {
    this.refreshListingStatuses();
    return this.memoryData.listings.find(l => l.id === id);
  }

  createListing(data) {
    const originalPrice = Number(data.originalPrice) || 500;
    const rescuePrice = Number(data.rescuePrice) || 0;
    const discount = originalPrice > 0 ? Math.round(((originalPrice - rescuePrice) / originalPrice) * 100) : 0;
    const portions = Number(data.portionsTotal || data.portions || 5);

    const newListing = {
      id: `rq-${Date.now().toString().slice(-5)}`,
      title: data.title,
      sellerId: data.sellerId || 'usr-seller-demo',
      sellerName: data.sellerName || 'Crust & Co. Bakery',
      sellerType: data.sellerType || data.category || 'Bakery',
      rating: 4.9,
      reviewsCount: 1,
      location: data.location || 'Bandra West, Mumbai',
      address: data.address || 'Shop 4, Hill Road, Bandra West, Mumbai',
      coordinates: data.coordinates || {
        lat: 19.0596 + (Math.random() - 0.5) * 0.02,
        lng: 72.8350 + (Math.random() - 0.5) * 0.02
      },
      originalPrice,
      rescuePrice,
      discountPercent: discount,
      portionsTotal: portions,
      portionsLeft: portions,
      limitPerBuyer: Number(data.limitPerBuyer) || 3,
      pickupWindow: data.pickupWindow || '20:30 – 22:30 today',
      pickupStart: data.pickupStart || '20:30',
      pickupEnd: data.pickupEnd || '22:30',
      freshnessCutoff: data.freshnessCutoff || 'Best consumed within 4 hours',
      holdTemperature: data.holdTemperature || 'Stored at temperature-controlled conditions',
      status: 'Available',
      isDonation: rescuePrice === 0 || data.isDonation === true,
      category: data.category || 'Bakery',
      image: data.image || 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=800&q=80',
      description: data.description || 'Fresh surplus prepared today, packaged safely according to FSSAI food hygiene standards.',
      allergens: Array.isArray(data.allergens) ? data.allergens : [],
      dietary: Array.isArray(data.dietary) ? data.dietary : ['Vegetarian'],
      fssaiLicense: data.fssaiLicense || 'FSSAI #11521008000452',
      fssaiVerified: true,
      ngoEscalated: data.ngoEscalated || false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    this.memoryData.listings.unshift(newListing);
    this.save();
    return newListing;
  }

  updateListing(id, updates) {
    const idx = this.memoryData.listings.findIndex(l => l.id === id);
    if (idx === -1) return null;

    const existing = this.memoryData.listings[idx];
    const updated = {
      ...existing,
      ...updates,
      updatedAt: new Date().toISOString()
    };

    // Update status if portions changed
    if (updated.portionsLeft <= 0 && updated.status !== 'Donated' && updated.status !== 'Cancelled') {
      updated.status = 'Sold Out';
    } else if (updated.portionsLeft <= 3 && updated.status === 'Available') {
      updated.status = 'Low Stock';
    }

    this.memoryData.listings[idx] = updated;
    this.save();
    return updated;
  }

  deleteListing(id) {
    const idx = this.memoryData.listings.findIndex(l => l.id === id);
    if (idx === -1) return false;

    // Mark as cancelled for historical records rather than losing data
    this.memoryData.listings[idx].status = 'Cancelled';
    this.memoryData.listings[idx].updatedAt = new Date().toISOString();
    this.save();
    return true;
  }

  // --- Orders & Atomic Stock Reservation ---
  createOrder({ rescueId, portions, buyerId, buyerName, paymentMethod }) {
    this.refreshListingStatuses();
    const listing = this.memoryData.listings.find(l => l.id === rescueId);

    if (!listing) {
      throw new Error('Food listing not found');
    }

    if (listing.status === 'Expired') {
      throw new Error('This listing has expired and is no longer available for purchase');
    }

    if (listing.status === 'Cancelled' || listing.status === 'Sold Out') {
      throw new Error('This listing is no longer available');
    }

    const requestedPortions = Number(portions) || 1;

    if (requestedPortions <= 0) {
      throw new Error('Invalid portion count');
    }

    // Atomic concurrency validation
    if (listing.portionsLeft < requestedPortions) {
      throw new Error(`Insufficient stock available. Only ${listing.portionsLeft} portion(s) remaining.`);
    }

    // Deduct stock atomically
    listing.portionsLeft -= requestedPortions;
    if (listing.portionsLeft === 0) {
      listing.status = 'Sold Out';
    } else if (listing.portionsLeft <= 3) {
      listing.status = 'Low Stock';
    }
    listing.updatedAt = new Date().toISOString();

    const orderId = `ord-${Date.now().toString().slice(-6)}`;
    const otp = Math.floor(1000 + Math.random() * 9000).toString();
    const totalAmount = listing.rescuePrice * requestedPortions;
    const savings = (listing.originalPrice - listing.rescuePrice) * requestedPortions;

    const newOrder = {
      id: orderId,
      rescueId: listing.id,
      title: listing.title,
      sellerId: listing.sellerId,
      sellerName: listing.sellerName,
      buyerId: buyerId || 'usr-buyer-demo',
      buyerName: buyerName || 'Rahul Sharma',
      portions: requestedPortions,
      totalAmount,
      savings,
      otp,
      qrData: `RESQ-${orderId}-${otp}-${listing.sellerName.replace(/\s+/g, '')}`,
      pickupWindow: listing.pickupWindow,
      status: 'Ready for Pickup',
      paymentMethod: paymentMethod || 'UPI Sandbox',
      address: listing.address,
      createdAt: new Date().toISOString()
    };

    this.memoryData.orders.unshift(newOrder);

    // Create Buyer Notification
    this.createNotification({
      userId: newOrder.buyerId,
      title: `Order Confirmed: ${listing.title}`,
      message: `Your pickup pass with OTP ${otp} is ready. Pickup window: ${listing.pickupWindow}.`,
      type: 'order',
      link: `/order-confirmation/${orderId}`
    });

    // Create Seller Notification
    this.createNotification({
      userId: listing.sellerId,
      title: `New Order: ${requestedPortions}x ${listing.title}`,
      message: `${newOrder.buyerName} reserved ${requestedPortions} portion(s). Buyer OTP: ${otp}.`,
      type: 'seller',
      link: '/seller'
    });

    this.save();
    return { order: newOrder, updatedListing: listing };
  }

  getOrderById(id) {
    return this.memoryData.orders.find(o => o.id === id);
  }

  getOrdersByBuyer(buyerId) {
    return this.memoryData.orders.filter(o => o.buyerId === buyerId);
  }

  getOrdersBySeller(sellerId) {
    return this.memoryData.orders.filter(o => o.sellerId === sellerId);
  }

  verifyOrderOtp(inputOtp, sellerId) {
    const trimmedOtp = String(inputOtp).trim();
    const order = this.memoryData.orders.find(o => o.otp === trimmedOtp);

    if (!order) {
      return { success: false, message: 'Invalid 4-digit OTP. Please verify with the buyer.' };
    }

    if (order.status === 'Completed' || order.status === 'Picked Up') {
      return { success: false, message: 'This order has already been verified and collected!' };
    }

    order.status = 'Picked Up';
    order.completedAt = new Date().toISOString();

    // Create confirmation notifications
    this.createNotification({
      userId: order.buyerId,
      title: `Handover Complete: ${order.title}`,
      message: `Your food pickup was verified by ${order.sellerName}. Enjoy your meal!`,
      type: 'order',
      link: `/order-confirmation/${order.id}`
    });

    this.createNotification({
      userId: order.sellerId,
      title: `Handover Confirmed: ${order.title}`,
      message: `Successfully verified OTP ${trimmedOtp}. Revenue recorded.`,
      type: 'seller',
      link: '/seller'
    });

    this.save();
    return { success: true, order };
  }

  // --- NGO Donations & Claims ---
  getAvailableDonations() {
    this.refreshListingStatuses();
    return this.memoryData.listings.filter(l =>
      (l.isDonation || l.ngoEscalated || l.rescuePrice === 0) &&
      l.portionsLeft > 0 &&
      l.status !== 'Expired' &&
      l.status !== 'Donated' &&
      l.status !== 'Cancelled'
    );
  }

  claimDonation({ rescueId, ngoId, ngoName, vehicleId }) {
    this.refreshListingStatuses();
    const listing = this.memoryData.listings.find(l => l.id === rescueId);

    if (!listing) {
      throw new Error('Listing not found');
    }

    if (listing.portionsLeft <= 0 || listing.status === 'Donated') {
      throw new Error('This surplus batch has already been claimed');
    }

    const claimedPortions = listing.portionsLeft;

    // Atomically transition listing
    listing.portionsLeft = 0;
    listing.status = 'Donated';
    listing.claimedByNgo = ngoName || 'Roti Bank Mumbai';
    listing.updatedAt = new Date().toISOString();

    const claimRecord = {
      id: `claim-${Date.now()}`,
      rescueId: listing.id,
      rescueTitle: listing.title,
      sellerId: listing.sellerId,
      sellerName: listing.sellerName,
      sellerAddress: listing.address,
      portionsClaimed: claimedPortions,
      ngoId: ngoId || 'usr-ngo-demo',
      ngoName: listing.claimedByNgo,
      vehicleId: vehicleId || 'MH-02-CD-4421',
      claimedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      eta: '25 mins',
      status: 'Dispatched for Pickup',
      createdAt: new Date().toISOString()
    };

    this.memoryData.claims.unshift(claimRecord);

    // Notify NGO
    this.createNotification({
      userId: claimRecord.ngoId,
      title: `Dispatch Confirmed: ${listing.title}`,
      message: `${claimedPortions} portions assigned to vehicle ${claimRecord.vehicleId}. ETA: 25 mins.`,
      type: 'ngo',
      link: '/ngo'
    });

    // Notify Seller
    this.createNotification({
      userId: listing.sellerId,
      title: `NGO Dispatch En Route: ${listing.title}`,
      message: `${claimRecord.ngoName} vehicle ${claimRecord.vehicleId} is dispatched to collect ${claimedPortions} portions.`,
      type: 'seller',
      link: '/seller'
    });

    this.save();
    return { claim: claimRecord, updatedListing: listing };
  }

  getClaimsByNgo(ngoId) {
    return this.memoryData.claims.filter(c => c.ngoId === ngoId);
  }

  getAllClaims() {
    return this.memoryData.claims;
  }

  // --- Notifications ---
  getNotifications(userId) {
    if (!userId) return this.memoryData.notifications;
    return this.memoryData.notifications.filter(n => n.userId === userId || n.userId === 'all');
  }

  createNotification(notifData) {
    const newNotif = {
      id: `notif-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      userId: notifData.userId || 'all',
      title: notifData.title,
      message: notifData.message,
      time: 'Just now',
      read: false,
      type: notifData.type || 'system',
      link: notifData.link || '/',
      createdAt: new Date().toISOString()
    };
    this.memoryData.notifications.unshift(newNotif);
    this.save();
    return newNotif;
  }

  markNotificationRead(id) {
    const notif = this.memoryData.notifications.find(n => n.id === id);
    if (notif) {
      notif.read = true;
      this.save();
    }
    return notif;
  }

  markAllNotificationsRead(userId) {
    this.memoryData.notifications.forEach(n => {
      if (!userId || n.userId === userId || n.userId === 'all') {
        n.read = true;
      }
    });
    this.save();
    return true;
  }

  // --- Dynamic Live Analytics ---
  getSellerAnalytics(sellerId) {
    const listings = this.memoryData.listings.filter(l => l.sellerId === sellerId);
    const listingIds = new Set(listings.map(l => l.id));
    const sellerOrders = this.memoryData.orders.filter(o => listingIds.has(o.rescueId));

    const totalRevenue = sellerOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
    const totalPortionsRescued = sellerOrders.reduce((sum, o) => sum + (o.portions || 0), 0);
    const wasteDivertedKg = Math.round(totalPortionsRescued * IMPACT_PER_MEAL.foodKg * 10) / 10;
    const co2eAvoidedKg = Math.round(totalPortionsRescued * IMPACT_PER_MEAL.co2Kg);

    const totalPortionsListed = listings.reduce((sum, l) => sum + (l.portionsTotal || 0), 0);
    const sellThroughRate = totalPortionsListed > 0
      ? `${Math.round((totalPortionsRescued / totalPortionsListed) * 100)}%`
      : '92%';

    const activeListingsCount = listings.filter(l => l.portionsLeft > 0 && l.status !== 'Expired').length;
    const expiringTonightCount = listings.filter(l => l.portionsLeft > 0 && l.status === 'Low Stock').length;

    // Generate dynamic 7-day revenue array
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const currentDayIdx = (new Date().getDay() + 6) % 7; // Monday = 0
    const dailyAnalytics = days.map((day, idx) => {
      const isToday = idx === currentDayIdx;
      const baseDayRevenue = [1450, 1680, 1390, 1850, 2100, 2350, 1240][idx];
      const baseDayPortions = [22, 26, 21, 28, 32, 36, 19][idx];
      return {
        day,
        revenue: isToday ? baseDayRevenue + totalRevenue : baseDayRevenue,
        portions: isToday ? baseDayPortions + totalPortionsRescued : baseDayPortions,
        wasteKg: parseFloat(((isToday ? baseDayPortions + totalPortionsRescued : baseDayPortions) * IMPACT_PER_MEAL.foodKg).toFixed(1)),
        isToday
      };
    });

    return {
      storeName: 'Crust & Co. Bakery',
      outlet: 'Bandra West Outlet',
      revenueChangeWoW: '+18%',
      revenueRecovered7d: 12450 + totalRevenue,
      portionsRescued7d: 184 + totalPortionsRescued,
      wasteDivertedKg: parseFloat((82.5 + wasteDivertedKg).toFixed(1)),
      co2eAvoidedKg: 442 + co2eAvoidedKg,
      sellThroughRate,
      activeListingsCount,
      expiringTonightCount,
      dailyAnalytics,
      recentOrders: sellerOrders.slice(0, 5)
    };
  }

  getCommunityImpact() {
    this.refreshListingStatuses();
    const orders = this.memoryData.orders || [];
    const claims = this.memoryData.claims || [];
    const listings = this.memoryData.listings || [];

    // All surplus food portions entered into the local ecosystem via listings
    const totalListedPortions = listings.reduce((sum, l) => {
      const p = Number(l.portionsTotal) || Number(l.portions) || Number(l.portionsLeft) || 0;
      return sum + p;
    }, 0);

    const buyerPortions = orders.reduce((sum, o) => sum + (Number(o.portions) || 0), 0);
    const ngoPortions = claims.reduce((sum, c) => sum + (Number(c.portionsClaimed) || 0), 0);

    // Realistic community baseline for local Bandra West pilot network (180 portions)
    const baselineMeals = 180;
    // Total portions mobilized and rescued updates with EACH listing, order, and NGO claim
    const mealsRescued = baselineMeals + totalListedPortions + buyerPortions + ngoPortions;

    // Environmental metrics based on scientific food waste life-cycle assessment:
    // ~2.4 kg CO2e avoided per meal saved
    const co2eAvoidedKg = Math.round(mealsRescued * IMPACT_PER_MEAL.co2Kg);
    const co2eAvoidedTons = parseFloat((co2eAvoidedKg / 1000).toFixed(2));
    const co2Display = co2eAvoidedKg >= 1000 
      ? `${co2eAvoidedTons} t` 
      : `${co2eAvoidedKg} kg`;

    // 1 kg CO2e ≈ 4.1 km not driven in an average petrol vehicle
    const kmDrivenEquivalent = Math.round(co2eAvoidedKg * 4.1);

    // Landfill diversion: ~0.45 kg organic solid food waste kept out of city dump per meal
    const landfillDivertedKg = parseFloat((mealsRescued * IMPACT_PER_MEAL.foodKg).toFixed(1));
    const landfillDisplay = landfillDivertedKg >= 1000
      ? `${(landfillDivertedKg / 1000).toFixed(2)} t`
      : `${landfillDivertedKg} kg`;

    // Practical direct kitchen preparation, steaming, boiling & sanitation water saved (~16 L/meal)
    const waterSavedLitres = Math.round(mealsRescued * IMPACT_PER_MEAL.waterLitres);
    const waterDisplay = `${waterSavedLitres.toLocaleString()} L`;

    // Realistic local human impact (~85% direct consumer/beneficiary ratio)
    const peopleFed = Math.round(mealsRescued * 0.85);

    // Active marketplace counts
    const activeListings = listings.filter(l => (Number(l.portionsLeft) || 0) > 0 && l.status !== 'Expired' && l.status !== 'Cancelled');
    const totalPortionsAvailable = activeListings.reduce((sum, l) => sum + (Number(l.portionsLeft) || 0), 0);

    // Unique verified neighborhood stores currently participating
    const uniqueSellers = new Set(listings.map(l => l.sellerName || l.seller).filter(Boolean));
    const participatingStores = Math.max(uniqueSellers.size, 5);

    // Active local relief NGOs
    const uniqueNgos = new Set(claims.map(c => c.ngoName).filter(Boolean));
    const activeNgoPartners = Math.max(uniqueNgos.size, 3);

    return {
      mealsRescued,
      co2eAvoidedTons,
      co2eAvoidedKg,
      co2Display,
      kmDrivenEquivalent,
      landfillDivertedKg,
      landfillDisplay,
      waterSavedLitres,
      waterDisplay,
      peopleFed,
      participatingStores,
      activeNgoPartners,
      activeListingsCount: activeListings.length,
      totalPortionsAvailable
    };
  }

  getAdminAnalytics() {
    const users = this.memoryData.users;
    const listings = this.memoryData.listings;
    const orders = this.memoryData.orders;
    const claims = this.memoryData.claims;

    const sellersCount = users.filter(u => u.role === 'seller').length;
    const buyersCount = users.filter(u => u.role === 'buyer').length;
    const ngosCount = users.filter(u => u.role === 'ngo').length;

    const activeListings = listings.filter(l => l.status === 'Available' || l.status === 'Low Stock').length;
    const soldListings = listings.filter(l => l.status === 'Sold Out').length;
    const expiredListings = listings.filter(l => l.status === 'Expired').length;
    const donatedListings = listings.filter(l => l.status === 'Donated').length;

    const totalRevenue = orders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
    const totalMealsRedistributed = orders.reduce((sum, o) => sum + (o.portions || 0), 0) +
      claims.reduce((sum, c) => sum + (c.portionsClaimed || 0), 0);

    return {
      totalRegisteredUsers: users.length,
      sellersCount,
      buyersCount,
      ngosCount,
      totalListings: listings.length,
      activeListings,
      soldListings,
      expiredListings,
      donatedListings,
      totalOrders: orders.length,
      totalRevenueRecovered: totalRevenue,
      totalMealsRedistributed,
      totalClaims: claims.length
    };
  }

  resetDatabase() {
    this.memoryData = JSON.parse(JSON.stringify(INITIAL_DATABASE));
    this.save();
    return true;
  }
}

export const db = new Database();
