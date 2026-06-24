"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";
import { 
  Download, CalendarDays, ChevronDown, ChevronRight, 
  ArrowUpRight, ArrowDownRight, FileText, FileSpreadsheet
} from "lucide-react";
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
  PieChart, Pie, Cell, ScatterChart, Scatter, ZAxis
} from "recharts";

export default function ReportsOverviewClient() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch("/api/reports/overview");
        if (res.ok) {
          setData(await res.json());
        }
      } catch (error) {
        console.error("Failed to fetch reports data", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(value);
  };

  const formatCr = (value: number) => {
    return `₹ ${(value / 10000000).toFixed(2)} Cr`;
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <svg key={star} className={`w-3 h-3 ${star <= rating ? 'text-amber-400' : 'text-slate-200'}`} fill="currentColor" viewBox="0 0 20 20">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        ))}
        <span className="text-xs font-medium text-slate-700 ml-1">{rating.toFixed(1)}</span>
      </div>
    );
  };

  if (loading || !data) {
    return <div className="p-8 text-center text-slate-500">Loading analytics...</div>;
  }

  const { stats, summary, categorySpend, topVendors, monthlyTrend, scatterData } = data;

  const PIE_COLORS = ["#2563eb", "#4f46e5", "#16a34a", "#f59e0b", "#a855f7", "#64748b"];

  const CustomTooltipLine = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-900 text-white text-xs px-3 py-2 rounded shadow-lg">
          <p className="font-medium mb-1">{label}</p>
          <p>{formatCr(payload[0].value)}</p>
        </div>
      );
    }
    return null;
  };

  const CustomTooltipScatter = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-slate-900 text-white text-xs px-3 py-2 rounded shadow-lg">
          <p className="font-medium mb-1">{data.name}</p>
          <p>Rating: {data.y}</p>
          <p>Delivery: {data.x}%</p>
          <p>Spend: {formatCurrency(data.z)}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      {/* Header */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-4 flex items-center text-sm text-slate-500">
            <span className="hover:text-slate-900 cursor-pointer">Reports & Analytics</span>
            <ChevronRight size={16} className="mx-2" />
            <span className="text-slate-900 font-medium">Overview</span>
          </div>
          
          <div className="py-4 flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Reports & Analytics</h1>
              <p className="text-slate-500 text-sm mt-1">Track procurement performance and make data-driven decisions.</p>
            </div>
            
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2 px-3 py-1.5 border border-slate-300 rounded-lg bg-white text-sm">
                <span className="text-slate-500">Date Range</span>
                <ChevronDown size={14} className="text-slate-400" />
                <div className="w-px h-4 bg-slate-200 mx-1" />
                <span className="font-medium text-slate-700">01 May 2024 - 31 May 2024</span>
                <CalendarDays size={14} className="text-slate-400 ml-1" />
              </div>
              <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-300 text-slate-700 text-sm font-medium rounded-lg hover:bg-slate-50 transition-colors">
                <Download size={16} />
                Export Report
              </button>
              <button className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white text-sm font-medium rounded-lg hover:bg-emerald-700 transition-colors">
                <CalendarDays size={16} />
                Schedule Report
                <ChevronDown size={16} className="ml-1" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        
        {/* Top Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">₹</div>
              <span className="text-xs font-bold text-slate-700">Total Spend (Incl. Tax)</span>
            </div>
            <div className="flex flex-col">
              <span className="text-2xl font-bold text-slate-900">{formatCurrency(stats.totalSpend)}</span>
              <span className="text-xs font-medium text-emerald-600 mt-1 flex items-center gap-0.5"><ArrowUpRight size={12}/> 18.6% <span className="text-slate-400 font-normal ml-1">vs Apr 2024</span></span>
            </div>
          </div>
          
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center"><FileText size={16} /></div>
              <span className="text-xs font-bold text-slate-700">Total POs Raised</span>
            </div>
            <div className="flex flex-col">
              <span className="text-2xl font-bold text-slate-900">{stats.totalPOs}</span>
              <span className="text-xs font-medium text-emerald-600 mt-1 flex items-center gap-0.5"><ArrowUpRight size={12}/> 12.5% <span className="text-slate-400 font-normal ml-1">vs Apr 2024</span></span>
            </div>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 rounded-full bg-orange-50 text-orange-600 flex items-center justify-center">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z"/></svg>
              </div>
              <span className="text-xs font-bold text-slate-700">Total Vendors</span>
            </div>
            <div className="flex flex-col">
              <span className="text-2xl font-bold text-slate-900">{stats.totalVendors}</span>
              <span className="text-xs font-medium text-emerald-600 mt-1 flex items-center gap-0.5"><ArrowUpRight size={12}/> 5.3% <span className="text-slate-400 font-normal ml-1">vs Apr 2024</span></span>
            </div>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M21.41 11.58l-9-9C12.05 2.22 11.55 2 11 2H4c-1.1 0-2 .9-2 2v7c0 .55.22 1.05.59 1.42l9 9c.36.36.86.58 1.41.58.55 0 1.05-.22 1.41-.59l7-7c.37-.36.59-.86.59-1.41 0-.55-.23-1.06-.59-1.42zM5.5 7C4.67 7 4 6.33 4 5.5S4.67 4 5.5 4 7 4.67 7 5.5 6.33 7 5.5 7z"/></svg>
              </div>
              <span className="text-xs font-bold text-slate-700">Savings Achieved</span>
            </div>
            <div className="flex flex-col">
              <span className="text-2xl font-bold text-slate-900">{formatCurrency(stats.savingsAchieved)}</span>
              <span className="text-xs font-medium text-emerald-600 mt-1 flex items-center gap-0.5"><ArrowUpRight size={12}/> 22.1% <span className="text-slate-400 font-normal ml-1">vs Apr 2024</span></span>
            </div>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" /></svg>
              </div>
              <span className="text-xs font-bold text-slate-700">Avg. PO Cycle Time</span>
            </div>
            <div className="flex flex-col">
              <span className="text-2xl font-bold text-slate-900">{stats.cycleTime} <span className="text-lg font-medium text-slate-500">Days</span></span>
              <span className="text-xs font-medium text-emerald-600 mt-1 flex items-center gap-0.5"><ArrowDownRight size={12}/> 8.7% <span className="text-slate-400 font-normal ml-1">vs Apr 2024</span></span>
            </div>
          </div>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Line Chart */}
          <div className="lg:col-span-2 bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-sm font-bold text-slate-900">Monthly Procurement Spend Trend (Incl. Tax)</h3>
              <select className="text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-lg px-2 py-1 outline-none">
                <option>Last 6 Months</option>
              </select>
            </div>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={monthlyTrend} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis 
                    dataKey="month" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 11, fill: '#64748b' }} 
                    dy={10}
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 11, fill: '#64748b' }}
                    tickFormatter={(val) => `₹ ${(val/10000000).toFixed(0)}L`}
                    domain={[0, 'dataMax + 10000000']}
                    dx={-10}
                  />
                  <RechartsTooltip content={<CustomTooltipLine />} cursor={{ stroke: '#e2e8f0', strokeWidth: 2 }} />
                  <Line 
                    type="monotone" 
                    dataKey="spend" 
                    stroke="#10b981" 
                    strokeWidth={3} 
                    dot={{ r: 4, fill: "#10b981", strokeWidth: 2, stroke: "#fff" }}
                    activeDot={{ r: 6, fill: "#10b981", strokeWidth: 0 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Donut Chart */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-slate-900">Spend by Category</h3>
              <select className="text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-lg px-2 py-1 outline-none">
                <option>All Categories</option>
              </select>
            </div>
            
            <div className="flex flex-col">
              <div className="relative h-44 w-full flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categorySpend}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={75}
                      paddingAngle={2}
                      dataKey="value"
                      stroke="none"
                    >
                      {categorySpend.map((entry: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <RechartsTooltip formatter={(value: any) => formatCurrency(value as number)} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-sm font-bold text-slate-900">{formatCurrency(stats.totalSpend)}</span>
                  <span className="text-[10px] text-slate-500 font-medium">Total Spend</span>
                </div>
              </div>

              <div className="mt-4 space-y-2 max-h-36 overflow-y-auto">
                {categorySpend.map((item: any, idx: number) => (
                  <div key={item.name} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: PIE_COLORS[idx % PIE_COLORS.length] }} />
                      <span className="text-slate-700 font-medium truncate max-w-[120px]">{item.name}</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-slate-900 font-medium">{formatCurrency(item.value)}</span>
                      <span className="text-slate-500 w-12 text-right">({((item.value / stats.totalSpend) * 100).toFixed(1)}%)</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Tables Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Top Vendors Table */}
          <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col">
            <div className="p-5 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900">Top Vendors by Spend</h3>
            </div>
            <div className="overflow-x-auto flex-1">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-slate-700 bg-slate-50 border-b border-slate-100 uppercase font-medium">
                  <tr>
                    <th className="px-5 py-3">#</th>
                    <th className="px-5 py-3">Vendor Name</th>
                    <th className="px-5 py-3">Total Spend (Incl. Tax)</th>
                    <th className="px-5 py-3 text-center">POs</th>
                    <th className="px-5 py-3 text-center">On-time Delivery</th>
                    <th className="px-5 py-3">Quality Rating</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {topVendors.map((vendor: any, idx: number) => (
                    <tr key={idx} className="hover:bg-slate-50">
                      <td className="px-5 py-3 text-slate-500">{idx + 1}</td>
                      <td className="px-5 py-3 font-medium text-slate-900">{vendor.name}</td>
                      <td className="px-5 py-3 text-slate-700">{formatCurrency(vendor.spend)}</td>
                      <td className="px-5 py-3 text-slate-700 text-center">{vendor.pos}</td>
                      <td className="px-5 py-3 text-slate-700 text-center">{vendor.delivery}%</td>
                      <td className="px-5 py-3">{renderStars(vendor.rating)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="p-4 border-t border-slate-100 flex justify-center">
              <button className="px-4 py-1.5 border border-slate-300 text-slate-700 text-xs font-medium rounded-lg hover:bg-slate-50 transition-colors">
                View All Vendors
              </button>
            </div>
          </div>

          {/* Procurement Summary */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col">
            <div className="p-5 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900">Procurement Summary</h3>
            </div>
            <div className="p-5 flex-1 space-y-4">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-3">
                  <div className="p-1.5 bg-blue-50 text-blue-600 rounded"><FileText size={16} /></div>
                  <span className="font-medium text-slate-700">Total RFQs Raised</span>
                </div>
                <span className="font-bold text-slate-900">{summary.totalRFQs}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-3">
                  <div className="p-1.5 bg-emerald-50 text-emerald-600 rounded"><FileText size={16} /></div>
                  <span className="font-medium text-slate-700">RFQs Converted to PO</span>
                </div>
                <span className="font-bold text-slate-900 flex items-center gap-2">
                  {summary.rfqsConverted}
                  <span className="font-normal text-slate-500 text-xs">({((summary.rfqsConverted/summary.totalRFQs)*100).toFixed(1)}%)</span>
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-3">
                  <div className="p-1.5 bg-orange-50 text-orange-600 rounded"><FileText size={16} /></div>
                  <span className="font-medium text-slate-700">Total Quotations Received</span>
                </div>
                <span className="font-bold text-slate-900">{summary.totalQuotations}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-3">
                  <div className="p-1.5 bg-amber-50 text-amber-600 rounded"><FileSpreadsheet size={16} /></div>
                  <span className="font-medium text-slate-700">Total Invoices Generated</span>
                </div>
                <span className="font-bold text-slate-900">{summary.totalInvoices}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-3">
                  <div className="p-1.5 bg-emerald-50 text-emerald-600 rounded"><FileSpreadsheet size={16} /></div>
                  <span className="font-medium text-slate-700">Total Invoices Paid</span>
                </div>
                <span className="font-bold text-slate-900">{summary.paidInvoices}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-3">
                  <div className="p-1.5 bg-rose-50 text-rose-600 rounded"><FileSpreadsheet size={16} /></div>
                  <span className="font-medium text-slate-700">Pending Invoices</span>
                </div>
                <span className="font-bold text-slate-900">{summary.pendingInvoices}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Scatter & Reports Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Vendor Performance Scatter Plot */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-sm font-bold text-slate-900">Vendor Performance Overview</h3>
              <select className="text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-lg px-2 py-1 outline-none">
                <option>All Vendors</option>
              </select>
            </div>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: -20 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis 
                    type="number" 
                    dataKey="x" 
                    name="On-time Delivery" 
                    unit="%" 
                    domain={[60, 100]}
                    tick={{ fontSize: 11, fill: '#64748b' }} 
                    axisLine={false} 
                    tickLine={false}
                    label={{ value: 'On-time Delivery (%)', position: 'bottom', fontSize: 12, fill: '#64748b', dy: 15 }}
                  />
                  <YAxis 
                    type="number" 
                    dataKey="y" 
                    name="Quality Rating" 
                    domain={[1, 5]}
                    tickCount={5}
                    tick={{ fontSize: 11, fill: '#64748b' }} 
                    axisLine={false} 
                    tickLine={false}
                    label={{ value: 'Quality Rating (out of 5)', angle: -90, position: 'insideLeft', fontSize: 12, fill: '#64748b', dx: 15 }}
                  />
                  <ZAxis type="number" dataKey="z" range={[100, 400]} name="Spend" />
                  <RechartsTooltip cursor={{ strokeDasharray: '3 3' }} content={<CustomTooltipScatter />} />
                  <Scatter name="Vendors" data={scatterData} fill="#3b82f6" fillOpacity={0.8}>
                    {scatterData.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Scatter>
                </ScatterChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-2 text-[10px] text-slate-400 flex items-center gap-1">
              <div className="w-3 h-3 rounded-full border border-slate-300" />
              Bubble size represents total spend
            </div>
          </div>

          {/* Recent Reports Table */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900">Recent Reports</h3>
            </div>
            <div className="overflow-x-auto flex-1 p-0">
              <table className="w-full text-xs text-left">
                <thead className="text-xs text-slate-700 bg-slate-50 border-b border-slate-100 font-medium">
                  <tr>
                    <th className="px-5 py-3">Report Name</th>
                    <th className="px-5 py-3">Type</th>
                    <th className="px-5 py-3">Generated On</th>
                    <th className="px-5 py-3">Generated By</th>
                    <th className="px-5 py-3 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  <tr className="hover:bg-slate-50">
                    <td className="px-5 py-3 font-medium text-slate-900">Procurement Summary - May 2024</td>
                    <td className="px-5 py-3 text-slate-500">Summary Report</td>
                    <td className="px-5 py-3 text-slate-500">31 May 2024, 10:30 AM</td>
                    <td className="px-5 py-3 text-slate-500">Rahul Mehta</td>
                    <td className="px-5 py-3 text-center"><button className="text-slate-400 hover:text-emerald-600"><Download size={14} /></button></td>
                  </tr>
                  <tr className="hover:bg-slate-50">
                    <td className="px-5 py-3 font-medium text-slate-900">Vendor Performance Report</td>
                    <td className="px-5 py-3 text-slate-500">Vendor Report</td>
                    <td className="px-5 py-3 text-slate-500">31 May 2024, 10:25 AM</td>
                    <td className="px-5 py-3 text-slate-500">Rahul Mehta</td>
                    <td className="px-5 py-3 text-center"><button className="text-slate-400 hover:text-emerald-600"><Download size={14} /></button></td>
                  </tr>
                  <tr className="hover:bg-slate-50">
                    <td className="px-5 py-3 font-medium text-slate-900">Spend Analysis - May 2024</td>
                    <td className="px-5 py-3 text-slate-500">Spend Report</td>
                    <td className="px-5 py-3 text-slate-500">31 May 2024, 10:20 AM</td>
                    <td className="px-5 py-3 text-slate-500">Rahul Mehta</td>
                    <td className="px-5 py-3 text-center"><button className="text-slate-400 hover:text-emerald-600"><Download size={14} /></button></td>
                  </tr>
                  <tr className="hover:bg-slate-50">
                    <td className="px-5 py-3 font-medium text-slate-900">Monthly Procurement Trend</td>
                    <td className="px-5 py-3 text-slate-500">Trend Report</td>
                    <td className="px-5 py-3 text-slate-500">31 May 2024, 10:15 AM</td>
                    <td className="px-5 py-3 text-slate-500">Rahul Mehta</td>
                    <td className="px-5 py-3 text-center"><button className="text-slate-400 hover:text-emerald-600"><Download size={14} /></button></td>
                  </tr>
                  <tr className="hover:bg-slate-50">
                    <td className="px-5 py-3 font-medium text-slate-900">Category Wise Spend Report</td>
                    <td className="px-5 py-3 text-slate-500">Category Report</td>
                    <td className="px-5 py-3 text-slate-500">31 May 2024, 10:10 AM</td>
                    <td className="px-5 py-3 text-slate-500">Rahul Mehta</td>
                    <td className="px-5 py-3 text-center"><button className="text-slate-400 hover:text-emerald-600"><Download size={14} /></button></td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div className="p-4 border-t border-slate-100 flex justify-center mt-auto">
              <button className="px-4 py-1.5 border border-slate-300 text-slate-700 text-xs font-medium rounded-lg hover:bg-slate-50 transition-colors">
                View All Reports
              </button>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
