import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import FoodCard from '../components/food/FoodCard';
import {
  Search,
  MapPin,
  Clock,
  Sparkles,
  ArrowUpDown,
  Filter,
  X,
  Flame,
  Heart,
  Utensils
} from 'lucide-react';

export default function BrowsePage({ onNavigate, onSelectRescue }) {
  const { dynamicRescues, rescues, simulatedLocation, loading } = useApp();
  const displayRescues = dynamicRescues || rescues;

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDiningCategory, setSelectedDiningCategory] = useState('All');
  const [vegetarianOnly, setVegetarianOnly] = useState(false);
  const [jainOnly, setJainOnly] = useState(false);
  const [underFiftyOnly, setUnderFiftyOnly] = useState(false);
  const [donationsOnly, setDonationsOnly] = useState(false);
  const [expiringOnly, setExpiringOnly] = useState(false);
  const [sortBy, setSortBy] = useState('distance'); // 'distance' | 'price-asc' | 'discount-desc' | 'urgency'

  // Indian Dining Meal Periods
  const getIndianDiningPeriod = () => {
    const hour = new Date().getHours();
    if (hour >= 6 && hour < 11) {
      return {
        badge: 'नाश्ता समय · Morning Nashta',
        title: 'Morning South Indian Tiffins & Nashta',
        desc: 'Freshly made Ghee Dosas, fluffy Idlis, Medu Vadas & Chai Snacks ready for morning rescue.',
        icon: '🌅',
        targetCategory: 'Breakfast & Nashta'
      };
    } else if (hour >= 11 && hour < 16) {
      return {
        badge: 'दोपहर का भोजन · Lunchtime Thalis',
        title: 'Lunch Thalis & Student Mess Tiffins',
        desc: 'Steaming North Indian Deluxe Thalis, Rajma Chawal combos and student hostel dining batches.',
        icon: '☀️',
        targetCategory: 'Thalis & Combos'
      };
    } else if (hour >= 16 && hour < 19) {
      return {
        badge: 'चाय-नाश्ता · Evening Snacks',
        title: 'Crispy Samosas, Pav Bhaji & Evening Chaat',
        desc: 'Golden Punjabi Samosas, hot Jalebis and buttery Gwalior Bedai & Pav Bhaji in hot holding now.',
        icon: '☕',
        targetCategory: 'Chaat & Snacks'
      };
    } else {
      return {
        badge: 'रात का भोजन · Dinner Specials',
        title: 'Dinner Thalis, Dum Biryani & Homestyle Tiffins',
        desc: 'Hot Hyderabadi Biryani Handis, Paneer Butter Masala and late-night hostel mess dinner packs.',
        icon: '🌙',
        targetCategory: 'Biryani & Rice'
      };
    }
  };

  const diningPeriod = getIndianDiningPeriod();

  // Indian Dining Occasions & Meal Categories
  const INDIAN_DINING_CATEGORIES = [
    { id: 'All', label: 'All Dishes', hindi: 'सभी व्यंजन', icon: '🍛' },
    { id: 'Thalis & Combos', label: 'Thalis & Meals', hindi: 'थाली और भोजन', icon: '🍱' },
    { id: 'Mess & Hostel', label: 'Mess & Hostel', hindi: 'मेस / हॉस्टल', icon: '🥣' },
    { id: 'Biryani & Rice', label: 'Biryani & Pulao', hindi: 'दम बिरयानी', icon: '🍚' },
    { id: 'Breakfast & Nashta', label: 'Breakfast & Nashta', hindi: 'नाश्ता', icon: '🥞' },
    { id: 'Chaat & Snacks', label: 'Chaat & Samosas', hindi: 'चाट-समोसा', icon: '🥟' },
    { id: 'Household', label: 'Ghar Ka Khana', hindi: 'घर का खाना', icon: '🏡' },
    { id: 'Mithai', label: 'Mithai & Sweets', hindi: 'मिठाई', icon: '🍨' },
    { id: 'Groceries', label: 'Sabzi & Mandi', hindi: 'सब्जी मंडी', icon: '🛒' },
    { id: 'Bakery', label: 'Bakery & Bread', hindi: 'बेकरी', icon: '🥖' }
  ];

  // Filter and sort rescues as per Indian Dining
  const filteredRescues = useMemo(() => {
    return (displayRescues || [])
      .filter((rescue) => {
        // Search query (handles Hindi and Indian English food names)
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchTitle = rescue.title?.toLowerCase().includes(q);
          const matchSeller = (rescue.seller || rescue.sellerName || '').toLowerCase().includes(q);
          const matchCategory = (rescue.category || '').toLowerCase().includes(q);
          const matchDining = (rescue.diningType || '').toLowerCase().includes(q);
          const matchDesc = (rescue.description || '').toLowerCase().includes(q);
          const matchLocation = (rescue.location || '').toLowerCase().includes(q);
          if (!matchTitle && !matchSeller && !matchCategory && !matchDining && !matchDesc && !matchLocation) {
            return false;
          }
        }

        // Category filter mapped to Indian dining occasions
        if (selectedDiningCategory !== 'All') {
          const cat = (rescue.category || '').toLowerCase();
          const dining = (rescue.diningType || '').toLowerCase();
          const title = (rescue.title || '').toLowerCase();
          const desc = (rescue.description || '').toLowerCase();

          if (selectedDiningCategory === 'Thalis & Combos') {
            const match = dining.includes('thali') || cat.includes('thali') || title.includes('thali') || title.includes('meal') || title.includes('combo') || desc.includes('thali');
            if (!match) return false;
          } else if (selectedDiningCategory === 'Mess & Hostel') {
            const match = cat.includes('hostel') || cat.includes('mess') || dining.includes('hostel') || dining.includes('mess') || title.includes('hostel') || title.includes('mess') || title.includes('tiffin');
            if (!match) return false;
          } else if (selectedDiningCategory === 'Biryani & Rice') {
            const match = dining.includes('biryani') || title.includes('biryani') || title.includes('pulao') || title.includes('rice') || title.includes('chawal');
            if (!match) return false;
          } else if (selectedDiningCategory === 'Breakfast & Nashta') {
            const match = dining.includes('breakfast') || dining.includes('nashta') || title.includes('dosa') || title.includes('idli') || title.includes('poha') || title.includes('paratha') || title.includes('nashta');
            if (!match) return false;
          } else if (selectedDiningCategory === 'Chaat & Snacks') {
            const match = dining.includes('snack') || dining.includes('chaat') || title.includes('samosa') || title.includes('pav bhaji') || title.includes('chaat') || title.includes('puff') || title.includes('vada');
            if (!match) return false;
          } else if (selectedDiningCategory === 'Household') {
            const match = cat.includes('household') || dining.includes('household') || title.includes('ghar') || desc.includes('home');
            if (!match) return false;
          } else if (selectedDiningCategory === 'Mithai') {
            const match = dining.includes('mithai') || title.includes('mithai') || title.includes('sweet') || title.includes('jamun') || title.includes('jalebi') || title.includes('ladoo') || title.includes('halwa');
            if (!match) return false;
          } else if (selectedDiningCategory === 'Groceries') {
            const match = cat.includes('groceries') || title.includes('sabzi') || title.includes('mandi') || title.includes('produce') || title.includes('fruit');
            if (!match) return false;
          } else if (selectedDiningCategory === 'Bakery') {
            const match = cat.includes('bakery') || title.includes('sourdough') || title.includes('croissant') || title.includes('bread');
            if (!match) return false;
          }
        }

        // Pure Veg filter (100% शाकाहारी)
        if (vegetarianOnly && !rescue.dietary?.includes('Vegetarian') && !rescue.dietary?.includes('Vegan')) {
          return false;
        }

        // Jain Friendly filter (No onion, garlic / जैन)
        if (jainOnly && !rescue.dietary?.includes('Jain')) {
          return false;
        }

        // Budget meals under ₹50 filter
        if (underFiftyOnly && rescue.rescuePrice > 50) {
          return false;
        }

        // 100% Free Langar / NGO Claim filter
        if (donationsOnly && rescue.rescuePrice !== 0 && !rescue.isDonation) {
          return false;
        }

        // Expiring Soon filter
        if (expiringOnly && !rescue.isExpiringSoon && rescue.status !== 'Low Stock') {
          return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'distance') return (a.distance || 1) - (b.distance || 1);
        if (sortBy === 'price-asc') return a.rescuePrice - b.rescuePrice;
        if (sortBy === 'discount-desc') return (b.discountPercent || 0) - (a.discountPercent || 0);
        if (sortBy === 'urgency') {
          if (a.isExpiringSoon && !b.isExpiringSoon) return -1;
          if (!a.isExpiringSoon && b.isExpiringSoon) return 1;
          return (a.distance || 1) - (b.distance || 1);
        }
        return 0;
      });
  }, [displayRescues, searchQuery, selectedDiningCategory, vegetarianOnly, jainOnly, underFiftyOnly, donationsOnly, expiringOnly, sortBy]);

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedDiningCategory('All');
    setVegetarianOnly(false);
    setJainOnly(false);
    setUnderFiftyOnly(false);
    setDonationsOnly(false);
    setExpiringOnly(false);
    setSortBy('distance');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-4 border-b border-slate-200/80">
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-2 text-xs font-bold text-emerald-700 uppercase tracking-wider bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
            <Utensils className="w-3.5 h-3.5 text-emerald-600" />
            <span>भारतीय भोजन भंडार · Indian Dining Marketplace</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight font-display">
            Discover Indian Dining & Rescues
          </h1>
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <MapPin className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="font-semibold text-slate-700">{simulatedLocation?.name || 'City Center, Gwalior'}</span>
            <span className="text-slate-300">·</span>
            <span className="text-xs text-slate-500">
              Hot thalis, student mess tiffins, biryani & evening snacks
            </span>
          </div>
        </div>

        {/* View Map Shortcut */}
        <button
          onClick={() => onNavigate('/map')}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 text-sm font-semibold border border-slate-200 shadow-soft transition-all shrink-0"
        >
          <MapPin className="w-4 h-4 text-emerald-600" />
          <span>View Neighborhood Map Radar</span>
        </button>
      </div>

      {/* Indian Dining Meal-Time Rhythm Banner */}
      <div className="bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 text-white rounded-3xl p-6 sm:p-7 shadow-card relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-emerald-500/10 pointer-events-none blur-3xl" />
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 relative z-10">
          <div className="space-y-1.5 max-w-2xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-bold uppercase tracking-wider">
              <span>{diningPeriod.icon}</span>
              <span>{diningPeriod.badge}</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black font-display tracking-tight text-white">
              {diningPeriod.title}
            </h2>
            <p className="text-xs sm:text-sm text-emerald-100/80">
              {diningPeriod.desc}
            </p>
          </div>

          <button
            onClick={() => setSelectedDiningCategory(diningPeriod.targetCategory)}
            className="shrink-0 px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold shadow-md transition-all flex items-center gap-2"
          >
            <span>View {diningPeriod.targetCategory}</span>
            <Sparkles className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Search & Sort Controls Bar */}
      <div className="flex flex-col lg:flex-row gap-4">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search Thali, Samosa, Biryani, Hostel Mess, Dosa, Poha, Mithai, Dal..."
            className="w-full pl-10 pr-10 py-3 bg-white border border-slate-200 rounded-2xl text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all shadow-soft"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Sort Dropdown */}
        <div className="flex items-center gap-2">
          <div className="relative w-full sm:w-auto">
            <div className="flex items-center gap-2 bg-white px-3.5 py-3 border border-slate-200 rounded-2xl shadow-soft">
              <ArrowUpDown className="w-4 h-4 text-slate-500 shrink-0" />
              <span className="text-xs text-slate-500 font-medium whitespace-nowrap">Sort by:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-transparent text-sm font-semibold text-slate-800 focus:outline-none cursor-pointer pr-2"
              >
                <option value="distance">Closest first</option>
                <option value="price-asc">Price: Low to high</option>
                <option value="discount-desc">Discount %: Highest</option>
                <option value="urgency">Ending Soon (Urgent)</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Indian Dining Occasion Tabs */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Indian Dining Categories (भोजन की श्रेणियाँ)
          </span>
          {selectedDiningCategory !== 'All' && (
            <button
              onClick={() => setSelectedDiningCategory('All')}
              className="text-xs text-emerald-600 hover:text-emerald-700 font-semibold"
            >
              Show all
            </button>
          )}
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin">
          {INDIAN_DINING_CATEGORIES.map((cat) => {
            const isSelected = selectedDiningCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedDiningCategory(cat.id)}
                className={`px-4 py-2.5 rounded-2xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-2 border ${
                  isSelected
                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-md shadow-emerald-600/20 scale-105'
                    : 'bg-white text-slate-700 hover:bg-slate-50 border-slate-200 hover:border-slate-300'
                }`}
              >
                <span className="text-base">{cat.icon}</span>
                <span>{cat.label}</span>
                <span className={`text-[10px] font-normal px-1.5 py-0.5 rounded-md ${
                  isSelected ? 'bg-emerald-700/60 text-emerald-100' : 'bg-slate-100 text-slate-500'
                }`}>
                  {cat.hindi}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Indian Dietary & Special Filter Toggles */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-soft">
        <div className="flex flex-wrap items-center gap-2">
          {/* 100% Pure Veg (शाकाहारी) */}
          <button
            onClick={() => setVegetarianOnly(!vegetarianOnly)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all flex items-center gap-1.5 ${
              vegetarianOnly
                ? 'bg-emerald-50 text-emerald-800 border-emerald-400 shadow-xs'
                : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
            }`}
          >
            <span className="w-3.5 h-3.5 bg-white rounded-xs border-2 border-emerald-600 flex items-center justify-center shrink-0">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
            </span>
            <span>100% Pure Veg (शाकाहारी)</span>
          </button>

          {/* Jain Friendly (बिना प्याज-लहसुन) */}
          <button
            onClick={() => setJainOnly(!jainOnly)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all flex items-center gap-1.5 ${
              jainOnly
                ? 'bg-amber-50 text-amber-900 border-amber-400 shadow-xs'
                : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
            }`}
          >
            <span>🕉️</span>
            <span>Jain Friendly (जैन भोजन)</span>
          </button>

          {/* Affordable Meals Under ₹50 */}
          <button
            onClick={() => setUnderFiftyOnly(!underFiftyOnly)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all flex items-center gap-1.5 ${
              underFiftyOnly
                ? 'bg-amber-100 text-amber-950 border-amber-400 shadow-xs'
                : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
            }`}
          >
            <span>🪙</span>
            <span>Meals Under ₹50 (किफायती भोजन)</span>
          </button>

          {/* 100% Free Langar / NGO Seva */}
          <button
            onClick={() => setDonationsOnly(!donationsOnly)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all flex items-center gap-1.5 ${
              donationsOnly
                ? 'bg-purple-50 text-purple-900 border-purple-400 shadow-xs'
                : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
            }`}
          >
            <Heart className="w-3.5 h-3.5 fill-purple-600 text-purple-600" />
            <span>Free Langar / NGO Seva</span>
          </button>

          {/* Ending Soon (< 2 hours) */}
          <button
            onClick={() => setExpiringOnly(!expiringOnly)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all flex items-center gap-1.5 ${
              expiringOnly
                ? 'bg-rose-50 text-rose-800 border-rose-300 shadow-xs'
                : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
            }`}
          >
            <Clock className="w-3.5 h-3.5 text-rose-600" />
            <span>Ending Soon (&lt; 2 hrs)</span>
          </button>
        </div>

        {(selectedDiningCategory !== 'All' || vegetarianOnly || jainOnly || donationsOnly || expiringOnly || searchQuery) && (
          <button
            onClick={clearFilters}
            className="text-xs text-rose-600 hover:text-rose-700 font-bold px-3 py-1.5 rounded-lg hover:bg-rose-50 transition-colors"
          >
            Reset all filters
          </button>
        )}
      </div>

      {/* Results Header */}
      <div className="flex items-center justify-between text-xs text-slate-500 font-medium px-1">
        <span>Showing <strong className="text-slate-800 font-bold">{filteredRescues.length}</strong> available Indian dining portions</span>
        <span>All meals inspected under FSSAI food hygiene parameters</span>
      </div>

      {/* Food Listings Grid */}
      {loading && filteredRescues.length === 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map(n => (
            <div key={n} className="bg-white rounded-3xl border border-slate-100 p-5 space-y-4 animate-pulse">
              <div className="w-full h-48 bg-slate-200 rounded-2xl" />
              <div className="h-4 bg-slate-200 rounded w-3/4" />
              <div className="h-3 bg-slate-200 rounded w-1/2" />
              <div className="h-8 bg-slate-200 rounded-xl" />
            </div>
          ))}
        </div>
      ) : filteredRescues.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRescues.map((rescue) => (
            <FoodCard
              key={rescue.id}
              rescue={rescue}
              onSelect={onSelectRescue}
              onQuickReserve={() => onNavigate(`/checkout/${rescue.id}`)}
            />
          ))}
        </div>
      ) : (
        /* Empty State */
        <div className="text-center py-16 bg-white rounded-3xl border border-dashed border-slate-200 p-8 space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center mx-auto text-2xl">
            🍛
          </div>
          <h3 className="text-lg font-bold text-slate-900 font-display">
            No dishes currently listed in this Indian dining category
          </h3>
          <p className="text-sm text-slate-500 max-w-md mx-auto leading-relaxed">
            Local messes, dhabas, hostels, and restaurants post fresh surplus portions during transition windows (around 3 PM and 8:30 PM). Try resetting filters to explore other meals!
          </p>
          <button
            onClick={clearFilters}
            className="px-5 py-2.5 rounded-xl bg-emerald-600 text-white font-semibold text-xs shadow-sm hover:bg-emerald-700 transition-colors"
          >
            Explore all Indian dishes
          </button>
        </div>
      )}
    </div>
  );
}
