import { ArrowRight } from 'lucide-react';
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export type ApprovalProps = {
  id: string;
  description: string;
  type: string;
  typeColor: string;
  requestedBy: string;
  time: string;
  barColor: string;
};

export default function PendingApprovalsList({ approvals }: { approvals: ApprovalProps[] }) {
  return (
    <div className="flex h-full flex-col rounded-xl border border-gray-100 bg-white shadow-sm">
      <div className="border-b border-gray-100 p-5">
        <h3 className="text-base font-semibold text-gray-900">Pending Approvals</h3>
      </div>
      <div className="flex-1 p-5 space-y-4">
        {approvals.map((item) => (
          <div key={item.id} className="relative flex items-center justify-between pl-4">
            <div className={cn("absolute left-0 top-0 bottom-0 w-1 rounded-full", item.barColor)} />
            <div className="flex flex-col">
              <span className="text-sm font-semibold text-gray-900">{item.id}</span>
              <span className="text-xs text-gray-500">{item.description}</span>
            </div>
            
            <div className="flex items-center gap-4">
              <span className={cn("inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium", item.typeColor)}>
                {item.type}
              </span>
              <div className="flex flex-col text-right">
                <span className="text-xs text-gray-400">Requested by</span>
                <span className="text-xs font-medium text-gray-900">{item.requestedBy}</span>
              </div>
              <span className="text-xs text-gray-400 w-10 text-right">{item.time}</span>
            </div>
          </div>
        ))}
      </div>
      <div className="border-t border-gray-100 p-4">
        <button className="flex w-full items-center justify-center gap-1 text-sm font-medium text-blue-600 hover:text-blue-700">
          View all approvals <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
