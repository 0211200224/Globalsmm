import "server-only";
import { ProviderRequestError, type OrderFulfillmentProvider } from "./types";

/**
 * Implements the de-facto standard SMM panel reseller API (sometimes
 * called "Perfect Panel API v2" — see PLANO.md section 6): a single
 * endpoint, POST, form-encoded, differentiated by an `action` field.
 * Covers most upstream providers without needing a class per vendor.
 */
export class GenericSmmProvider implements OrderFulfillmentProvider {
  constructor(
    private readonly name: string,
    private readonly apiUrl: string,
    private readonly apiKey: string,
  ) {}

  private async call(params: Record<string, string | number>): Promise<Record<string, unknown>> {
    const body = new URLSearchParams({ key: this.apiKey, ...toStringParams(params) });

    let response: Response;
    try {
      response = await fetch(this.apiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body,
      });
    } catch (err) {
      throw new ProviderRequestError(
        `Could not reach ${this.name}: ${err instanceof Error ? err.message : String(err)}`,
        this.name,
      );
    }

    if (!response.ok) {
      throw new ProviderRequestError(`${this.name} returned HTTP ${response.status}`, this.name);
    }

    const data = (await response.json()) as Record<string, unknown>;
    if (typeof data.error === "string") {
      throw new ProviderRequestError(`${this.name} rejected the request: ${data.error}`, this.name);
    }
    return data;
  }

  async placeOrder(input: { externalServiceId: string; link: string; quantity: number }) {
    const data = await this.call({
      action: "add",
      service: input.externalServiceId,
      link: input.link,
      quantity: input.quantity,
    });
    const externalOrderId = data.order != null ? String(data.order) : null;
    if (!externalOrderId) {
      throw new ProviderRequestError(`${this.name} did not return an order id`, this.name);
    }
    return { externalOrderId };
  }

  async getStatus(externalOrderId: string) {
    const data = await this.call({ action: "status", order: externalOrderId });
    return {
      status: typeof data.status === "string" ? data.status : "Unknown",
      remains: typeof data.remains === "number" ? data.remains : undefined,
    };
  }

  async requestRefill(externalOrderId: string) {
    await this.call({ action: "refill", order: externalOrderId });
  }

  async requestCancel(externalOrderId: string) {
    await this.call({ action: "cancel", order: externalOrderId });
  }

  async getBalance() {
    const data = await this.call({ action: "balance" });
    const balance = Number(data.balance);
    if (!Number.isFinite(balance)) {
      throw new ProviderRequestError(`${this.name} returned a non-numeric balance`, this.name);
    }
    return balance;
  }
}

function toStringParams(params: Record<string, string | number>): Record<string, string> {
  return Object.fromEntries(Object.entries(params).map(([k, v]) => [k, String(v)]));
}
