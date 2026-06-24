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
    if (!session || (session.user as any).role !== "PROCUREMENT_OFFICER" && (session.user as any).role !== "ADMIN") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    // Find the quotation
    const quotation = await prisma.quotation.findUnique({
      where: { id },
      include: { rfq: true },
    });

    if (!quotation) {
      return NextResponse.json({ message: "Quotation not found" }, { status: 404 });
    }

    // Update quotation status to SHORTLISTED
    await prisma.quotation.update({
      where: { id },
      data: { status: "SHORTLISTED" },
    });

    // Optionally update the RFQ status to UNDER_REVIEW or similar if needed
    if (quotation.rfq.status === "PUBLISHED" || quotation.rfq.status === "DRAFT") {
      await prisma.rFQ.update({
        where: { id: quotation.rfqId },
        data: { status: "UNDER_REVIEW" },
      });
    }

    // Create an activity log
    await prisma.activityLog.create({
      data: {
        userId: (session.user as any).id,
        action: "SHORTLISTED_QUOTATION",
        entityType: "QUOTATION",
        entityId: id,
        description: `Shortlisted quotation ${quotation.quotationNumber}`,
      },
    });

    return NextResponse.json({ message: "Quotation shortlisted successfully" });
  } catch (error: any) {
    console.error("Shortlist error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
