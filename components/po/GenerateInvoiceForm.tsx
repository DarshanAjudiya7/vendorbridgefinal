"use client";

import { useState } from "react";
import { format, addDays } from "date-fns";
import { UploadCloud, Save, Eye, Download, Send, ChevronDown, CheckCircle2 } from "lucide-react";
import { useRouter } from "next/navigation";

export default function GenerateInvoiceForm({ poData, items }: { poData: any; items: any[] }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  
  // Form State
  const [invoiceDate, setInvoiceDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [dueDate, setDueDate] = useState(format(addDays(new Date(), 30), "yyyy-MM-dd"));
  const [billingTo, setBillingTo] = useState("ABC Corp Pvt. Ltd.");
  const [currency, setCurrency] = useState("INR - Indian Rupee");
  const [paymentTerms, setPaymentTerms] = useState("30 Days");
  const [notes, setNotes] = useState("Thank you for your business.");

  // Calculations
  const taxableAmount = items.reduce((acc, item) => acc + (Number(item.quantity) * Number(item.unitPrice)), 0);
  const cgst = taxableAmount * 0.09;
  const sgst = taxableAmount * 0.09;
  const totalAmount = taxableAmount + cgst + sgst;

  const handleGenerateInvoice = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/invoices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          purchaseOrderId: poData.id,
          dueDate,
          billingTo,
          currency,
          paymentTerms,
          notes,
          subTotal: taxableAmount,
          cgst,
          sgst,
          totalAmount,
        }),
      });

      if (res.ok) {
        setSuccess(true);
        router.refresh();
      } else {
        const error = await res.json();
        alert(`Error: ${error.message}`);
      }
    } catch (error) {
      console.error("Failed to generate invoice", error);
      alert("Failed to generate invoice");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-8 flex flex-col items-center justify-center text-center mt-8">
        <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-4">
          <CheckCircle2 size={32} />
        </div>
        <h2 className="text-xl font-bold text-slate-900">Invoice Generated Successfully</h2>
        <p className="text-slate-500 mt-2 max-w-md">Your invoice has been created and linked to this Purchase Order. You can now send it to the client.</p>
        <div className="mt-6 flex gap-4">
          <button className="px-6 py-2 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 transition-colors">
            View Invoice
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-8 border-t border-slate-200 pt-8">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-slate-900">Generate Invoice</h2>
        <p className="text-sm text-slate-500 mt-1">Create invoice against this purchase order</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Invoice Number</label>
            <input 
              type="text" 
              disabled 
              value="INV-2024-000342" 
              className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-500 text-sm focus:outline-none"
            />
            <p className="text-xs text-slate-400 mt-1">Auto-generated</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Invoice Date <span className="text-red-500">*</span></label>
            <input 
              type="date" 
              value={invoiceDate}
              onChange={(e) => setInvoiceDate(e.target.value)}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg text-sm text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-shadow"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Due Date <span className="text-red-500">*</span></label>
            <input 
              type="date" 
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg text-sm text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-shadow"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Billing To</label>
            <select 
              value={billingTo}
              onChange={(e) => setBillingTo(e.target.value)}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg text-sm text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-shadow appearance-none bg-white"
              style={{ backgroundImage: 'url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%23131313%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 1rem top 50%', backgroundSize: '0.65rem auto' }}
            >
              <option>ABC Corp Pvt. Ltd.</option>
              <option>XYZ Enterprises</option>
            </select>
            <p className="text-xs text-slate-500 mt-2 leading-relaxed">
              123 Business Park, Andheri East,<br />Mumbai - 400069, Maharashtra, India<br />GSTIN: 27ABCDE1234F1Z5
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Currency</label>
            <select 
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg text-sm text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-shadow appearance-none bg-white"
              style={{ backgroundImage: 'url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%23131313%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 1rem top 50%', backgroundSize: '0.65rem auto' }}
            >
              <option>INR - Indian Rupee</option>
              <option>USD - US Dollar</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Payment Terms</label>
            <select 
              value={paymentTerms}
              onChange={(e) => setPaymentTerms(e.target.value)}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg text-sm text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-shadow appearance-none bg-white"
              style={{ backgroundImage: 'url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%23131313%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 1rem top 50%', backgroundSize: '0.65rem auto' }}
            >
              <option>30 Days</option>
              <option>45 Days</option>
              <option>Immediate</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Notes</label>
            <textarea 
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg text-sm text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-shadow resize-none h-24"
            />
            <p className="text-xs text-slate-400 text-right mt-1">{notes.length} / 500</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Attach Documents (optional)</label>
            <div className="w-full h-24 border-2 border-dashed border-emerald-200 rounded-lg bg-emerald-50/50 flex flex-col items-center justify-center text-center hover:bg-emerald-50 transition-colors cursor-pointer">
              <UploadCloud size={24} className="text-emerald-500 mb-2" />
              <p className="text-sm text-slate-700 font-medium">Drag & drop files or Browse</p>
              <p className="text-xs text-slate-500 mt-1">Supports: PDF, JPG, PNG (Max. 10MB)</p>
            </div>
          </div>
        </div>

        {/* Invoice Items Table */}
        <div className="border border-slate-200 rounded-lg overflow-x-auto mb-6">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-xs uppercase tracking-wider text-slate-500 font-medium">
                <th className="py-3 px-4">#</th>
                <th className="py-3 px-4">Item / Service</th>
                <th className="py-3 px-4 text-right">Qty</th>
                <th className="py-3 px-4 text-right">Unit Price (₹)</th>
                <th className="py-3 px-4 text-right">Taxable Amount (₹)</th>
                <th className="py-3 px-4 text-right">GST (18%) (₹)</th>
                <th className="py-3 px-4 text-right">Total (₹)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {items.map((item: any, idx: number) => {
                const itemTaxable = Number(item.quantity) * Number(item.unitPrice);
                const itemGst = itemTaxable * 0.18;
                const itemTotal = itemTaxable + itemGst;
                return (
                  <tr key={item.id} className="text-sm text-slate-900">
                    <td className="py-3 px-4">{idx + 1}</td>
                    <td className="py-3 px-4 font-medium">{item.itemName}</td>
                    <td className="py-3 px-4 text-right">{item.quantity}</td>
                    <td className="py-3 px-4 text-right">{Number(item.unitPrice).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                    <td className="py-3 px-4 text-right">{itemTaxable.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                    <td className="py-3 px-4 text-right">{itemGst.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                    <td className="py-3 px-4 text-right font-medium">{itemTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Totals */}
        <div className="flex justify-end mb-8">
          <div className="w-full md:w-80 space-y-3 text-sm">
            <div className="flex justify-between text-slate-600">
              <span>Sub Total</span>
              <span className="font-medium text-slate-900">₹ {taxableAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Discount</span>
              <span className="font-medium text-red-600">- ₹ 0.00</span>
            </div>
            <div className="flex justify-between text-slate-600 pb-3 border-b border-slate-100">
              <span>Taxable Amount</span>
              <span className="font-medium text-slate-900">₹ {taxableAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
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
              <span className="font-bold text-slate-900">Invoice Total</span>
              <span className="font-bold text-xl text-emerald-600">₹ {totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            </div>
          </div>
        </div>

        {/* Actions Bottom */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 pt-6 border-t border-slate-100">
          <div className="flex gap-3 w-full md:w-auto">
            <button className="flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-slate-300 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors flex-1 md:flex-none">
              <Save size={16} />
              Save as Draft
            </button>
            <button className="flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-slate-300 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors flex-1 md:flex-none">
              <Eye size={16} />
              Preview Invoice
            </button>
            <div className="relative inline-flex rounded-lg shadow-sm flex-1 md:flex-none">
              <button className="flex items-center justify-center w-full md:w-auto gap-2 px-4 py-2.5 bg-emerald-700 border border-emerald-700 rounded-l-lg text-sm font-medium text-white hover:bg-emerald-800 transition-colors">
                <Download size={16} />
                Download Invoice (PDF)
              </button>
              <button className="flex items-center justify-center px-2 py-2.5 bg-emerald-800 border border-emerald-800 border-l-emerald-700 rounded-r-lg text-white hover:bg-emerald-900 transition-colors">
                <ChevronDown size={16} />
              </button>
            </div>
          </div>
          <button 
            onClick={handleGenerateInvoice}
            disabled={loading}
            className="flex items-center justify-center gap-2 px-6 py-2.5 bg-emerald-600 border border-emerald-600 rounded-lg text-sm font-medium text-white hover:bg-emerald-700 transition-colors w-full md:w-auto disabled:opacity-70"
          >
            <Send size={16} />
            {loading ? "Generating..." : "Generate Invoice"}
          </button>
        </div>

      </div>
    </div>
  );
}
