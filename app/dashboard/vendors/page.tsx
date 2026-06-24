import { prisma } from '@/lib/prisma';
import VendorManagementClient from '@/components/vendors/VendorManagementClient';

export const revalidate = 0; // dynamic

export default async function VendorsPage() {
  const vendors = await prisma.vendor.findMany({
    orderBy: { createdAt: 'desc' },
  });

  const totalVendors = vendors.length;
  const activeVendors = vendors.filter(v => v.status === 'ACTIVE').length;
  const pendingVendors = vendors.filter(v => v.status === 'PENDING').length;
  const inactiveVendors = vendors.filter(v => v.status === 'INACTIVE').length;

  const metrics = {
    total: totalVendors,
    active: activeVendors,
    pending: pendingVendors,
    inactive: inactiveVendors,
    // Add dummy trend data to match design
    totalTrend: { value: 12, isPositive: true },
    activeTrend: { value: 8, isPositive: true },
    pendingTrend: { value: 3, isPositive: false },
    inactiveTrend: { value: 1, isPositive: true },
  };

  return (
    <VendorManagementClient initialVendors={vendors} metrics={metrics} />
  );
}
