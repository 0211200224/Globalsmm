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

export type WalletTransactionRow = {
  id: string;
  txId: string;
  date: string;
  method: string;
  icon: string;
  iconColorClass: string;
  amount: string;
  status: TransactionStatus;
};
