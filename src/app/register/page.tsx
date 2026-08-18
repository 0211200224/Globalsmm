"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { AuthMarketingPanel } from "@/components/marketing/AuthMarketingPanel";
import { createClient } from "@/lib/supabase/client";
import { useTranslations } from "@/lib/i18n/I18nProvider";

export default function RegisterPage() {
  const router = useRouter();
  const t = useTranslations();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmEmailSent, setConfirmEmailSent] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const name = String(formData.get("name") ?? "");
    const email = String(formData.get("email") ?? "");
    const password = String(formData.get("password") ?? "");

    // Read directly from the URL instead of useSearchParams() so this page
    // can stay statically prerendered (useSearchParams forces a Suspense
    // boundary / dynamic rendering) — we only need the code at submit time.
    const referredByCode = new URLSearchParams(window.location.search).get("ref");

    const supabase = createClient();
    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { name, referredByCode } },
    });

    if (signUpError) {
      setError(signUpError.message);
      setLoading(false);
      return;
    }

    // Note: the matching Prisma User/Wallet row is provisioned lazily by
    // getCurrentUser() the first time an authenticated page loads — not
    // here. See src/lib/actions/current-user.ts.

    if (!data.session) {
      // Email confirmation is required by the Supabase project before a
      // session exists.
      setConfirmEmailSent(true);
      setLoading(false);
      return;
    }

    router.push("/dashboard");
    router.refresh();
  }

  async function handleGoogleSignUp() {
    setError(null);
    const referredByCode = new URLSearchParams(window.location.search).get("ref");
    const redirectTo = new URL("/auth/callback", window.location.origin);
    if (referredByCode) redirectTo.searchParams.set("ref", referredByCode);

    const supabase = createClient();
    const { error: oauthError } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: redirectTo.toString() },
    });
    if (oauthError) setError(oauthError.message);
  }

  return (
    <main className="flex min-h-screen flex-col md:flex-row">
      <AuthMarketingPanel
        heading={t.auth.register.heading}
        description={t.auth.register.description}
      />

      <section className="w-full md:w-1/2 flex items-center justify-center p-6 md:p-margin-x bg-surface-container-low">
        <div className="w-full max-w-[440px] space-y-stack-lg">
          {confirmEmailSent ? (
            <div className="text-center md:text-left space-y-4">
              <span className="material-symbols-outlined text-secondary text-4xl">
                mark_email_read
              </span>
              <h2 className="text-headline-md text-on-surface">
                {t.auth.register.checkEmailTitle}
              </h2>
              <p className="text-body-md text-on-surface-variant">
                {t.auth.register.checkEmailBody}
              </p>
              <Link
                href="/login"
                className="inline-block text-primary font-bold hover:underline"
              >
                {t.auth.register.goToSignIn}
              </Link>
            </div>
          ) : (
            <>
          <div className="text-center md:text-left mb-stack-xl">
            <h2 className="text-headline-md text-on-surface mb-2">
              {t.auth.register.title}
            </h2>
            <p className="text-body-md text-on-surface-variant">
              {t.auth.register.subtitle}
            </p>
          </div>

          {error && (
            <div className="bg-error-container/20 border border-error/30 text-error text-body-sm rounded-lg px-4 py-3">
              {error}
            </div>
          )}

          <form className="space-y-stack-md" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <label className="text-label-md text-on-surface-variant block ml-1" htmlFor="name">
                {t.auth.register.fullName}
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-outline group-focus-within:text-primary transition-colors">
                  <span className="material-symbols-outlined">person</span>
                </div>
                <input
                  className="w-full bg-surface-container border border-outline-variant focus:border-primary focus:ring-2 focus:ring-primary/20 rounded-lg py-3 pl-12 pr-4 text-on-surface placeholder:text-on-surface-variant/40 transition-all outline-none"
                  id="name"
                  name="name"
                  placeholder="Alex Thompson"
                  type="text"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-label-md text-on-surface-variant block ml-1" htmlFor="email">
                {t.auth.register.email}
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-outline group-focus-within:text-primary transition-colors">
                  <span className="material-symbols-outlined">mail</span>
                </div>
                <input
                  className="w-full bg-surface-container border border-outline-variant focus:border-primary focus:ring-2 focus:ring-primary/20 rounded-lg py-3 pl-12 pr-4 text-on-surface placeholder:text-on-surface-variant/40 transition-all outline-none"
                  id="email"
                  name="email"
                  placeholder="name@company.com"
                  type="email"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-label-md text-on-surface-variant block ml-1" htmlFor="password">
                {t.auth.register.password}
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-outline group-focus-within:text-primary transition-colors">
                  <span className="material-symbols-outlined">lock</span>
                </div>
                <input
                  className="w-full bg-surface-container border border-outline-variant focus:border-primary focus:ring-2 focus:ring-primary/20 rounded-lg py-3 pl-12 pr-12 text-on-surface placeholder:text-on-surface-variant/40 transition-all outline-none"
                  id="password"
                  name="password"
                  placeholder="••••••••"
                  type={showPassword ? "text" : "password"}
                  minLength={8}
                  required
                />
                <button
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-outline hover:text-on-surface transition-colors"
                  onClick={() => setShowPassword((v) => !v)}
                  type="button"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  <span className="material-symbols-outlined">
                    {showPassword ? "visibility_off" : "visibility"}
                  </span>
                </button>
              </div>
              <p className="text-label-sm text-on-surface-variant/60 ml-1">
                {t.auth.register.passwordHint}
              </p>
            </div>

            <div className="flex items-start space-x-3 pt-2">
              <input
                className="w-5 h-5 mt-0.5 rounded border-outline-variant bg-surface-container text-secondary focus:ring-secondary/50 focus:ring-offset-background cursor-pointer"
                id="terms"
                type="checkbox"
                required
              />
              <label className="text-label-md text-on-surface-variant cursor-pointer select-none" htmlFor="terms">
                {t.auth.register.terms}
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-gradient beveled-button text-on-primary text-label-md py-4 rounded-lg shadow-xl active:scale-95 mt-4 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? t.auth.register.submitting : t.auth.register.submit}
            </button>
          </form>

          <div className="relative py-4 flex items-center">
            <div className="flex-grow border-t border-outline-variant" />
            <span className="flex-shrink mx-4 text-label-sm text-on-surface-variant/60 uppercase tracking-widest">
              {t.auth.register.orContinue}
            </span>
            <div className="flex-grow border-t border-outline-variant" />
          </div>

          <div className="space-y-3">
            <button
              type="button"
              onClick={handleGoogleSignUp}
              className="w-full flex items-center justify-center gap-3 border border-outline-variant hover:border-primary/50 hover:bg-surface-container-high py-3 rounded-lg transition-all active:scale-[0.98]"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="currentColor" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="currentColor" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="currentColor" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="currentColor" />
              </svg>
              <span className="text-label-md text-on-surface">
                Continue with Google
              </span>
            </button>
          </div>
            </>
          )}

          <div className="pt-stack-lg flex items-center justify-center gap-1 border-t border-outline-variant/30 text-label-sm text-on-surface-variant">
            {t.auth.register.haveAccount}
            <Link href="/login" className="text-primary font-bold hover:underline ml-1">
              {t.auth.register.signIn}
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
