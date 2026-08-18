"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { AuthMarketingPanel } from "@/components/marketing/AuthMarketingPanel";
import { createClient } from "@/lib/supabase/client";
import { useTranslations, useLocale } from "@/lib/i18n/I18nProvider";
import { SUPPORTED_LOCALES, LOCALE_LABELS, type Locale } from "@/lib/i18n/locales";
import { setLocale } from "@/lib/actions/locale";

export default function LoginPage() {
  const router = useRouter();
  const t = useTranslations();
  const locale = useLocale();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Read directly from the URL instead of useSearchParams() so this page
    // can stay statically prerendered. Must run post-mount (not as a lazy
    // useState initializer) so the client's first render still matches the
    // server-rendered HTML — window/location aren't available during SSR.
    const params = new URLSearchParams(window.location.search);
    if (params.get("blocked")) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setError(t.auth.login.blocked);
    } else if (params.get("error") === "oauth_failed") {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setError(t.auth.login.oauthFailed);
    }
    // Only the URL-param check should run on mount; re-running on every
    // dictionary change would clobber a user-typed error mid-session.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleLanguageChange(next: Locale) {
    await setLocale(next);
    router.refresh();
  }

  async function handleOAuthSignIn(provider: "google" | "facebook" | "github") {
    setError(null);
    const supabase = createClient();
    const { error: oauthError } = await supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
    if (oauthError) setError(oauthError.message);
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const email = String(formData.get("email") ?? "");
    const password = String(formData.get("password") ?? "");

    const supabase = createClient();
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError) {
      setError(signInError.message);
      setLoading(false);
      return;
    }

    // Note: the matching Prisma User/Wallet row is provisioned lazily by
    // getCurrentUser() the first time an authenticated page loads — not
    // here. See src/lib/actions/current-user.ts.

    router.push("/dashboard");
    router.refresh();
  }

  return (
    <main className="flex min-h-screen flex-col md:flex-row">
      <AuthMarketingPanel
        heading={t.auth.login.heading}
        description={t.auth.login.description}
      />

      {/* Right Side: Login Form */}
      <section className="w-full md:w-1/2 flex items-center justify-center p-6 md:p-margin-x bg-surface-container-low">
        <div className="w-full max-w-[440px] space-y-stack-lg">
          <div className="text-center md:text-left mb-stack-xl">
            <h2 className="text-headline-md text-on-surface mb-2">
              {t.auth.login.welcomeBack}
            </h2>
            <p className="text-body-md text-on-surface-variant">
              {t.auth.login.subtitle}
            </p>
          </div>

          {error && (
            <div className="bg-error-container/20 border border-error/30 text-error text-body-sm rounded-lg px-4 py-3">
              {error}
            </div>
          )}

          <form className="space-y-stack-md" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <label className="text-label-md text-on-surface-variant block ml-1" htmlFor="email">
                {t.auth.login.email}
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
              <div className="flex items-center justify-between ml-1">
                <label className="text-label-md text-on-surface-variant block" htmlFor="password">
                  {t.auth.login.password}
                </label>
                <a className="text-label-sm text-primary hover:text-secondary transition-colors" href="#">
                  {t.auth.login.forgotPassword}
                </a>
              </div>
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
            </div>

            <div className="flex items-center space-x-3 pt-2">
              <input
                className="w-5 h-5 rounded border-outline-variant bg-surface-container text-secondary focus:ring-secondary/50 focus:ring-offset-background cursor-pointer"
                id="remember"
                type="checkbox"
              />
              <label className="text-label-md text-on-surface-variant cursor-pointer select-none" htmlFor="remember">
                {t.auth.login.remember}
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-gradient beveled-button text-on-primary text-label-md py-4 rounded-lg shadow-xl active:scale-95 mt-4 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? t.auth.login.submitting : t.auth.login.submit}
            </button>
          </form>

          <div className="relative py-4 flex items-center">
            <div className="flex-grow border-t border-outline-variant" />
            <span className="flex-shrink mx-4 text-label-sm text-on-surface-variant/60 uppercase tracking-widest">
              {t.auth.login.orContinue}
            </span>
            <div className="flex-grow border-t border-outline-variant" />
          </div>

          <div className="space-y-3">
            <button
              type="button"
              onClick={() => handleOAuthSignIn("google")}
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
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => handleOAuthSignIn("facebook")}
                className="flex items-center justify-center gap-2 border border-outline-variant hover:border-primary/50 hover:bg-surface-container-high py-3 rounded-lg transition-all active:scale-[0.98]"
              >
                <svg className="w-5 h-5 text-[#1877F2]" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.469h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.469h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
                <span className="text-label-sm text-on-surface">
                  Facebook
                </span>
              </button>
              <button
                type="button"
                onClick={() => handleOAuthSignIn("github")}
                className="flex items-center justify-center gap-2 border border-outline-variant hover:border-primary/50 hover:bg-surface-container-high py-3 rounded-lg transition-all active:scale-[0.98]"
              >
                <svg className="w-5 h-5 text-on-surface" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
                </svg>
                <span className="text-label-sm text-on-surface">GitHub</span>
              </button>
            </div>
          </div>

          <div className="pt-stack-lg flex flex-col md:flex-row items-center justify-between gap-4 border-t border-outline-variant/30">
            <div className="relative">
              <select
                className="bg-transparent border-none text-label-sm text-on-surface-variant focus:ring-0 cursor-pointer appearance-none pr-8"
                value={locale}
                onChange={(e) => handleLanguageChange(e.target.value as Locale)}
              >
                {SUPPORTED_LOCALES.map((code) => (
                  <option key={code} value={code}>
                    {LOCALE_LABELS[code]}
                  </option>
                ))}
              </select>
            </div>
            <div className="text-label-sm text-on-surface-variant">
              {t.auth.login.noAccount}{" "}
              <Link href="/register" className="text-primary font-bold hover:underline ml-1">
                {t.auth.login.createAccount}
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
