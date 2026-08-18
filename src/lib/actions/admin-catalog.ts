"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { assertIsAdmin } from "@/lib/actions/admin-guard";

export type ServiceInput = {
  categoryId: string;
  serviceType: string;
  name: string;
  description?: string | null;
  icon: string;
  badge?: string | null;
  speedLabel: string;
  pricePer1000: number;
  minQuantity: number;
  maxQuantity: number;
  qualityScore?: number | null;
  retentionPercent?: number | null;
  refillDays: number;
  providerId?: string | null;
  externalServiceId?: string | null;
  costPer1000?: number | null;
};

function validateServiceInput(input: ServiceInput): string | null {
  if (!input.name.trim()) return "Name is required.";
  if (!input.serviceType.trim()) return "Service type is required.";
  if (!input.categoryId) return "Platform is required.";
  if (!Number.isFinite(input.pricePer1000) || input.pricePer1000 <= 0)
    return "Price per 1000 must be greater than zero.";
  if (!Number.isInteger(input.minQuantity) || input.minQuantity <= 0)
    return "Minimum quantity must be a positive whole number.";
  if (!Number.isInteger(input.maxQuantity) || input.maxQuantity < input.minQuantity)
    return "Maximum quantity must be greater than or equal to the minimum.";
  if (
    input.qualityScore != null &&
    (!Number.isFinite(input.qualityScore) || input.qualityScore < 0 || input.qualityScore > 10)
  )
    return "Quality score must be between 0 and 10.";
  if (
    input.retentionPercent != null &&
    (!Number.isInteger(input.retentionPercent) ||
      input.retentionPercent < 0 ||
      input.retentionPercent > 100)
  )
    return "Retention must be a whole number between 0 and 100.";
  if (!Number.isInteger(input.refillDays) || input.refillDays < 0)
    return "Refill days must be zero or a positive whole number.";
  return null;
}

export async function createService(input: ServiceInput) {
  await assertIsAdmin();

  const error = validateServiceInput(input);
  if (error) return { success: false as const, error };

  await prisma.service.create({
    data: {
      categoryId: input.categoryId,
      serviceType: input.serviceType.trim(),
      name: input.name.trim(),
      description: input.description?.trim() || null,
      icon: input.icon || "bolt",
      badge: input.badge || null,
      speedLabel: input.speedLabel || "Standard",
      pricePer1000: input.pricePer1000,
      minQuantity: input.minQuantity,
      maxQuantity: input.maxQuantity,
      qualityScore: input.qualityScore ?? null,
      retentionPercent: input.retentionPercent ?? null,
      refillDays: input.refillDays,
      providerId: input.providerId || null,
      externalServiceId: input.externalServiceId?.trim() || null,
      costPer1000: input.costPer1000 ?? null,
    },
  });

  revalidatePath("/admin/services");
  revalidatePath("/services");
  return { success: true as const };
}

export async function updateService(id: string, input: ServiceInput) {
  await assertIsAdmin();

  const error = validateServiceInput(input);
  if (error) return { success: false as const, error };

  await prisma.service.update({
    where: { id },
    data: {
      categoryId: input.categoryId,
      serviceType: input.serviceType.trim(),
      name: input.name.trim(),
      description: input.description?.trim() || null,
      icon: input.icon || "bolt",
      badge: input.badge || null,
      speedLabel: input.speedLabel || "Standard",
      pricePer1000: input.pricePer1000,
      minQuantity: input.minQuantity,
      maxQuantity: input.maxQuantity,
      qualityScore: input.qualityScore ?? null,
      retentionPercent: input.retentionPercent ?? null,
      refillDays: input.refillDays,
      providerId: input.providerId || null,
      externalServiceId: input.externalServiceId?.trim() || null,
      costPer1000: input.costPer1000 ?? null,
    },
  });

  revalidatePath("/admin/services");
  revalidatePath("/services");
  return { success: true as const };
}

export async function toggleServiceActive(id: string, active: boolean) {
  await assertIsAdmin();
  await prisma.service.update({ where: { id }, data: { active } });
  revalidatePath("/admin/services");
  revalidatePath("/services");
  return { success: true as const };
}

export async function deleteService(id: string) {
  await assertIsAdmin();

  const hasOrders = await prisma.order.findFirst({ where: { serviceId: id } });
  if (hasOrders) {
    // Preserve order history integrity — deactivate instead of deleting.
    await prisma.service.update({ where: { id }, data: { active: false } });
    revalidatePath("/admin/services");
    revalidatePath("/services");
    return {
      success: true as const,
      note: "This service has existing orders, so it was deactivated instead of deleted.",
    };
  }

  await prisma.service.delete({ where: { id } });
  revalidatePath("/admin/services");
  revalidatePath("/services");
  return { success: true as const };
}

export type CategoryInput = {
  name: string;
  icon: string;
  sortOrder: number;
};

export async function createCategory(input: CategoryInput) {
  await assertIsAdmin();
  if (!input.name.trim()) return { success: false as const, error: "Name is required." };

  await prisma.serviceCategory.create({
    data: {
      name: input.name.trim(),
      icon: input.icon || "apps",
      sortOrder: input.sortOrder,
    },
  });

  revalidatePath("/admin/services");
  revalidatePath("/services");
  return { success: true as const };
}

export async function updateCategory(id: string, input: CategoryInput) {
  await assertIsAdmin();
  if (!input.name.trim()) return { success: false as const, error: "Name is required." };

  await prisma.serviceCategory.update({
    where: { id },
    data: {
      name: input.name.trim(),
      icon: input.icon || "apps",
      sortOrder: input.sortOrder,
    },
  });

  revalidatePath("/admin/services");
  revalidatePath("/services");
  return { success: true as const };
}

export async function deleteCategory(id: string) {
  await assertIsAdmin();

  const serviceCount = await prisma.service.count({ where: { categoryId: id } });
  if (serviceCount > 0) {
    return {
      success: false as const,
      error: `Can't delete: ${serviceCount} service(s) still use this platform. Reassign or delete them first.`,
    };
  }

  await prisma.serviceCategory.delete({ where: { id } });
  revalidatePath("/admin/services");
  revalidatePath("/services");
  return { success: true as const };
}
