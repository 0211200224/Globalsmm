import "server-only";
import { ProviderRequestError, type OrderFulfillmentProvider } from "./types";

/**
 * Implements the JSON single-endpoint SMM reseller API shape (confirmed
 * against smm.africa/api-docs — POST application/json, one `action` field
 * per operation: services|add|status|refill|cancel|balance). Sends the key
 * both in the body (every documented example does this) and as a Bearer
 * header (what the docs' auth section names as "the" mechanism) since
 * sending both is harmless and covers either reading of an inconsistent doc.
 */
export class GenericSmmProvider implements OrderFulfillmentProvider {
  constructor(
    private readonly name: string,
    private readonly apiUrl: string,
    private readonly apiKey: string,
  ) {}

  private async call(params: Record<string, unknown>): Promise<Record<string, unknown>> {
    let response: Response;
    try {
      response = await fetch(this.apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({ key: this.apiKey, ...params }),
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

    const data = (await response.json()) as Record<string, unknown> | unknown[];
    const record = Array.isArray(data) ? { list: data } : data;
    if (typeof record.error === "string") {
      throw new ProviderRequestError(`${this.name} rejected the request: ${record.error}`, this.name);
    }
    return record;
  }

  async placeOrder(input: {
    externalServiceId: string;
    link: string;
    quantity: number;
    idempotencyKey?: string;
  }) {
    const data = await this.call({
      action: "add",
      service: input.externalServiceId,
      link: input.link,
      quantity: input.quantity,
      ...(input.idempotencyKey ? { idempotency_key: input.idempotencyKey } : {}),
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

  async listServices() {
    const data = await this.call({ action: "services" });
    const list = Array.isArray(data.list) ? data.list : [];
    return list
      .filter((row): row is Record<string, unknown> => typeof row === "object" && row !== null)
      .map((row) => ({
        id: String(row.service ?? ""),
        name: typeof row.name === "string" ? row.name : "Unnamed service",
        rate: Number(row.rate ?? 0),
        min: Number(row.min ?? 0),
        max: Number(row.max ?? 0),
        category: typeof row.category === "string" ? row.category : undefined,
      }))
      .filter((s) => s.id !== "");
  }
}
