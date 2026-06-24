import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { ArrowRight, Target, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';

export const revalidate = 0;

export default async function ComparisonIndexPage() {
  const session = await getServerSession(authOptions);
  
  if (!session || (session.user as any).role !== 'PROCUREMENT_OFFICER' && (session.user as any).role !== 'ADMIN') {
    redirect('/dashboard');
  }

  // Fetch RFQs that have at least one quotation
  const rfqs = await prisma.rFQ.findMany({
    where: {
      quotations: {
        some: {
          status: {
            in: ['SUBMITTED', 'SHORTLISTED', 'ACCEPTED', 'REJECTED']
          }
        }
      }
    },
    include: {
      _count: {
        select: { quotations: true }
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
          <h1 className="text-2xl font-bold text-gray-900">Quotation Comparison</h1>
          <p className="text-sm text-gray-500 mt-1">Select an RFQ to compare vendor quotations side-by-side.</p>
        </div>
      </div>

      {rfqs.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-100 p-12 text-center flex flex-col items-center justify-center">
          <div className="bg-gray-50 text-gray-400 p-4 rounded-full mb-4">
            <Target size={32} />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Quotations Available</h3>
          <p className="text-gray-500 max-w-md mx-auto">
            There are currently no RFQs with submitted quotations to compare. Once vendors submit quotations, they will appear here.
          </p>
          <Link href="/dashboard/rfqs" className="mt-6 inline-flex items-center text-sm font-medium text-emerald-600 hover:text-emerald-700">
            View RFQs <ArrowRight size={16} className="ml-1" />
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {rfqs.map((rfq) => (
            <Link key={rfq.id} href={`/dashboard/quotations/${rfq.id}/compare`}>
              <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 hover:shadow-md transition-shadow hover:border-emerald-200 group h-full flex flex-col">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-semibold text-gray-900 line-clamp-1 group-hover:text-emerald-600 transition-colors">
                      {rfq.title}
                    </h3>
                    <p className="text-xs text-gray-500 mt-1">{rfq.rfqNumber}</p>
                  </div>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 whitespace-nowrap">
                    {rfq._count.quotations} Quotes
                  </span>
                </div>
                
                <div className="flex-1"></div>
                
                <div className="border-t border-gray-50 pt-4 mt-4 flex items-center justify-between">
                  <span className="text-xs text-gray-500">
                    Created {format(new Date(rfq.createdAt), 'MMM dd, yyyy')}
                  </span>
                  <span className="flex items-center text-sm font-medium text-emerald-600 group-hover:translate-x-1 transition-transform">
                    Compare <ArrowRight size={16} className="ml-1" />
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
