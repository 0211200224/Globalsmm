import type { CSSProperties } from "react";
import {
  SiInstagram,
  SiInstagramHex,
  SiTiktok,
  SiTiktokHex,
  SiYoutube,
  SiYoutubeHex,
  SiFacebook,
  SiFacebookHex,
  SiTelegram,
  SiTelegramHex,
  SiX,
  SiXHex,
} from "@icons-pack/react-simple-icons";

type OrbitIcon = { Icon: typeof SiInstagram; color: string; label: string };

const INNER_RING: OrbitIcon[] = [
  { Icon: SiInstagram, color: SiInstagramHex, label: "Instagram" },
  { Icon: SiTiktok, color: SiTiktokHex, label: "TikTok" },
  { Icon: SiYoutube, color: SiYoutubeHex, label: "YouTube" },
];

const OUTER_RING: OrbitIcon[] = [
  { Icon: SiFacebook, color: SiFacebookHex, label: "Facebook" },
  { Icon: SiTelegram, color: SiTelegramHex, label: "Telegram" },
  { Icon: SiX, color: SiXHex, label: "X" },
];

function OrbitRing({
  icons,
  radius,
  duration,
  direction,
  chipSize = 48,
}: {
  icons: OrbitIcon[];
  radius: number;
  duration: number;
  direction: "cw" | "ccw";
  chipSize?: number;
}) {
  const half = chipSize / 2;

  return (
    <>
      {icons.map(({ Icon, color, label }, i) => {
        const delay = -((duration * i) / icons.length);
        const style = {
          animation: `orbit-${direction} ${duration}s linear infinite`,
          animationDelay: `${delay}s`,
          marginLeft: -half,
          marginTop: -half,
          // consumed by the orbit-cw/orbit-ccw keyframes in globals.css
          "--orbit-radius": `${radius}px`,
        } as CSSProperties;

        return (
          <div key={label} className="absolute left-1/2 top-1/2" style={style}>
            <div
              className="flex items-center justify-center rounded-full border border-white/15 shadow-lg backdrop-blur-sm"
              style={{
                width: chipSize,
                height: chipSize,
                background: "color-mix(in srgb, var(--color-surface) 75%, transparent)",
                boxShadow: `0 0 16px -2px ${color}66`,
              }}
            >
              <Icon color={color} size={Math.round(chipSize * 0.46)} aria-label={label} />
            </div>
          </div>
        );
      })}
    </>
  );
}

/**
 * Decorative 3D-feeling globe with platform logos orbiting it, for the
 * login/register marketing panel. Pure CSS (transform/opacity keyframes
 * in globals.css) -- no 3D library, no images, no JS -- so it costs
 * essentially nothing on the critical auth-page load path. globe-spin
 * fakes sphere rotation by animating rotateY on a shaded circle; each
 * icon chip walks a circular path via a single rotate/translate/
 * counter-rotate keyframe (orbit-cw/orbit-ccw) sized by --orbit-radius.
 */
export function OrbitGlobe() {
  return (
    <div
      className="orbit-globe relative mx-auto w-[360px] h-[360px] max-w-full"
      style={{ perspective: "1200px" }}
      aria-hidden="true"
    >
      {/* Ambient glow */}
      <div
        className="absolute inset-0 rounded-full blur-3xl"
        style={{
          background:
            "radial-gradient(circle, color-mix(in srgb, var(--color-secondary) 45%, transparent) 0%, transparent 70%)",
          animation: "globe-glow-pulse 5s ease-in-out infinite",
        }}
      />

      {/* Sphere */}
      <div
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[190px] h-[190px] rounded-full overflow-hidden"
        style={{
          background:
            "radial-gradient(circle at 32% 28%, var(--color-tertiary) 0%, var(--color-primary) 45%, var(--color-primary-container) 100%)",
          boxShadow:
            "0 0 60px -4px color-mix(in srgb, var(--color-secondary) 60%, transparent), inset -18px -18px 50px rgba(0,0,0,0.45)",
          animation: "globe-spin 26s linear infinite",
        }}
      >
        <div
          className="absolute inset-0 opacity-25"
          style={{
            backgroundImage:
              "repeating-linear-gradient(0deg, transparent 0 17px, rgba(255,255,255,0.5) 17px 18px)",
          }}
        />
      </div>

      <OrbitRing icons={INNER_RING} radius={125} duration={20} direction="cw" />
      <OrbitRing icons={OUTER_RING} radius={175} duration={28} direction="ccw" chipSize={44} />
    </div>
  );
}
