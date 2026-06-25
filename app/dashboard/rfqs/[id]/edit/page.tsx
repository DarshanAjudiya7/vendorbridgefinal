import { prisma } from '@/lib/prisma';
import CreateRFQClient from '@/components/rfqs/CreateRFQClient';
import { notFound } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export const revalidate = 0; // dynamic

export default async function EditRFQPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session) return notFound();

  const { id } = await params;

  const rfq = await prisma.rFQ.findUnique({
    where: { id: id },
    include: {
      items: true,
      vendors: {
        include: {
          vendor: {
            select: { id: true, companyName: true, email: true }
          }
        }
      }
    }
  });

  if (!rfq) return notFound();

  // Ensure it's DRAFT and the user owns it (or is ADMIN)
  if (rfq.status !== 'DRAFT') {
    return (
      <div className="p-8 text-center text-gray-500">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h1>
        <p>Only DRAFT RFQs can be edited.</p>
      </div>
    );
  }

  if (rfq.createdById !== (session.user as any).id && (session.user as any).role !== 'ADMIN') {
     return (
      <div className="p-8 text-center text-gray-500">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h1>
        <p>You do not have permission to edit this RFQ.</p>
      </div>
    );
  }

  const vendors = await prisma.vendor.findMany({
    where: { status: 'ACTIVE' },
    select: { id: true, companyName: true, email: true },
    orderBy: { companyName: 'asc' }
  });

  const serializedRfq = JSON.parse(JSON.stringify(rfq));

  return (
    <CreateRFQClient activeVendors={vendors} initialData={serializedRfq} />
  );
}
