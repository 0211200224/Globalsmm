"use server";

import { revalidatePath } from "next/cache";
import { assertIsAdmin } from "@/lib/actions/admin-guard";
import { reconcileFapshiTransaction } from "@/lib/fapshi-reconcile";

/**
 * Admin-triggered manual reconciliation -- see src/app/api/cron/sync-fapshi-deposits/route.ts
 * for the automatic version of the same check, which now runs on a
 * schedule so this button is a fallback for between runs, not the primary
 * mechanism.
 */
export async function checkFapshiDepositStatus(transactionId: string) {
  await assertIsAdmin();
  const result = await reconcileFapshiTransaction(transactionId);
  revalidatePath("/admin/payments");
  return result;
}
