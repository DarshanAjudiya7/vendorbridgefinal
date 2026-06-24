import { ArrowRight, FileText, CheckCircle, FilePlus, Receipt } from 'lucide-react';
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export type ActivityProps = {
  id: string;
  title: string;
  description: string;
  time: string;
  iconName: 'FilePlus' | 'FileText' | 'CheckCircle' | 'Receipt';
  color: string;
  bgColor: string;
};

const iconMap = {
  FilePlus,
  FileText,
  CheckCircle,
  Receipt,
};

export default function RecentActivitiesTimeline({ activities }: { activities: ActivityProps[] }) {
  return (
    <div className="flex h-full flex-col rounded-xl border border-gray-100 bg-white shadow-sm">
      <div className="border-b border-gray-100 p-5">
        <h3 className="text-base font-semibold text-gray-900">Recent Activities</h3>
      </div>
      <div className="flex-1 p-5">
        <div className="flow-root">
          <ul role="list" className="-mb-8">
            {activities.map((activity, activityIdx) => {
              const Icon = iconMap[activity.iconName] || FileText;
              return (
                <li key={activity.id}>
                  <div className="relative pb-8">
                    {activityIdx !== activities.length - 1 ? (
                      <span className="absolute left-4 top-4 -ml-px h-full w-0.5 bg-gray-100" aria-hidden="true" />
                    ) : null}
                    <div className="relative flex space-x-3">
                      <div>
                        <span className={cn("flex h-8 w-8 items-center justify-center rounded-full ring-4 ring-white", activity.bgColor)}>
                          <Icon className={cn("h-4 w-4", activity.color)} aria-hidden="true" />
                        </span>
                      </div>
                      <div className="flex min-w-0 flex-1 justify-between space-x-4 pt-1.5">
                        <div>
                          <p className="text-sm font-medium text-gray-900">{activity.title}</p>
                          <p className="text-xs text-gray-500">{activity.description}</p>
                        </div>
                        <div className="whitespace-nowrap text-right text-xs text-gray-400">
                          {activity.time}
                        </div>
                      </div>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
      <div className="border-t border-gray-100 p-4">
        <button className="flex w-full items-center justify-center gap-1 text-sm font-medium text-blue-600 hover:text-blue-700">
          View all activities <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
