export type AffiliateStat = {
  label: string;
  value: string;
  trend: string;
  icon: string;
  colorClass: string;
  bgClass: string;
  barClass: string;
  barWidth: string;
};

export const affiliateStats: AffiliateStat[] = [
  {
    label: "Total Clicks",
    value: "12,402",
    trend: "+12.5%",
    icon: "ads_click",
    colorClass: "text-primary",
    bgClass: "bg-primary/10",
    barClass: "bg-primary",
    barWidth: "65%",
  },
  {
    label: "New Signups",
    value: "843",
    trend: "+4.2%",
    icon: "person_add",
    colorClass: "text-tertiary",
    bgClass: "bg-tertiary/10",
    barClass: "bg-tertiary",
    barWidth: "42%",
  },
  {
    label: "Conversions",
    value: "216",
    trend: "+18.1%",
    icon: "shopping_cart_checkout",
    colorClass: "text-on-secondary-container",
    bgClass: "bg-secondary-container/20",
    barClass: "bg-secondary-container",
    barWidth: "78%",
  },
  {
    label: "Total Earned",
    value: "$14,290",
    trend: "+22.4%",
    icon: "monetization_on",
    colorClass: "text-on-tertiary-container",
    bgClass: "bg-tertiary-container",
    barClass: "bg-tertiary-container",
    barWidth: "90%",
  },
];

export const weeklySignups = [
  { day: "Mon", label: "Oct 14", value: 120, heightPercent: 40 },
  { day: "Tue", label: "Oct 15", value: 165, heightPercent: 55 },
  { day: "Wed", label: "Oct 16", value: 144, heightPercent: 48 },
  { day: "Thu", label: "Today", value: 240, heightPercent: 85, highlight: true },
  { day: "Fri", label: "Oct 18", value: 186, heightPercent: 62 },
  { day: "Sat", label: "Oct 19", value: 135, heightPercent: 45 },
  { day: "Sun", label: "Oct 20", value: 96, heightPercent: 32 },
];

export const topCountries = [
  { name: "United States", percent: 42, flagClass: "bg-blue-600" },
  { name: "Brazil", percent: 18, flagClass: "bg-green-600" },
  { name: "Turkey", percent: 15, flagClass: "bg-red-600" },
  { name: "India", percent: 12, flagClass: "bg-orange-600" },
  { name: "Others", percent: 13, flagClass: "bg-purple-600" },
];

export type LeaderboardEntry = {
  rank: number;
  name: string;
  amount: string;
  isCurrentUser?: boolean;
  isTop?: boolean;
};

export const leaderboard: LeaderboardEntry[] = [
  { rank: 1, name: "Meta_Grow", amount: "$8,420", isTop: true },
  { rank: 2, name: "SMM_Empire", amount: "$6,110" },
  { rank: 3, name: "Boost_Agency", amount: "$5,890" },
  { rank: 12, name: "You (Alex R.)", amount: "$4,822", isCurrentUser: true },
  { rank: 13, name: "Global_Reach", amount: "$4,610" },
];

export type ReferralStatus = "completed" | "pending";

export type ReferralEntry = {
  id: string;
  initials: string;
  clientName: string;
  clientId: string;
  date: string;
  amount: string;
  commission: string;
  status: ReferralStatus;
};

// Placeholder history until Fase 4 wires this up to the `AffiliateReferral` Prisma model.
export const referralHistory: ReferralEntry[] = [
  {
    id: "1",
    initials: "JD",
    clientName: "John_Doe_99",
    clientId: "#44921",
    date: "Oct 17, 2023",
    amount: "$250.00",
    commission: "$25.00",
    status: "completed",
  },
  {
    id: "2",
    initials: "SM",
    clientName: "SocialMaster",
    clientId: "#44895",
    date: "Oct 17, 2023",
    amount: "$1,200.00",
    commission: "$120.00",
    status: "pending",
  },
  {
    id: "3",
    initials: "VT",
    clientName: "Viral_Tech",
    clientId: "#44722",
    date: "Oct 16, 2023",
    amount: "$45.00",
    commission: "$4.50",
    status: "completed",
  },
  {
    id: "4",
    initials: "AB",
    clientName: "AgencyBoost",
    clientId: "#44611",
    date: "Oct 16, 2023",
    amount: "$3,400.00",
    commission: "$340.00",
    status: "completed",
  },
];
