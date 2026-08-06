import type { OrderStatus } from "@/components/ui/StatusBadge";

export type AdminOrder = {
  id: string;
  orderId: string;
  customerName: string;
  service: string;
  amount: string;
  status: OrderStatus;
  createdAt: string;
};

// Placeholder queue until Fase 5 wires this up to the `Order` Prisma model.
export const adminOrders: AdminOrder[] = [
  {
    id: "1",
    orderId: "#GS-994821",
    customerName: "Alex Thompson",
    service: "YouTube High Retention Views",
    amount: "$124.50",
    status: "processing",
    createdAt: "Oct 24, 2023 14:22",
  },
  {
    id: "2",
    orderId: "#GS-994780",
    customerName: "Sarah Chen",
    service: "Instagram Real Active Followers",
    amount: "$85.00",
    status: "completed",
    createdAt: "Oct 24, 2023 09:15",
  },
  {
    id: "3",
    orderId: "#GS-994755",
    customerName: "Markus Reiner",
    service: "TikTok organic followers",
    amount: "$42.15",
    status: "pending",
    createdAt: "Oct 23, 2023 21:40",
  },
  {
    id: "4",
    orderId: "#GS-994612",
    customerName: "unknown_reseller99",
    service: "Threads Comments Custom",
    amount: "$15.00",
    status: "error",
    createdAt: "Oct 22, 2023 12:05",
  },
];
