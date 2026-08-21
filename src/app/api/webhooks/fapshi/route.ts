import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { createNotification } from "@/lib/notifications-core";
import type { FapshiPaymentStatus } from "@/lib/fapshi";

/**
 * Credits the Wallet once a Fapshi payment succeeds. Fapshi authenticates
 * webhooks with a shared secret in the x-wh-secret header (set on their
 * dashboard, not via API — see docs.fapshi.com), not an HMAC signature like
 * Stripe. Sends only one request per event with no retry, so this still
 * guards on the Transaction still being PENDING for safety, but can't lean
 * on retry-driven idempotency the way the Stripe webhook does.
 */
export async function POST(request: NextRequest) {
  const secret = request.headers.get("x-wh-secret");
  if (!secret || secret !== process.env.FAPSHI_WEBHOOK_SECRET) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  const payload = (await request.json()) as {
    status?: FapshiPaymentStatus;
    externalId?: string;
    transId?: string;
  };

  if (payload.status === "SUCCESSFUL" && payload.externalId) {
    const transaction = await prisma.transaction.findUnique({
      where: { id: payload.externalId },
      include: { wallet: true },
    });

    if (transaction && transaction.status === "PENDING") {
      await prisma.$transaction(async (tx) => {
        await tx.transaction.update({
          where: { id: transaction.id },
          data: { status: "COMPLETED" },
        });
        await tx.wallet.update({
          where: { id: transaction.walletId },
          data: { balance: { increment: transaction.amount } },
        });
      });

      await createNotification({
        userId: transaction.wallet.userId,
        type: "WALLET_DEPOSIT",
        title: "Deposit confirmed",
        body: "Your deposit was confirmed and your wallet balance was updated.",
        link: "/wallet",
      });
    }
  }

  return NextResponse.json({ received: true });
}
