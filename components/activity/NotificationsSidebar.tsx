"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";
import { Filter, Search, CalendarDays, ChevronDown, ArrowRight, Activity, Clock } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";

export default function NotificationsSidebar({ stats }: { stats: any }) {
  const [logs, setLogs] = useState<any[]>([]);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const res = await fetch("/api/activity-logs?limit=4");
        if (res.ok) {
          setLogs(await res.json());
        }
      } catch (error) {
        console.error("Failed to fetch logs", error);
      }
    };
    fetchLogs();
  }, []);

  const totalChart = stats ? (stats.rfq + stats.approval + stats.invoice + stats.system) : 0;
  
  const chartData = stats ? [
    { name: "RFQ", value: stats.rfq, color: "#4f46e5" },      // indigo-600
    { name: "Approvals", value: stats.approval, color: "#16a34a" }, // green-600
    { name: "Invoices", value: stats.invoice, color: "#2563eb" },  // blue-600
    { name: "System", value: stats.system, color: "#ef4444" }     // red-500
  ].filter(d => d.value > 0) : [];

  return (
    <div className="flex flex-col gap-6">
      
      {/* Filters Card */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2 text-slate-900 font-bold">
            <Filter size={18} />
            Filters
          </div>
          <button className="text-xs font-medium text-emerald-600 hover:text-emerald-700">Clear All</button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Search</label>
            <div className="relative">
              <input 
                type="text" 
                placeholder="Search notifications..." 
                className="w-full pl-3 pr-8 py-2 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
              <Search size={14} className="absolute right-3 top-2.5 text-slate-400" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Date Range</label>
            <div className="relative">
              <input 
                type="text" 
                placeholder="20 May 2024 - 27 May 2024" 
                className="w-full pl-8 pr-3 py-2 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
              <CalendarDays size={14} className="absolute left-3 top-2.5 text-slate-400" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Category</label>
            <div className="relative">
              <select className="w-full pl-3 pr-8 py-2 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 appearance-none focus:outline-none focus:ring-1 focus:ring-emerald-500">
                <option>All Categories</option>
              </select>
              <ChevronDown size={14} className="absolute right-3 top-2.5 text-slate-400 pointer-events-none" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Status</label>
            <div className="relative">
              <select className="w-full pl-3 pr-8 py-2 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 appearance-none focus:outline-none focus:ring-1 focus:ring-emerald-500">
                <option>All Status</option>
              </select>
              <ChevronDown size={14} className="absolute right-3 top-2.5 text-slate-400 pointer-events-none" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Priority</label>
            <div className="relative">
              <select className="w-full pl-3 pr-8 py-2 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 appearance-none focus:outline-none focus:ring-1 focus:ring-emerald-500">
                <option>All Priority</option>
              </select>
              <ChevronDown size={14} className="absolute right-3 top-2.5 text-slate-400 pointer-events-none" />
            </div>
          </div>

          <button className="w-full py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 transition-colors mt-2">
            Apply Filters
          </button>
        </div>
      </div>

      {/* Activity Summary */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
        <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-1">
          Activity Summary <span className="font-normal text-slate-500">(This Week)</span>
        </h3>
        
        <div className="flex items-center justify-between">
          <div className="relative w-28 h-28 flex-shrink-0">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={30}
                  outerRadius={45}
                  paddingAngle={2}
                  dataKey="value"
                  stroke="none"
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value: any, name: any) => [value, name]}
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-lg font-bold text-slate-900">{totalChart}</span>
              <span className="text-[10px] text-slate-500 -mt-1">Total</span>
            </div>
          </div>
          
          <div className="flex-1 pl-4 space-y-2">
            {chartData.map((item) => {
              const percentage = totalChart > 0 ? Math.round((item.value / totalChart) * 100) : 0;
              return (
                <div key={item.name} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="text-slate-600 font-medium">{item.name}</span>
                  </div>
                  <div className="flex gap-2">
                    <span className="text-slate-900 font-medium">{item.value}</span>
                    <span className="text-slate-400 w-8 text-right">({percentage}%)</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Recent Audit Logs */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-slate-900">Recent Audit Logs</h3>
          <button className="text-xs font-medium text-emerald-600 hover:text-emerald-700">View All</button>
        </div>

        <div className="space-y-4">
          {logs.map((log) => (
            <div key={log.id} className="flex gap-3">
              <div className="mt-0.5">
                <div className="w-4 h-4 rounded-full border-2 border-emerald-500 bg-white" />
              </div>
              <div>
                <p className="text-xs text-slate-700 leading-snug">
                  <span className="font-bold text-slate-900">{log.user?.name || "System"}</span> {log.description || log.action}
                </p>
                <p className="text-[10px] text-slate-500 mt-0.5">
                  {format(new Date(log.createdAt), "dd MMM yyyy, hh:mm a")}
                </p>
              </div>
            </div>
          ))}

          {logs.length === 0 && (
            <div className="text-xs text-slate-500 text-center py-2">No recent logs</div>
          )}
        </div>

        <button className="flex items-center gap-1 text-xs font-medium text-emerald-600 hover:text-emerald-700 mt-5 pt-4 border-t border-slate-100 w-full justify-start transition-colors">
          View All Audit Logs <ArrowRight size={12} />
        </button>
      </div>

    </div>
  );
}
