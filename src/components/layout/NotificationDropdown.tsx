"use client";

import React, { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Bell,
  Check,
  Clock,
  AlertTriangle,
  Package,
  CheckCircle2,
  Trash2,
  ChevronRight,
} from "lucide-react";

interface NotificationItem {
  id: string;
  title: string;
  description: string;
  time: string;
  type: "order" | "stock" | "delivery" | "procurement";
  isRead: boolean;
  targetPath: string;
}

const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: "notif-1",
    title: "New Order Received",
    description: "Order #ORD001234 from Priya S (5 items - ₹320)",
    time: "2 mins ago",
    type: "order",
    isRead: false,
    targetPath: "/admin/orders",
  },
  {
    id: "notif-2",
    title: "Low Stock Alert",
    description: "Coriander: Current stock 2 bunches (Min: 10 bunches)",
    time: "15 mins ago",
    type: "stock",
    isRead: false,
    targetPath: "/admin/inventory",
  },
  {
    id: "notif-3",
    title: "Delivery Completed",
    description: "Ramesh K successfully delivered #ORD001226",
    time: "1 hour ago",
    type: "delivery",
    isRead: true,
    targetPath: "/admin/delivery",
  },
  {
    id: "notif-4",
    title: "Procurement Due",
    description: "35 items consolidated for tomorrow's orders",
    time: "3 hours ago",
    type: "procurement",
    isRead: true,
    targetPath: "/admin/procurement",
  },
];

export const NotificationDropdown: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [filter, setFilter] = useState<"all" | "unread">("all");
  const [notifications, setNotifications] = useState(INITIAL_NOTIFICATIONS);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  const clearAll = () => {
    setNotifications([]);
  };

  const handleNotificationClick = (item: NotificationItem) => {
    // Mark as read
    setNotifications((prev) =>
      prev.map((n) => (n.id === item.id ? { ...n, isRead: true } : n))
    );
    setIsOpen(false);
    router.push(item.targetPath);
  };

  const getIcon = (type: NotificationItem["type"]) => {
    switch (type) {
      case "order":
        return <Package className="w-4 h-4 text-emerald-600" />;
      case "stock":
        return <AlertTriangle className="w-4 h-4 text-amber-500" />;
      case "delivery":
        return <CheckCircle2 className="w-4 h-4 text-blue-500" />;
      case "procurement":
        return <Clock className="w-4 h-4 text-purple-600" />;
      default:
        return <Clock className="w-4 h-4 text-slate-500" />;
    }
  };

  const displayedNotifications =
    filter === "unread" ? notifications.filter((n) => !n.isRead) : notifications;

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
        title="Notifications"
        aria-label="View notifications"
        aria-expanded={isOpen}
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
          </span>
        )}
      </button>

      {/* Popover Panel */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-3xl shadow-2xl border border-slate-200 py-3 z-50 animate-in fade-in zoom-in-95 duration-150">
          {/* Header */}
          <div className="flex items-center justify-between px-4 pb-2.5 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm text-[#0f2942]">Notifications</span>
              {unreadCount > 0 && (
                <span className="px-2 py-0.5 text-[10px] font-bold bg-[#eaf8f0] text-[#00875a] rounded-full">
                  {unreadCount} unread
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <button
                  type="button"
                  onClick={markAllAsRead}
                  className="text-xs text-[#00875a] hover:text-[#00734d] flex items-center gap-1 font-semibold"
                  title="Mark all as read"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Mark read</span>
                </button>
              )}
              {notifications.length > 0 && (
                <button
                  type="button"
                  onClick={clearAll}
                  className="text-xs text-slate-400 hover:text-red-600 flex items-center gap-1 p-1 rounded-md"
                  title="Clear all notifications"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Filter Tabs: All vs Unread */}
          <div className="flex items-center gap-1 px-4 py-2 bg-slate-50 border-b border-slate-100">
            <button
              type="button"
              onClick={() => setFilter("all")}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${
                filter === "all"
                  ? "bg-white text-[#00875a] shadow-2xs"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              All ({notifications.length})
            </button>
            <button
              type="button"
              onClick={() => setFilter("unread")}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${
                filter === "unread"
                  ? "bg-white text-[#00875a] shadow-2xs"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              Unread ({unreadCount})
            </button>
          </div>

          {/* Notifications List (Clicking navigates to the module!) */}
          <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
            {displayedNotifications.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-500">
                No {filter === "unread" ? "unread " : ""}notifications right now.
              </div>
            ) : (
              displayedNotifications.map((n) => (
                <button
                  key={n.id}
                  type="button"
                  onClick={() => handleNotificationClick(n)}
                  className={`w-full text-left p-3.5 flex items-start gap-3 transition-all group ${
                    n.isRead
                      ? "bg-white hover:bg-slate-50"
                      : "bg-[#eaf8f0]/60 hover:bg-[#eaf8f0] font-medium"
                  }`}
                >
                  <div className="w-8 h-8 rounded-xl bg-slate-100 group-hover:bg-white border border-slate-200/80 flex items-center justify-center flex-shrink-0 mt-0.5 shadow-3xs transition-colors">
                    {getIcon(n.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-bold text-[#0f2942] truncate group-hover:text-[#00875a] transition-colors">
                        {n.title}
                      </p>
                      <span className="text-[10px] text-slate-400 whitespace-nowrap ml-2">
                        {n.time}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 mt-0.5 leading-snug">
                      {n.description}
                    </p>
                    <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-[#00875a] mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <span>Open in {n.title.split(" ")[0]}</span>
                      <ChevronRight className="w-3 h-3" />
                    </span>
                  </div>
                </button>
              ))
            )}
          </div>

          {/* Footer */}
          <div className="px-4 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
            <span>RRV Green Basket Live Alerts</span>
            <span className="text-emerald-600 font-medium">Click any item to view</span>
          </div>
        </div>
      )}
    </div>
  );
};
