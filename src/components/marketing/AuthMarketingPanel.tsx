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
      <div className="absolute inset-0 z-0">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          className="w-full h-full object-cover"
          alt=""
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuB9cyQjiOyz-CjWm6FL_0bdGqYgrTjUx5A0LjwSezZo14hzcaEjqIOZbVGhMgOriaVZJRu12a6Afp10lVs2-0m0Xq4WU7AL4Z7qc2PqdM1UED6dEd3UUUxwbjaIW7fru0YyIeghqjde5i_m2_oB4k_QZBE-QNRfZRq62ZoZiwSpd148CScm8_LbVNANA7DJgBbU5P3iBfcHWglIXixC22Bn72jMBXLC5_J42YrDJGZ7ubS8UnS4zj2D8a2cEoIhF2_2j76Mx9gO-mo"
        />
        <div className="absolute inset-0 bg-gradient-to-tr from-background via-transparent to-background/50 mix-blend-multiply" />
        <div className="absolute inset-0 bg-primary-container/20" />
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

      <div className="relative z-10 flex items-center gap-6 mt-auto">
        <div className="flex -space-x-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="w-10 h-10 rounded-full border-2 border-surface bg-surface-container-high"
            />
          ))}
        </div>
        <p className="text-label-md text-on-surface-variant">
          Trusted by 2,000+ Enterprises
        </p>
      </div>
    </section>
  );
}
