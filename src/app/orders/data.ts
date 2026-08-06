export type OrderRowStatus = "pending" | "processing" | "completed" | "error";

export type MockOrder = {
  id: string;
  orderId: string;
  service: string;
  icon: string;
  quantity: number;
  status: OrderRowStatus;
  progressPercent: number;
  progressLabel: string;
  progressValueLabel: string;
};

// Placeholder order queue until Fase 3 wires this up to the `Order` Prisma model.
export const mockOrders: MockOrder[] = [
  {
    id: "1",
    orderId: "#GS-994821",
    service: "YouTube High Retention Views",
    icon: "play_circle",
    quantity: 1000,
    status: "processing",
    progressPercent: 64.2,
    progressLabel: "Progress (Drip-Feed)",
    progressValueLabel: "642 / 1,000",
  },
  {
    id: "2",
    orderId: "#GS-994780",
    service: "Instagram Real Active Likes",
    icon: "favorite",
    quantity: 5000,
    status: "completed",
    progressPercent: 100,
    progressLabel: "Delivery Status",
    progressValueLabel: "100% Complete",
  },
  {
    id: "3",
    orderId: "#GS-994755",
    service: "TikTok organic followers",
    icon: "person_add",
    quantity: 250,
    status: "pending",
    progressPercent: 5,
    progressLabel: "Status",
    progressValueLabel: "Starting soon...",
  },
  {
    id: "4",
    orderId: "#GS-994612",
    service: "Threads Comments Custom",
    icon: "alternate_email",
    quantity: 100,
    status: "error",
    progressPercent: 50,
    progressLabel: "Issue Detected",
    progressValueLabel: "Partial Refunded",
  },
];
