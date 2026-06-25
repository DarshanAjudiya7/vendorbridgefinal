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

    if ((session.user as any).role !== "ADMIN") {
      return NextResponse.json({ message: "Forbidden: Only Admins can edit vendors" }, { status: 403 });
    }

    const { id } = await params;
    
    const body = await req.json();
    const { companyName, category, gstNumber, contactPerson, email, phone, address } = body;

    const vendor = await prisma.vendor.findUnique({
      where: { id }
    });

    if (!vendor) {
      return NextResponse.json({ message: "Vendor not found" }, { status: 404 });
    }

    const updatedVendor = await prisma.vendor.update({
      where: { id },
      data: {
        companyName,
        category,
        gstNumber,
        contactPerson,
        email,
        phone,
        address
      }
    });

    return NextResponse.json({ vendor: updatedVendor }, { status: 200 });
  } catch (error: any) {
    console.error("Update vendor error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
