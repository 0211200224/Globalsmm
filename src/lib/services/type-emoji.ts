/**
 * Best-effort emoji for a service type label, so a chip like "Followers" or
 * "Likes" reads at a glance without the customer needing to parse text
 * first. Keyword match against the free-text `serviceType` values admins
 * set (see prisma/seed.ts) rather than an enum, since new types get added
 * without a schema change.
 */
const KEYWORD_EMOJI: [pattern: RegExp, emoji: string][] = [
  [/subscri/i, "🔔"],
  [/follow/i, "👥"],
  [/live/i, "🔴"],
  [/story|stories/i, "⚡"],
  [/like/i, "❤️"],
  [/view|watch/i, "👁️"],
  [/comment/i, "💬"],
  [/share|repost|retweet/i, "🔁"],
  [/save|bookmark/i, "🔖"],
  [/vote|poll/i, "🗳️"],
  [/member|group/i, "🧑‍🤝‍🧑"],
  [/rating|review/i, "⭐"],
];

export function getServiceTypeEmoji(serviceType: string): string {
  const match = KEYWORD_EMOJI.find(([pattern]) => pattern.test(serviceType));
  return match ? match[1] : "✨";
}
