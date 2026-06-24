import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { FileSpreadsheet } from "lucide-react";

export default async function PurchaseOrdersListPage() {
  const purchaseOrders = await prisma.purchaseOrder.findMany({
    include: { vendor: true },
    orderBy: { createdAt: 'desc' }
  });

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Purchase Orders</h1>
          <p className="text-sm text-slate-500 mt-1">Manage and view all your purchase orders</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-xs uppercase tracking-wider text-slate-500 font-medium">
              <th className="py-4 px-6">PO Number</th>
              <th className="py-4 px-6">Vendor</th>
              <th className="py-4 px-6">Date</th>
              <th className="py-4 px-6">Total Amount</th>
              <th className="py-4 px-6">Status</th>
              <th className="py-4 px-6 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {purchaseOrders.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-8 text-center text-slate-500">
                  <FileSpreadsheet size={48} className="mx-auto text-slate-300 mb-4" />
                  <p>No purchase orders found.</p>
                </td>
              </tr>
            ) : (
              purchaseOrders.map((po) => (
                <tr key={po.id} className="text-sm hover:bg-slate-50 transition-colors group">
                  <td className="py-4 px-6 font-medium text-emerald-600">
                    <Link href={`/dashboard/po-invoices/purchase-orders/${po.id}`}>
                      {po.poNumber}
                    </Link>
                  </td>
                  <td className="py-4 px-6 text-slate-900">{po.vendor.companyName}</td>
                  <td className="py-4 px-6 text-slate-500">{new Date(po.createdAt).toLocaleDateString()}</td>
                  <td className="py-4 px-6 font-medium">₹ {Number(po.totalAmount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                  <td className="py-4 px-6">
                    <span className="px-2.5 py-1 rounded-md text-xs font-medium border
                      bg-slate-50 text-slate-700 border-slate-200">
                      {po.status}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-right">
                    <Link 
                      href={`/dashboard/po-invoices/purchase-orders/${po.id}`}
                      className="text-emerald-600 font-medium text-xs hover:text-emerald-700"
                    >
                      View Details
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
