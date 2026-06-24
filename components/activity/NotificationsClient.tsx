"use client";

import { useState, useEffect } from "react";
import { format, formatDistanceToNow } from "date-fns";
import { 
  Bell, FileText, CheckSquare, FileSpreadsheet, Activity,
  CheckCircle2, Clock, Send, Hexagon, Filter, Search, CalendarDays, Settings, 
  ChevronRight, ArrowUpRight, ArrowDownRight, ChevronLeft, ChevronDown
} from "lucide-react";
import NotificationsSidebar from "./NotificationsSidebar";

const tabs = [
  { id: "ALL", label: "All" },
  { id: "UNREAD", label: "Unread" },
  { id: "RFQ", label: "RFQ" },
  { id: "APPROVAL", label: "Approvals" },
  { id: "INVOICE", label: "Invoices" },
  { id: "SYSTEM", label: "System" }
];

export default function NotificationsClient() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [activeTab, setActiveTab] = useState("ALL");
  const [loading, setLoading] = useState(true);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const type = ["ALL", "UNREAD"].includes(activeTab) ? "ALL" : activeTab;
      const status = activeTab === "UNREAD" ? "UNREAD" : "ALL";
      const res = await fetch(`/api/notifications?type=${type}&status=${status}`);
      if (res.ok) {
        const data = await res.json();
        setNotifications(data.notifications);
        setStats(data.stats);
      }
    } catch (error) {
      console.error("Failed to fetch notifications", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, [activeTab]);

  const handleMarkAllAsRead = async () => {
    try {
      await fetch("/api/notifications", { method: "PUT" });
      fetchNotifications();
    } catch (error) {
      console.error("Failed to mark read", error);
    }
  };

  const getIconForType = (type: string) => {
    switch (type) {
      case "RFQ": return <FileText size={18} className="text-indigo-600" />;
      case "APPROVAL": return <CheckSquare size={18} className="text-orange-600" />;
      case "INVOICE": return <FileSpreadsheet size={18} className="text-rose-600" />;
      case "PURCHASE_ORDER": return <CheckCircle2 size={18} className="text-emerald-600" />;
      default: return <Activity size={18} className="text-slate-600" />;
    }
  };

  const getIconBgForType = (type: string) => {
    switch (type) {
      case "RFQ": return "bg-indigo-100";
      case "APPROVAL": return "bg-orange-100";
      case "INVOICE": return "bg-rose-100";
      case "PURCHASE_ORDER": return "bg-emerald-100";
      default: return "bg-slate-100";
    }
  };

  const getBadgeForType = (type: string) => {
    switch (type) {
      case "RFQ": return <span className="px-2 py-1 bg-indigo-50 text-indigo-700 text-xs font-medium rounded">RFQ</span>;
      case "APPROVAL": return <span className="px-2 py-1 bg-orange-50 text-orange-700 text-xs font-medium rounded">Approval</span>;
      case "INVOICE": return <span className="px-2 py-1 bg-rose-50 text-rose-700 text-xs font-medium rounded">Invoice</span>;
      case "PURCHASE_ORDER": return <span className="px-2 py-1 bg-emerald-50 text-emerald-700 text-xs font-medium rounded">PO</span>;
      case "QUOTATION": return <span className="px-2 py-1 bg-purple-50 text-purple-700 text-xs font-medium rounded">Quotation</span>;
      default: return <span className="px-2 py-1 bg-slate-100 text-slate-700 text-xs font-medium rounded">System</span>;
    }
  };

  if (loading && !stats) {
    return <div className="p-8 text-center text-slate-500">Loading notifications...</div>;
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      {/* Header */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-4 flex items-center text-sm text-slate-500">
            <span className="hover:text-slate-900 cursor-pointer">Activity</span>
            <ChevronRight size={16} className="mx-2" />
            <span className="text-slate-900 font-medium">Notifications</span>
          </div>
          
          <div className="py-4">
            <h1 className="text-2xl font-bold text-slate-900">Activity Logs & Notifications</h1>
            <p className="text-slate-500 text-sm mt-1">Stay updated with all procurement activities and system notifications.</p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
                <Bell size={16} />
              </div>
              <span className="text-xs font-medium text-slate-500">Total Notifications</span>
            </div>
            <div className="flex items-end justify-between">
              <span className="text-2xl font-bold text-slate-900">{stats?.total || 0}</span>
              <span className="text-xs font-medium text-emerald-600 flex items-center gap-0.5"><ArrowUpRight size={12}/> 18% <span className="text-slate-400 font-normal ml-1">this week</span></span>
            </div>
          </div>
          
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center">
                <FileText size={16} />
              </div>
              <span className="text-xs font-medium text-slate-500">RFQ Notifications</span>
            </div>
            <div className="flex items-end justify-between">
              <span className="text-2xl font-bold text-slate-900">{stats?.rfq || 0}</span>
              <span className="text-xs font-medium text-emerald-600 flex items-center gap-0.5"><ArrowUpRight size={12}/> 12% <span className="text-slate-400 font-normal ml-1">this week</span></span>
            </div>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center">
                <CheckSquare size={16} />
              </div>
              <span className="text-xs font-medium text-slate-500">Approval Alerts</span>
            </div>
            <div className="flex items-end justify-between">
              <span className="text-2xl font-bold text-slate-900">{stats?.approval || 0}</span>
              <span className="text-xs font-medium text-emerald-600 flex items-center gap-0.5"><ArrowUpRight size={12}/> 8% <span className="text-slate-400 font-normal ml-1">this week</span></span>
            </div>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center">
                <FileSpreadsheet size={16} />
              </div>
              <span className="text-xs font-medium text-slate-500">Invoice Updates</span>
            </div>
            <div className="flex items-end justify-between">
              <span className="text-2xl font-bold text-slate-900">{stats?.invoice || 0}</span>
              <span className="text-xs font-medium text-emerald-600 flex items-center gap-0.5"><ArrowUpRight size={12}/> 15% <span className="text-slate-400 font-normal ml-1">this week</span></span>
            </div>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center">
                <Activity size={16} />
              </div>
              <span className="text-xs font-medium text-slate-500">System Alerts</span>
            </div>
            <div className="flex items-end justify-between">
              <span className="text-2xl font-bold text-slate-900">{stats?.system || 0}</span>
              <span className="text-xs font-medium text-rose-600 flex items-center gap-0.5"><ArrowDownRight size={12}/> 5% <span className="text-slate-400 font-normal ml-1">this week</span></span>
            </div>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* Main List */}
          <div className="flex-1 bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            
            {/* Tabs & Actions */}
            <div className="flex flex-col sm:flex-row items-center justify-between border-b border-slate-200 p-4 gap-4">
              <div className="flex space-x-1 overflow-x-auto w-full sm:w-auto">
                {tabs.map((tab) => {
                  let count = "";
                  if (stats) {
                    if (tab.id === "UNREAD") count = ` (${stats.unread})`;
                    if (tab.id === "RFQ") count = ` (${stats.rfq})`;
                    if (tab.id === "APPROVAL") count = ` (${stats.approval})`;
                    if (tab.id === "INVOICE") count = ` (${stats.invoice})`;
                    if (tab.id === "SYSTEM") count = ` (${stats.system})`;
                  }
                  
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`px-4 py-2 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                        activeTab === tab.id 
                        ? "border-emerald-500 text-emerald-600" 
                        : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"
                      }`}
                    >
                      {tab.label}{count}
                    </button>
                  );
                })}
              </div>
              <div className="flex items-center gap-3">
                <button 
                  onClick={handleMarkAllAsRead}
                  className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-slate-700 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
                >
                  <CheckSquare size={14} />
                  Mark all as read
                </button>
                <button className="p-1.5 text-slate-400 hover:text-slate-600 border border-slate-300 rounded-lg">
                  <Settings size={18} />
                </button>
              </div>
            </div>

            {/* List */}
            <div className="divide-y divide-slate-100 min-h-[500px]">
              {loading ? (
                <div className="p-8 text-center text-slate-500">Loading...</div>
              ) : notifications.length === 0 ? (
                <div className="p-8 text-center text-slate-500">No notifications found.</div>
              ) : (
                notifications.map((notification) => (
                  <div key={notification.id} className={`p-5 flex items-start gap-4 hover:bg-slate-50 transition-colors ${!notification.isRead ? 'bg-blue-50/30' : ''}`}>
                    <div className="flex-shrink-0 mt-1">
                      <div className={`w-2 h-2 rounded-full ${!notification.isRead ? 'bg-blue-500' : 'bg-slate-300'}`} />
                    </div>
                    <div className="flex-shrink-0">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${getIconBgForType(notification.type)}`}>
                        {getIconForType(notification.type)}
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                        <div>
                          <p className="text-sm font-bold text-slate-900">{notification.title}</p>
                          <p className="text-sm text-slate-600 mt-0.5 pr-4 leading-relaxed">{notification.message}</p>
                        </div>
                        <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between gap-2 flex-shrink-0">
                          {getBadgeForType(notification.type)}
                          <div className="text-right">
                            <p className="text-xs text-slate-500 whitespace-nowrap">{formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Pagination Placeholder */}
            <div className="p-4 border-t border-slate-200 flex items-center justify-center gap-2 text-sm text-slate-600">
              <button className="p-1 hover:text-slate-900"><ChevronLeft size={16} /></button>
              <button className="w-8 h-8 flex items-center justify-center rounded-md bg-emerald-600 text-white font-medium">1</button>
              <button className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-slate-100">2</button>
              <button className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-slate-100">3</button>
              <span className="px-2">...</span>
              <button className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-slate-100">20</button>
              <button className="p-1 hover:text-slate-900"><ChevronRight size={16} /></button>
            </div>
            
          </div>

          {/* Sidebar Area */}
          <div className="w-full lg:w-80">
            <NotificationsSidebar stats={stats} />
          </div>

        </div>
      </div>
    </div>
  );
}
