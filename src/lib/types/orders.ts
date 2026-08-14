export type OrderRowStatus =
  | "PENDING"
  | "PROCESSING"
  | "IN_PROGRESS"
  | "COMPLETED"
  | "PARTIAL"
  | "CANCELED"
  | "REFUNDED";

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
