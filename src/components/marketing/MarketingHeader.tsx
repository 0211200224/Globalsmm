import Link from "next/link";

export function MarketingHeader() {
  return (
    <header className="sticky top-0 w-full z-40 backdrop-blur-md border-b border-white/5 shadow-sm bg-background/70">
      <div className="flex items-center justify-between px-margin-x-mobile md:px-margin-x h-16 max-w-container-max mx-auto">
        <div className="flex items-center gap-3">
          <span className="material-symbols-outlined text-primary">menu</span>
          <h1 className="text-headline-md font-bold text-primary">
            GlobalSMM
          </h1>
        </div>
        <nav className="hidden md:flex items-center gap-8">
          <Link className="text-label-md text-primary hover:text-primary transition-colors" href="/">
            Dashboard
          </Link>
          <Link className="text-label-md text-on-surface-variant hover:text-primary transition-colors" href="/services">
            Services
          </Link>
          <a className="text-label-md text-on-surface-variant hover:text-primary transition-colors" href="#">
            API
          </a>
          <a className="text-label-md text-on-surface-variant hover:text-primary transition-colors" href="#">
            Support
          </a>
        </nav>
        <div className="flex items-center gap-4">
          <span className="material-symbols-outlined text-on-surface-variant cursor-pointer hover:text-primary transition-colors">
            notifications
          </span>
          <Link
            href="/login"
            className="beveled-button bg-secondary-container text-on-secondary-container px-5 py-2 rounded-lg text-label-md active:scale-95 transition-all"
          >
            Sign In
          </Link>
        </div>
      </div>
    </header>
  );
}
