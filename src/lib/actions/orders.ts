"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";
import { createCommissionForOrder, settleCommissionForOrder } from "@/lib/actions/affiliate";

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

  const link = targetLink.trim();
  if (!link) {
    return { success: false, error: "Link or username is required." };
  }

  if (!Number.isInteger(quantity) || quantity <= 0) {
    return { success: false, error: "Quantity must be a positive whole number." };
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
    include: { wallet: true },
  });

  const service = await prisma.service.findUnique({ where: { id: serviceId } });
  if (!service || !service.active) {
    return { success: false, error: "This service is no longer available." };
  }

  if (quantity < service.minQuantity || quantity > service.maxQuantity) {
    return {
      success: false,
      error: `Quantity must be between ${service.minQuantity.toLocaleString("en-US")} and ${service.maxQuantity.toLocaleString("en-US")}.`,
    };
  }

  const chargedAmount =
    Math.round(((quantity / 1000) * service.pricePer1000.toNumber() + Number.EPSILON) * 100) /
    100;

  if (!dbUser.wallet) {
    return { success: false, error: "Your wallet isn't set up yet. Please try again in a moment." };
  }

  try {
    const order = await prisma.$transaction(async (tx) => {
      // Conditional update: only debits if the balance is still sufficient,
      // preventing overdraft from concurrent requests.
      const debited = await tx.wallet.updateMany({
        where: { id: dbUser.wallet!.id, balance: { gte: chargedAmount } },
        data: { balance: { decrement: chargedAmount } },
      });

      if (debited.count === 0) {
        throw new Error("INSUFFICIENT_BALANCE");
      }

      await tx.transaction.create({
        data: {
          walletId: dbUser.wallet!.id,
          type: "DEBIT",
          status: "COMPLETED",
          amount: chargedAmount,
          method: "wallet",
        },
      });

      const createdOrder = await tx.order.create({
        data: {
          userId: dbUser.id,
          serviceId: service.id,
          quantity,
          targetLink: link,
          chargedAmount,
          status: "PENDING",
        },
      });

      await createCommissionForOrder(tx, {
        id: createdOrder.id,
        userId: createdOrder.userId,
        chargedAmount: createdOrder.chargedAmount,
      });

      return createdOrder;
    });

    revalidatePath("/orders");
    revalidatePath("/dashboard");
    revalidatePath("/wallet");

    return { success: true, orderNumber: order.orderNumber };
  } catch (err) {
    if (err instanceof Error && err.message === "INSUFFICIENT_BALANCE") {
      return {
        success: false,
        error: "Insufficient wallet balance. Please add funds and try again.",
      };
    }
    console.error("createOrder failed:", err);
    return { success: false, error: "Something went wrong placing your order. Please try again." };
  }
}

/**
 * User-facing cancel — deliberately narrower than the admin action in
 * admin-orders.ts: only allowed while still PENDING, before any work could
 * plausibly have started, so it never needs an admin judgment call.
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
