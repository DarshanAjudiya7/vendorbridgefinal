import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    // Try to find by id first, if not, try by poNumber
    let purchaseOrder = await prisma.purchaseOrder.findUnique({
      where: { id },
      include: {
        vendor: true,
        quotation: {
          include: {
            items: true,
          }
        },
        rfq: true,
        invoice: true,
      }
    });

    if (!purchaseOrder) {
      purchaseOrder = await prisma.purchaseOrder.findUnique({
        where: { poNumber: id },
        include: {
          vendor: true,
          quotation: {
            include: {
              items: true,
            }
          },
          rfq: true,
          invoice: true,
        }
      });
    }

    if (!purchaseOrder) {
      return NextResponse.json({ message: "Purchase Order not found" }, { status: 404 });
    }

    // Security check: restrict to vendor who owns it or internal staff
    const userRole = (session.user as any).role;
    if (userRole === "VENDOR") {
      const vendorUser = await prisma.vendor.findUnique({
        where: { userId: (session.user as any).id }
      });
      if (vendorUser?.id !== purchaseOrder.vendorId) {
         return NextResponse.json({ message: "Forbidden" }, { status: 403 });
      }
    }

    return NextResponse.json(purchaseOrder);
  } catch (error: any) {
    console.error("Fetch purchase order error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
