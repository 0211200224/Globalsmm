import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { reconcileFapshiTransaction } from "@/lib/fapshi-reconcile";

/**
 * Scheduled fallback for Fapshi's webhook (see vercel.json for the
 * schedule). Sweeps every PENDING fapshi Transaction and asks Fapshi
 * directly whether it actually succeeded, so a customer who paid never
 * stays stuck at their old balance just because a webhook got lost.
 * Vercel Cron sends `Authorization: Bearer $CRON_SECRET` automatically for
 * requests it triggers; this rejects anything else.
 */
export async function GET(request: NextRequest) {
  const auth = request.headers.get("authorization");
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const pending = await prisma.transaction.findMany({
    where: { method: "fapshi", status: "PENDING" },
    select: { id: true },
  });

  const results = await Promise.allSettled(
    pending.map((t) => reconcileFapshiTransaction(t.id)),
  );

  const resolved = results.filter((r) => r.status === "fulfilled" && r.value.success).length;

  return NextResponse.json({ checked: pending.length, resolved });
}
