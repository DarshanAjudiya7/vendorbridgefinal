import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import QuotationComparisonClient from '@/components/quotations/QuotationComparisonClient';
import { RFQ, RFQItem, Quotation, QuotationItem, Vendor } from '@prisma/client';

export const revalidate = 0;

type QuotationWithDetails = Quotation & {
  vendor: Vendor;
  items: QuotationItem[];
};

export default async function CompareQuotationsPage({ params }: { params: Promise<{ rfqId: string }> }) {
  const { rfqId } = await params;
  const session = await getServerSession(authOptions);
  
  if (!session || ((session.user as any).role !== 'PROCUREMENT_OFFICER' && (session.user as any).role !== 'ADMIN')) {
    redirect('/dashboard');
  }

  const rfq = await prisma.rFQ.findUnique({
    where: { id: rfqId },
    include: {
      items: true,
      _count: {
        select: { items: true }
      }
    }
  });

  if (!rfq) {
    redirect('/dashboard/comparison');
  }

  const quotations = await prisma.quotation.findMany({
    where: {
      rfqId,
      status: {
        in: ['SUBMITTED', 'SHORTLISTED', 'ACCEPTED']
      }
    },
    include: {
      vendor: true,
      items: true
    }
  });

  return (
    <QuotationComparisonClient 
      rfq={rfq} 
      quotations={quotations} 
    />
  );
}
