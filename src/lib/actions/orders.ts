"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";
import { settleCommissionForOrder } from "@/lib/actions/affiliate";
import { placeOrder } from "@/lib/order-core";

async function getRequester() {
  const supabase = await createClient();
  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();
  if (!authUser) return null;

  return prisma.user.findUnique({ where: { supabaseId: authUser.id } });
}

export type CreateOrderResult =
  | { success: true; orderNumber: number }
  | { success: false; error: string };

export async function createOrder({
  serviceId,
  quantity,
  targetLink,
}: {
  serviceId: string;
  quantity: number;
  targetLink: string;
}): Promise<CreateOrderResult> {
  const supabase = await createClient();
  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();

  if (!authUser) {
    return { success: false, error: "You must be signed in to place an order." };
  }

  const dbUser = await prisma.user.upsert({
    where: { email: authUser.email! },
    update: { supabaseId: authUser.id },
    create: {
      supabaseId: authUser.id,
      email: authUser.email!,
      name: (authUser.user_metadata?.name as string | undefined) ?? undefined,
      wallet: { create: {} },
    },
  });

  const result = await placeOrder({
    userId: dbUser.id,
    serviceId,
    quantity,
    targetLink,
    source: "WEB",
  });

  if (!result.success) return result;

  revalidatePath("/orders");
  revalidatePath("/dashboard");
  revalidatePath("/wallet");

  return { success: true, orderNumber: result.orderNumber };
}

/**
 * User-facing cancel — deliberately narrower than the admin action in
 * admin-orders.ts: only allowed while still PENDING (no provider mapped, so
 * nothing has been dispatched yet — an order that reached PROCESSING was
 * either already sent to a provider automatically or picked up for manual
 * fulfillment, so it never needs an admin judgment call before that point).
 */
export async function cancelMyOrder(orderId: string) {
  const user = await getRequester();
  if (!user) return { success: false as const, error: "You must be signed in." };

  const order = await prisma.order.findUnique({ where: { id: orderId } });
  if (!order || order.userId !== user.id) {
    return { success: false as const, error: "Order not found." };
  }
  if (order.status !== "PENDING") {
    return {
      success: false as const,
      error: "This order is already being processed — contact support to cancel it.",
    };
  }

  await prisma.$transaction(async (tx) => {
    await tx.order.update({ where: { id: orderId }, data: { status: "CANCELED" } });

    const wallet = await tx.wallet.findUnique({ where: { userId: user.id } });
    if (wallet) {
      await tx.wallet.update({
        where: { id: wallet.id },
        data: { balance: { increment: order.chargedAmount } },
      });
      await tx.transaction.create({
        data: {
          walletId: wallet.id,
          type: "REFUND",
          status: "COMPLETED",
          amount: order.chargedAmount,
          method: "wallet",
        },
      });
    }
  });

  await settleCommissionForOrder(orderId, "VOID");

  revalidatePath("/orders");
  revalidatePath("/dashboard");
  revalidatePath("/wallet");
  revalidatePath("/affiliate");
  return { success: true as const };
}

/**
 * Self-serve refill claim — auto-approved instantly (skips the support
 * ticket queue) as long as the order qualifies. Fulfillment itself is still
 * manual (see PLANO.md), so this flips the order back to PROCESSING so it
 * reappears in the admin queue for redelivery, rather than actually
 * re-triggering delivery through a provider API. One claim per order,
 * enforced by RefillRequest.orderId being unique.
 */
export async function requestRefill(orderId: string) {
  const user = await getRequester();
  if (!user) return { success: false as const, error: "You must be signed in." };

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { service: true, refillRequests: true },
  });
  if (!order || order.userId !== user.id) {
    return { success: false as const, error: "Order not found." };
  }

  if (order.status !== "COMPLETED" && order.status !== "PARTIAL") {
    return {
      success: false as const,
      error: "Refill is only available for completed orders.",
    };
  }
  if (order.service.refillDays <= 0) {
    return {
      success: false as const,
      error: "This service doesn't include a refill guarantee.",
    };
  }
  if (order.refillRequests.length > 0) {
    return {
      success: false as const,
      error: "You've already used your refill claim for this order. Open a support ticket if it needs another look.",
    };
  }
  const deadline = new Date(order.createdAt);
  deadline.setDate(deadline.getDate() + order.service.refillDays);
  if (new Date() > deadline) {
    return {
      success: false as const,
      error: `The ${order.service.refillDays}-day refill window for this order has ended.`,
    };
  }

  await prisma.$transaction(async (tx) => {
    await tx.refillRequest.create({ data: { orderId } });
    await tx.order.update({
      where: { id: orderId },
      data: {
        status: "PROCESSING",
        adminNote: order.adminNote
          ? `${order.adminNote}\n[Refill requested ${new Date().toLocaleDateString("en-US")}]`
          : `[Refill requested ${new Date().toLocaleDateString("en-US")}]`,
      },
    });
  });

  revalidatePath("/orders");
  revalidatePath("/admin/orders");
  revalidatePath("/dashboard");
  return { success: true as const };
}
