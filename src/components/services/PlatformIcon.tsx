"use client";

import type { ComponentType, SVGProps } from "react";
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
  SiSpotify,
  SiSpotifyHex,
} from "@icons-pack/react-simple-icons";

type BrandIcon = ComponentType<SVGProps<SVGSVGElement> & { color?: string; size?: string | number }>;

const BRAND_ICONS: Record<string, { Icon: BrandIcon; color: string }> = {
  instagram: { Icon: SiInstagram, color: SiInstagramHex },
  tiktok: { Icon: SiTiktok, color: SiTiktokHex },
  youtube: { Icon: SiYoutube, color: SiYoutubeHex },
  facebook: { Icon: SiFacebook, color: SiFacebookHex },
  telegram: { Icon: SiTelegram, color: SiTelegramHex },
  x: { Icon: SiX, color: SiXHex },
  twitter: { Icon: SiX, color: SiXHex },
  spotify: { Icon: SiSpotify, color: SiSpotifyHex },
};

/**
 * Official brand mark for a platform category (Instagram, TikTok, YouTube,
 * Facebook, Telegram, X...) instead of the generic Material Symbol the
 * category's `icon` field otherwise carries. Falls back to that generic
 * icon for any category not in the map above, so adding a new platform in
 * admin never breaks — it just renders the old way until this map is
 * extended for it.
 */
export function PlatformIcon({
  name,
  fallbackIcon,
  className,
}: {
  name: string;
  fallbackIcon: string;
  className?: string;
}) {
  const entry = BRAND_ICONS[name.trim().toLowerCase()];
  if (!entry) {
    return (
      <span className={`material-symbols-outlined ${className ?? ""}`}>
        {fallbackIcon}
      </span>
    );
  }

  const { Icon, color } = entry;
  return <Icon color={color} size="1em" className={className} aria-label={name} />;
}
