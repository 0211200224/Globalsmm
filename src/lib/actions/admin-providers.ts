"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { assertIsAdmin } from "@/lib/actions/admin-guard";
import { getProviderClient } from "@/lib/fulfillment/get-provider-client";

/** List view — never selects apiKey, it has no business reaching the client except on the edit form. */
export async function listProviders() {
  await assertIsAdmin();
  return prisma.provider.findMany({
    orderBy: { name: "asc" },
    select: {
      id: true,
      name: true,
      apiUrl: true,
      balance: true,
      active: true,
      createdAt: true,
      _count: { select: { services: true, orders: true } },
    },
  });
}

export type ProviderInput = {
  name: string;
  apiUrl: string;
  apiKey: string;
};

function validateProviderInput(input: ProviderInput): string | null {
  if (!input.name.trim()) return "Name is required.";
  if (!input.apiUrl.trim()) return "API URL is required.";
  try {
    new URL(input.apiUrl);
  } catch {
    return "API URL must be a valid URL.";
  }
  if (!input.apiKey.trim()) return "API key is required.";
  return null;
}

export async function createProvider(input: ProviderInput) {
  await assertIsAdmin();
  const error = validateProviderInput(input);
  if (error) return { success: false as const, error };

  await prisma.provider.create({
    data: { name: input.name.trim(), apiUrl: input.apiUrl.trim(), apiKey: input.apiKey.trim() },
  });

  revalidatePath("/admin/providers");
  return { success: true as const };
}

/** Blank apiKey in the form means "keep the existing one" — never store an empty key. */
export async function updateProvider(id: string, input: ProviderInput) {
  await assertIsAdmin();
  const error = validateProviderInput({ ...input, apiKey: input.apiKey || "placeholder" });
  if (error) return { success: false as const, error };

  await prisma.provider.update({
    where: { id },
    data: {
      name: input.name.trim(),
      apiUrl: input.apiUrl.trim(),
      ...(input.apiKey.trim() ? { apiKey: input.apiKey.trim() } : {}),
    },
  });

  revalidatePath("/admin/providers");
  return { success: true as const };
}

export async function toggleProviderActive(id: string, active: boolean) {
  await assertIsAdmin();
  await prisma.provider.update({ where: { id }, data: { active } });
  revalidatePath("/admin/providers");
  return { success: true as const };
}

/**
 * Pulls the provider's real balance via its own API and caches it —
 * "recharging" the provider itself happens on the provider's own site
 * (outside this app); this only reflects that top-up here once it's done.
 */
export async function syncProviderBalance(id: string) {
  await assertIsAdmin();
  const provider = await prisma.provider.findUnique({ where: { id } });
  if (!provider) return { success: false as const, error: "Provider not found." };

  try {
    const balance = await getProviderClient(provider).getBalance();
    await prisma.provider.update({ where: { id }, data: { balance } });
    revalidatePath("/admin/providers");
    return { success: true as const, balance };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return { success: false as const, error: `Could not fetch balance: ${message}` };
  }
}

/**
 * Fetches the provider's live catalog on demand (not cached/stored) — lets
 * the admin find the right externalServiceId for a Service instead of
 * copying it by hand from the provider's own dashboard.
 */
export async function listProviderCatalog(id: string) {
  await assertIsAdmin();
  const provider = await prisma.provider.findUnique({ where: { id } });
  if (!provider) return { success: false as const, error: "Provider not found." };

  try {
    const services = await getProviderClient(provider).listServices();
    return { success: true as const, services };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return { success: false as const, error: `Could not fetch catalog: ${message}` };
  }
}
