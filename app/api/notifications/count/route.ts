import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ count: 0 });
    }

    const count = await prisma.notification.count({
      where: {
        userId: (session.user as any).id,
        isRead: false
      }
    });

    return NextResponse.json({ count });
  } catch (error) {
    console.error("Notifications count error:", error);
    return NextResponse.json({ count: 0 });
  }
}
