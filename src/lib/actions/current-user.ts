import "server-only";

import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";

/**
 * Server Component-only helper. Never import this from a Client Component —
 * it reads cookies (next/headers) and talks to Prisma directly.
 *
 * Self-healing: upserts the Prisma User (+ Wallet) row on every call instead
 * of just reading it. This is what used to be a separate `provisionUser`
 * Server Action called from the login/register forms — moved here so a slow
 * or failed provisioning step can never leave the auth forms stuck waiting
 * with no feedback. Login/register now only do the Supabase Auth call and
 * redirect; the profile row is guaranteed to exist by the time any
 * authenticated page actually reads it.
 */
export async function getCurrentUser() {
  const supabase = await createClient();
  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();

  if (!authUser) return null;

  const name = (authUser.user_metadata?.name as string | undefined) ?? undefined;

  return prisma.user.upsert({
    where: { email: authUser.email! },
    update: { supabaseId: authUser.id },
    create: {
      supabaseId: authUser.id,
      email: authUser.email!,
      name,
      wallet: { create: {} },
    },
    include: { wallet: true },
  });
}
