"use client";

import { ArrowUp } from 'lucide-react';
import { LineChart, Line, ResponsiveContainer } from 'recharts';

const generateSparkline = () => [
  { value: 10 }, { value: 25 }, { value: 15 }, { value: 30 }, { value: 20 }, { value: 40 }, { value: 35 }
];

const summaries = [
  { title: 'This Month', amount: '₹2,45,000', change: '15%', data: generateSparkline() },
  { title: 'This Quarter', amount: '₹7,80,000', change: '18%', data: generateSparkline() },
  { title: 'This Year', amount: '₹18,75,000', change: '22%', data: generateSparkline() },
  { title: 'Last Year', amount: '₹15,40,000', change: '10%', data: generateSparkline() },
];

export default function SpendSummary() {
  return (
    <div className="flex h-full flex-col rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
      <h3 className="mb-4 text-base font-semibold text-gray-900">Procurement Spend Summary</h3>
      <div className="flex-1 grid grid-cols-2 lg:grid-cols-4 gap-6">
        {summaries.map((item) => (
          <div key={item.title} className="flex flex-col">
            <span className="text-xs font-medium text-gray-500">{item.title}</span>
            <span className="mt-1 text-lg font-bold text-gray-900">{item.amount}</span>
            <div className="mt-1 flex items-center gap-1 text-xs font-medium text-emerald-600">
              <ArrowUp className="h-3 w-3" />
              {item.change}
            </div>
            <div className="mt-4 h-10 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={item.data}>
                  <Line 
                    type="monotone" 
                    dataKey="value" 
                    stroke="#3b82f6" 
                    strokeWidth={2} 
                    dot={false} 
                    isAnimationActive={false} 
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
