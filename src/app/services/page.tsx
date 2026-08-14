import { AppShell } from "@/components/layout/AppShell";
import { prisma } from "@/lib/prisma";
import { formatUSD } from "@/lib/format";
import type { CatalogCategory } from "@/lib/types/catalog";
import { ServicesView } from "./ServicesView";

export default async function ServicesPage() {
  const dbCategories = await prisma.serviceCategory.findMany({
    orderBy: { sortOrder: "asc" },
    include: {
      services: {
        where: { active: true },
        orderBy: { name: "asc" },
      },
    },
  });

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
      pricePer1000: formatUSD(service.pricePer1000.toNumber()),
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
      <ServicesView categories={categories} />
    </AppShell>
  );
}
