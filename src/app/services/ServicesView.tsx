"use client";

import { useMemo, useState } from "react";
import { ServiceCard } from "@/components/services/ServiceCard";
import { mockServices, type ServiceCategory } from "./data";

const filters: Array<ServiceCategory | "All"> = [
  "All",
  "Instagram",
  "TikTok",
  "YouTube",
];

export function ServicesView() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<(typeof filters)[number]>("All");

  const results = useMemo(() => {
    return mockServices.filter((service) => {
      const matchesCategory =
        category === "All" || service.category === category;
      const matchesQuery = service.name
        .toLowerCase()
        .includes(query.toLowerCase());
      return matchesCategory && matchesQuery;
    });
  }, [query, category]);

  return (
    <>
      <section>
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-gutter mb-stack-lg">
          <div className="flex-1 max-w-2xl">
            <h1 className="text-headline-lg mb-stack-sm">Marketplace</h1>
            <p className="text-body-md text-on-surface-variant mb-stack-lg">
              Browse high-performance SMM services with enterprise-grade
              reliability.
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
          <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0">
            {filters.map((filter) => (
              <button
                key={filter}
                type="button"
                onClick={() => setCategory(filter)}
                className={
                  category === filter
                    ? "px-6 py-2.5 rounded-full bg-secondary-container text-on-secondary-container text-label-md whitespace-nowrap transition-all active:scale-95"
                    : "px-6 py-2.5 rounded-full border border-outline-variant hover:border-secondary text-on-surface-variant hover:text-on-surface text-label-md whitespace-nowrap transition-all"
                }
              >
                {filter === "All" ? "All Services" : filter}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-gutter">
        {results.length === 0 ? (
          <p className="col-span-full text-center text-body-md text-on-surface-variant py-12">
            No services match your search.
          </p>
        ) : (
          results.map((service) => (
            <ServiceCard key={service.id} service={service} />
          ))
        )}
      </section>
    </>
  );
}
