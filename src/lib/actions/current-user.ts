import "server-only";

import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";

/**
 * Server Component-only helper. Never import this from a Client Component —
 * it reads cookies (next/headers) and talks to Prisma directly.
 */
export async function getCurrentUser() {
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
