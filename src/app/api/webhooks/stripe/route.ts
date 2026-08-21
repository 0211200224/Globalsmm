import { NextResponse, type NextRequest } from "next/server";
import Stripe from "stripe";
import { prisma } from "@/lib/prisma";
import { getStripe } from "@/lib/stripe";
import { createNotification } from "@/lib/notifications-core";

/**
 * Credits the Wallet once a deposit Checkout Session completes. Stripe
 * retries webhooks on non-2xx responses, so this must be idempotent — it
 * only acts if the matching Transaction (found via externalRef, set at
 * session-creation time in src/lib/actions/wallet.ts) is still PENDING.
 */
export async function POST(request: NextRequest) {
  const signature = request.headers.get("stripe-signature");
  const body = await request.text();

  if (!signature) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = getStripe().webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch (err) {
    console.error("Stripe webhook signature verification failed:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const transactionId = session.metadata?.transactionId;
    if (!transactionId) return NextResponse.json({ received: true });

    const transaction = await prisma.transaction.findUnique({
      where: { id: transactionId },
      include: { wallet: true },
    });

    if (transaction && transaction.status === "PENDING") {
      await prisma.$transaction(async (tx) => {
        await tx.transaction.update({
          where: { id: transaction.id },
          data: { status: "COMPLETED", externalRef: session.id },
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
        body: `Your deposit was confirmed and your wallet balance was updated.`,
        link: "/wallet",
      });
    }
  }

  return NextResponse.json({ received: true });
}
