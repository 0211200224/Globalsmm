import { AdminShell } from "@/components/admin/AdminShell";
import { prisma } from "@/lib/prisma";
import { ServicesAdminView, type AdminServiceRow } from "./ServicesAdminView";
import type { EditableCategory } from "./CategoryManager";

export default async function AdminServicesPage() {
  const [dbCategories, dbProviders] = await Promise.all([
    prisma.serviceCategory.findMany({
      orderBy: { sortOrder: "asc" },
      include: { services: { orderBy: { name: "asc" } }, _count: { select: { services: true } } },
    }),
    prisma.provider.findMany({ where: { active: true }, orderBy: { name: "asc" } }),
  ]);

  const categories: EditableCategory[] = dbCategories.map((c) => ({
    id: c.id,
    name: c.name,
    icon: c.icon ?? "apps",
    sortOrder: c.sortOrder,
    serviceCount: c._count.services,
  }));

  const services: AdminServiceRow[] = dbCategories.flatMap((category) =>
    category.services.map((service) => ({
      id: service.id,
      categoryId: service.categoryId,
      categoryName: category.name,
      serviceType: service.serviceType,
      name: service.name,
      description: service.description,
      icon: service.icon,
      badge: service.badge,
      speedLabel: service.speedLabel,
      pricePer1000: service.pricePer1000.toNumber(),
      minQuantity: service.minQuantity,
      maxQuantity: service.maxQuantity,
      qualityScore: service.qualityScore?.toNumber() ?? null,
      retentionPercent: service.retentionPercent,
      refillDays: service.refillDays,
      active: service.active,
      providerId: service.providerId,
      externalServiceId: service.externalServiceId,
      costPer1000: service.costPer1000?.toNumber() ?? null,
    })),
  );

  const providers = dbProviders.map((p) => ({ id: p.id, name: p.name }));

  return (
    <AdminShell>
      <ServicesAdminView services={services} categories={categories} providers={providers} />
    </AdminShell>
  );
}
