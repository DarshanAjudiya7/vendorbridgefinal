import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();
    const { action, remarks } = body;

    if (!action || !['APPROVE', 'REJECT', 'MORE_INFO'].includes(action)) {
      return NextResponse.json({ message: "Invalid action" }, { status: 400 });
    }

    // Find the approval
    const approval = await prisma.approval.findUnique({
      where: { id },
      include: { rfq: true },
    });

    if (!approval) {
      return NextResponse.json({ message: "Approval not found" }, { status: 404 });
    }

    if (approval.approverId !== (session.user as any).id && (session.user as any).role !== 'ADMIN') {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    if (approval.status !== 'PENDING') {
      return NextResponse.json({ message: "Approval already processed" }, { status: 400 });
    }

    const newStatus = action === 'APPROVE' ? 'APPROVED' : action === 'REJECT' ? 'REJECTED' : 'PENDING';

    // Update approval status
    await prisma.approval.update({
      where: { id },
      data: { 
        status: newStatus,
        remarks: remarks || null,
        actionAt: new Date()
      },
    });

    // Check if there are further pending approvals for this RFQ
    if (newStatus === 'APPROVED') {
      const pendingApprovals = await prisma.approval.count({
        where: { 
          rfqId: approval.rfqId,
          status: 'PENDING',
          level: { gt: approval.level }
        }
      });

      if (pendingApprovals === 0) {
        // This was the final approval, update RFQ to APPROVED
        await prisma.rFQ.update({
          where: { id: approval.rfqId },
          data: { status: 'APPROVED' }
        });
      }
    } else if (newStatus === 'REJECTED') {
       // If any approval is rejected, the RFQ is rejected
       await prisma.rFQ.update({
          where: { id: approval.rfqId },
          data: { status: 'REJECTED' }
        });
    }

    // Create an activity log
    await prisma.activityLog.create({
      data: {
        userId: (session.user as any).id,
        action: `PROCESSED_APPROVAL_${newStatus}`,
        entityType: "APPROVAL",
        entityId: id,
        description: `Approval Level ${approval.level} for RFQ ${approval.rfq.rfqNumber} was ${newStatus.toLowerCase()}`,
      },
    });

    return NextResponse.json({ message: "Approval processed successfully" });
  } catch (error: any) {
    console.error("Approval action error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
