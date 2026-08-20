"use server";

import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";
import { getStripe } from "@/lib/stripe";
import { initiatePay } from "@/lib/fapshi";
import { getRates } from "@/lib/currency/get-rates";

const MIN_DEPOSIT_USD = 5;
const MAX_DEPOSIT_USD = 10000;

async function getRequester() {
  const supabase = await createClient();
  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();
  if (!authUser) return null;

  return prisma.user.findUnique({
    where: { supabaseId: authUser.id },
    include: { wallet: true },
  });
}

export type CreateDepositResult =
  | { success: true; url: string }
  | { success: false; error: string };

/**
 * Creates a Stripe Checkout Session for a wallet deposit and a matching
 * PENDING Transaction row (see prisma/schema.prisma — Transaction.externalRef
 * already exists for exactly this: it holds the Checkout Session id so the
 * webhook can find and credit the right row idempotently, the same way
 * order refunds already create a Transaction alongside the balance change —
 * see src/lib/actions/admin-orders.ts).
 */
export async function createDepositCheckoutSession(
  amount: number,
): Promise<CreateDepositResult> {
  const user = await getRequester();
  if (!user) return { success: false, error: "You must be signed in." };
  if (!user.wallet) {
    return { success: false, error: "Your wallet isn't set up yet. Please try again in a moment." };
  }
  if (!Number.isFinite(amount) || amount < MIN_DEPOSIT_USD || amount > MAX_DEPOSIT_USD) {
    return {
      success: false,
      error: `Enter an amount between $${MIN_DEPOSIT_USD} and $${MAX_DEPOSIT_USD}.`,
    };
  }
  const rounded = Math.round(amount * 100) / 100;

  const headersList = await headers();
  const host = headersList.get("host") ?? "globalsmm.com";
  const protocol = host.startsWith("localhost") ? "http" : "https";
  const origin = `${protocol}://${host}`;

  const transaction = await prisma.transaction.create({
    data: {
      walletId: user.wallet.id,
      type: "DEPOSIT",
      status: "PENDING",
      amount: rounded,
      method: "stripe",
    },
  });

  try {
    const session = await getStripe().checkout.sessions.create({
      mode: "payment",
      customer_email: user.email,
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: { name: "GlobalSMM wallet deposit" },
            unit_amount: Math.round(rounded * 100),
          },
          quantity: 1,
        },
      ],
      success_url: `${origin}/wallet?deposit=success`,
      cancel_url: `${origin}/wallet?deposit=canceled`,
      metadata: { transactionId: transaction.id, userId: user.id },
    });

    await prisma.transaction.update({
      where: { id: transaction.id },
      data: { externalRef: session.id },
    });

    if (!session.url) return { success: false, error: "Could not start checkout. Please try again." };
    return { success: true, url: session.url };
  } catch (err) {
    console.error("createDepositCheckoutSession failed:", err);
    await prisma.transaction.update({ where: { id: transaction.id }, data: { status: "FAILED" } });
    return { success: false, error: "Could not start checkout. Please try again." };
  }
}

/**
 * Same shape as createDepositCheckoutSession, for the Fapshi mobile-money
 * gateway (MTN/Orange, Cameroon). Fapshi only charges in XAF -- the USD
 * amount the customer typed is converted just for this one call (using the
 * same rate source as the display-currency feature), the Wallet is still
 * credited in USD once the webhook confirms, so the internal ledger stays
 * USD everywhere. `externalId` carries our internal Transaction.id through
 * to the webhook (see src/app/api/webhooks/fapshi/route.ts) so the lookup
 * there doesn't depend on Transaction.externalRef, which isn't unique.
 */
export async function createFapshiDeposit(amount: number): Promise<CreateDepositResult> {
  const user = await getRequester();
  if (!user) return { success: false, error: "You must be signed in." };
  if (!user.wallet) {
    return { success: false, error: "Your wallet isn't set up yet. Please try again in a moment." };
  }
  if (!Number.isFinite(amount) || amount < MIN_DEPOSIT_USD || amount > MAX_DEPOSIT_USD) {
    return {
      success: false,
      error: `Enter an amount between $${MIN_DEPOSIT_USD} and $${MAX_DEPOSIT_USD}.`,
    };
  }
  const rounded = Math.round(amount * 100) / 100;

  const headersList = await headers();
  const host = headersList.get("host") ?? "globalsmm.com";
  const protocol = host.startsWith("localhost") ? "http" : "https";
  const origin = `${protocol}://${host}`;

  const transaction = await prisma.transaction.create({
    data: {
      walletId: user.wallet.id,
      type: "DEPOSIT",
      status: "PENDING",
      amount: rounded,
      method: "fapshi",
    },
  });

  try {
    const rates = await getRates();
    const amountXaf = Math.max(100, Math.round(rounded * rates.XAF));

    const { link, transId } = await initiatePay({
      amount: amountXaf,
      email: user.email,
      redirectUrl: `${origin}/wallet?deposit=success`,
      externalId: transaction.id,
      message: "GlobalSMM wallet deposit",
    });

    await prisma.transaction.update({
      where: { id: transaction.id },
      data: { externalRef: transId },
    });

    return { success: true, url: link };
  } catch (err) {
    console.error("createFapshiDeposit failed:", err);
    await prisma.transaction.update({ where: { id: transaction.id }, data: { status: "FAILED" } });
    return { success: false, error: "Could not start Fapshi checkout. Please try again." };
  }
}
