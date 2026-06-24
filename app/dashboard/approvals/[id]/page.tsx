import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import ApprovalRequestClient from '@/components/approvals/ApprovalRequestClient';

export const revalidate = 0;

export default async function ApprovalRequestPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  
  if (!session) {
    redirect('/login');
  }

  // Fetch the specific approval
  const currentApproval = await prisma.approval.findUnique({
    where: { id },
    include: {
      rfq: {
        include: {
          createdBy: true,
          items: true,
          quotations: {
            where: {
              status: { in: ['SHORTLISTED', 'ACCEPTED'] }
            },
            include: {
              vendor: true,
              items: true
            }
          }
        }
      },
      approver: true
    }
  });

  if (!currentApproval) {
    redirect('/dashboard/approvals');
  }

  // Security check: Only the assigned approver or an ADMIN can view this detailed approval
  if (currentApproval.approverId !== (session.user as any).id && (session.user as any).role !== 'ADMIN') {
    redirect('/dashboard/approvals');
  }

  // Fetch ALL approvals for this RFQ to build the timeline
  const allApprovals = await prisma.approval.findMany({
    where: { rfqId: currentApproval.rfqId },
    include: { approver: true },
    orderBy: { level: 'asc' }
  });

  return (
    <ApprovalRequestClient 
      currentApproval={currentApproval} 
      allApprovals={allApprovals} 
      currentUser={(session.user as any)} 
    />
  );
}
