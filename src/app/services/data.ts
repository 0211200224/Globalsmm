export type ServiceCategory = "Instagram" | "TikTok" | "YouTube" | "Other";

export type MockService = {
  id: string;
  name: string;
  description: string;
  category: ServiceCategory;
  icon: string;
  badge?: "Hot" | "Stable" | "Elite";
  pricePer1000: string;
  speed: string;
};

// Placeholder catalog until Fase 2 wires this up to the `Service` Prisma model.
export const mockServices: MockService[] = [
  {
    id: "1",
    name: "Instagram Real Followers - HQ",
    description:
      "High quality profiles with organic growth patterns. Minimum drop rate guaranteed with 30-day refill.",
    category: "Instagram",
    icon: "group",
    badge: "Hot",
    pricePer1000: "$1.20",
    speed: "Instant",
  },
  {
    id: "2",
    name: "TikTok Real Likes - Instant",
    description:
      "Boost your TikTok engagement instantly. High-quality accounts, zero drop history over 90 days.",
    category: "TikTok",
    icon: "favorite",
    badge: "Stable",
    pricePer1000: "$0.85",
    speed: "10m / 1k",
  },
  {
    id: "3",
    name: "YouTube High Retention Views",
    description:
      "4K Quality, safe for monetization. Average watch time: 5-8 minutes per session. Global traffic.",
    category: "YouTube",
    icon: "smart_display",
    badge: "Elite",
    pricePer1000: "$3.50",
    speed: "1k / day",
  },
  {
    id: "4",
    name: "Custom IG Comments - AI Generated",
    description:
      "Context-aware comments using advanced AI to match your post content perfectly.",
    category: "Instagram",
    icon: "chat",
    pricePer1000: "$5.20",
    speed: "Instant",
  },
  {
    id: "5",
    name: "TikTok Video Shares - Viral Pack",
    description:
      "Engineered to trigger the TikTok algorithm for explore page visibility. High velocity.",
    category: "TikTok",
    icon: "share",
    pricePer1000: "$0.45",
    speed: "Turbo",
  },
  {
    id: "6",
    name: "Premium Account Audit",
    description:
      "Professional PDF report detailing engagement health, audience metrics, and growth strategy.",
    category: "Other",
    icon: "monitoring",
    pricePer1000: "$25.00",
    speed: "24 Hours",
  },
];
