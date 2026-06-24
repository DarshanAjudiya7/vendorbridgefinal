import { notFound } from 'next/navigation';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import SubmitQuotationClient from '@/components/quotations/SubmitQuotationClient';

export const revalidate = 0;

export default async function SubmitQuotationPage({ searchParams }: { searchParams: Promise<{ rfqId?: string }> }) {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as any)?.id;
  const role = (session?.user as any)?.role;
  const resolvedParams = await searchParams;
  const rfqId = resolvedParams.rfqId;

  if (!rfqId) notFound();

  // Fetch RFQ details with items
  const rfq = await prisma.rFQ.findUnique({
    where: { id: rfqId },
    include: {
      items: true,
      createdBy: { select: { name: true, role: true } },
      attachments: true,
    }
  });

  if (!rfq) notFound();

  // Fetch vendor profile if user is a VENDOR
  let vendor = null;
  let existingQuotation = null;

  if (role === 'VENDOR') {
    vendor = await prisma.vendor.findUnique({
      where: { userId },
      select: { id: true, companyName: true }
    });

    if (vendor) {
      existingQuotation = await prisma.quotation.findUnique({
        where: { rfqId_vendorId: { rfqId, vendorId: vendor.id } },
        include: { items: true }
      });
    }
  }

  return (
    <SubmitQuotationClient
      rfq={{
        id: rfq.id,
        rfqNumber: rfq.rfqNumber,
        title: rfq.title,
        description: rfq.description,
        deadline: rfq.deadline.toISOString(),
        currency: rfq.currency,
        deliveryLocation: rfq.deliveryLocation || '',
        status: rfq.status,
        createdBy: rfq.createdBy,
        attachments: rfq.attachments.map(a => ({ id: a.id, fileName: a.fileName, fileUrl: a.fileUrl })),
        items: rfq.items.map(i => ({
          id: i.id,
          itemName: i.itemName,
          description: i.description || '',
          quantity: i.quantity,
          unit: i.unit,
        }))
      }}
      existingQuotation={existingQuotation ? {
        id: existingQuotation.id,
        status: existingQuotation.status,
        deliveryDate: existingQuotation.deliveryDate?.toISOString() || '',
        deliveryLocation: existingQuotation.deliveryLocation || '',
        paymentTerms: existingQuotation.paymentTerms || '',
        warranty: existingQuotation.warranty || '',
        validUntil: existingQuotation.validUntil?.toISOString() || '',
        notes: existingQuotation.notes || '',
        items: existingQuotation.items.map(i => ({
          itemName: i.itemName,
          quantity: i.quantity,
          unitPrice: Number(i.unitPrice),
        }))
      } : null}
      isVendor={role === 'VENDOR'}
    />
  );
}
