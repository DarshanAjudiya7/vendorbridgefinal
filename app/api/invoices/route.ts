import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

function generateInvoiceNumber() {
  const min = 100000;
  const max = 999999;
  const num = Math.floor(Math.random() * (max - min + 1)) + min;
  return `INV-${new Date().getFullYear()}-${num}`;
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { 
      purchaseOrderId, 
      dueDate, 
      billingTo, 
      currency, 
      paymentTerms, 
      notes, 
      subTotal, 
      cgst, 
      sgst, 
      totalAmount 
    } = body;

    if (!purchaseOrderId || !subTotal || !totalAmount) {
      return NextResponse.json({ message: "Missing required fields" }, { status: 400 });
    }

    const purchaseOrder = await prisma.purchaseOrder.findUnique({
      where: { id: purchaseOrderId }
    });

    if (!purchaseOrder) {
      return NextResponse.json({ message: "Purchase Order not found" }, { status: 404 });
    }

    // Check if invoice already exists
    const existingInvoice = await prisma.invoice.findUnique({
      where: { purchaseOrderId }
    });

    if (existingInvoice) {
      return NextResponse.json({ message: "Invoice already generated for this Purchase Order" }, { status: 400 });
    }

    const invoiceNumber = generateInvoiceNumber();

    const invoice = await prisma.invoice.create({
      data: {
        invoiceNumber,
        purchaseOrderId,
        subTotal,
        cgst,
        sgst,
        totalAmount,
        status: "GENERATED",
        dueDate: dueDate ? new Date(dueDate) : null,
        billingTo,
        currency,
        paymentTerms,
        notes,
      }
    });

    // Create activity log
    await prisma.activityLog.create({
      data: {
        userId: (session.user as any).id,
        action: "GENERATED_INVOICE",
        entityType: "INVOICE",
        entityId: invoice.id,
        description: `Generated Invoice ${invoiceNumber} for Purchase Order ${purchaseOrder.poNumber}`,
      }
    });

    return NextResponse.json(invoice, { status: 201 });
  } catch (error: any) {
    console.error("Create invoice error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
