export type OrderRowStatus =
  | "PENDING"
  | "PENDING_ADMIN"
  | "PROCESSING"
  | "IN_PROGRESS"
  | "COMPLETED"
  | "PARTIAL"
  | "CANCELED"
  | "REFUNDED";

/**
 * Single source of truth for "still in flight" order statuses — used by the
 * customer dashboard stat card, the orders page stat card, and the orders
 * page "Active" tab, which previously each hand-maintained their own copy
 * of this list.
 */
export const ACTIVE_ORDER_STATUSES: OrderRowStatus[] = [
  "PENDING_ADMIN",
  "PENDING",
  "PROCESSING",
  "IN_PROGRESS",
];

export type OrderRowData = {
  id: string;
  orderCode: string;
  serviceName: string;
  serviceIcon: string;
  quantity: number;
  deliveredQuantity: number;
  status: OrderRowStatus;
  chargedAmount: string;
  createdAtLabel: string;
  canCancel?: boolean;
  canRefill?: boolean;
  refillDays?: number | null;
};
