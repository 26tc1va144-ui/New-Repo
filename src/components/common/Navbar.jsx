import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import {
  UtensilsCrossed,
  MapPin,
  Bell,
  Menu,
  X,
  Store,
  HeartHandshake,
  Compass,
  ShieldCheck,
  BarChart3,
  User,
  ChevronDown,
  Check
} from 'lucide-react';

export default function Navbar({ currentRoute, onNavigate }) {
  const {
    currentRole,
    setCurrentRole,
    unreadCount,
    notifications,
    markNotificationAsRead,
    simulatedLocation
  } = useApp();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notifDropdownOpen, setNotifDropdownOpen] = useState(false);
  const [roleDropdownOpen, setRoleDropdownOpen] = useState(false);

  const notifRef = useRef(null);
  const roleRef = useRef(null);

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setNotifDropdownOpen(false);
      }
      if (roleRef.current && !roleRef.current.contains(event.target)) {
        setRoleDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const navLinks = [
    { label: 'Discover', path: '/browse', icon: Compass },
    { label: 'Map', path: '/map', icon: MapPin },
    { label: 'For Sellers', path: '/seller', icon: Store },
    { label: 'For NGOs', path: '/ngo', icon: HeartHandshake },
    { label: 'Impact', path: '/impact', icon: BarChart3 },
    { label: 'Safety', path: '/safety', icon: ShieldCheck },
  ];

  const handleLinkClick = (path) => {
    onNavigate(path);
    setMobileMenuOpen(false);
  };

  const getRoleLabel = () => {
    if (currentRole === 'seller') return 'Crust & Co. Bakery (Seller)';
    if (currentRole === 'ngo') return 'Roti Bank Mumbai (NGO)';
    return 'Rahul S. (Neighbour)';
  };

  return (
    <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-slate-200/80 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          
          {/* Brand Logo */}
          <div
            onClick={() => handleLinkClick('/')}
            className="flex items-center gap-2.5 cursor-pointer group select-none"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-md shadow-emerald-500/20 group-hover:scale-105 transition-transform">
              <UtensilsCrossed className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-xl tracking-tight text-slate-900 font-display">
                  ResQ<span className="text-emerald-600">Food</span>
                </span>
                <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded">
                  Hub
                </span>
              </div>
              <p className="text-[11px] text-slate-500 leading-tight hidden sm:block">
                Rescue surplus food · Feed hope
              </p>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => {
              const isActive = currentRoute === link.path;
              return (
                <button
                  key={link.path}
                  onClick={() => handleLinkClick(link.path)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-emerald-50 text-emerald-700 font-semibold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
                  }`}
                >
                  {link.label}
                </button>
              );
            })}
          </nav>

          {/* Right Actions: Notifications, Role, Sign In */}
          <div className="flex items-center gap-2 sm:gap-3">
            
            {/* Notification Bell with Dropdown */}
            <div className="relative" ref={notifRef}>
              <button
                onClick={() => setNotifDropdownOpen(!notifDropdownOpen)}
                className="relative p-2 rounded-full text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
                title="Notifications"
                aria-label="Notifications"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-5 h-5 bg-emerald-600 text-white font-bold text-[11px] rounded-full flex items-center justify-center ring-2 ring-white animate-soft-pulse">
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* Notifications Dropdown Panel */}
              {notifDropdownOpen && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 glass-dropdown rounded-2xl shadow-card p-3 z-50 animate-slide-up border border-slate-200">
                  <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100">
                    <span className="font-semibold text-sm text-slate-800">Alerts & Rescues</span>
                    <button
                      onClick={() => {
                        setNotifDropdownOpen(false);
                        handleLinkClick('/notifications');
                      }}
                      className="text-xs text-emerald-600 hover:text-emerald-700 font-medium"
                    >
                      View all ({notifications.length})
                    </button>
                  </div>
                  <div className="space-y-1.5 max-h-72 overflow-y-auto pr-1">
                    {notifications.slice(0, 4).map((notif) => (
                      <div
                        key={notif.id}
                        onClick={() => {
                          markNotificationAsRead(notif.id);
                          if (notif.link) handleLinkClick(notif.link);
                          setNotifDropdownOpen(false);
                        }}
                        className={`p-2.5 rounded-xl cursor-pointer text-xs transition-colors ${
                          notif.read ? 'bg-slate-50 hover:bg-slate-100/80' : 'bg-emerald-50/70 border border-emerald-200/50 hover:bg-emerald-100/60'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-1">
                          <span className={`font-semibold ${notif.read ? 'text-slate-800' : 'text-emerald-900'}`}>
                            {notif.title}
                          </span>
                          <span className="text-[10px] text-slate-400 whitespace-nowrap">{notif.time}</span>
                        </div>
                        <p className="text-slate-600 mt-0.5 line-clamp-2">{notif.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Quick Role Switcher Dropdown */}
            <div className="relative hidden sm:block" ref={roleRef}>
              <button
                onClick={() => setRoleDropdownOpen(!roleDropdownOpen)}
                className="flex items-center gap-2 pl-3 pr-2.5 py-1.5 bg-slate-100/90 hover:bg-slate-200/80 rounded-full text-xs font-semibold text-slate-700 transition-all border border-slate-200"
              >
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="max-w-[140px] truncate">{getRoleLabel()}</span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
              </button>

              {roleDropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 glass-dropdown rounded-2xl shadow-card p-2 z-50 animate-slide-up border border-slate-200">
                  <div className="px-3 py-1.5 text-[11px] font-semibold uppercase text-slate-400">
                    Switch Role Demo
                  </div>
                  {[
                    { id: 'buyer', label: 'Neighbour / Buyer', desc: 'Browse and reserve meals', path: '/browse' },
                    { id: 'seller', label: 'Seller (Bakery)', desc: 'Post surplus & verify OTP', path: '/seller' },
                    { id: 'ngo', label: 'NGO Coordinator', desc: 'Claim bulk surplus', path: '/ngo' }
                  ].map((r) => (
                    <button
                      key={r.id}
                      onClick={() => {
                        setCurrentRole(r.id);
                        setRoleDropdownOpen(false);
                        handleLinkClick(r.path);
                      }}
                      className={`w-full flex items-start justify-between p-2 rounded-xl text-left text-xs transition-all ${
                        currentRole === r.id ? 'bg-emerald-50 text-emerald-900 font-semibold' : 'hover:bg-slate-100 text-slate-700'
                      }`}
                    >
                      <div>
                        <div>{r.label}</div>
                        <div className="text-[10px] text-slate-500 font-normal">{r.desc}</div>
                      </div>
                      {currentRole === r.id && <Check className="w-4 h-4 text-emerald-600 mt-0.5" />}
                    </button>
                  ))}
                  <div className="pt-1.5 mt-1.5 border-t border-slate-100">
                    <button
                      onClick={() => {
                        setRoleDropdownOpen(false);
                        handleLinkClick('/auth');
                      }}
                      className="w-full text-center text-xs text-slate-600 hover:text-emerald-700 py-1"
                    >
                      Role Portal Hub →
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Direct Sign in / Account CTA */}
            <button
              onClick={() => handleLinkClick('/auth')}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-sm transition-all hover:shadow-emerald-600/25"
            >
              <User className="w-3.5 h-3.5" />
              <span>Sign in</span>
            </button>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 lg:hidden"
              aria-label="Toggle Navigation"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-200 bg-white/95 backdrop-blur-md px-4 pt-3 pb-6 space-y-2">
          <div className="pb-2 mb-2 border-b border-slate-100">
            <span className="text-[11px] font-bold uppercase text-slate-400">Navigation</span>
          </div>
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = currentRoute === link.path;
            return (
              <button
                key={link.path}
                onClick={() => handleLinkClick(link.path)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive ? 'bg-emerald-50 text-emerald-700 font-semibold' : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-600' : 'text-slate-400'}`} />
                <span>{link.label}</span>
              </button>
            );
          })}

          <div className="pt-3 border-t border-slate-100">
            <span className="text-[11px] font-bold uppercase text-slate-400 block mb-2">Switch Active Persona</span>
            <div className="grid grid-cols-3 gap-1.5">
              {[
                { id: 'buyer', label: 'Buyer', path: '/browse' },
                { id: 'seller', label: 'Seller', path: '/seller' },
                { id: 'ngo', label: 'NGO', path: '/ngo' }
              ].map((role) => (
                <button
                  key={role.id}
                  onClick={() => {
                    setCurrentRole(role.id);
                    handleLinkClick(role.path);
                  }}
                  className={`py-1.5 text-xs font-semibold rounded-lg border ${
                    currentRole === role.id
                      ? 'bg-emerald-600 text-white border-emerald-600'
                      : 'bg-slate-50 text-slate-700 border-slate-200'
                  }`}
                >
                  {role.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
