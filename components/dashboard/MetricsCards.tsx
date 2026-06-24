import { FileText, CheckCircle, PackageOpen, FileText as FileInvoice, IndianRupee, ArrowUp } from 'lucide-react';
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function MetricsCards({ data }: { data: { totalRFQs: number; pendingApprovals: number; activePOs: number; totalInvoices: number; totalSpend: number; } }) {
  const metrics = [
    {
      title: 'Total RFQs',
      value: data.totalRFQs.toString(),
      change: '12%',
      trend: 'up',
      icon: FileText,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      title: 'Pending Approvals',
      value: data.pendingApprovals.toString(),
      change: '5%',
      trend: 'up',
      icon: CheckCircle,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50',
    },
    {
      title: 'Active POs',
      value: data.activePOs.toString(),
      change: '8%',
      trend: 'up',
      icon: PackageOpen,
      color: 'text-orange-500',
      bgColor: 'bg-orange-50',
    },
    {
      title: 'Total Invoices',
      value: data.totalInvoices.toString(),
      change: '18%',
      trend: 'up',
      icon: FileInvoice,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
    {
      title: 'Total Spend',
      value: new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(data.totalSpend),
      change: '22%',
      trend: 'up',
      icon: IndianRupee,
      color: 'text-rose-500',
      bgColor: 'bg-rose-50',
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
      {metrics.map((metric) => {
        const Icon = metric.icon;
        return (
          <div
            key={metric.title}
            className="flex items-center gap-4 rounded-xl border border-gray-100 bg-white p-5 shadow-sm"
          >
            <div className={cn("flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl", metric.bgColor)}>
              <Icon className={cn("h-6 w-6", metric.color)} aria-hidden="true" />
            </div>
            <div>
              <p className="text-xs font-medium text-gray-500">{metric.title}</p>
              <div className="mt-1 flex items-baseline gap-2">
                <p className="text-xl font-semibold text-gray-900">{metric.value}</p>
              </div>
              <div className="mt-1 flex items-center text-xs font-medium text-emerald-600">
                <ArrowUp className="mr-0.5 h-3 w-3 flex-shrink-0" aria-hidden="true" />
                {metric.change}
                <span className="ml-1 font-normal text-gray-400">from last month</span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
