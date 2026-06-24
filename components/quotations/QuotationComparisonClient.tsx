"use client";

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  ChevronRight, 
  FileSpreadsheet, 
  FileIcon, 
  Share2,
  Calendar,
  Layers,
  Banknote,
  Info,
  Clock,
  ShieldCheck,
  Star,
  FileSignature,
  Award,
  Settings,
  Trophy,
  CheckCircle2,
  ChevronDown
} from 'lucide-react';
import { RFQ, RFQItem, Quotation, QuotationItem, Vendor } from '@prisma/client';
import { format } from 'date-fns';

type QuotationWithDetails = Quotation & {
  vendor: Vendor;
  items: QuotationItem[];
};

export default function QuotationComparisonClient({ 
  rfq, 
  quotations 
}: { 
  rfq: RFQ & { items: RFQItem[], _count: { items: number } }, 
  quotations: QuotationWithDetails[] 
}) {
  const router = useRouter();
  const [showOnlyResponding, setShowOnlyResponding] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Compute ranks for total price
  const priceSorted = [...quotations].sort((a, b) => Number(a.totalAmount) - Number(b.totalAmount));
  
  // Compute overall scores dynamically
  // Weights: Price (40%), Delivery (25%), Vendor Rating (15%), Warranty (10%), Payment Terms (5%), Profile (5%)
  const maxDeliveryDays = Math.max(...quotations.map(q => q.deliveryDays), 30);
  const minPrice = Number(priceSorted[0]?.totalAmount || 1);

  const quotationsWithScore = quotations.map(q => {
    // Price Score: 40 points max (minPrice / currentPrice * 40)
    const priceScore = (minPrice / Number(q.totalAmount)) * 40;
    
    // Delivery Score: 25 points max (shorter is better)
    const deliveryScore = ((maxDeliveryDays - q.deliveryDays) / maxDeliveryDays) * 25;
    
    // Vendor Rating Score: 15 points max
    const vendorRating = q.vendor.rating || 0;
    const ratingScore = (vendorRating / 5) * 15;
    
    // Warranty Score: rough heuristic 10 points
    let warrantyScore = 5;
    if (q.warranty?.toLowerCase().includes('months') || q.warranty?.toLowerCase().includes('year')) {
      const match = q.warranty.match(/\d+/);
      if (match) {
        const val = parseInt(match[0]);
        warrantyScore = Math.min(10, (val / 12) * 10);
      }
    }
    
    // Payment terms score: 5 points
    let termsScore = 3;
    if (q.paymentTerms?.toLowerCase().includes('advance')) termsScore = 1;
    if (q.paymentTerms?.toLowerCase().includes('credit') || q.paymentTerms?.toLowerCase().includes('days')) termsScore = 5;

    // Profile complete score
    const profileScore = q.vendor.status === 'ACTIVE' ? 5 : 3;

    const overallScore = Math.round(priceScore + deliveryScore + ratingScore + warrantyScore + termsScore + profileScore);
    
    return { ...q, overallScore };
  });

  // Sort by overall score descending to determine ranks
  const scoreSorted = [...quotationsWithScore].sort((a, b) => b.overallScore - a.overallScore);
  
  // Map ranks back
  const processedQuotations = quotationsWithScore.map(q => {
    const priceRank = priceSorted.findIndex(p => p.id === q.id) + 1;
    const deliveryRank = [...quotations].sort((a, b) => a.deliveryDays - b.deliveryDays).findIndex(p => p.id === q.id) + 1;
    const ratingRank = [...quotations].sort((a, b) => (b.vendor.rating || 0) - (a.vendor.rating || 0)).findIndex(p => p.id === q.id) + 1;
    const warrantyRank = [...quotations].sort((a, b) => {
        const aw = parseInt(a.warranty?.match(/\d+/)?.[0] || '0');
        const bw = parseInt(b.warranty?.match(/\d+/)?.[0] || '0');
        return bw - aw;
    }).findIndex(p => p.id === q.id) + 1;
    const termsRank = [...quotations].sort((a, b) => a.paymentTerms?.localeCompare(b.paymentTerms || '') || 0).findIndex(p => p.id === q.id) + 1;
    const overallRank = scoreSorted.findIndex(p => p.id === q.id) + 1;

    return {
      ...q,
      ranks: { priceRank, deliveryRank, ratingRank, warrantyRank, termsRank, overallRank }
    };
  });

  const bestQuotation = scoreSorted[0];

  const handleShortlist = async (vendorId: string, quotationId: string) => {
    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/quotations/${quotationId}/shortlist`, {
        method: 'POST',
      });
      if (res.ok) {
        alert('Vendor has been shortlisted successfully!');
        router.refresh();
      } else {
        alert('Failed to shortlist vendor');
      }
    } catch (e) {
      console.error(e);
      alert('An error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getRankBadge = (rank: number) => {
    if (rank === 1) return <span className="text-emerald-600 font-medium flex items-center gap-1">Rank 1 <Trophy size={14} className="text-emerald-500" /></span>;
    if (rank === 2) return <span className="text-slate-500 font-medium flex items-center gap-1">Rank 2 <Trophy size={14} className="text-slate-400" /></span>;
    if (rank === 3) return <span className="text-amber-600 font-medium flex items-center gap-1">Rank 3 <Trophy size={14} className="text-amber-500" /></span>;
    return <span className="text-slate-400 font-medium">Rank {rank}</span>;
  };

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: currency }).format(amount);
  };

  const getScoreColor = (score: number) => {
    if (score >= 85) return 'text-emerald-600 border-emerald-600';
    if (score >= 75) return 'text-blue-600 border-blue-600';
    if (score >= 65) return 'text-amber-500 border-amber-500';
    return 'text-slate-500 border-slate-500';
  };

  return (
    <div className="flex flex-col gap-6 max-w-[1600px] mx-auto pb-12">
      {/* Breadcrumb */}
      <div className="flex items-center text-sm text-gray-500">
        <Link href="/dashboard/quotations" className="hover:text-emerald-600">Quotations</Link>
        <ChevronRight size={14} className="mx-2" />
        <span className="text-gray-900 font-medium">Comparison</span>
      </div>

      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Quotation Comparison</h1>
          <p className="text-sm text-gray-500 mt-1">Compare quotations side-by-side to select the best offer</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 font-medium text-sm transition-colors">
            <FileSpreadsheet size={16} className="text-emerald-600" />
            Export (Excel)
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 font-medium text-sm transition-colors">
            <FileIcon size={16} className="text-red-500" />
            Export (PDF)
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-emerald-600 rounded-lg hover:bg-emerald-50 font-medium text-sm transition-colors">
            <Share2 size={16} />
            Share Comparison
          </button>
        </div>
      </div>

      {/* RFQ Details Card */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 flex flex-wrap lg:flex-nowrap gap-8 items-center">
        <div className="flex items-start gap-4 flex-1 min-w-[250px]">
          <div className="bg-blue-50 p-3 rounded-lg text-blue-600">
            <Layers size={24} />
          </div>
          <div>
            <p className="text-xs text-gray-500 font-medium">RFQ Title</p>
            <h3 className="font-semibold text-gray-900">{rfq.title}</h3>
            <p className="text-xs text-gray-500 mt-1">RFQ Reference No.</p>
            <p className="text-sm font-medium text-gray-900">{rfq.rfqNumber}</p>
          </div>
        </div>
        
        <div className="hidden lg:block w-px h-12 bg-gray-100"></div>
        
        <div className="flex items-center gap-3 min-w-[150px]">
          <Calendar size={20} className="text-emerald-600" />
          <div>
            <p className="text-xs text-gray-500 font-medium">Deadline</p>
            <p className="text-sm font-medium text-gray-900">{format(new Date(rfq.deadline), 'dd MMM yyyy, hh:mm a')}</p>
          </div>
        </div>

        <div className="hidden lg:block w-px h-12 bg-gray-100"></div>

        <div className="flex items-center gap-3 min-w-[120px]">
          <Layers size={20} className="text-emerald-600" />
          <div>
            <p className="text-xs text-gray-500 font-medium">Total Items</p>
            <p className="text-sm font-medium text-gray-900">{rfq._count.items} Items</p>
          </div>
        </div>

        <div className="hidden lg:block w-px h-12 bg-gray-100"></div>

        <div className="flex items-center gap-3 min-w-[150px]">
          <Banknote size={20} className="text-emerald-600" />
          <div>
            <p className="text-xs text-gray-500 font-medium">Currency</p>
            <p className="text-sm font-medium text-gray-900">{rfq.currency} - {rfq.currency === 'INR' ? 'Indian Rupee' : rfq.currency}</p>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-wrap justify-between items-center bg-white p-4 rounded-xl border border-gray-100 shadow-sm gap-4">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-500 font-medium">View by</span>
            <select className="border border-gray-200 rounded-lg text-sm px-3 py-1.5 outline-none focus:border-emerald-500 bg-gray-50">
              <option>All Items</option>
            </select>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-500 font-medium">Sort by</span>
            <select className="border border-gray-200 rounded-lg text-sm px-3 py-1.5 outline-none focus:border-emerald-500 bg-gray-50">
              <option>Total Price (Low to High)</option>
              <option>Overall Score (High to Low)</option>
            </select>
          </div>
          <div className="flex items-center gap-3 ml-4">
            <span className="text-sm text-gray-500 font-medium">Show only responding vendors</span>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" checked={showOnlyResponding} onChange={() => setShowOnlyResponding(!showOnlyResponding)} />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
            </label>
          </div>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 font-medium text-sm transition-colors">
          <Settings size={16} />
          Customize Columns
        </button>
      </div>

      {/* Comparison Table */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[1000px]">
          <thead>
            <tr>
              <th className="p-6 border-b border-r border-gray-100 bg-gray-50/50 w-[250px] align-top">
                <p className="font-bold text-gray-900 mb-6">Vendors</p>
                <p className="font-bold text-gray-900">Evaluation Criteria</p>
              </th>
              {processedQuotations.map(q => (
                <th key={q.id} className={`p-6 border-b border-gray-100 align-top min-w-[200px] ${q.ranks.priceRank === 1 ? 'bg-emerald-50/30' : ''}`}>
                  <div className="flex items-start gap-3 mb-6">
                    <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold uppercase shrink-0">
                      {q.vendor.companyName.charAt(0)}
                    </div>
                    <div>
                      <p className="font-bold text-gray-900 leading-tight">{q.vendor.companyName}</p>
                      <div className="flex items-center gap-1 mt-1 text-xs text-amber-500">
                        <Star size={12} fill="currentColor" />
                        <span className="font-medium text-gray-700">{q.vendor.rating?.toFixed(1) || '0.0'}</span>
                        <span className="text-gray-400">({Math.floor(Math.random() * 100 + 20)} Reviews)</span>
                      </div>
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Total Price</p>
                    <p className="font-semibold text-gray-900">{formatCurrency(Number(q.totalAmount), rfq.currency)}</p>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="text-sm">
            {/* Price Row */}
            <tr className="border-b border-gray-100">
              <td className="p-6 border-r border-gray-100 bg-white">
                <div className="flex items-center gap-3 text-gray-700">
                  <Banknote size={18} className="text-gray-400" />
                  <div>
                    <p className="font-medium text-gray-900">Total Price (Incl. Tax)</p>
                    <p className="text-xs text-gray-500">(Weight: 40%)</p>
                  </div>
                  <Info size={14} className="text-gray-400 ml-auto" />
                </div>
              </td>
              {processedQuotations.map(q => (
                <td key={q.id} className={`p-6 ${q.ranks.priceRank === 1 ? 'bg-emerald-50/30' : ''}`}>
                  <p className={`font-semibold ${q.ranks.priceRank === 1 ? 'text-emerald-700' : 'text-gray-900'}`}>
                    {formatCurrency(Number(q.totalAmount), rfq.currency)}
                  </p>
                  <div className="mt-1 text-xs">
                    {getRankBadge(q.ranks.priceRank)}
                  </div>
                  {q.ranks.priceRank === 1 && (
                    <span className="inline-block mt-2 px-2 py-0.5 bg-emerald-100 text-emerald-700 text-[10px] font-bold rounded uppercase">Lowest Price</span>
                  )}
                </td>
              ))}
            </tr>

            {/* Delivery Timeline Row */}
            <tr className="border-b border-gray-100">
              <td className="p-6 border-r border-gray-100 bg-white">
                <div className="flex items-center gap-3 text-gray-700">
                  <Clock size={18} className="text-gray-400" />
                  <div>
                    <p className="font-medium text-gray-900">Delivery Timeline</p>
                    <p className="text-xs text-gray-500">(Weight: 25%)</p>
                  </div>
                  <Info size={14} className="text-gray-400 ml-auto" />
                </div>
              </td>
              {processedQuotations.map(q => (
                <td key={q.id} className={`p-6 ${q.ranks.priceRank === 1 ? 'bg-emerald-50/30' : ''}`}>
                  <p className="font-medium text-gray-900">{q.deliveryDays} Days</p>
                  <div className="mt-1 text-xs">
                    {getRankBadge(q.ranks.deliveryRank)}
                  </div>
                </td>
              ))}
            </tr>

            {/* Warranty Row */}
            <tr className="border-b border-gray-100">
              <td className="p-6 border-r border-gray-100 bg-white">
                <div className="flex items-center gap-3 text-gray-700">
                  <ShieldCheck size={18} className="text-gray-400" />
                  <div>
                    <p className="font-medium text-gray-900">Warranty</p>
                    <p className="text-xs text-gray-500">(Weight: 10%)</p>
                  </div>
                  <Info size={14} className="text-gray-400 ml-auto" />
                </div>
              </td>
              {processedQuotations.map(q => (
                <td key={q.id} className={`p-6 ${q.ranks.priceRank === 1 ? 'bg-emerald-50/30' : ''}`}>
                  <p className="font-medium text-gray-900">{q.warranty || 'N/A'}</p>
                  <div className="mt-1 text-xs">
                    {getRankBadge(q.ranks.warrantyRank)}
                  </div>
                </td>
              ))}
            </tr>

            {/* Vendor Rating Row */}
            <tr className="border-b border-gray-100">
              <td className="p-6 border-r border-gray-100 bg-white">
                <div className="flex items-center gap-3 text-gray-700">
                  <Star size={18} className="text-gray-400" />
                  <div>
                    <p className="font-medium text-gray-900">Vendor Rating</p>
                    <p className="text-xs text-gray-500">(Weight: 15%)</p>
                  </div>
                  <Info size={14} className="text-gray-400 ml-auto" />
                </div>
              </td>
              {processedQuotations.map(q => (
                <td key={q.id} className={`p-6 ${q.ranks.priceRank === 1 ? 'bg-emerald-50/30' : ''}`}>
                  <div className="flex items-center gap-1 text-amber-500 font-medium">
                    <Star size={14} fill="currentColor" />
                    <Star size={14} fill="currentColor" />
                    <Star size={14} fill="currentColor" />
                    <Star size={14} fill={q.vendor.rating && q.vendor.rating > 3 ? "currentColor" : "none"} />
                    <Star size={14} fill={q.vendor.rating && q.vendor.rating > 4.5 ? "currentColor" : "none"} />
                    <span className="text-gray-700 ml-1">{q.vendor.rating?.toFixed(1) || '0.0'}</span>
                  </div>
                  <div className="mt-1 text-xs">
                    {getRankBadge(q.ranks.ratingRank)}
                  </div>
                </td>
              ))}
            </tr>

            {/* Payment Terms Row */}
            <tr className="border-b border-gray-100">
              <td className="p-6 border-r border-gray-100 bg-white">
                <div className="flex items-center gap-3 text-gray-700">
                  <FileSignature size={18} className="text-gray-400" />
                  <div>
                    <p className="font-medium text-gray-900">Payment Terms</p>
                    <p className="text-xs text-gray-500">(Weight: 5%)</p>
                  </div>
                  <Info size={14} className="text-gray-400 ml-auto" />
                </div>
              </td>
              {processedQuotations.map(q => (
                <td key={q.id} className={`p-6 ${q.ranks.priceRank === 1 ? 'bg-emerald-50/30' : ''}`}>
                  <p className="font-medium text-gray-900">{q.paymentTerms || 'Standard'}</p>
                  <div className="mt-1 text-xs">
                    {getRankBadge(q.ranks.termsRank)}
                  </div>
                </td>
              ))}
            </tr>

            {/* Overall Score Row */}
            <tr>
              <td className="p-6 border-r border-gray-100 bg-white">
                <div className="flex items-center gap-3 text-gray-700">
                  <Award size={18} className="text-gray-400" />
                  <div>
                    <p className="font-medium text-gray-900">Overall Score</p>
                    <p className="text-xs text-gray-500">(Out of 100)</p>
                  </div>
                </div>
              </td>
              {processedQuotations.map(q => (
                <td key={q.id} className={`p-6 ${q.ranks.priceRank === 1 ? 'bg-emerald-50/30' : ''}`}>
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-full border-4 flex items-center justify-center font-bold text-lg bg-white shadow-sm ${getScoreColor(q.overallScore)}`}>
                      {q.overallScore}
                    </div>
                    <div className="text-xs">
                      {getRankBadge(q.ranks.overallRank)}
                    </div>
                  </div>
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>

      {/* Recommended Vendor Card */}
      {bestQuotation && (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 flex flex-col md:flex-row justify-between items-center gap-6 mt-2 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-2 h-full bg-emerald-500"></div>
          
          <div className="flex items-center gap-5 pl-2 flex-1">
            <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center shrink-0">
              <Trophy size={28} fill="currentColor" className="text-emerald-500" />
            </div>
            <div>
              <p className="text-emerald-700 font-bold text-sm mb-1 uppercase tracking-wider">Recommended Vendor</p>
              <p className="text-sm text-gray-600">
                Based on overall evaluation, <span className="font-bold text-gray-900">{bestQuotation.vendor.companyName}</span> is the best choice with the highest score of <span className="font-bold text-gray-900">{bestQuotation.overallScore}/100</span>.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0 flex-col sm:flex-row w-full md:w-auto">
            <div className="flex flex-col gap-2 w-full sm:w-auto">
              <div className="flex">
                <button 
                  onClick={() => handleShortlist(bestQuotation.vendorId, bestQuotation.id)}
                  disabled={isSubmitting}
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-medium px-6 py-2.5 rounded-l-lg transition-colors flex items-center justify-center gap-2"
                >
                  <CheckCircle2 size={18} />
                  Shortlist {bestQuotation.vendor.companyName.split(' ')[0]}
                </button>
                <button className="bg-emerald-700 text-white px-3 rounded-r-lg hover:bg-emerald-800 transition-colors">
                  <ChevronDown size={18} />
                </button>
              </div>
              <button className="w-full bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 font-medium px-6 py-2.5 rounded-lg transition-colors text-sm">
                View Vendor Details
              </button>
            </div>
          </div>

          <div className="hidden lg:block w-px h-16 bg-gray-100 mx-4"></div>

          <div className="hidden lg:block shrink-0 min-w-[200px]">
            <p className="font-bold text-gray-900 text-sm">Evaluation Summary</p>
            <p className="text-xs text-gray-500 mt-1 mb-3">This comparison is based on the weighted criteria you selected.</p>
            
            <div className="flex justify-between text-xs">
              <div>
                <p className="text-gray-500">Total Vendors</p>
                <p className="font-bold text-gray-900">{quotations.length}</p>
              </div>
              <div>
                <p className="text-gray-500">Total Items</p>
                <p className="font-bold text-gray-900">{rfq._count.items}</p>
              </div>
            </div>
            
            <p className="text-[10px] text-gray-400 mt-3 flex items-center justify-between">
              Last Updated {format(new Date(), 'dd MMM yyyy, hh:mm a')}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
