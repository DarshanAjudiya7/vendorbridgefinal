"use client";

import { useState } from 'react';
import { Vendor } from '@prisma/client';
import { 
  Users, 
  Store, 
  Clock, 
  FileX, 
  Search, 
  Filter, 
  Plus,
  ChevronDown,
  Eye,
  Edit2,
  MoreVertical,
  ChevronLeft,
  ChevronRight,
  ArrowUp,
  ArrowDown
} from 'lucide-react';

type Trend = { value: number; isPositive: boolean };

type Metrics = {
  total: number;
  active: number;
  pending: number;
  inactive: number;
  totalTrend: Trend;
  activeTrend: Trend;
  pendingTrend: Trend;
  inactiveTrend: Trend;
};

type Props = {
  initialVendors: Vendor[];
  metrics: Metrics;
};

export default function VendorManagementClient({ initialVendors, metrics }: Props) {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Derive unique categories from the data for the filter dropdown
  const categories = ['All', ...Array.from(new Set(initialVendors.map(v => v.category)))];

  // Filtering Logic
  const filteredVendors = initialVendors.filter(vendor => {
    const matchesSearch = 
      vendor.companyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      vendor.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      vendor.contactPerson.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (vendor.gstNumber && vendor.gstNumber.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesStatus = statusFilter === 'All' || vendor.status === statusFilter.toUpperCase();
    const matchesCategory = categoryFilter === 'All' || vendor.category === categoryFilter;

    return matchesSearch && matchesStatus && matchesCategory;
  });

  // Pagination Logic
  const totalPages = Math.ceil(filteredVendors.length / itemsPerPage) || 1;
  const paginatedVendors = filteredVendors.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const getCategoryColor = (category: string) => {
    const hash = category.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const colors = [
      'text-blue-700 bg-blue-50 border-blue-200',
      'text-emerald-700 bg-emerald-50 border-emerald-200',
      'text-purple-700 bg-purple-50 border-purple-200',
      'text-orange-700 bg-orange-50 border-orange-200',
      'text-pink-700 bg-pink-50 border-pink-200',
      'text-teal-700 bg-teal-50 border-teal-200',
    ];
    return colors[hash % colors.length];
  };

  const getStatusDisplay = (status: string) => {
    switch(status) {
      case 'ACTIVE':
        return <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700"><span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>Active</span>;
      case 'PENDING':
        return <span className="inline-flex items-center gap-1.5 rounded-full border border-orange-200 bg-orange-50 px-2.5 py-1 text-xs font-medium text-orange-700"><span className="h-1.5 w-1.5 rounded-full bg-orange-500"></span>Pending</span>;
      case 'INACTIVE':
      case 'BLOCKED':
        return <span className="inline-flex items-center gap-1.5 rounded-full border border-red-200 bg-red-50 px-2.5 py-1 text-xs font-medium text-red-700"><span className="h-1.5 w-1.5 rounded-full bg-red-500"></span>Inactive</span>;
      default:
        return <span className="inline-flex items-center gap-1.5 rounded-full border border-gray-200 bg-gray-50 px-2.5 py-1 text-xs font-medium text-gray-700"><span className="h-1.5 w-1.5 rounded-full bg-gray-500"></span>{status}</span>;
    }
  };

  const MetricCard = ({ title, value, trend, icon: Icon, iconColor, iconBg }: any) => (
    <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
      <div className="flex items-center gap-4">
        <div className={`flex h-12 w-12 items-center justify-center rounded-full ${iconBg} ${iconColor}`}>
          <Icon size={24} />
        </div>
        <div>
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
        </div>
      </div>
      <div className="mt-4 flex items-center gap-1 text-sm">
        {trend.isPositive ? (
          <span className="flex items-center text-emerald-600 font-medium"><ArrowUp size={14} className="mr-1" /> {trend.value}</span>
        ) : (
          <span className="flex items-center text-red-600 font-medium"><ArrowDown size={14} className="mr-1" /> {trend.value}</span>
        )}
        <span className="text-gray-500 ml-1">this month</span>
      </div>
    </div>
  );

  return (
    <>
      {/* Header */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">Vendors</h1>
          <p className="text-sm text-gray-500 mt-1">Home &gt; Vendors</p>
        </div>
        <button className="flex items-center gap-2 rounded-lg bg-[#0F8C58] px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-emerald-700">
          <Plus size={16} /> Add Vendor <ChevronDown size={16} className="ml-1" />
        </button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        <MetricCard title="Total Vendors" value={metrics.total} trend={metrics.totalTrend} icon={Users} iconColor="text-emerald-600" iconBg="bg-emerald-50" />
        <MetricCard title="Active Vendors" value={metrics.active} trend={metrics.activeTrend} icon={Store} iconColor="text-blue-600" iconBg="bg-blue-50" />
        <MetricCard title="Pending Vendors" value={metrics.pending} trend={metrics.pendingTrend} icon={Clock} iconColor="text-orange-600" iconBg="bg-orange-50" />
        <MetricCard title="Inactive Vendors" value={metrics.inactive} trend={metrics.inactiveTrend} icon={FileX} iconColor="text-red-600" iconBg="bg-red-50" />
      </div>

      {/* Main Table Card */}
      <div className="rounded-xl border border-gray-100 bg-white shadow-sm overflow-hidden">
        
        {/* Filters */}
        <div className="p-4 border-b border-gray-100 flex flex-col xl:flex-row gap-4 justify-between items-start xl:items-center bg-gray-50/50">
          <div className="relative w-full xl:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search vendors by name, email, phone, GST..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-lg border border-gray-200 pl-10 pr-4 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full xl:w-auto">
            <div className="flex flex-col gap-1 w-full sm:w-auto">
              <span className="text-[10px] font-semibold text-gray-500 uppercase ml-1">Status</span>
              <div className="relative">
                <select 
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="appearance-none rounded-lg border border-gray-200 bg-white pl-3 pr-8 py-2 text-sm focus:border-emerald-500 focus:outline-none min-w-[120px]"
                >
                  <option value="All">All</option>
                  <option value="Active">Active</option>
                  <option value="Pending">Pending</option>
                  <option value="Inactive">Inactive</option>
                </select>
                <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
              </div>
            </div>

            <div className="flex flex-col gap-1 w-full sm:w-auto">
              <span className="text-[10px] font-semibold text-gray-500 uppercase ml-1">Category</span>
              <div className="relative">
                <select 
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="appearance-none rounded-lg border border-gray-200 bg-white pl-3 pr-8 py-2 text-sm focus:border-emerald-500 focus:outline-none min-w-[140px]"
                >
                  {categories.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
              </div>
            </div>

            <div className="flex flex-col gap-1 w-full sm:w-auto">
              <span className="text-[10px] font-semibold text-gray-500 uppercase ml-1">GST Status</span>
              <div className="relative">
                <select className="appearance-none rounded-lg border border-gray-200 bg-white pl-3 pr-8 py-2 text-sm focus:border-emerald-500 focus:outline-none min-w-[120px]">
                  <option value="All">All</option>
                  <option value="Registered">Registered</option>
                  <option value="Unregistered">Unregistered</option>
                </select>
                <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
              </div>
            </div>

            <div className="flex items-end h-full mt-4 sm:mt-0">
              <button className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
                <Filter size={16} /> More Filters
              </button>
            </div>
            <div className="flex items-end h-full mt-4 sm:mt-0 ml-auto xl:ml-2">
              <button 
                onClick={() => { setSearchQuery(''); setStatusFilter('All'); setCategoryFilter('All'); }}
                className="text-sm font-medium text-emerald-600 hover:text-emerald-700 px-2 py-2"
              >
                Reset
              </button>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-600">
            <thead className="border-b border-gray-100 bg-gray-50/50 text-xs uppercase text-gray-500">
              <tr>
                <th className="px-6 py-4 font-semibold">Vendor Name</th>
                <th className="px-6 py-4 font-semibold">Category</th>
                <th className="px-6 py-4 font-semibold">GST Number</th>
                <th className="px-6 py-4 font-semibold">Contact Details</th>
                <th className="px-6 py-4 font-semibold">Status</th>
                <th className="px-6 py-4 font-semibold">Registration Date</th>
                <th className="px-6 py-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {paginatedVendors.length > 0 ? (
                paginatedVendors.map((vendor) => (
                  <tr key={vendor.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-600 font-bold">
                          {vendor.companyName.charAt(0)}
                        </div>
                        <div>
                          <div className="font-semibold text-gray-900">{vendor.companyName}</div>
                          <div className="text-xs text-gray-500">{vendor.email}</div>
                          <div className="text-xs text-gray-500">{vendor.phone}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-medium ${getCategoryColor(vendor.category)}`}>
                        {vendor.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-medium text-gray-700">
                      {vendor.gstNumber || <span className="text-gray-400">N/A</span>}
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900">{vendor.contactPerson}</div>
                      <div className="text-xs text-gray-500">{vendor.email}</div>
                      <div className="text-xs text-gray-500">{vendor.phone}</div>
                    </td>
                    <td className="px-6 py-4">
                      {getStatusDisplay(vendor.status)}
                    </td>
                    <td className="px-6 py-4">
                      {new Date(vendor.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button className="rounded p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors border border-gray-200">
                          <Eye size={16} />
                        </button>
                        <button className="rounded p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors border border-gray-200">
                          <Edit2 size={16} />
                        </button>
                        <button className="rounded p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors border border-gray-200">
                          <MoreVertical size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                    No vendors found matching your criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between border-t border-gray-100 p-4">
          <div className="text-sm text-gray-500">
            Showing <span className="font-medium">{filteredVendors.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0}</span> to <span className="font-medium">{Math.min(currentPage * itemsPerPage, filteredVendors.length)}</span> of <span className="font-medium">{filteredVendors.length}</span> entries
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 mr-4">
              <span className="text-sm text-gray-500">10 per page</span>
              <ChevronDown size={14} className="text-gray-400" />
            </div>
            <button 
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="rounded-lg border border-gray-200 p-2 text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft size={16} />
            </button>
            
            {Array.from({ length: Math.min(totalPages, 5) }).map((_, i) => {
              // Simple pagination display logic for MVP
              const pageNum = i + 1;
              return (
                <button 
                  key={pageNum}
                  onClick={() => setCurrentPage(pageNum)}
                  className={`flex h-8 w-8 items-center justify-center rounded-lg text-sm font-medium ${
                    currentPage === pageNum 
                      ? 'bg-[#0F8C58] text-white' 
                      : 'border border-gray-200 text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}
            
            <button 
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="rounded-lg border border-gray-200 p-2 text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
