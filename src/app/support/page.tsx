import { AppShell } from "@/components/layout/AppShell";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/actions/current-user";
import type { TicketListRow, TicketStatus } from "@/lib/types/support";
import { SupportView } from "./SupportView";

export default async function SupportPage() {
  const user = await getCurrentUser();

  const [dbTickets, dbOrders] = user
    ? await Promise.all([
        prisma.supportTicket.findMany({
          where: { userId: user.id },
          include: { order: true, _count: { select: { messages: true } } },
          orderBy: { updatedAt: "desc" },
        }),
        prisma.order.findMany({
          where: { userId: user.id },
          orderBy: { createdAt: "desc" },
          take: 50,
          include: { service: true },
        }),
      ])
    : [[], []];

  const tickets: TicketListRow[] = dbTickets.map((ticket) => ({
    id: ticket.id,
    ticketCode: `#GS-T-${90000 + ticket.ticketNumber}`,
    subject: ticket.subject,
    status: ticket.status as TicketStatus,
    orderCode: ticket.order ? `#GS-${90000 + ticket.order.orderNumber}` : null,
    createdAtLabel: ticket.createdAt.toLocaleDateString("en-US"),
    messageCount: ticket._count.messages,
  }));

  const orders = dbOrders.map((order) => ({
    id: order.id,
    label: `#GS-${90000 + order.orderNumber} — ${order.service.name}`,
  }));

  return (
    <AppShell>
      <SupportView tickets={tickets} orders={orders} />
    </AppShell>
  );
}
