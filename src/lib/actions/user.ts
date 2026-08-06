"use server";

import { prisma } from "@/lib/prisma";

/**
 * Ensures a Prisma User (+ Wallet) row exists for a given Supabase Auth
 * identity. Called from both register and login: register is the common
 * path, but login must also self-heal accounts that exist in Supabase Auth
 * without a matching Prisma row (e.g. a signup that succeeded in Auth but
 * failed on our side before this function ran).
 *
 * Keyed on email, not supabaseId: Supabase Auth is the source of truth for
 * whether this email is allowed to authenticate. If a Prisma User row is
 * left over from a deleted Supabase Auth user (deleting in the Supabase
 * dashboard only removes the auth.users row, not this one), re-link it to
 * the current identity instead of failing on the unique email constraint.
 */
export async function provisionUser({
  supabaseId,
  email,
  name,
}: {
  supabaseId: string;
  email: string;
  name?: string;
}) {
  await prisma.user.upsert({
    where: { email },
    update: { supabaseId },
    create: {
      supabaseId,
      email,
      name,
      wallet: { create: {} },
    },
  });
}
