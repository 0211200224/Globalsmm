import { AdminShell } from "@/components/admin/AdminShell";
import { prisma } from "@/lib/prisma";
import { ServicesAdminView, type AdminServiceRow } from "./ServicesAdminView";
import type { EditableCategory } from "./CategoryManager";

export default async function AdminServicesPage() {
  const dbCategories = await prisma.serviceCategory.findMany({
    orderBy: { sortOrder: "asc" },
    include: { services: { orderBy: { name: "asc" } }, _count: { select: { services: true } } },
  });

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
    })),
  );

  return (
    <AdminShell>
      <ServicesAdminView services={services} categories={categories} />
    </AdminShell>
  );
}
