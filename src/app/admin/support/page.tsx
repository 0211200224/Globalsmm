import { AdminShell } from "@/components/admin/AdminShell";
import { prisma } from "@/lib/prisma";
import type { TicketStatus } from "@/lib/types/support";
import { AdminSupportView, type AdminTicketRow } from "./AdminSupportView";

export default async function AdminSupportPage() {
  const dbTickets = await prisma.supportTicket.findMany({
    include: { order: true, user: true, _count: { select: { messages: true } } },
    orderBy: { updatedAt: "desc" },
    take: 200,
  });

  const tickets: AdminTicketRow[] = dbTickets.map((ticket) => ({
    id: ticket.id,
    ticketCode: `#GS-T-${90000 + ticket.ticketNumber}`,
    subject: ticket.subject,
    status: ticket.status as TicketStatus,
    orderCode: ticket.order ? `#GS-${90000 + ticket.order.orderNumber}` : null,
    createdAtLabel: ticket.createdAt.toLocaleDateString("en-US"),
    messageCount: ticket._count.messages,
    customerName: ticket.user.name || ticket.user.email,
  }));

  return (
    <AdminShell>
      <div>
        <h2 className="text-headline-lg text-on-surface">Support</h2>
        <p className="text-body-md text-on-surface-variant mt-1">
          Customer support tickets, optionally linked to a specific order.
        </p>
      </div>

      <AdminSupportView tickets={tickets} />
    </AdminShell>
  );
}
