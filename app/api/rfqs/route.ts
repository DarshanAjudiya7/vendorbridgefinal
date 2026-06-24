import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;

    const body = await req.json();
    const { title, description, deadline, currency, deliveryLocation, status, items, vendorIds } = body;

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
          }
        }
      });

      return rfq;
    });

    return NextResponse.json({ message: "RFQ created successfully", rfq: newRfq }, { status: 201 });

  } catch (error: any) {
    console.error("RFQ Creation Error:", error);
    return NextResponse.json({ message: "An error occurred while saving the RFQ", error: error.message }, { status: 500 });
  }
}
