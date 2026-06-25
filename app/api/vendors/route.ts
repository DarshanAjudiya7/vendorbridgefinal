import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    if ((session.user as any).role !== "ADMIN") {
      return NextResponse.json({ message: "Forbidden: Only Admins can add vendors" }, { status: 403 });
    }

    const body = await req.json();
    const { companyName, category, gstNumber, contactPerson, email, phone, address } = body;

    // Basic validation
    if (!companyName || !category || !contactPerson || !email || !phone) {
      return NextResponse.json({ message: "Missing required fields" }, { status: 400 });
    }

    // Check if vendor already exists by email
    const existingVendor = await prisma.vendor.findUnique({
      where: { email }
    });

    if (existingVendor) {
      return NextResponse.json({ message: "Vendor with this email already exists" }, { status: 400 });
    }

    // Create the vendor. Since an ADMIN is creating it, default to ACTIVE
    const newVendor = await prisma.vendor.create({
      data: {
        companyName,
        category,
        gstNumber: gstNumber || null,
        contactPerson,
        email,
        phone,
        address: address || null,
        status: "ACTIVE"
      }
    });

    return NextResponse.json({ vendor: newVendor }, { status: 201 });
  } catch (error: any) {
    console.error("Create vendor error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
