"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  ChevronRight, 
  Download,
  Info,
  CheckCircle,
  XCircle,
  Clock,
  FileText
} from 'lucide-react';
import { format } from 'date-fns';

export default function ApprovalRequestClient({ 
  currentApproval, 
  allApprovals,
  currentUser
}: { 
  currentApproval: any, 
  allApprovals: any[],
  currentUser: any
}) {
  const router = useRouter();
  const [remarks, setRemarks] = useState('');
  const [decision, setDecision] = useState<'APPROVE' | 'REJECT' | 'MORE_INFO' | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const rfq = currentApproval.rfq;
  const quotation = rfq.quotations?.[0]; // The shortlisted quotation if any
  const vendor = quotation?.vendor;

  const handleSubmit = async () => {
    if (!decision) {
      alert("Please select a decision");
      return;
    }
    if (decision === 'REJECT' && !remarks.trim()) {
      alert("Remarks are required for rejection");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/approvals/${currentApproval.id}/action`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: decision, remarks })
      });
      if (res.ok) {
        alert("Approval action processed successfully");
        router.push('/dashboard/approvals');
        router.refresh();
      } else {
        alert("Failed to process approval");
      }
    } catch (e) {
      console.error(e);
      alert("An error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'APPROVED': return 'text-emerald-600 bg-emerald-50';
      case 'REJECTED': return 'text-red-600 bg-red-50';
      case 'PENDING': return 'text-amber-600 bg-amber-50';
      default: return 'text-slate-600 bg-slate-50';
    }
  };

  // Helper to construct timeline
  const timelineSteps = [
    { 
      title: 'Submitted', 
      subtitle: rfq.createdBy.name, 
      date: format(new Date(rfq.createdAt), 'dd MMM yyyy, hh:mm a'),
      status: 'COMPLETED',
      role: 'Procurement Officer'
    },
    ...allApprovals.map(app => ({
      title: `Level ${app.level} Approval`,
      subtitle: app.approver.name,
      date: app.actionAt ? format(new Date(app.actionAt), 'dd MMM yyyy, hh:mm a') : null,
      status: app.status,
      role: 'Approver',
      isCurrent: app.id === currentApproval.id
    })),
    {
      title: 'Final Approval',
      subtitle: 'System',
      date: null,
      status: allApprovals.every(a => a.status === 'APPROVED') ? 'COMPLETED' : 'WAITING',
      role: 'System'
    }
  ];

  return (
    <div className="flex flex-col gap-6 max-w-[1600px] mx-auto pb-12">
      {/* Breadcrumb */}
      <div className="flex items-center text-sm text-gray-500">
        <Link href="/dashboard/approvals" className="hover:text-emerald-600">Approvals</Link>
        <ChevronRight size={14} className="mx-2" />
        <span className="text-gray-900 font-medium">Approval Requests</span>
        <ChevronRight size={14} className="mx-2" />
        <span className="text-gray-900 font-medium">{rfq.rfqNumber}</span>
      </div>

      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold text-gray-900">Approval Request</h1>
          <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(currentApproval.status)}`}>
            {currentApproval.status === 'PENDING' ? 'Pending' : currentApproval.status}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 font-medium text-sm transition-colors">
            <Download size={16} />
            Download Documents
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 font-medium text-sm transition-colors">
            <Info size={16} />
            Request More Info
          </button>
          {currentApproval.status === 'PENDING' && (
            <>
              <button onClick={() => setDecision('APPROVE')} className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-colors ${decision === 'APPROVE' ? 'bg-emerald-700 text-white' : 'bg-emerald-600 text-white hover:bg-emerald-700'}`}>
                <CheckCircle size={16} />
                Approve
              </button>
              <button onClick={() => setDecision('REJECT')} className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-colors ${decision === 'REJECT' ? 'bg-red-700 text-white' : 'bg-red-600 text-white hover:bg-red-700'}`}>
                <XCircle size={16} />
                Reject
              </button>
            </>
          )}
        </div>
      </div>

      {/* Info Card */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 flex flex-wrap lg:flex-nowrap gap-8 items-center justify-between">
        <div>
          <p className="text-xs text-gray-500 font-medium mb-1">Request ID</p>
          <p className="font-semibold text-gray-900">{rfq.rfqNumber}</p>
        </div>
        <div className="hidden lg:block w-px h-10 bg-gray-100"></div>
        <div>
          <p className="text-xs text-gray-500 font-medium mb-1">Request Type</p>
          <p className="font-semibold text-gray-900">RFQ / Purchase Order</p>
        </div>
        <div className="hidden lg:block w-px h-10 bg-gray-100"></div>
        <div>
          <p className="text-xs text-gray-500 font-medium mb-1">Current Stage</p>
          <p className="font-semibold text-gray-900">Level {currentApproval.level} Approval</p>
        </div>
        <div className="hidden lg:block w-px h-10 bg-gray-100"></div>
        <div>
          <p className="text-xs text-gray-500 font-medium mb-1">Requested By</p>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-bold">
              {rfq.createdBy.name.charAt(0)}
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">{rfq.createdBy.name}</p>
              <p className="text-[10px] text-gray-500">Procurement Officer</p>
            </div>
          </div>
        </div>
        <div className="hidden lg:block w-px h-10 bg-gray-100"></div>
        <div>
          <p className="text-xs text-gray-500 font-medium mb-1">Requested On</p>
          <p className="font-semibold text-gray-900">{format(new Date(rfq.createdAt), 'dd MMM yyyy, hh:mm a')}</p>
        </div>
        <div className="hidden lg:block w-px h-10 bg-gray-100"></div>
        <div>
          <p className="text-xs text-gray-500 font-medium mb-1">Amount</p>
          <p className="font-bold text-emerald-600">{quotation ? `${rfq.currency} ${Number(quotation.totalAmount).toLocaleString()}` : 'N/A'}</p>
        </div>
      </div>

      {/* Horizontal Progress */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-8">
        <div className="flex items-center justify-between relative">
          <div className="absolute top-5 left-0 w-full h-1 bg-gray-100 -z-10"></div>
          {timelineSteps.slice(0, 5).map((step, idx) => (
             <div key={idx} className="flex flex-col items-center flex-1 z-10">
               <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm border-4 border-white ${
                 step.status === 'COMPLETED' || step.status === 'APPROVED' ? 'bg-emerald-600 text-white' : 
                 step.isCurrent ? 'bg-amber-500 text-white' : 
                 'bg-gray-200 text-gray-500'
               }`}>
                 {step.status === 'COMPLETED' || step.status === 'APPROVED' ? <CheckCircle size={18} /> : idx + 1}
               </div>
               <p className={`mt-3 font-medium text-sm ${step.isCurrent ? 'text-gray-900' : 'text-gray-500'}`}>{step.title}</p>
               {step.status === 'APPROVED' && <p className="text-xs text-emerald-600 font-medium mt-1">Approved</p>}
               {step.isCurrent && <p className="text-xs text-amber-500 font-medium mt-1">Pending (Current)</p>}
               {step.status === 'PENDING' && !step.isCurrent && <p className="text-xs text-amber-500 font-medium mt-1">Pending</p>}
               {step.status === 'WAITING' && <p className="text-xs text-gray-400 font-medium mt-1">Waiting</p>}
               {step.date && <p className="text-[10px] text-gray-400 mt-1">{step.date}</p>}
             </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Side (Tabs + Form) */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="flex border-b border-gray-100">
              <button className="px-6 py-4 text-sm font-medium text-emerald-600 border-b-2 border-emerald-600">Request Details</button>
              <button className="px-6 py-4 text-sm font-medium text-gray-500 hover:text-gray-700">Documents (3)</button>
              <button className="px-6 py-4 text-sm font-medium text-gray-500 hover:text-gray-700">Approval Timeline</button>
              <button className="px-6 py-4 text-sm font-medium text-gray-500 hover:text-gray-700">Comments (2)</button>
            </div>
            
            <div className="p-6">
              <h3 className="font-bold text-gray-900 mb-6">Request Overview</h3>
              <div className="grid grid-cols-3 gap-6 mb-8">
                <div>
                  <p className="text-xs text-gray-500 mb-1">RFQ Reference</p>
                  <p className="font-medium text-blue-600">{rfq.rfqNumber}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Vendor</p>
                  <p className="font-medium text-blue-600">{vendor?.companyName || 'Not selected'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">PO Amount (Incl. Tax)</p>
                  <p className="font-medium text-gray-900">{quotation ? `${rfq.currency} ${Number(quotation.totalAmount).toLocaleString()}` : 'N/A'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">RFQ Title</p>
                  <p className="font-medium text-gray-900">{rfq.title}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Quotation Reference</p>
                  <p className="font-medium text-blue-600">{quotation?.quotationNumber || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Currency</p>
                  <p className="font-medium text-gray-900">{rfq.currency}</p>
                </div>
              </div>

              <h3 className="font-bold text-gray-900 mb-4">Items Summary ({rfq.items.length})</h3>
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <table className="w-full text-sm text-left">
                  <thead className="bg-gray-50 border-b border-gray-200 text-gray-700 font-medium">
                    <tr>
                      <th className="px-4 py-3">#</th>
                      <th className="px-4 py-3">Item / Service</th>
                      <th className="px-4 py-3">Description</th>
                      <th className="px-4 py-3">Qty</th>
                      {quotation && <th className="px-4 py-3 text-right">Unit Price</th>}
                      {quotation && <th className="px-4 py-3 text-right">Total</th>}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {rfq.items.map((item, idx) => {
                      const qItem = quotation?.items?.find(qi => qi.itemName === item.itemName);
                      return (
                        <tr key={item.id} className="bg-white">
                          <td className="px-4 py-3 text-gray-500">{idx + 1}</td>
                          <td className="px-4 py-3 font-medium text-gray-900">{item.itemName}</td>
                          <td className="px-4 py-3 text-gray-500">{item.description || '-'}</td>
                          <td className="px-4 py-3 text-gray-900">{item.quantity}</td>
                          {quotation && <td className="px-4 py-3 text-right text-gray-900">{qItem ? Number(qItem.unitPrice).toLocaleString() : '-'}</td>}
                          {quotation && <td className="px-4 py-3 text-right text-gray-900">{qItem ? Number(qItem.totalPrice).toLocaleString() : '-'}</td>}
                        </tr>
                      );
                    })}
                    {quotation && (
                      <tr className="bg-gray-50">
                        <td colSpan={5} className="px-4 py-4 text-right font-bold text-gray-900">Total (Incl. Tax)</td>
                        <td className="px-4 py-4 text-right font-bold text-emerald-600 text-lg">{rfq.currency} {Number(quotation.totalAmount).toLocaleString()}</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {currentApproval.status === 'PENDING' && (
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
              <h3 className="font-bold text-emerald-700 mb-6">Your Decision (Level {currentApproval.level} Approval)</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <p className="text-sm font-medium text-gray-900 mb-2">Remarks <span className="text-red-500">*</span></p>
                  <textarea 
                    rows={4}
                    value={remarks}
                    onChange={(e) => setRemarks(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:border-emerald-500 outline-none resize-none"
                    placeholder="Enter your remarks..."
                  ></textarea>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900 mb-2">Decision <span className="text-red-500">*</span></p>
                  <div className="flex gap-4">
                    <button 
                      onClick={() => setDecision('APPROVE')}
                      className={`flex-1 p-4 rounded-lg border-2 text-left transition-colors ${decision === 'APPROVE' ? 'border-emerald-500 bg-emerald-50' : 'border-gray-200 bg-white hover:border-emerald-200'}`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${decision === 'APPROVE' ? 'border-emerald-600' : 'border-gray-400'}`}>
                          {decision === 'APPROVE' && <div className="w-2 h-2 rounded-full bg-emerald-600"></div>}
                        </div>
                        <span className="font-bold text-emerald-700">Approve</span>
                      </div>
                      <p className="text-xs text-gray-500 ml-6">Request will move to next level</p>
                    </button>

                    <button 
                      onClick={() => setDecision('REJECT')}
                      className={`flex-1 p-4 rounded-lg border-2 text-left transition-colors ${decision === 'REJECT' ? 'border-red-500 bg-red-50' : 'border-gray-200 bg-white hover:border-red-200'}`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${decision === 'REJECT' ? 'border-red-600' : 'border-gray-400'}`}>
                          {decision === 'REJECT' && <div className="w-2 h-2 rounded-full bg-red-600"></div>}
                        </div>
                        <span className="font-bold text-red-700">Reject</span>
                      </div>
                      <p className="text-xs text-gray-500 ml-6">Request will be rejected</p>
                    </button>
                  </div>
                  
                  <div className="mt-6 flex justify-end">
                    <button 
                      onClick={handleSubmit}
                      disabled={isSubmitting || !decision}
                      className="bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-medium px-8 py-2.5 rounded-lg transition-colors"
                    >
                      {isSubmitting ? 'Processing...' : 'Submit Decision'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Side (Sidebar) */}
        <div className="flex flex-col gap-6">
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
            <h3 className="font-bold text-gray-900 flex items-center gap-2 mb-6">
              <FileText size={18} className="text-emerald-600" />
              Request Details
            </h3>
            
            <div className="space-y-4 text-sm">
              <div className="flex justify-between border-b border-gray-50 pb-2">
                <span className="text-gray-500">Request ID</span>
                <span className="font-medium text-gray-900">{rfq.rfqNumber}</span>
              </div>
              <div className="flex justify-between border-b border-gray-50 pb-2">
                <span className="text-gray-500">Request Type</span>
                <span className="font-medium text-gray-900">RFQ / Purchase Order</span>
              </div>
              <div className="flex justify-between border-b border-gray-50 pb-2">
                <span className="text-gray-500">Priority</span>
                <span className="font-medium text-amber-600 bg-amber-50 px-2 py-0.5 rounded">Medium</span>
              </div>
              <div className="flex justify-between border-b border-gray-50 pb-2">
                <span className="text-gray-500">Department</span>
                <span className="font-medium text-gray-900">Administration</span>
              </div>
              <div className="flex justify-between border-b border-gray-50 pb-2">
                <span className="text-gray-500">Need By Date</span>
                <span className="font-medium text-gray-900">{format(new Date(rfq.deadline), 'dd MMM yyyy')}</span>
              </div>
              <div className="flex justify-between border-b border-gray-50 pb-2">
                <span className="text-gray-500">Reason</span>
                <span className="font-medium text-gray-900 text-right max-w-[150px]">{rfq.title}</span>
              </div>
              <div className="flex justify-between pb-2">
                <span className="text-gray-500">Status</span>
                <span className="font-medium text-amber-600 bg-amber-50 px-2 py-0.5 rounded">Pending (Level {currentApproval.level})</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
            <h3 className="font-bold text-gray-900 flex items-center gap-2 mb-6">
              <Clock size={18} className="text-emerald-600" />
              Approval Timeline
            </h3>
            
            <div className="space-y-6 relative before:absolute before:inset-0 before:ml-4 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-emerald-500 before:via-gray-200 before:to-gray-200">
              {timelineSteps.filter(s => s.role !== 'System').map((step, idx) => (
                <div key={idx} className="relative flex items-start gap-4">
                  <div className={`w-8 h-8 rounded-full border-4 flex items-center justify-center shrink-0 z-10 bg-white ${
                    step.status === 'COMPLETED' || step.status === 'APPROVED' ? 'border-emerald-500 text-emerald-500' :
                    step.isCurrent ? 'border-amber-500 text-amber-500' : 'border-gray-200 text-gray-300'
                  }`}>
                    {step.status === 'COMPLETED' || step.status === 'APPROVED' ? <CheckCircle size={14} /> : <Clock size={14} />}
                  </div>
                  <div className="flex-1 pb-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-bold text-sm text-gray-900">{step.title}</p>
                        <p className="text-xs text-gray-600 mt-0.5">{step.subtitle} <span className="text-gray-400">({step.role})</span></p>
                        {step.date && <p className="text-[10px] text-gray-400 mt-1">{step.date}</p>}
                      </div>
                      <span className={`px-2 py-0.5 text-[10px] font-bold rounded uppercase ${
                        step.status === 'COMPLETED' || step.status === 'APPROVED' ? 'bg-emerald-50 text-emerald-600' :
                        step.isCurrent ? 'bg-amber-50 text-amber-600' : 'bg-gray-50 text-gray-400'
                      }`}>
                        {step.status === 'APPROVED' ? 'Approved' : step.isCurrent ? 'Pending' : 'Waiting'}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
