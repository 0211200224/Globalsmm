import { AdminShell } from "@/components/admin/AdminShell";
import { StatCard } from "@/components/ui/StatCard";
import { Pill } from "@/components/ui/Pill";

const attentionQueue = [
  {
    id: "1",
    label: "3 pagamentos aguardando aprovação manual",
    href: "/admin/payments",
    icon: "pending_actions",
  },
  {
    id: "2",
    label: "1 pedido com erro precisa de reembolso",
    href: "/admin/orders",
    icon: "report",
  },
  {
    id: "3",
    label: "2 serviços com preço desatualizado do fornecedor",
    href: "/admin/services",
    icon: "sell",
  },
];

export default function AdminOverviewPage() {
  return (
    <AdminShell>
      <div>
        <h2 className="text-headline-lg text-on-surface">
          Painel Administrativo
        </h2>
        <p className="text-body-md text-on-surface-variant mt-1">
          Visão geral da operação. Dados abaixo são placeholders — Fase 5
          ainda não está conectada ao banco real.
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-gutter">
        <StatCard label="Total de Usuários" value="3,842" icon="group" accent="primary" />
        <StatCard label="Receita (mês)" value="$48,210" icon="payments" accent="secondary" />
        <StatCard label="Pedidos Ativos" value="27" icon="shopping_cart" accent="tertiary" />
        <StatCard label="Aprovações Pendentes" value="3" icon="pending_actions" accent="primary" />
      </div>

      <div className="glass-panel rounded-xl p-stack-lg">
        <h3 className="text-headline-md text-on-surface mb-stack-md">
          Requer atenção
        </h3>
        <div className="space-y-3">
          {attentionQueue.map((item) => (
            <a
              key={item.id}
              href={item.href}
              className="flex items-center justify-between p-4 rounded-lg border border-outline-variant/20 hover:border-tertiary/40 hover:bg-surface-container-high transition-all"
            >
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-tertiary">
                  {item.icon}
                </span>
                <span className="text-body-sm text-on-surface">
                  {item.label}
                </span>
              </div>
              <Pill tone="warning">Revisar</Pill>
            </a>
          ))}
        </div>
      </div>
    </AdminShell>
  );
}
