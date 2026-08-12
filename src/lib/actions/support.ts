"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";
import type { TicketStatus } from "@/generated/prisma/client";

async function getRequester() {
  const supabase = await createClient();
  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();
  if (!authUser) return null;

  return prisma.user.findUnique({ where: { supabaseId: authUser.id } });
}

export async function createTicket({
  subject,
  message,
  orderId,
}: {
  subject: string;
  message: string;
  orderId?: string | null;
}) {
  const user = await getRequester();
  if (!user) return { success: false as const, error: "You must be signed in." };

  if (!subject.trim() || !message.trim()) {
    return { success: false as const, error: "Subject and message are required." };
  }

  if (orderId) {
    const order = await prisma.order.findUnique({ where: { id: orderId } });
    if (!order || order.userId !== user.id) {
      return { success: false as const, error: "That order doesn't belong to you." };
    }
  }

  const ticket = await prisma.supportTicket.create({
    data: {
      userId: user.id,
      orderId: orderId || null,
      subject: subject.trim(),
      messages: {
        create: {
          authorId: user.id,
          isAdminReply: false,
          body: message.trim(),
        },
      },
    },
  });

  revalidatePath("/support");
  revalidatePath("/admin/support");
  return { success: true as const, ticketId: ticket.id, ticketNumber: ticket.ticketNumber };
}

export async function replyToTicket(ticketId: string, message: string) {
  const user = await getRequester();
  if (!user) return { success: false as const, error: "You must be signed in." };

  if (!message.trim()) return { success: false as const, error: "Message can't be empty." };

  const ticket = await prisma.supportTicket.findUnique({ where: { id: ticketId } });
  if (!ticket) return { success: false as const, error: "Ticket not found." };

  const isAdmin = user.role === "ADMIN";
  if (!isAdmin && ticket.userId !== user.id) {
    return { success: false as const, error: "Not your ticket." };
  }

  await prisma.$transaction(async (tx) => {
    await tx.supportMessage.create({
      data: {
        ticketId,
        authorId: user.id,
        isAdminReply: isAdmin,
        body: message.trim(),
      },
    });

    // Admin replying moves an open ticket into progress; the customer
    // replying to a resolved/closed ticket reopens it.
    if (isAdmin && ticket.status === "OPEN") {
      await tx.supportTicket.update({
        where: { id: ticketId },
        data: { status: "IN_PROGRESS" },
      });
    } else if (
      !isAdmin &&
      (ticket.status === "RESOLVED" || ticket.status === "CLOSED")
    ) {
      await tx.supportTicket.update({
        where: { id: ticketId },
        data: { status: "OPEN" },
      });
    }
  });

  revalidatePath(`/support/${ticketId}`);
  revalidatePath(`/admin/support/${ticketId}`);
  revalidatePath("/support");
  revalidatePath("/admin/support");
  return { success: true as const };
}

export async function setTicketStatus(ticketId: string, status: TicketStatus) {
  const user = await getRequester();
  if (!user || user.role !== "ADMIN") {
    return { success: false as const, error: "Not authorized." };
  }

  await prisma.supportTicket.update({ where: { id: ticketId }, data: { status } });

  revalidatePath(`/support/${ticketId}`);
  revalidatePath(`/admin/support/${ticketId}`);
  revalidatePath("/support");
  revalidatePath("/admin/support");
  return { success: true as const };
}
