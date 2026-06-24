import { ArrowRight } from 'lucide-react';
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export type POProps = {
  id: string;
  vendor: string;
  amount: string;
  status: string;
};

export default function RecentPOsTable({ pos }: { pos: POProps[] }) {
  return (
    <div className="flex h-full flex-col rounded-xl border border-gray-100 bg-white shadow-sm">
      <div className="border-b border-gray-100 p-5">
        <h3 className="text-base font-semibold text-gray-900">Recent POs</h3>
      </div>
      <div className="flex-1 px-5 py-3 overflow-x-auto">
        <table className="w-full text-left text-xs min-w-[500px]">
          <thead>
            <tr className="border-b border-gray-100 text-gray-400">
              <th className="pb-3 font-medium">PO ID</th>
              <th className="pb-3 font-medium">Vendor</th>
              <th className="pb-3 font-medium">Amount</th>
              <th className="pb-3 font-medium">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {pos.map((po) => (
              <tr key={po.id}>
                <td className="py-3 font-medium text-gray-900">{po.id}</td>
                <td className="py-3 text-gray-500">{po.vendor}</td>
                <td className="py-3 font-medium text-gray-900">{po.amount}</td>
                <td className="py-3">
                  <span
                    className={cn(
                      "inline-flex rounded-md px-2 py-0.5 text-xs font-medium border",
                      po.status === 'Approved'
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
                        : 'bg-orange-50 text-orange-700 border-orange-100'
                    )}
                  >
                    {po.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="border-t border-gray-100 p-4">
        <button className="flex w-full items-center justify-center gap-1 text-sm font-medium text-blue-600 hover:text-blue-700">
          View all POs <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
