import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import FoodCard from '../components/food/FoodCard';
import {
  Search,
  SlidersHorizontal,
  MapPin,
  Clock,
  Sparkles,
  ArrowUpDown,
  Filter,
  X
} from 'lucide-react';

export default function BrowsePage({ onNavigate, onSelectRescue }) {
  const { dynamicRescues, rescues, simulatedLocation } = useApp();
  const displayRescues = dynamicRescues || rescues;

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [vegetarianOnly, setVegetarianOnly] = useState(false);
  const [donationsOnly, setDonationsOnly] = useState(false);
  const [sortBy, setSortBy] = useState('distance'); // 'distance' | 'price-asc' | 'discount-desc' | 'urgency'

  const categories = ['All', 'Bakery', 'Restaurant', 'Groceries', 'Catering', 'Cafe'];

  // Filter and sort rescues
  const filteredRescues = useMemo(() => {
    return displayRescues
      .filter((rescue) => {
        // Search query
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchTitle = rescue.title.toLowerCase().includes(q);
          const matchSeller = rescue.seller.toLowerCase().includes(q);
          const matchCategory = rescue.category.toLowerCase().includes(q);
          const matchLocation = rescue.location.toLowerCase().includes(q);
          if (!matchTitle && !matchSeller && !matchCategory && !matchLocation) return false;
        }

        // Category filter
        if (selectedCategory !== 'All' && rescue.category !== selectedCategory) {
          return false;
        }

        // Dietary vegetarian filter
        if (vegetarianOnly && !rescue.dietary?.includes('Vegetarian') && !rescue.dietary?.includes('Vegan')) {
          return false;
        }

        // Donations filter
        if (donationsOnly && rescue.rescuePrice !== 0 && !rescue.isDonation) {
          return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'distance') return a.distance - b.distance;
        if (sortBy === 'price-asc') return a.rescuePrice - b.rescuePrice;
        if (sortBy === 'discount-desc') return b.discountPercent - a.discountPercent;
        if (sortBy === 'urgency') {
          if (a.isExpiringSoon && !b.isExpiringSoon) return -1;
          if (!a.isExpiringSoon && b.isExpiringSoon) return 1;
          return a.distance - b.distance;
        }
        return 0;
      });
  }, [rescues, searchQuery, selectedCategory, vegetarianOnly, donationsOnly, sortBy]);

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedCategory('All');
    setVegetarianOnly(false);
    setDonationsOnly(false);
    setSortBy('distance');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-4 border-b border-slate-200/80">
        <div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight font-display">
            Discover rescues
          </h1>
          <div className="flex items-center gap-2 text-sm text-slate-500 mt-1">
            <MapPin className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="font-medium text-slate-700">{simulatedLocation.name}</span>
            <span className="text-slate-400">·</span>
            <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">
              simulated location
            </span>
          </div>
        </div>

        {/* View Map Shortcut */}
        <button
          onClick={() => onNavigate('/map')}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 text-sm font-semibold border border-slate-200 shadow-soft transition-all"
        >
          <MapPin className="w-4 h-4 text-emerald-600" />
          <span>Switch to Map Radar</span>
        </button>
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
            placeholder="Search bakeries, thalis, groceries, or cafes..."
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
                <option value="urgency">Urgency: Ending soon</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Category Pills & Quick Filter Toggles */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* Category Buttons */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                selectedCategory === cat
                  ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-600/20'
                  : 'bg-white text-slate-600 hover:bg-slate-100/80 border border-slate-200/80'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Dietary & Donation Toggles */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setVegetarianOnly(!vegetarianOnly)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
              vegetarianOnly
                ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
            }`}
          >
            🌱 Veg only
          </button>

          <button
            onClick={() => setDonationsOnly(!donationsOnly)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
              donationsOnly
                ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
            }`}
          >
            💚 Free / Donation
          </button>

          {(selectedCategory !== 'All' || vegetarianOnly || donationsOnly || searchQuery) && (
            <button
              onClick={clearFilters}
              className="text-xs text-rose-600 hover:text-rose-700 font-medium px-2 py-1"
            >
              Reset filters
            </button>
          )}
        </div>
      </div>

      {/* Results Header */}
      <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
        <span>Showing {filteredRescues.length} available rescues near you</span>
        <span>Pick up in-person with QR + OTP verification</span>
      </div>

      {/* Food Listings Grid */}
      {filteredRescues.length > 0 ? (
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
          <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 mx-auto">
            <Filter className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 font-display">
            No surplus rescues match your criteria
          </h3>
          <p className="text-sm text-slate-500 max-w-md mx-auto">
            Try resetting your filters or widening your distance radius. Food businesses post new batches throughout the late afternoon and evening!
          </p>
          <button
            onClick={clearFilters}
            className="px-5 py-2.5 rounded-xl bg-emerald-600 text-white font-semibold text-xs shadow-sm hover:bg-emerald-700 transition-colors"
          >
            Clear all filters
          </button>
        </div>
      )}
    </div>
  );
}
