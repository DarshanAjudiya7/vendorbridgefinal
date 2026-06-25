import { prisma } from '@/lib/prisma';
import MyRFQsClient from '@/components/rfqs/MyRFQsClient';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';

export const revalidate = 0; // dynamic

export default async function RFQsPage() {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    redirect('/login');
  }

  // Fetch all RFQs (or filter by role if needed. For now, fetch all for 'All RFQs' page)
  const rfqs = await prisma.rFQ.findMany({
    include: {
      _count: {
        select: { items: true, vendors: true, quotations: true }
      }
    },
    orderBy: { createdAt: 'desc' }
  });

  return (
    <MyRFQsClient 
      initialRfqs={rfqs} 
      title="All RFQs" 
      description="View and manage all RFQs in the system."
      userRole={(session.user as any).role}
    />
  );
}
