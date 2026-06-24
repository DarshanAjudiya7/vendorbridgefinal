import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const userId = (session.user as any).id;
    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type");
    const status = searchParams.get("status");
    const search = searchParams.get("search");

    let whereClause: any = { userId };

    if (type && type !== "ALL") {
      whereClause.type = type;
    }

    if (status === "UNREAD") {
      whereClause.isRead = false;
    }

    if (search) {
      whereClause.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { message: { contains: search, mode: "insensitive" } },
      ];
    }

    const notifications = await prisma.notification.findMany({
      where: whereClause,
      orderBy: { createdAt: "desc" },
    });

    // Also get stats if this is a general fetch
    const stats = {
      total: await prisma.notification.count({ where: { userId } }),
      unread: await prisma.notification.count({ where: { userId, isRead: false } }),
      rfq: await prisma.notification.count({ where: { userId, type: "RFQ" } }),
      approval: await prisma.notification.count({ where: { userId, type: "APPROVAL" } }),
      invoice: await prisma.notification.count({ where: { userId, type: "INVOICE" } }),
      system: await prisma.notification.count({ where: { userId, type: "SYSTEM" } }),
      po: await prisma.notification.count({ where: { userId, type: "PURCHASE_ORDER" } }),
    };

    return NextResponse.json({ notifications, stats });
  } catch (error: any) {
    console.error("Fetch notifications error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const userId = (session.user as any).id;

    await prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true },
    });

    return NextResponse.json({ message: "All notifications marked as read" });
  } catch (error: any) {
    console.error("Mark notifications read error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
