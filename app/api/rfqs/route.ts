import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const role = (session.user as any).role;
    if (role !== "PROCUREMENT_OFFICER") {
      return NextResponse.json({ message: "Forbidden: Only Procurement Officers can create RFQs" }, { status: 403 });
    }

    const userId = (session.user as any).id;

    const body = await req.json();
    const { title, description, deadline, currency, deliveryLocation, status, items, vendorIds, attachments } = body;

    if (!title || !deadline) {
      return NextResponse.json({ message: "Missing required fields" }, { status: 400 });
    }

    // Generate a unique RFQ number
    const rfqCount = await prisma.rFQ.count();
    const currentYear = new Date().getFullYear();
    const rfqNumber = `RFQ-${currentYear}-${String(rfqCount + 1).padStart(4, '0')}`;

    // Validate items
    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ message: "At least one item is required" }, { status: 400 });
    }

    // Use a Prisma transaction to ensure all related data is created safely
    const newRfq = await prisma.$transaction(async (tx) => {
      
      const rfq = await tx.rFQ.create({
        data: {
          rfqNumber,
          title,
          description: description || '',
          deadline: new Date(deadline),
          currency: currency || 'INR',
          deliveryLocation: deliveryLocation || null,
          status: status || 'DRAFT',
          createdById: userId,
          // Create nested items
          items: {
            create: items.map((item: any) => ({
              itemName: item.name,
              description: item.description,
              quantity: parseInt(item.quantity, 10),
              unit: item.unit,
              estimatedCost: parseFloat(item.price) || null,
            }))
          },
          // Create vendor links
          vendors: {
            create: (vendorIds || []).map((vendorId: string) => ({
              vendorId
            }))
          },
          // Create attachments
          attachments: {
            create: (attachments || []).map((a: any) => ({
              fileName: a.name,
              fileUrl: a.url
            }))
          }
        }
      });

      // If published, notify assigned vendors
      if (status === 'PUBLISHED' && vendorIds && vendorIds.length > 0) {
        // Find vendors to get their user IDs
        const vendorsWithUsers = await tx.vendor.findMany({
          where: {
            id: { in: vendorIds },
            userId: { not: null }
          }
        });

        const notificationsToCreate = vendorsWithUsers.map(v => ({
          userId: v.userId as string,
          title: 'New RFQ Assigned',
          message: `You have been assigned to ${rfqNumber}: ${title}. Please review and submit your quotation before the deadline.`,
          type: 'RFQ' as const,
        }));

        if (notificationsToCreate.length > 0) {
          await tx.notification.createMany({
            data: notificationsToCreate
          });
        }
      }

      return rfq;
    });

    return NextResponse.json({ message: "RFQ created successfully", rfq: newRfq }, { status: 201 });

  } catch (error: any) {
    console.error("RFQ Creation Error:", error);
    return NextResponse.json({ message: "An error occurred while saving the RFQ", error: error.message }, { status: 500 });
  }
}
