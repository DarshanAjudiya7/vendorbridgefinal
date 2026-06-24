import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { ArrowRight, CheckSquare, Clock } from 'lucide-react';
import { format } from 'date-fns';

export const revalidate = 0;

export default async function ApprovalsIndexPage() {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    redirect('/login');
  }

  // Admin/Manager/Procurement officer all can potentially approve things if assigned
  const approvals = await prisma.approval.findMany({
    where: {
      approverId: (session.user as any).id,
      status: 'PENDING'
    },
    include: {
      rfq: {
        include: {
          createdBy: true
        }
      }
    },
    orderBy: {
      createdAt: 'desc'
    }
  });

  return (
    <div className="flex flex-col gap-6 max-w-[1600px] mx-auto pb-12">
      <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Pending Approvals</h1>
          <p className="text-sm text-gray-500 mt-1">Review and take action on procurement requests assigned to you.</p>
        </div>
      </div>

      {approvals.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-100 p-12 text-center flex flex-col items-center justify-center">
          <div className="bg-gray-50 text-emerald-600 p-4 rounded-full mb-4">
            <CheckSquare size={32} />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">All Caught Up!</h3>
          <p className="text-gray-500 max-w-md mx-auto">
            You have no pending approval requests at the moment.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {approvals.map((approval) => (
            <Link key={approval.id} href={`/dashboard/approvals/${approval.id}`}>
              <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 hover:shadow-md transition-shadow hover:border-emerald-200 group h-full flex flex-col relative overflow-hidden">
                <div className="absolute top-0 left-0 w-1 h-full bg-amber-400"></div>
                <div className="flex justify-between items-start mb-4 pl-3">
                  <div>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-50 text-amber-700 whitespace-nowrap mb-2">
                      Level {approval.level} Approval
                    </span>
                    <h3 className="font-semibold text-gray-900 line-clamp-1 group-hover:text-emerald-600 transition-colors">
                      {approval.rfq.title}
                    </h3>
                    <p className="text-xs text-gray-500 mt-1">{approval.rfq.rfqNumber}</p>
                  </div>
                </div>
                
                <div className="pl-3 mt-2 flex items-center gap-2 text-sm text-gray-600">
                  <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-bold">
                    {approval.rfq.createdBy.name.charAt(0)}
                  </div>
                  Requested by {approval.rfq.createdBy.name}
                </div>
                
                <div className="flex-1"></div>
                
                <div className="border-t border-gray-50 pt-4 mt-4 ml-3 flex items-center justify-between">
                  <span className="text-xs text-gray-500 flex items-center gap-1">
                    <Clock size={12} />
                    {format(new Date(approval.createdAt), 'MMM dd, yyyy')}
                  </span>
                  <span className="flex items-center text-sm font-medium text-emerald-600 group-hover:translate-x-1 transition-transform">
                    Review <ArrowRight size={16} className="ml-1" />
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
