import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const role = (session.user as any).role;
    if (role !== "PROCUREMENT_OFFICER") {
      return NextResponse.json({ message: "Forbidden: Only Procurement Officers can edit RFQs" }, { status: 403 });
    }

    const { id } = await params;
    
    // Check if RFQ exists and is DRAFT
    const existingRfq = await prisma.rFQ.findUnique({
      where: { id }
    });

    if (!existingRfq) {
      return NextResponse.json({ message: "RFQ not found" }, { status: 404 });
    }

    if (existingRfq.status !== "DRAFT") {
      return NextResponse.json({ message: "Only DRAFT RFQs can be edited" }, { status: 400 });
    }

    // Must be owner or admin
    if (existingRfq.createdById !== (session.user as any).id && (session.user as any).role !== "ADMIN") {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const { title, description, deadline, currency, deliveryLocation, status, items, vendorIds, attachments } = body;

    // We will do a transaction to safely delete old items/vendors and create new ones
    const updatedRfq = await prisma.$transaction(async (tx) => {
      // 1. Delete existing items
      await tx.rFQItem.deleteMany({
        where: { rfqId: id }
      });

      // 2. Delete existing vendors
      await tx.rFQVendor.deleteMany({
        where: { rfqId: id }
      });

      // 3. Delete existing attachments
      await tx.attachment.deleteMany({
        where: { rfqId: id }
      });

      // 4. Update RFQ and create new items/vendors/attachments
      const rfq = await tx.rFQ.update({
        where: { id },
        data: {
          title,
          description,
          deadline: new Date(deadline),
          currency,
          deliveryLocation,
          status,
          items: {
            create: items.map((item: any) => ({
              itemName: item.name,
              description: item.description,
              unit: item.unit,
              quantity: item.quantity,
              estimatedCost: item.price
            }))
          },
          vendors: {
            create: vendorIds.map((vId: string) => ({
              vendorId: vId
            }))
          },
          attachments: {
            create: (attachments || []).map((a: any) => ({
              fileName: a.name,
              fileUrl: a.url
            }))
          }
        }
      });

      // If status changed to PUBLISHED, notify assigned vendors
      if (status === 'PUBLISHED' && vendorIds && vendorIds.length > 0) {
        const vendorsWithUsers = await tx.vendor.findMany({
          where: {
            id: { in: vendorIds },
            userId: { not: null }
          }
        });

        const notificationsToCreate = vendorsWithUsers.map(v => ({
          userId: v.userId as string,
          title: 'New RFQ Assigned',
          message: `You have been assigned to ${rfq.rfqNumber}: ${title}. Please review and submit your quotation before the deadline.`,
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

    return NextResponse.json({ rfq: updatedRfq }, { status: 200 });
  } catch (error: any) {
    console.error("Update RFQ error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
