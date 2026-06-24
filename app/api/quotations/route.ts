import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const userId = (session.user as any).id;
    const body = await req.json();
    const { rfqId, items, deliveryDate, deliveryLocation, paymentTerms, warranty, validUntil, notes, status } = body;

    if (!rfqId || !items?.length) {
      return NextResponse.json({ message: 'Missing required fields: rfqId and items' }, { status: 400 });
    }

    // Lookup vendor profile for this user
    const vendor = await prisma.vendor.findUnique({ where: { userId } });
    if (!vendor) {
      return NextResponse.json({ message: 'No vendor profile found for this user' }, { status: 403 });
    }

    // Check: vendor must be assigned to this RFQ
    const assignment = await prisma.rFQVendor.findUnique({
      where: { rfqId_vendorId: { rfqId, vendorId: vendor.id } }
    });
    if (!assignment) {
      return NextResponse.json({ message: 'You are not assigned to this RFQ' }, { status: 403 });
    }

    // Duplicate prevention: one quotation per vendor per RFQ
    const existing = await prisma.quotation.findUnique({
      where: { rfqId_vendorId: { rfqId, vendorId: vendor.id } }
    });
    if (existing && existing.status === 'SUBMITTED') {
      return NextResponse.json({ message: 'You have already submitted a quotation for this RFQ.' }, { status: 409 });
    }

    // Calculate totals
    const subTotal = items.reduce((acc: number, item: any) => acc + (Number(item.unitPrice) * Number(item.quantity)), 0);
    const cgstPercent = 9;
    const sgstPercent = 9;
    const cgst = subTotal * (cgstPercent / 100);
    const sgst = subTotal * (sgstPercent / 100);
    const totalAmount = subTotal + cgst + sgst;

    // Unique quotation number
    const count = await prisma.quotation.count();
    const year = new Date().getFullYear();
    const quotationNumber = `QT-${year}-${String(count + 1).padStart(4, '0')}`;

    // Estimate delivery days from deliveryDate
    const deliveryDays = deliveryDate
      ? Math.max(1, Math.ceil((new Date(deliveryDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
      : 30;

    const upsertData = {
      quotationNumber: existing?.quotationNumber || quotationNumber,
      rfqId,
      vendorId: vendor.id,
      totalAmount,
      deliveryDays,
      deliveryDate: deliveryDate ? new Date(deliveryDate) : null,
      deliveryLocation: deliveryLocation || null,
      paymentTerms: paymentTerms || null,
      warranty: warranty || null,
      validUntil: validUntil ? new Date(validUntil) : null,
      notes: notes || null,
      status: status || 'SUBMITTED',
    };

    let quotation;
    if (existing) {
      // Update (edit) existing quotation
      quotation = await prisma.$transaction(async (tx) => {
        await tx.quotationItem.deleteMany({ where: { quotationId: existing.id } });
        return tx.quotation.update({
          where: { id: existing.id },
          data: {
            ...upsertData,
            items: {
              create: items.map((item: any) => ({
                itemName: item.itemName,
                quantity: Number(item.quantity),
                unitPrice: Number(item.unitPrice),
                totalPrice: Number(item.unitPrice) * Number(item.quantity),
              }))
            }
          }
        });
      });
    } else {
      quotation = await prisma.quotation.create({
        data: {
          ...upsertData,
          items: {
            create: items.map((item: any) => ({
              itemName: item.itemName,
              quantity: Number(item.quantity),
              unitPrice: Number(item.unitPrice),
              totalPrice: Number(item.unitPrice) * Number(item.quantity),
            }))
          }
        }
      });
    }

    // Log activity
    await prisma.activityLog.create({
      data: {
        userId,
        action: status === 'DRAFT' ? 'Quotation saved as draft' : 'Quotation submitted',
        description: `${vendor.companyName} submitted quotation ${quotation.quotationNumber} for RFQ ${rfqId}`,
        entityType: 'QUOTATION',
        entityId: quotation.id,
      }
    });

    return NextResponse.json({ message: 'Quotation saved successfully', quotation }, { status: 201 });

  } catch (error: any) {
    console.error('Quotation submission error:', error);
    if (error.code === 'P2002') {
      return NextResponse.json({ message: 'A quotation already exists for this RFQ and vendor.' }, { status: 409 });
    }
    return NextResponse.json({ message: 'Internal server error', error: error.message }, { status: 500 });
  }
}
