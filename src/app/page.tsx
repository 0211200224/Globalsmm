import Link from "next/link";
import { MarketingHeader } from "@/components/marketing/MarketingHeader";
import { HeroVisual } from "@/components/marketing/HeroVisual";
import { getDictionary } from "@/lib/i18n/get-dictionary";

export default async function Home() {
  const { marketing: t } = await getDictionary();

  return (
    <>
      <MarketingHeader />
      <main>
        {/* Hero */}
        <section className="relative overflow-hidden pt-20 pb-32 px-margin-x-mobile md:px-margin-x">
          <div className="max-w-container-max mx-auto grid lg:grid-cols-2 gap-12 items-center">
            <div className="z-10 text-center lg:text-left">
              <span className="inline-block py-1 px-4 rounded-full bg-secondary-container/30 text-secondary text-label-sm border border-secondary/20 mb-6">
                {t.heroBadge}
              </span>
              <h2 className="text-[44px] md:text-display-xl leading-tight mb-6">
                {t.heroTitlePrefix}{" "}
                <span className="mesh-gradient-text">{t.heroTitleHighlight}</span>{" "}
                {t.heroTitleSuffix}
              </h2>
              <p className="text-body-lg text-on-surface-variant max-w-xl mx-auto lg:mx-0 mb-10">
                {t.heroDescription}
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Link
                  href="/register"
                  className="beveled-button bg-primary text-on-primary px-8 py-4 rounded-xl text-label-md font-bold flex items-center justify-center gap-2 hover:opacity-90 active:scale-95 transition-all"
                >
                  {t.getStarted}
                  <span className="material-symbols-outlined text-[20px]">
                    arrow_forward
                  </span>
                </Link>
                <a
                  href="#"
                  className="glass-card px-8 py-4 rounded-xl text-label-md font-semibold text-on-surface hover:bg-white/5 active:scale-95 transition-all"
                >
                  {t.viewDocs}
                </a>
              </div>
            </div>
            <HeroVisual />
          </div>
        </section>

        {/* Trusted By */}
        <section className="py-12 border-y border-white/5 bg-surface-container-lowest">
          <div className="max-w-container-max mx-auto px-margin-x flex flex-wrap justify-center md:justify-between items-center gap-12 opacity-50 grayscale hover:grayscale-0 transition-all duration-700">
            {["STRIPE", "VERCEL", "SAMSUNG", "BINANCE", "AIRWALLEX", "DISCORD"].map(
              (brand) => (
                <span key={brand} className="text-headline-md tracking-tighter">
                  {brand}
                </span>
              ),
            )}
          </div>
        </section>

        {/* Statistics */}
        <section className="py-stack-xl px-margin-x-mobile md:px-margin-x">
          <div className="max-w-container-max mx-auto grid grid-cols-2 md:grid-cols-4 gap-gutter">
            {[
              { value: "500M+", label: "Orders Processed", accent: "border-l-secondary" },
              { value: "99.9%", label: "API Uptime", accent: "border-l-primary" },
              { value: "24/7", label: "Priority Support", accent: "border-l-tertiary" },
              { value: "150+", label: "Countries Supported", accent: "border-l-secondary" },
            ].map((stat) => (
              <div
                key={stat.label}
                className={`glass-card p-8 rounded-2xl border-l-4 ${stat.accent}`}
              >
                <div className="text-headline-lg text-primary mb-1">
                  {stat.value}
                </div>
                <div className="text-label-md text-on-surface-variant">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Features Grid */}
        <section className="py-stack-xl px-margin-x-mobile md:px-margin-x bg-surface-container-low/50">
          <div className="max-w-container-max mx-auto">
            <div className="mb-16 text-center max-w-2xl mx-auto">
              <h2 className="text-headline-lg mb-4">
                Precision Engineered Features
              </h2>
              <p className="text-body-md text-on-surface-variant">
                The tools you need to dominate social markets at scale, with
                zero friction and maximum reliability.
              </p>
            </div>
            <div className="grid lg:grid-cols-3 gap-gutter items-center">
              <div className="space-y-6">
                <div className="glass-card p-6 rounded-2xl hover:translate-x-2 transition-transform duration-300">
                  <div className="w-12 h-12 bg-secondary/10 rounded-lg flex items-center justify-center mb-4">
                    <span className="material-symbols-outlined text-secondary">
                      bolt
                    </span>
                  </div>
                  <h3 className="text-headline-md mb-2">Lightning Speed</h3>
                  <p className="text-body-sm text-on-surface-variant">
                    Orders are initiated within milliseconds of API receipt.
                    High-concurrency processing for peak performance.
                  </p>
                </div>
                <div className="glass-card p-6 rounded-2xl hover:translate-x-2 transition-transform duration-300">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                    <span className="material-symbols-outlined text-primary">
                      shield
                    </span>
                  </div>
                  <h3 className="text-headline-md mb-2">Military Security</h3>
                  <p className="text-body-sm text-on-surface-variant">
                    End-to-end encryption for all transactions and sensitive
                    account data. We prioritize your privacy.
                  </p>
                </div>
              </div>
              <div className="flex justify-center order-first lg:order-none">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  alt="Abstract representation of technology and speed"
                  className="w-full max-w-[400px] object-contain"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuCYBc4b4Qydt2XIzEPUhabG-zR8u9yMd9Aep9bgfGdHUKrYTrMKxp4LVc_qKLAxrV9IpH-0MmEvvrrWL6rV_QnWuYoAEwa-XS4332vV0zOzyG0EwYR0UCpCpHmCiH8Dhvl0AmuIlKhG39zxlpYGYHU9Ri7dv_XgisspAnTbM_IBI9TRpdKDiGg3osu6dNT793eEcNgRx_XD0irucaFVrEFAmKTWDGLKd5NUVq_Hbph9h3pVz5RQ7zFgOtn33302WCXBrvAtZm3IdZA"
                />
              </div>
              <div className="space-y-6">
                <div className="glass-card p-6 rounded-2xl hover:-translate-x-2 transition-transform duration-300">
                  <div className="w-12 h-12 bg-tertiary/10 rounded-lg flex items-center justify-center mb-4">
                    <span className="material-symbols-outlined text-tertiary">
                      public
                    </span>
                  </div>
                  <h3 className="text-headline-md mb-2">Global Reach</h3>
                  <p className="text-body-sm text-on-surface-variant">
                    Access local networks in every continent. True global
                    delivery optimized for regional trends.
                  </p>
                </div>
                <div className="glass-card p-6 rounded-2xl hover:-translate-x-2 transition-transform duration-300">
                  <div className="w-12 h-12 bg-secondary/10 rounded-lg flex items-center justify-center mb-4">
                    <span className="material-symbols-outlined text-secondary">
                      settings
                    </span>
                  </div>
                  <h3 className="text-headline-md mb-2">Seamless API</h3>
                  <p className="text-body-sm text-on-surface-variant">
                    Robust JSON-REST API designed for developers.
                    Comprehensive documentation for white-labeling.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="py-stack-xl px-margin-x-mobile md:px-margin-x">
          <div className="max-w-container-max mx-auto">
            <h2 className="text-headline-lg text-center mb-16">
              Three Steps to Growth
            </h2>
            <div className="grid md:grid-cols-3 gap-12 relative">
              <div className="absolute top-1/2 left-0 w-full h-[1px] bg-white/5 hidden md:block z-0" />
              <div className="relative z-10 flex flex-col items-center text-center">
                <div className="w-16 h-16 rounded-full bg-background border border-white/10 flex items-center justify-center text-headline-md text-secondary mb-6 shadow-xl">
                  1
                </div>
                <h4 className="text-headline-md mb-3">Create Account</h4>
                <p className="text-body-md text-on-surface-variant">
                  Sign up in seconds. No complex verification required for
                  initial deposits.
                </p>
              </div>
              <div className="relative z-10 flex flex-col items-center text-center">
                <div className="w-16 h-16 rounded-full bg-background border border-white/10 flex items-center justify-center text-headline-md text-secondary mb-6 shadow-xl">
                  2
                </div>
                <h4 className="text-headline-md mb-3">Add Funds</h4>
                <div className="flex items-center gap-3 mb-4 grayscale hover:grayscale-0 transition-all">
                  <span className="material-symbols-outlined">payments</span>
                  <span className="material-symbols-outlined">
                    currency_bitcoin
                  </span>
                  <span className="material-symbols-outlined">
                    credit_card
                  </span>
                </div>
                <p className="text-body-md text-on-surface-variant">
                  Instant deposits via Stripe, Crypto, or Bank Wire. Secure
                  payment gateways only.
                </p>
              </div>
              <div className="relative z-10 flex flex-col items-center text-center">
                <div className="w-16 h-16 rounded-full bg-background border border-white/10 flex items-center justify-center text-headline-md text-secondary mb-6 shadow-xl">
                  3
                </div>
                <h4 className="text-headline-md mb-3">Select Service</h4>
                <p className="text-body-md text-on-surface-variant">
                  Choose from 5,000+ services and track your metrics in
                  real-time dashboards.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Dashboard Preview */}
        <section className="py-stack-xl px-margin-x-mobile md:px-margin-x bg-primary-container/20">
          <div className="max-w-container-max mx-auto text-center">
            <h2 className="text-headline-lg mb-12">
              Executive Control at Your Fingertips
            </h2>
            <div className="relative p-4 md:p-8 glass-card rounded-3xl overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-tr from-secondary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                alt="GlobalSMM Dashboard Interface Design"
                className="w-full rounded-2xl shadow-2xl transition-transform duration-700 group-hover:scale-[1.02]"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuAJ7EQVwBXh-3xiBUhh26swajjPEtwdl_maqVVqb4B470aNtgVyNAtLfSK4UWFXv7fDzQxJdWvbWG35NOOWuVFF3jp-6QKzaPWfabL6cAhuJ3mqEmOm0968Mx56p5vwpLeBM-Mqk2m4W4bNvxkiagfrYKEafV9vTTKKH5Zd572PMbtwxgmyXPXFQEzJG5P2fqwqiXL8dFkDEBDHxQIxipMZRjBWrmoRRyoiafKPkC71clcDLshv7nxwRohQRkjmSYESJ5HX0TZVRvk"
              />
            </div>
          </div>
        </section>

        {/* Cards Section */}
        <section className="py-stack-xl px-margin-x-mobile md:px-margin-x">
          <div className="max-w-container-max mx-auto grid md:grid-cols-2 gap-gutter">
            <div className="glass-card p-10 rounded-3xl relative overflow-hidden group">
              <div className="relative z-10">
                <h3 className="text-headline-lg mb-4">Ambassador Program</h3>
                <p className="text-body-lg text-on-surface-variant mb-8">
                  Join the elite network of marketers. Earn up to 20%
                  recurring commission on all referrals for life.
                </p>
                <Link
                  href="/affiliate"
                  className="flex items-center gap-2 text-secondary font-bold hover:underline w-fit"
                >
                  Join Program
                  <span className="material-symbols-outlined">
                    open_in_new
                  </span>
                </Link>
              </div>
              <span className="material-symbols-outlined absolute -bottom-10 -right-10 text-[200px] text-white/5 group-hover:text-white/10 transition-colors">
                groups
              </span>
            </div>
            <div className="glass-card p-10 rounded-3xl relative overflow-hidden group">
              <div className="relative z-10">
                <h3 className="text-headline-lg mb-4">API Integration</h3>
                <p className="text-body-lg text-on-surface-variant mb-8">
                  High-speed endpoints for white-labeling. Fully customizable
                  panel solutions with easy-to-use hooks.
                </p>
                <a
                  href="#"
                  className="flex items-center gap-2 text-primary font-bold hover:underline w-fit"
                >
                  Developer Docs
                  <span className="material-symbols-outlined">code</span>
                </a>
              </div>
              <span className="material-symbols-outlined absolute -bottom-10 -right-10 text-[200px] text-white/5 group-hover:text-white/10 transition-colors">
                terminal
              </span>
            </div>
          </div>
        </section>

        {/* Global Readiness */}
        <section className="py-12 px-margin-x-mobile md:px-margin-x text-center bg-surface-container-low">
          <div className="max-w-container-max mx-auto flex flex-wrap justify-center items-center gap-8 text-on-surface-variant text-label-md">
            <div className="flex items-center gap-2">
              <span className="w-6 h-4 bg-primary/20 rounded-sm" /> USD / $
            </div>
            <div className="flex items-center gap-2">
              <span className="w-6 h-4 bg-secondary/20 rounded-sm" /> EUR / €
            </div>
            <div className="flex items-center gap-2">
              <span className="w-6 h-4 bg-tertiary/20 rounded-sm" /> GBP / £
            </div>
            <div className="flex items-center gap-2">
              <span className="w-6 h-4 bg-error/20 rounded-sm" /> BTC / ₿
            </div>
            <div className="flex items-center gap-2">
              <span className="w-6 h-4 bg-outline/20 rounded-sm" /> USDT / ₮
            </div>
            <div className="h-4 w-[1px] bg-white/10 mx-4" />
            <span>EN</span> <span>FR</span> <span>ES</span> <span>DE</span>{" "}
            <span>CN</span> <span>JP</span>
          </div>
        </section>

        {/* Testimonials */}
        <section className="py-stack-xl px-margin-x-mobile md:px-margin-x">
          <div className="max-w-container-max mx-auto">
            <h2 className="text-headline-lg text-center mb-16">
              Trusted by Founders
            </h2>
            <div className="grid md:grid-cols-3 gap-gutter">
              {[
                {
                  name: "Markus R.",
                  role: "CEO, Nexus Media",
                  quote:
                    "GlobalSMM has completely transformed how we handle agency-level social growth. The API uptime is unparalleled in the industry.",
                  border: "border-t-secondary/20",
                },
                {
                  name: "Sarah Chen",
                  role: "Founder, ViralGrowth",
                  quote:
                    "The transparency and precision of their metrics are what sets them apart. We've scaled our operations 4x since switching.",
                  border: "border-t-primary/20",
                },
                {
                  name: "Alex Sterling",
                  role: "Lead Dev, SocialFlow",
                  quote:
                    "Their REST API is the cleanest I've ever integrated. The white-label features allow us to provide a premium experience to our own clients.",
                  border: "border-t-tertiary/20",
                },
              ].map((t) => (
                <div
                  key={t.name}
                  className={`glass-card p-8 rounded-2xl border-t-2 ${t.border}`}
                >
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-12 h-12 rounded-full overflow-hidden bg-surface-container-high flex items-center justify-center text-label-md font-bold text-on-surface-variant">
                      {t.name.charAt(0)}
                    </div>
                    <div>
                      <div className="text-label-md font-bold flex items-center gap-1">
                        {t.name}{" "}
                        <span
                          className="material-symbols-outlined text-[14px] text-blue-400"
                          style={{ fontVariationSettings: "'FILL' 1" }}
                        >
                          verified
                        </span>
                      </div>
                      <div className="text-label-sm text-on-surface-variant">
                        {t.role}
                      </div>
                    </div>
                  </div>
                  <p className="text-body-md italic text-on-surface-variant leading-relaxed">
                    &ldquo;{t.quote}&rdquo;
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="py-stack-xl px-margin-x-mobile md:px-margin-x bg-surface-container-lowest">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-headline-lg text-center mb-12">
              Frequently Asked Questions
            </h2>
            <div className="space-y-4">
              {[
                {
                  q: "How fast are orders processed?",
                  a: "90% of our services start within minutes of order placement. Our high-speed API ensures that requests are queued and processed by our global provider network instantly.",
                },
                {
                  q: "Is my account information secure?",
                  a: "Yes. We use enterprise-grade encryption (AES-256) and never share your data with third parties. Your credentials and order history are for your eyes only.",
                },
                {
                  q: "What payment methods do you accept?",
                  a: "We accept over 50+ payment methods including Credit Cards (Stripe), Cryptocurrencies (Bitcoin, Ethereum, USDT), and regional methods like Wise and local bank transfers.",
                },
                {
                  q: "Can I get a discount for large orders?",
                  a: "Absolutely. Our Enterprise Tier offers custom pricing for high-volume users and agencies. Contact our 24/7 support team to discuss specialized rates.",
                },
              ].map((item, i) => (
                <details
                  key={item.q}
                  className="glass-card rounded-xl p-6 group cursor-pointer"
                  open={i === 0}
                >
                  <summary className="flex justify-between items-center text-label-md font-bold list-none">
                    {item.q}
                    <span className="material-symbols-outlined group-open:rotate-180 transition-transform">
                      expand_more
                    </span>
                  </summary>
                  <p className="text-body-md text-on-surface-variant mt-4 pt-4 border-t border-white/5">
                    {item.a}
                  </p>
                </details>
              ))}
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-surface pt-stack-xl pb-12 border-t border-white/5 px-margin-x-mobile md:px-margin-x">
        <div className="max-w-container-max mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          <div className="col-span-1 lg:col-span-1">
            <h2 className="text-headline-md font-bold text-primary mb-6">
              GlobalSMM
            </h2>
            <p className="text-body-sm text-on-surface-variant mb-6">
              {t.footerTagline}
            </p>
            <div className="flex gap-4">
              <span className="material-symbols-outlined text-on-surface-variant hover:text-primary transition-colors cursor-pointer">
                share
              </span>
              <span className="material-symbols-outlined text-on-surface-variant hover:text-primary transition-colors cursor-pointer">
                alternate_email
              </span>
              <span className="material-symbols-outlined text-on-surface-variant hover:text-primary transition-colors cursor-pointer">
                public
              </span>
            </div>
          </div>
          <div>
            <h4 className="text-label-md font-bold mb-6">Platform</h4>
            <ul className="space-y-4 text-body-sm text-on-surface-variant">
              <li><a className="hover:text-primary transition-colors" href="#">Services List</a></li>
              <li><a className="hover:text-primary transition-colors" href="#">API Documentation</a></li>
              <li><a className="hover:text-primary transition-colors" href="#">Ambassador Program</a></li>
              <li><a className="hover:text-primary transition-colors" href="#">Panel Solutions</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-label-md font-bold mb-6">Support</h4>
            <ul className="space-y-4 text-body-sm text-on-surface-variant">
              <li><a className="hover:text-primary transition-colors" href="#">Help Center</a></li>
              <li><a className="hover:text-primary transition-colors" href="#">Ticketing System</a></li>
              <li><a className="hover:text-primary transition-colors" href="#">Status Page</a></li>
              <li><a className="hover:text-primary transition-colors" href="#">Security Policy</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-label-md font-bold mb-6">Legal</h4>
            <ul className="space-y-4 text-body-sm text-on-surface-variant">
              <li><a className="hover:text-primary transition-colors" href="#">Terms of Service</a></li>
              <li><a className="hover:text-primary transition-colors" href="#">Privacy Policy</a></li>
              <li><a className="hover:text-primary transition-colors" href="#">Refund Policy</a></li>
              <li><a className="hover:text-primary transition-colors" href="#">Cookies</a></li>
            </ul>
          </div>
        </div>
        <div className="max-w-container-max mx-auto pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4 text-on-surface-variant text-label-sm">
          <p>© {new Date().getFullYear()} GlobalSMM Infrastructure Group. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <span>ISO 27001 Certified</span>
            <span>GDPR Compliant</span>
          </div>
        </div>
      </footer>
    </>
  );
}
