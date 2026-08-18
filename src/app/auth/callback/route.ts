import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * OAuth callback for Supabase Auth (Google/Facebook/GitHub). The provider
 * redirects here with a `code` to exchange for a session, and optionally a
 * `ref` (referral code) that was tacked onto the `redirectTo` URL at
 * signInWithOAuth() time — there's no signUp() call for OAuth like there is
 * for email/password, so this is the only place to stash it before
 * getCurrentUser()'s existing self-heal logic reads
 * user_metadata.referredByCode on first authenticated page load (see
 * src/lib/actions/current-user.ts).
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const ref = searchParams.get("ref");

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error && ref) {
      await supabase.auth.updateUser({ data: { referredByCode: ref } });
    }

    if (!error) {
      return NextResponse.redirect(`${origin}/dashboard`);
    }
  }

  return NextResponse.redirect(`${origin}/login?error=oauth_failed`);
}
