import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Bell,
  CheckCheck,
  Clock,
  Sparkles,
  ShoppingBag,
  HeartHandshake,
  ArrowRight,
  Filter
} from 'lucide-react';

export default function NotificationsPage({ onNavigate }) {
  const {
    notifications,
    unreadCount,
    markNotificationAsRead,
    markAllNotificationsAsRead
  } = useApp();

  const [activeTab, setActiveTab] = useState('all'); // 'all' | 'rescue' | 'order' | 'ngo'

  const filteredNotifications = notifications.filter((n) => {
    if (activeTab === 'all') return true;
    return n.type === activeTab;
  });

  const getIcon = (type) => {
    switch (type) {
      case 'rescue': return <Sparkles className="w-4 h-4 text-emerald-600" />;
      case 'order': return <ShoppingBag className="w-4 h-4 text-blue-600" />;
      case 'ngo': return <HeartHandshake className="w-4 h-4 text-rose-600" />;
      default: return <Bell className="w-4 h-4 text-slate-600" />;
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-4 border-b border-slate-200/80">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight font-display">
            Notifications
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            <span className="font-semibold text-emerald-700">{unreadCount} unread alerts</span> · Never miss a nearby rescue or pickup window.
          </p>
        </div>

        {unreadCount > 0 && (
          <button
            onClick={markAllNotificationsAsRead}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200/80 text-slate-700 text-xs font-semibold transition-colors"
          >
            <CheckCheck className="w-4 h-4 text-emerald-600" />
            <span>Mark all as read</span>
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {[
          { id: 'all', label: 'All Alerts' },
          { id: 'rescue', label: 'New Rescues' },
          { id: 'order', label: 'Orders & Pickups' },
          { id: 'ngo', label: 'NGO Bulletins' }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
              activeTab === tab.id
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Notifications List */}
      <div className="space-y-3">
        {filteredNotifications.map((notif) => (
          <div
            key={notif.id}
            onClick={() => {
              markNotificationAsRead(notif.id);
              if (notif.link) onNavigate(notif.link);
            }}
            className={`p-4 sm:p-5 rounded-2xl border transition-all cursor-pointer flex items-start gap-4 ${
              notif.read
                ? 'bg-white border-slate-200 hover:border-slate-300'
                : 'bg-emerald-50/70 border-emerald-300 shadow-soft hover:bg-emerald-100/60'
            }`}
          >
            <div className="w-10 h-10 rounded-2xl bg-white border border-slate-200 flex items-center justify-center shrink-0 shadow-sm">
              {getIcon(notif.type)}
            </div>

            <div className="flex-1 space-y-1">
              <div className="flex items-center justify-between gap-2">
                <h3 className={`text-sm font-bold ${notif.read ? 'text-slate-800' : 'text-emerald-950 font-display'}`}>
                  {notif.title}
                </h3>
                <span className="text-[11px] text-slate-400 whitespace-nowrap flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {notif.time}
                </span>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed">
                {notif.description}
              </p>

              <div className="pt-2 flex items-center justify-between">
                <span className="text-[11px] text-emerald-700 font-bold flex items-center gap-1 group-hover:underline">
                  <span>Take action</span>
                  <ArrowRight className="w-3 h-3" />
                </span>

                {!notif.read && (
                  <span className="w-2 h-2 rounded-full bg-emerald-600" />
                )}
              </div>
            </div>
          </div>
        ))}

        {filteredNotifications.length === 0 && (
          <div className="text-center py-12 bg-white rounded-3xl border border-dashed border-slate-200 text-slate-400 text-xs">
            No notifications in this filter category.
          </div>
        )}
      </div>
    </div>
  );
}
