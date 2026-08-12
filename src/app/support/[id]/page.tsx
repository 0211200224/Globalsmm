import { notFound } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";
import { TicketThread } from "@/components/support/TicketThread";
import { getCurrentUser } from "@/lib/actions/current-user";
import { prisma } from "@/lib/prisma";
import type { TicketDetailData, TicketStatus } from "@/lib/types/support";

export default async function SupportTicketPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await getCurrentUser();
  if (!user) notFound();

  const dbTicket = await prisma.supportTicket.findUnique({
    where: { id },
    include: {
      order: true,
      messages: { include: { author: true }, orderBy: { createdAt: "asc" } },
    },
  });

  if (!dbTicket || dbTicket.userId !== user.id) notFound();

  const ticket: TicketDetailData = {
    id: dbTicket.id,
    ticketCode: `#GS-T-${90000 + dbTicket.ticketNumber}`,
    subject: dbTicket.subject,
    status: dbTicket.status as TicketStatus,
    orderCode: dbTicket.order ? `#GS-${90000 + dbTicket.order.orderNumber}` : null,
    messages: dbTicket.messages.map((m) => ({
      id: m.id,
      authorName: m.author.name || m.author.email,
      isAdminReply: m.isAdminReply,
      body: m.body,
      createdAtLabel: m.createdAt.toLocaleString("en-US"),
    })),
  };

  return (
    <AppShell>
      <TicketThread ticket={ticket} isAdmin={false} backHref="/support" />
    </AppShell>
  );
}
