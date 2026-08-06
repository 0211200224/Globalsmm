export type PaymentMethod = {
  id: string;
  name: string;
  description: string;
  icon: string;
  iconColorClass: string;
  iconBgClass: string;
  enabled: boolean;
};

// Only Stripe ships in the MVP (see PLANO.md, decisions table). The others are
// kept visible — reserved layout space — so they can be enabled later without
// a redesign.
export const paymentMethods: PaymentMethod[] = [
  {
    id: "stripe",
    name: "Stripe (Card/Apple Pay)",
    description: "Fast & Secure",
    icon: "credit_card",
    iconColorClass: "text-indigo-500",
    iconBgClass: "bg-indigo-500/10",
    enabled: true,
  },
  {
    id: "crypto",
    name: "Crypto (BTC/ETH/USDT)",
    description: "Coming soon",
    icon: "currency_bitcoin",
    iconColorClass: "text-orange-500",
    iconBgClass: "bg-orange-500/10",
    enabled: false,
  },
  {
    id: "paypal",
    name: "PayPal",
    description: "Coming soon",
    icon: "payments",
    iconColorClass: "text-blue-500",
    iconBgClass: "bg-blue-500/10",
    enabled: false,
  },
  {
    id: "wire",
    name: "Wire Transfer",
    description: "Coming soon",
    icon: "account_balance",
    iconColorClass: "text-emerald-500",
    iconBgClass: "bg-emerald-500/10",
    enabled: false,
  },
];

export type TransactionStatus = "completed" | "processing" | "declined";

export type MockTransaction = {
  id: string;
  txId: string;
  date: string;
  method: string;
  icon: string;
  iconColorClass: string;
  amount: string;
  status: TransactionStatus;
};

// Placeholder history until Fase 3 wires this up to the `Transaction` Prisma model.
export const mockTransactions: MockTransaction[] = [
  {
    id: "1",
    txId: "#TX-942103",
    date: "Oct 24, 2023 14:22",
    method: "BTC Transfer",
    icon: "currency_bitcoin",
    iconColorClass: "text-orange-500",
    amount: "$500.00",
    status: "completed",
  },
  {
    id: "2",
    txId: "#TX-941098",
    date: "Oct 22, 2023 09:15",
    method: "Card (Stripe)",
    icon: "credit_card",
    iconColorClass: "text-indigo-500",
    amount: "$100.00",
    status: "completed",
  },
  {
    id: "3",
    txId: "#TX-939855",
    date: "Oct 20, 2023 21:40",
    method: "PayPal",
    icon: "payments",
    iconColorClass: "text-blue-500",
    amount: "$250.00",
    status: "processing",
  },
  {
    id: "4",
    txId: "#TX-938722",
    date: "Oct 18, 2023 12:05",
    method: "Card (Stripe)",
    icon: "credit_card",
    iconColorClass: "text-error",
    amount: "$50.00",
    status: "declined",
  },
];
