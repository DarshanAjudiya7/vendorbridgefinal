import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { formatDistanceToNow, startOfYear, getMonth } from 'date-fns';
import { ChevronDown, Zap } from 'lucide-react';
import MetricsCards from '@/components/dashboard/MetricsCards';
import ProcurementOverviewChart from '@/components/dashboard/ProcurementOverviewChart';
import PendingApprovalsList from '@/components/dashboard/PendingApprovalsList';
import RecentActivitiesTimeline from '@/components/dashboard/RecentActivitiesTimeline';
import TopVendorsChart from '@/components/dashboard/TopVendorsChart';
import RecentRFQsTable from '@/components/dashboard/RecentRFQsTable';
import RecentPOsTable from '@/components/dashboard/RecentPOsTable';
import SpendSummary from '@/components/dashboard/SpendSummary';
import SpendByCategory from '@/components/dashboard/SpendByCategory';

export const revalidate = 0; // dynamic

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  const userName = session?.user?.name || 'Guest User';
  const currentYearStart = startOfYear(new Date());

  const [
    totalRFQs,
    pendingApprovals,
    activePOs,
    totalInvoices,
    totalSpendAgg,
    recentRFQs,
    recentPOs,
    activities,
    approvals,
    rfqsThisYear,
    posThisYear,
    invoicesThisYear,
    posWithCategories
  ] = await Promise.all([
    prisma.rFQ.count(),
    prisma.approval.count({ where: { status: 'PENDING' } }),
    prisma.purchaseOrder.count({ where: { status: 'APPROVED' } }),
    prisma.invoice.count(),
    prisma.purchaseOrder.aggregate({ _sum: { totalAmount: true }, where: { status: 'APPROVED' } }),
    prisma.rFQ.findMany({ take: 5, orderBy: { createdAt: 'desc' } }),
    prisma.purchaseOrder.findMany({ take: 5, orderBy: { createdAt: 'desc' }, include: { vendor: true } }),
    prisma.activityLog.findMany({ take: 5, orderBy: { createdAt: 'desc' }, include: { user: true } }),
    prisma.approval.findMany({ take: 5, orderBy: { createdAt: 'desc' }, include: { rfq: true, approver: true } }),
    
    // For Overview Chart
    prisma.rFQ.findMany({ where: { createdAt: { gte: currentYearStart } }, select: { createdAt: true } }),
    prisma.purchaseOrder.findMany({ where: { createdAt: { gte: currentYearStart } }, select: { createdAt: true } }),
    prisma.invoice.findMany({ where: { createdAt: { gte: currentYearStart } }, select: { createdAt: true } }),

    // For Top Vendors and Spend By Category
    prisma.purchaseOrder.findMany({
      where: { status: 'APPROVED' },
      include: { vendor: true }
    })
  ]);

  const totalSpend = Number(totalSpendAgg._sum.totalAmount || 0);

  const metricsData = {
    totalRFQs,
    pendingApprovals,
    activePOs,
    totalInvoices,
    totalSpend
  };

  const formattedRFQs = recentRFQs.map(r => ({
    id: r.rfqNumber,
    title: r.title,
    deadline: r.deadline.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
    status: r.status.charAt(0) + r.status.slice(1).toLowerCase()
  }));

  const formattedPOs = recentPOs.map(po => ({
    id: po.poNumber,
    vendor: po.vendor.companyName,
    amount: new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(Number(po.totalAmount)),
    status: po.status.charAt(0) + po.status.slice(1).toLowerCase()
  }));

  const formattedActivities = activities.map(act => {
    let iconName: 'FilePlus' | 'FileText' | 'CheckCircle' | 'Receipt' = 'FileText';
    let color = 'text-blue-600';
    let bgColor = 'bg-blue-100';

    if (act.action.includes('created') || act.action.includes('Created')) {
      iconName = 'FilePlus'; color = 'text-purple-600'; bgColor = 'bg-purple-100';
    } else if (act.action.includes('Approved')) {
      iconName = 'CheckCircle'; color = 'text-emerald-600'; bgColor = 'bg-emerald-100';
    } else if (act.action.includes('Generated')) {
      iconName = 'Receipt'; color = 'text-orange-500'; bgColor = 'bg-orange-100';
    }

    return {
      id: act.id,
      title: act.action,
      description: act.description || '',
      time: formatDistanceToNow(act.createdAt, { addSuffix: true }),
      iconName,
      color,
      bgColor
    };
  });

  const formattedApprovals = approvals.map(app => ({
    id: app.rfq.rfqNumber,
    description: app.rfq.title,
    type: 'RFQ',
    typeColor: 'text-blue-600 bg-blue-50 border-blue-100',
    requestedBy: app.approver.name,
    time: formatDistanceToNow(app.createdAt, { addSuffix: true }),
    barColor: 'bg-blue-500',
  }));

  // Calculate Overview Data dynamically
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const overviewData = months.map((m, index) => {
    return {
      name: m,
      rfqs: rfqsThisYear.filter(r => getMonth(r.createdAt) === index).length,
      pos: posThisYear.filter(p => getMonth(p.createdAt) === index).length,
      invoices: invoicesThisYear.filter(i => getMonth(i.createdAt) === index).length,
    };
  });
  // Filter until current month
  const currentMonthIndex = getMonth(new Date());
  const filteredOverviewData = overviewData.slice(0, currentMonthIndex + 1);

  // Calculate Top Vendors dynamically
  const vendorSpendMap = new Map<string, number>();
  posWithCategories.forEach(po => {
    const val = vendorSpendMap.get(po.vendor.companyName) || 0;
    vendorSpendMap.set(po.vendor.companyName, val + Number(po.totalAmount));
  });
  
  const sortedVendors = Array.from(vendorSpendMap.entries()).sort((a, b) => b[1] - a[1]);
  const colors = ['#3b82f6', '#06b6d4', '#22c55e', '#eab308', '#1e293b'];
  const vendorSpendData = sortedVendors.slice(0, 4).map((v, i) => ({
    name: v[0],
    value: v[1],
    color: colors[i]
  }));
  const otherVendorsSum = sortedVendors.slice(4).reduce((acc, v) => acc + v[1], 0);
  if (otherVendorsSum > 0) {
    vendorSpendData.push({ name: 'Others', value: otherVendorsSum, color: colors[4] });
  }

  // Calculate Category Spend dynamically
  const categorySpendMap = new Map<string, number>();
  posWithCategories.forEach(po => {
    const cat = po.vendor.category || 'Uncategorized';
    const val = categorySpendMap.get(cat) || 0;
    categorySpendMap.set(cat, val + Number(po.totalAmount));
  });
  const sortedCategories = Array.from(categorySpendMap.entries()).sort((a, b) => b[1] - a[1]);
  const catColors = [
    { bg: 'bg-blue-500', dot: 'bg-blue-500' },
    { bg: 'bg-emerald-500', dot: 'bg-emerald-500' },
    { bg: 'bg-orange-500', dot: 'bg-orange-500' },
    { bg: 'bg-purple-500', dot: 'bg-purple-500' },
    { bg: 'bg-pink-500', dot: 'bg-pink-500' }
  ];
  
  const totalCatSpend = sortedCategories.reduce((acc, c) => acc + c[1], 0);
  const categorySpendData = sortedCategories.slice(0, 4).map((c, i) => ({
    name: c[0],
    percent: totalCatSpend > 0 ? Math.round((c[1] / totalCatSpend) * 100) : 0,
    color: catColors[i].bg,
    dot: catColors[i].dot
  }));
  
  const otherCatSum = sortedCategories.slice(4).reduce((acc, c) => acc + c[1], 0);
  if (otherCatSum > 0) {
    categorySpendData.push({
      name: 'Others',
      percent: Math.round((otherCatSum / totalCatSpend) * 100),
      color: catColors[4].bg,
      dot: catColors[4].dot
    });
  }

  return (
    <>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">Dashboard</h1>
          <p className="text-sm text-gray-500 mt-1">Welcome back, {userName} 👋</p>
        </div>
        <div className="mt-4 sm:mt-0">
          <button className="flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-emerald-700 transition-colors">
            <Zap className="h-4 w-4" fill="currentColor" /> Quick Actions <ChevronDown className="h-4 w-4 ml-1" />
          </button>
        </div>
      </div>

      <MetricsCards data={metricsData} />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3 mt-6">
        <div className="lg:col-span-1 xl:col-span-1 h-[400px]">
          <ProcurementOverviewChart data={filteredOverviewData.length > 0 ? filteredOverviewData : []} />
        </div>
        <div className="h-[400px]">
          <PendingApprovalsList approvals={formattedApprovals} />
        </div>
        <div className="h-[400px]">
          <RecentActivitiesTimeline activities={formattedActivities} />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3 mt-6">
        <div className="h-[350px]">
          <TopVendorsChart data={vendorSpendData} totalSpend={totalSpend} />
        </div>
        <div className="h-[350px]">
          <RecentRFQsTable rfqs={formattedRFQs} />
        </div>
        <div className="h-[350px]">
          <RecentPOsTable pos={formattedPOs} />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3 mt-6 mb-8">
        <div className="lg:col-span-2 h-[220px]">
          <SpendSummary />
        </div>
        <div className="h-[220px]">
          <SpendByCategory data={categorySpendData} />
        </div>
      </div>
    </>
  );
}
