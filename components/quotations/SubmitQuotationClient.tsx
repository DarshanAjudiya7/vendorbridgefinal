"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  FileText, 
  Calendar, 
  MapPin, 
  CreditCard, 
  ShieldCheck, 
  Clock, 
  Paperclip,
  Download,
  Info,
  CheckCircle2,
  ChevronRight
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

type Props = {
  rfq: any;
  existingQuotation: any | null;
  isVendor: boolean;
};

export default function SubmitQuotationClient({ rfq, existingQuotation, isVendor }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [saveDraftLoading, setSaveDraftLoading] = useState(false);

  // Initialize form state
  const [items, setItems] = useState<any[]>(
    rfq.items.map((item: any) => {
      const existingItem = existingQuotation?.items?.find((i: any) => i.itemName === item.itemName);
      return {
        ...item,
        unitPrice: existingItem ? existingItem.unitPrice : 0,
      };
    })
  );

  const [deliveryDate, setDeliveryDate] = useState(
    existingQuotation?.deliveryDate 
      ? new Date(existingQuotation.deliveryDate).toISOString().split('T')[0] 
      : ''
  );
  const [deliveryLocation, setDeliveryLocation] = useState(
    existingQuotation?.deliveryLocation || rfq.deliveryLocation || ''
  );
  const [paymentTerms, setPaymentTerms] = useState(
    existingQuotation?.paymentTerms || '30 Days'
  );
  const [warranty, setWarranty] = useState(
    existingQuotation?.warranty || ''
  );
  const [validUntil, setValidUntil] = useState(
    existingQuotation?.validUntil 
      ? new Date(existingQuotation.validUntil).toISOString().split('T')[0] 
      : ''
  );
  const [notes, setNotes] = useState(
    existingQuotation?.notes || ''
  );

  const [timeLeft, setTimeLeft] = useState('');

  useEffect(() => {
    const updateCountdown = () => {
      const deadlineDate = new Date(rfq.deadline).getTime();
      const now = new Date().getTime();
      const distance = deadlineDate - now;

      if (distance < 0) {
        setTimeLeft('EXPIRED');
        return;
      }

      const days = Math.floor(distance / (1000 * 60 * 60 * 24));
      const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((distance % (1000 * 60)) / 1000);

      setTimeLeft(`${days.toString().padStart(2, '0')}d : ${hours.toString().padStart(2, '0')}h : ${minutes.toString().padStart(2, '0')}m : ${seconds.toString().padStart(2, '0')}s`);
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [rfq.deadline]);

  // Calculations
  const subTotal = items.reduce((acc, item) => acc + (Number(item.quantity) * Number(item.unitPrice || 0)), 0);
  const cgst = subTotal * 0.09;
  const sgst = subTotal * 0.09;
  const total = subTotal + cgst + sgst;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: rfq.currency || 'INR' }).format(value);
  };

  const handlePriceChange = (id: string, price: string) => {
    setItems(items.map(item => item.id === id ? { ...item, unitPrice: price } : item));
  };

  const handleSubmit = async (status: 'DRAFT' | 'SUBMITTED') => {
    if (!isVendor) {
      alert("Only vendors can submit quotations.");
      return;
    }

    if (status === 'SUBMITTED') {
      if (items.some(item => !item.unitPrice || Number(item.unitPrice) <= 0)) {
        alert("Please enter a valid unit price for all items.");
        return;
      }
      if (!deliveryDate || !deliveryLocation || !paymentTerms || !validUntil) {
        alert("Please fill in all required Delivery & Terms fields.");
        return;
      }
      setLoading(true);
    } else {
      setSaveDraftLoading(true);
    }

    try {
      const res = await fetch('/api/quotations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rfqId: rfq.id,
          items: items.map(i => ({
            itemName: i.itemName,
            quantity: Number(i.quantity),
            unitPrice: Number(i.unitPrice),
          })),
          deliveryDate,
          deliveryLocation,
          paymentTerms,
          warranty,
          validUntil,
          notes,
          status
        })
      });

      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.message || "Failed to submit quotation");
      }

      router.push('/dashboard');
      router.refresh();
      
    } catch (error: any) {
      console.error(error);
      alert(error.message);
    } finally {
      setLoading(false);
      setSaveDraftLoading(false);
    }
  };

  const isExpired = new Date(rfq.deadline).getTime() < new Date().getTime();
  const isSubmitted = existingQuotation?.status === 'SUBMITTED' || existingQuotation?.status === 'ACCEPTED';
  const readOnly = isExpired || isSubmitted || !isVendor;

  return (
    <div className="flex flex-col xl:flex-row gap-6 max-w-[1600px] mx-auto pb-12">
      {/* Main Form Area */}
      <div className="flex-1 space-y-6">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
          <div>
            <div className="flex items-center text-sm text-gray-500 mb-1">
              <span>RFQs</span>
              <ChevronRight size={14} className="mx-1" />
              <span>RFQ Details</span>
              <ChevronRight size={14} className="mx-1" />
              <span className="text-gray-900 font-medium">Submit Quotation</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Submit Quotation</h1>
            <p className="text-sm text-gray-500 mt-1">Provide your best offer for the following RFQ</p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex flex-col items-center sm:items-end justify-center px-4 py-2 bg-red-50 border border-red-100 rounded-lg">
               <span className="text-xs text-gray-500 font-medium mb-1">RFQ Deadline</span>
               <span className="text-red-600 font-bold text-lg">{timeLeft}</span>
               <span className="text-xs text-gray-500">{new Date(rfq.deadline).toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short' })}</span>
            </div>
            <div className="flex flex-col items-center justify-center px-6 py-2 bg-emerald-50 border border-emerald-100 rounded-lg">
               <span className="text-xs text-gray-500 font-medium mb-1">RFQ Status</span>
               <div className="flex items-center gap-1.5 text-emerald-600 font-bold text-lg">
                 <div className="w-2.5 h-2.5 rounded-full bg-emerald-500"></div>
                 {rfq.status === 'PUBLISHED' ? 'Open' : rfq.status}
               </div>
            </div>
          </div>
        </div>

        {/* RFQ Context Box */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 flex flex-col sm:flex-row gap-6 items-start sm:items-center justify-between">
            <div className="flex items-start gap-4">
                <div className="p-3 bg-blue-50 text-blue-600 rounded-full shrink-0">
                    <FileText size={24} />
                </div>
                <div>
                    <div className="mb-4">
                        <p className="text-xs text-gray-500 font-medium mb-1">RFQ Title</p>
                        <p className="font-bold text-gray-900 text-lg">{rfq.title}</p>
                    </div>
                    <div>
                        <p className="text-xs text-gray-500 font-medium mb-1">RFQ Reference No.</p>
                        <p className="font-bold text-gray-900">{rfq.rfqNumber}</p>
                    </div>
                </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-8 w-full sm:w-auto">
                <div>
                    <p className="text-xs text-gray-500 font-medium mb-1">Buyer</p>
                    <p className="font-bold text-gray-900">{rfq.createdBy?.name || 'Unknown'}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{rfq.createdBy?.role === 'PROCUREMENT_OFFICER' ? 'Procurement Officer' : rfq.createdBy?.role}</p>
                </div>
                <div>
                    <p className="text-xs text-gray-500 font-medium mb-1">Deadline</p>
                    <p className="font-bold text-gray-900">{new Date(rfq.deadline).toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short' })}</p>
                </div>
            </div>
            <button className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium hover:bg-gray-50 transition shrink-0 whitespace-nowrap">
                View Details
            </button>
        </div>

        {/* Section 1: Pricing Details */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 sm:p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="flex items-center justify-center w-6 h-6 rounded-full bg-[#0F8C58] text-white text-xs font-bold">1</div>
            <h2 className="text-lg font-bold text-gray-900">Pricing Details</h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm mb-4">
              <thead>
                <tr className="text-gray-500 font-medium border-b border-gray-200">
                  <th className="pb-3 w-8">#</th>
                  <th className="pb-3 min-w-[200px]">Item / Service Name</th>
                  <th className="pb-3 min-w-[200px]">Specification</th>
                  <th className="pb-3 w-24 text-center">Quantity</th>
                  <th className="pb-3 w-20 text-center">Unit</th>
                  <th className="pb-3 w-32 text-right">Unit Price ({rfq.currency}) <span className="text-red-500">*</span></th>
                  <th className="pb-3 w-32 text-right">Total Price ({rfq.currency})</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {items.map((item, index) => (
                  <tr key={item.id || index}>
                    <td className="py-4 text-gray-500">{index + 1}</td>
                    <td className="py-4 pr-3 font-medium text-gray-900">{item.itemName}</td>
                    <td className="py-4 pr-3 text-gray-500 text-xs">{item.description}</td>
                    <td className="py-4 pr-3 text-center">{item.quantity}</td>
                    <td className="py-4 pr-3 text-center">{item.unit || 'Nos'}</td>
                    <td className="py-4 pr-3">
                      <input 
                        type="number" 
                        min="0"
                        value={item.unitPrice || ''}
                        onChange={(e) => handlePriceChange(item.id, e.target.value)}
                        placeholder="0.00"
                        disabled={readOnly}
                        className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-emerald-500 outline-none text-right disabled:bg-gray-50 disabled:text-gray-500"
                      />
                    </td>
                    <td className="py-4 font-semibold text-gray-900 text-right">
                      {((Number(item.quantity) || 0) * (Number(item.unitPrice) || 0)).toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-t border-gray-100 pt-6 mt-2">
            <div className="flex items-center gap-2 text-gray-500 text-sm mb-6 sm:mb-0">
               <Info size={16} />
               <span>All prices should be entered in {rfq.currency || 'INR'}</span>
            </div>
            
            <div className="w-full sm:w-80 space-y-3">
                <div className="flex justify-between text-sm">
                    <span className="text-gray-600 font-medium">Subtotal</span>
                    <span className="text-gray-900 font-bold">{subTotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                    <span className="text-gray-600">CGST (9%)</span>
                    <span className="text-gray-900">{cgst.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                    <span className="text-gray-600">SGST (9%)</span>
                    <span className="text-gray-900">{sgst.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-lg pt-3 border-t border-gray-200">
                    <span className="text-gray-900 font-bold">Total ({rfq.currency === 'INR' ? '₹' : rfq.currency})</span>
                    <span className="text-[#0F8C58] font-bold">{total.toFixed(2)}</span>
                </div>
            </div>
          </div>
        </div>

        {/* Section 2: Delivery & Terms */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 sm:p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="flex items-center justify-center w-6 h-6 rounded-full bg-[#0F8C58] text-white text-xs font-bold">2</div>
            <h2 className="text-lg font-bold text-gray-900">Delivery & Terms</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Delivery Timeline <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Calendar size={16} className="text-gray-400" />
                  </div>
                  <input
                    type="date"
                    value={deliveryDate}
                    onChange={(e) => setDeliveryDate(e.target.value)}
                    disabled={readOnly}
                    className="w-full rounded-lg border border-gray-300 pl-10 pr-4 py-2.5 text-sm focus:border-emerald-500 outline-none text-gray-600 disabled:bg-gray-50"
                  />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Delivery Location <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <MapPin size={16} className="text-gray-400" />
                  </div>
                  <input
                    type="text"
                    value={deliveryLocation}
                    onChange={(e) => setDeliveryLocation(e.target.value)}
                    placeholder="E.g. Mumbai, Maharashtra"
                    disabled={readOnly}
                    className="w-full rounded-lg border border-gray-300 pl-10 pr-4 py-2.5 text-sm focus:border-emerald-500 outline-none disabled:bg-gray-50"
                  />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Payment Terms <span className="text-red-500">*</span>
              </label>
              <select
                value={paymentTerms}
                onChange={(e) => setPaymentTerms(e.target.value)}
                disabled={readOnly}
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-emerald-500 outline-none bg-white disabled:bg-gray-50"
              >
                <option value="Immediate">Immediate</option>
                <option value="15 Days">15 Days</option>
                <option value="30 Days">30 Days</option>
                <option value="45 Days">45 Days</option>
                <option value="60 Days">60 Days</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    Warranty / Guarantee
                </label>
                <input
                    type="text"
                    value={warranty}
                    onChange={(e) => setWarranty(e.target.value)}
                    placeholder="Enter warranty or guarantee details (if any)"
                    disabled={readOnly}
                    className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-emerald-500 outline-none disabled:bg-gray-50"
                  />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    Validity of Quotation <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Calendar size={16} className="text-gray-400" />
                  </div>
                  <input
                    type="date"
                    value={validUntil}
                    onChange={(e) => setValidUntil(e.target.value)}
                    disabled={readOnly}
                    className="w-full rounded-lg border border-gray-300 pl-10 pr-4 py-2.5 text-sm focus:border-emerald-500 outline-none text-gray-600 disabled:bg-gray-50"
                  />
              </div>
            </div>
          </div>
        </div>

        {/* Section 3: Notes / Comments */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 sm:p-8 mb-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="flex items-center justify-center w-6 h-6 rounded-full bg-[#0F8C58] text-white text-xs font-bold">3</div>
            <h2 className="text-lg font-bold text-gray-900">Notes / Comments</h2>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Additional Notes
            </label>
            <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Enter any additional notes or comments for the buyer..."
                rows={4}
                disabled={readOnly}
                className="w-full rounded-lg border border-gray-300 p-4 text-sm focus:border-emerald-500 outline-none resize-y disabled:bg-gray-50"
            />
            <div className="text-right text-xs text-gray-400 mt-1">
                {notes.length} / 1000
            </div>
          </div>
        </div>

        {/* Actions Bar */}
        <div className="flex items-center justify-between bg-white p-4 rounded-xl border border-gray-100 shadow-sm sticky bottom-6 z-10">
            <button 
                onClick={() => handleSubmit('DRAFT')}
                disabled={saveDraftLoading || loading || readOnly}
                className="flex items-center gap-2 px-6 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
                <FileText size={16} />
                {saveDraftLoading ? "Saving..." : "Save Draft"}
            </button>
            <div className="flex items-center gap-3">
                <button 
                    onClick={() => router.back()}
                    className="px-6 py-2.5 text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors"
                >
                    Cancel
                </button>
                <button 
                    onClick={() => handleSubmit('SUBMITTED')}
                    disabled={saveDraftLoading || loading || readOnly}
                    className="flex items-center gap-2 px-6 py-2.5 text-sm font-medium text-white bg-[#0F8C58] rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                >
                    <CheckCircle2 size={16} />
                    {loading ? "Submitting..." : isSubmitted ? "Already Submitted" : "Submit Quotation"}
                </button>
            </div>
        </div>

      </div>

      {/* Right Sidebar */}
      <div className="w-full xl:w-80 flex flex-col gap-6">
        
        {/* RFQ Summary Sticky Card */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
          <div className="flex items-center gap-2 mb-6 border-b border-gray-100 pb-4">
            <FileText size={20} className="text-[#0F8C58]" />
            <h2 className="text-lg font-bold text-gray-900">RFQ Summary</h2>
          </div>

          <div className="space-y-5">
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">RFQ Title</p>
              <p className="text-sm font-medium text-gray-900 leading-tight">{rfq.title}</p>
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">RFQ Reference No.</p>
              <p className="text-sm font-medium text-gray-900">{rfq.rfqNumber}</p>
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Buyer</p>
              <p className="text-sm font-medium text-gray-900">{rfq.createdBy?.name || 'Unknown'}</p>
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Deadline</p>
              <p className="text-sm font-medium text-gray-900">
                {new Date(rfq.deadline).toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short' })}
              </p>
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Currency</p>
              <p className="text-sm font-medium text-gray-900">{rfq.currency || 'INR'} - Indian Rupee</p>
            </div>
          </div>
        </div>

        {/* Attachments Card */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
          <div className="flex items-center gap-2 mb-4 border-b border-gray-100 pb-4">
            <Paperclip size={20} className="text-gray-500" />
            <h2 className="text-lg font-bold text-gray-900">Attachments</h2>
          </div>
          
          {rfq.attachments && rfq.attachments.length > 0 ? (
              <div className="space-y-3">
                  {rfq.attachments.map((file: any, idx: number) => (
                      <div key={idx} className="flex items-start gap-3 p-3 rounded-lg border border-gray-100 bg-gray-50 hover:bg-gray-100 transition cursor-pointer">
                          <FileText size={20} className="text-red-400 shrink-0 mt-0.5" />
                          <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-900 truncate">{file.fileName}</p>
                              <p className="text-xs text-gray-500 mt-0.5">120 KB</p>
                          </div>
                      </div>
                  ))}
                  <button className="w-full flex items-center justify-center gap-2 py-2 mt-4 text-sm font-medium text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50 transition">
                      <Download size={16} /> Download All
                  </button>
              </div>
          ) : (
              <p className="text-sm text-gray-500 italic text-center py-4">No attachments provided.</p>
          )}
        </div>

        {/* Important Notes Card */}
        <div className="bg-blue-50 rounded-xl border border-blue-100 p-6">
          <div className="flex items-center gap-2 mb-4">
            <Info size={20} className="text-blue-600" />
            <h2 className="text-lg font-bold text-blue-900">Important Notes</h2>
          </div>
          <ul className="space-y-3 text-sm text-blue-800 list-disc pl-5">
            <li>Please review all RFQ details and terms carefully before submitting your quotation.</li>
            <li>You can edit your quotation until the deadline.</li>
            <li>Late submissions will not be considered.</li>
            <li>Contact the buyer for any clarifications.</li>
          </ul>
        </div>
        
      </div>
    </div>
  );
}
