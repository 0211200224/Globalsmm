import { AppShell } from "@/components/layout/AppShell";
import { prisma } from "@/lib/prisma";
import { getCurrency } from "@/lib/currency/get-currency";
import { getRates } from "@/lib/currency/get-rates";
import { formatMoney } from "@/lib/currency/format-money";
import { getCurrentUser } from "@/lib/actions/current-user";
import { getEffectiveDiscountPercent } from "@/lib/vip";
import type { CatalogCategory } from "@/lib/types/catalog";
import { ServicesView } from "./ServicesView";

export default async function ServicesPage() {
  const user = await getCurrentUser();
  const currency = await getCurrency();
  const rates = await getRates();

  const [dbCategories, spendAgg] = await Promise.all([
    prisma.serviceCategory.findMany({
      orderBy: { sortOrder: "asc" },
      include: {
        services: {
          where: { active: true },
          orderBy: { name: "asc" },
        },
      },
    }),
    user
      ? prisma.order.aggregate({
          where: { userId: user.id, status: { notIn: ["CANCELED", "REFUNDED"] } },
          _sum: { chargedAmount: true },
        })
      : Promise.resolve({ _sum: { chargedAmount: null } }),
  ]);

  const discountPercent = user
    ? getEffectiveDiscountPercent(spendAgg._sum.chargedAmount?.toNumber() ?? 0, user.isReseller)
    : 0;

  const categories: CatalogCategory[] = dbCategories.map((category) => ({
    name: category.name,
    icon: category.icon ?? "apps",
    services: category.services.map((service) => ({
      id: service.id,
      name: service.name,
      description: service.description,
      icon: service.icon,
      badge: service.badge,
      speedLabel: service.speedLabel,
      serviceType: service.serviceType,
      pricePer1000: formatMoney(service.pricePer1000.toNumber(), currency, rates),
      pricePer1000Raw: service.pricePer1000.toNumber(),
      minQuantity: service.minQuantity,
      maxQuantity: service.maxQuantity,
      categoryName: category.name,
      qualityScore: service.qualityScore?.toNumber() ?? null,
      retentionPercent: service.retentionPercent,
      refillDays: service.refillDays,
    })),
  }));

  return (
    <AppShell>
      <ServicesView categories={categories} discountPercent={discountPercent} />
    </AppShell>
  );
}
