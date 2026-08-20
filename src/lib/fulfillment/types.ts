/**
 * Abstraction over an upstream SMM fulfillment provider — named and
 * scoped in PLANO.md section 5 well before any implementation existed.
 * Isolating "talk to the provider" behind this interface means swapping
 * fulfillment strategies (or adding a second provider) later never
 * requires touching the order-placement/approval flow itself.
 *
 * Semi-automatic for now (see admin approval queue): nothing here is ever
 * called on order creation, only when an admin approves an order in
 * src/lib/actions/admin-orders.ts.
 */
export interface OrderFulfillmentProvider {
  placeOrder(input: {
    externalServiceId: string;
    link: string;
    quantity: number;
    /**
     * Stable per-order key (pass the internal Order.id) so a retried
     * request after a timeout never double-places the same order —
     * providers that support this de-dupe on it server-side.
     */
    idempotencyKey?: string;
  }): Promise<{ externalOrderId: string }>;

  getStatus(externalOrderId: string): Promise<{ status: string; remains?: number }>;

  requestRefill(externalOrderId: string): Promise<void>;

  requestCancel(externalOrderId: string): Promise<void>;

  /** Returns the provider's current account balance, in USD. */
  getBalance(): Promise<number>;

  /** The provider's full catalog — lets the admin look up a service's externalServiceId instead of guessing it. */
  listServices(): Promise<
    Array<{ id: string; name: string; rate: number; min: number; max: number; category?: string }>
  >;
}

/** Thrown when the provider's API rejects or fails a call — callers decide the fallout (e.g. refund). */
export class ProviderRequestError extends Error {
  constructor(
    message: string,
    public readonly providerName: string,
  ) {
    super(message);
    this.name = "ProviderRequestError";
  }
}
