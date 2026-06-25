"use client";

import { useRouter } from "next/navigation";
import { Plus, Edit2, Eye, FileText, Search, MoreVertical } from "lucide-react";
import Link from "next/link";

type Props = {
  initialRfqs: any[];
  title?: string;
  description?: string;
  userRole?: string;
};

export default function MyRFQsClient({ initialRfqs, title = "My RFQs", description = "View and manage the RFQs you have created.", userRole }: Props) {
  const router = useRouter();

  const getStatusColor = (status: string) => {
    switch (status) {
      case "DRAFT": return "bg-gray-100 text-gray-700";
      case "PUBLISHED": return "bg-blue-100 text-blue-700";
      case "UNDER_REVIEW": return "bg-amber-100 text-amber-700";
      case "APPROVED": return "bg-emerald-100 text-emerald-700";
      case "REJECTED": return "bg-red-100 text-red-700";
      case "CLOSED": return "bg-slate-100 text-slate-700";
      default: return "bg-gray-100 text-gray-700";
    }
  };

  return (
    <div className="flex flex-col gap-6 max-w-[1600px] mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
        <div>
          <div className="flex items-center text-sm text-gray-500 mb-1">
            <span>RFQs</span>
            <span className="mx-2">&gt;</span>
            <span className="text-gray-900 font-medium">{title}</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
          <p className="text-sm text-gray-500 mt-1">{description}</p>
        </div>
        {userRole === 'PROCUREMENT_OFFICER' && (
          <Link 
            href="/dashboard/rfqs/create"
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-[#0F8C58] rounded-lg hover:bg-emerald-700 transition-colors"
          >
            <Plus size={16} />
            Create New RFQ
          </Link>
        )}
      </div>

      {/* Main Content Area */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm flex flex-col">
        {/* Filters and Search */}
        <div className="p-5 border-b border-gray-100 flex flex-col sm:flex-row gap-4 justify-between items-center">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <input 
                type="text" 
                placeholder="Search RFQs..." 
                className="w-full pl-9 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:border-[#0F8C58] focus:ring-1 focus:ring-[#0F8C58]"
              />
            </div>
            <select className="px-3 py-2 text-sm border border-gray-300 rounded-lg bg-white focus:outline-none focus:border-[#0F8C58]">
              <option value="">All Status</option>
              <option value="DRAFT">Draft</option>
              <option value="PUBLISHED">Published</option>
              <option value="CLOSED">Closed</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-gray-50 border-b border-gray-100 text-gray-600 font-medium">
              <tr>
                <th className="px-6 py-4">RFQ Number</th>
                <th className="px-6 py-4">Title</th>
                <th className="px-6 py-4">Deadline</th>
                <th className="px-6 py-4">Items</th>
                <th className="px-6 py-4">Vendors</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {initialRfqs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                    <div className="flex flex-col items-center justify-center">
                      <FileText size={48} className="text-gray-300 mb-4" />
                      <p className="text-lg font-medium text-gray-900">No RFQs found</p>
                      <p className="text-sm mt-1">You haven't created any RFQs yet.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                initialRfqs.map((rfq) => (
                  <tr key={rfq.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 font-medium text-gray-900">{rfq.rfqNumber}</td>
                    <td className="px-6 py-4 text-gray-700 max-w-[200px] truncate">{rfq.title}</td>
                    <td className="px-6 py-4 text-gray-600">
                      {new Date(rfq.deadline).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </td>
                    <td className="px-6 py-4 text-gray-600">{rfq._count.items}</td>
                    <td className="px-6 py-4 text-gray-600">{rfq._count.vendors}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${getStatusColor(rfq.status)}`}>
                        {rfq.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-3">
                        {rfq.status === 'DRAFT' && userRole === 'PROCUREMENT_OFFICER' && (
                          <Link href={`/dashboard/rfqs/${rfq.id}/edit`} className="text-gray-400 hover:text-blue-600 tooltip-trigger" title="Edit Draft">
                            <Edit2 size={16} />
                          </Link>
                        )}
                        {rfq.status === 'PUBLISHED' && userRole === 'VENDOR' && (
                          <Link href={`/dashboard/quotations/submit?rfqId=${rfq.id}`} className="text-gray-400 hover:text-emerald-600 tooltip-trigger" title="Submit Quotation">
                            <FileText size={16} />
                          </Link>
                        )}
                        <button className="text-gray-400 hover:text-gray-900" title="View Details">
                          <Eye size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination placeholder */}
        {initialRfqs.length > 0 && (
          <div className="p-4 border-t border-gray-100 flex items-center justify-between text-sm text-gray-500">
            <span>Showing 1 to {initialRfqs.length} of {initialRfqs.length} entries</span>
            <div className="flex items-center gap-1">
              <button className="px-3 py-1 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50" disabled>Previous</button>
              <button className="px-3 py-1 border border-gray-200 rounded-lg bg-gray-50 font-medium text-gray-900">1</button>
              <button className="px-3 py-1 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50" disabled>Next</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
