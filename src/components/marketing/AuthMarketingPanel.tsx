import { OrbitGlobe3D } from "./OrbitGlobe3D";

type AuthMarketingPanelProps = {
  heading: React.ReactNode;
  description: string;
};

/**
 * Deliberately fixed-dark regardless of the site's light/dark theme toggle
 * -- this panel exists to show off the 3D globe scene (see OrbitGlobe3D),
 * which is a cosmic navy/purple composition that would wash out on a white
 * light-theme background. Text colors below are literal, not theme
 * tokens, to match.
 */
export function AuthMarketingPanel({
  heading,
  description,
}: AuthMarketingPanelProps) {
  return (
    <section
      className="relative w-full md:w-1/2 min-h-[400px] md:min-h-screen flex flex-col justify-between p-8 md:p-12 overflow-hidden"
      style={{
        background:
          "radial-gradient(ellipse at 30% 20%, #221a4d 0%, #14102e 45%, #0a0818 100%)",
      }}
    >
      <div className="relative z-10">
        <div className="flex items-center gap-2 mb-12">
          <span
            className="material-symbols-outlined text-[#b9a6ff] text-4xl"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            public
          </span>
          <h1 className="text-headline-md text-white tracking-tight">
            GlobalSMM
          </h1>
        </div>
        <div className="max-w-md">
          <h2 className="text-headline-lg mb-4 leading-tight text-white">
            {heading}
          </h2>
          <p className="text-white/70 text-body-lg mb-8">{description}</p>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-3 rounded-lg border border-white/10 bg-white/5 backdrop-blur-sm p-3">
              <span className="material-symbols-outlined text-[#b9a6ff] text-sm">
                check_circle
              </span>
              <span className="text-label-sm uppercase tracking-widest text-white/70">
                Global Reach
              </span>
            </div>
            <div className="flex items-center gap-3 rounded-lg border border-white/10 bg-white/5 backdrop-blur-sm p-3">
              <span className="material-symbols-outlined text-[#b9a6ff] text-sm">
                check_circle
              </span>
              <span className="text-label-sm uppercase tracking-widest text-white/70">
                API Ready
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="relative z-10 py-4 hidden md:flex md:flex-1 md:items-center md:justify-center">
        <OrbitGlobe3D />
      </div>
    </section>
  );
}
