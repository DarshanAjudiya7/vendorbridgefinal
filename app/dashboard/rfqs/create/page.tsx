import { prisma } from '@/lib/prisma';
import CreateRFQClient from '@/components/rfqs/CreateRFQClient';

export const revalidate = 0; // dynamic

export default async function CreateRFQPage() {
  const vendors = await prisma.vendor.findMany({
    where: { status: 'ACTIVE' },
    select: { id: true, companyName: true, email: true },
    orderBy: { companyName: 'asc' }
  });

  return (
    <CreateRFQClient activeVendors={vendors} />
  );
}
