"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";
import { createCommissionForOrder } from "@/lib/actions/affiliate";

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
