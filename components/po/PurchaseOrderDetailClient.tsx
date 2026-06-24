"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { 
  ChevronRight, 
  Printer, 
  Download, 
  ChevronDown, 
  Copy,
  CalendarDays,
  FileText,
  Mail,
  CheckCircle2,
  Clock,
  Circle
} from "lucide-react";
import GenerateInvoiceForm from "./GenerateInvoiceForm";

export default function PurchaseOrderDetailClient({ id }: { id: string }) {
  const router = useRouter();
  const [poData, setPoData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPO = async () => {
      try {
        const res = await fetch(`/api/purchase-orders/${id}`);
        if (res.ok) {
          const data = await res.json();
          setPoData(data);
        }
      } catch (error) {
        console.error("Failed to fetch PO", error);
      } finally {
        setLoading(false);
      }
    };
    fetchPO();
  }, [id]);

  if (loading) {
    return <div className="p-8 text-center text-slate-500">Loading Purchase Order details...</div>;
  }

  if (!poData) {
    return <div className="p-8 text-center text-red-500">Purchase Order not found.</div>;
  }

  const { vendor, quotation, rfq } = poData;
  const items = quotation?.items || [];
  
  // Dummy calculations for summary since schema doesn't have exact fields
  const subTotal = Number(poData.totalAmount) * 0.82; // Reverse approx 18% GST for demo
  const cgst = subTotal * 0.09;
  const sgst = subTotal * 0.09;

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      {/* Header */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-4 flex items-center text-sm text-slate-500">
            <span className="hover:text-slate-900 cursor-pointer">Purchase Orders</span>
            <ChevronRight size={16} className="mx-2" />
            <span className="text-slate-900 font-medium">{poData.poNumber}</span>
          </div>
          
          <div className="py-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold text-slate-900">Purchase Order</h1>
                <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 text-xs font-semibold">
                  {poData.status}
                </span>
              </div>
              <p className="text-slate-500 text-sm mt-1">Create invoice from this purchase order and manage billing</p>
            </div>
            
            <div className="flex items-center gap-3">
              <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-300 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 shadow-sm transition-colors">
                <Printer size={16} />
                Print PO
              </button>
              <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-300 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 shadow-sm transition-colors">
                <Download size={16} />
                Download PO
              </button>
              <div className="relative inline-flex rounded-lg shadow-sm">
                <button className="flex items-center gap-2 px-4 py-2 bg-emerald-600 border border-emerald-600 rounded-l-lg text-sm font-medium text-white hover:bg-emerald-700 transition-colors">
                  <FileText size={16} />
                  Create Invoice
                </button>
                <button className="flex items-center px-2 py-2 bg-emerald-700 border border-emerald-700 border-l-emerald-600 rounded-r-lg text-white hover:bg-emerald-800 transition-colors">
                  <ChevronDown size={16} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* Main Content Area */}
          <div className="flex-1 space-y-6">
            
            {/* PO Details Card */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div>
                  <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">PO Number</p>
                  <div className="flex items-center gap-2">
                    <span className="text-emerald-600 font-bold text-lg">{poData.poNumber}</span>
                    <button className="text-slate-400 hover:text-slate-600"><Copy size={14} /></button>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">Auto-generated</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">Vendor</p>
                  <p className="text-slate-900 font-semibold">{vendor?.companyName}</p>
                  <p className="text-xs text-slate-500 mt-1">GSTIN: {vendor?.gstNumber || "N/A"}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">PO Date</p>
                  <div className="flex items-center gap-2 text-slate-900 font-medium">
                    <CalendarDays size={16} className="text-slate-400" />
                    {format(new Date(poData.createdAt), "dd MMM yyyy")}
                  </div>
                </div>
                <div>
                  <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">Delivery Date</p>
                  <div className="flex items-center gap-2 text-slate-900 font-medium">
                    <CalendarDays size={16} className="text-slate-400" />
                    {quotation?.deliveryDate ? format(new Date(quotation.deliveryDate), "dd MMM yyyy") : "N/A"}
                  </div>
                </div>
              </div>
              
              <div className="border-t border-slate-100 my-6"></div>
              
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <div>
                  <p className="text-xs text-slate-500 mb-1">RFQ Reference</p>
                  <p className="text-sm font-medium text-slate-900">{rfq?.rfqNumber}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 mb-1">Quotation Reference</p>
                  <p className="text-sm font-medium text-slate-900">{quotation?.quotationNumber}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 mb-1">Payment Terms</p>
                  <p className="text-sm font-medium text-slate-900">{quotation?.paymentTerms || "30 Days"}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 mb-1">Currency</p>
                  <p className="text-sm font-medium text-slate-900">{rfq?.currency || "INR"}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 mb-1">Status</p>
                  <span className="px-2 py-1 rounded-md bg-emerald-50 text-emerald-700 text-xs font-medium border border-emerald-200">
                    {poData.status}
                  </span>
                </div>
              </div>
            </div>

            {/* Items Details */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200">
              <div className="p-6 border-b border-slate-100">
                <h2 className="text-lg font-bold text-slate-900">Items Details ({items.length})</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-xs uppercase tracking-wider text-slate-500 font-medium">
                      <th className="py-3 px-6">#</th>
                      <th className="py-3 px-6">Item / Service</th>
                      <th className="py-3 px-6">Description</th>
                      <th className="py-3 px-6 text-right">Qty</th>
                      <th className="py-3 px-6 text-right">Unit Price (₹)</th>
                      <th className="py-3 px-6 text-right">GST %</th>
                      <th className="py-3 px-6 text-right">Total (₹)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {items.map((item: any, idx: number) => (
                      <tr key={item.id} className="text-sm text-slate-900 hover:bg-slate-50 transition-colors">
                        <td className="py-4 px-6">{idx + 1}</td>
                        <td className="py-4 px-6 font-medium">{item.itemName}</td>
                        <td className="py-4 px-6 text-slate-500">{item.description || "—"}</td>
                        <td className="py-4 px-6 text-right">{item.quantity}</td>
                        <td className="py-4 px-6 text-right">{Number(item.unitPrice).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                        <td className="py-4 px-6 text-right">18%</td>
                        <td className="py-4 px-6 text-right font-medium">{Number(item.totalPrice).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="p-4 bg-slate-50 border-t border-slate-200 rounded-b-xl">
                <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-300 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-100 transition-colors">
                  <FileText size={16} />
                  View Quotation Comparison
                </button>
              </div>
            </div>

            {/* Generate Invoice Section */}
            {!poData.invoice && (
              <GenerateInvoiceForm poData={poData} items={items} />
            )}

          </div>

          {/* Right Sidebar */}
          <div className="w-full lg:w-80 flex flex-col gap-6">
            
            {/* Summary */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <h3 className="text-base font-bold text-slate-900 mb-4">Purchase Order Summary</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between text-slate-600">
                  <span>Sub Total</span>
                  <span className="font-medium text-slate-900">₹ {subTotal.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Discount</span>
                  <span className="font-medium text-red-600">- ₹ 0.00</span>
                </div>
                <div className="flex justify-between text-slate-600 pb-3 border-b border-slate-100">
                  <span>Taxable Amount</span>
                  <span className="font-medium text-slate-900">₹ {subTotal.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between text-slate-600 pt-1">
                  <span>CGST (9%)</span>
                  <span className="font-medium text-slate-900">₹ {cgst.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between text-slate-600 pb-3 border-b border-slate-100">
                  <span>SGST (9%)</span>
                  <span className="font-medium text-slate-900">₹ {sgst.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between items-center pt-2">
                  <span className="font-bold text-slate-900">Total (₹)</span>
                  <span className="font-bold text-xl text-emerald-600">₹ {Number(poData.totalAmount).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <h3 className="text-base font-bold text-slate-900 mb-4">PO Actions</h3>
              <div className="flex flex-col gap-3">
                <button className="flex items-center justify-center gap-2 w-full py-2.5 bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 font-medium rounded-lg text-sm transition-colors">
                  <FileText size={16} /> Create Invoice
                </button>
                <button className="flex items-center justify-center gap-2 w-full py-2.5 bg-white text-slate-700 border border-slate-300 hover:bg-slate-50 font-medium rounded-lg text-sm transition-colors">
                  <Mail size={16} /> Send PO to Vendor
                </button>
                <button className="flex items-center justify-center gap-2 w-full py-2.5 bg-white text-slate-700 border border-slate-300 hover:bg-slate-50 font-medium rounded-lg text-sm transition-colors">
                  <Download size={16} /> Download PO (PDF)
                </button>
                <button className="flex items-center justify-center gap-2 w-full py-2.5 bg-white text-slate-700 border border-slate-300 hover:bg-slate-50 font-medium rounded-lg text-sm transition-colors">
                  <Printer size={16} /> Print PO
                </button>
              </div>
            </div>

            {/* Timeline */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <h3 className="text-base font-bold text-slate-900 mb-4">PO Timeline</h3>
              <div className="space-y-6 relative before:absolute before:inset-0 before:ml-2.5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-200 before:to-transparent">
                
                {/* Timeline Item 1 */}
                <div className="relative flex items-start justify-between">
                  <div className="flex items-center">
                    <div className="z-10 flex items-center justify-center w-5 h-5 rounded-full bg-emerald-500 text-white shadow ring-4 ring-white">
                       <CheckCircle2 size={12} />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-semibold text-slate-900">PO Created</p>
                      <p className="text-xs text-slate-500 mt-0.5">{format(new Date(poData.createdAt), "dd MMM yyyy, hh:mm a")}</p>
                    </div>
                  </div>
                </div>

                {/* Timeline Item 2 */}
                <div className="relative flex items-start justify-between">
                  <div className="flex items-center">
                    <div className="z-10 flex items-center justify-center w-5 h-5 rounded-full bg-emerald-500 text-white shadow ring-4 ring-white">
                       <CheckCircle2 size={12} />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-semibold text-slate-900">PO Approved</p>
                      <p className="text-xs text-slate-500 mt-0.5">{format(new Date(poData.createdAt), "dd MMM yyyy, hh:mm a")}</p>
                    </div>
                  </div>
                </div>
                
                {/* Pending states */}
                <div className="relative flex items-start justify-between">
                  <div className="flex items-center">
                    <div className="z-10 flex items-center justify-center w-5 h-5 rounded-full bg-slate-200 text-white shadow ring-4 ring-white">
                       <Circle size={12} fill="currentColor" className="text-slate-200" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-slate-500">Sent to Vendor</p>
                    </div>
                  </div>
                </div>

                <div className="relative flex items-start justify-between">
                  <div className="flex items-center">
                    <div className="z-10 flex items-center justify-center w-5 h-5 rounded-full bg-slate-200 text-white shadow ring-4 ring-white">
                       <Circle size={12} fill="currentColor" className="text-slate-200" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-slate-500">Completed</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
