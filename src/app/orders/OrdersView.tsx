"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { OrderRow } from "@/components/orders/OrderRow";
import { useTranslations } from "@/lib/i18n/I18nProvider";
import type { OrderRowData, OrderRowStatus } from "@/lib/types/orders";

type Stats = {
  total: number;
  active: number;
  completed: number;
  totalSpending: string;
};

export function OrdersView({
  orders,
  stats,
}: {
  orders: OrderRowData[];
  stats: Stats;
}) {
  const t = useTranslations().orders;
  const tabs: Array<{ label: string; statuses: OrderRowStatus[] | "all" }> = [
    { label: t.tabAll, statuses: "all" },
    { label: t.tabActive, statuses: ["PENDING", "PROCESSING", "IN_PROGRESS"] },
    { label: t.tabCompleted, statuses: ["COMPLETED"] },
    { label: t.tabPartial, statuses: ["PARTIAL"] },
    { label: t.tabCanceled, statuses: ["CANCELED", "REFUNDED"] },
  ];
  const [activeTab, setActiveTab] = useState(0);
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const statuses = tabs[activeTab].statuses;
    return orders.filter((order) => {
      const matchesTab = statuses === "all" || statuses.includes(order.status);
      const matchesQuery =
        order.orderCode.toLowerCase().includes(query.toLowerCase()) ||
        order.serviceName.toLowerCase().includes(query.toLowerCase());
      return matchesTab && matchesQuery;
    });
  }, [orders, activeTab, query]);

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
            {t.totalOrders}
          </p>
          <h3 className="text-headline-lg text-on-surface">{stats.total}</h3>
        </div>

        <div className="bg-surface-container-low border border-white/5 p-6 rounded-xl hover:border-secondary/20 transition-all group relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <span className="material-symbols-outlined text-6xl">sync</span>
          </div>
          <p className="text-label-sm text-on-surface-variant mb-1">{t.active}</p>
          <h3 className="text-headline-lg text-on-surface">{stats.active}</h3>
        </div>

        <div className="bg-surface-container-low border border-white/5 p-6 rounded-xl hover:border-secondary/20 transition-all group relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <span className="material-symbols-outlined text-6xl">
              done_all
            </span>
          </div>
          <p className="text-label-sm text-on-surface-variant mb-1">
            {t.completed}
          </p>
          <h3 className="text-headline-lg text-on-surface">{stats.completed}</h3>
        </div>

        <div className="bg-secondary-container border border-white/5 p-6 rounded-xl shadow-lg relative overflow-hidden">
          <p className="text-label-sm text-on-secondary-container mb-1 opacity-80">
            {t.totalSpending}
          </p>
          <h3 className="text-headline-lg text-on-secondary-container">
            {stats.totalSpending}
          </h3>
        </div>
      </section>

      {/* Order Management Interface */}
      <section className="bg-surface-container-low rounded-2xl border border-white/5 shadow-2xl overflow-hidden">
        <div className="flex items-center gap-8 px-6 border-b border-white/5 overflow-x-auto">
          {tabs.map((tab, index) => (
            <button
              key={tab.label}
              type="button"
              onClick={() => setActiveTab(index)}
              className={
                activeTab === index
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
              placeholder={t.searchPlaceholder}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
        </div>

        <div className="p-6 space-y-4">
          {filtered.length === 0 ? (
            <p className="text-center text-body-md text-on-surface-variant py-12">
              {orders.length === 0 ? t.noOrdersAtAll : t.noOrdersFilter}
            </p>
          ) : (
            filtered.map((order) => <OrderRow key={order.id} order={order} />)
          )}
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
          {t.newOrder}
        </span>
      </Link>
    </>
  );
}
