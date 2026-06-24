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

    // Top Stats
    const totalPOs = await prisma.purchaseOrder.count();
    const totalVendors = await prisma.vendor.count();

    const allPOs = await prisma.purchaseOrder.findMany({
      include: {
        vendor: true,
      }
    });

    const totalSpend = allPOs.reduce((acc, po) => acc + Number(po.totalAmount || 0), 0);
    const savingsAchieved = totalSpend * 0.08; // Mock savings for demo
    const cycleTime = 6.4; // Mock cycle time

    // Procurement Summary
    const totalRFQs = await prisma.rFQ.count();
    const poRFQs = await prisma.purchaseOrder.count(); // assuming 1 PO = 1 RFQ converted
    const totalQuotations = await prisma.quotation.count();
    const totalInvoices = await prisma.invoice.count();
    const paidInvoices = await prisma.invoice.count({ where: { status: "PAID" } });
    const pendingInvoices = await prisma.invoice.count({ where: { status: { not: "PAID" } } });

    // Category Spend (mocked distribution based on total spend)
    const categorySpend = [
      { name: "Office Supplies", value: totalSpend * 0.28 },
      { name: "IT Equipment", value: totalSpend * 0.22 },
      { name: "Electrical Goods", value: totalSpend * 0.17 },
      { name: "Services", value: totalSpend * 0.13 },
      { name: "Maintenance", value: totalSpend * 0.10 },
      { name: "Others", value: totalSpend * 0.10 },
    ];

    // Top Vendors by Spend
    const vendorSpendMap: Record<string, { name: string, spend: number, pos: number, rating: number, delivery: number }> = {};
    
    allPOs.forEach(po => {
      if (!vendorSpendMap[po.vendorId]) {
        vendorSpendMap[po.vendorId] = {
          name: po.vendor.companyName,
          spend: 0,
          pos: 0,
          rating: po.vendor.rating || 4.0,
          delivery: Math.floor(Math.random() * 15) + 80 // Mock delivery % between 80-95
        };
      }
      vendorSpendMap[po.vendorId].spend += Number(po.totalAmount);
      vendorSpendMap[po.vendorId].pos += 1;
    });

    const topVendors = Object.values(vendorSpendMap)
      .sort((a, b) => b.spend - a.spend)
      .slice(0, 5);

    // Monthly Trend (Mocked based on total spend context)
    const monthlyTrend = [
      { month: "Dec 2023", spend: 1.62 * 10000000 },
      { month: "Jan 2024", spend: 1.85 * 10000000 },
      { month: "Feb 2024", spend: 2.10 * 10000000 },
      { month: "Mar 2024", spend: 1.95 * 10000000 },
      { month: "Apr 2024", spend: 2.97 * 10000000 },
      { month: "May 2024", spend: 2.46 * 10000000 },
    ];

    // Scatter Data
    const scatterData = topVendors.map(v => ({
      name: v.name,
      x: v.delivery,
      y: v.rating,
      z: v.spend
    }));

    return NextResponse.json({
      stats: {
        totalSpend,
        totalPOs,
        totalVendors,
        savingsAchieved,
        cycleTime
      },
      summary: {
        totalRFQs,
        rfqsConverted: poRFQs,
        totalQuotations,
        totalInvoices,
        paidInvoices,
        pendingInvoices
      },
      categorySpend,
      topVendors,
      monthlyTrend,
      scatterData
    });

  } catch (error: any) {
    console.error("Fetch reports error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
