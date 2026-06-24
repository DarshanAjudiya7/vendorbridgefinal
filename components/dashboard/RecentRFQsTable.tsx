import { ArrowRight } from 'lucide-react';
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export type RFQProps = {
  id: string;
  title: string;
  deadline: string;
  status: string;
};

export default function RecentRFQsTable({ rfqs }: { rfqs: RFQProps[] }) {
  return (
    <div className="flex h-full flex-col rounded-xl border border-gray-100 bg-white shadow-sm">
      <div className="border-b border-gray-100 p-5">
        <h3 className="text-base font-semibold text-gray-900">Recent RFQs</h3>
      </div>
      <div className="flex-1 px-5 py-3 overflow-x-auto">
        <table className="w-full text-left text-xs min-w-[500px]">
          <thead>
            <tr className="border-b border-gray-100 text-gray-400">
              <th className="pb-3 font-medium">RFQ ID</th>
              <th className="pb-3 font-medium">Title</th>
              <th className="pb-3 font-medium">Deadline</th>
              <th className="pb-3 font-medium">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {rfqs.map((rfq) => (
              <tr key={rfq.id}>
                <td className="py-3 font-medium text-gray-900">{rfq.id}</td>
                <td className="py-3 text-gray-500">{rfq.title}</td>
                <td className="py-3 text-gray-500">{rfq.deadline}</td>
                <td className="py-3">
                  <span
                    className={cn(
                      "inline-flex rounded-md px-2 py-0.5 text-xs font-medium border",
                      rfq.status === 'Open'
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
                        : 'bg-gray-50 text-gray-600 border-gray-200'
                    )}
                  >
                    {rfq.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="border-t border-gray-100 p-4">
        <button className="flex w-full items-center justify-center gap-1 text-sm font-medium text-blue-600 hover:text-blue-700">
          View all RFQs <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
