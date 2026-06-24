"use client";

import { ChevronDown } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

export type OverviewDataProps = {
  name: string;
  rfqs: number;
  pos: number;
  invoices: number;
};

export default function ProcurementOverviewChart({ data }: { data: OverviewDataProps[] }) {
  return (
    <div className="flex h-full flex-col rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-semibold text-gray-900">Procurement Overview</h3>
        <button className="flex items-center gap-1 rounded-md border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50">
          This Year <ChevronDown className="h-3 w-3" />
        </button>
      </div>
      <div className="flex-1 min-h-[250px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis 
              dataKey="name" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fontSize: 12, fill: '#64748b' }} 
              dy={10}
            />
            <YAxis 
              axisLine={false} 
              tickLine={false} 
              tick={{ fontSize: 12, fill: '#64748b' }} 
            />
            <Tooltip 
              contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
            />
            <Legend 
              verticalAlign="top" 
              align="center"
              iconType="circle"
              wrapperStyle={{ fontSize: '12px', paddingBottom: '20px' }}
            />
            <Line 
              type="monotone" 
              name="RFQs"
              dataKey="rfqs" 
              stroke="#3b82f6" 
              strokeWidth={2} 
              dot={{ r: 3, strokeWidth: 2 }} 
              activeDot={{ r: 5 }} 
            />
            <Line 
              type="monotone" 
              name="POs"
              dataKey="pos" 
              stroke="#22c55e" 
              strokeWidth={2} 
              dot={{ r: 3, strokeWidth: 2 }} 
              activeDot={{ r: 5 }} 
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
