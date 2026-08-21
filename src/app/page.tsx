import Link from "next/link";
import { MarketingHeader } from "@/components/marketing/MarketingHeader";
import { PlatformIcon } from "@/components/services/PlatformIcon";
import { prisma } from "@/lib/prisma";
import { getDictionary } from "@/lib/i18n/get-dictionary";

export default async function Home() {
  const [{ marketing: t }, categories] = await Promise.all([
    getDictionary(),
    prisma.serviceCategory.findMany({
      orderBy: { sortOrder: "asc" },
      select: { name: true, icon: true },
    }),
  ]);

  const whyUs = [
    { icon: "bolt", title: t.whyFastTitle, desc: t.whyFastDesc },
    { icon: "shield", title: t.whySecureTitle, desc: t.whySecureDesc },
    { icon: "public", title: t.whyGlobalTitle, desc: t.whyGlobalDesc },
  ];

  return (
    <>
      <MarketingHeader />
      <main>
        {/* Hero */}
        <section className="px-margin-x-mobile md:px-margin-x pt-16 pb-12 text-center">
          <div className="max-w-2xl mx-auto">
            <span className="inline-block py-1 px-4 rounded-full bg-secondary-container/30 text-secondary text-label-sm border border-secondary/20 mb-6">
              {t.heroBadge}
            </span>
            <h1 className="text-[32px] md:text-display-xl leading-tight mb-4">
              {t.heroTitlePrefix}{" "}
              <span className="mesh-gradient-text">{t.heroTitleHighlight}</span>{" "}
              {t.heroTitleSuffix}
            </h1>
            <p className="text-body-md md:text-body-lg text-on-surface-variant max-w-xl mx-auto mb-8">
              {t.heroDescription}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/register"
                className="beveled-button bg-primary text-on-primary px-8 py-4 rounded-xl text-label-md font-bold flex items-center justify-center gap-2 hover:opacity-90 active:scale-95 transition-all"
              >
                {t.getStarted}
                <span className="material-symbols-outlined text-[20px]">
                  arrow_forward
                </span>
              </Link>
              <Link
                href="/login"
                className="glass-card px-8 py-4 rounded-xl text-label-md font-semibold text-on-surface hover:bg-white/5 active:scale-95 transition-all"
              >
                {t.signIn}
              </Link>
            </div>
          </div>
        </section>

        {/* Platform picker */}
        <section className="px-margin-x-mobile md:px-margin-x py-12 bg-surface-container-low/50">
          <div className="max-w-container-max mx-auto">
            <h2 className="text-headline-lg text-center mb-2">
              {t.platformsTitle}
            </h2>
            <p className="text-body-md text-on-surface-variant text-center mb-8">
              {t.platformsSubtitle}
            </p>
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-4">
              {categories.map((category) => (
                <Link
                  key={category.name}
                  href={`/services?platform=${encodeURIComponent(category.name)}`}
                  className="glass-card rounded-2xl p-6 flex flex-col items-center gap-3 hover:border-secondary/30 hover:-translate-y-1 transition-all"
                >
                  <PlatformIcon
                    name={category.name}
                    fallbackIcon={category.icon ?? "apps"}
                    className="text-[32px]"
                  />
                  <span className="text-label-md font-semibold text-on-surface">
                    {category.name}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Why us */}
        <section className="px-margin-x-mobile md:px-margin-x py-12">
          <div className="max-w-container-max mx-auto grid sm:grid-cols-3 gap-gutter">
            {whyUs.map((item) => (
              <div key={item.title} className="flex items-start gap-4">
                <div className="w-11 h-11 shrink-0 rounded-lg bg-secondary/10 text-secondary flex items-center justify-center">
                  <span className="material-symbols-outlined">{item.icon}</span>
                </div>
                <div>
                  <h3 className="text-body-lg font-bold text-on-surface mb-1">
                    {item.title}
                  </h3>
                  <p className="text-body-sm text-on-surface-variant">
                    {item.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Ambassador + API */}
        <section className="px-margin-x-mobile md:px-margin-x py-12">
          <div className="max-w-container-max mx-auto grid md:grid-cols-2 gap-gutter">
            <div className="glass-card p-8 rounded-2xl relative overflow-hidden group">
              <div className="relative z-10">
                <h3 className="text-headline-md mb-3">{t.ambassadorTitle}</h3>
                <p className="text-body-md text-on-surface-variant mb-6">
                  {t.ambassadorDesc}
                </p>
                <Link
                  href="/affiliate"
                  className="flex items-center gap-2 text-secondary font-bold hover:underline w-fit"
                >
                  {t.ambassadorCta}
                  <span className="material-symbols-outlined">open_in_new</span>
                </Link>
              </div>
              <span className="material-symbols-outlined absolute -bottom-8 -right-8 text-[140px] text-white/5 group-hover:text-white/10 transition-colors">
                groups
              </span>
            </div>
            <div className="glass-card p-8 rounded-2xl relative overflow-hidden group">
              <div className="relative z-10">
                <h3 className="text-headline-md mb-3">{t.apiTitle}</h3>
                <p className="text-body-md text-on-surface-variant mb-6">
                  {t.apiDesc}
                </p>
                <Link
                  href="/api"
                  className="flex items-center gap-2 text-primary font-bold hover:underline w-fit"
                >
                  {t.apiCta}
                  <span className="material-symbols-outlined">code</span>
                </Link>
              </div>
              <span className="material-symbols-outlined absolute -bottom-8 -right-8 text-[140px] text-white/5 group-hover:text-white/10 transition-colors">
                terminal
              </span>
            </div>
          </div>
        </section>

        {/* Global readiness */}
        <section className="py-10 px-margin-x-mobile md:px-margin-x text-center bg-surface-container-low">
          <div className="max-w-container-max mx-auto flex flex-wrap justify-center items-center gap-6 text-on-surface-variant text-label-md">
            <span className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px]">
                payments
              </span>
              {t.globalCurrenciesNote}
            </span>
            <div className="h-4 w-[1px] bg-white/10" />
            <span>EN</span>
            <span>PT</span>
            <span>ES</span>
            <span>FR</span>
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
          </div>
          <div>
            <h4 className="text-label-md font-bold mb-6">Platform</h4>
            <ul className="space-y-4 text-body-sm text-on-surface-variant">
              <li><Link className="hover:text-primary transition-colors" href="/services">Services List</Link></li>
              <li><Link className="hover:text-primary transition-colors" href="/api">API Documentation</Link></li>
              <li><Link className="hover:text-primary transition-colors" href="/affiliate">Ambassador Program</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-label-md font-bold mb-6">Support</h4>
            <ul className="space-y-4 text-body-sm text-on-surface-variant">
              <li><Link className="hover:text-primary transition-colors" href="/support">Help Center</Link></li>
              <li><Link className="hover:text-primary transition-colors" href="/support">Ticketing System</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-label-md font-bold mb-6">Legal</h4>
            <ul className="space-y-4 text-body-sm text-on-surface-variant">
              <li><a className="hover:text-primary transition-colors" href="#">Terms of Service</a></li>
              <li><a className="hover:text-primary transition-colors" href="#">Privacy Policy</a></li>
              <li><a className="hover:text-primary transition-colors" href="#">Refund Policy</a></li>
            </ul>
          </div>
        </div>
        <div className="max-w-container-max mx-auto pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4 text-on-surface-variant text-label-sm">
          <p>© {new Date().getFullYear()} GlobalSMM Infrastructure Group. All rights reserved.</p>
        </div>
      </footer>
    </>
  );
}
