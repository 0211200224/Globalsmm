"use client";

import { useMemo, useState } from "react";
import { ServiceCard } from "@/components/services/ServiceCard";
import { OrderModal } from "@/components/services/OrderModal";
import type { CatalogCategory, CatalogService } from "@/lib/types/catalog";

export function ServicesView({
  categories,
  discountPercent,
}: {
  categories: CatalogCategory[];
  discountPercent: number;
}) {
  const [query, setQuery] = useState("");
  const [platform, setPlatform] = useState<string>("All");
  const [serviceType, setServiceType] = useState<string>("All");
  const [orderingService, setOrderingService] = useState<CatalogService | null>(null);

  const allServices = useMemo(
    () => categories.flatMap((c) => c.services),
    [categories],
  );

  const typesForPlatform = useMemo(() => {
    const source =
      platform === "All"
        ? allServices
        : (categories.find((c) => c.name === platform)?.services ?? []);
    return Array.from(new Set(source.map((s) => s.serviceType)));
  }, [categories, allServices, platform]);

  const results = useMemo(() => {
    return allServices.filter((service) => {
      const matchesPlatform =
        platform === "All" || service.categoryName === platform;
      const matchesType =
        serviceType === "All" || service.serviceType === serviceType;
      const q = query.toLowerCase();
      const matchesQuery =
        service.name.toLowerCase().includes(q) ||
        service.serviceType.toLowerCase().includes(q) ||
        service.categoryName.toLowerCase().includes(q);
      return matchesPlatform && matchesType && matchesQuery;
    });
  }, [allServices, platform, serviceType, query]);

  return (
    <>
      <section>
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-gutter mb-stack-md">
          <div className="flex-1 max-w-2xl">
            <h1 className="text-headline-lg mb-stack-sm">Marketplace</h1>
            <p className="text-body-md text-on-surface-variant mb-stack-lg">
              {allServices.length}+ services across {categories.length}{" "}
              platforms with enterprise-grade reliability.
            </p>
            <div className="relative group">
              <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline group-focus-within:text-secondary">
                search
              </span>
              <input
                className="w-full bg-surface-container-low border border-outline-variant rounded-xl py-4 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-secondary/50 focus:border-secondary transition-all text-on-surface"
                placeholder="Search services (e.g. Instagram Followers)..."
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Platform picker */}
        <div className="flex gap-2 overflow-x-auto pb-2 mb-stack-sm">
          <button
            type="button"
            onClick={() => {
              setPlatform("All");
              setServiceType("All");
            }}
            className={
              platform === "All"
                ? "px-6 py-2.5 rounded-full bg-secondary-container text-on-secondary-container text-label-md whitespace-nowrap transition-all active:scale-95 flex items-center gap-2"
                : "px-6 py-2.5 rounded-full border border-outline-variant hover:border-secondary text-on-surface-variant hover:text-on-surface text-label-md whitespace-nowrap transition-all flex items-center gap-2"
            }
          >
            <span className="material-symbols-outlined text-[18px]">apps</span>
            All Platforms
          </button>
          {categories.map((category) => (
            <button
              key={category.name}
              type="button"
              onClick={() => {
                setPlatform(category.name);
                setServiceType("All");
              }}
              className={
                platform === category.name
                  ? "px-6 py-2.5 rounded-full bg-secondary-container text-on-secondary-container text-label-md whitespace-nowrap transition-all active:scale-95 flex items-center gap-2"
                  : "px-6 py-2.5 rounded-full border border-outline-variant hover:border-secondary text-on-surface-variant hover:text-on-surface text-label-md whitespace-nowrap transition-all flex items-center gap-2"
              }
            >
              <span className="material-symbols-outlined text-[18px]">
                {category.icon}
              </span>
              {category.name}
            </button>
          ))}
        </div>

        {/* Type picker (depends on selected platform) */}
        {typesForPlatform.length > 0 && (
          <div className="flex gap-2 overflow-x-auto pb-2 mb-stack-lg">
            <button
              type="button"
              onClick={() => setServiceType("All")}
              className={
                serviceType === "All"
                  ? "px-4 py-1.5 rounded-full bg-primary/20 text-primary text-label-sm whitespace-nowrap transition-all border border-primary/30"
                  : "px-4 py-1.5 rounded-full border border-outline-variant/50 text-on-surface-variant hover:text-on-surface text-label-sm whitespace-nowrap transition-all"
              }
            >
              All Types
            </button>
            {typesForPlatform.map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => setServiceType(type)}
                className={
                  serviceType === type
                    ? "px-4 py-1.5 rounded-full bg-primary/20 text-primary text-label-sm whitespace-nowrap transition-all border border-primary/30"
                    : "px-4 py-1.5 rounded-full border border-outline-variant/50 text-on-surface-variant hover:text-on-surface text-label-sm whitespace-nowrap transition-all"
                }
              >
                {type}
              </button>
            ))}
          </div>
        )}
      </section>

      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-gutter">
        {results.length === 0 ? (
          <p className="col-span-full text-center text-body-md text-on-surface-variant py-12">
            No services match your search.
          </p>
        ) : (
          results.map((service) => (
            <ServiceCard
              key={service.id}
              service={service}
              onOrder={setOrderingService}
            />
          ))
        )}
      </section>

      {orderingService && (
        <OrderModal
          service={orderingService}
          discountPercent={discountPercent}
          onClose={() => setOrderingService(null)}
        />
      )}
    </>
  );
}
