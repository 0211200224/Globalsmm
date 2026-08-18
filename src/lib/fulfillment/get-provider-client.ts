import "server-only";
import type { Provider } from "@/generated/prisma/client";
import type { OrderFulfillmentProvider } from "./types";
import { GenericSmmProvider } from "./generic-smm-provider";

/**
 * Every Provider row uses the same generic API shape today (see
 * generic-smm-provider.ts). If a provider ever needs vendor-specific
 * quirks, branch on a future `Provider.kind` field here instead of
 * changing any calling code — that's the whole point of the
 * OrderFulfillmentProvider abstraction.
 */
export function getProviderClient(provider: Provider): OrderFulfillmentProvider {
  return new GenericSmmProvider(provider.name, provider.apiUrl, provider.apiKey);
}
