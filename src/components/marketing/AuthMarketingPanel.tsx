type AuthMarketingPanelProps = {
  heading: React.ReactNode;
  description: string;
};

export function AuthMarketingPanel({
  heading,
  description,
}: AuthMarketingPanelProps) {
  return (
    <section className="relative w-full md:w-1/2 min-h-[400px] md:min-h-screen flex flex-col justify-between p-8 md:p-12 overflow-hidden">
      <div className="absolute inset-0 z-0 mesh-gradient">
        <div className="absolute inset-0 bg-gradient-to-tr from-background via-transparent to-background/50 mix-blend-multiply" />
      </div>

      <div className="relative z-10">
        <div className="flex items-center gap-2 mb-12">
          <span
            className="material-symbols-outlined text-primary text-4xl"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            public
          </span>
          <h1 className="text-headline-md text-on-surface tracking-tight">
            GlobalSMM
          </h1>
        </div>
        <div className="max-w-md">
          <h2 className="text-headline-lg mb-4 leading-tight">{heading}</h2>
          <p className="text-on-surface-variant text-body-lg mb-8">
            {description}
          </p>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-3 glass-panel p-3 rounded-lg border border-white/5">
              <span className="material-symbols-outlined text-secondary text-sm">
                check_circle
              </span>
              <span className="text-label-sm uppercase tracking-widest text-on-surface-variant">
                Global Reach
              </span>
            </div>
            <div className="flex items-center gap-3 glass-panel p-3 rounded-lg border border-white/5">
              <span className="material-symbols-outlined text-secondary text-sm">
                check_circle
              </span>
              <span className="text-label-sm uppercase tracking-widest text-on-surface-variant">
                API Ready
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
