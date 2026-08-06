"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { OrderRow } from "@/components/orders/OrderRow";
import { mockOrders, type OrderRowStatus } from "./data";

const tabs: Array<{ label: string; status: OrderRowStatus | "all" }> = [
  { label: "All Orders", status: "all" },
  { label: "Active", status: "pending" },
  { label: "Processing", status: "processing" },
  { label: "Completed", status: "completed" },
  { label: "Canceled", status: "error" },
];

export function OrdersView() {
  const [activeTab, setActiveTab] = useState<OrderRowStatus | "all">("all");
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    return mockOrders.filter((order) => {
      const matchesTab = activeTab === "all" || order.status === activeTab;
      const matchesQuery = order.orderId
        .toLowerCase()
        .includes(query.toLowerCase());
      return matchesTab && matchesQuery;
    });
  }, [activeTab, query]);

  return (
    <>
      {/* Statistics Banner */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-surface-container-low border border-white/5 p-6 rounded-xl hover:border-secondary/20 transition-all group relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <span className="material-symbols-outlined text-6xl">
              shopping_bag
            </span>
          </div>
          <p className="text-label-sm text-on-surface-variant mb-1">
            Total Orders
          </p>
          <h3 className="text-headline-lg text-on-surface">1,284</h3>
          <div className="flex items-center gap-1 mt-2 text-emerald-400 text-label-sm">
            <span className="material-symbols-outlined text-sm">
              trending_up
            </span>
            <span>+12% this month</span>
          </div>
        </div>

        <div className="bg-surface-container-low border border-white/5 p-6 rounded-xl hover:border-secondary/20 transition-all group relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <span className="material-symbols-outlined text-6xl">sync</span>
          </div>
          <p className="text-label-sm text-on-surface-variant mb-1">
            Processing
          </p>
          <h3 className="text-headline-lg text-on-surface">12</h3>
          <div className="flex items-center gap-1 mt-2 text-on-surface-variant text-label-sm">
            <span>Active right now</span>
          </div>
        </div>

        <div className="bg-surface-container-low border border-white/5 p-6 rounded-xl hover:border-secondary/20 transition-all group relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <span className="material-symbols-outlined text-6xl">
              done_all
            </span>
          </div>
          <p className="text-label-sm text-on-surface-variant mb-1">
            Completed
          </p>
          <h3 className="text-headline-lg text-on-surface">1,248</h3>
          <div className="flex items-center gap-1 mt-2 text-emerald-400 text-label-sm">
            <span>98.2% Success Rate</span>
          </div>
        </div>

        <div className="bg-secondary-container border border-white/5 p-6 rounded-xl shadow-lg relative overflow-hidden">
          <p className="text-label-sm text-on-secondary-container mb-1 opacity-80">
            Spending
          </p>
          <h3 className="text-headline-lg text-on-secondary-container">
            $4,290.45
          </h3>
          <button
            type="button"
            className="mt-4 px-4 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded-full text-label-sm transition-all border border-white/10"
          >
            View Statement
          </button>
        </div>
      </section>

      {/* Order Management Interface */}
      <section className="bg-surface-container-low rounded-2xl border border-white/5 shadow-2xl overflow-hidden">
        <div className="flex items-center gap-8 px-6 border-b border-white/5 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.label}
              type="button"
              onClick={() => setActiveTab(tab.status)}
              className={
                activeTab === tab.status
                  ? "py-5 text-label-md text-secondary border-b-2 border-secondary whitespace-nowrap"
                  : "py-5 text-label-md text-on-surface-variant hover:text-on-surface transition-colors whitespace-nowrap"
              }
            >
              {tab.label}
            </button>
          ))}
          <div className="ml-auto flex items-center bg-background/50 rounded-lg px-3 py-1.5 border border-white/5 my-2">
            <span className="material-symbols-outlined text-sm text-on-surface-variant mr-2">
              search
            </span>
            <input
              className="bg-transparent border-none focus:ring-0 text-body-sm text-on-surface placeholder:text-on-surface-variant/50 w-32 md:w-48"
              placeholder="Search Order ID..."
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
        </div>

        <div className="p-6 space-y-4">
          {filtered.length === 0 ? (
            <p className="text-center text-body-md text-on-surface-variant py-12">
              No orders match this filter.
            </p>
          ) : (
            filtered.map((order) => <OrderRow key={order.id} order={order} />)
          )}
        </div>

        <div className="p-6 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-label-sm text-on-surface-variant">
            Showing {filtered.length} of 1,284 orders
          </p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled
              className="w-10 h-10 flex items-center justify-center rounded-lg border border-white/5 bg-surface-container-high text-on-surface-variant disabled:opacity-30"
            >
              <span className="material-symbols-outlined">
                chevron_left
              </span>
            </button>
            <button
              type="button"
              className="w-10 h-10 flex items-center justify-center rounded-lg border border-secondary bg-secondary-container text-on-secondary-container font-bold text-label-md"
            >
              1
            </button>
            <button
              type="button"
              className="w-10 h-10 flex items-center justify-center rounded-lg border border-white/5 hover:bg-surface-container-high transition-colors text-on-surface-variant text-label-md"
            >
              2
            </button>
            <button
              type="button"
              className="w-10 h-10 flex items-center justify-center rounded-lg border border-white/5 hover:bg-surface-container-high transition-colors text-on-surface-variant text-label-md"
            >
              3
            </button>
            <span className="text-on-surface-variant px-2">...</span>
            <button
              type="button"
              className="w-10 h-10 flex items-center justify-center rounded-lg border border-white/5 hover:bg-surface-container-high transition-colors text-on-surface-variant"
            >
              <span className="material-symbols-outlined">
                chevron_right
              </span>
            </button>
          </div>
        </div>
      </section>

      <Link
        href="/services"
        className="fixed right-6 bottom-20 md:bottom-10 md:right-10 w-14 h-14 bg-secondary text-background rounded-full shadow-2xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all z-40 group"
      >
        <span className="material-symbols-outlined text-2xl font-bold">
          add
        </span>
        <span className="absolute right-full mr-4 bg-surface-container-high border border-white/10 text-on-surface px-3 py-1.5 rounded-lg text-label-sm whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity translate-x-2 group-hover:translate-x-0 pointer-events-none">
          New Order
        </span>
      </Link>
    </>
  );
}
