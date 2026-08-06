export type AdminPaymentStatus = "pending_review" | "approved" | "rejected";

export type AdminPayment = {
  id: string;
  txId: string;
  customerName: string;
  method: string;
  amount: string;
  status: AdminPaymentStatus;
  createdAt: string;
};

// Placeholder queue until Fase 5 wires this up to the `Transaction` Prisma
// model + Stripe webhook events that need manual review.
export const adminPayments: AdminPayment[] = [
  {
    id: "1",
    txId: "#TX-942210",
    customerName: "Sarah Chen",
    method: "Card (Stripe)",
    amount: "$1,200.00",
    status: "pending_review",
    createdAt: "Oct 25, 2023 08:12",
  },
  {
    id: "2",
    txId: "#TX-942198",
    customerName: "Markus Reiner",
    method: "Card (Stripe)",
    amount: "$300.00",
    status: "pending_review",
    createdAt: "Oct 25, 2023 07:40",
  },
  {
    id: "3",
    txId: "#TX-941980",
    customerName: "Alex Thompson",
    method: "Card (Stripe)",
    amount: "$500.00",
    status: "approved",
    createdAt: "Oct 24, 2023 14:22",
  },
  {
    id: "4",
    txId: "#TX-941802",
    customerName: "unknown_reseller99",
    method: "Card (Stripe)",
    amount: "$2,000.00",
    status: "rejected",
    createdAt: "Oct 23, 2023 19:05",
  },
];
