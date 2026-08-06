export type AdminService = {
  id: string;
  name: string;
  category: string;
  pricePer1000: string;
  minQuantity: number;
  maxQuantity: number;
  active: boolean;
};

// Placeholder catalog until Fase 5 wires this up to the `Service` Prisma model.
export const adminServices: AdminService[] = [
  {
    id: "1",
    name: "Instagram Real Followers - HQ",
    category: "Instagram",
    pricePer1000: "$1.20",
    minQuantity: 100,
    maxQuantity: 50000,
    active: true,
  },
  {
    id: "2",
    name: "TikTok Real Likes - Instant",
    category: "TikTok",
    pricePer1000: "$0.85",
    minQuantity: 50,
    maxQuantity: 20000,
    active: true,
  },
  {
    id: "3",
    name: "YouTube High Retention Views",
    category: "YouTube",
    pricePer1000: "$3.50",
    minQuantity: 500,
    maxQuantity: 100000,
    active: true,
  },
  {
    id: "4",
    name: "Custom IG Comments - AI Generated",
    category: "Instagram",
    pricePer1000: "$5.20",
    minQuantity: 10,
    maxQuantity: 1000,
    active: false,
  },
];
