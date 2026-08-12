import { notFound } from "next/navigation";
import { AdminShell } from "@/components/admin/AdminShell";
import { TicketThread } from "@/components/support/TicketThread";
import { prisma } from "@/lib/prisma";
import type { TicketDetailData, TicketStatus } from "@/lib/types/support";

export default async function AdminSupportTicketPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const dbTicket = await prisma.supportTicket.findUnique({
    where: { id },
    include: {
      order: true,
      user: true,
      messages: { include: { author: true }, orderBy: { createdAt: "asc" } },
    },
  });

  if (!dbTicket) notFound();

  const ticket: TicketDetailData = {
    id: dbTicket.id,
    ticketCode: `#GS-T-${90000 + dbTicket.ticketNumber}`,
    subject: dbTicket.subject,
    status: dbTicket.status as TicketStatus,
    orderCode: dbTicket.order ? `#GS-${90000 + dbTicket.order.orderNumber}` : null,
    customerName: dbTicket.user.name || dbTicket.user.email,
    customerEmail: dbTicket.user.email,
    messages: dbTicket.messages.map((m) => ({
      id: m.id,
      authorName: m.author.name || m.author.email,
      isAdminReply: m.isAdminReply,
      body: m.body,
      createdAtLabel: m.createdAt.toLocaleString("en-US"),
    })),
  };

  return (
    <AdminShell>
      <TicketThread ticket={ticket} isAdmin backHref="/admin/support" />
    </AdminShell>
  );
}
