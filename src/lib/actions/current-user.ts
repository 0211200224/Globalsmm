import "server-only";

import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { generateUniqueReferralCode, linkReferral } from "@/lib/actions/affiliate";

/**
 * Server Component-only helper. Never import this from a Client Component —
 * it reads cookies (next/headers) and talks to Prisma directly.
 *
 * Self-healing: creates the Prisma User (+ Wallet + AffiliateProfile) row on
 * first call instead of blocking login/register on a separate provisioning
 * step. Login/register only do the Supabase Auth call and redirect; this
 * runs on the first authenticated page load instead, so a slow/failed
 * provisioning step can never leave the auth forms stuck with no feedback.
 *
 * Referral linking: if the user signed up via a `?ref=CODE` link, the code
 * was stashed in Supabase's `user_metadata.referredByCode` at signUp time
 * (see src/app/register/page.tsx) and gets resolved here, once, when the
 * Prisma row is first created.
 */
export async function getCurrentUser() {
  const supabase = await createClient();
  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();

  if (!authUser) return null;

  let user = await prisma.user.findUnique({
    where: { email: authUser.email! },
    include: { wallet: true, affiliateProfile: true },
  });

  if (!user) {
    const name = (authUser.user_metadata?.name as string | undefined) ?? undefined;
    const referredByCode =
      (authUser.user_metadata?.referredByCode as string | undefined) ?? undefined;

    user = await prisma.user.create({
      data: {
        supabaseId: authUser.id,
        email: authUser.email!,
        name,
        wallet: { create: {} },
      },
      include: { wallet: true, affiliateProfile: true },
    });

    if (referredByCode) {
      await linkReferral({ referralCode: referredByCode, newUserId: user.id });
    }
  } else if (user.supabaseId !== authUser.id) {
    // Self-heals accounts whose Supabase Auth identity was recreated (e.g.
    // deleted and re-registered with the same email) after the Prisma row
    // already existed.
    user = await prisma.user.update({
      where: { id: user.id },
      data: { supabaseId: authUser.id },
      include: { wallet: true, affiliateProfile: true },
    });
  }

  // Self-heal: every user gets a referral code, even ones created before the
  // affiliate program existed.
  if (!user.affiliateProfile) {
    const referralCode = await generateUniqueReferralCode(user.name || user.email);
    const affiliateProfile = await prisma.affiliateProfile.create({
      data: { userId: user.id, referralCode },
    });
    return { ...user, affiliateProfile };
  }

  return user;
}
