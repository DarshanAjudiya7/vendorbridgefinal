import { prisma } from '@/lib/prisma';
import MyRFQsClient from '@/components/rfqs/MyRFQsClient';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';

export const revalidate = 0; // dynamic

export default async function MyRFQsPage() {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    redirect('/login');
  }

  const rfqs = await prisma.rFQ.findMany({
    where: { createdById: (session.user as any).id },
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
      userRole={(session.user as any).role}
    />
  );
}
