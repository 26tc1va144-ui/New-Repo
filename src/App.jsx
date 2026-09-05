import React, { useState, useEffect } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import Navbar from './components/common/Navbar';
import Footer from './components/common/Footer';
import DemoNotice from './components/common/DemoNotice';
import ToastContainer from './components/common/ToastContainer';
import { UtensilsCrossed } from 'lucide-react';

// Pages
import HomePage from './pages/HomePage';
import BrowsePage from './pages/BrowsePage';
import MapPage from './pages/MapPage';
import FoodDetailPage from './pages/FoodDetailPage';
import CheckoutPage from './pages/CheckoutPage';
import OrderConfirmationPage from './pages/OrderConfirmationPage';
import SellerDashboardPage from './pages/SellerDashboardPage';
import SellerAnalyticsPage from './pages/SellerAnalyticsPage';
import NgoPortalPage from './pages/NgoPortalPage';
import ImpactPage from './pages/ImpactPage';
import SafetyPage from './pages/SafetyPage';
import NotificationsPage from './pages/NotificationsPage';
import AuthPage from './pages/AuthPage';

function MainApp() {
  const { isAuthenticated } = useApp();

  // Simple client-side routing based on path or hash
  const [currentPath, setCurrentPath] = useState(() => {
    const hash = window.location.hash.replace(/^#/, '');
    return hash || window.location.pathname || '/';
  });

  // Keep path in sync with browser history
  useEffect(() => {
    const handlePopState = () => {
      const hash = window.location.hash.replace(/^#/, '');
      setCurrentPath(hash || window.location.pathname || '/');
    };

    window.addEventListener('popstate', handlePopState);
    window.addEventListener('hashchange', handlePopState);
    return () => {
      window.removeEventListener('popstate', handlePopState);
      window.removeEventListener('hashchange', handlePopState);
    };
  }, []);

  const navigate = (path) => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setCurrentPath(path);
    window.location.hash = path;
  };

  // Route matching helper
  const renderRoute = () => {
    // Exact food detail: /food/:id
    if (currentPath.startsWith('/food/')) {
      const rescueId = currentPath.replace('/food/', '');
      return (
        <FoodDetailPage
          rescueId={rescueId}
          onBack={() => navigate('/browse')}
          onCheckout={(id, portions) => navigate(`/checkout/${id}?portions=${portions}`)}
          onNavigate={navigate}
        />
      );
    }

    // Exact checkout: /checkout/:id
    if (currentPath.startsWith('/checkout/')) {
      const parts = currentPath.replace('/checkout/', '').split('?');
      const rescueId = parts[0];
      const params = new URLSearchParams(parts[1] || '');
      const portions = parseInt(params.get('portions') || '1', 10);

      return (
        <CheckoutPage
          rescueId={rescueId}
          initialPortions={portions}
          onBack={() => navigate(`/food/${rescueId}`)}
          onCompleteOrder={(orderId) => navigate(`/order-confirmation/${orderId}`)}
        />
      );
    }

    // Exact order confirmation: /order-confirmation/:id
    if (currentPath.startsWith('/order-confirmation/')) {
      const orderId = currentPath.replace('/order-confirmation/', '');
      return (
        <OrderConfirmationPage
          orderId={orderId}
          onNavigate={navigate}
        />
      );
    }

    switch (currentPath) {
      case '/':
        return (
          <HomePage
            onNavigate={navigate}
            onSelectRescue={(id) => navigate(`/food/${id}`)}
          />
        );
      case '/browse':
        return (
          <BrowsePage
            onNavigate={navigate}
            onSelectRescue={(id) => navigate(`/food/${id}`)}
          />
        );
      case '/map':
        return (
          <MapPage
            onNavigate={navigate}
            onSelectRescue={(id) => navigate(`/food/${id}`)}
          />
        );
      case '/seller':
        return <SellerDashboardPage onNavigate={navigate} />;
      case '/seller/analytics':
        return <SellerAnalyticsPage onNavigate={navigate} />;
      case '/ngo':
        return <NgoPortalPage onNavigate={navigate} />;
      case '/impact':
        return <ImpactPage onNavigate={navigate} />;
      case '/safety':
        return <SafetyPage onNavigate={navigate} />;
      case '/notifications':
        return <NotificationsPage onNavigate={navigate} />;
      case '/auth':
        return <AuthPage onNavigate={navigate} />;
      default:
        return (
          <HomePage
            onNavigate={navigate}
            onSelectRescue={(id) => navigate(`/food/${id}`)}
          />
        );
    }
  };

  // Compulsory authentication gate for all users
  if (!isAuthenticated) {
    return (
      <div className="flex flex-col min-h-screen bg-[#FBFDFB]">
        {/* Minimal Secured Top Navigation Bar */}
        <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-md shadow-emerald-500/20">
                <UtensilsCrossed className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-extrabold text-xl tracking-tight text-slate-900 font-display">
                    ResQ<span className="text-emerald-600">Food</span>
                  </span>
                  <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded">
                    Security Gate
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 leading-tight hidden sm:block">
                  Surplus food rescue marketplace
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 px-3.5 py-1.5 rounded-full">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Authentication Compulsory for All Users</span>
            </div>
          </div>
        </header>

        {/* Compulsory Authentication Page */}
        <main className="flex-1 flex items-center justify-center py-6">
          <AuthPage onNavigate={navigate} requiredNotice={true} />
        </main>

        {/* Footer */}
        <Footer onNavigate={navigate} />

        {/* Toast Container */}
        <ToastContainer />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-[#FBFDFB]">
      {/* Top Demo Notice Banner */}
      <DemoNotice onNavigate={navigate} />

      {/* Main App Navbar */}
      <Navbar currentRoute={currentPath} onNavigate={navigate} />

      {/* Page Content */}
      <main className="flex-1">
        {renderRoute()}
      </main>

      {/* Footer */}
      <Footer onNavigate={navigate} />

      {/* Global Interactive Toast Notification Container */}
      <ToastContainer />
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <MainApp />
    </AppProvider>
  );
}
